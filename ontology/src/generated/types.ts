/**
 * PCOMJR Data Ontology — Generated TypeScript Types
 * 
 * AUTO-GENERATED from schema/pcomjr.schema.json
 * DO NOT EDIT MANUALLY — run `npm run generate` to regenerate.
 * Generated: 2026-06-16T18:19:39.413Z
 */

// ═══════════════════════════════════════════════════════════════
// String Literal Types (Enums)
// ═══════════════════════════════════════════════════════════════

/** Intent types for Agent-to-Agent protocol messages. */
export type A2AIntent = "capture" | "verify" | "query" | "pattern_detect" | "stream_query";

export const A2A_INTENT = ["capture", "verify", "query", "pattern_detect", "stream_query"] as const;

/** Artifact types produced by CIAS terminals. */
export type CIASArtifactType = "beat" | "loop" | "stem-bundle" | "mix-export" | "arrangement" | "flow-session" | "freestyle-session" | "battle-recording" | "lyric-composition" | "progression-signal" | "comic-panel" | "comic-page" | "character-sheet" | "location-sheet" | "talonvision-export" | "animation-clip" | "motion-sequence" | "marketplace-listing" | "creator-profile" | "learning-module" | "curriculum";

export const CIAS_ARTIFACT_TYPE = ["beat", "loop", "stem-bundle", "mix-export", "arrangement", "flow-session", "freestyle-session", "battle-recording", "lyric-composition", "progression-signal", "comic-panel", "comic-page", "character-sheet", "location-sheet", "talonvision-export", "animation-clip", "motion-sequence", "marketplace-listing", "creator-profile", "learning-module", "curriculum"] as const;

/** Identifiers for the five CIAS creative terminals. */
export type CIASTerminalId = "sonic-genesis" | "da-cypher" | "talonvision" | "talonmotion" | "talonfly";

export const CIAS_TERMINAL_ID = ["sonic-genesis", "da-cypher", "talonvision", "talonmotion", "talonfly"] as const;

/** Lifecycle status of a decision. */
export type DecisionStatus = "draft" | "in_review" | "approved" | "rejected" | "implemented" | "verified" | "archived";

export const DECISION_STATUS = ["draft", "in_review", "approved", "rejected", "implemented", "verified", "archived"] as const;

/** Classification of organizational decisions. */
export type DecisionType = "strategic" | "operational" | "architectural" | "tactical" | "governance";

export const DECISION_TYPE = ["strategic", "operational", "architectural", "tactical", "governance"] as const;

/** CIAS = Creative Infrastructure As a Subscription. OIAS = Organizational Infrastructure As a Subscription. */
export type Division = "cias" | "oias";

export const DIVISION = ["cias", "oias"] as const;

/** Classification of evidence supporting a decision. */
export type EvidenceType = "document" | "data" | "analysis" | "precedent" | "expert_input" | "metric" | "external";

export const EVIDENCE_TYPE = ["document", "data", "analysis", "precedent", "expert_input", "metric", "external"] as const;

/** Classification of knowledge artifacts extracted from transcripts. */
export type KnowledgeCategory = "architecture" | "decision" | "bug-fix" | "feature" | "pattern" | "requirement" | "insight" | "blocker" | "milestone" | "question" | "action-item";

export const KNOWLEDGE_CATEGORY = ["architecture", "decision", "bug-fix", "feature", "pattern", "requirement", "insight", "blocker", "milestone", "question", "action-item"] as const;

/** Event types flowing through the Memory Bus. */
export type MemoryBusEventType = "artifact.created" | "artifact.updated" | "artifact.verified" | "artifact.sealed" | "artifact.superseded" | "decision.created" | "decision.sealed" | "decision.verified" | "pattern.detected" | "workflow.proposed";

export const MEMORY_BUS_EVENT_TYPE = ["artifact.created", "artifact.updated", "artifact.verified", "artifact.sealed", "artifact.superseded", "decision.created", "decision.sealed", "decision.verified", "pattern.detected", "workflow.proposed"] as const;

/** Artifact types produced by OIAS systems. */
export type OIASArtifactType = "decision" | "context" | "evidence" | "verification" | "knowledge-node" | "session-brief" | "transcript-ingestion" | "ledger-entry" | "seal-event" | "audit-entry" | "pattern" | "workflow-proposal" | "agent-task" | "event-claim" | "a2a-message" | "constellation-cluster";

export const OIAS_ARTIFACT_TYPE = ["decision", "context", "evidence", "verification", "knowledge-node", "session-brief", "transcript-ingestion", "ledger-entry", "seal-event", "audit-entry", "pattern", "workflow-proposal", "agent-task", "event-claim", "a2a-message", "constellation-cluster"] as const;

/** Identifiers for OIAS infrastructure systems. */
export type OIASSystemId = "artifact-memory" | "decision-intelligence" | "pow-ledger" | "talon-agent" | "talon-llm";

export const OIAS_SYSTEM_ID = ["artifact-memory", "decision-intelligence", "pow-ledger", "talon-agent", "talon-llm"] as const;

/** Typed relationships between artifacts in the knowledge graph. */
export type RelationType = "derived-from" | "supersedes" | "conflicts-with" | "references" | "implements" | "validates" | "influenced-by" | "enables" | "contradicts" | "relates-to";

export const RELATION_TYPE = ["derived-from", "supersedes", "conflicts-with", "references", "implements", "validates", "influenced-by", "enables", "contradicts", "relates-to"] as const;

/** Lifecycle status of an artifact's cryptographic verification. */
export type VerificationStatus = "unverified" | "pending" | "verified" | "tampered" | "expired";

export const VERIFICATION_STATUS = ["unverified", "pending", "verified", "tampered", "expired"] as const;

// ═══════════════════════════════════════════════════════════════
// Union Types
// ═══════════════════════════════════════════════════════════════

/** Union of all artifact types across both divisions. */
export type ArtifactType = CIASArtifactType | OIASArtifactType;

/** Any terminal or system in the TST ecosystem. */
export type TerminalId = CIASTerminalId | OIASSystemId;

// ═══════════════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════════════

/** Agent-to-Agent protocol message — used for inter-agent communication in the POW Ledger system. */
export interface A2AMessage {
  messageId: string;
  intent: A2AIntent;
  /** Source agent identifier. */
  source: string;
  /** Target agent identifier. */
  target: string;
  payload: Record<string, unknown>;
  timestamp: string;
  /** Links related messages across agents. */
  correlationId?: string;
  /** MessageId this is responding to. */
  responseTo?: string;
}

/** Identity record for a Talon Agent. */
export interface AgentIdentity {
  agentId: string;
  name: string;
  description?: string;
  capabilities: string[];
  permissions?: AgentPermission[];
  status?: "active" | "suspended" | "decommissioned";
}

export interface AgentPermission {
  resource: string;
  actions: ("read" | "write" | "execute" | "delegate")[];
  conditions?: Record<string, unknown>;
}

/** An alternative considered and rejected during decision-making. */
export interface Alternative {
  id: string;
  title: string;
  description?: string;
  rejectionReason: string;
}

export interface AnimationClipContent {
  projectId?: string;
  duration: number;
  resolution?: { width?: number; height?: number };
  fps?: number;
  videoUrl?: string;
  /** TalonVisionExport package this was rendered from. */
  sourcePackageId?: string;
}

/** Base artifact — the fundamental unit of work output in the PCOMJR pipeline. Every creative or organizational output is an artifact. */
export interface Artifact {
  /** Globally unique artifact identifier. */
  id: string;
  /** Artifact type classification. */
  type: ArtifactType;
  /** The terminal that produced this artifact. */
  sourceTerminal: TerminalId;
  /** Freeform tags for discovery. */
  tags?: string[];
  /** SHA-256 hash of the canonical artifact representation. */
  powHash?: string;
  /** Timestamp when the artifact was anchored to the POW Ledger. */
  powAnchoredAt?: string;
  /** Reference to the POW Ledger event that anchored this artifact. */
  powEventId?: string;
  /** Current verification state. */
  verificationStatus?: VerificationStatus;
  /** SHA-256 hex hash of the canonical content representation. */
  hash: string;
  /** ISO 8601 UTC creation timestamp. */
  timestamp: string;
  /** Workspace or context that produced this artifact. */
  workspace: string;
  /** Whether the artifact has been sealed to the POW Ledger. */
  sealed: boolean;
  /** Type-specific content fields. */
  content: any;
}

export interface AuditEntry {
  id: string;
  action: string;
  timestamp: string;
  actor: string;
  hash?: string;
  details?: Record<string, unknown>;
}

/** A complete audit trail for an artifact — all ledger entries and verifications. */
export interface AuditTrail {
  artifactId: string;
  entries: AuditEntry[];
  integrityStatus?: VerificationStatus;
  lastVerified?: string;
}

export interface BeatContent {
  bpm: number;
  /** Musical key, e.g. 'C minor'. */
  key?: string;
  scale?: string;
  genre?: string;
  mood?: string;
  /** Duration in seconds. */
  duration: number;
  /** Map of stem name to URL. */
  stemUrls?: Record<string, string>;
  /** Which model generated this beat. */
  generationModel?: string;
  generationPrompt?: string;
}

export interface CharacterSheetContent {
  characterName: string;
  characterId?: string;
  referenceImages?: string[];
  designNotes?: string;
  /** Seed for reproducible generation. */
  canonicalSeed?: number;
  outfits?: Record<string, unknown>[];
  voiceCasting?: Record<string, unknown>;
}

export interface ComicPageContent {
  projectId?: string;
  pageNumber: number;
  panels: ComicPanel[];
  layoutType?: string;
}

export interface ComicPanelContent {
  projectId?: string;
  pageNumber: number;
  panelNumber: number;
  sceneId?: string;
  dialogueText?: string;
  actionText?: string;
  characterIds?: string[];
  imageUrl?: string;
  generationPrompt?: string;
  generationModel?: string;
}

export interface ConstellationClusterContent {
  /** Workspace this cluster represents. */
  workspaceName: string;
  /** Terminal this workspace belongs to. */
  terminal: TerminalId;
  /** Number of artifacts in this cluster. */
  artifactCount: number;
  /** Hex color for the cluster. */
  color: string;
  position?: { x?: number; y?: number };
}

/** Structured context record — captures the conditions under which a decision was made. PCOMJR Stage 2. */
export interface Context {
  id: string;
  /** What success looks like. */
  objective: string;
  /** What cannot change. */
  constraints?: string[];
  /** What is believed true but unverified. */
  assumptions?: string[];
  /** What could go wrong. */
  risks?: string[];
  /** The technical, organizational, or market conditions. */
  environment?: string;
  /** When this context is valid. */
  timeframe?: string;
}

export interface DecisionContent {
  /** The decision that was made. */
  outcome: string;
  decisionType: DecisionType;
  status: DecisionStatus;
  /** At least one context record is required. */
  contexts: Context[];
  /** At least one piece of evidence is required. */
  evidences: Evidence[];
  /** Alternatives considered and rejected. */
  alternatives?: Alternative[];
  /** Predicted confidence in the decision's success. */
  confidenceLevel?: number;
  /** Who owns this decision. */
  owner?: string;
  reviewers?: string[];
  /** Measured success after implementation. */
  successScore?: number;
  /** Measured organizational impact. */
  impactScore?: number;
  /** Post-implementation lessons. */
  lessonsLearned?: string;
  unexpectedConsequences?: string;
}

/** An agent's claim on an event for processing — uses atomic SELECT FOR UPDATE SKIP LOCKED. */
export interface EventClaim {
  eventId: string;
  agentId: string;
  claimedAt: string;
  completedAt?: string;
  status: "claimed" | "processing" | "completed" | "failed" | "expired";
  result?: Record<string, unknown>;
}

/** A piece of evidence supporting a decision. PCOMJR Stage 3 (Orchestrator output). */
export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  /** The evidence body text or summary. */
  content: string;
  /** Where this evidence came from. */
  source?: string;
  /** URL to supporting material. */
  attachmentUrl?: string;
  /** How reliable this evidence is. */
  confidence?: number;
}

export interface FreestyleSessionContent {
  /** ID of the beat used. */
  beatId?: string;
  /** Session duration in seconds. */
  duration: number;
  bpm?: number;
  /** Transcribed lyrics. */
  transcript?: string;
  flowScore?: number;
  rhymeScore?: number;
  deliveryScore?: number;
  overallScore?: number;
  skillSignals?: Record<string, unknown>;
}

/** Result of verifying an artifact's integrity against the POW Ledger. */
export interface IntegrityReport {
  artifactId: string;
  status: VerificationStatus;
  expectedHash?: string;
  actualHash?: string;
  checkedAt: string;
  chainValid?: boolean;
  discrepancies?: string[];
}

export interface KnowledgeNodeContent {
  /** The extracted knowledge statement. */
  statement: string;
  category: KnowledgeCategory;
  /** Confidence in extraction accuracy (0.0-1.0). */
  extractionConfidence: number;
  /** Source transcript or session ID. */
  sourceSessionId: string;
  /** Terminal where the original work occurred. */
  originTerminal?: TerminalId;
  /** Entity names mentioned. */
  entities?: string[];
  /** Related knowledge node IDs. */
  relatedNodeIds?: string[];
}

export interface LearningModuleContent {
  curriculum?: string;
  difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedMinutes?: number;
  prerequisites?: string[];
  objectives?: string[];
}

/** An entry in the POW Ledger — a tamper-evident record linking an artifact to its cryptographic proof. */
export interface LedgerEntry {
  id: string;
  /** ID of the artifact being recorded. */
  artifactId: string;
  /** SHA-256 hash of the canonical artifact. */
  artifactHash: string;
  /** Type of the recorded artifact. */
  artifactType: string;
  /** Chain link — hash incorporating the previous entry. */
  signature?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  /** Which terminal or system created this entry. */
  source?: TerminalId;
}

export interface LocationSheetContent {
  locationName: string;
  environmentType?: string;
  referenceImages?: string[];
  designNotes?: string;
  /** Prefix/suffix prompt for atmospheric generation. */
  atmosphericPrompt?: string;
}

export interface LoopContent {
  sections: LoopSection[];
  totalDuration?: number;
  masterBpm?: number;
}

export interface LoopSection {
  id: string;
  name: string;
  order: number;
  duration: number;
  bpm?: number;
  prompt?: string;
  audioUrl?: string;
}

export interface LyricCompositionContent {
  beatId?: string;
  bpm?: number;
  mood?: string;
  topic?: string;
  totalBars: number;
  totalWords: number;
  verses?: LyricVerse[];
}

export interface LyricVerse {
  id: string;
  sectionType?: string;
  label?: string;
  content: string;
  verseOrder: number;
  barCount?: number;
  syllableCount?: number;
}

export interface MarketplaceListingContent {
  price: number;
  currency: string;
  /** ID of the artifact being listed. */
  artifactRef?: string;
  creatorId?: string;
  status?: "draft" | "active" | "sold" | "delisted";
  provenanceHash?: string;
}

/** An event flowing through the Memory Bus — the central ingestion pathway for all artifact events across the TST ecosystem. */
export interface MemoryBusEvent {
  /** Globally unique event identifier. */
  eventId: string;
  /** What happened. */
  eventType: MemoryBusEventType;
  /** When it happened (ISO 8601 UTC). */
  eventTimestamp: string;
  /** Which terminal emitted this event. */
  source: TerminalId;
  /** The artifact or entity being reported. */
  payload: Record<string, unknown>;
  /** The artifact type for routing (e.g. 'beat', 'decision', 'knowledge_node'). */
  artifactClass: string;
  /** Links related events across systems. */
  correlationId?: string;
  /** Hash of the payload for integrity verification. */
  powHash?: string;
}

/** Routing decision made by the orchestrator agent — which agent handles which intent. */
export interface OrchestratorRouting {
  intent: A2AIntent;
  selectedAgent: string;
  confidence: number;
  alternativeAgents?: string[];
  routingReason?: string;
}

/** A detected pattern across multiple decisions or artifacts. */
export interface Pattern {
  id: string;
  name: string;
  description?: string;
  patternType: "recurring_success" | "recurring_failure" | "overconfidence" | "underconfidence" | "process_gap" | "workflow_candidate";
  occurrences: number;
  artifactIds?: string[];
  confidence?: number;
  detectedAt: string;
  recommendation?: string;
}

export interface ProgressionSignalContent {
  skillId: string;
  signalType: "weakness" | "staleness" | "ceiling_plateau" | "streak_continuation" | "near_mastery";
  value: number;
  sessionId?: string;
}

/** An edge in the knowledge graph connecting two artifacts or knowledge nodes. */
export interface RelationshipEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: RelationType;
  confidence?: number;
  detectedBy?: "manual" | "temporal" | "ai_extraction" | "cross_reference";
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

/** Event emitted when a decision is sealed — cryptographically committed to the POW Ledger. */
export interface SealEvent {
  eventId: string;
  decisionId: string;
  hash: string;
  sealedAt: string;
  sealedBy: string;
  ledgerEntryId?: string;
  previousHash?: string;
}

export interface SessionBriefContent {
  /** Human-readable session title. */
  title: string;
  /** Executive summary (2-3 sentences). */
  summary: string;
  /** Key decisions made. */
  decisionsIdentified?: string[];
  /** Artifacts produced or modified. */
  artifactsProduced?: string[];
  /** Unresolved items or open questions. */
  openItems?: string[];
  /** Terminals involved. */
  terminalsInvolved?: TerminalId[];
  /** Knowledge nodes extracted. */
  nodeCount?: number;
  /** Model used for brief generation. */
  generationModel?: string;
}

/** A task delegated from the orchestrator to a specialist agent. */
export interface TaskDelegation {
  taskId: string;
  fromAgent: string;
  toAgent: string;
  instruction: string;
  delegatedAt: string;
  deadline?: string;
  priority?: "low" | "normal" | "high" | "critical";
  status?: "pending" | "accepted" | "in_progress" | "completed" | "failed";
}

/** Registration record for a terminal in the TST ecosystem. */
export interface TerminalRegistration {
  terminalId: TerminalId;
  name: string;
  division: Division;
  description?: string;
  /** Artifact types this terminal is authorized to produce. */
  artifactTypes: string[];
  version?: string;
  status?: "active" | "maintenance" | "deprecated";
  endpoint?: string;
  memoryBusEnabled?: boolean;
}

export interface TranscriptIngestionContent {
  sessionId: string;
  workspaceId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  artifactsExtracted?: number;
  chunksProcessed?: number;
  errors?: string[];
}

/** A verification record — proves an artifact existed in a specific form at a specific time. */
export interface Verification {
  id: string;
  artifactId: string;
  hash: string;
  expectedHash?: string;
  status: VerificationStatus;
  verifiedAt: string;
  verifiedBy?: string;
  discrepancies?: string[];
}

/** A proposed reusable workflow derived from detected patterns. */
export interface WorkflowProposal {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  sourcePatternId: string;
  proposedAt?: string;
  status?: "proposed" | "accepted" | "rejected" | "active";
}

export interface WorkflowStep {
  order: number;
  action: string;
  stage: "pipeline" | "context" | "orchestrator" | "model" | "judgment" | "artifact" | "reliability";
  assignee?: string;
  requiredEvidence?: string[];
}

// ═══════════════════════════════════════════════════════════════
// CIAS Artifact Subtypes
// ═══════════════════════════════════════════════════════════════

/** An animation or video clip — TalonMotion artifact. */
export interface AnimationClip extends Artifact {
  type: "animation-clip";
  sourceTerminal: "talonmotion";
  content: AnimationClipContent;
}

/** A musical beat — Sonic Genesis artifact. */
export interface Beat extends Artifact {
  type: "beat";
  sourceTerminal: "sonic-genesis";
  content: BeatContent;
}

/** A character design sheet — TalonVision artifact. */
export interface CharacterSheet extends Artifact {
  type: "character-sheet";
  sourceTerminal: "talonvision";
  content: CharacterSheetContent;
}

/** A full comic page containing multiple panels — TalonVision artifact. */
export interface ComicPage extends Artifact {
  type: "comic-page";
  sourceTerminal: "talonvision";
  content: ComicPageContent;
}

/** A single comic panel — TalonVision artifact. */
export interface ComicPanel extends Artifact {
  type: "comic-panel";
  sourceTerminal: "talonvision";
  content: ComicPanelContent;
}

/** A cluster in the constellation visualization — groups artifacts by workspace or origin. */
export interface ConstellationCluster extends Artifact {
  type: "constellation-cluster";
  sourceTerminal: "artifact-memory";
  content: ConstellationClusterContent;
}

/** A freestyle rap session — Da Cypher artifact. */
export interface FreestyleSession extends Artifact {
  type: "freestyle-session";
  sourceTerminal: "da-cypher";
  content: FreestyleSessionContent;
}

/** A node in the Artifact Memory knowledge graph — extracted from AI chat transcripts. */
export interface KnowledgeNode extends Artifact {
  type: "knowledge-node";
  sourceTerminal: "artifact-memory";
  content: KnowledgeNodeContent;
}

/** A learning module — TalonLearn artifact. */
export interface LearningModule extends Artifact {
  type: "learning-module";
  content: LearningModuleContent;
}

/** A location/environment design sheet — TalonVision artifact. */
export interface LocationSheet extends Artifact {
  type: "location-sheet";
  sourceTerminal: "talonvision";
  content: LocationSheetContent;
}

/** A multi-section loop arrangement — Sonic Genesis Loop Studio artifact. */
export interface Loop extends Artifact {
  type: "loop";
  sourceTerminal: "sonic-genesis";
  content: LoopContent;
}

/** A written lyric composition — Da Cypher Lyric Mode artifact. */
export interface LyricComposition extends Artifact {
  type: "lyric-composition";
  sourceTerminal: "da-cypher";
  content: LyricCompositionContent;
}

/** A marketplace listing — TalonFly artifact. */
export interface MarketplaceListing extends Artifact {
  type: "marketplace-listing";
  sourceTerminal: "talonfly";
  content: MarketplaceListingContent;
}

/** A skill progression signal — Da Cypher training artifact. */
export interface ProgressionSignal extends Artifact {
  type: "progression-signal";
  sourceTerminal: "da-cypher";
  content: ProgressionSignalContent;
}

/** A generated summary of a workspace's artifacts — produced by Artifact Memory. */
export interface SessionBrief extends Artifact {
  type: "session-brief";
  sourceTerminal: "artifact-memory";
  content: SessionBriefContent;
}

/** Metadata for a transcript ingestion job in Artifact Memory. */
export interface TranscriptIngestion extends Artifact {
  type: "transcript-ingestion";
  sourceTerminal: "artifact-memory";
  content: TranscriptIngestionContent;
}

// ═══════════════════════════════════════════════════════════════
// Decision (extends Artifact)
// ═══════════════════════════════════════════════════════════════

/** An organizational decision — the core entity of the PCOMJR Judgment stage. Extends Artifact with decision-specific fields. */
export interface Decision extends Artifact {
  type: "decision";
  content: DecisionContent;
}
