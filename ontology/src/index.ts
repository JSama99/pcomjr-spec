/**
 * @talonsight/ontology
 * ====================
 * PCOMJR Data Ontology for TalonSight Technologies
 *
 * Generated from schema/pcomjr.schema.json — do not hand-edit generated types.
 *
 * Usage:
 *   import type { Artifact, Decision, Beat, MemoryBusEvent } from '@talonsight/ontology';
 *   import { validate, validateOrThrow, validateMemoryBusEvent } from '@talonsight/ontology/constraints';
 *   import { hash, canonicalize, verify } from '@talonsight/ontology/hash';
 *   import { isDecision, isBeat, isCIASArtifact } from '@talonsight/ontology/guards';
 */

// ── Generated types ──
export type {
  // Enums & literals
  Division,
  CIASTerminalId,
  OIASSystemId,
  TerminalId,
  CIASArtifactType,
  OIASArtifactType,
  ArtifactType,
  VerificationStatus,
  EvidenceType,
  DecisionStatus,
  DecisionType,
  RelationType,
  KnowledgeCategory,
  A2AIntent,
  MemoryBusEventType,

  // Core entities
  Artifact,
  Context,
  Evidence,
  Alternative,
  Decision,
  LedgerEntry,
  SealEvent,
  Verification,
  Pattern,
  WorkflowProposal,
  WorkflowStep,

  // CIAS artifact subclasses
  Beat,
  Loop,
  LoopSection,
  FreestyleSession,
  LyricComposition,
  LyricVerse,
  ProgressionSignal,
  ComicPanel,
  ComicPage,
  CharacterSheet,
  LocationSheet,
  AnimationClip,
  MarketplaceListing,
  LearningModule,

  // OIAS types
  KnowledgeNode,
  RelationshipEdge,
  SessionBrief,
  ConstellationCluster,
  TranscriptIngestion,
  AuditTrail,
  AuditEntry,
  IntegrityReport,
  A2AMessage,
  AgentIdentity,
  AgentPermission,
  EventClaim,
  TaskDelegation,
  OrchestratorRouting,

  // Infrastructure
  MemoryBusEvent,
  TerminalRegistration,
} from './generated/types.js';

// ── Const arrays (runtime values) ──
export {
  DIVISION,
  CIAS_TERMINAL_ID,
  OIAS_SYSTEM_ID,
  CIAS_ARTIFACT_TYPE,
  OIAS_ARTIFACT_TYPE,
  VERIFICATION_STATUS,
  EVIDENCE_TYPE,
  DECISION_STATUS,
  DECISION_TYPE,
  RELATION_TYPE,
  KNOWLEDGE_CATEGORY,
  A2A_INTENT,
  MEMORY_BUS_EVENT_TYPE,
} from './generated/types.js';

// ── Type guards ──
export {
  isDecision,
  isBeat,
  isLoop,
  isFreestyleSession,
  isLyricComposition,
  isComicPanel,
  isComicPage,
  isCharacterSheet,
  isLocationSheet,
  isAnimationClip,
  isMarketplaceListing,
  isLearningModule,
  isProgressionSignal,
  isVerifiedArtifact,
  isCIASArtifact,
  isOIASArtifact,
} from './generated/guards.js';

// ── Canonical hash ──
export { canonicalize, hash, verify } from './hash.js';

// ── Validators ──
export type { Violation, ViolationSeverity, ValidationResult } from './constraints.js';
export {
  validate,
  validateOrThrow,
  validateDecision,
  validateMemoryBusEvent,
  validateSealEvent,
  validateLedgerEntry,
  validateKnowledgeNode,
  validateRelationshipEdge,
  validateVerification,
} from './constraints.js';
