/**
 * PCOMJR Ontology — Constraint Validation
 * ========================================
 * TalonSight Technologies
 *
 * Runtime enforcement of ontological rules. Terminals call validate()
 * before emitting artifacts to the Memory Bus. OIAS systems call
 * validateDecision(), validateVerification(), etc. for domain-specific checks.
 *
 * Usage:
 *   import { validate, validateDecision } from '@talonsight/ontology/constraints';
 *
 *   const result = validate(myArtifact);
 *   if (!result.valid) console.error(result.violations);
 */
import type { Artifact, Decision, Evidence, Context, Verification, LedgerEntry, Pattern, MemoryBusEvent, ArtifactType } from './pcomjr-types';
export interface Violation {
    /** Dot-path to the offending field (e.g., "hasContext[0].conditions"). */
    path: string;
    /** What rule was violated. */
    rule: string;
    /** Human-readable explanation. */
    message: string;
    /** Severity: 'error' blocks emission; 'warning' logs but allows. */
    severity: 'error' | 'warning';
}
export interface ValidationResult {
    valid: boolean;
    violations: Violation[];
    /** The artifact type that was validated. */
    artifactType: ArtifactType | 'unknown';
}
export declare function validateArtifact(a: Artifact): Violation[];
export declare function validateDecision(d: Decision): Violation[];
export declare function validateContext(ctx: Context, prefix?: string): Violation[];
export declare function validateEvidence(ev: Evidence, prefix?: string): Violation[];
export declare function validateVerification(ver: Verification): Violation[];
export declare function validateLedgerEntry(entry: LedgerEntry, expectedCaptureAgent?: string): Violation[];
export declare function validatePattern(p: Pattern): Violation[];
export declare function validateMemoryBusEvent(event: MemoryBusEvent): Violation[];
/**
 * Validate any artifact against ontological constraints.
 * Routes to the appropriate validator based on artifact type.
 */
export declare function validate(a: Artifact): ValidationResult;
/**
 * Validate and throw on first error. Use in pipelines where
 * invalid artifacts should halt processing.
 */
export declare function validateOrThrow(a: Artifact): void;
//# sourceMappingURL=constraints.d.ts.map