"""
PCOMJR Canonical Hash

Deterministic SHA-256 hashing for cross-language integrity verification.
Produces identical output in both Python and TypeScript for identical input.

Canonicalization rules:
    1. Recursively sort all dict keys alphabetically (Unicode code point order)
    2. Exclude keys with None-as-undefined semantics (handled by caller)
    3. Preserve None values (null is valid JSON)
    4. Preserve list element order (arrays are ordered)
    5. Serialize with json.dumps (no whitespace, no trailing commas)
       - ensure_ascii=False for proper UTF-8 encoding of non-ASCII chars
       - separators=(',', ':') for compact serialization matching JSON.stringify
    6. Encode as UTF-8
    7. SHA-256 → lowercase hex digest (64 characters)

Cross-language contract:
    canonicalize(obj) must produce identical strings in Python and TypeScript.
    hash(obj) must produce identical 64-char hex digests in Python and TypeScript.
    Both are verified by shared fixture files in fixtures/hash-vectors.json.
"""

import hashlib
import json
from typing import Any


def canonicalize(value: Any) -> str:
    """
    Recursively sort object keys and produce a deterministic JSON string.

    This is the canonical serialization — the string that gets hashed.
    The rules are strict and must be exactly replicated in TypeScript.
    """
    sorted_value = _sort_deep(value)
    return json.dumps(sorted_value, ensure_ascii=False, separators=(",", ":"), sort_keys=False)


def hash_artifact(value: Any) -> str:
    """
    Compute SHA-256 hash of the canonical representation of a value.
    Returns a 64-character lowercase hex string.

    Named hash_artifact to avoid shadowing Python's built-in hash().
    The TypeScript equivalent is named hash().
    """
    canonical = canonicalize(value)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def verify(value: Any, expected_hash: str) -> bool:
    """Verify that a value matches an expected hash."""
    return hash_artifact(value) == expected_hash


def _sort_deep(value: Any) -> Any:
    """
    Recursively sort dict keys. Lists preserve element order.
    None values are preserved (they serialize to JSON null).
    """
    if value is None:
        return None

    if isinstance(value, list):
        return [_sort_deep(item) for item in value]

    if isinstance(value, dict):
        sorted_dict: dict[str, Any] = {}
        for key in sorted(value.keys()):
            v = value[key]
            # Keep None values — they serialize to JSON null
            # (In TypeScript, undefined is stripped; None maps to null, not undefined)
            sorted_dict[key] = _sort_deep(v)
        return sorted_dict

    # Primitives (str, int, float, bool) pass through
    return value
