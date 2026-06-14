/**
 * PCOMJR Ontology — TypeScript Type Definitions
 * =============================================
 * TalonSight Technologies
 *
 * The importable contract for every terminal and platform system.
 * CIAS terminals produce domain Artifact subclasses.
 * OIAS systems operate on the meta-layer (Decision, Context, Evidence, Verification).
 *
 * Usage:
 *   import type { Artifact, Decision, Beat, ComicPanel } from '@talonsight/ontology';
 */
/** The two divisions of TalonSight Technologies. */
export type Division = 'CIAS' | 'OIAS';
/** All registered terminal identifiers. */
export type TerminalId = 'sonic-genesis' | 'da-cypher' | 'talon-vision' | 'talon-motion' | 'talon-fly' | 'talon-learn' | 'talon-agent' | 'artifact-memory' | 'decision-intelligence' | 'pow-ledger';
/** CIAS terminals produce creative artifacts. */
export type CIASTerminalId = Extract<TerminalId, 'sonic-genesis' | 'da-cypher' | 'talon-vision' | 'talon-motion' | 'talon-fly' | 'talon-learn'>;
/** OIAS systems operate on the organizational meta-layer. */
export type OIASSystemId = Extract<TerminalId, 'artifact-memory' | 'decision-intelligence' | 'pow-ledger' | 'talon-agent'>;
/** Discriminator for every concrete artifact subclass. */
export type ArtifactType = 'decision' | 'verification' | 'ledger-entry' | 'pattern' | 'workflow-proposal' | 'beat' | 'loop' | 'flow-session' | 'freestyle-session' | 'lyric-composition' | 'comic-panel' | 'comic-page' | 'character-sheet' | 'location-sheet' | 'animation-clip' | 'marketplace-listing' | 'learning-module' | 'knowledge-node' | 'session-brief' | 'constellation-cluster' | 'relationship-edge' | 'transcript-ingestion' | 'decision-template' | 'decision-review' | 'governance-policy' | 'approval-chain' | 'decision-impact' | 'audit-trail' | 'integrity-report' | 'seal-event' | 'a2a-message' | 'agent-execution' | 'event-claim' | 'task-delegation' | 'orchestrator-routing' | 'generic';
/** Verification status values. */
export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'tampered';
/** Evidence classification. */
export type EvidenceType = 'artifact-ref' | 'external-data' | 'human-input' | 'agent-analysis';
/**
 * The atomic unit of the PCOMJR system.
 * Every piece of work produced by any terminal is an Artifact.
 * Domain subclasses extend this with type-specific fields.
 */
export interface Artifact {
    /** Globally unique identifier (UUID v4). */
    id: string;
    /** Discriminator — determines which subclass this artifact is. */
    type: ArtifactType;
    /** SHA-256 hash of the artifact content. Immutable once sealed. */
    hash: string;
    /** ISO 8601 creation timestamp. */
    timestamp: string;
    /** Terminal that produced this artifact. */
    sourceTerminal: TerminalId;
    /** Workspace within Artifact Memory. */
    workspace: string;
    /** Whether the artifact has been cryptographically sealed. */
    sealed: boolean;
    /** Free-form content payload. Structure varies by type. */
    content: Record<string, unknown>;
    /** Classification tags for search and clustering. */
    tags: string[];
    /** Provenance chain — ID of the artifact this was derived from, if any. */
    derivedFrom?: string;
    /** Agent or user that created this artifact. */
    createdBy?: string;
    /** Session ID this artifact was produced in. */
    sessionId?: string;
}
/**
 * Conditions under which a Decision was made.
 * Preserves the "why now" and "under what constraints" that
 * would otherwise be lost once the decision is recorded.
 */
export interface Context {
    id: string;
    timestamp: string;
    /** What was true at the time of the decision. */
    conditions: Record<string, unknown>;
    /** Runtime/organizational environment (e.g., sprint, quarter, team). */
    environment?: Record<string, unknown>;
    /** Active constraints that shaped the decision space. */
    constraints: string[];
    /** Time window the context applies to. */
    temporalScope?: {
        start: string;
        end?: string;
    };
}
/**
 * Supporting data for a Decision.
 * Always references at least one existing Artifact.
 */
export interface Evidence {
    id: string;
    timestamp: string;
    /** IDs of the artifacts that constitute this evidence. Min: 1. */
    references: [string, ...string[]];
    /** Human-readable description of what this evidence shows. */
    description: string;
    /** Relative importance (0.0 – 1.0). */
    weight: number;
    /** How this evidence was gathered. */
    evidenceType: EvidenceType;
}
/**
 * Decision — a judgment artifact.
 * Subclass of Artifact with required Context and Evidence.
 *
 * CONSTRAINT: hasContext must contain at least one Context.
 * CONSTRAINT: supportedBy must contain at least one Evidence.
 */
export interface Decision extends Artifact {
    type: 'decision';
    /** The contexts under which this decision was made. Min: 1. */
    hasContext: [Context, ...Context[]];
    /** Evidence supporting this decision. Min: 1. */
    supportedBy: [Evidence, ...Evidence[]];
    /** What was decided. */
    outcome: string;
    /** Decision confidence score (0.0 – 1.0). */
    confidence?: number;
    /** People or agents involved in making the decision. */
    participants: string[];
    /** Free-text reasoning for the decision. */
    rationale?: string;
}
/**
 * Verification — a relationship between an Artifact and a LedgerEntry.
 *
 * CONSTRAINT: Must reference exactly one Artifact.
 * CONSTRAINT: Must reference exactly one LedgerEntry.
 */
export interface Verification {
    id: string;
    /** The artifact being verified. */
    artifactId: string;
    /** The ledger entry that records this verification. */
    ledgerEntryId: string;
    /** SHA-256 hash at verification time — compared against artifact.hash. */
    integrityHash: string;
    /** When the verification was performed. */
    verifiedAt: string;
    /** Agent that performed the verification (e.g., Verification Agent ID). */
    verifiedBy: string;
    /** Result of the verification. */
    status: VerificationStatus;
}
/**
 * LedgerEntry — an immutable record in POW Ledger.
 *
 * CONSTRAINT: Only the Capture Agent may create entries (single-writer protocol).
 * CONSTRAINT: hash is a SHA-256 of the artifact content at capture time.
 * CONSTRAINT: sequenceNumber is monotonically increasing per ledger.
 */
export interface LedgerEntry {
    id: string;
    /** The artifact this entry records. */
    artifactId: string;
    /** SHA-256 hash of the artifact at capture time. */
    hash: string;
    /** ISO 8601 timestamp of capture. */
    timestamp: string;
    /** Identity of the Capture Agent (single-writer). */
    captureAgentId: string;
    /** Monotonically increasing sequence number. */
    sequenceNumber: number;
    /** Previous entry ID — forms the chain. Null for first entry. */
    previousEntryId: string | null;
}
/**
 * Pattern — a recurring decision shape detected by the Verification Agent.
 */
export interface Pattern {
    id: string;
    /** Decision IDs where this pattern was observed. Min: 2. */
    decisionIds: [string, string, ...string[]];
    /** Human-readable pattern description. */
    description: string;
    /** Number of times this pattern has been observed. */
    frequency: number;
    /** First and last observation timestamps. */
    firstSeen: string;
    lastSeen: string;
    /** Proposed workflow derived from this pattern, if any. */
    proposalId?: string;
}
/**
 * WorkflowProposal — a suggested reusable workflow derived from a Pattern.
 */
export interface WorkflowProposal {
    id: string;
    /** The pattern this was derived from. */
    patternId: string;
    /** Ordered steps in the proposed workflow. */
    steps: WorkflowStep[];
    /** Confidence that this workflow is worth adopting (0.0 – 1.0). */
    confidence: number;
    /** If/when the workflow was adopted. */
    adoptedAt?: string;
}
export interface WorkflowStep {
    order: number;
    description: string;
    terminalId?: TerminalId;
    artifactType?: ArtifactType;
    required: boolean;
}
export interface Beat extends Artifact {
    type: 'beat';
    sourceTerminal: 'sonic-genesis';
    content: {
        bpm: number;
        key: string;
        genre: string;
        durationSeconds: number;
        stems?: string[];
        generationModel: string;
    };
}
export interface Loop extends Artifact {
    type: 'loop';
    sourceTerminal: 'sonic-genesis';
    content: {
        sections: LoopSection[];
        totalDurationSeconds: number;
        dspSuggestStructure?: Record<string, unknown>;
    };
}
export interface LoopSection {
    name: string;
    bpm: number;
    key: string;
    durationSeconds: number;
    beatId?: string;
}
export interface FlowSession extends Artifact {
    type: 'flow-session';
    sourceTerminal: 'sonic-genesis';
    content: {
        scenes: string[];
        sessionTapeUrl?: string;
        flipThisSamples?: string[];
        durationSeconds: number;
    };
}
export interface FreestyleSession extends Artifact {
    type: 'freestyle-session';
    sourceTerminal: 'da-cypher';
    content: {
        beatId?: string;
        durationSeconds: number;
        transcript?: string;
        skillScores: Record<string, number>;
        curriculumTier?: number;
        progressionSignals?: ProgressionSignal[];
    };
}
export interface ProgressionSignal {
    signal: 'weakness' | 'staleness' | 'ceiling-plateau' | 'streak-continuation' | 'near-mastery';
    weight: number;
    skillId: string;
}
export interface LyricComposition extends Artifact {
    type: 'lyric-composition';
    sourceTerminal: 'da-cypher';
    content: {
        lyrics: string;
        rhymeScheme?: string;
        syllableCount?: number;
        rhymeToolsUsed?: string[];
    };
}
export interface ComicPanel extends Artifact {
    type: 'comic-panel';
    sourceTerminal: 'talon-vision';
    content: {
        imageUrl: string;
        panelNumber: number;
        pageId?: string;
        scriptLine?: string;
        characters: string[];
        location?: string;
        generationMethod: 'generateContent' | 'editImage';
        referenceImages?: string[];
    };
}
export interface ComicPage extends Artifact {
    type: 'comic-page';
    sourceTerminal: 'talon-vision';
    content: {
        panelIds: string[];
        pageNumber: number;
        layout: string;
        chapterId?: string;
    };
}
export interface CharacterSheet extends Artifact {
    type: 'character-sheet';
    sourceTerminal: 'talon-vision';
    content: {
        characterName: string;
        referenceImages: string[];
        outfitVariants?: Record<string, string>;
        description: string;
    };
}
export interface LocationSheet extends Artifact {
    type: 'location-sheet';
    sourceTerminal: 'talon-vision';
    content: {
        locationName: string;
        referenceImages: string[];
        description: string;
        atmosphere?: string;
    };
}
export interface AnimationClip extends Artifact {
    type: 'animation-clip';
    sourceTerminal: 'talon-motion';
    content: {
        sourceArtifactIds: string[];
        durationSeconds: number;
        resolution: string;
        format: string;
        exportContract?: TalonVisionExportV1;
    };
}
/** The handoff contract from TalonVision to TalonMotion. */
export interface TalonVisionExportV1 {
    version: '1.0';
    panels: Array<{
        panelId: string;
        imageUrl: string;
        characters: string[];
        motion?: string;
    }>;
}
export interface MarketplaceListing extends Artifact {
    type: 'marketplace-listing';
    sourceTerminal: 'talon-fly';
    content: {
        title: string;
        description: string;
        price: number;
        currency: string;
        creatorId: string;
        sourceArtifactIds: string[];
        provenanceVerified: boolean;
    };
}
export interface LearningModule extends Artifact {
    type: 'learning-module';
    sourceTerminal: 'talon-learn';
    content: {
        title: string;
        curriculum: string;
        lessons: string[];
        assessments?: string[];
        powEmissionLayerEnabled: boolean;
    };
}
/**
 * Every event emitted to the Memory Bus (/api/memory/events)
 * must conform to this shape. The ontology makes the bus
 * semantically typed — not just event-typed.
 */
export interface MemoryBusEvent<T extends Artifact = Artifact> {
    /** Event identifier. */
    eventId: string;
    /** What happened. */
    eventType: 'artifact.created' | 'artifact.updated' | 'artifact.sealed' | 'decision.captured' | 'verification.completed' | 'pattern.detected' | 'workflow.proposed' | 'workflow.adopted';
    /** ISO 8601 timestamp of the event. */
    eventTimestamp: string;
    /** The terminal or system that emitted this event. */
    source: TerminalId;
    /** The artifact payload, typed by subclass. */
    payload: T;
    /** Ontological class name for downstream routing. */
    artifactClass: ArtifactType;
    /** Optional: IDs of related artifacts for graph construction. */
    relatedArtifactIds?: string[];
}
/**
 * Terminal registration record.
 * Each terminal declares what artifact subclasses it produces.
 */
export interface TerminalRegistration {
    id: TerminalId;
    name: string;
    division: Division;
    produces: ArtifactType[];
    memoryBusEndpoint: string;
    version: string;
}
export declare function isDecision(a: Artifact): a is Decision;
export declare function isBeat(a: Artifact): a is Beat;
export declare function isComicPanel(a: Artifact): a is ComicPanel;
export declare function isFreestyleSession(a: Artifact): a is FreestyleSession;
export declare function isVerifiedArtifact(a: Artifact): boolean;
export declare function isCIASArtifact(a: Artifact): boolean;
export declare function isOIASArtifact(a: Artifact): boolean;
//# sourceMappingURL=pcomjr-types.d.ts.map