/**
 * PCOMJR Ontology — OIAS Models
 * ==============================
 * TalonSight Technologies
 *
 * Internal data models for the four OIAS systems:
 *   • Artifact Memory    (Knowledge layer)
 *   • Decision Intel OS  (Judgment layer)
 *   • POW Ledger         (Trust layer)
 *   • Talon Agent        (Orchestration layer)
 *
 * These extend the base ontology in pcomjr-types.ts.
 * Import both:
 *   import type { Artifact, Decision } from './pcomjr-types';
 *   import type { KnowledgeNode, DecisionTemplate, AgentIdentity } from './oias-types';
 */

import type {
  Artifact,
  ArtifactType,
  Decision,
  Context,
  Evidence,
  Verification,
  LedgerEntry,
  Pattern,
  WorkflowProposal,
  TerminalId,
} from './pcomjr-types';

// ─────────────────────────────────────────────
// Extended ArtifactType (OIAS additions)
// ─────────────────────────────────────────────

/**
 * OIAS-specific artifact types.
 * Append these to the base ArtifactType union.
 */
export type OIASArtifactType =
  // Artifact Memory
  | 'knowledge-node'
  | 'session-brief'
  | 'constellation-cluster'
  | 'relationship-edge'
  | 'transcript-ingestion'
  // Decision Intelligence OS
  | 'decision-template'
  | 'decision-review'
  | 'governance-policy'
  | 'approval-chain'
  | 'decision-impact'
  // POW Ledger
  | 'audit-trail'
  | 'integrity-report'
  | 'seal-event'
  | 'a2a-message'
  // Talon Agent
  | 'agent-execution'
  | 'event-claim'
  | 'task-delegation'
  | 'orchestrator-routing';

/** Combined type for the full ontology. */
export type FullArtifactType = ArtifactType | OIASArtifactType;

// ═══════════════════════════════════════════════
// ARTIFACT MEMORY — Knowledge Layer
// "What happened?"
// ═══════════════════════════════════════════════

/**
 * KnowledgeNode — a discrete piece of knowledge extracted
 * from an AI chat transcript or terminal session.
 *
 * This is what Artifact Memory *actually produces* when it
 * ingests a transcript. Each node is an Artifact that can
 * be referenced by Evidence, verified by POW Ledger, and
 * visualized in the constellation.
 */
export interface KnowledgeNode extends Artifact {
  type: 'knowledge-node';
  sourceTerminal: 'artifact-memory';
  content: {
    /** The extracted knowledge statement. */
    statement: string;
    /** Category of knowledge (architecture, decision, bug, feature, etc.). */
    category: KnowledgeCategory;
    /** Confidence that extraction is accurate (0.0–1.0). */
    extractionConfidence: number;
    /** Source transcript or session ID. */
    sourceSessionId: string;
    /** Terminal the original work occurred in. */
    originTerminal: TerminalId;
    /** Entity names mentioned (people, tools, systems). */
    entities: string[];
    /** Related knowledge node IDs for graph edges. */
    relatedNodeIds: string[];
  };
}

export type KnowledgeCategory =
  | 'architecture'
  | 'decision'
  | 'bug-fix'
  | 'feature'
  | 'pattern'
  | 'requirement'
  | 'insight'
  | 'blocker'
  | 'milestone'
  | 'question'
  | 'action-item';

/**
 * SessionBrief — a generated summary of an entire
 * chat session, produced by Claude Sonnet API.
 */
export interface SessionBrief extends Artifact {
  type: 'session-brief';
  sourceTerminal: 'artifact-memory';
  content: {
    /** Human-readable title for the session. */
    title: string;
    /** Executive summary (2-3 sentences). */
    summary: string;
    /** Key decisions made during the session. */
    decisionsIdentified: string[];
    /** Artifacts produced or modified. */
    artifactsProduced: string[];
    /** Unresolved items or open questions. */
    openItems: string[];
    /** Terminal(s) involved in this session. */
    terminalsInvolved: TerminalId[];
    /** Number of knowledge nodes extracted. */
    nodeCount: number;
    /** Model used for brief generation. */
    generationModel: string;
  };
}

/**
 * ConstellationCluster — a workspace grouping in the
 * D3 force-directed constellation visualization.
 *
 * Tracks the visual and semantic properties of each
 * star cluster. When a workspace star is dragged,
 * orbital nodes re-cluster around it.
 */
export interface ConstellationCluster extends Artifact {
  type: 'constellation-cluster';
  sourceTerminal: 'artifact-memory';
  content: {
    /** Workspace this cluster represents. */
    workspaceName: string;
    /** Terminal this workspace belongs to. */
    terminal: TerminalId;
    /** Number of artifacts in this cluster. */
    artifactCount: number;
    /** Centroid position (for layout persistence). */
    position: { x: number; y: number };
    /** Cluster radius in visualization units. */
    radius: number;
    /** Connections to other clusters (cross-workspace edges). */
    crossClusterEdges: Array<{
      targetClusterId: string;
      edgeCount: number;
      strongestRelationship: string;
    }>;
    /** Color token from the Afro-futuristic design system. */
    colorToken: string;
  };
}

/**
 * RelationshipEdge — a typed connection between two
 * artifacts in the knowledge graph.
 *
 * Without this, the constellation is just nodes.
 * With it, every edge has a name, a direction, and a
 * strength that the visualization can render.
 */
export interface RelationshipEdge extends Artifact {
  type: 'relationship-edge';
  sourceTerminal: 'artifact-memory';
  content: {
    /** Source artifact ID. */
    fromArtifactId: string;
    /** Target artifact ID. */
    toArtifactId: string;
    /** Named relationship from the ontology. */
    relationshipType: OntologyRelationship;
    /** Strength/confidence of this edge (0.0–1.0). */
    strength: number;
    /** Whether this edge was human-confirmed or auto-detected. */
    origin: 'auto-detected' | 'human-confirmed' | 'ontology-inferred';
    /** If auto-detected, the method used. */
    detectionMethod?: 'co-occurrence' | 'entity-match' | 'semantic-similarity' | 'explicit-reference';
  };
}

/** Named relationships that can appear as edge types. */
export type OntologyRelationship =
  | 'derivedFrom'
  | 'hasContext'
  | 'supportedBy'
  | 'references'
  | 'verifies'
  | 'recordedIn'
  | 'detectedIn'
  | 'proposes'
  | 'produces'
  | 'belongsTo'
  | 'relatedTo'
  | 'blockedBy'
  | 'enables'
  | 'supersedes'
  | 'contradicts';

/**
 * TranscriptIngestion — a record of a processed transcript.
 * Tracks what was ingested, how many nodes were extracted,
 * and whether the ingestion succeeded.
 */
export interface TranscriptIngestion extends Artifact {
  type: 'transcript-ingestion';
  sourceTerminal: 'artifact-memory';
  content: {
    /** Source of the transcript (claude-ai, terminal-session, manual-upload). */
    source: 'claude-ai' | 'terminal-session' | 'manual-upload';
    /** Original transcript length in characters. */
    transcriptLength: number;
    /** Number of knowledge nodes extracted. */
    nodesExtracted: number;
    /** Number of relationship edges created. */
    edgesCreated: number;
    /** Session brief ID if one was generated. */
    sessionBriefId?: string;
    /** Workspace the nodes were placed in. */
    targetWorkspace: string;
    /** Processing status. */
    status: 'completed' | 'partial' | 'failed';
    /** If failed or partial, reason. */
    failureReason?: string;
    /** Processing duration in milliseconds. */
    processingTimeMs: number;
  };
}

// ═══════════════════════════════════════════════
// DECISION INTELLIGENCE OS — Judgment Layer
// "Why did we act?"
// ═══════════════════════════════════════════════

/**
 * DecisionTemplate — a reusable structure for recurring
 * decision types. Derived from Patterns when a WorkflowProposal
 * is adopted.
 *
 * Example: "Architecture Review Before Deployment" becomes a
 * template with required context fields (system affected, risk
 * level, rollback plan) and required evidence types.
 */
export interface DecisionTemplate extends Artifact {
  type: 'decision-template';
  sourceTerminal: 'decision-intelligence';
  content: {
    /** Human-readable template name. */
    name: string;
    /** When to use this template. */
    description: string;
    /** Pattern this template was derived from, if any. */
    sourcePatternId?: string;
    /** Required context fields — the decision-maker must fill these. */
    requiredContextFields: Array<{
      name: string;
      description: string;
      fieldType: 'text' | 'number' | 'boolean' | 'select' | 'multi-select';
      options?: string[];  // For select/multi-select
      required: boolean;
    }>;
    /** Required evidence types — what evidence must be attached. */
    requiredEvidenceTypes: EvidenceRequirement[];
    /** Default participants for decisions using this template. */
    defaultParticipants: string[];
    /** How many times this template has been used. */
    usageCount: number;
    /** Average confidence of decisions made with this template. */
    averageConfidence: number;
  };
}

export interface EvidenceRequirement {
  description: string;
  evidenceType: 'artifact-ref' | 'external-data' | 'human-input' | 'agent-analysis';
  /** Which terminal(s) the evidence typically comes from. */
  expectedSourceTerminals?: TerminalId[];
  required: boolean;
}

/**
 * DecisionReview — a retrospective analysis of a past decision.
 * Was it the right call? What would we do differently?
 *
 * This closes the feedback loop: Decision → Outcome → Review → Better Template.
 */
export interface DecisionReview extends Artifact {
  type: 'decision-review';
  sourceTerminal: 'decision-intelligence';
  content: {
    /** The decision being reviewed. */
    decisionId: string;
    /** Time elapsed since the decision. */
    reviewDelayDays: number;
    /** Did the outcome match expectations? */
    outcomeAssessment: 'exceeded' | 'met' | 'partially-met' | 'missed' | 'unknown';
    /** What went well. */
    strengths: string[];
    /** What could improve. */
    improvements: string[];
    /** Would we make the same decision again? */
    wouldRepeat: boolean;
    /** Confidence in this review (0.0–1.0). */
    reviewConfidence: number;
    /** If the decision used a template, was the template helpful? */
    templateEffectiveness?: 'very-helpful' | 'somewhat-helpful' | 'neutral' | 'unhelpful';
    /** Recommended template modifications based on this review. */
    templateModifications?: string[];
    /** Reviewer identity. */
    reviewedBy: string;
  };
}

/**
 * GovernancePolicy — rules governing how decisions are made
 * within a workspace or across the platform.
 *
 * Examples:
 *   - "All architecture decisions require at least 2 evidence artifacts"
 *   - "Deployment decisions require an approval chain"
 *   - "Decisions affecting multiple terminals must include cross-terminal context"
 */
export interface GovernancePolicy extends Artifact {
  type: 'governance-policy';
  sourceTerminal: 'decision-intelligence';
  content: {
    /** Policy name. */
    name: string;
    /** What this policy governs. */
    description: string;
    /** Scope: which workspaces/terminals this applies to. */
    scope: {
      workspaces?: string[];
      terminals?: TerminalId[];
      global: boolean;
    };
    /** Rules expressed as constraint checks. */
    rules: PolicyRule[];
    /** Whether this policy is actively enforced or advisory. */
    enforcement: 'enforced' | 'advisory';
    /** Who created/approved this policy. */
    author: string;
    /** When this policy takes effect. */
    effectiveDate: string;
    /** When this policy expires, if ever. */
    expirationDate?: string;
  };
}

export interface PolicyRule {
  /** Rule identifier. */
  ruleId: string;
  /** Human-readable rule statement. */
  statement: string;
  /** What the rule checks against. */
  target: 'decision' | 'evidence' | 'context' | 'approval' | 'artifact';
  /** The constraint expression. */
  constraint: {
    field: string;
    operator: 'exists' | 'min-count' | 'max-count' | 'equals' | 'contains' | 'not-empty';
    value: string | number | boolean;
  };
  /** What happens when violated. */
  onViolation: 'block' | 'warn' | 'log';
}

/**
 * ApprovalChain — a sequence of approvals required for
 * a decision before it can be sealed.
 *
 * This is the governance bridge between Decision Intelligence
 * and POW Ledger — a decision can't be sealed until its
 * approval chain is complete.
 */
export interface ApprovalChain extends Artifact {
  type: 'approval-chain';
  sourceTerminal: 'decision-intelligence';
  content: {
    /** The decision requiring approval. */
    decisionId: string;
    /** Governance policy that triggered this chain. */
    policyId?: string;
    /** Ordered approval steps. */
    steps: ApprovalStep[];
    /** Overall chain status. */
    status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'expired';
    /** When the chain was initiated. */
    initiatedAt: string;
    /** When the chain was completed (approved or rejected). */
    completedAt?: string;
    /** Deadline for all approvals. */
    deadline?: string;
  };
}

export interface ApprovalStep {
  order: number;
  approver: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment?: string;
  respondedAt?: string;
  /** Can this step be skipped if the approver is unavailable? */
  skippable: boolean;
}

/**
 * DecisionImpact — tracks the downstream effects of a
 * decision across terminals and time.
 *
 * Created asynchronously after a decision is made. Updated
 * as artifacts referencing the decision are produced.
 */
export interface DecisionImpact extends Artifact {
  type: 'decision-impact';
  sourceTerminal: 'decision-intelligence';
  content: {
    /** The decision being tracked. */
    decisionId: string;
    /** Artifacts that were created as a result of this decision. */
    downstreamArtifactIds: string[];
    /** Terminals affected by this decision. */
    terminalsAffected: TerminalId[];
    /** Decisions that were influenced by this one. */
    influencedDecisionIds: string[];
    /** Quantitative impact metrics (domain-specific). */
    metrics: Record<string, number>;
    /** Time span of tracked impact. */
    trackingWindow: {
      start: string;
      end?: string;
    };
    /** Whether impact tracking is still active. */
    tracking: boolean;
  };
}

// ═══════════════════════════════════════════════
// POW LEDGER — Trust Layer
// "Can we prove it?"
// ═══════════════════════════════════════════════

/**
 * AuditTrail — complete verification history for a
 * single artifact across its lifecycle.
 *
 * Every time an artifact is verified, the result is
 * appended to its audit trail. This makes integrity
 * over time visible, not just point-in-time.
 */
export interface AuditTrail extends Artifact {
  type: 'audit-trail';
  sourceTerminal: 'pow-ledger';
  content: {
    /** The artifact being audited. */
    artifactId: string;
    /** Ordered verification events. */
    verifications: AuditEntry[];
    /** Current integrity status. */
    currentStatus: 'clean' | 'degraded' | 'tampered' | 'unverified';
    /** Number of successful verifications. */
    verifyCount: number;
    /** Number of failed verifications. */
    failCount: number;
    /** First and last verification timestamps. */
    firstVerified: string;
    lastVerified: string;
  };
}

export interface AuditEntry {
  verificationId: string;
  timestamp: string;
  status: 'verified' | 'failed' | 'tampered';
  agentId: string;
  /** Hash at verification time. */
  hashAtVerification: string;
  /** Whether hash matched the sealed hash. */
  hashMatch: boolean;
  /** Additional notes from the verification agent. */
  notes?: string;
}

/**
 * IntegrityReport — periodic scan of the entire ledger
 * or a subset, checking all sealed artifacts.
 *
 * Like a health check for the trust layer.
 */
export interface IntegrityReport extends Artifact {
  type: 'integrity-report';
  sourceTerminal: 'pow-ledger';
  content: {
    /** Scope of the scan. */
    scope: 'full-ledger' | 'workspace' | 'terminal' | 'time-range';
    /** Filter applied (workspace name, terminal ID, or date range). */
    scopeFilter?: string;
    /** Total artifacts scanned. */
    totalScanned: number;
    /** Results breakdown. */
    results: {
      verified: number;
      failed: number;
      tampered: number;
      unverifiable: number;
    };
    /** Integrity score (verified / totalScanned). */
    integrityScore: number;
    /** Artifacts that failed verification (for follow-up). */
    failedArtifactIds: string[];
    /** Scan duration in milliseconds. */
    scanDurationMs: number;
    /** Scan initiated by (scheduled or manual). */
    initiatedBy: 'scheduled' | 'manual';
  };
}

/**
 * SealEvent — the act of cryptographically sealing
 * an artifact. Records the transition from unsealed
 * to sealed with full provenance.
 *
 * CONSTRAINT: Once a SealEvent exists for an artifact,
 * that artifact's hash is immutable.
 */
export interface SealEvent extends Artifact {
  type: 'seal-event';
  sourceTerminal: 'pow-ledger';
  content: {
    /** The artifact being sealed. */
    artifactId: string;
    /** The SHA-256 hash computed at seal time. */
    sealHash: string;
    /** The Capture Agent that performed the seal. */
    captureAgentId: string;
    /** The ledger entry created for this seal. */
    ledgerEntryId: string;
    /** Pre-seal state hash (for delta verification). */
    preSealHash?: string;
    /** Reason for sealing (manual, auto-threshold, governance). */
    sealTrigger: 'manual' | 'auto-threshold' | 'governance-policy' | 'approval-complete';
    /** Governance policy that triggered the seal, if applicable. */
    triggerPolicyId?: string;
  };
}

/**
 * A2AMessage — a typed inter-agent communication record.
 *
 * Every message sent between agents via the A2A protocol
 * (through the FastMCP server on Cloud Run) is recorded
 * as an artifact. This makes agent communication auditable.
 *
 * Maps directly to the stream_query calls in the
 * Orchestrator → Capture/Verification agent flow.
 */
export interface A2AMessage extends Artifact {
  type: 'a2a-message';
  sourceTerminal: 'pow-ledger';
  content: {
    /** Sending agent identity. */
    fromAgent: string;
    /** Receiving agent identity. */
    toAgent: string;
    /** Message intent (what the sender is asking for). */
    intent: A2AIntent;
    /** The payload sent (sanitized — no secrets). */
    payloadSummary: string;
    /** Response status from the receiving agent. */
    responseStatus: 'success' | 'error' | 'timeout' | 'rejected';
    /** Round-trip time in milliseconds. */
    latencyMs: number;
    /** Protocol used (stream_query, direct HTTP, etc.). */
    protocol: 'stream_query' | 'direct_http' | 'streamable_http';
    /** If the message was part of a multi-step flow, the flow ID. */
    flowId?: string;
    /** Step number within the flow. */
    flowStep?: number;
  };
}

export type A2AIntent =
  | 'capture-decision'
  | 'verify-artifact'
  | 'query-ledger'
  | 'detect-patterns'
  | 'propose-workflow'
  | 'route-intent'
  | 'health-check'
  | 'sync-state';

// ═══════════════════════════════════════════════
// TALON AGENT — Orchestration Layer
// ═══════════════════════════════════════════════

/**
 * AgentIdentity — registered agent with permissions
 * and capability declarations.
 *
 * Every agent in the system (Orchestrator, Capture,
 * Verification, plus future agents) must have an
 * identity record. This is the agent ontology.
 */
export interface AgentIdentity extends Artifact {
  type: 'agent-execution';  // Reusing existing type
  sourceTerminal: 'talon-agent';
  content: {
    /** Agent's unique name. */
    agentName: string;
    /** What this agent does. */
    role: string;
    /** Which system this agent belongs to. */
    system: TerminalId;
    /** Permissions this agent has. */
    permissions: AgentPermission[];
    /** What artifact types this agent can create. */
    canProduce: FullArtifactType[];
    /** What artifact types this agent can read. */
    canRead: FullArtifactType[];
    /** Whether this agent has write access to the ledger. */
    ledgerWriteAccess: boolean;
    /** Model backing this agent (e.g., gemini-2.5-flash). */
    backingModel?: string;
    /** Deployment location (e.g., Vertex AI Agent Engine ID). */
    deploymentId?: string;
    /** Current status. */
    status: 'active' | 'inactive' | 'degraded' | 'retired';
    /** Last heartbeat timestamp. */
    lastHeartbeat?: string;
  };
}

export type AgentPermission =
  | 'ledger:write'
  | 'ledger:read'
  | 'artifact:create'
  | 'artifact:seal'
  | 'decision:capture'
  | 'verification:execute'
  | 'pattern:detect'
  | 'workflow:propose'
  | 'agent:route'
  | 'memory:ingest'
  | 'memory:query';

/**
 * EventClaim — atomic claim of an event for processing.
 *
 * Uses SELECT FOR UPDATE SKIP LOCKED pattern to prevent
 * race conditions when multiple agents compete for events.
 * This is the Mastra-based event claiming model.
 */
export interface EventClaim extends Artifact {
  type: 'event-claim';
  sourceTerminal: 'talon-agent';
  content: {
    /** The event being claimed. */
    eventId: string;
    /** Agent claiming this event. */
    claimingAgentId: string;
    /** When the claim was acquired. */
    claimedAt: string;
    /** When the claim expires if not completed. */
    expiresAt: string;
    /** Processing status. */
    status: 'claimed' | 'processing' | 'completed' | 'failed' | 'expired';
    /** Result of processing, if completed. */
    resultArtifactId?: string;
    /** If failed, the error. */
    failureReason?: string;
    /** Processing duration in milliseconds. */
    processingTimeMs?: number;
    /** Number of retry attempts. */
    retryCount: number;
    /** Maximum retries allowed. */
    maxRetries: number;
  };
}

/**
 * TaskDelegation — routing a task from one terminal/agent
 * to another. The orchestration record.
 */
export interface TaskDelegation extends Artifact {
  type: 'task-delegation';
  sourceTerminal: 'talon-agent';
  content: {
    /** Who requested the task. */
    requestedBy: string;
    /** Source terminal of the request. */
    sourceTerminal: TerminalId;
    /** Target terminal for execution. */
    targetTerminal: TerminalId;
    /** Target agent, if specific. */
    targetAgentId?: string;
    /** What needs to be done. */
    taskDescription: string;
    /** Input artifact IDs. */
    inputArtifactIds: string[];
    /** Output artifact IDs (populated on completion). */
    outputArtifactIds: string[];
    /** Delegation status. */
    status: 'queued' | 'delegated' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
    /** Priority level. */
    priority: 'low' | 'normal' | 'high' | 'critical';
    /** Deadline, if any. */
    deadline?: string;
    /** How the routing decision was made. */
    routingMethod: 'orchestrator-auto' | 'explicit-request' | 'policy-driven' | 'load-balanced';
  };
}

/**
 * OrchestratorRouting — the decision record for how
 * the Orchestrator routed an incoming intent.
 *
 * This makes the Orchestrator's reasoning auditable.
 * Why did it send this to Capture vs. Verification?
 */
export interface OrchestratorRouting extends Artifact {
  type: 'orchestrator-routing';
  sourceTerminal: 'talon-agent';
  content: {
    /** The incoming user/system intent. */
    incomingIntent: string;
    /** Parsed intent classification. */
    classifiedAs: A2AIntent;
    /** Confidence in the classification (0.0–1.0). */
    classificationConfidence: number;
    /** Agent selected for routing. */
    routedToAgent: string;
    /** Alternative agents considered. */
    alternativesConsidered: Array<{
      agentId: string;
      score: number;
      reason: string;
    }>;
    /** Routing decision rationale. */
    rationale: string;
    /** Whether the routed agent successfully handled the intent. */
    outcomeStatus?: 'success' | 'failure' | 'partial';
    /** Time spent on routing decision in milliseconds. */
    routingLatencyMs: number;
  };
}

// ─────────────────────────────────────────────
// OIAS Terminal Registration Update
// ─────────────────────────────────────────────

/**
 * Updated artifact type lists for OIAS terminals.
 * Use these to update the TERMINAL_ALLOWED_TYPES
 * map in constraints.ts.
 */
export const OIAS_TERMINAL_TYPES: Record<string, FullArtifactType[]> = {
  'artifact-memory': [
    'knowledge-node',
    'session-brief',
    'constellation-cluster',
    'relationship-edge',
    'transcript-ingestion',
    'generic',
  ],
  'decision-intelligence': [
    'decision',
    'decision-template',
    'decision-review',
    'governance-policy',
    'approval-chain',
    'decision-impact',
  ],
  'pow-ledger': [
    'verification',
    'ledger-entry',
    'pattern',
    'workflow-proposal',
    'audit-trail',
    'integrity-report',
    'seal-event',
    'a2a-message',
  ],
  'talon-agent': [
    'agent-execution',
    'event-claim',
    'task-delegation',
    'orchestrator-routing',
  ],
};
