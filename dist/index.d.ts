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
export type { Division, TerminalId, CIASTerminalId, OIASSystemId, ArtifactType, VerificationStatus, EvidenceType, Artifact, Decision, Context, Evidence, Verification, LedgerEntry, Pattern, WorkflowProposal, WorkflowStep, Beat, Loop, LoopSection, FlowSession, FreestyleSession, ProgressionSignal, LyricComposition, ComicPanel, ComicPage, CharacterSheet, LocationSheet, AnimationClip, TalonVisionExportV1, MarketplaceListing, LearningModule, MemoryBusEvent, TerminalRegistration, } from './pcomjr-types';
export { isDecision, isBeat, isComicPanel, isFreestyleSession, isVerifiedArtifact, isCIASArtifact, isOIASArtifact, } from './pcomjr-types';
export type { OIASArtifactType, FullArtifactType, KnowledgeNode, KnowledgeCategory, SessionBrief, ConstellationCluster, RelationshipEdge, OntologyRelationship, TranscriptIngestion, DecisionTemplate, EvidenceRequirement, DecisionReview, GovernancePolicy, PolicyRule, ApprovalChain, ApprovalStep, DecisionImpact, AuditTrail, AuditEntry, IntegrityReport, SealEvent, A2AMessage, A2AIntent, AgentIdentity, AgentPermission, EventClaim, TaskDelegation, OrchestratorRouting, } from './oias-types';
export { OIAS_TERMINAL_TYPES } from './oias-types';
//# sourceMappingURL=index.d.ts.map