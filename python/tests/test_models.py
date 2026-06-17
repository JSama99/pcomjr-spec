"""PCOMJR Ontology — Model Tests (Python). Updated for content-nested schema."""
import json
import pytest
from talonsight_ontology.generated.enums import *
from talonsight_ontology.generated.models import *


class TestEnums:
    def test_cias_terminals(self):
        assert set(CIAS_TERMINAL_ID) == {"sonic-genesis", "da-cypher", "talonvision", "talonmotion", "talonfly"}
    def test_oias_systems(self):
        assert set(OIAS_SYSTEM_ID) == {"artifact-memory", "decision-intelligence", "pow-ledger", "talon-agent", "talon-llm"}
    def test_knowledge_categories(self):
        assert "bug-fix" in KNOWLEDGE_CATEGORY
        assert "action-item" in KNOWLEDGE_CATEGORY
    def test_memory_bus_event_types(self):
        assert len(MEMORY_BUS_EVENT_TYPE) == 10


class TestArtifact:
    def test_create_with_content(self):
        a = Artifact(
            id="a-1", type="beat", hash="a" * 64,
            timestamp="2026-06-15T12:00:00Z",
            sourceTerminal="sonic-genesis", workspace="sonic-genesis",
            sealed=False, content={"bpm": 140}
        )
        assert a.hash == "a" * 64
        assert a.workspace == "sonic-genesis"
        assert a.sealed == False
        assert a.content == {"bpm": 140}

    def test_optional_fields(self):
        a = Artifact(
            id="a-1", type="beat", hash="a" * 64,
            timestamp="2026-06-15T12:00:00Z",
            sourceTerminal="sonic-genesis", workspace="sonic-genesis",
            sealed=False, content={}
        )
        assert a.powHash is None
        assert a.tags is None


class TestContentNesting:
    def test_beat_with_typed_content(self):
        bc = BeatContent(bpm=140.0, duration=120.0)
        b = Beat(
            id="b-1", type="beat", hash="a" * 64,
            timestamp="2026-06-15T12:00:00Z",
            sourceTerminal="sonic-genesis", workspace="sonic-genesis",
            sealed=False, content=bc
        )
        assert b.content.bpm == 140.0
        assert b.type == "beat"

    def test_decision_with_typed_content(self):
        dc = DecisionContent(
            outcome="Adopt PCOMJR", decisionType="architectural", status="approved",
            contexts=[Context(id="c-1", objective="Unify")],
            evidences=[Evidence(id="e-1", type="analysis", title="Audit", content="Data")],
        )
        d = Decision(
            id="d-1", type="decision", hash="b" * 64,
            timestamp="2026-06-15T12:00:00Z",
            sourceTerminal="decision-intelligence", workspace="decision-intelligence",
            sealed=False, content=dc
        )
        assert d.content.outcome == "Adopt PCOMJR"

    def test_knowledge_node_content(self):
        kc = KnowledgeNodeContent(
            statement="PCOMJR is the standard", category="architecture",
            extractionConfidence=0.95, sourceSessionId="s-1"
        )
        kn = KnowledgeNode(
            id="kn-1", type="knowledge-node", hash="c" * 64,
            timestamp="2026-06-15T12:00:00Z",
            sourceTerminal="artifact-memory", workspace="artifact-memory",
            sealed=False, content=kc
        )
        assert kn.content.statement == "PCOMJR is the standard"
        assert kn.content.category == "architecture"

    def test_session_brief_content(self):
        sc = SessionBriefContent(title="Schema Work", summary="Built PCOMJR schema")
        sb = SessionBrief(
            id="sb-1", type="session-brief", hash="d" * 64,
            timestamp="2026-06-15T12:00:00Z",
            sourceTerminal="artifact-memory", workspace="artifact-memory",
            sealed=False, content=sc
        )
        assert sb.content.title == "Schema Work"

    def test_comic_panel_content(self):
        cc = ComicPanelContent(pageNumber=1, panelNumber=1)
        cp = ComicPanel(
            id="cp-1", type="comic-panel", hash="e" * 64,
            timestamp="2026-06-15T12:00:00Z",
            sourceTerminal="talonvision", workspace="talonvision",
            sealed=False, content=cc
        )
        assert cp.content.pageNumber == 1

    def test_freestyle_session_content(self):
        fc = FreestyleSessionContent(duration=60.0, flowScore=0.82)
        fs = FreestyleSession(
            id="fs-1", type="freestyle-session", hash="f" * 64,
            timestamp="2026-06-15T12:00:00Z",
            sourceTerminal="da-cypher", workspace="da-cypher",
            sealed=False, content=fc
        )
        assert fs.content.flowScore == 0.82


class TestSerialization:
    def test_roundtrip(self):
        bc = BeatContent(bpm=120.0, duration=30.0)
        b = Beat(
            id="b-1", type="beat", hash="a" * 64,
            timestamp="2026-06-15T12:00:00Z",
            sourceTerminal="sonic-genesis", workspace="sonic-genesis",
            sealed=False, content=bc
        )
        data = json.loads(b.model_dump_json())
        b2 = Beat(**data)
        assert b2.content.bpm == 120.0


class TestOIASTypes:
    def test_memory_bus_event(self):
        e = MemoryBusEvent(
            eventId="ev-1", eventType="artifact.created",
            eventTimestamp="2026-06-15T12:00:00Z",
            source="sonic-genesis", payload={"id": "b-1"}, artifactClass="beat"
        )
        assert e.eventType == "artifact.created"

    def test_ledger_entry(self):
        le = LedgerEntry(
            id="le-1", artifactId="a-1", artifactHash="a" * 64,
            artifactType="beat", timestamp="2026-06-15T12:00:00Z"
        )
        assert le.artifactHash == "a" * 64

    def test_seal_event(self):
        se = SealEvent(
            eventId="se-1", decisionId="d-1", hash="b" * 64,
            sealedAt="2026-06-15T12:00:00Z", sealedBy="user-1"
        )
        assert se.sealedBy == "user-1"

    def test_relationship_edge(self):
        re_ = RelationshipEdge(
            id="re-1", sourceId="a-1", targetId="a-2", relationType="derived-from"
        )
        assert re_.relationType == "derived-from"
