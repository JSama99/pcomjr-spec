/**
 * PCOMJR Data Ontology — Generated Type Guards
 *
 * AUTO-GENERATED from schema/pcomjr.schema.json
 * DO NOT EDIT MANUALLY — run `npm run generate` to regenerate.
 * Generated: 2026-06-21T18:23:03.522Z
 */
import { CIAS_TERMINAL_ID, OIAS_SYSTEM_ID } from './types.js';
/** Type guard: is this artifact a Decision? */
export function isDecision(a) {
    return a.type === 'decision';
}
/** Type guard: is this artifact a AnimationClip? */
export function isAnimationClip(a) {
    return a.type === 'animation-clip';
}
/** Type guard: is this artifact a Beat? */
export function isBeat(a) {
    return a.type === 'beat';
}
/** Type guard: is this artifact a CharacterSheet? */
export function isCharacterSheet(a) {
    return a.type === 'character-sheet';
}
/** Type guard: is this artifact a ComicPage? */
export function isComicPage(a) {
    return a.type === 'comic-page';
}
/** Type guard: is this artifact a ComicPanel? */
export function isComicPanel(a) {
    return a.type === 'comic-panel';
}
/** Type guard: is this artifact a ConstellationCluster? */
export function isConstellationCluster(a) {
    return a.type === 'constellation-cluster';
}
/** Type guard: is this artifact a FreestyleSession? */
export function isFreestyleSession(a) {
    return a.type === 'freestyle-session';
}
/** Type guard: is this artifact a KnowledgeNode? */
export function isKnowledgeNode(a) {
    return a.type === 'knowledge-node';
}
/** Type guard: is this artifact a LearningModule? */
export function isLearningModule(a) {
    return a.type === 'learning-module';
}
/** Type guard: is this artifact a LocationSheet? */
export function isLocationSheet(a) {
    return a.type === 'location-sheet';
}
/** Type guard: is this artifact a Loop? */
export function isLoop(a) {
    return a.type === 'loop';
}
/** Type guard: is this artifact a LyricComposition? */
export function isLyricComposition(a) {
    return a.type === 'lyric-composition';
}
/** Type guard: is this artifact a MarketplaceListing? */
export function isMarketplaceListing(a) {
    return a.type === 'marketplace-listing';
}
/** Type guard: is this artifact a ProgressionSignal? */
export function isProgressionSignal(a) {
    return a.type === 'progression-signal';
}
/** Type guard: is this artifact a SessionBrief? */
export function isSessionBrief(a) {
    return a.type === 'session-brief';
}
/** Type guard: is this artifact a TranscriptIngestion? */
export function isTranscriptIngestion(a) {
    return a.type === 'transcript-ingestion';
}
/** Type guard: has this artifact been verified? */
export function isVerifiedArtifact(a) {
    return a.verificationStatus === 'verified';
}
/** Type guard: is this artifact from a CIAS terminal? */
export function isCIASArtifact(a) {
    return CIAS_TERMINAL_ID.includes(a.sourceTerminal);
}
/** Type guard: is this artifact from an OIAS system? */
export function isOIASArtifact(a) {
    return OIAS_SYSTEM_ID.includes(a.sourceTerminal);
}
//# sourceMappingURL=guards.js.map