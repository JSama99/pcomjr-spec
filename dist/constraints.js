/**
 * PCOMJR Ontology — Constraint Validation
 * ========================================
 * TalonSight Technologies
 *
 * Runtime enforcement of ontological rules. Terminals call validate()
 * before emitting artifacts to the Memory Bus. OIAS systems call
 * validateDecision(), validateVerification(), etc. for domain-specific checks.
 *
 * Usage:
 *   import { validate, validateDecision } from '@talonsight/ontology/constraints';
 *
 *   const result = validate(myArtifact);
 *   if (!result.valid) console.error(result.violations);
 */
// ─────────────────────────────────────────────
// Shared Helpers
// ─────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_REGEX = /^[a-f0-9]{64}$/i;
const ISO8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
function isValidUUID(val) {
    return typeof val === 'string' && UUID_REGEX.test(val);
}
function isValidHash(val) {
    return typeof val === 'string' && SHA256_REGEX.test(val);
}
function isValidTimestamp(val) {
    return typeof val === 'string' && ISO8601_REGEX.test(val);
}
const VALID_TERMINALS = [
    'sonic-genesis', 'da-cypher', 'talon-vision', 'talon-motion',
    'talon-fly', 'talon-learn', 'talon-agent',
    'artifact-memory', 'decision-intelligence', 'pow-ledger',
];
const VALID_ARTIFACT_TYPES = [
    'decision', 'verification', 'ledger-entry', 'pattern', 'workflow-proposal',
    'beat', 'loop', 'flow-session', 'freestyle-session', 'lyric-composition',
    'comic-panel', 'comic-page', 'character-sheet', 'location-sheet',
    'animation-clip', 'marketplace-listing', 'learning-module',
    'knowledge-node', 'session-brief', 'constellation-cluster', 'relationship-edge', 'transcript-ingestion',
    'decision-template', 'decision-review', 'governance-policy', 'approval-chain', 'decision-impact',
    'audit-trail', 'integrity-report', 'seal-event', 'a2a-message',
    'agent-execution', 'event-claim', 'task-delegation', 'orchestrator-routing',
    'generic',
];
/** Which artifact types each terminal is allowed to produce. */
const TERMINAL_ALLOWED_TYPES = {
    'sonic-genesis': ['beat', 'loop', 'flow-session'],
    'da-cypher': ['freestyle-session', 'lyric-composition'],
    'talon-vision': ['comic-panel', 'comic-page', 'character-sheet', 'location-sheet'],
    'talon-motion': ['animation-clip'],
    'talon-fly': ['marketplace-listing'],
    'talon-learn': ['learning-module'],
    'talon-agent': ['generic', 'agent-execution', 'event-claim', 'task-delegation', 'orchestrator-routing'],
    'artifact-memory': ['generic', 'knowledge-node', 'session-brief', 'constellation-cluster', 'relationship-edge', 'transcript-ingestion'],
    'decision-intelligence': ['decision', 'decision-template', 'decision-review', 'governance-policy', 'approval-chain', 'decision-impact'],
    'pow-ledger': ['verification', 'ledger-entry', 'pattern', 'workflow-proposal', 'audit-trail', 'integrity-report', 'seal-event', 'a2a-message'],
};
// ─────────────────────────────────────────────
// Base Artifact Validation
// ─────────────────────────────────────────────
export function validateArtifact(a) {
    const v = [];
    if (!isValidUUID(a.id)) {
        v.push({ path: 'id', rule: 'valid-uuid', message: 'Artifact ID must be a valid UUID v4.', severity: 'error' });
    }
    if (!VALID_ARTIFACT_TYPES.includes(a.type)) {
        v.push({ path: 'type', rule: 'valid-type', message: `Unknown artifact type "${a.type}".`, severity: 'error' });
    }
    if (!isValidHash(a.hash)) {
        v.push({ path: 'hash', rule: 'sha256-format', message: 'Hash must be a valid SHA-256 hex string (64 chars).', severity: 'error' });
    }
    if (!isValidTimestamp(a.timestamp)) {
        v.push({ path: 'timestamp', rule: 'iso8601', message: 'Timestamp must be ISO 8601 format.', severity: 'error' });
    }
    if (!VALID_TERMINALS.includes(a.sourceTerminal)) {
        v.push({ path: 'sourceTerminal', rule: 'valid-terminal', message: `Unknown terminal "${a.sourceTerminal}".`, severity: 'error' });
    }
    if (!a.workspace || typeof a.workspace !== 'string' || a.workspace.trim().length === 0) {
        v.push({ path: 'workspace', rule: 'workspace-required', message: 'Workspace must be a non-empty string.', severity: 'error' });
    }
    // Cross-check: terminal should be allowed to produce this artifact type
    if (VALID_TERMINALS.includes(a.sourceTerminal) && VALID_ARTIFACT_TYPES.includes(a.type)) {
        const allowed = TERMINAL_ALLOWED_TYPES[a.sourceTerminal];
        if (allowed && !allowed.includes(a.type)) {
            v.push({
                path: 'type',
                rule: 'terminal-type-mismatch',
                message: `Terminal "${a.sourceTerminal}" is not registered to produce "${a.type}" artifacts. Allowed: [${allowed.join(', ')}].`,
                severity: 'error',
            });
        }
    }
    // Sealed artifacts must have a hash
    if (a.sealed && !isValidHash(a.hash)) {
        v.push({ path: 'sealed', rule: 'sealed-requires-hash', message: 'Sealed artifact must have a valid SHA-256 hash.', severity: 'error' });
    }
    return v;
}
// ─────────────────────────────────────────────
// Decision Validation
// ─────────────────────────────────────────────
export function validateDecision(d) {
    const v = validateArtifact(d);
    if (d.type !== 'decision') {
        v.push({ path: 'type', rule: 'decision-type', message: 'Decision artifact must have type "decision".', severity: 'error' });
    }
    // CONSTRAINT: At least one Context
    if (!d.hasContext || !Array.isArray(d.hasContext) || d.hasContext.length === 0) {
        v.push({ path: 'hasContext', rule: 'min-context', message: 'Decision must have at least one Context. This is a hard ontological constraint.', severity: 'error' });
    }
    else {
        d.hasContext.forEach((ctx, i) => {
            v.push(...validateContext(ctx, `hasContext[${i}]`));
        });
    }
    // CONSTRAINT: At least one Evidence
    if (!d.supportedBy || !Array.isArray(d.supportedBy) || d.supportedBy.length === 0) {
        v.push({ path: 'supportedBy', rule: 'min-evidence', message: 'Decision must have at least one Evidence. No decision without evidence.', severity: 'error' });
    }
    else {
        d.supportedBy.forEach((ev, i) => {
            v.push(...validateEvidence(ev, `supportedBy[${i}]`));
        });
    }
    // Outcome is required
    if (!d.outcome || typeof d.outcome !== 'string' || d.outcome.trim().length === 0) {
        v.push({ path: 'outcome', rule: 'outcome-required', message: 'Decision must have an outcome describing what was decided.', severity: 'error' });
    }
    // Confidence range check
    if (d.confidence !== undefined && (d.confidence < 0 || d.confidence > 1)) {
        v.push({ path: 'confidence', rule: 'confidence-range', message: 'Confidence must be between 0.0 and 1.0.', severity: 'error' });
    }
    // Participants should be non-empty
    if (!d.participants || d.participants.length === 0) {
        v.push({ path: 'participants', rule: 'participants-recommended', message: 'Decision should list at least one participant.', severity: 'warning' });
    }
    return v;
}
// ─────────────────────────────────────────────
// Context Validation
// ─────────────────────────────────────────────
export function validateContext(ctx, prefix = '') {
    const v = [];
    const p = prefix ? `${prefix}.` : '';
    if (!isValidUUID(ctx.id)) {
        v.push({ path: `${p}id`, rule: 'valid-uuid', message: 'Context ID must be a valid UUID v4.', severity: 'error' });
    }
    if (!isValidTimestamp(ctx.timestamp)) {
        v.push({ path: `${p}timestamp`, rule: 'iso8601', message: 'Context timestamp must be ISO 8601.', severity: 'error' });
    }
    if (!ctx.conditions || typeof ctx.conditions !== 'object' || Object.keys(ctx.conditions).length === 0) {
        v.push({ path: `${p}conditions`, rule: 'conditions-required', message: 'Context must have non-empty conditions describing what was true at decision time.', severity: 'error' });
    }
    if (!ctx.constraints || !Array.isArray(ctx.constraints)) {
        v.push({ path: `${p}constraints`, rule: 'constraints-array', message: 'Context constraints must be an array (can be empty).', severity: 'warning' });
    }
    return v;
}
// ─────────────────────────────────────────────
// Evidence Validation
// ─────────────────────────────────────────────
export function validateEvidence(ev, prefix = '') {
    const v = [];
    const p = prefix ? `${prefix}.` : '';
    if (!isValidUUID(ev.id)) {
        v.push({ path: `${p}id`, rule: 'valid-uuid', message: 'Evidence ID must be a valid UUID v4.', severity: 'error' });
    }
    // CONSTRAINT: At least one artifact reference
    if (!ev.references || !Array.isArray(ev.references) || ev.references.length === 0) {
        v.push({ path: `${p}references`, rule: 'min-reference', message: 'Evidence must reference at least one existing Artifact.', severity: 'error' });
    }
    else {
        ev.references.forEach((ref, i) => {
            if (!isValidUUID(ref)) {
                v.push({ path: `${p}references[${i}]`, rule: 'valid-uuid', message: 'Evidence reference must be a valid Artifact UUID.', severity: 'error' });
            }
        });
    }
    if (!ev.description || ev.description.trim().length === 0) {
        v.push({ path: `${p}description`, rule: 'description-required', message: 'Evidence must have a description.', severity: 'error' });
    }
    if (ev.weight < 0 || ev.weight > 1) {
        v.push({ path: `${p}weight`, rule: 'weight-range', message: 'Evidence weight must be between 0.0 and 1.0.', severity: 'error' });
    }
    return v;
}
// ─────────────────────────────────────────────
// Verification Validation
// ─────────────────────────────────────────────
export function validateVerification(ver) {
    const v = [];
    if (!isValidUUID(ver.id)) {
        v.push({ path: 'id', rule: 'valid-uuid', message: 'Verification ID must be a valid UUID v4.', severity: 'error' });
    }
    // CONSTRAINT: Must reference exactly one artifact
    if (!isValidUUID(ver.artifactId)) {
        v.push({ path: 'artifactId', rule: 'artifact-ref-required', message: 'Verification must reference exactly one Artifact (valid UUID).', severity: 'error' });
    }
    // CONSTRAINT: Must reference exactly one ledger entry
    if (!isValidUUID(ver.ledgerEntryId)) {
        v.push({ path: 'ledgerEntryId', rule: 'ledger-ref-required', message: 'Verification must reference exactly one LedgerEntry (valid UUID).', severity: 'error' });
    }
    if (!isValidHash(ver.integrityHash)) {
        v.push({ path: 'integrityHash', rule: 'sha256-format', message: 'Integrity hash must be a valid SHA-256 hex string.', severity: 'error' });
    }
    if (!isValidTimestamp(ver.verifiedAt)) {
        v.push({ path: 'verifiedAt', rule: 'iso8601', message: 'verifiedAt must be ISO 8601.', severity: 'error' });
    }
    const validStatuses = ['pending', 'verified', 'failed', 'tampered'];
    if (!validStatuses.includes(ver.status)) {
        v.push({ path: 'status', rule: 'valid-status', message: `Status must be one of: ${validStatuses.join(', ')}.`, severity: 'error' });
    }
    return v;
}
// ─────────────────────────────────────────────
// LedgerEntry Validation
// ─────────────────────────────────────────────
export function validateLedgerEntry(entry, expectedCaptureAgent) {
    const v = [];
    if (!isValidUUID(entry.id)) {
        v.push({ path: 'id', rule: 'valid-uuid', message: 'LedgerEntry ID must be a valid UUID v4.', severity: 'error' });
    }
    if (!isValidUUID(entry.artifactId)) {
        v.push({ path: 'artifactId', rule: 'artifact-ref-required', message: 'LedgerEntry must reference an Artifact.', severity: 'error' });
    }
    if (!isValidHash(entry.hash)) {
        v.push({ path: 'hash', rule: 'sha256-format', message: 'LedgerEntry hash must be valid SHA-256.', severity: 'error' });
    }
    if (!isValidTimestamp(entry.timestamp)) {
        v.push({ path: 'timestamp', rule: 'iso8601', message: 'Timestamp must be ISO 8601.', severity: 'error' });
    }
    // CONSTRAINT: Single-writer protocol
    if (expectedCaptureAgent && entry.captureAgentId !== expectedCaptureAgent) {
        v.push({
            path: 'captureAgentId',
            rule: 'single-writer',
            message: `Single-writer violation: expected "${expectedCaptureAgent}", got "${entry.captureAgentId}". Only the designated Capture Agent may write to the ledger.`,
            severity: 'error',
        });
    }
    // Sequence number must be positive
    if (!Number.isInteger(entry.sequenceNumber) || entry.sequenceNumber < 1) {
        v.push({ path: 'sequenceNumber', rule: 'positive-sequence', message: 'Sequence number must be a positive integer.', severity: 'error' });
    }
    // Chain integrity: first entry has null previousEntryId, all others must have one
    if (entry.sequenceNumber > 1 && !isValidUUID(entry.previousEntryId)) {
        v.push({ path: 'previousEntryId', rule: 'chain-integrity', message: 'Non-first entries must reference a previous entry for chain integrity.', severity: 'error' });
    }
    return v;
}
// ─────────────────────────────────────────────
// Pattern Validation
// ─────────────────────────────────────────────
export function validatePattern(p) {
    const v = [];
    if (!isValidUUID(p.id)) {
        v.push({ path: 'id', rule: 'valid-uuid', message: 'Pattern ID must be a valid UUID v4.', severity: 'error' });
    }
    // CONSTRAINT: A pattern requires at least 2 decisions
    if (!p.decisionIds || p.decisionIds.length < 2) {
        v.push({ path: 'decisionIds', rule: 'min-decisions', message: 'A pattern must reference at least 2 decisions.', severity: 'error' });
    }
    if (p.frequency < 2) {
        v.push({ path: 'frequency', rule: 'min-frequency', message: 'Pattern frequency must be at least 2.', severity: 'error' });
    }
    return v;
}
// ─────────────────────────────────────────────
// Memory Bus Event Validation
// ─────────────────────────────────────────────
export function validateMemoryBusEvent(event) {
    const v = [];
    if (!event.eventId || typeof event.eventId !== 'string') {
        v.push({ path: 'eventId', rule: 'event-id-required', message: 'Event must have an eventId.', severity: 'error' });
    }
    if (!isValidTimestamp(event.eventTimestamp)) {
        v.push({ path: 'eventTimestamp', rule: 'iso8601', message: 'Event timestamp must be ISO 8601.', severity: 'error' });
    }
    if (!VALID_TERMINALS.includes(event.source)) {
        v.push({ path: 'source', rule: 'valid-source', message: `Unknown event source terminal "${event.source}".`, severity: 'error' });
    }
    // Validate the payload artifact
    if (event.payload) {
        v.push(...validateArtifact(event.payload));
        // Cross-check: artifactClass must match payload type
        if (event.artifactClass !== event.payload.type) {
            v.push({
                path: 'artifactClass',
                rule: 'class-type-match',
                message: `artifactClass "${event.artifactClass}" does not match payload type "${event.payload.type}".`,
                severity: 'error',
            });
        }
    }
    else {
        v.push({ path: 'payload', rule: 'payload-required', message: 'Memory Bus event must carry an artifact payload.', severity: 'error' });
    }
    return v;
}
// ─────────────────────────────────────────────
// Universal Validate Entry Point
// ─────────────────────────────────────────────
/**
 * Validate any artifact against ontological constraints.
 * Routes to the appropriate validator based on artifact type.
 */
export function validate(a) {
    let violations;
    switch (a.type) {
        case 'decision':
            violations = validateDecision(a);
            break;
        default:
            violations = validateArtifact(a);
            break;
    }
    return {
        valid: violations.filter(v => v.severity === 'error').length === 0,
        violations,
        artifactType: a.type ?? 'unknown',
    };
}
/**
 * Validate and throw on first error. Use in pipelines where
 * invalid artifacts should halt processing.
 */
export function validateOrThrow(a) {
    const result = validate(a);
    if (!result.valid) {
        const errors = result.violations
            .filter(v => v.severity === 'error')
            .map(v => `[${v.path}] ${v.message}`)
            .join('\n');
        throw new Error(`Ontology validation failed for ${result.artifactType}:\n${errors}`);
    }
}
//# sourceMappingURL=constraints.js.map