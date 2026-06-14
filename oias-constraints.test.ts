/**
 * PCOMJR Ontology — OIAS Constraint Tests
 * =========================================
 * TalonSight Technologies
 *
 * Run: npx tsx oias-constraints.test.ts
 */

import assert from 'node:assert';
import {
  validateKnowledgeNode,
  validateSessionBrief,
  validateConstellationCluster,
  validateRelationshipEdge,
  validateTranscriptIngestion,
  validateDecisionTemplate,
  validateDecisionReview,
  validateGovernancePolicy,
  validateApprovalChain,
  validateDecisionImpact,
  validateAuditTrail,
  validateIntegrityReport,
  validateSealEvent,
  validateA2AMessage,
  validateAgentIdentity,
  validateEventClaim,
  validateTaskDelegation,
  validateOrchestratorRouting,
} from './oias-constraints';
import type {
  KnowledgeNode,
  SessionBrief,
  ConstellationCluster,
  RelationshipEdge,
  TranscriptIngestion,
  DecisionTemplate,
  DecisionReview,
  GovernancePolicy,
  ApprovalChain,
  DecisionImpact,
  AuditTrail,
  IntegrityReport,
  SealEvent,
  A2AMessage,
  AgentIdentity,
  EventClaim,
  TaskDelegation,
  OrchestratorRouting,
} from './oias-types';
import type { Artifact } from './pcomjr-types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const sha256 = () => 'a'.repeat(64);
const future = () => new Date(Date.now() + 3600000).toISOString();

function baseArtifact(type: string, terminal: string): Artifact {
  return {
    id: uuid(), type: type as any, hash: sha256(), timestamp: now(),
    sourceTerminal: terminal as any, workspace: 'test', sealed: false,
    content: {}, tags: [],
  };
}

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

function makeKnowledgeNode(overrides: any = {}): KnowledgeNode {
  return {
    ...baseArtifact('knowledge-node', 'artifact-memory'),
    content: {
      statement: 'McpToolset async crashes on Vertex AI',
      category: 'bug-fix',
      extractionConfidence: 0.92,
      sourceSessionId: uuid(),
      originTerminal: 'pow-ledger',
      entities: ['McpToolset', 'Vertex AI'],
      relatedNodeIds: [],
      ...overrides,
    },
  } as KnowledgeNode;
}

function makeSessionBrief(overrides: any = {}): SessionBrief {
  return {
    ...baseArtifact('session-brief', 'artifact-memory'),
    content: {
      title: 'POW Ledger Day 10 Submission',
      summary: 'Final sprint to submit POW Ledger for Google challenge.',
      decisionsIdentified: ['Ship with 6/6 eval'],
      artifactsProduced: [uuid()],
      openItems: [],
      terminalsInvolved: ['pow-ledger'],
      nodeCount: 15,
      generationModel: 'claude-sonnet-4-6',
      ...overrides,
    },
  } as SessionBrief;
}

function makeCluster(overrides: any = {}): ConstellationCluster {
  return {
    ...baseArtifact('constellation-cluster', 'artifact-memory'),
    content: {
      workspaceName: 'POW Ledger',
      terminal: 'pow-ledger',
      artifactCount: 247,
      position: { x: 340, y: 210 },
      radius: 120,
      crossClusterEdges: [],
      colorToken: 'violet-core',
      ...overrides,
    },
  } as ConstellationCluster;
}

function makeEdge(overrides: any = {}): RelationshipEdge {
  return {
    ...baseArtifact('relationship-edge', 'artifact-memory'),
    content: {
      fromArtifactId: uuid(),
      toArtifactId: uuid(),
      relationshipType: 'derivedFrom',
      strength: 0.85,
      origin: 'auto-detected',
      detectionMethod: 'semantic-similarity',
      ...overrides,
    },
  } as RelationshipEdge;
}

function makeIngestion(overrides: any = {}): TranscriptIngestion {
  return {
    ...baseArtifact('transcript-ingestion', 'artifact-memory'),
    content: {
      source: 'claude-ai',
      transcriptLength: 45000,
      nodesExtracted: 23,
      edgesCreated: 18,
      targetWorkspace: 'POW Ledger',
      status: 'completed',
      processingTimeMs: 3200,
      ...overrides,
    },
  } as TranscriptIngestion;
}

function makeTemplate(overrides: any = {}): DecisionTemplate {
  return {
    ...baseArtifact('decision-template', 'decision-intelligence'),
    content: {
      name: 'Architecture Review Before Deployment',
      description: 'Standard review process for system changes.',
      requiredContextFields: [
        { name: 'systemAffected', description: 'Which system is changing', fieldType: 'text', required: true },
        { name: 'riskLevel', description: 'Risk assessment', fieldType: 'select', options: ['low', 'medium', 'high', 'critical'], required: true },
      ],
      requiredEvidenceTypes: [
        { description: 'Eval results', evidenceType: 'agent-analysis', required: true },
      ],
      defaultParticipants: ['jermaine'],
      usageCount: 5,
      averageConfidence: 0.87,
      ...overrides,
    },
  } as DecisionTemplate;
}

function makeReview(overrides: any = {}): DecisionReview {
  return {
    ...baseArtifact('decision-review', 'decision-intelligence'),
    content: {
      decisionId: uuid(),
      reviewDelayDays: 14,
      outcomeAssessment: 'met',
      strengths: ['Fast execution'],
      improvements: ['More testing'],
      wouldRepeat: true,
      reviewConfidence: 0.8,
      reviewedBy: 'jermaine',
      ...overrides,
    },
  } as DecisionReview;
}

function makePolicy(overrides: any = {}): GovernancePolicy {
  return {
    ...baseArtifact('governance-policy', 'decision-intelligence'),
    content: {
      name: 'Minimum Evidence Policy',
      description: 'All decisions require at least 2 evidence artifacts.',
      scope: { global: true },
      rules: [
        { ruleId: 'min-evidence-2', statement: 'Decisions must have >= 2 evidence', target: 'evidence', constraint: { field: 'supportedBy.length', operator: 'min-count', value: 2 }, onViolation: 'warn' },
      ],
      enforcement: 'advisory',
      author: 'jermaine',
      effectiveDate: now(),
      ...overrides,
    },
  } as GovernancePolicy;
}

function makeApprovalChain(overrides: any = {}): ApprovalChain {
  return {
    ...baseArtifact('approval-chain', 'decision-intelligence'),
    content: {
      decisionId: uuid(),
      steps: [
        { order: 1, approver: 'jermaine', status: 'approved', skippable: false, respondedAt: now() },
      ],
      status: 'approved',
      initiatedAt: now(),
      completedAt: now(),
      ...overrides,
    },
  } as ApprovalChain;
}

function makeImpact(overrides: any = {}): DecisionImpact {
  return {
    ...baseArtifact('decision-impact', 'decision-intelligence'),
    content: {
      decisionId: uuid(),
      downstreamArtifactIds: [uuid()],
      terminalsAffected: ['pow-ledger'],
      influencedDecisionIds: [],
      metrics: { evalScore: 6 },
      trackingWindow: { start: now() },
      tracking: true,
      ...overrides,
    },
  } as DecisionImpact;
}

function makeAuditTrail(overrides: any = {}): AuditTrail {
  return {
    ...baseArtifact('audit-trail', 'pow-ledger'),
    content: {
      artifactId: uuid(),
      verifications: [
        { verificationId: uuid(), timestamp: now(), status: 'verified', agentId: 'verification-agent', hashAtVerification: sha256(), hashMatch: true },
      ],
      currentStatus: 'clean',
      verifyCount: 1,
      failCount: 0,
      firstVerified: now(),
      lastVerified: now(),
      ...overrides,
    },
  } as AuditTrail;
}

function makeIntegrityReport(overrides: any = {}): IntegrityReport {
  return {
    ...baseArtifact('integrity-report', 'pow-ledger'),
    content: {
      scope: 'full-ledger',
      totalScanned: 100,
      results: { verified: 95, failed: 3, tampered: 1, unverifiable: 1 },
      integrityScore: 0.95,
      failedArtifactIds: [uuid(), uuid(), uuid()],
      scanDurationMs: 12000,
      initiatedBy: 'scheduled',
      ...overrides,
    },
  } as IntegrityReport;
}

function makeSealEvent(overrides: any = {}): SealEvent {
  return {
    ...baseArtifact('seal-event', 'pow-ledger'),
    content: {
      artifactId: uuid(),
      sealHash: sha256(),
      captureAgentId: 'capture-agent-001',
      ledgerEntryId: uuid(),
      sealTrigger: 'manual',
      ...overrides,
    },
  } as SealEvent;
}

function makeA2AMessage(overrides: any = {}): A2AMessage {
  return {
    ...baseArtifact('a2a-message', 'pow-ledger'),
    content: {
      fromAgent: 'orchestrator',
      toAgent: 'capture-agent',
      intent: 'capture-decision',
      payloadSummary: 'Decision capture request for deployment review',
      responseStatus: 'success',
      latencyMs: 245,
      protocol: 'stream_query',
      ...overrides,
    },
  } as A2AMessage;
}

function makeAgentIdentity(overrides: any = {}): AgentIdentity {
  return {
    ...baseArtifact('agent-execution', 'talon-agent'),
    content: {
      agentName: 'Capture Agent',
      role: 'Single-writer — only agent that mutates the ledger',
      system: 'pow-ledger',
      permissions: ['ledger:write', 'artifact:create', 'artifact:seal', 'decision:capture'],
      canProduce: ['ledger-entry', 'seal-event'],
      canRead: ['decision', 'verification', 'pattern'],
      ledgerWriteAccess: true,
      backingModel: 'gemini-2.5-flash',
      status: 'active',
      ...overrides,
    },
  } as AgentIdentity;
}

function makeEventClaim(overrides: any = {}): EventClaim {
  return {
    ...baseArtifact('event-claim', 'talon-agent'),
    content: {
      eventId: uuid(),
      claimingAgentId: 'capture-agent-001',
      claimedAt: now(),
      expiresAt: future(),
      status: 'processing',
      retryCount: 0,
      maxRetries: 3,
      ...overrides,
    },
  } as EventClaim;
}

function makeDelegation(overrides: any = {}): TaskDelegation {
  return {
    ...baseArtifact('task-delegation', 'talon-agent'),
    content: {
      requestedBy: 'jermaine',
      sourceTerminal: 'decision-intelligence',
      targetTerminal: 'pow-ledger',
      taskDescription: 'Seal the architecture review decision',
      inputArtifactIds: [uuid()],
      outputArtifactIds: [],
      status: 'delegated',
      priority: 'high',
      routingMethod: 'orchestrator-auto',
      ...overrides,
    },
  } as TaskDelegation;
}

function makeRouting(overrides: any = {}): OrchestratorRouting {
  return {
    ...baseArtifact('orchestrator-routing', 'talon-agent'),
    content: {
      incomingIntent: 'Capture a decision about the deployment strategy',
      classifiedAs: 'capture-decision',
      classificationConfidence: 0.94,
      routedToAgent: 'capture-agent-001',
      alternativesConsidered: [
        { agentId: 'verification-agent', score: 0.3, reason: 'Not a verification request' },
      ],
      rationale: 'Intent contains "capture" and "decision" — routing to Capture Agent.',
      routingLatencyMs: 45,
      ...overrides,
    },
  } as OrchestratorRouting;
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

// ═══════════════════════════════════════════════
// ARTIFACT MEMORY
// ═══════════════════════════════════════════════

console.log('\n▸ KnowledgeNode');
test('valid knowledge node passes', () => { assert.strictEqual(validateKnowledgeNode(makeKnowledgeNode()).length, 0); });
test('empty statement fails', () => { assert.ok(validateKnowledgeNode(makeKnowledgeNode({ statement: '' })).some(v => v.rule === 'statement-required')); });
test('missing category fails', () => { assert.ok(validateKnowledgeNode(makeKnowledgeNode({ category: '' })).some(v => v.rule === 'category-required')); });
test('out-of-range confidence fails', () => { assert.ok(validateKnowledgeNode(makeKnowledgeNode({ extractionConfidence: 1.5 })).some(v => v.rule === 'confidence-range')); });
test('missing source session fails', () => { assert.ok(validateKnowledgeNode(makeKnowledgeNode({ sourceSessionId: '' })).some(v => v.rule === 'source-session-required')); });

console.log('\n▸ SessionBrief');
test('valid session brief passes', () => { assert.strictEqual(validateSessionBrief(makeSessionBrief()).length, 0); });
test('empty title fails', () => { assert.ok(validateSessionBrief(makeSessionBrief({ title: '' })).some(v => v.rule === 'title-required')); });
test('empty summary fails', () => { assert.ok(validateSessionBrief(makeSessionBrief({ summary: '' })).some(v => v.rule === 'summary-required')); });
test('no terminals fails', () => { assert.ok(validateSessionBrief(makeSessionBrief({ terminalsInvolved: [] })).some(v => v.rule === 'terminals-required')); });
test('negative node count fails', () => { assert.ok(validateSessionBrief(makeSessionBrief({ nodeCount: -1 })).some(v => v.rule === 'non-negative')); });

console.log('\n▸ ConstellationCluster');
test('valid cluster passes', () => { assert.strictEqual(validateConstellationCluster(makeCluster()).length, 0); });
test('empty workspace fails', () => { assert.ok(validateConstellationCluster(makeCluster({ workspaceName: '' })).some(v => v.rule === 'workspace-required')); });
test('negative artifact count fails', () => { assert.ok(validateConstellationCluster(makeCluster({ artifactCount: -1 })).some(v => v.rule === 'non-negative')); });
test('missing position fails', () => { assert.ok(validateConstellationCluster(makeCluster({ position: null })).some(v => v.rule === 'position-required')); });
test('zero radius fails', () => { assert.ok(validateConstellationCluster(makeCluster({ radius: 0 })).some(v => v.rule === 'positive-radius')); });

console.log('\n▸ RelationshipEdge');
test('valid edge passes', () => { assert.strictEqual(validateRelationshipEdge(makeEdge()).length, 0); });
test('invalid from UUID fails', () => { assert.ok(validateRelationshipEdge(makeEdge({ fromArtifactId: 'bad' })).some(v => v.rule === 'valid-uuid')); });
test('self-edge fails', () => { const id = uuid(); assert.ok(validateRelationshipEdge(makeEdge({ fromArtifactId: id, toArtifactId: id })).some(v => v.rule === 'no-self-edge')); });
test('unknown relationship type fails', () => { assert.ok(validateRelationshipEdge(makeEdge({ relationshipType: 'likes' })).some(v => v.rule === 'valid-relationship')); });
test('out-of-range strength fails', () => { assert.ok(validateRelationshipEdge(makeEdge({ strength: 2.0 })).some(v => v.rule === 'strength-range')); });

console.log('\n▸ TranscriptIngestion');
test('valid ingestion passes', () => { assert.strictEqual(validateTranscriptIngestion(makeIngestion()).length, 0); });
test('zero length fails', () => { assert.ok(validateTranscriptIngestion(makeIngestion({ transcriptLength: 0 })).some(v => v.rule === 'positive-length')); });
test('failed without reason fails', () => { assert.ok(validateTranscriptIngestion(makeIngestion({ status: 'failed' })).some(v => v.rule === 'failure-reason-required')); });
test('failed with reason passes', () => { assert.strictEqual(validateTranscriptIngestion(makeIngestion({ status: 'failed', failureReason: 'Token limit exceeded' })).length, 0); });

// ═══════════════════════════════════════════════
// DECISION INTELLIGENCE OS
// ═══════════════════════════════════════════════

console.log('\n▸ DecisionTemplate');
test('valid template passes', () => { assert.strictEqual(validateDecisionTemplate(makeTemplate()).length, 0); });
test('empty name fails', () => { assert.ok(validateDecisionTemplate(makeTemplate({ name: '' })).some(v => v.rule === 'name-required')); });
test('no context fields fails', () => { assert.ok(validateDecisionTemplate(makeTemplate({ requiredContextFields: [] })).some(v => v.rule === 'min-context-fields')); });
test('select without options fails', () => {
  const t = makeTemplate({ requiredContextFields: [{ name: 'risk', description: 'Risk', fieldType: 'select', required: true }] });
  assert.ok(validateDecisionTemplate(t).some(v => v.rule === 'select-needs-options'));
});
test('negative usage count fails', () => { assert.ok(validateDecisionTemplate(makeTemplate({ usageCount: -1 })).some(v => v.rule === 'non-negative')); });

console.log('\n▸ DecisionReview');
test('valid review passes', () => { assert.strictEqual(validateDecisionReview(makeReview()).length, 0); });
test('invalid decision ref fails', () => { assert.ok(validateDecisionReview(makeReview({ decisionId: 'bad' })).some(v => v.rule === 'decision-ref-required')); });
test('negative delay fails', () => { assert.ok(validateDecisionReview(makeReview({ reviewDelayDays: -1 })).some(v => v.rule === 'non-negative')); });
test('out-of-range review confidence fails', () => { assert.ok(validateDecisionReview(makeReview({ reviewConfidence: 1.5 })).some(v => v.rule === 'confidence-range')); });
test('missing reviewer fails', () => { assert.ok(validateDecisionReview(makeReview({ reviewedBy: '' })).some(v => v.rule === 'reviewer-required')); });

console.log('\n▸ GovernancePolicy');
test('valid policy passes', () => { assert.strictEqual(validateGovernancePolicy(makePolicy()).length, 0); });
test('empty name fails', () => { assert.ok(validateGovernancePolicy(makePolicy({ name: '' })).some(v => v.rule === 'name-required')); });
test('no rules fails', () => { assert.ok(validateGovernancePolicy(makePolicy({ rules: [] })).some(v => v.rule === 'min-rules')); });
test('missing author fails', () => { assert.ok(validateGovernancePolicy(makePolicy({ author: '' })).some(v => v.rule === 'author-required')); });

console.log('\n▸ ApprovalChain');
test('valid chain passes', () => { assert.strictEqual(validateApprovalChain(makeApprovalChain()).length, 0); });
test('invalid decision ref fails', () => { assert.ok(validateApprovalChain(makeApprovalChain({ decisionId: 'bad' })).some(v => v.rule === 'decision-ref-required')); });
test('no steps fails', () => { assert.ok(validateApprovalChain(makeApprovalChain({ steps: [] })).some(v => v.rule === 'min-steps')); });
test('approved without completedAt fails', () => { assert.ok(validateApprovalChain(makeApprovalChain({ status: 'approved', completedAt: undefined })).some(v => v.rule === 'completion-timestamp')); });
test('out-of-order steps fails', () => {
  const chain = makeApprovalChain({ steps: [{ order: 2, approver: 'a', status: 'pending', skippable: false }, { order: 1, approver: 'b', status: 'pending', skippable: false }] });
  assert.ok(validateApprovalChain(chain).some(v => v.rule === 'sequential-order'));
});

console.log('\n▸ DecisionImpact');
test('valid impact passes', () => { assert.strictEqual(validateDecisionImpact(makeImpact()).length, 0); });
test('invalid decision ref fails', () => { assert.ok(validateDecisionImpact(makeImpact({ decisionId: 'bad' })).some(v => v.rule === 'decision-ref-required')); });

// ═══════════════════════════════════════════════
// POW LEDGER
// ═══════════════════════════════════════════════

console.log('\n▸ AuditTrail');
test('valid audit trail passes', () => { const v = validateAuditTrail(makeAuditTrail()); assert.strictEqual(v.filter(x => x.severity === 'error').length, 0); });
test('invalid artifact ref fails', () => { assert.ok(validateAuditTrail(makeAuditTrail({ artifactId: 'bad' })).some(v => v.rule === 'artifact-ref-required')); });
test('empty verifications fails', () => { assert.ok(validateAuditTrail(makeAuditTrail({ verifications: [] })).some(v => v.rule === 'min-verifications')); });
test('invalid hash in verification entry fails', () => {
  const trail = makeAuditTrail({ verifications: [{ verificationId: uuid(), timestamp: now(), status: 'verified', agentId: 'x', hashAtVerification: 'bad', hashMatch: true }] });
  assert.ok(validateAuditTrail(trail).some(v => v.rule === 'sha256-format'));
});

console.log('\n▸ IntegrityReport');
test('valid report passes', () => { const v = validateIntegrityReport(makeIntegrityReport()); assert.strictEqual(v.filter(x => x.severity === 'error').length, 0); });
test('zero scanned fails', () => { assert.ok(validateIntegrityReport(makeIntegrityReport({ totalScanned: 0 })).some(v => v.rule === 'positive-scan-count')); });
test('results sum mismatch fails', () => {
  const r = makeIntegrityReport({ totalScanned: 50, results: { verified: 95, failed: 3, tampered: 1, unverifiable: 1 } });
  assert.ok(validateIntegrityReport(r).some(v => v.rule === 'results-sum'));
});

console.log('\n▸ SealEvent');
test('valid seal passes', () => { assert.strictEqual(validateSealEvent(makeSealEvent()).length, 0); });
test('invalid seal hash fails', () => { assert.ok(validateSealEvent(makeSealEvent({ sealHash: 'bad' })).some(v => v.rule === 'sha256-format')); });
test('missing capture agent fails', () => { assert.ok(validateSealEvent(makeSealEvent({ captureAgentId: '' })).some(v => v.rule === 'capture-agent-required')); });

console.log('\n▸ A2AMessage');
test('valid A2A message passes', () => { assert.strictEqual(validateA2AMessage(makeA2AMessage()).length, 0); });
test('missing sender fails', () => { assert.ok(validateA2AMessage(makeA2AMessage({ fromAgent: '' })).some(v => v.rule === 'sender-required')); });
test('self-message fails', () => { assert.ok(validateA2AMessage(makeA2AMessage({ fromAgent: 'x', toAgent: 'x' })).some(v => v.rule === 'no-self-message')); });
test('unknown intent fails', () => { assert.ok(validateA2AMessage(makeA2AMessage({ intent: 'dance' })).some(v => v.rule === 'valid-intent')); });
test('flow without step fails', () => { assert.ok(validateA2AMessage(makeA2AMessage({ flowId: uuid(), flowStep: 0 })).some(v => v.rule === 'positive-flow-step')); });

// ═══════════════════════════════════════════════
// TALON AGENT
// ═══════════════════════════════════════════════

console.log('\n▸ AgentIdentity');
test('valid agent passes', () => { assert.strictEqual(validateAgentIdentity(makeAgentIdentity()).length, 0); });
test('empty name fails', () => { assert.ok(validateAgentIdentity(makeAgentIdentity({ agentName: '' })).some(v => v.rule === 'name-required')); });
test('empty role fails', () => { assert.ok(validateAgentIdentity(makeAgentIdentity({ role: '' })).some(v => v.rule === 'role-required')); });
test('no permissions fails', () => { assert.ok(validateAgentIdentity(makeAgentIdentity({ permissions: [] })).some(v => v.rule === 'min-permissions')); });
test('ledger write without permission fails', () => {
  assert.ok(validateAgentIdentity(makeAgentIdentity({ ledgerWriteAccess: true, permissions: ['artifact:create'] })).some(v => v.rule === 'write-permission-required'));
});

console.log('\n▸ EventClaim');
test('valid claim passes', () => { assert.strictEqual(validateEventClaim(makeEventClaim()).length, 0); });
test('missing event ID fails', () => { assert.ok(validateEventClaim(makeEventClaim({ eventId: '' })).some(v => v.rule === 'event-id-required')); });
test('expiry before claim fails', () => {
  const past = new Date(Date.now() - 3600000).toISOString();
  assert.ok(validateEventClaim(makeEventClaim({ claimedAt: now(), expiresAt: past })).some(v => v.rule === 'expiry-after-claim'));
});
test('failed without reason fails', () => { assert.ok(validateEventClaim(makeEventClaim({ status: 'failed' })).some(v => v.rule === 'failure-reason-required')); });
test('retry exceeds max fails', () => { assert.ok(validateEventClaim(makeEventClaim({ retryCount: 5, maxRetries: 3 })).some(v => v.rule === 'retry-limit')); });

console.log('\n▸ TaskDelegation');
test('valid delegation passes', () => { assert.strictEqual(validateTaskDelegation(makeDelegation()).length, 0); });
test('missing requester fails', () => { assert.ok(validateTaskDelegation(makeDelegation({ requestedBy: '' })).some(v => v.rule === 'requester-required')); });
test('missing task description fails', () => { assert.ok(validateTaskDelegation(makeDelegation({ taskDescription: '' })).some(v => v.rule === 'task-required')); });
test('same-terminal delegation warns', () => {
  const d = makeDelegation({ sourceTerminal: 'pow-ledger', targetTerminal: 'pow-ledger' });
  const warning = validateTaskDelegation(d).find(v => v.rule === 'cross-terminal');
  assert.ok(warning);
  assert.strictEqual(warning!.severity, 'warning');
});

console.log('\n▸ OrchestratorRouting');
test('valid routing passes', () => { assert.strictEqual(validateOrchestratorRouting(makeRouting()).length, 0); });
test('empty intent fails', () => { assert.ok(validateOrchestratorRouting(makeRouting({ incomingIntent: '' })).some(v => v.rule === 'intent-required')); });
test('unknown classified intent fails', () => { assert.ok(validateOrchestratorRouting(makeRouting({ classifiedAs: 'sing-a-song' })).some(v => v.rule === 'valid-intent')); });
test('missing target agent fails', () => { assert.ok(validateOrchestratorRouting(makeRouting({ routedToAgent: '' })).some(v => v.rule === 'target-agent-required')); });
test('missing rationale fails', () => { assert.ok(validateOrchestratorRouting(makeRouting({ rationale: '' })).some(v => v.rule === 'rationale-required')); });
test('low confidence routing warns', () => {
  const warning = validateOrchestratorRouting(makeRouting({ classificationConfidence: 0.3 })).find(v => v.rule === 'low-confidence-routing');
  assert.ok(warning);
  assert.strictEqual(warning!.severity, 'warning');
});

// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────

console.log(`\n${'─'.repeat(48)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
else console.log('All OIAS ontology constraints verified. ✓\n');
