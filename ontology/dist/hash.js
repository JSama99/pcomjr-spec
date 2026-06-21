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
import { createHash } from 'crypto';
/**
 * Recursively sort object keys and produce a deterministic JSON string.
 *
 * This is the canonical serialization — the string that gets hashed.
 * The rules are strict and must be exactly replicated in Python.
 */
export function canonicalize(value) {
    return JSON.stringify(sortDeep(value));
}
/**
 * Compute SHA-256 hash of the canonical representation of a value.
 * Returns a 64-character lowercase hex string.
 */
export function hash(value) {
    const canonical = canonicalize(value);
    return createHash('sha256').update(canonical, 'utf8').digest('hex');
}
/**
 * Verify that a value matches an expected hash.
 */
export function verify(value, expectedHash) {
    return hash(value) === expectedHash;
}
/**
 * Recursively sort object keys. Arrays preserve element order.
 * undefined values are stripped (they can't exist in JSON).
 * null values are preserved.
 */
function sortDeep(value) {
    // null
    if (value === null)
        return null;
    // undefined → should not appear in canonical form
    if (value === undefined)
        return undefined;
    // Arrays: preserve order, recursively sort elements
    if (Array.isArray(value)) {
        return value.map(sortDeep);
    }
    // Objects: sort keys, recursively sort values
    if (typeof value === 'object') {
        const sorted = {};
        const keys = Object.keys(value).sort();
        for (const key of keys) {
            const v = value[key];
            // Skip undefined values — they don't exist in JSON
            if (v !== undefined) {
                sorted[key] = sortDeep(v);
            }
        }
        return sorted;
    }
    // Primitives (string, number, boolean) pass through
    return value;
}
//# sourceMappingURL=hash.js.map