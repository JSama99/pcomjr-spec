"""
PCOMJR Data Ontology — Generated Enum Types

AUTO-GENERATED from schema/pcomjr.schema.json
DO NOT EDIT MANUALLY — run `python scripts/generate.py` to regenerate.
"""

from typing import Literal

# Intent types for Agent-to-Agent protocol messages.
A2AIntent = Literal["capture", "verify", "query", "pattern_detect", "stream_query"]

A2A_INTENT: list[A2AIntent] = ["capture", "verify", "query", "pattern_detect", "stream_query"]

# Artifact types produced by CIAS terminals.
CIASArtifactType = Literal["beat", "loop", "stem-bundle", "mix-export", "arrangement", "flow-session", "freestyle-session", "battle-recording", "lyric-composition", "progression-signal", "comic-panel", "comic-page", "character-sheet", "location-sheet", "talonvision-export", "animation-clip", "motion-sequence", "marketplace-listing", "creator-profile", "learning-module", "curriculum"]

CIAS_ARTIFACT_TYPE: list[CIASArtifactType] = ["beat", "loop", "stem-bundle", "mix-export", "arrangement", "flow-session", "freestyle-session", "battle-recording", "lyric-composition", "progression-signal", "comic-panel", "comic-page", "character-sheet", "location-sheet", "talonvision-export", "animation-clip", "motion-sequence", "marketplace-listing", "creator-profile", "learning-module", "curriculum"]

# Identifiers for the five CIAS creative terminals.
CIASTerminalId = Literal["sonic-genesis", "da-cypher", "talonvision", "talonmotion", "talonfly"]

CIAS_TERMINAL_ID: list[CIASTerminalId] = ["sonic-genesis", "da-cypher", "talonvision", "talonmotion", "talonfly"]

# Lifecycle status of a decision.
DecisionStatus = Literal["draft", "in_review", "approved", "rejected", "implemented", "verified", "archived"]

DECISION_STATUS: list[DecisionStatus] = ["draft", "in_review", "approved", "rejected", "implemented", "verified", "archived"]

# Classification of organizational decisions.
DecisionType = Literal["strategic", "operational", "architectural", "tactical", "governance"]

DECISION_TYPE: list[DecisionType] = ["strategic", "operational", "architectural", "tactical", "governance"]

# CIAS = Creative Infrastructure As a Subscription. OIAS = Organizational Infrastructure As a Subscription.
Division = Literal["cias", "oias"]

DIVISION: list[Division] = ["cias", "oias"]

# Classification of evidence supporting a decision.
EvidenceType = Literal["document", "data", "analysis", "precedent", "expert_input", "metric", "external"]

EVIDENCE_TYPE: list[EvidenceType] = ["document", "data", "analysis", "precedent", "expert_input", "metric", "external"]

# Classification of knowledge artifacts extracted from transcripts.
KnowledgeCategory = Literal["architecture", "decision", "bug-fix", "feature", "pattern", "requirement", "insight", "blocker", "milestone", "question", "action-item"]

KNOWLEDGE_CATEGORY: list[KnowledgeCategory] = ["architecture", "decision", "bug-fix", "feature", "pattern", "requirement", "insight", "blocker", "milestone", "question", "action-item"]

# Event types flowing through the Memory Bus.
MemoryBusEventType = Literal["artifact.created", "artifact.updated", "artifact.verified", "artifact.sealed", "artifact.superseded", "decision.created", "decision.sealed", "decision.verified", "pattern.detected", "workflow.proposed"]

MEMORY_BUS_EVENT_TYPE: list[MemoryBusEventType] = ["artifact.created", "artifact.updated", "artifact.verified", "artifact.sealed", "artifact.superseded", "decision.created", "decision.sealed", "decision.verified", "pattern.detected", "workflow.proposed"]

# Artifact types produced by OIAS systems.
OIASArtifactType = Literal["decision", "context", "evidence", "verification", "knowledge-node", "session-brief", "transcript-ingestion", "ledger-entry", "seal-event", "audit-entry", "pattern", "workflow-proposal", "agent-task", "event-claim", "a2a-message", "constellation-cluster"]

OIAS_ARTIFACT_TYPE: list[OIASArtifactType] = ["decision", "context", "evidence", "verification", "knowledge-node", "session-brief", "transcript-ingestion", "ledger-entry", "seal-event", "audit-entry", "pattern", "workflow-proposal", "agent-task", "event-claim", "a2a-message", "constellation-cluster"]

# Identifiers for OIAS infrastructure systems.
OIASSystemId = Literal["artifact-memory", "decision-intelligence", "pow-ledger", "talon-agent", "talon-llm"]

OIAS_SYSTEM_ID: list[OIASSystemId] = ["artifact-memory", "decision-intelligence", "pow-ledger", "talon-agent", "talon-llm"]

# Typed relationships between artifacts in the knowledge graph.
RelationType = Literal["derived-from", "supersedes", "conflicts-with", "references", "implements", "validates", "influenced-by", "enables", "contradicts", "relates-to"]

RELATION_TYPE: list[RelationType] = ["derived-from", "supersedes", "conflicts-with", "references", "implements", "validates", "influenced-by", "enables", "contradicts", "relates-to"]

# Lifecycle status of an artifact's cryptographic verification.
VerificationStatus = Literal["unverified", "pending", "verified", "tampered", "expired"]

VERIFICATION_STATUS: list[VerificationStatus] = ["unverified", "pending", "verified", "tampered", "expired"]
