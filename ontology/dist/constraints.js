/**
 * PCOMJR Data Ontology — Validation Constraints
 *
 * Runtime validators for ontology types. Updated for content-nested schema:
 * base Artifact has hash/timestamp/workspace/sealed/content, subtype fields
 * live inside the content wrapper.
 */
import { CIAS_TERMINAL_ID, OIAS_SYSTEM_ID, CIAS_ARTIFACT_TYPE, OIAS_ARTIFACT_TYPE, MEMORY_BUS_EVENT_TYPE, VERIFICATION_STATUS, DECISION_STATUS, DECISION_TYPE, RELATION_TYPE, KNOWLEDGE_CATEGORY } from './generated/types.js';
// ─── Terminal / Type Registry ───────────────────────────────────────────────
const ALL_TERMINALS = [...CIAS_TERMINAL_ID, ...OIAS_SYSTEM_ID];
const ALL_ARTIFACT_TYPES = [...CIAS_ARTIFACT_TYPE, ...OIAS_ARTIFACT_TYPE];
const TERMINAL_TYPE_MAP = {
    'sonic-genesis': ['beat', 'loop', 'stem-bundle', 'mix-export', 'arrangement'],
    'da-cypher': ['flow-session', 'freestyle-session', 'battle-recording', 'lyric-composition', 'progression-signal'],
    'talonvision': ['comic-panel', 'comic-page', 'character-sheet', 'location-sheet', 'talonvision-export'],
    'talonmotion': ['animation-clip', 'motion-sequence'],
    'talonfly': ['marketplace-listing', 'creator-profile'],
    'artifact-memory': ['knowledge-node', 'session-brief', 'transcript-ingestion'],
    'decision-intelligence': ['decision', 'context', 'evidence', 'verification', 'pattern', 'workflow-proposal'],
    'pow-ledger': ['ledger-entry', 'seal-event', 'audit-entry', 'verification'],
    'talon-agent': ['agent-task', 'event-claim', 'a2a-message'],
    'talon-llm': [],
};
// ─── Helpers ────────────────────────────────────────────────────────────────
function err(rule, message, path) {
    return { rule, message, severity: 'error', path };
}
function warn(rule, message, path) {
    return { rule, message, severity: 'warning', path };
}
const HASH_RE = /^[a-f0-9]{64}$/;
// ─── Core Validators ────────────────────────────────────────────────────────
export function validate(artifact) {
    const violations = [];
    if (!artifact.id)
        violations.push(err('required-id', 'Artifact must have an id', 'id'));
    if (!artifact.type)
        violations.push(err('required-type', 'Artifact must have a type', 'type'));
    if (!artifact.hash)
        violations.push(err('required-hash', 'Artifact must have a hash', 'hash'));
    if (!artifact.timestamp)
        violations.push(err('required-timestamp', 'Artifact must have a timestamp', 'timestamp'));
    if (!artifact.sourceTerminal)
        violations.push(err('required-sourceTerminal', 'Artifact must have a sourceTerminal', 'sourceTerminal'));
    if (!artifact.workspace)
        violations.push(err('required-workspace', 'Artifact must have a workspace', 'workspace'));
    if (artifact.sealed === undefined || artifact.sealed === null) {
        violations.push(err('required-sealed', 'Artifact must have a sealed field', 'sealed'));
    }
    if (!artifact.content)
        violations.push(err('required-content', 'Artifact must have a content object', 'content'));
    // Hash format
    if (artifact.hash && !HASH_RE.test(artifact.hash)) {
        violations.push(err('invalid-hash', 'hash must be a 64-character lowercase hex string', 'hash'));
    }
    // Type validity
    if (artifact.type && !ALL_ARTIFACT_TYPES.includes(artifact.type)) {
        violations.push(err('invalid-type', `Unknown artifact type: ${artifact.type}`, 'type'));
    }
    // Terminal validity
    if (artifact.sourceTerminal && !ALL_TERMINALS.includes(artifact.sourceTerminal)) {
        violations.push(err('invalid-terminal', `Unknown terminal: ${artifact.sourceTerminal}`, 'sourceTerminal'));
    }
    // Terminal-type mismatch
    if (artifact.sourceTerminal && artifact.type) {
        const allowed = TERMINAL_TYPE_MAP[artifact.sourceTerminal];
        if (allowed && allowed.length > 0 && !allowed.includes(artifact.type)) {
            violations.push(err('terminal-type-mismatch', `Terminal ${artifact.sourceTerminal} cannot produce artifact type ${artifact.type}`, 'type'));
        }
    }
    // POW hash format if provided
    if (artifact.powHash && !HASH_RE.test(artifact.powHash)) {
        violations.push(err('invalid-pow-hash', 'powHash must be a 64-character lowercase hex string', 'powHash'));
    }
    // Verification status
    if (artifact.verificationStatus && !VERIFICATION_STATUS.includes(artifact.verificationStatus)) {
        violations.push(err('invalid-verification-status', `Unknown verification status: ${artifact.verificationStatus}`, 'verificationStatus'));
    }
    return { valid: violations.filter(v => v.severity === 'error').length === 0, violations };
}
export function validateOrThrow(artifact) {
    const result = validate(artifact);
    if (!result.valid) {
        const errors = result.violations.filter(v => v.severity === 'error');
        throw new Error(`Ontology validation failed: ${errors.map(e => e.message).join('; ')}`);
    }
}
// ─── Decision Validators ────────────────────────────────────────────────────
export function validateDecision(decision) {
    const base = validate(decision);
    const violations = [...base.violations];
    const content = decision.content || {};
    if (!content.outcome || !String(content.outcome).trim()) {
        violations.push(err('required-outcome', 'Decision must have a non-empty outcome', 'content.outcome'));
    }
    if (content.decisionType && !DECISION_TYPE.includes(content.decisionType)) {
        violations.push(err('invalid-decision-type', `Unknown decision type: ${content.decisionType}`, 'content.decisionType'));
    }
    if (content.status && !DECISION_STATUS.includes(content.status)) {
        violations.push(err('invalid-decision-status', `Unknown decision status: ${content.status}`, 'content.status'));
    }
    if (!content.contexts || content.contexts.length === 0) {
        violations.push(err('required-contexts', 'Decision must have at least one context', 'content.contexts'));
    }
    if (!content.evidences || content.evidences.length === 0) {
        violations.push(err('required-evidences', 'Decision must have at least one piece of evidence', 'content.evidences'));
    }
    if (content.confidenceLevel !== undefined) {
        if (content.confidenceLevel < 0 || content.confidenceLevel > 1) {
            violations.push(err('invalid-confidence', 'Confidence level must be between 0 and 1', 'content.confidenceLevel'));
        }
    }
    return { valid: violations.filter(v => v.severity === 'error').length === 0, violations };
}
// ─── Memory Bus Event Validators ────────────────────────────────────────────
export function validateMemoryBusEvent(event) {
    const violations = [];
    if (!event.eventId)
        violations.push(err('required-eventId', 'MemoryBusEvent must have an eventId', 'eventId'));
    if (!event.eventType)
        violations.push(err('required-eventType', 'MemoryBusEvent must have an eventType', 'eventType'));
    if (!event.eventTimestamp)
        violations.push(err('required-eventTimestamp', 'MemoryBusEvent must have an eventTimestamp', 'eventTimestamp'));
    if (!event.source)
        violations.push(err('required-source', 'MemoryBusEvent must have a source', 'source'));
    if (!event.payload)
        violations.push(err('required-payload', 'MemoryBusEvent must have a payload', 'payload'));
    if (!event.artifactClass)
        violations.push(err('required-artifactClass', 'MemoryBusEvent must have an artifactClass', 'artifactClass'));
    if (event.eventType && !MEMORY_BUS_EVENT_TYPE.includes(event.eventType)) {
        violations.push(err('invalid-event-type', `Unknown event type: ${event.eventType}`, 'eventType'));
    }
    if (event.source && !ALL_TERMINALS.includes(event.source)) {
        violations.push(err('invalid-source', `Unknown source terminal: ${event.source}`, 'source'));
    }
    if (event.powHash && !HASH_RE.test(event.powHash)) {
        violations.push(err('invalid-pow-hash', 'powHash must be a 64-character lowercase hex string', 'powHash'));
    }
    if (event.eventTimestamp && isNaN(Date.parse(event.eventTimestamp))) {
        violations.push(err('invalid-timestamp', 'eventTimestamp must be a valid ISO 8601 date', 'eventTimestamp'));
    }
    return violations;
}
// ─── OIAS Validators ────────────────────────────────────────────────────────
export function validateSealEvent(event) {
    const violations = [];
    if (!event.eventId)
        violations.push(err('required-eventId', 'SealEvent must have an eventId', 'eventId'));
    if (!event.decisionId)
        violations.push(err('required-decisionId', 'SealEvent must have a decisionId', 'decisionId'));
    if (!event.hash || !HASH_RE.test(event.hash)) {
        violations.push(err('invalid-hash', 'SealEvent hash must be a 64-character lowercase hex string', 'hash'));
    }
    if (!event.sealedAt)
        violations.push(err('required-sealedAt', 'SealEvent must have a sealedAt timestamp', 'sealedAt'));
    if (!event.sealedBy)
        violations.push(err('required-sealedBy', 'SealEvent must have a sealedBy', 'sealedBy'));
    return violations;
}
export function validateLedgerEntry(entry) {
    const violations = [];
    if (!entry.id)
        violations.push(err('required-id', 'LedgerEntry must have an id', 'id'));
    if (!entry.artifactId)
        violations.push(err('required-artifactId', 'LedgerEntry must have an artifactId', 'artifactId'));
    if (!entry.artifactHash || !HASH_RE.test(entry.artifactHash)) {
        violations.push(err('invalid-hash', 'LedgerEntry artifactHash must be a 64-character lowercase hex string', 'artifactHash'));
    }
    if (!entry.timestamp)
        violations.push(err('required-timestamp', 'LedgerEntry must have a timestamp', 'timestamp'));
    return violations;
}
export function validateKnowledgeNode(node) {
    const violations = [];
    const content = node.content || {};
    if (!node.id)
        violations.push(err('required-id', 'KnowledgeNode must have an id', 'id'));
    if (!content.statement || !String(content.statement).trim()) {
        violations.push(err('required-statement', 'KnowledgeNode must have a non-empty statement', 'content.statement'));
    }
    if (!content.category)
        violations.push(err('required-category', 'KnowledgeNode must have a category', 'content.category'));
    if (content.category && !KNOWLEDGE_CATEGORY.includes(content.category)) {
        violations.push(err('invalid-category', `Unknown knowledge category: ${content.category}`, 'content.category'));
    }
    return violations;
}
export function validateRelationshipEdge(edge) {
    const violations = [];
    if (!edge.id)
        violations.push(err('required-id', 'RelationshipEdge must have an id', 'id'));
    if (!edge.sourceId)
        violations.push(err('required-sourceId', 'RelationshipEdge must have a sourceId', 'sourceId'));
    if (!edge.targetId)
        violations.push(err('required-targetId', 'RelationshipEdge must have a targetId', 'targetId'));
    if (!edge.relationType)
        violations.push(err('required-relationType', 'RelationshipEdge must have a relationType', 'relationType'));
    if (edge.relationType && !RELATION_TYPE.includes(edge.relationType)) {
        violations.push(err('invalid-relation-type', `Unknown relation type: ${edge.relationType}`, 'relationType'));
    }
    if (edge.sourceId && edge.targetId && edge.sourceId === edge.targetId) {
        violations.push(err('self-reference', 'RelationshipEdge cannot reference itself', 'targetId'));
    }
    return violations;
}
export function validateVerification(verification) {
    const violations = [];
    if (!verification.id)
        violations.push(err('required-id', 'Verification must have an id', 'id'));
    if (!verification.artifactId)
        violations.push(err('required-artifactId', 'Verification must have an artifactId', 'artifactId'));
    if (!verification.hash || !HASH_RE.test(verification.hash)) {
        violations.push(err('invalid-hash', 'Verification hash must be a 64-character lowercase hex string', 'hash'));
    }
    if (!verification.status)
        violations.push(err('required-status', 'Verification must have a status', 'status'));
    if (verification.status && !VERIFICATION_STATUS.includes(verification.status)) {
        violations.push(err('invalid-status', `Unknown verification status: ${verification.status}`, 'status'));
    }
    return violations;
}
//# sourceMappingURL=constraints.js.map