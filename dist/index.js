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
// ── Type guards ──
export { isDecision, isBeat, isComicPanel, isFreestyleSession, isVerifiedArtifact, isCIASArtifact, isOIASArtifact, } from './pcomjr-types';
export { OIAS_TERMINAL_TYPES } from './oias-types';
//# sourceMappingURL=index.js.map