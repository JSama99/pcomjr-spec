/**
 * PCOMJR Ontology — TypeScript Type Definitions
 * =============================================
 * TalonSight Technologies
 *
 * The importable contract for every terminal and platform system.
 * CIAS terminals produce domain Artifact subclasses.
 * OIAS systems operate on the meta-layer (Decision, Context, Evidence, Verification).
 *
 * Usage:
 *   import type { Artifact, Decision, Beat, ComicPanel } from '@talonsight/ontology';
 */
// ─────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────
export function isDecision(a) {
    return a.type === 'decision';
}
export function isBeat(a) {
    return a.type === 'beat';
}
export function isComicPanel(a) {
    return a.type === 'comic-panel';
}
export function isFreestyleSession(a) {
    return a.type === 'freestyle-session';
}
export function isVerifiedArtifact(a) {
    return a.sealed === true;
}
export function isCIASArtifact(a) {
    const ciasTerminals = [
        'sonic-genesis', 'da-cypher', 'talon-vision',
        'talon-motion', 'talon-fly', 'talon-learn'
    ];
    return ciasTerminals.includes(a.sourceTerminal);
}
export function isOIASArtifact(a) {
    return !isCIASArtifact(a);
}
//# sourceMappingURL=pcomjr-types.js.map