"""
PCOMJR Data Ontology — Validation Constraints (Python)

Updated for content-nested schema: base Artifact has hash/timestamp/workspace/
sealed/content, subtype fields live inside the content wrapper.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Literal

from .generated.enums import (
    CIAS_ARTIFACT_TYPE, CIAS_TERMINAL_ID,
    DECISION_STATUS, DECISION_TYPE, EVIDENCE_TYPE,
    KNOWLEDGE_CATEGORY, MEMORY_BUS_EVENT_TYPE,
    OIAS_ARTIFACT_TYPE, OIAS_SYSTEM_ID,
    RELATION_TYPE, VERIFICATION_STATUS,
)

ViolationSeverity = Literal["error", "warning"]

@dataclass
class Violation:
    rule: str
    message: str
    severity: ViolationSeverity
    path: str | None = None

@dataclass
class ValidationResult:
    valid: bool
    violations: list[Violation] = field(default_factory=list)

ALL_TERMINALS: list[str] = list(CIAS_TERMINAL_ID) + list(OIAS_SYSTEM_ID)
ALL_ARTIFACT_TYPES: list[str] = list(CIAS_ARTIFACT_TYPE) + list(OIAS_ARTIFACT_TYPE)

TERMINAL_TYPE_MAP: dict[str, list[str]] = {
    "sonic-genesis": ["beat", "loop", "stem-bundle", "mix-export", "arrangement"],
    "da-cypher": ["flow-session", "freestyle-session", "battle-recording", "lyric-composition", "progression-signal"],
    "talonvision": ["comic-panel", "comic-page", "character-sheet", "location-sheet", "talonvision-export"],
    "talonmotion": ["animation-clip", "motion-sequence"],
    "talonfly": ["marketplace-listing", "creator-profile"],
    "artifact-memory": ["knowledge-node", "session-brief", "transcript-ingestion", "constellation-cluster"],
    "decision-intelligence": ["decision", "context", "evidence", "verification", "pattern", "workflow-proposal"],
    "pow-ledger": ["ledger-entry", "seal-event", "audit-entry", "verification"],
    "talon-agent": ["agent-task", "event-claim", "a2a-message"],
    "talon-llm": [],
}

_HASH_RE = re.compile(r"^[a-f0-9]{64}$")

def _err(rule, message, path=None):
    return Violation(rule=rule, message=message, severity="error", path=path)

def _get(obj, key, default=None):
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def validate(artifact: Any) -> ValidationResult:
    violations: list[Violation] = []

    if not _get(artifact, "id"):
        violations.append(_err("required-id", "Artifact must have an id", "id"))
    if not _get(artifact, "type"):
        violations.append(_err("required-type", "Artifact must have a type", "type"))
    if not _get(artifact, "hash"):
        violations.append(_err("required-hash", "Artifact must have a hash", "hash"))
    if not _get(artifact, "timestamp"):
        violations.append(_err("required-timestamp", "Artifact must have a timestamp", "timestamp"))
    if not _get(artifact, "sourceTerminal"):
        violations.append(_err("required-sourceTerminal", "Artifact must have a sourceTerminal", "sourceTerminal"))
    if not _get(artifact, "workspace"):
        violations.append(_err("required-workspace", "Artifact must have a workspace", "workspace"))

    sealed = _get(artifact, "sealed")
    if sealed is None:
        violations.append(_err("required-sealed", "Artifact must have a sealed field", "sealed"))

    if not _get(artifact, "content"):
        violations.append(_err("required-content", "Artifact must have a content object", "content"))

    h = _get(artifact, "hash")
    if h and not _HASH_RE.match(str(h)):
        violations.append(_err("invalid-hash", "hash must be a 64-character lowercase hex string", "hash"))

    art_type = _get(artifact, "type")
    if art_type and art_type not in ALL_ARTIFACT_TYPES:
        violations.append(_err("invalid-type", f"Unknown artifact type: {art_type}", "type"))

    terminal = _get(artifact, "sourceTerminal")
    if terminal and terminal not in ALL_TERMINALS:
        violations.append(_err("invalid-terminal", f"Unknown terminal: {terminal}", "sourceTerminal"))

    if terminal and art_type:
        allowed = TERMINAL_TYPE_MAP.get(terminal)
        if allowed is not None and len(allowed) > 0 and art_type not in allowed:
            violations.append(_err("terminal-type-mismatch", f"Terminal {terminal} cannot produce artifact type {art_type}", "type"))

    pow_hash = _get(artifact, "powHash")
    if pow_hash and not _HASH_RE.match(pow_hash):
        violations.append(_err("invalid-pow-hash", "powHash must be a 64-character lowercase hex string", "powHash"))

    v_status = _get(artifact, "verificationStatus")
    if v_status and v_status not in VERIFICATION_STATUS:
        violations.append(_err("invalid-verification-status", f"Unknown verification status: {v_status}", "verificationStatus"))

    has_errors = any(v.severity == "error" for v in violations)
    return ValidationResult(valid=not has_errors, violations=violations)


def validate_or_throw(artifact: Any) -> None:
    result = validate(artifact)
    if not result.valid:
        errors = [v.message for v in result.violations if v.severity == "error"]
        raise ValueError(f"Ontology validation failed: {'; '.join(errors)}")


def validate_decision(decision: Any) -> ValidationResult:
    base = validate(decision)
    violations = list(base.violations)
    content = _get(decision, "content") or {}
    if isinstance(content, dict):
        c_get = lambda k, d=None: content.get(k, d)
    else:
        c_get = lambda k, d=None: getattr(content, k, d)

    outcome = c_get("outcome")
    if not outcome or not str(outcome).strip():
        violations.append(_err("required-outcome", "Decision must have a non-empty outcome", "content.outcome"))

    d_type = c_get("decisionType")
    if d_type and d_type not in DECISION_TYPE:
        violations.append(_err("invalid-decision-type", f"Unknown decision type: {d_type}", "content.decisionType"))

    status = c_get("status")
    if status and status not in DECISION_STATUS:
        violations.append(_err("invalid-decision-status", f"Unknown decision status: {status}", "content.status"))

    contexts = c_get("contexts")
    if not contexts or len(contexts) == 0:
        violations.append(_err("required-contexts", "Decision must have at least one context", "content.contexts"))

    evidences = c_get("evidences")
    if not evidences or len(evidences) == 0:
        violations.append(_err("required-evidences", "Decision must have at least one piece of evidence", "content.evidences"))

    confidence = c_get("confidenceLevel")
    if confidence is not None:
        if confidence < 0 or confidence > 1:
            violations.append(_err("invalid-confidence", "Confidence level must be between 0 and 1", "content.confidenceLevel"))

    has_errors = any(v.severity == "error" for v in violations)
    return ValidationResult(valid=not has_errors, violations=violations)


def validate_memory_bus_event(event: Any) -> list[Violation]:
    violations: list[Violation] = []
    if not _get(event, "eventId"):
        violations.append(_err("required-eventId", "MemoryBusEvent must have an eventId", "eventId"))
    if not _get(event, "eventType"):
        violations.append(_err("required-eventType", "MemoryBusEvent must have an eventType", "eventType"))
    if not _get(event, "eventTimestamp"):
        violations.append(_err("required-eventTimestamp", "MemoryBusEvent must have an eventTimestamp", "eventTimestamp"))
    if not _get(event, "source"):
        violations.append(_err("required-source", "MemoryBusEvent must have a source", "source"))
    if not _get(event, "payload"):
        violations.append(_err("required-payload", "MemoryBusEvent must have a payload", "payload"))
    if not _get(event, "artifactClass"):
        violations.append(_err("required-artifactClass", "MemoryBusEvent must have an artifactClass", "artifactClass"))
    event_type = _get(event, "eventType")
    if event_type and event_type not in MEMORY_BUS_EVENT_TYPE:
        violations.append(_err("invalid-event-type", f"Unknown event type: {event_type}", "eventType"))
    source = _get(event, "source")
    if source and source not in ALL_TERMINALS:
        violations.append(_err("invalid-source", f"Unknown source terminal: {source}", "source"))
    pow_hash = _get(event, "powHash")
    if pow_hash and not _HASH_RE.match(pow_hash):
        violations.append(_err("invalid-pow-hash", "powHash must be a 64-character lowercase hex string", "powHash"))
    ts = _get(event, "eventTimestamp")
    if ts:
        try:
            datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            violations.append(_err("invalid-timestamp", "eventTimestamp must be a valid ISO 8601 date", "eventTimestamp"))
    return violations


def validate_seal_event(event: Any) -> list[Violation]:
    violations: list[Violation] = []
    if not _get(event, "eventId"):
        violations.append(_err("required-eventId", "SealEvent must have an eventId", "eventId"))
    if not _get(event, "decisionId"):
        violations.append(_err("required-decisionId", "SealEvent must have a decisionId", "decisionId"))
    h = _get(event, "hash")
    if not h or not _HASH_RE.match(str(h)):
        violations.append(_err("invalid-hash", "SealEvent hash must be a 64-character lowercase hex string", "hash"))
    if not _get(event, "sealedAt"):
        violations.append(_err("required-sealedAt", "SealEvent must have a sealedAt timestamp", "sealedAt"))
    if not _get(event, "sealedBy"):
        violations.append(_err("required-sealedBy", "SealEvent must have a sealedBy", "sealedBy"))
    return violations


def validate_ledger_entry(entry: Any) -> list[Violation]:
    violations: list[Violation] = []
    if not _get(entry, "id"):
        violations.append(_err("required-id", "LedgerEntry must have an id", "id"))
    if not _get(entry, "artifactId"):
        violations.append(_err("required-artifactId", "LedgerEntry must have an artifactId", "artifactId"))
    h = _get(entry, "artifactHash")
    if not h or not _HASH_RE.match(str(h)):
        violations.append(_err("invalid-hash", "LedgerEntry artifactHash must be a 64-character lowercase hex string", "artifactHash"))
    if not _get(entry, "timestamp"):
        violations.append(_err("required-timestamp", "LedgerEntry must have a timestamp", "timestamp"))
    return violations


def validate_knowledge_node(node: Any) -> list[Violation]:
    violations: list[Violation] = []
    if not _get(node, "id"):
        violations.append(_err("required-id", "KnowledgeNode must have an id", "id"))
    content = _get(node, "content") or {}
    if isinstance(content, dict):
        c_get = lambda k, d=None: content.get(k, d)
    else:
        c_get = lambda k, d=None: getattr(content, k, d)
    statement = c_get("statement")
    if not statement or not str(statement).strip():
        violations.append(_err("required-statement", "KnowledgeNode must have a non-empty statement", "content.statement"))
    cat = c_get("category")
    if not cat:
        violations.append(_err("required-category", "KnowledgeNode must have a category", "content.category"))
    if cat and cat not in KNOWLEDGE_CATEGORY:
        violations.append(_err("invalid-category", f"Unknown knowledge category: {cat}", "content.category"))
    return violations


def validate_relationship_edge(edge: Any) -> list[Violation]:
    violations: list[Violation] = []
    if not _get(edge, "id"):
        violations.append(_err("required-id", "RelationshipEdge must have an id", "id"))
    if not _get(edge, "sourceId"):
        violations.append(_err("required-sourceId", "RelationshipEdge must have a sourceId", "sourceId"))
    if not _get(edge, "targetId"):
        violations.append(_err("required-targetId", "RelationshipEdge must have a targetId", "targetId"))
    if not _get(edge, "relationType"):
        violations.append(_err("required-relationType", "RelationshipEdge must have a relationType", "relationType"))
    rel = _get(edge, "relationType")
    if rel and rel not in RELATION_TYPE:
        violations.append(_err("invalid-relation-type", f"Unknown relation type: {rel}", "relationType"))
    source_id = _get(edge, "sourceId")
    target_id = _get(edge, "targetId")
    if source_id and target_id and source_id == target_id:
        violations.append(_err("self-reference", "RelationshipEdge cannot reference itself", "targetId"))
    return violations


def validate_verification(verification: Any) -> list[Violation]:
    violations: list[Violation] = []
    if not _get(verification, "id"):
        violations.append(_err("required-id", "Verification must have an id", "id"))
    if not _get(verification, "artifactId"):
        violations.append(_err("required-artifactId", "Verification must have an artifactId", "artifactId"))
    h = _get(verification, "hash")
    if not h or not _HASH_RE.match(str(h)):
        violations.append(_err("invalid-hash", "Verification hash must be a 64-character lowercase hex string", "hash"))
    if not _get(verification, "status"):
        violations.append(_err("required-status", "Verification must have a status", "status"))
    status = _get(verification, "status")
    if status and status not in VERIFICATION_STATUS:
        violations.append(_err("invalid-status", f"Unknown verification status: {status}", "status"))
    return violations
