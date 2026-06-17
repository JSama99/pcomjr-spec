/**
 * PCOMJR Ontology — Constraint Tests (TypeScript)
 * Updated for content-nested schema with hash/timestamp/workspace/sealed.
 */

import { validate, validateOrThrow, validateDecision, validateMemoryBusEvent,
  validateSealEvent, validateLedgerEntry, validateKnowledgeNode,
  validateRelationshipEdge, validateVerification } from '../src/constraints.js';

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}
function section(name: string) { console.log(`\n── ${name} ──`); }

const VALID_BEAT = {
  id: 'a-1', type: 'beat', hash: 'a'.repeat(64),
  timestamp: '2026-06-15T12:00:00.000Z',
  sourceTerminal: 'sonic-genesis', workspace: 'sonic-genesis',
  sealed: false, content: { bpm: 140, duration: 120 }
};

const VALID_DECISION = {
  id: 'd-1', type: 'decision', hash: 'b'.repeat(64),
  timestamp: '2026-06-15T12:00:00.000Z',
  sourceTerminal: 'decision-intelligence', workspace: 'decision-intelligence',
  sealed: false,
  content: {
    outcome: 'Adopt PCOMJR', decisionType: 'architectural', status: 'approved',
    contexts: [{ id: 'c-1', objective: 'Unify governance' }],
    evidences: [{ id: 'e-1', type: 'analysis', title: 'Audit', content: 'Converged' }],
    confidenceLevel: 0.85
  }
};

const VALID_EVENT = {
  eventId: 'ev-1', eventType: 'artifact.created',
  eventTimestamp: '2026-06-15T12:00:00.000Z',
  source: 'sonic-genesis', payload: { id: 'beat-1' }, artifactClass: 'beat'
};

// ── Artifact Validation ──
section('Artifact Validation');
assert(validate(VALID_BEAT).valid, 'valid beat passes');
assert(!validate({ ...VALID_BEAT, id: '' }).valid, 'empty id fails');
assert(!validate({ ...VALID_BEAT, hash: '' }).valid, 'empty hash fails');
assert(!validate({ ...VALID_BEAT, hash: 'too-short' }).valid, 'invalid hash format fails');
assert(!validate({ ...VALID_BEAT, type: 'nonexistent' }).valid, 'invalid type fails');
assert(!validate({ ...VALID_BEAT, sourceTerminal: 'unknown' }).valid, 'invalid terminal fails');
assert(!validate({ ...VALID_BEAT, sourceTerminal: 'da-cypher' }).valid, 'terminal-type mismatch fails');
assert(!validate({ ...VALID_BEAT, timestamp: '' }).valid, 'empty timestamp fails');
assert(!validate({ ...VALID_BEAT, workspace: '' }).valid, 'empty workspace fails');
assert(!validate({ ...VALID_BEAT, sealed: undefined }).valid, 'undefined sealed fails');
assert(!validate({ ...VALID_BEAT, content: null }).valid, 'null content fails');
assert(validate({ ...VALID_BEAT, powHash: 'a'.repeat(64) }).valid, 'valid powHash passes');
assert(validate({ ...VALID_BEAT, powHash: 'nope' }).violations.some(v => v.rule === 'invalid-pow-hash'), 'invalid powHash caught');

// ── validateOrThrow ──
section('validateOrThrow');
try { validateOrThrow(VALID_BEAT); assert(true, 'valid does not throw'); } catch { assert(false, 'valid does not throw'); }
try { validateOrThrow({ ...VALID_BEAT, id: '' }); assert(false, 'invalid throws'); } catch { assert(true, 'invalid throws'); }

// ── Decision Validation ──
section('Decision Validation');
assert(validateDecision(VALID_DECISION).valid, 'valid decision passes');
assert(!validateDecision({ ...VALID_DECISION, content: { ...VALID_DECISION.content, outcome: '' } }).valid, 'empty outcome fails');
assert(!validateDecision({ ...VALID_DECISION, content: { ...VALID_DECISION.content, contexts: [] } }).valid, 'empty contexts fails');
assert(!validateDecision({ ...VALID_DECISION, content: { ...VALID_DECISION.content, evidences: [] } }).valid, 'empty evidences fails');
assert(!validateDecision({ ...VALID_DECISION, content: { ...VALID_DECISION.content, confidenceLevel: 1.5 } }).valid, 'confidence > 1 fails');
assert(!validateDecision({ ...VALID_DECISION, content: { ...VALID_DECISION.content, confidenceLevel: -0.1 } }).valid, 'confidence < 0 fails');

// ── MemoryBusEvent Validation ──
section('MemoryBusEvent Validation');
assert(validateMemoryBusEvent(VALID_EVENT).filter(v => v.severity === 'error').length === 0, 'valid event passes');
assert(validateMemoryBusEvent({ ...VALID_EVENT, eventId: '' }).some(v => v.rule === 'required-eventId'), 'missing eventId caught');
assert(validateMemoryBusEvent({ ...VALID_EVENT, eventType: 'bogus' }).some(v => v.rule === 'invalid-event-type'), 'invalid eventType caught');
assert(validateMemoryBusEvent({ ...VALID_EVENT, source: 'mystery' }).some(v => v.rule === 'invalid-source'), 'invalid source caught');
assert(validateMemoryBusEvent({ ...VALID_EVENT, powHash: 'short' }).some(v => v.rule === 'invalid-pow-hash'), 'invalid powHash caught');
assert(validateMemoryBusEvent({ ...VALID_EVENT, eventTimestamp: 'not-a-date' }).some(v => v.rule === 'invalid-timestamp'), 'invalid timestamp caught');

// ── SealEvent ──
section('SealEvent Validation');
assert(validateSealEvent({ eventId: 'e-1', decisionId: 'd-1', hash: 'a'.repeat(64), sealedAt: '2026-06-15T12:00:00Z', sealedBy: 'user-1' }).filter(v => v.severity === 'error').length === 0, 'valid seal event');
assert(validateSealEvent({ eventId: '', decisionId: '', hash: 'bad', sealedAt: '', sealedBy: '' }).length >= 4, 'all missing fields caught');

// ── LedgerEntry ──
section('LedgerEntry Validation');
assert(validateLedgerEntry({ id: 'le-1', artifactId: 'a-1', artifactHash: 'b'.repeat(64), timestamp: '2026-06-15T12:00:00Z' }).filter(v => v.severity === 'error').length === 0, 'valid ledger entry');
assert(validateLedgerEntry({ id: '', artifactId: '', artifactHash: 'nope', timestamp: '' }).length >= 3, 'all missing fields caught');

// ── KnowledgeNode ──
section('KnowledgeNode Validation');
assert(validateKnowledgeNode({ id: 'kn-1', content: { statement: 'PCOMJR is the standard', category: 'architecture' } }).filter(v => v.severity === 'error').length === 0, 'valid knowledge node');
assert(validateKnowledgeNode({ id: '', content: { statement: '', category: 'bogus' } }).some(v => v.rule === 'invalid-category'), 'invalid category caught');

// ── RelationshipEdge ──
section('RelationshipEdge Validation');
assert(validateRelationshipEdge({ id: 're-1', sourceId: 'a-1', targetId: 'a-2', relationType: 'derived-from' }).filter(v => v.severity === 'error').length === 0, 'valid edge');
assert(validateRelationshipEdge({ id: 're-1', sourceId: 'a-1', targetId: 'a-1', relationType: 'derived-from' }).some(v => v.rule === 'self-reference'), 'self-reference caught');
assert(validateRelationshipEdge({ id: 're-1', sourceId: 'a-1', targetId: 'a-2', relationType: 'bogus' }).some(v => v.rule === 'invalid-relation-type'), 'invalid relation type caught');

// ── Verification ──
section('Verification Validation');
assert(validateVerification({ id: 'v-1', artifactId: 'a-1', hash: 'c'.repeat(64), status: 'verified' }).filter(v => v.severity === 'error').length === 0, 'valid verification');
assert(validateVerification({ id: 'v-1', artifactId: 'a-1', hash: 'bad', status: 'bogus' }).some(v => v.rule === 'invalid-hash'), 'invalid hash caught');
assert(validateVerification({ id: 'v-1', artifactId: 'a-1', hash: 'bad', status: 'bogus' }).some(v => v.rule === 'invalid-status'), 'invalid status caught');

console.log(`\n${'═'.repeat(47)}`);
console.log(`  ${passed} passed, ${failed} failed`);
console.log('═'.repeat(47));
if (failed > 0) process.exit(1);
