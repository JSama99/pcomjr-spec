/**
 * PCOMJR Data Ontology — Validation Constraints
 *
 * Runtime validators for ontology types. Updated for content-nested schema:
 * base Artifact has hash/timestamp/workspace/sealed/content, subtype fields
 * live inside the content wrapper.
 */
export type ViolationSeverity = 'error' | 'warning';
export interface Violation {
    rule: string;
    message: string;
    severity: ViolationSeverity;
    path?: string;
}
export interface ValidationResult {
    valid: boolean;
    violations: Violation[];
}
export declare function validate(artifact: any): ValidationResult;
export declare function validateOrThrow(artifact: any): void;
export declare function validateDecision(decision: any): ValidationResult;
export declare function validateMemoryBusEvent(event: any): Violation[];
export declare function validateSealEvent(event: any): Violation[];
export declare function validateLedgerEntry(entry: any): Violation[];
export declare function validateKnowledgeNode(node: any): Violation[];
export declare function validateRelationshipEdge(edge: any): Violation[];
export declare function validateVerification(verification: any): Violation[];
//# sourceMappingURL=constraints.d.ts.map