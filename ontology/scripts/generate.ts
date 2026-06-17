#!/usr/bin/env tsx
/**
 * PCOMJR TypeScript Code Generator
 * 
 * Reads schema/pcomjr.schema.json and emits:
 *   - ontology/src/generated/types.ts — All interfaces, type aliases, enums
 *   - ontology/src/generated/guards.ts — Type guard functions
 *
 * Run: cd pcomjr-spec && npx tsx ontology/scripts/generate.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

// ─── Schema Loading ─────────────────────────────────────────────────────────

const SCHEMA_PATH = resolve(import.meta.dirname, '../../schema/pcomjr.schema.json');
const OUT_DIR = resolve(import.meta.dirname, '../src/generated');

interface SchemaDef {
  type?: string;
  enum?: string[];
  const?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, any>;
  items?: any;
  allOf?: any[];
  oneOf?: any[];
  $ref?: string;
  additionalProperties?: any;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  minItems?: number;
  pattern?: string;
  default?: any;
}

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
const defs: Record<string, SchemaDef> = schema.$defs;

// ─── Classification ─────────────────────────────────────────────────────────

// Types that are string enums
const ENUM_TYPES = new Set<string>();
// Types that are union refs (oneOf with $ref entries)
const UNION_TYPES = new Set<string>();
// Types that are object interfaces
const INTERFACE_TYPES = new Set<string>();
// Types that extend Artifact (have allOf with $ref to Artifact)
const ARTIFACT_SUBTYPES = new Set<string>();

for (const [name, def] of Object.entries(defs)) {
  if (def.type === 'string' && def.enum) {
    ENUM_TYPES.add(name);
  } else if (def.oneOf && def.oneOf.every((o: any) => o.$ref)) {
    UNION_TYPES.add(name);
  } else if (def.type === 'object' || def.allOf) {
    INTERFACE_TYPES.add(name);
    if (def.allOf?.some((a: any) => a.$ref === '#/$defs/Artifact')) {
      ARTIFACT_SUBTYPES.add(name);
    }
  }
}

// ─── Type Resolution ────────────────────────────────────────────────────────

function resolveRef(ref: string): string {
  return ref.replace('#/$defs/', '');
}

function schemaToTS(prop: any, optional: boolean = false): string {
  if (prop.$ref) {
    return resolveRef(prop.$ref);
  }

  if (prop.const) {
    return JSON.stringify(prop.const);
  }

  if (prop.oneOf) {
    return prop.oneOf.map((o: any) => schemaToTS(o)).join(' | ');
  }

  if (prop.type === 'string') {
    if (prop.enum) {
      return prop.enum.map((v: string) => JSON.stringify(v)).join(' | ');
    }
    return 'string';
  }

  if (prop.type === 'number' || prop.type === 'integer') {
    return 'number';
  }

  if (prop.type === 'boolean') {
    return 'boolean';
  }

  if (prop.type === 'array') {
    if (prop.items) {
      const itemType = schemaToTS(prop.items);
      // If items is a union type (contains |), wrap in parens before []
      const needsParens = itemType.includes(' | ');
      return needsParens ? `(${itemType})[]` : `${itemType}[]`;
    }
    return 'unknown[]';
  }

  if (prop.type === 'object') {
    if (prop.properties && Object.keys(prop.properties).length > 0) {
      // Inline object with known properties
      const fields = Object.entries(prop.properties).map(([k, v]: [string, any]) => {
        const req = prop.required?.includes(k) ?? false;
        return `${k}${req ? '' : '?'}: ${schemaToTS(v as any)}`;
      });
      return `{ ${fields.join('; ')} }`;
    }
    if (prop.additionalProperties === true || (prop.additionalProperties && typeof prop.additionalProperties === 'object')) {
      const valueType = typeof prop.additionalProperties === 'object' && prop.additionalProperties.type
        ? schemaToTS(prop.additionalProperties)
        : 'unknown';
      return `Record<string, ${valueType}>`;
    }
    return 'any';
  }

  return 'unknown';
}

// ─── Code Generation ────────────────────────────────────────────────────────

function generateTypes(): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * PCOMJR Data Ontology — Generated TypeScript Types');
  lines.push(' * ');
  lines.push(' * AUTO-GENERATED from schema/pcomjr.schema.json');
  lines.push(' * DO NOT EDIT MANUALLY — run `npm run generate` to regenerate.');
  lines.push(` * Generated: ${new Date().toISOString()}`);
  lines.push(' */');
  lines.push('');

  // ── Enum types as string literal unions ──
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('// String Literal Types (Enums)');
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('');

  for (const name of sorted(ENUM_TYPES)) {
    const def = defs[name];
    if (def.description) lines.push(`/** ${def.description} */`);
    const values = def.enum!.map(v => JSON.stringify(v)).join(' | ');
    lines.push(`export type ${name} = ${values};`);
    lines.push('');

    // Also export the values as a const array for runtime use
    const constName = toScreamingSnake(name);
    lines.push(`export const ${constName} = [${def.enum!.map(v => JSON.stringify(v)).join(', ')}] as const;`);
    lines.push('');
  }

  // ── Union types ──
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('// Union Types');
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('');

  for (const name of sorted(UNION_TYPES)) {
    const def = defs[name];
    if (def.description) lines.push(`/** ${def.description} */`);
    const members = def.oneOf!.map((o: any) => resolveRef(o.$ref)).join(' | ');
    lines.push(`export type ${name} = ${members};`);
    lines.push('');
  }

  // ── Simple object interfaces (no allOf) ──
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('// Interfaces');
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('');

  // Emit non-artifact interfaces first
  const simpleInterfaces = sorted(INTERFACE_TYPES).filter(n => !ARTIFACT_SUBTYPES.has(n) && n !== 'Decision');
  for (const name of simpleInterfaces) {
    const def = defs[name];
    emitInterface(lines, name, def);
  }

  // ── Artifact subtypes ──
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('// CIAS Artifact Subtypes');
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('');

  for (const name of sorted(ARTIFACT_SUBTYPES)) {
    if (name === 'Decision') continue; // Decision gets its own section below
    const def = defs[name];
    emitArtifactSubtype(lines, name, def);
  }

  // ── Decision (special case — allOf with extra required) ──
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('// Decision (extends Artifact)');
  lines.push('// ═══════════════════════════════════════════════════════════════');
  lines.push('');

  const decisionDef = defs['Decision'];
  emitDecision(lines, decisionDef);

  return lines.join('\n');
}

function emitInterface(lines: string[], name: string, def: SchemaDef): void {
  if (def.description) lines.push(`/** ${def.description} */`);
  lines.push(`export interface ${name} {`);
  
  const required = new Set(def.required || []);
  const props = def.properties || {};
  
  for (const [propName, propDef] of Object.entries(props)) {
    const tsType = schemaToTS(propDef);
    const opt = required.has(propName) ? '' : '?';
    if ((propDef as any).description) {
      lines.push(`  /** ${(propDef as any).description} */`);
    }
    lines.push(`  ${propName}${opt}: ${tsType};`);
  }
  
  lines.push('}');
  lines.push('');
}

function emitArtifactSubtype(lines: string[], name: string, def: SchemaDef): void {
  if (def.description) lines.push(`/** ${def.description} */`);
  lines.push(`export interface ${name} extends Artifact {`);
  
  // Collect all properties from allOf entries (excluding the Artifact ref)
  const allProps: Record<string, any> = {};
  const allRequired = new Set<string>();
  
  // The top-level properties and required
  if (def.properties) Object.assign(allProps, def.properties);
  if (def.required) def.required.forEach(r => allRequired.add(r));
  
  // Properties from allOf (skip the $ref to Artifact)
  if (def.allOf) {
    for (const entry of def.allOf) {
      if (entry.$ref) continue; // Skip Artifact base ref
      if (entry.properties) Object.assign(allProps, entry.properties);
      if (entry.required) entry.required.forEach((r: string) => allRequired.add(r));
    }
  }
  
  // Remove properties that are on the base Artifact type (they're inherited)
  const artifactProps = new Set(Object.keys(defs['Artifact'].properties || {}));
  // But keep overridden properties (like type: const)
  
  for (const [propName, propDef] of Object.entries(allProps)) {
    // Skip inherited props unless they have a const override or narrow the type ($ref)
    if (artifactProps.has(propName) && !propDef.const && !propDef.$ref) continue;
    
    const tsType = schemaToTS(propDef);
    // For the subtype, Artifact-level required fields are already on base
    // But content is always required if it has a $ref (type narrowing)
    const isRequired = allRequired.has(propName) && !artifactProps.has(propName) || (propName === 'content' && propDef.$ref);
    const opt = isRequired || propDef.const ? '' : '?';
    if (propDef.description) {
      lines.push(`  /** ${propDef.description} */`);
    }
    lines.push(`  ${propName}${opt}: ${tsType};`);
  }
  
  lines.push('}');
  lines.push('');
}

function emitDecision(lines: string[], def: SchemaDef): void {
  if (def.description) lines.push(`/** ${def.description} */`);
  lines.push('export interface Decision extends Artifact {');
  
  // Merge properties from allOf
  const allProps: Record<string, any> = {};
  const allRequired = new Set<string>();
  
  if (def.allOf) {
    for (const entry of def.allOf) {
      if (entry.$ref) continue;
      if (entry.properties) Object.assign(allProps, entry.properties);
      if (entry.required) entry.required.forEach((r: string) => allRequired.add(r));
    }
  }
  
  const artifactProps = new Set(Object.keys(defs['Artifact'].properties || {}));
  
  for (const [propName, propDef] of Object.entries(allProps)) {
    if (artifactProps.has(propName) && !propDef.const && !propDef.$ref) continue;
    
    const tsType = schemaToTS(propDef);
    const isRequired = allRequired.has(propName) || (propName === 'content' && propDef.$ref);
    const opt = isRequired || propDef.const ? '' : '?';
    if (propDef.description) {
      lines.push(`  /** ${propDef.description} */`);
    }
    lines.push(`  ${propName}${opt}: ${tsType};`);
  }
  
  lines.push('}');
  lines.push('');
}

function generateGuards(): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * PCOMJR Data Ontology — Generated Type Guards');
  lines.push(' * ');
  lines.push(' * AUTO-GENERATED from schema/pcomjr.schema.json');
  lines.push(' * DO NOT EDIT MANUALLY — run `npm run generate` to regenerate.');
  lines.push(` * Generated: ${new Date().toISOString()}`);
  lines.push(' */');
  lines.push('');
  // Dynamic imports based on schema artifact subtypes
  const subtypeNames = sorted(ARTIFACT_SUBTYPES);
  const allImports = ['Artifact', ...subtypeNames].join(', ');
  lines.push(`import type { ${allImports} } from './types.js';`);
  lines.push("import { CIAS_TERMINAL_ID, OIAS_SYSTEM_ID } from './types.js';");
  lines.push('');

  // isDecision
  lines.push('/** Type guard: is this artifact a Decision? */');
  lines.push('export function isDecision(a: Artifact): a is Decision {');
  lines.push("  return a.type === 'decision';");
  lines.push('}');
  lines.push('');

  // Per-CIAS-type guards — read const values from schema
  const ciasGuards: Array<{ name: string; typeConst: string; iface: string }> = [];
  for (const [defName, defn] of Object.entries(defs)) {
    if (!ARTIFACT_SUBTYPES.has(defName) || defName === 'Decision') continue;
    // Extract the const type value from allOf
    for (const entry of (defn as any).allOf || []) {
      if (entry.$ref) continue;
      const typeConst = entry.properties?.type?.const;
      if (typeConst) {
        const guardName = 'is' + defName;
        ciasGuards.push({ name: guardName, typeConst, iface: defName });
      }
    }
  }
  ciasGuards.sort((a, b) => a.name.localeCompare(b.name));

  for (const { name, typeConst, iface } of ciasGuards) {
    lines.push(`/** Type guard: is this artifact a ${iface}? */`);
    lines.push(`export function ${name}(a: Artifact): a is ${iface} {`);
    lines.push(`  return a.type === '${typeConst}';`);
    lines.push('}');
    lines.push('');
  }

  // isVerifiedArtifact
  lines.push('/** Type guard: has this artifact been verified? */');
  lines.push('export function isVerifiedArtifact(a: Artifact): boolean {');
  lines.push("  return a.verificationStatus === 'verified';");
  lines.push('}');
  lines.push('');

  // isCIASArtifact / isOIASArtifact
  lines.push('/** Type guard: is this artifact from a CIAS terminal? */');
  lines.push('export function isCIASArtifact(a: Artifact): boolean {');
  lines.push('  return (CIAS_TERMINAL_ID as readonly string[]).includes(a.sourceTerminal);');
  lines.push('}');
  lines.push('');

  lines.push('/** Type guard: is this artifact from an OIAS system? */');
  lines.push('export function isOIASArtifact(a: Artifact): boolean {');
  lines.push('  return (OIAS_SYSTEM_ID as readonly string[]).includes(a.sourceTerminal);');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function sorted(set: Set<string>): string[] {
  return [...set].sort();
}

function toScreamingSnake(name: string): string {
  // CIASTerminalId -> CIAS_TERMINAL_ID
  // ArtifactType -> ARTIFACT_TYPE
  return name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toUpperCase();
}

// ─── Main ───────────────────────────────────────────────────────────────────

mkdirSync(OUT_DIR, { recursive: true });

const typesCode = generateTypes();
const guardsCode = generateGuards();

writeFileSync(resolve(OUT_DIR, 'types.ts'), typesCode);
writeFileSync(resolve(OUT_DIR, 'guards.ts'), guardsCode);

console.log(`✓ Generated ${OUT_DIR}/types.ts (${ENUM_TYPES.size} enums, ${UNION_TYPES.size} unions, ${INTERFACE_TYPES.size} interfaces)`);
console.log(`✓ Generated ${OUT_DIR}/guards.ts`);
