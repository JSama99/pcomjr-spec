"""PCOMJR Ontology — Constraint Tests (Python). Updated for content-nested schema."""
import pytest
from talonsight_ontology.constraints import (
    validate, validate_or_throw, validate_decision, validate_memory_bus_event,
    validate_seal_event, validate_ledger_entry, validate_knowledge_node,
    validate_relationship_edge, validate_verification,
)

VALID_BEAT = {
    "id": "a-1", "type": "beat", "hash": "a" * 64,
    "timestamp": "2026-06-15T12:00:00.000Z",
    "sourceTerminal": "sonic-genesis", "workspace": "sonic-genesis",
    "sealed": False, "content": {"bpm": 140, "duration": 120},
}

VALID_DECISION = {
    "id": "d-1", "type": "decision", "hash": "b" * 64,
    "timestamp": "2026-06-15T12:00:00.000Z",
    "sourceTerminal": "decision-intelligence", "workspace": "decision-intelligence",
    "sealed": False,
    "content": {
        "outcome": "Adopt PCOMJR", "decisionType": "architectural", "status": "approved",
        "contexts": [{"id": "c-1", "objective": "Unify governance"}],
        "evidences": [{"id": "e-1", "type": "analysis", "title": "Audit", "content": "Converged"}],
        "confidenceLevel": 0.85,
    },
}

VALID_EVENT = {
    "eventId": "ev-1", "eventType": "artifact.created",
    "eventTimestamp": "2026-06-15T12:00:00.000Z",
    "source": "sonic-genesis", "payload": {"id": "beat-1"}, "artifactClass": "beat",
}


class TestArtifactValidation:
    def test_valid_beat(self):
        assert validate(VALID_BEAT).valid
    def test_empty_id(self):
        assert not validate({**VALID_BEAT, "id": ""}).valid
    def test_empty_hash(self):
        assert not validate({**VALID_BEAT, "hash": ""}).valid
    def test_invalid_hash_format(self):
        assert not validate({**VALID_BEAT, "hash": "short"}).valid
    def test_invalid_type(self):
        assert any(v.rule == "invalid-type" for v in validate({**VALID_BEAT, "type": "bogus"}).violations)
    def test_invalid_terminal(self):
        assert any(v.rule == "invalid-terminal" for v in validate({**VALID_BEAT, "sourceTerminal": "unknown"}).violations)
    def test_terminal_type_mismatch(self):
        assert any(v.rule == "terminal-type-mismatch" for v in validate({**VALID_BEAT, "sourceTerminal": "da-cypher"}).violations)
    def test_empty_workspace(self):
        assert not validate({**VALID_BEAT, "workspace": ""}).valid
    def test_missing_sealed(self):
        d = dict(VALID_BEAT)
        d.pop("sealed")
        assert not validate(d).valid
    def test_null_content(self):
        assert not validate({**VALID_BEAT, "content": None}).valid
    def test_valid_pow_hash(self):
        assert not any(v.rule == "invalid-pow-hash" for v in validate({**VALID_BEAT, "powHash": "a" * 64}).violations)
    def test_invalid_pow_hash(self):
        assert any(v.rule == "invalid-pow-hash" for v in validate({**VALID_BEAT, "powHash": "nope"}).violations)


class TestValidateOrThrow:
    def test_valid(self):
        validate_or_throw(VALID_BEAT)
    def test_invalid(self):
        with pytest.raises(ValueError, match="Ontology validation failed"):
            validate_or_throw({**VALID_BEAT, "id": ""})


class TestDecisionValidation:
    def test_valid(self):
        assert validate_decision(VALID_DECISION).valid
    def test_empty_outcome(self):
        c = {**VALID_DECISION["content"], "outcome": ""}
        assert not validate_decision({**VALID_DECISION, "content": c}).valid
    def test_empty_contexts(self):
        c = {**VALID_DECISION["content"], "contexts": []}
        assert not validate_decision({**VALID_DECISION, "content": c}).valid
    def test_empty_evidences(self):
        c = {**VALID_DECISION["content"], "evidences": []}
        assert not validate_decision({**VALID_DECISION, "content": c}).valid
    def test_confidence_above_one(self):
        c = {**VALID_DECISION["content"], "confidenceLevel": 1.5}
        assert not validate_decision({**VALID_DECISION, "content": c}).valid
    def test_confidence_below_zero(self):
        c = {**VALID_DECISION["content"], "confidenceLevel": -0.1}
        assert not validate_decision({**VALID_DECISION, "content": c}).valid


class TestMemoryBusEvent:
    def test_valid(self):
        assert not any(v.severity == "error" for v in validate_memory_bus_event(VALID_EVENT))
    def test_missing_event_id(self):
        assert any(v.rule == "required-eventId" for v in validate_memory_bus_event({**VALID_EVENT, "eventId": ""}))
    def test_invalid_event_type(self):
        assert any(v.rule == "invalid-event-type" for v in validate_memory_bus_event({**VALID_EVENT, "eventType": "bogus"}))
    def test_invalid_source(self):
        assert any(v.rule == "invalid-source" for v in validate_memory_bus_event({**VALID_EVENT, "source": "mystery"}))
    def test_invalid_pow_hash(self):
        assert any(v.rule == "invalid-pow-hash" for v in validate_memory_bus_event({**VALID_EVENT, "powHash": "short"}))
    def test_invalid_timestamp(self):
        assert any(v.rule == "invalid-timestamp" for v in validate_memory_bus_event({**VALID_EVENT, "eventTimestamp": "not-a-date"}))


class TestSealEvent:
    def test_valid(self):
        v = validate_seal_event({"eventId": "e-1", "decisionId": "d-1", "hash": "a" * 64, "sealedAt": "2026-06-15T12:00:00Z", "sealedBy": "user-1"})
        assert not any(x.severity == "error" for x in v)
    def test_all_missing(self):
        assert len(validate_seal_event({"eventId": "", "decisionId": "", "hash": "bad", "sealedAt": "", "sealedBy": ""})) >= 4


class TestLedgerEntry:
    def test_valid(self):
        v = validate_ledger_entry({"id": "le-1", "artifactId": "a-1", "artifactHash": "b" * 64, "timestamp": "2026-06-15T12:00:00Z"})
        assert not any(x.severity == "error" for x in v)
    def test_all_missing(self):
        assert len(validate_ledger_entry({"id": "", "artifactId": "", "artifactHash": "nope", "timestamp": ""})) >= 3


class TestKnowledgeNode:
    def test_valid(self):
        v = validate_knowledge_node({"id": "kn-1", "content": {"statement": "PCOMJR is the standard", "category": "architecture"}})
        assert not any(x.severity == "error" for x in v)
    def test_invalid_category(self):
        v = validate_knowledge_node({"id": "", "content": {"statement": "", "category": "bogus"}})
        assert any(x.rule == "invalid-category" for x in v)


class TestRelationshipEdge:
    def test_valid(self):
        v = validate_relationship_edge({"id": "re-1", "sourceId": "a-1", "targetId": "a-2", "relationType": "derived-from"})
        assert not any(x.severity == "error" for x in v)
    def test_self_reference(self):
        v = validate_relationship_edge({"id": "re-1", "sourceId": "a-1", "targetId": "a-1", "relationType": "derived-from"})
        assert any(x.rule == "self-reference" for x in v)
    def test_invalid_relation_type(self):
        v = validate_relationship_edge({"id": "re-1", "sourceId": "a-1", "targetId": "a-2", "relationType": "bogus"})
        assert any(x.rule == "invalid-relation-type" for x in v)


class TestVerification:
    def test_valid(self):
        v = validate_verification({"id": "v-1", "artifactId": "a-1", "hash": "c" * 64, "status": "verified"})
        assert not any(x.severity == "error" for x in v)
    def test_invalid_hash_and_status(self):
        v = validate_verification({"id": "v-1", "artifactId": "a-1", "hash": "bad", "status": "bogus"})
        assert any(x.rule == "invalid-hash" for x in v)
        assert any(x.rule == "invalid-status" for x in v)
