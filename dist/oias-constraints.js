/**
 * PCOMJR Ontology — OIAS Constraints
 * ====================================
 * TalonSight Technologies
 *
 * Runtime validation for OIAS-specific models.
 * Extends the base constraints.ts validators.
 *
 * Usage:
 *   import { validateKnowledgeNode, validateDecisionTemplate } from './oias-constraints';
 */
// ─────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_REGEX = /^[a-f0-9]{64}$/i;
const ISO8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
function isUUID(v) { return typeof v === 'string' && UUID_REGEX.test(v); }
function isHash(v) { return typeof v === 'string' && SHA256_REGEX.test(v); }
function isISO(v) { return typeof v === 'string' && ISO8601_REGEX.test(v); }
function nonEmpty(v) { return typeof v === 'string' && v.trim().length > 0; }
function inRange(v, min, max) { return v >= min && v <= max; }
const VALID_RELATIONSHIPS = [
    'derivedFrom', 'hasContext', 'supportedBy', 'references', 'verifies',
    'recordedIn', 'detectedIn', 'proposes', 'produces', 'belongsTo',
    'relatedTo', 'blockedBy', 'enables', 'supersedes', 'contradicts',
];
const VALID_INTENTS = [
    'capture-decision', 'verify-artifact', 'query-ledger', 'detect-patterns',
    'propose-workflow', 'route-intent', 'health-check', 'sync-state',
];
// ═══════════════════════════════════════════════
// ARTIFACT MEMORY Validators
// ═══════════════════════════════════════════════
export function validateKnowledgeNode(node) {
    const v = [];
    if (!nonEmpty(node.content.statement)) {
        v.push({ path: 'content.statement', rule: 'statement-required', message: 'Knowledge node must have a non-empty statement.', severity: 'error' });
    }
    if (!nonEmpty(node.content.category)) {
        v.push({ path: 'content.category', rule: 'category-required', message: 'Knowledge node must have a category.', severity: 'error' });
    }
    if (!inRange(node.content.extractionConfidence, 0, 1)) {
        v.push({ path: 'content.extractionConfidence', rule: 'confidence-range', message: 'Extraction confidence must be 0.0–1.0.', severity: 'error' });
    }
    if (!nonEmpty(node.content.sourceSessionId)) {
        v.push({ path: 'content.sourceSessionId', rule: 'source-session-required', message: 'Knowledge node must reference its source session.', severity: 'error' });
    }
    return v;
}
export function validateSessionBrief(brief) {
    const v = [];
    if (!nonEmpty(brief.content.title)) {
        v.push({ path: 'content.title', rule: 'title-required', message: 'Session brief must have a title.', severity: 'error' });
    }
    if (!nonEmpty(brief.content.summary)) {
        v.push({ path: 'content.summary', rule: 'summary-required', message: 'Session brief must have a summary.', severity: 'error' });
    }
    if (!brief.content.terminalsInvolved || brief.content.terminalsInvolved.length === 0) {
        v.push({ path: 'content.terminalsInvolved', rule: 'terminals-required', message: 'Session brief must list at least one terminal involved.', severity: 'error' });
    }
    if (brief.content.nodeCount < 0) {
        v.push({ path: 'content.nodeCount', rule: 'non-negative', message: 'Node count cannot be negative.', severity: 'error' });
    }
    return v;
}
export function validateConstellationCluster(cluster) {
    const v = [];
    if (!nonEmpty(cluster.content.workspaceName)) {
        v.push({ path: 'content.workspaceName', rule: 'workspace-required', message: 'Cluster must name its workspace.', severity: 'error' });
    }
    if (cluster.content.artifactCount < 0) {
        v.push({ path: 'content.artifactCount', rule: 'non-negative', message: 'Artifact count cannot be negative.', severity: 'error' });
    }
    if (!cluster.content.position || typeof cluster.content.position.x !== 'number' || typeof cluster.content.position.y !== 'number') {
        v.push({ path: 'content.position', rule: 'position-required', message: 'Cluster must have x,y position coordinates.', severity: 'error' });
    }
    if (cluster.content.radius <= 0) {
        v.push({ path: 'content.radius', rule: 'positive-radius', message: 'Cluster radius must be positive.', severity: 'error' });
    }
    return v;
}
export function validateRelationshipEdge(edge) {
    const v = [];
    if (!isUUID(edge.content.fromArtifactId)) {
        v.push({ path: 'content.fromArtifactId', rule: 'valid-uuid', message: 'Source artifact must be a valid UUID.', severity: 'error' });
    }
    if (!isUUID(edge.content.toArtifactId)) {
        v.push({ path: 'content.toArtifactId', rule: 'valid-uuid', message: 'Target artifact must be a valid UUID.', severity: 'error' });
    }
    if (edge.content.fromArtifactId === edge.content.toArtifactId) {
        v.push({ path: 'content.toArtifactId', rule: 'no-self-edge', message: 'An artifact cannot have a relationship edge to itself.', severity: 'error' });
    }
    if (!VALID_RELATIONSHIPS.includes(edge.content.relationshipType)) {
        v.push({ path: 'content.relationshipType', rule: 'valid-relationship', message: `Unknown relationship type "${edge.content.relationshipType}".`, severity: 'error' });
    }
    if (!inRange(edge.content.strength, 0, 1)) {
        v.push({ path: 'content.strength', rule: 'strength-range', message: 'Edge strength must be 0.0–1.0.', severity: 'error' });
    }
    return v;
}
export function validateTranscriptIngestion(ingestion) {
    const v = [];
    if (ingestion.content.transcriptLength <= 0) {
        v.push({ path: 'content.transcriptLength', rule: 'positive-length', message: 'Transcript length must be positive.', severity: 'error' });
    }
    if (ingestion.content.nodesExtracted < 0) {
        v.push({ path: 'content.nodesExtracted', rule: 'non-negative', message: 'Nodes extracted cannot be negative.', severity: 'error' });
    }
    if (!nonEmpty(ingestion.content.targetWorkspace)) {
        v.push({ path: 'content.targetWorkspace', rule: 'workspace-required', message: 'Ingestion must target a workspace.', severity: 'error' });
    }
    if (ingestion.content.status === 'failed' && !nonEmpty(ingestion.content.failureReason)) {
        v.push({ path: 'content.failureReason', rule: 'failure-reason-required', message: 'Failed ingestions must include a failure reason.', severity: 'error' });
    }
    return v;
}
// ═══════════════════════════════════════════════
// DECISION INTELLIGENCE OS Validators
// ═══════════════════════════════════════════════
export function validateDecisionTemplate(template) {
    const v = [];
    if (!nonEmpty(template.content.name)) {
        v.push({ path: 'content.name', rule: 'name-required', message: 'Template must have a name.', severity: 'error' });
    }
    if (!template.content.requiredContextFields || template.content.requiredContextFields.length === 0) {
        v.push({ path: 'content.requiredContextFields', rule: 'min-context-fields', message: 'Template must define at least one required context field.', severity: 'error' });
    }
    else {
        template.content.requiredContextFields.forEach((field, i) => {
            if (!nonEmpty(field.name)) {
                v.push({ path: `content.requiredContextFields[${i}].name`, rule: 'field-name-required', message: 'Context field must have a name.', severity: 'error' });
            }
            if (field.fieldType === 'select' || field.fieldType === 'multi-select') {
                if (!field.options || field.options.length === 0) {
                    v.push({ path: `content.requiredContextFields[${i}].options`, rule: 'select-needs-options', message: 'Select/multi-select fields must have options.', severity: 'error' });
                }
            }
        });
    }
    if (template.content.usageCount < 0) {
        v.push({ path: 'content.usageCount', rule: 'non-negative', message: 'Usage count cannot be negative.', severity: 'error' });
    }
    if (template.content.averageConfidence !== undefined && !inRange(template.content.averageConfidence, 0, 1)) {
        v.push({ path: 'content.averageConfidence', rule: 'confidence-range', message: 'Average confidence must be 0.0–1.0.', severity: 'error' });
    }
    return v;
}
export function validateDecisionReview(review) {
    const v = [];
    if (!isUUID(review.content.decisionId)) {
        v.push({ path: 'content.decisionId', rule: 'decision-ref-required', message: 'Review must reference a decision (valid UUID).', severity: 'error' });
    }
    if (review.content.reviewDelayDays < 0) {
        v.push({ path: 'content.reviewDelayDays', rule: 'non-negative', message: 'Review delay cannot be negative.', severity: 'error' });
    }
    if (!inRange(review.content.reviewConfidence, 0, 1)) {
        v.push({ path: 'content.reviewConfidence', rule: 'confidence-range', message: 'Review confidence must be 0.0–1.0.', severity: 'error' });
    }
    if (!nonEmpty(review.content.reviewedBy)) {
        v.push({ path: 'content.reviewedBy', rule: 'reviewer-required', message: 'Review must identify the reviewer.', severity: 'error' });
    }
    return v;
}
export function validateGovernancePolicy(policy) {
    const v = [];
    if (!nonEmpty(policy.content.name)) {
        v.push({ path: 'content.name', rule: 'name-required', message: 'Policy must have a name.', severity: 'error' });
    }
    if (!policy.content.rules || policy.content.rules.length === 0) {
        v.push({ path: 'content.rules', rule: 'min-rules', message: 'Policy must define at least one rule.', severity: 'error' });
    }
    else {
        policy.content.rules.forEach((rule, i) => {
            if (!nonEmpty(rule.ruleId)) {
                v.push({ path: `content.rules[${i}].ruleId`, rule: 'rule-id-required', message: 'Each rule must have an ID.', severity: 'error' });
            }
            if (!nonEmpty(rule.statement)) {
                v.push({ path: `content.rules[${i}].statement`, rule: 'rule-statement-required', message: 'Each rule must have a statement.', severity: 'error' });
            }
        });
    }
    if (!isISO(policy.content.effectiveDate)) {
        v.push({ path: 'content.effectiveDate', rule: 'iso8601', message: 'Effective date must be ISO 8601.', severity: 'error' });
    }
    if (!nonEmpty(policy.content.author)) {
        v.push({ path: 'content.author', rule: 'author-required', message: 'Policy must have an author.', severity: 'error' });
    }
    return v;
}
export function validateApprovalChain(chain) {
    const v = [];
    if (!isUUID(chain.content.decisionId)) {
        v.push({ path: 'content.decisionId', rule: 'decision-ref-required', message: 'Approval chain must reference a decision.', severity: 'error' });
    }
    if (!chain.content.steps || chain.content.steps.length === 0) {
        v.push({ path: 'content.steps', rule: 'min-steps', message: 'Approval chain must have at least one step.', severity: 'error' });
    }
    else {
        // Steps must have sequential order
        const orders = chain.content.steps.map(s => s.order);
        const sorted = [...orders].sort((a, b) => a - b);
        if (JSON.stringify(orders) !== JSON.stringify(sorted)) {
            v.push({ path: 'content.steps', rule: 'sequential-order', message: 'Approval steps must be in sequential order.', severity: 'error' });
        }
        chain.content.steps.forEach((step, i) => {
            if (!nonEmpty(step.approver)) {
                v.push({ path: `content.steps[${i}].approver`, rule: 'approver-required', message: 'Each step must name an approver.', severity: 'error' });
            }
        });
    }
    if (!isISO(chain.content.initiatedAt)) {
        v.push({ path: 'content.initiatedAt', rule: 'iso8601', message: 'initiatedAt must be ISO 8601.', severity: 'error' });
    }
    // If status is approved/rejected, completedAt must exist
    if (['approved', 'rejected'].includes(chain.content.status) && !isISO(chain.content.completedAt)) {
        v.push({ path: 'content.completedAt', rule: 'completion-timestamp', message: 'Approved/rejected chains must have a completedAt timestamp.', severity: 'error' });
    }
    return v;
}
export function validateDecisionImpact(impact) {
    const v = [];
    if (!isUUID(impact.content.decisionId)) {
        v.push({ path: 'content.decisionId', rule: 'decision-ref-required', message: 'Impact tracker must reference a decision.', severity: 'error' });
    }
    if (!impact.content.trackingWindow || !isISO(impact.content.trackingWindow.start)) {
        v.push({ path: 'content.trackingWindow.start', rule: 'tracking-start-required', message: 'Impact tracking must have a start timestamp.', severity: 'error' });
    }
    return v;
}
// ═══════════════════════════════════════════════
// POW LEDGER Validators
// ═══════════════════════════════════════════════
export function validateAuditTrail(trail) {
    const v = [];
    if (!isUUID(trail.content.artifactId)) {
        v.push({ path: 'content.artifactId', rule: 'artifact-ref-required', message: 'Audit trail must reference an artifact.', severity: 'error' });
    }
    if (!trail.content.verifications || trail.content.verifications.length === 0) {
        v.push({ path: 'content.verifications', rule: 'min-verifications', message: 'Audit trail must have at least one verification entry.', severity: 'error' });
    }
    else {
        trail.content.verifications.forEach((entry, i) => {
            if (!isUUID(entry.verificationId)) {
                v.push({ path: `content.verifications[${i}].verificationId`, rule: 'valid-uuid', message: 'Verification ID must be a valid UUID.', severity: 'error' });
            }
            if (!isISO(entry.timestamp)) {
                v.push({ path: `content.verifications[${i}].timestamp`, rule: 'iso8601', message: 'Verification timestamp must be ISO 8601.', severity: 'error' });
            }
            if (!isHash(entry.hashAtVerification)) {
                v.push({ path: `content.verifications[${i}].hashAtVerification`, rule: 'sha256-format', message: 'Hash at verification must be valid SHA-256.', severity: 'error' });
            }
        });
    }
    // Verify/fail counts must match entries
    const expectedVerify = trail.content.verifications.filter(e => e.status === 'verified').length;
    const expectedFail = trail.content.verifications.filter(e => e.status !== 'verified').length;
    if (trail.content.verifyCount !== expectedVerify) {
        v.push({ path: 'content.verifyCount', rule: 'count-consistency', message: `verifyCount (${trail.content.verifyCount}) doesn't match actual verified entries (${expectedVerify}).`, severity: 'warning' });
    }
    if (trail.content.failCount !== expectedFail) {
        v.push({ path: 'content.failCount', rule: 'count-consistency', message: `failCount (${trail.content.failCount}) doesn't match actual failed entries (${expectedFail}).`, severity: 'warning' });
    }
    return v;
}
export function validateIntegrityReport(report) {
    const v = [];
    if (report.content.totalScanned <= 0) {
        v.push({ path: 'content.totalScanned', rule: 'positive-scan-count', message: 'Must scan at least one artifact.', severity: 'error' });
    }
    const { verified, failed, tampered, unverifiable } = report.content.results;
    const sum = verified + failed + tampered + unverifiable;
    if (sum !== report.content.totalScanned) {
        v.push({ path: 'content.results', rule: 'results-sum', message: `Results sum (${sum}) must equal totalScanned (${report.content.totalScanned}).`, severity: 'error' });
    }
    if (!inRange(report.content.integrityScore, 0, 1)) {
        v.push({ path: 'content.integrityScore', rule: 'score-range', message: 'Integrity score must be 0.0–1.0.', severity: 'error' });
    }
    // Verify integrity score matches
    const expectedScore = report.content.totalScanned > 0 ? verified / report.content.totalScanned : 0;
    if (Math.abs(report.content.integrityScore - expectedScore) > 0.001) {
        v.push({ path: 'content.integrityScore', rule: 'score-consistency', message: `Integrity score (${report.content.integrityScore}) should be verified/total (${expectedScore.toFixed(3)}).`, severity: 'warning' });
    }
    return v;
}
export function validateSealEvent(seal) {
    const v = [];
    if (!isUUID(seal.content.artifactId)) {
        v.push({ path: 'content.artifactId', rule: 'artifact-ref-required', message: 'Seal event must reference an artifact.', severity: 'error' });
    }
    if (!isHash(seal.content.sealHash)) {
        v.push({ path: 'content.sealHash', rule: 'sha256-format', message: 'Seal hash must be valid SHA-256.', severity: 'error' });
    }
    if (!nonEmpty(seal.content.captureAgentId)) {
        v.push({ path: 'content.captureAgentId', rule: 'capture-agent-required', message: 'Seal event must identify the Capture Agent.', severity: 'error' });
    }
    if (!isUUID(seal.content.ledgerEntryId)) {
        v.push({ path: 'content.ledgerEntryId', rule: 'ledger-ref-required', message: 'Seal event must reference its ledger entry.', severity: 'error' });
    }
    return v;
}
export function validateA2AMessage(msg) {
    const v = [];
    if (!nonEmpty(msg.content.fromAgent)) {
        v.push({ path: 'content.fromAgent', rule: 'sender-required', message: 'A2A message must identify the sender.', severity: 'error' });
    }
    if (!nonEmpty(msg.content.toAgent)) {
        v.push({ path: 'content.toAgent', rule: 'receiver-required', message: 'A2A message must identify the receiver.', severity: 'error' });
    }
    if (msg.content.fromAgent === msg.content.toAgent) {
        v.push({ path: 'content.toAgent', rule: 'no-self-message', message: 'Agent cannot send A2A messages to itself.', severity: 'error' });
    }
    if (!VALID_INTENTS.includes(msg.content.intent)) {
        v.push({ path: 'content.intent', rule: 'valid-intent', message: `Unknown A2A intent "${msg.content.intent}".`, severity: 'error' });
    }
    if (msg.content.latencyMs < 0) {
        v.push({ path: 'content.latencyMs', rule: 'non-negative', message: 'Latency cannot be negative.', severity: 'error' });
    }
    // If part of a flow, flowStep must be positive
    if (msg.content.flowId && (!msg.content.flowStep || msg.content.flowStep < 1)) {
        v.push({ path: 'content.flowStep', rule: 'positive-flow-step', message: 'Flow step must be a positive integer when flowId is set.', severity: 'error' });
    }
    return v;
}
// ═══════════════════════════════════════════════
// TALON AGENT Validators
// ═══════════════════════════════════════════════
export function validateAgentIdentity(agent) {
    const v = [];
    if (!nonEmpty(agent.content.agentName)) {
        v.push({ path: 'content.agentName', rule: 'name-required', message: 'Agent must have a name.', severity: 'error' });
    }
    if (!nonEmpty(agent.content.role)) {
        v.push({ path: 'content.role', rule: 'role-required', message: 'Agent must have a role description.', severity: 'error' });
    }
    if (!agent.content.permissions || agent.content.permissions.length === 0) {
        v.push({ path: 'content.permissions', rule: 'min-permissions', message: 'Agent must have at least one permission.', severity: 'error' });
    }
    // Single-writer enforcement: only agents with ledger:write can have ledgerWriteAccess
    if (agent.content.ledgerWriteAccess && !agent.content.permissions.includes('ledger:write')) {
        v.push({ path: 'content.ledgerWriteAccess', rule: 'write-permission-required', message: 'ledgerWriteAccess requires the "ledger:write" permission.', severity: 'error' });
    }
    return v;
}
export function validateEventClaim(claim) {
    const v = [];
    if (!nonEmpty(claim.content.eventId)) {
        v.push({ path: 'content.eventId', rule: 'event-id-required', message: 'Claim must reference an event.', severity: 'error' });
    }
    if (!nonEmpty(claim.content.claimingAgentId)) {
        v.push({ path: 'content.claimingAgentId', rule: 'agent-required', message: 'Claim must identify the claiming agent.', severity: 'error' });
    }
    if (!isISO(claim.content.claimedAt)) {
        v.push({ path: 'content.claimedAt', rule: 'iso8601', message: 'claimedAt must be ISO 8601.', severity: 'error' });
    }
    if (!isISO(claim.content.expiresAt)) {
        v.push({ path: 'content.expiresAt', rule: 'iso8601', message: 'expiresAt must be ISO 8601.', severity: 'error' });
    }
    // Expiry must be after claim time
    if (isISO(claim.content.claimedAt) && isISO(claim.content.expiresAt)) {
        if (new Date(claim.content.expiresAt) <= new Date(claim.content.claimedAt)) {
            v.push({ path: 'content.expiresAt', rule: 'expiry-after-claim', message: 'Expiry must be after claim time.', severity: 'error' });
        }
    }
    if (claim.content.status === 'failed' && !nonEmpty(claim.content.failureReason)) {
        v.push({ path: 'content.failureReason', rule: 'failure-reason-required', message: 'Failed claims must include a failure reason.', severity: 'error' });
    }
    if (claim.content.retryCount < 0) {
        v.push({ path: 'content.retryCount', rule: 'non-negative', message: 'Retry count cannot be negative.', severity: 'error' });
    }
    if (claim.content.retryCount > claim.content.maxRetries) {
        v.push({ path: 'content.retryCount', rule: 'retry-limit', message: `Retry count (${claim.content.retryCount}) exceeds max retries (${claim.content.maxRetries}).`, severity: 'error' });
    }
    return v;
}
export function validateTaskDelegation(delegation) {
    const v = [];
    if (!nonEmpty(delegation.content.requestedBy)) {
        v.push({ path: 'content.requestedBy', rule: 'requester-required', message: 'Delegation must identify who requested it.', severity: 'error' });
    }
    if (!nonEmpty(delegation.content.taskDescription)) {
        v.push({ path: 'content.taskDescription', rule: 'task-required', message: 'Delegation must describe the task.', severity: 'error' });
    }
    if (delegation.content.sourceTerminal === delegation.content.targetTerminal) {
        v.push({ path: 'content.targetTerminal', rule: 'cross-terminal', message: 'Task delegation should be cross-terminal. Same-terminal work is internal processing.', severity: 'warning' });
    }
    return v;
}
export function validateOrchestratorRouting(routing) {
    const v = [];
    if (!nonEmpty(routing.content.incomingIntent)) {
        v.push({ path: 'content.incomingIntent', rule: 'intent-required', message: 'Routing must capture the incoming intent.', severity: 'error' });
    }
    if (!VALID_INTENTS.includes(routing.content.classifiedAs)) {
        v.push({ path: 'content.classifiedAs', rule: 'valid-intent', message: `Unknown classified intent "${routing.content.classifiedAs}".`, severity: 'error' });
    }
    if (!inRange(routing.content.classificationConfidence, 0, 1)) {
        v.push({ path: 'content.classificationConfidence', rule: 'confidence-range', message: 'Classification confidence must be 0.0–1.0.', severity: 'error' });
    }
    if (!nonEmpty(routing.content.routedToAgent)) {
        v.push({ path: 'content.routedToAgent', rule: 'target-agent-required', message: 'Routing must identify the target agent.', severity: 'error' });
    }
    if (!nonEmpty(routing.content.rationale)) {
        v.push({ path: 'content.rationale', rule: 'rationale-required', message: 'Routing decision must include a rationale.', severity: 'error' });
    }
    if (routing.content.routingLatencyMs < 0) {
        v.push({ path: 'content.routingLatencyMs', rule: 'non-negative', message: 'Routing latency cannot be negative.', severity: 'error' });
    }
    // Low-confidence routing should be flagged
    if (routing.content.classificationConfidence < 0.5) {
        v.push({ path: 'content.classificationConfidence', rule: 'low-confidence-routing', message: 'Routing confidence below 0.5 — consider requesting clarification.', severity: 'warning' });
    }
    return v;
}
//# sourceMappingURL=oias-constraints.js.map