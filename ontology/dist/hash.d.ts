/**
 * PCOMJR Canonical Hash
 *
 * Deterministic SHA-256 hashing for cross-language integrity verification.
 * Produces identical output in both TypeScript and Python for identical input.
 *
 * Canonicalization rules:
 *   1. Recursively sort all object keys alphabetically (Unicode code point order)
 *   2. Exclude keys with undefined values (they don't exist in JSON)
 *   3. Preserve null values (null is valid JSON)
 *   4. Preserve array element order (arrays are ordered)
 *   5. Serialize with JSON.stringify (no whitespace, no trailing commas)
 *   6. Encode as UTF-8
 *   7. SHA-256 → lowercase hex digest (64 characters)
 *
 * Cross-language contract:
 *   canonicalize(obj) must produce identical strings in TS and Python.
 *   hash(obj) must produce identical 64-char hex digests in TS and Python.
 *   Both are verified by shared fixture files in fixtures/hash-vectors.json.
 */
/**
 * Recursively sort object keys and produce a deterministic JSON string.
 *
 * This is the canonical serialization — the string that gets hashed.
 * The rules are strict and must be exactly replicated in Python.
 */
export declare function canonicalize(value: unknown): string;
/**
 * Compute SHA-256 hash of the canonical representation of a value.
 * Returns a 64-character lowercase hex string.
 */
export declare function hash(value: unknown): string;
/**
 * Verify that a value matches an expected hash.
 */
export declare function verify(value: unknown, expectedHash: string): boolean;
//# sourceMappingURL=hash.d.ts.map