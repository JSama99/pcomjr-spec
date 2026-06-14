/**
 * PCOMJR Ontology — Constraint Tests
 * ====================================
 * TalonSight Technologies
 *
 * Run: npx ts-node constraints.test.ts
 * Or:  npx tsx constraints.test.ts
 *
 * Tests every ontological constraint with valid and invalid cases.
 * Uses Node.js built-in assert — zero external dependencies.
 */

import assert from 'node:assert';
import {
  validate,
  validateArtifact,
  validateDecision,
  validateContext,
  validateEvidence,
  validateVerification,
  validateLedgerEntry,
  validatePattern,
  validateMemoryBusEvent,
  validateOrThrow,
} from './constraints';
import type {
  Artifact,
  Decision,
  Context,
  Evidence,
  Verification,
  LedgerEntry,
  Pattern,
  Beat,
  ComicPanel,
  FreestyleSession,
  MemoryBusEvent,
} from './pcomjr-types';

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const sha256 = () => 'a'.repeat(64);

function makeArtifact(overrides: Partial<Artifact> = {}): Artifact {
  return {
    id: uuid(),
    type: 'generic',
    hash: sha256(),
    timestamp: now(),
    sourceTerminal: 'artifact-memory',
    workspace: 'test-workspace',
    sealed: false,
    content: {},
    tags: [],
    ...overrides,
  };
}

function makeContext(overrides: Partial<Context> = {}): Context {
  return {
    id: uuid(),
    timestamp: now(),
    conditions: { sprint: 'Q3-W2', urgency: 'high' },
    constraints: ['deadline: June 11'],
    ...overrides,
  };
}

function makeEvidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: uuid(),
    timestamp: now(),
    references: [uuid()],
    description: 'Eval harness passed 6/6',
    weight: 0.9,
    evidenceType: 'agent-analysis',
    ...overrides,
  };
}

function makeDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    ...makeArtifact({ type: 'decision', sourceTerminal: 'decision-intelligence' }),
    hasContext: [makeContext()],
    supportedBy: [makeEvidence()],
    outcome: 'Ship POW Ledger to Google challenge',
    participants: ['jermaine'],
    ...overrides,
  } as Decision;
}

function makeVerification(overrides: Partial<Verification> = {}): Verification {
  return {
    id: uuid(),
    artifactId: uuid(),
    ledgerEntryId: uuid(),
    integrityHash: sha256(),
    verifiedAt: now(),
    verifiedBy: 'verification-agent-001',
    status: 'verified',
    ...overrides,
  };
}

function makeLedgerEntry(overrides: Partial<LedgerEntry> = {}): LedgerEntry {
  return {
    id: uuid(),
    artifactId: uuid(),
    hash: sha256(),
    timestamp: now(),
    captureAgentId: 'capture-agent-001',
    sequenceNumber: 1,
    previousEntryId: null,
    ...overrides,
  };
}

function makePattern(overrides: Partial<Pattern> = {}): Pattern {
  return {
    id: uuid(),
    decisionIds: [uuid(), uuid()],
    description: 'Recurring architecture review before deployment',
    frequency: 3,
    firstSeen: now(),
    lastSeen: now(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// Test Runner
// ─────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// ─────────────────────────────────────────────
// Artifact Base Tests
// ─────────────────────────────────────────────

console.log('\n▸ Artifact (base)');

test('valid artifact passes', () => {
  const v = validateArtifact(makeArtifact());
  assert.strictEqual(v.length, 0, `Expected 0 violations, got: ${JSON.stringify(v)}`);
});

test('invalid UUID fails', () => {
  const v = validateArtifact(makeArtifact({ id: 'not-a-uuid' }));
  assert.ok(v.some(x => x.rule === 'valid-uuid'));
});

test('invalid hash fails', () => {
  const v = validateArtifact(makeArtifact({ hash: 'bad' }));
  assert.ok(v.some(x => x.rule === 'sha256-format'));
});

test('invalid timestamp fails', () => {
  const v = validateArtifact(makeArtifact({ timestamp: 'yesterday' }));
  assert.ok(v.some(x => x.rule === 'iso8601'));
});

test('unknown terminal fails', () => {
  const v = validateArtifact(makeArtifact({ sourceTerminal: 'unknown-terminal' as any }));
  assert.ok(v.some(x => x.rule === 'valid-terminal'));
});

test('empty workspace fails', () => {
  const v = validateArtifact(makeArtifact({ workspace: '' }));
  assert.ok(v.some(x => x.rule === 'workspace-required'));
});

test('terminal-type mismatch fails (beat from da-cypher)', () => {
  const v = validateArtifact(makeArtifact({ type: 'beat', sourceTerminal: 'da-cypher' }));
  assert.ok(v.some(x => x.rule === 'terminal-type-mismatch'));
});

test('terminal-type match passes (beat from sonic-genesis)', () => {
  const v = validateArtifact(makeArtifact({ type: 'beat', sourceTerminal: 'sonic-genesis' }));
  assert.ok(!v.some(x => x.rule === 'terminal-type-mismatch'));
});

test('sealed artifact without valid hash fails', () => {
  const v = validateArtifact(makeArtifact({ sealed: true, hash: 'bad' }));
  assert.ok(v.some(x => x.rule === 'sealed-requires-hash'));
});

// ─────────────────────────────────────────────
// Decision Tests
// ─────────────────────────────────────────────

console.log('\n▸ Decision');

test('valid decision passes', () => {
  const v = validateDecision(makeDecision());
  const errors = v.filter(x => x.severity === 'error');
  assert.strictEqual(errors.length, 0, `Expected 0 errors, got: ${JSON.stringify(errors)}`);
});

test('decision without context fails (hard constraint)', () => {
  const v = validateDecision(makeDecision({ hasContext: [] as any }));
  assert.ok(v.some(x => x.rule === 'min-context'));
});

test('decision without evidence fails (hard constraint)', () => {
  const v = validateDecision(makeDecision({ supportedBy: [] as any }));
  assert.ok(v.some(x => x.rule === 'min-evidence'));
});

test('decision without outcome fails', () => {
  const v = validateDecision(makeDecision({ outcome: '' }));
  assert.ok(v.some(x => x.rule === 'outcome-required'));
});

test('decision with out-of-range confidence fails', () => {
  const v = validateDecision(makeDecision({ confidence: 1.5 }));
  assert.ok(v.some(x => x.rule === 'confidence-range'));
});

test('decision without participants warns (not error)', () => {
  const v = validateDecision(makeDecision({ participants: [] }));
  const warning = v.find(x => x.rule === 'participants-recommended');
  assert.ok(warning);
  assert.strictEqual(warning!.severity, 'warning');
});

test('decision with invalid nested context fails', () => {
  const v = validateDecision(makeDecision({
    hasContext: [makeContext({ conditions: {} as any })] as any,
  }));
  assert.ok(v.some(x => x.rule === 'conditions-required'));
});

test('decision with invalid nested evidence fails', () => {
  const v = validateDecision(makeDecision({
    supportedBy: [makeEvidence({ references: [] as any })] as any,
  }));
  assert.ok(v.some(x => x.rule === 'min-reference'));
});

// ─────────────────────────────────────────────
// Context Tests
// ─────────────────────────────────────────────

console.log('\n▸ Context');

test('valid context passes', () => {
  const v = validateContext(makeContext());
  assert.strictEqual(v.length, 0);
});

test('context with empty conditions fails', () => {
  const v = validateContext(makeContext({ conditions: {} }));
  assert.ok(v.some(x => x.rule === 'conditions-required'));
});

// ─────────────────────────────────────────────
// Evidence Tests
// ─────────────────────────────────────────────

console.log('\n▸ Evidence');

test('valid evidence passes', () => {
  const v = validateEvidence(makeEvidence());
  assert.strictEqual(v.length, 0);
});

test('evidence without references fails', () => {
  const v = validateEvidence(makeEvidence({ references: [] as any }));
  assert.ok(v.some(x => x.rule === 'min-reference'));
});

test('evidence with invalid reference UUID fails', () => {
  const v = validateEvidence(makeEvidence({ references: ['not-a-uuid'] as any }));
  assert.ok(v.some(x => x.rule === 'valid-uuid'));
});

test('evidence with out-of-range weight fails', () => {
  const v = validateEvidence(makeEvidence({ weight: 2.0 }));
  assert.ok(v.some(x => x.rule === 'weight-range'));
});

// ─────────────────────────────────────────────
// Verification Tests
// ─────────────────────────────────────────────

console.log('\n▸ Verification');

test('valid verification passes', () => {
  const v = validateVerification(makeVerification());
  assert.strictEqual(v.length, 0);
});

test('verification without artifact ref fails', () => {
  const v = validateVerification(makeVerification({ artifactId: 'bad' }));
  assert.ok(v.some(x => x.rule === 'artifact-ref-required'));
});

test('verification without ledger ref fails', () => {
  const v = validateVerification(makeVerification({ ledgerEntryId: 'bad' }));
  assert.ok(v.some(x => x.rule === 'ledger-ref-required'));
});

test('verification with invalid status fails', () => {
  const v = validateVerification(makeVerification({ status: 'maybe' as any }));
  assert.ok(v.some(x => x.rule === 'valid-status'));
});

// ─────────────────────────────────────────────
// LedgerEntry Tests
// ─────────────────────────────────────────────

console.log('\n▸ LedgerEntry');

test('valid first ledger entry passes', () => {
  const v = validateLedgerEntry(makeLedgerEntry());
  assert.strictEqual(v.length, 0);
});

test('single-writer violation detected', () => {
  const v = validateLedgerEntry(
    makeLedgerEntry({ captureAgentId: 'rogue-agent' }),
    'capture-agent-001'
  );
  assert.ok(v.some(x => x.rule === 'single-writer'));
});

test('non-first entry without previous ref fails', () => {
  const v = validateLedgerEntry(makeLedgerEntry({ sequenceNumber: 5, previousEntryId: null }));
  assert.ok(v.some(x => x.rule === 'chain-integrity'));
});

test('negative sequence number fails', () => {
  const v = validateLedgerEntry(makeLedgerEntry({ sequenceNumber: -1 }));
  assert.ok(v.some(x => x.rule === 'positive-sequence'));
});

// ─────────────────────────────────────────────
// Pattern Tests
// ─────────────────────────────────────────────

console.log('\n▸ Pattern');

test('valid pattern passes', () => {
  const v = validatePattern(makePattern());
  assert.strictEqual(v.length, 0);
});

test('pattern with fewer than 2 decisions fails', () => {
  const v = validatePattern(makePattern({ decisionIds: [uuid()] as any }));
  assert.ok(v.some(x => x.rule === 'min-decisions'));
});

test('pattern with frequency < 2 fails', () => {
  const v = validatePattern(makePattern({ frequency: 1 }));
  assert.ok(v.some(x => x.rule === 'min-frequency'));
});

// ─────────────────────────────────────────────
// Memory Bus Event Tests
// ─────────────────────────────────────────────

console.log('\n▸ MemoryBusEvent');

test('valid memory bus event passes', () => {
  const artifact = makeArtifact({ type: 'beat', sourceTerminal: 'sonic-genesis' });
  const event: MemoryBusEvent = {
    eventId: uuid(),
    eventType: 'artifact.created',
    eventTimestamp: now(),
    source: 'sonic-genesis',
    payload: artifact,
    artifactClass: 'beat',
  };
  const v = validateMemoryBusEvent(event);
  const errors = v.filter(x => x.severity === 'error');
  assert.strictEqual(errors.length, 0, `Expected 0 errors, got: ${JSON.stringify(errors)}`);
});

test('class-type mismatch on bus event fails', () => {
  const artifact = makeArtifact({ type: 'beat', sourceTerminal: 'sonic-genesis' });
  const event: MemoryBusEvent = {
    eventId: uuid(),
    eventType: 'artifact.created',
    eventTimestamp: now(),
    source: 'sonic-genesis',
    payload: artifact,
    artifactClass: 'comic-panel', // Wrong!
  };
  const v = validateMemoryBusEvent(event);
  assert.ok(v.some(x => x.rule === 'class-type-match'));
});

// ─────────────────────────────────────────────
// Universal validate() Router Tests
// ─────────────────────────────────────────────

console.log('\n▸ validate() router');

test('validate() routes decisions to validateDecision', () => {
  const result = validate(makeDecision());
  assert.strictEqual(result.artifactType, 'decision');
  assert.ok(result.valid);
});

test('validate() routes generic artifacts to validateArtifact', () => {
  const result = validate(makeArtifact());
  assert.strictEqual(result.artifactType, 'generic');
  assert.ok(result.valid);
});

test('validateOrThrow throws on invalid artifact', () => {
  assert.throws(
    () => validateOrThrow(makeArtifact({ id: 'bad', hash: 'bad' })),
    /Ontology validation failed/
  );
});

test('validateOrThrow passes on valid artifact', () => {
  assert.doesNotThrow(() => validateOrThrow(makeArtifact()));
});

// ─────────────────────────────────────────────
// Cross-Domain Tests (CIAS ↔ OIAS)
// ─────────────────────────────────────────────

console.log('\n▸ Cross-domain integrity');

test('decision referencing sonic-genesis evidence passes', () => {
  const beatId = uuid();
  const evidence = makeEvidence({ references: [beatId], description: 'Beat quality confirmed' });
  const decision = makeDecision({ supportedBy: [evidence] as any });
  const result = validate(decision);
  assert.ok(result.valid);
});

test('full Knowledge→Judgment→Trust chain validates', () => {
  // 1. CIAS artifact (Knowledge)
  const beat = makeArtifact({ type: 'beat', sourceTerminal: 'sonic-genesis' }) as Beat;
  const beatResult = validate(beat);
  assert.ok(beatResult.valid, 'Beat should validate');

  // 2. Decision referencing beat (Judgment)
  const evidence = makeEvidence({ references: [beat.id] });
  const decision = makeDecision({ supportedBy: [evidence] as any });
  const decisionResult = validate(decision);
  assert.ok(decisionResult.valid, 'Decision should validate');

  // 3. Verification of the decision (Trust)
  const ledgerEntry = makeLedgerEntry({ artifactId: decision.id });
  const ledgerResult = validateLedgerEntry(ledgerEntry);
  assert.strictEqual(ledgerResult.length, 0, 'LedgerEntry should validate');

  const verification = makeVerification({
    artifactId: decision.id,
    ledgerEntryId: ledgerEntry.id,
  });
  const verResult = validateVerification(verification);
  assert.strictEqual(verResult.length, 0, 'Verification should validate');
});

// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────

console.log(`\n${'─'.repeat(48)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All ontology constraints verified. ✓\n');
}
