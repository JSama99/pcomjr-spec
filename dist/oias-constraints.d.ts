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
import type { Violation } from './constraints';
import type { KnowledgeNode, SessionBrief, ConstellationCluster, RelationshipEdge, TranscriptIngestion, DecisionTemplate, DecisionReview, GovernancePolicy, ApprovalChain, DecisionImpact, AuditTrail, IntegrityReport, SealEvent, A2AMessage, AgentIdentity, EventClaim, TaskDelegation, OrchestratorRouting } from './oias-types';
export declare function validateKnowledgeNode(node: KnowledgeNode): Violation[];
export declare function validateSessionBrief(brief: SessionBrief): Violation[];
export declare function validateConstellationCluster(cluster: ConstellationCluster): Violation[];
export declare function validateRelationshipEdge(edge: RelationshipEdge): Violation[];
export declare function validateTranscriptIngestion(ingestion: TranscriptIngestion): Violation[];
export declare function validateDecisionTemplate(template: DecisionTemplate): Violation[];
export declare function validateDecisionReview(review: DecisionReview): Violation[];
export declare function validateGovernancePolicy(policy: GovernancePolicy): Violation[];
export declare function validateApprovalChain(chain: ApprovalChain): Violation[];
export declare function validateDecisionImpact(impact: DecisionImpact): Violation[];
export declare function validateAuditTrail(trail: AuditTrail): Violation[];
export declare function validateIntegrityReport(report: IntegrityReport): Violation[];
export declare function validateSealEvent(seal: SealEvent): Violation[];
export declare function validateA2AMessage(msg: A2AMessage): Violation[];
export declare function validateAgentIdentity(agent: AgentIdentity): Violation[];
export declare function validateEventClaim(claim: EventClaim): Violation[];
export declare function validateTaskDelegation(delegation: TaskDelegation): Violation[];
export declare function validateOrchestratorRouting(routing: OrchestratorRouting): Violation[];
//# sourceMappingURL=oias-constraints.d.ts.map