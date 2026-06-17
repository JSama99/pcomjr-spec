/**
 * PCOMJR Data Ontology — Generated Type Guards
 * 
 * AUTO-GENERATED from schema/pcomjr.schema.json
 * DO NOT EDIT MANUALLY — run `npm run generate` to regenerate.
 * Generated: 2026-06-16T18:19:39.416Z
 */

import type { Artifact, AnimationClip, Beat, CharacterSheet, ComicPage, ComicPanel, ConstellationCluster, Decision, FreestyleSession, KnowledgeNode, LearningModule, LocationSheet, Loop, LyricComposition, MarketplaceListing, ProgressionSignal, SessionBrief, TranscriptIngestion } from './types.js';
import { CIAS_TERMINAL_ID, OIAS_SYSTEM_ID } from './types.js';

/** Type guard: is this artifact a Decision? */
export function isDecision(a: Artifact): a is Decision {
  return a.type === 'decision';
}

/** Type guard: is this artifact a AnimationClip? */
export function isAnimationClip(a: Artifact): a is AnimationClip {
  return a.type === 'animation-clip';
}

/** Type guard: is this artifact a Beat? */
export function isBeat(a: Artifact): a is Beat {
  return a.type === 'beat';
}

/** Type guard: is this artifact a CharacterSheet? */
export function isCharacterSheet(a: Artifact): a is CharacterSheet {
  return a.type === 'character-sheet';
}

/** Type guard: is this artifact a ComicPage? */
export function isComicPage(a: Artifact): a is ComicPage {
  return a.type === 'comic-page';
}

/** Type guard: is this artifact a ComicPanel? */
export function isComicPanel(a: Artifact): a is ComicPanel {
  return a.type === 'comic-panel';
}

/** Type guard: is this artifact a ConstellationCluster? */
export function isConstellationCluster(a: Artifact): a is ConstellationCluster {
  return a.type === 'constellation-cluster';
}

/** Type guard: is this artifact a FreestyleSession? */
export function isFreestyleSession(a: Artifact): a is FreestyleSession {
  return a.type === 'freestyle-session';
}

/** Type guard: is this artifact a KnowledgeNode? */
export function isKnowledgeNode(a: Artifact): a is KnowledgeNode {
  return a.type === 'knowledge-node';
}

/** Type guard: is this artifact a LearningModule? */
export function isLearningModule(a: Artifact): a is LearningModule {
  return a.type === 'learning-module';
}

/** Type guard: is this artifact a LocationSheet? */
export function isLocationSheet(a: Artifact): a is LocationSheet {
  return a.type === 'location-sheet';
}

/** Type guard: is this artifact a Loop? */
export function isLoop(a: Artifact): a is Loop {
  return a.type === 'loop';
}

/** Type guard: is this artifact a LyricComposition? */
export function isLyricComposition(a: Artifact): a is LyricComposition {
  return a.type === 'lyric-composition';
}

/** Type guard: is this artifact a MarketplaceListing? */
export function isMarketplaceListing(a: Artifact): a is MarketplaceListing {
  return a.type === 'marketplace-listing';
}

/** Type guard: is this artifact a ProgressionSignal? */
export function isProgressionSignal(a: Artifact): a is ProgressionSignal {
  return a.type === 'progression-signal';
}

/** Type guard: is this artifact a SessionBrief? */
export function isSessionBrief(a: Artifact): a is SessionBrief {
  return a.type === 'session-brief';
}

/** Type guard: is this artifact a TranscriptIngestion? */
export function isTranscriptIngestion(a: Artifact): a is TranscriptIngestion {
  return a.type === 'transcript-ingestion';
}

/** Type guard: has this artifact been verified? */
export function isVerifiedArtifact(a: Artifact): boolean {
  return a.verificationStatus === 'verified';
}

/** Type guard: is this artifact from a CIAS terminal? */
export function isCIASArtifact(a: Artifact): boolean {
  return (CIAS_TERMINAL_ID as readonly string[]).includes(a.sourceTerminal);
}

/** Type guard: is this artifact from an OIAS system? */
export function isOIASArtifact(a: Artifact): boolean {
  return (OIAS_SYSTEM_ID as readonly string[]).includes(a.sourceTerminal);
}
