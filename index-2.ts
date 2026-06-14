/**
 * @talonsight/ontology
 * ====================
 * PCOMJR Data Ontology for TalonSight Technologies
 *
 * Usage:
 *   import type { Artifact, Decision, Beat, KnowledgeNode } from '@talonsight/ontology';
 *   import { validate, validateOrThrow } from '@talonsight/ontology/constraints';
 *   import { validateA2AMessage } from '@talonsight/ontology/oias/constraints';
 */

// ── Base types ──
export type {
  // Enums & literals
  Division,
  TerminalId,
  CIASTerminalId,
  OIASSystemId,
  ArtifactType,
  VerificationStatus,
  EvidenceType,

  // Core entities
  Artifact,
  Decision,
  Context,
  Evidence,
  Verification,
  LedgerEntry,
  Pattern,
  WorkflowProposal,
  WorkflowStep,

  // CIAS artifact subclasses
  Beat,
  Loop,
  LoopSection,
  FlowSession,
  FreestyleSession,
  ProgressionSignal,
  LyricComposition,
  ComicPanel,
  ComicPage,
  CharacterSheet,
  LocationSheet,
  AnimationClip,
  TalonVisionExportV1,
  MarketplaceListing,
  LearningModule,

  // Infrastructure
  MemoryBusEvent,
  TerminalRegistration,
} from './pcomjr-types.js';

// ── Type guards ──
export {
  isDecision,
  isBeat,
  isComicPanel,
  isFreestyleSession,
  isVerifiedArtifact,
  isCIASArtifact,
  isOIASArtifact,
} from './pcomjr-types.js';

// ── OIAS types ──
export type {
  OIASArtifactType,
  FullArtifactType,

  // Artifact Memory
  KnowledgeNode,
  KnowledgeCategory,
  SessionBrief,
  ConstellationCluster,
  RelationshipEdge,
  OntologyRelationship,
  TranscriptIngestion,

  // Decision Intelligence OS
  DecisionTemplate,
  EvidenceRequirement,
  DecisionReview,
  GovernancePolicy,
  PolicyRule,
  ApprovalChain,
  ApprovalStep,
  DecisionImpact,

  // POW Ledger
  AuditTrail,
  AuditEntry,
  IntegrityReport,
  SealEvent,
  A2AMessage,
  A2AIntent,

  // Talon Agent
  AgentIdentity,
  AgentPermission,
  EventClaim,
  TaskDelegation,
  OrchestratorRouting,
} from './oias-types.js';

export { OIAS_TERMINAL_TYPES } from './oias-types.js';
