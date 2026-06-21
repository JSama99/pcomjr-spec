/**
 * PCOMJR Data Ontology — Generated Type Guards
 *
 * AUTO-GENERATED from schema/pcomjr.schema.json
 * DO NOT EDIT MANUALLY — run `npm run generate` to regenerate.
 * Generated: 2026-06-21T18:23:03.522Z
 */
import type { Artifact, AnimationClip, Beat, CharacterSheet, ComicPage, ComicPanel, ConstellationCluster, Decision, FreestyleSession, KnowledgeNode, LearningModule, LocationSheet, Loop, LyricComposition, MarketplaceListing, ProgressionSignal, SessionBrief, TranscriptIngestion } from './types.js';
/** Type guard: is this artifact a Decision? */
export declare function isDecision(a: Artifact): a is Decision;
/** Type guard: is this artifact a AnimationClip? */
export declare function isAnimationClip(a: Artifact): a is AnimationClip;
/** Type guard: is this artifact a Beat? */
export declare function isBeat(a: Artifact): a is Beat;
/** Type guard: is this artifact a CharacterSheet? */
export declare function isCharacterSheet(a: Artifact): a is CharacterSheet;
/** Type guard: is this artifact a ComicPage? */
export declare function isComicPage(a: Artifact): a is ComicPage;
/** Type guard: is this artifact a ComicPanel? */
export declare function isComicPanel(a: Artifact): a is ComicPanel;
/** Type guard: is this artifact a ConstellationCluster? */
export declare function isConstellationCluster(a: Artifact): a is ConstellationCluster;
/** Type guard: is this artifact a FreestyleSession? */
export declare function isFreestyleSession(a: Artifact): a is FreestyleSession;
/** Type guard: is this artifact a KnowledgeNode? */
export declare function isKnowledgeNode(a: Artifact): a is KnowledgeNode;
/** Type guard: is this artifact a LearningModule? */
export declare function isLearningModule(a: Artifact): a is LearningModule;
/** Type guard: is this artifact a LocationSheet? */
export declare function isLocationSheet(a: Artifact): a is LocationSheet;
/** Type guard: is this artifact a Loop? */
export declare function isLoop(a: Artifact): a is Loop;
/** Type guard: is this artifact a LyricComposition? */
export declare function isLyricComposition(a: Artifact): a is LyricComposition;
/** Type guard: is this artifact a MarketplaceListing? */
export declare function isMarketplaceListing(a: Artifact): a is MarketplaceListing;
/** Type guard: is this artifact a ProgressionSignal? */
export declare function isProgressionSignal(a: Artifact): a is ProgressionSignal;
/** Type guard: is this artifact a SessionBrief? */
export declare function isSessionBrief(a: Artifact): a is SessionBrief;
/** Type guard: is this artifact a TranscriptIngestion? */
export declare function isTranscriptIngestion(a: Artifact): a is TranscriptIngestion;
/** Type guard: has this artifact been verified? */
export declare function isVerifiedArtifact(a: Artifact): boolean;
/** Type guard: is this artifact from a CIAS terminal? */
export declare function isCIASArtifact(a: Artifact): boolean;
/** Type guard: is this artifact from an OIAS system? */
export declare function isOIASArtifact(a: Artifact): boolean;
//# sourceMappingURL=guards.d.ts.map