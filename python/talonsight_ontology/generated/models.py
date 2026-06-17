"""
PCOMJR Data Ontology — Generated Pydantic Models

AUTO-GENERATED from schema/pcomjr.schema.json
DO NOT EDIT MANUALLY — run `python scripts/generate.py` to regenerate.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

from .enums import (
    A2AIntent,
    CIASArtifactType,
    CIASTerminalId,
    DecisionStatus,
    DecisionType,
    Division,
    EvidenceType,
    KnowledgeCategory,
    MemoryBusEventType,
    OIASArtifactType,
    OIASSystemId,
    RelationType,
    VerificationStatus,
)

# Union of all artifact types across both divisions.
ArtifactType = CIASArtifactType | OIASArtifactType

# Any terminal or system in the TST ecosystem.
TerminalId = CIASTerminalId | OIASSystemId


class A2AMessage(BaseModel):
    """Agent-to-Agent protocol message — used for inter-agent communication in the POW Ledger system."""

    messageId: str
    intent: A2AIntent
    source: str = Field(..., description="Source agent identifier.")
    target: str = Field(..., description="Target agent identifier.")
    payload: dict[str, Any]
    timestamp: str
    correlationId: Optional[str] = Field(default=None, description="Links related messages across agents.")
    responseTo: Optional[str] = Field(default=None, description="MessageId this is responding to.")


class AgentIdentity(BaseModel):
    """Identity record for a Talon Agent."""

    agentId: str
    name: str
    description: Optional[str] = None
    capabilities: list[str]
    permissions: Optional[list["AgentPermission"]] = None
    status: Optional[Literal["active", "suspended", "decommissioned"]] = None


class AgentPermission(BaseModel):

    resource: str
    actions: list[Literal["read", "write", "execute", "delegate"]]
    conditions: Optional[dict[str, Any]] = None


class Alternative(BaseModel):
    """An alternative considered and rejected during decision-making."""

    id: str
    title: str
    description: Optional[str] = None
    rejectionReason: str


class AnimationClipContent(BaseModel):

    projectId: Optional[str] = None
    duration: float
    resolution: Optional[dict[str, Any]] = None
    fps: Optional[float] = None
    videoUrl: Optional[str] = None
    sourcePackageId: Optional[str] = Field(default=None, description="TalonVisionExport package this was rendered from.")


class AuditEntry(BaseModel):

    id: str
    action: str
    timestamp: str
    actor: str
    hash: Optional[str] = None
    details: Optional[dict[str, Any]] = None


class AuditTrail(BaseModel):
    """A complete audit trail for an artifact — all ledger entries and verifications."""

    artifactId: str
    entries: list["AuditEntry"]
    integrityStatus: Optional[VerificationStatus] = None
    lastVerified: Optional[str] = None


class BeatContent(BaseModel):

    bpm: float
    key: Optional[str] = Field(default=None, description="Musical key, e.g. 'C minor'.")
    scale: Optional[str] = None
    genre: Optional[str] = None
    mood: Optional[str] = None
    duration: float = Field(..., description="Duration in seconds.")
    stemUrls: Optional[dict[str, str]] = Field(default=None, description="Map of stem name to URL.")
    generationModel: Optional[str] = Field(default=None, description="Which model generated this beat.")
    generationPrompt: Optional[str] = None


class CharacterSheetContent(BaseModel):

    characterName: str
    characterId: Optional[str] = None
    referenceImages: Optional[list[str]] = None
    designNotes: Optional[str] = None
    canonicalSeed: Optional[int] = Field(default=None, description="Seed for reproducible generation.")
    outfits: Optional[list[dict[str, Any]]] = None
    voiceCasting: Optional[dict[str, Any]] = None


class ComicPageContent(BaseModel):

    projectId: Optional[str] = None
    pageNumber: int
    panels: list["ComicPanel"]
    layoutType: Optional[str] = None


class ComicPanelContent(BaseModel):

    projectId: Optional[str] = None
    pageNumber: int
    panelNumber: int
    sceneId: Optional[str] = None
    dialogueText: Optional[str] = None
    actionText: Optional[str] = None
    characterIds: Optional[list[str]] = None
    imageUrl: Optional[str] = None
    generationPrompt: Optional[str] = None
    generationModel: Optional[str] = None


class ConstellationClusterContent(BaseModel):

    workspaceName: str = Field(..., description="Workspace this cluster represents.")
    terminal: "TerminalId" = Field(..., description="Terminal this workspace belongs to.")
    artifactCount: int = Field(..., description="Number of artifacts in this cluster.")
    color: str = Field(..., description="Hex color for the cluster.")
    position: Optional[dict[str, Any]] = None


class Context(BaseModel):
    """Structured context record — captures the conditions under which a decision was made. PCOMJR Stage 2."""

    id: str
    objective: str = Field(..., description="What success looks like.")
    constraints: Optional[list[str]] = Field(default=None, description="What cannot change.")
    assumptions: Optional[list[str]] = Field(default=None, description="What is believed true but unverified.")
    risks: Optional[list[str]] = Field(default=None, description="What could go wrong.")
    environment: Optional[str] = Field(default=None, description="The technical, organizational, or market conditions.")
    timeframe: Optional[str] = Field(default=None, description="When this context is valid.")


class DecisionContent(BaseModel):

    outcome: str = Field(..., description="The decision that was made.")
    decisionType: DecisionType
    status: DecisionStatus
    contexts: list["Context"] = Field(..., description="At least one context record is required.")
    evidences: list["Evidence"] = Field(..., description="At least one piece of evidence is required.")
    alternatives: Optional[list["Alternative"]] = Field(default=None, description="Alternatives considered and rejected.")
    confidenceLevel: Optional[float] = Field(default=None, description="Predicted confidence in the decision's success.")
    owner: Optional[str] = Field(default=None, description="Who owns this decision.")
    reviewers: Optional[list[str]] = None
    successScore: Optional[float] = Field(default=None, description="Measured success after implementation.")
    impactScore: Optional[float] = Field(default=None, description="Measured organizational impact.")
    lessonsLearned: Optional[str] = Field(default=None, description="Post-implementation lessons.")
    unexpectedConsequences: Optional[str] = None


class EventClaim(BaseModel):
    """An agent's claim on an event for processing — uses atomic SELECT FOR UPDATE SKIP LOCKED."""

    eventId: str
    agentId: str
    claimedAt: str
    completedAt: Optional[str] = None
    status: Literal["claimed", "processing", "completed", "failed", "expired"]
    result: Optional[dict[str, Any]] = None


class Evidence(BaseModel):
    """A piece of evidence supporting a decision. PCOMJR Stage 3 (Orchestrator output)."""

    id: str
    type: EvidenceType
    title: str
    content: str = Field(..., description="The evidence body text or summary.")
    source: Optional[str] = Field(default=None, description="Where this evidence came from.")
    attachmentUrl: Optional[str] = Field(default=None, description="URL to supporting material.")
    confidence: Optional[float] = Field(default=None, description="How reliable this evidence is.")


class FreestyleSessionContent(BaseModel):

    beatId: Optional[str] = Field(default=None, description="ID of the beat used.")
    duration: float = Field(..., description="Session duration in seconds.")
    bpm: Optional[float] = None
    transcript: Optional[str] = Field(default=None, description="Transcribed lyrics.")
    flowScore: Optional[float] = None
    rhymeScore: Optional[float] = None
    deliveryScore: Optional[float] = None
    overallScore: Optional[float] = None
    skillSignals: Optional[dict[str, Any]] = None


class IntegrityReport(BaseModel):
    """Result of verifying an artifact's integrity against the POW Ledger."""

    artifactId: str
    status: VerificationStatus
    expectedHash: Optional[str] = None
    actualHash: Optional[str] = None
    checkedAt: str
    chainValid: Optional[bool] = None
    discrepancies: Optional[list[str]] = None


class KnowledgeNodeContent(BaseModel):

    statement: str = Field(..., description="The extracted knowledge statement.")
    category: KnowledgeCategory
    extractionConfidence: float = Field(..., description="Confidence in extraction accuracy (0.0-1.0).")
    sourceSessionId: str = Field(..., description="Source transcript or session ID.")
    originTerminal: Optional["TerminalId"] = Field(default=None, description="Terminal where the original work occurred.")
    entities: Optional[list[str]] = Field(default=None, description="Entity names mentioned.")
    relatedNodeIds: Optional[list[str]] = Field(default=None, description="Related knowledge node IDs.")


class LearningModuleContent(BaseModel):

    curriculum: Optional[str] = None
    difficulty: Optional[Literal["beginner", "intermediate", "advanced", "expert"]] = None
    estimatedMinutes: Optional[int] = None
    prerequisites: Optional[list[str]] = None
    objectives: Optional[list[str]] = None


class LedgerEntry(BaseModel):
    """An entry in the POW Ledger — a tamper-evident record linking an artifact to its cryptographic proof."""

    id: str
    artifactId: str = Field(..., description="ID of the artifact being recorded.")
    artifactHash: str = Field(..., description="SHA-256 hash of the canonical artifact.")
    artifactType: str = Field(..., description="Type of the recorded artifact.")
    signature: Optional[str] = Field(default=None, description="Chain link — hash incorporating the previous entry.")
    timestamp: str
    metadata: Optional[dict[str, Any]] = None
    source: Optional["TerminalId"] = Field(default=None, description="Which terminal or system created this entry.")


class LocationSheetContent(BaseModel):

    locationName: str
    environmentType: Optional[str] = None
    referenceImages: Optional[list[str]] = None
    designNotes: Optional[str] = None
    atmosphericPrompt: Optional[str] = Field(default=None, description="Prefix/suffix prompt for atmospheric generation.")


class LoopContent(BaseModel):

    sections: list["LoopSection"]
    totalDuration: Optional[float] = None
    masterBpm: Optional[float] = None


class LoopSection(BaseModel):

    id: str
    name: str
    order: int
    duration: float
    bpm: Optional[float] = None
    prompt: Optional[str] = None
    audioUrl: Optional[str] = None


class LyricCompositionContent(BaseModel):

    beatId: Optional[str] = None
    bpm: Optional[float] = None
    mood: Optional[str] = None
    topic: Optional[str] = None
    totalBars: int
    totalWords: int
    verses: Optional[list["LyricVerse"]] = None


class LyricVerse(BaseModel):

    id: str
    sectionType: Optional[str] = None
    label: Optional[str] = None
    content: str
    verseOrder: int
    barCount: Optional[int] = None
    syllableCount: Optional[int] = None


class MarketplaceListingContent(BaseModel):

    price: float
    currency: str
    artifactRef: Optional[str] = Field(default=None, description="ID of the artifact being listed.")
    creatorId: Optional[str] = None
    status: Optional[Literal["draft", "active", "sold", "delisted"]] = None
    provenanceHash: Optional[str] = None


class MemoryBusEvent(BaseModel):
    """An event flowing through the Memory Bus — the central ingestion pathway for all artifact events across the TST ecosystem."""

    eventId: str = Field(..., description="Globally unique event identifier.")
    eventType: MemoryBusEventType = Field(..., description="What happened.")
    eventTimestamp: str = Field(..., description="When it happened (ISO 8601 UTC).")
    source: "TerminalId" = Field(..., description="Which terminal emitted this event.")
    payload: dict[str, Any] = Field(..., description="The artifact or entity being reported.")
    artifactClass: str = Field(..., description="The artifact type for routing (e.g. 'beat', 'decision', 'knowledge_node').")
    correlationId: Optional[str] = Field(default=None, description="Links related events across systems.")
    powHash: Optional[str] = Field(default=None, description="Hash of the payload for integrity verification.")


class OrchestratorRouting(BaseModel):
    """Routing decision made by the orchestrator agent — which agent handles which intent."""

    intent: A2AIntent
    selectedAgent: str
    confidence: float
    alternativeAgents: Optional[list[str]] = None
    routingReason: Optional[str] = None


class Pattern(BaseModel):
    """A detected pattern across multiple decisions or artifacts."""

    id: str
    name: str
    description: Optional[str] = None
    patternType: Literal["recurring_success", "recurring_failure", "overconfidence", "underconfidence", "process_gap", "workflow_candidate"]
    occurrences: int
    artifactIds: Optional[list[str]] = None
    confidence: Optional[float] = None
    detectedAt: str
    recommendation: Optional[str] = None


class ProgressionSignalContent(BaseModel):

    skillId: str
    signalType: Literal["weakness", "staleness", "ceiling_plateau", "streak_continuation", "near_mastery"]
    value: float
    sessionId: Optional[str] = None


class RelationshipEdge(BaseModel):
    """An edge in the knowledge graph connecting two artifacts or knowledge nodes."""

    id: str
    sourceId: str
    targetId: str
    relationType: RelationType
    confidence: Optional[float] = None
    detectedBy: Optional[Literal["manual", "temporal", "ai_extraction", "cross_reference"]] = None
    createdAt: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class SealEvent(BaseModel):
    """Event emitted when a decision is sealed — cryptographically committed to the POW Ledger."""

    eventId: str
    decisionId: str
    hash: str
    sealedAt: str
    sealedBy: str
    ledgerEntryId: Optional[str] = None
    previousHash: Optional[str] = None


class SessionBriefContent(BaseModel):

    title: str = Field(..., description="Human-readable session title.")
    summary: str = Field(..., description="Executive summary (2-3 sentences).")
    decisionsIdentified: Optional[list[str]] = Field(default=None, description="Key decisions made.")
    artifactsProduced: Optional[list[str]] = Field(default=None, description="Artifacts produced or modified.")
    openItems: Optional[list[str]] = Field(default=None, description="Unresolved items or open questions.")
    terminalsInvolved: Optional[list["TerminalId"]] = Field(default=None, description="Terminals involved.")
    nodeCount: Optional[int] = Field(default=None, description="Knowledge nodes extracted.")
    generationModel: Optional[str] = Field(default=None, description="Model used for brief generation.")


class TaskDelegation(BaseModel):
    """A task delegated from the orchestrator to a specialist agent."""

    taskId: str
    fromAgent: str
    toAgent: str
    instruction: str
    delegatedAt: str
    deadline: Optional[str] = None
    priority: Optional[Literal["low", "normal", "high", "critical"]] = None
    status: Optional[Literal["pending", "accepted", "in_progress", "completed", "failed"]] = None


class TerminalRegistration(BaseModel):
    """Registration record for a terminal in the TST ecosystem."""

    terminalId: "TerminalId"
    name: str
    division: Division
    description: Optional[str] = None
    artifactTypes: list[str] = Field(..., description="Artifact types this terminal is authorized to produce.")
    version: Optional[str] = None
    status: Optional[Literal["active", "maintenance", "deprecated"]] = None
    endpoint: Optional[str] = None
    memoryBusEnabled: Optional[bool] = False


class TranscriptIngestionContent(BaseModel):

    sessionId: str
    workspaceId: Optional[str] = None
    status: Literal["pending", "processing", "completed", "failed"]
    startedAt: str
    completedAt: Optional[str] = None
    artifactsExtracted: Optional[int] = None
    chunksProcessed: Optional[int] = None
    errors: Optional[list[str]] = None


class Verification(BaseModel):
    """A verification record — proves an artifact existed in a specific form at a specific time."""

    id: str
    artifactId: str
    hash: str
    expectedHash: Optional[str] = None
    status: VerificationStatus
    verifiedAt: str
    verifiedBy: Optional[str] = None
    discrepancies: Optional[list[str]] = None


class WorkflowProposal(BaseModel):
    """A proposed reusable workflow derived from detected patterns."""

    id: str
    name: str
    description: Optional[str] = None
    steps: list["WorkflowStep"]
    sourcePatternId: str
    proposedAt: Optional[str] = None
    status: Optional[Literal["proposed", "accepted", "rejected", "active"]] = None


class WorkflowStep(BaseModel):

    order: int
    action: str
    stage: Literal["pipeline", "context", "orchestrator", "model", "judgment", "artifact", "reliability"]
    assignee: Optional[str] = None
    requiredEvidence: Optional[list[str]] = None


class Artifact(BaseModel):
    """Base artifact — the fundamental unit of work output in the PCOMJR pipeline. Every creative or organizational output is an artifact."""

    id: str = Field(..., description="Globally unique artifact identifier.")
    type: "ArtifactType" = Field(..., description="Artifact type classification.")
    sourceTerminal: "TerminalId" = Field(..., description="The terminal that produced this artifact.")
    tags: Optional[list[str]] = Field(default=None, description="Freeform tags for discovery.")
    powHash: Optional[str] = Field(default=None, description="SHA-256 hash of the canonical artifact representation.")
    powAnchoredAt: Optional[str] = Field(default=None, description="Timestamp when the artifact was anchored to the POW Ledger.")
    powEventId: Optional[str] = Field(default=None, description="Reference to the POW Ledger event that anchored this artifact.")
    verificationStatus: Optional[VerificationStatus] = Field(default=None, description="Current verification state.")
    hash: str = Field(..., description="SHA-256 hex hash of the canonical content representation.")
    timestamp: str = Field(..., description="ISO 8601 UTC creation timestamp.")
    workspace: str = Field(..., description="Workspace or context that produced this artifact.")
    sealed: bool = Field(..., description="Whether the artifact has been sealed to the POW Ledger.")
    content: dict[str, Any] = Field(..., description="Type-specific content fields.")


class AnimationClip(Artifact):
    """An animation or video clip — TalonMotion artifact."""

    type: Literal["animation-clip"] = "animation-clip"
    sourceTerminal: Literal["talonmotion"] = "talonmotion"
    content: "AnimationClipContent"


class Beat(Artifact):
    """A musical beat — Sonic Genesis artifact."""

    type: Literal["beat"] = "beat"
    sourceTerminal: Literal["sonic-genesis"] = "sonic-genesis"
    content: "BeatContent"


class CharacterSheet(Artifact):
    """A character design sheet — TalonVision artifact."""

    type: Literal["character-sheet"] = "character-sheet"
    sourceTerminal: Literal["talonvision"] = "talonvision"
    content: "CharacterSheetContent"


class ComicPage(Artifact):
    """A full comic page containing multiple panels — TalonVision artifact."""

    type: Literal["comic-page"] = "comic-page"
    sourceTerminal: Literal["talonvision"] = "talonvision"
    content: "ComicPageContent"


class ComicPanel(Artifact):
    """A single comic panel — TalonVision artifact."""

    type: Literal["comic-panel"] = "comic-panel"
    sourceTerminal: Literal["talonvision"] = "talonvision"
    content: "ComicPanelContent"


class ConstellationCluster(Artifact):
    """A cluster in the constellation visualization — groups artifacts by workspace or origin."""

    type: Literal["constellation-cluster"] = "constellation-cluster"
    sourceTerminal: Literal["artifact-memory"] = "artifact-memory"
    content: "ConstellationClusterContent"


class FreestyleSession(Artifact):
    """A freestyle rap session — Da Cypher artifact."""

    type: Literal["freestyle-session"] = "freestyle-session"
    sourceTerminal: Literal["da-cypher"] = "da-cypher"
    content: "FreestyleSessionContent"


class KnowledgeNode(Artifact):
    """A node in the Artifact Memory knowledge graph — extracted from AI chat transcripts."""

    type: Literal["knowledge-node"] = "knowledge-node"
    sourceTerminal: Literal["artifact-memory"] = "artifact-memory"
    content: "KnowledgeNodeContent"


class LearningModule(Artifact):
    """A learning module — TalonLearn artifact."""

    type: Literal["learning-module"] = "learning-module"
    content: "LearningModuleContent"


class LocationSheet(Artifact):
    """A location/environment design sheet — TalonVision artifact."""

    type: Literal["location-sheet"] = "location-sheet"
    sourceTerminal: Literal["talonvision"] = "talonvision"
    content: "LocationSheetContent"


class Loop(Artifact):
    """A multi-section loop arrangement — Sonic Genesis Loop Studio artifact."""

    type: Literal["loop"] = "loop"
    sourceTerminal: Literal["sonic-genesis"] = "sonic-genesis"
    content: "LoopContent"


class LyricComposition(Artifact):
    """A written lyric composition — Da Cypher Lyric Mode artifact."""

    type: Literal["lyric-composition"] = "lyric-composition"
    sourceTerminal: Literal["da-cypher"] = "da-cypher"
    content: "LyricCompositionContent"


class MarketplaceListing(Artifact):
    """A marketplace listing — TalonFly artifact."""

    type: Literal["marketplace-listing"] = "marketplace-listing"
    sourceTerminal: Literal["talonfly"] = "talonfly"
    content: "MarketplaceListingContent"


class ProgressionSignal(Artifact):
    """A skill progression signal — Da Cypher training artifact."""

    type: Literal["progression-signal"] = "progression-signal"
    sourceTerminal: Literal["da-cypher"] = "da-cypher"
    content: "ProgressionSignalContent"


class SessionBrief(Artifact):
    """A generated summary of a workspace's artifacts — produced by Artifact Memory."""

    type: Literal["session-brief"] = "session-brief"
    sourceTerminal: Literal["artifact-memory"] = "artifact-memory"
    content: "SessionBriefContent"


class TranscriptIngestion(Artifact):
    """Metadata for a transcript ingestion job in Artifact Memory."""

    type: Literal["transcript-ingestion"] = "transcript-ingestion"
    sourceTerminal: Literal["artifact-memory"] = "artifact-memory"
    content: "TranscriptIngestionContent"


class Decision(Artifact):
    """An organizational decision — the core entity of the PCOMJR Judgment stage. Extends Artifact with decision-specific fields."""

    type: Literal["decision"] = "decision"
    content: "DecisionContent"
