# PCOMJR Ontology — Integration Guide

## How to Apply This to Every System in the Stack

This guide covers the exact code changes for each terminal and OIAS system.
There are three phases: install, integrate, enforce.

---

## Phase 1: Install (30 minutes)

### 1A. Publish the package locally

The ontology lives in its own repo (or as a directory in `pcomjr-spec`).
Every terminal installs it as a local dependency.

```bash
# In the ontology directory
cd pcomjr-spec/ontology
npm install
npm run test    # 122 tests pass
npm run build   # Emits dist/ with .js + .d.ts

# In each terminal's repo, install via path
cd ../sonic-genesis
npm install ../pcomjr-spec/ontology

# Or via GitHub (once pushed)
npm install github:JSama99/pcomjr-spec#ontology
```

Every terminal now has:
```typescript
import type { Beat, Artifact } from '@talonsight/ontology';
import { validate, validateOrThrow } from '@talonsight/ontology/constraints';
```

---

## Phase 2: Integrate (per-system)

### CIAS Terminals

The pattern is identical for every CIAS terminal:
1. Import the artifact subclass type
2. Build artifacts that conform to it
3. Call `validateOrThrow()` before emitting to the Memory Bus
4. Emit a typed `MemoryBusEvent`

#### Sonic Genesis — Beat Creation

**Before** (untyped):
```typescript
// Somewhere in the beat generation pipeline
const beat = {
  id: crypto.randomUUID(),
  bpm: 140,
  key: 'Am',
  genre: 'trap',
  audio: audioBuffer,
  createdAt: new Date().toISOString(),
};
await saveBeat(beat);
```

**After** (ontology-backed):
```typescript
import type { Beat, MemoryBusEvent } from '@talonsight/ontology';
import { validateOrThrow } from '@talonsight/ontology/constraints';
import { createHash } from 'crypto';

function createBeat(params: {
  bpm: number; key: string; genre: string;
  durationSeconds: number; generationModel: string;
  audioBuffer: Buffer;
}): Beat {
  const content = {
    bpm: params.bpm,
    key: params.key,
    genre: params.genre,
    durationSeconds: params.durationSeconds,
    generationModel: params.generationModel,
  };

  const beat: Beat = {
    id: crypto.randomUUID(),
    type: 'beat',
    hash: createHash('sha256').update(JSON.stringify(content)).digest('hex'),
    timestamp: new Date().toISOString(),
    sourceTerminal: 'sonic-genesis',
    workspace: 'sonic-genesis',
    sealed: false,
    content,
    tags: [params.genre, params.key],
  };

  // Ontology validation — catches type/terminal mismatches,
  // missing fields, invalid hashes before they hit the bus
  validateOrThrow(beat);
  return beat;
}

// Emit to Memory Bus
async function emitBeat(beat: Beat): Promise<void> {
  const event: MemoryBusEvent<Beat> = {
    eventId: crypto.randomUUID(),
    eventType: 'artifact.created',
    eventTimestamp: new Date().toISOString(),
    source: 'sonic-genesis',
    payload: beat,
    artifactClass: 'beat',
  };

  await fetch('/api/memory/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
}
```

#### Da Cypher — FreestyleSession

```typescript
import type { FreestyleSession } from '@talonsight/ontology';
import { validateOrThrow } from '@talonsight/ontology/constraints';

function createFreestyleSession(params: {
  beatId?: string;
  durationSeconds: number;
  transcript: string;
  skillScores: Record<string, number>;
  curriculumTier: number;
}): FreestyleSession {
  const session: FreestyleSession = {
    id: crypto.randomUUID(),
    type: 'freestyle-session',
    hash: createHash('sha256').update(JSON.stringify(params)).digest('hex'),
    timestamp: new Date().toISOString(),
    sourceTerminal: 'da-cypher',
    workspace: 'da-cypher',
    sealed: false,
    content: {
      beatId: params.beatId,
      durationSeconds: params.durationSeconds,
      transcript: params.transcript,
      skillScores: params.skillScores,
      curriculumTier: params.curriculumTier,
    },
    tags: ['freestyle', `tier-${params.curriculumTier}`],
  };

  validateOrThrow(session);
  return session;
}
```

#### TalonVision — ComicPanel

```typescript
import type { ComicPanel } from '@talonsight/ontology';
import { validateOrThrow } from '@talonsight/ontology/constraints';

function createComicPanel(params: {
  imageUrl: string;
  panelNumber: number;
  pageId?: string;
  scriptLine?: string;
  characters: string[];
  location?: string;
  generationMethod: 'generateContent' | 'editImage';
  referenceImages?: string[];
}): ComicPanel {
  const panel: ComicPanel = {
    id: crypto.randomUUID(),
    type: 'comic-panel',
    hash: createHash('sha256').update(JSON.stringify(params)).digest('hex'),
    timestamp: new Date().toISOString(),
    sourceTerminal: 'talon-vision',
    workspace: 'talon-vision',
    sealed: false,
    content: params,
    tags: params.characters,
  };

  validateOrThrow(panel);
  return panel;
}
```

The same pattern applies to TalonMotion (`AnimationClip`), TalonFly (`MarketplaceListing`), and TalonLearn (`LearningModule`). Each terminal:
1. Imports its artifact type
2. Builds a typed artifact
3. Calls `validateOrThrow()`
4. Emits a typed `MemoryBusEvent`

---

### OIAS Systems

#### Artifact Memory — Ingestion Pipeline

**Before** (untyped extraction):
```typescript
// Current ingestion: extracts generic "artifacts" from transcripts
const artifacts = extractFromTranscript(transcript);
for (const artifact of artifacts) {
  await db.insert('artifacts', artifact); // Untyped
}
```

**After** (ontology-backed):
```typescript
import type {
  KnowledgeNode,
  SessionBrief,
  RelationshipEdge,
  TranscriptIngestion,
  MemoryBusEvent,
} from '@talonsight/ontology';
import {
  validateKnowledgeNode,
  validateSessionBrief,
  validateRelationshipEdge,
  validateTranscriptIngestion,
} from '@talonsight/ontology/oias/constraints';

async function ingestTranscript(transcript: string, workspace: string): Promise<TranscriptIngestion> {
  const startTime = Date.now();
  const nodes: KnowledgeNode[] = [];
  const edges: RelationshipEdge[] = [];

  // Extract knowledge nodes (your existing extraction logic)
  const rawExtractions = await extractFromTranscript(transcript);

  for (const raw of rawExtractions) {
    const node: KnowledgeNode = {
      id: crypto.randomUUID(),
      type: 'knowledge-node',
      hash: createHash('sha256').update(raw.statement).digest('hex'),
      timestamp: new Date().toISOString(),
      sourceTerminal: 'artifact-memory',
      workspace,
      sealed: false,
      content: {
        statement: raw.statement,
        category: raw.category,           // Now typed: 'architecture' | 'bug-fix' | etc.
        extractionConfidence: raw.confidence,
        sourceSessionId: raw.sessionId,
        originTerminal: raw.terminal,     // Now typed: TerminalId
        entities: raw.entities,
        relatedNodeIds: [],               // Populated after edge detection
      },
      tags: [raw.category, raw.terminal],
    };

    // Validate before insertion — catches missing fields,
    // invalid confidence ranges, empty statements
    const violations = validateKnowledgeNode(node);
    if (violations.some(v => v.severity === 'error')) {
      console.error('Invalid knowledge node:', violations);
      continue; // Skip invalid, don't corrupt the graph
    }

    nodes.push(node);
  }

  // Detect relationships between nodes
  const detectedEdges = await detectRelationships(nodes);
  for (const det of detectedEdges) {
    const edge: RelationshipEdge = {
      id: crypto.randomUUID(),
      type: 'relationship-edge',
      hash: createHash('sha256').update(`${det.from}-${det.to}-${det.type}`).digest('hex'),
      timestamp: new Date().toISOString(),
      sourceTerminal: 'artifact-memory',
      workspace,
      sealed: false,
      content: {
        fromArtifactId: det.from,
        toArtifactId: det.to,
        relationshipType: det.type,       // Now typed: OntologyRelationship
        strength: det.strength,
        origin: 'auto-detected',
        detectionMethod: det.method,      // Now typed: detection method enum
      },
      tags: [det.type],
    };

    const edgeViolations = validateRelationshipEdge(edge);
    if (edgeViolations.some(v => v.severity === 'error')) {
      console.error('Invalid edge:', edgeViolations);
      continue;
    }
    edges.push(edge);
  }

  // Create ingestion record
  const ingestion: TranscriptIngestion = {
    id: crypto.randomUUID(),
    type: 'transcript-ingestion',
    hash: createHash('sha256').update(transcript.slice(0, 1000)).digest('hex'),
    timestamp: new Date().toISOString(),
    sourceTerminal: 'artifact-memory',
    workspace,
    sealed: false,
    content: {
      source: 'claude-ai',
      transcriptLength: transcript.length,
      nodesExtracted: nodes.length,
      edgesCreated: edges.length,
      targetWorkspace: workspace,
      status: 'completed',
      processingTimeMs: Date.now() - startTime,
    },
    tags: ['ingestion', workspace],
  };

  // Persist
  await db.insertMany('knowledge_nodes', nodes);
  await db.insertMany('relationship_edges', edges);
  await db.insert('ingestions', ingestion);

  return ingestion;
}
```

#### Artifact Memory — Constellation Visualization

**Before** (untyped nodes):
```typescript
// D3 constellation renders generic objects
const stars = workspaces.map(ws => ({
  name: ws.name,
  x: ws.x,
  y: ws.y,
  count: ws.artifactCount,
}));
```

**After** (ontology-backed):
```typescript
import type { ConstellationCluster, RelationshipEdge } from '@talonsight/ontology';

// Clusters are typed — position persistence, cross-cluster edges,
// design system color tokens are all part of the ontology
function renderConstellation(clusters: ConstellationCluster[], edges: RelationshipEdge[]) {
  // Stars are clusters with typed positions
  const stars = clusters.map(c => ({
    id: c.id,
    name: c.content.workspaceName,
    terminal: c.content.terminal,
    x: c.content.position.x,
    y: c.content.position.y,
    radius: c.content.radius,
    count: c.content.artifactCount,
    color: designTokens[c.content.colorToken], // From Afro-futuristic design system
    crossEdges: c.content.crossClusterEdges,
  }));

  // Edges have typed relationships — the visualization can
  // render 'derivedFrom' differently than 'supportedBy'
  const lines = edges.map(e => ({
    from: e.content.fromArtifactId,
    to: e.content.toArtifactId,
    type: e.content.relationshipType,  // Typed: 'derivedFrom' | 'supportedBy' | etc.
    strength: e.content.strength,
    style: edgeStyleFor(e.content.relationshipType), // Different visual per relationship
  }));

  d3.selectAll('.star').data(stars)/* ... */;
  d3.selectAll('.edge').data(lines)/* ... */;
}

// Edge styling based on ontological relationship type
function edgeStyleFor(type: string): { color: string; dash: string; width: number } {
  switch (type) {
    case 'derivedFrom':  return { color: '#8b5cf6', dash: 'none',    width: 2 };
    case 'supportedBy':  return { color: '#f59e0b', dash: '4,4',     width: 1.5 };
    case 'verifies':     return { color: '#10b981', dash: 'none',    width: 2.5 };
    case 'references':   return { color: '#6b7280', dash: '2,2',     width: 1 };
    case 'blockedBy':    return { color: '#ef4444', dash: '6,3',     width: 2 };
    case 'supersedes':   return { color: '#ec4899', dash: '8,4,2,4', width: 1.5 };
    default:             return { color: '#9ca3af', dash: '2,2',     width: 1 };
  }
}
```

#### Decision Intelligence OS — Template-Driven Capture

```typescript
import type { Decision, DecisionTemplate, ApprovalChain, Context, Evidence } from '@talonsight/ontology';
import { validateDecision } from '@talonsight/ontology/constraints';
import { validateDecisionTemplate, validateApprovalChain } from '@talonsight/ontology/oias/constraints';

async function captureDecision(
  template: DecisionTemplate,
  userInput: Record<string, unknown>,
  evidenceArtifactIds: string[],
): Promise<Decision> {
  // Validate user input against template's required context fields
  const missingFields = template.content.requiredContextFields
    .filter(f => f.required && !userInput[f.name]);

  if (missingFields.length > 0) {
    throw new Error(
      `Template "${template.content.name}" requires: ${missingFields.map(f => f.name).join(', ')}`
    );
  }

  // Build Context from template fields
  const context: Context = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    conditions: userInput,
    constraints: template.content.requiredContextFields
      .filter(f => f.required)
      .map(f => `${f.name}: ${userInput[f.name]}`),
  };

  // Build Evidence from referenced artifacts
  const evidence: Evidence = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    references: evidenceArtifactIds as [string, ...string[]],
    description: `Evidence for "${template.content.name}" decision`,
    weight: 0.8,
    evidenceType: 'artifact-ref',
  };

  const decision: Decision = {
    id: crypto.randomUUID(),
    type: 'decision',
    hash: createHash('sha256').update(JSON.stringify({ context, evidence })).digest('hex'),
    timestamp: new Date().toISOString(),
    sourceTerminal: 'decision-intelligence',
    workspace: 'decision-intelligence',
    sealed: false,
    content: {},
    tags: [template.content.name],
    hasContext: [context],
    supportedBy: [evidence],
    outcome: userInput.outcome as string,
    participants: template.content.defaultParticipants,
  };

  // Ontology validates the whole decision —
  // context is present, evidence references valid artifacts,
  // outcome is non-empty, confidence is in range
  validateOrThrow(decision);

  // Increment template usage
  template.content.usageCount++;

  return decision;
}
```

#### POW Ledger — Seal Flow with Audit Trail

```typescript
import type { SealEvent, AuditTrail, A2AMessage, LedgerEntry } from '@talonsight/ontology';
import type { Artifact } from '@talonsight/ontology';
import { validateLedgerEntry } from '@talonsight/ontology/constraints';
import { validateSealEvent, validateA2AMessage, validateAuditTrail } from '@talonsight/ontology/oias/constraints';

const CAPTURE_AGENT_ID = 'capture-agent-001';

async function sealArtifact(
  artifact: Artifact,
  trigger: SealEvent['content']['sealTrigger'],
  previousEntryId: string | null,
  sequenceNumber: number,
): Promise<{ ledgerEntry: LedgerEntry; sealEvent: SealEvent; a2aLog: A2AMessage }> {

  // 1. Create the ledger entry (single-writer: only Capture Agent)
  const ledgerEntry: LedgerEntry = {
    id: crypto.randomUUID(),
    artifactId: artifact.id,
    hash: artifact.hash,
    timestamp: new Date().toISOString(),
    captureAgentId: CAPTURE_AGENT_ID,
    sequenceNumber,
    previousEntryId,
  };

  // Validates single-writer protocol
  const ledgerViolations = validateLedgerEntry(ledgerEntry, CAPTURE_AGENT_ID);
  if (ledgerViolations.some(v => v.severity === 'error')) {
    throw new Error(`Ledger validation failed: ${JSON.stringify(ledgerViolations)}`);
  }

  // 2. Create the seal event
  const sealEvent: SealEvent = {
    id: crypto.randomUUID(),
    type: 'seal-event',
    hash: createHash('sha256').update(`seal:${artifact.id}:${artifact.hash}`).digest('hex'),
    timestamp: new Date().toISOString(),
    sourceTerminal: 'pow-ledger',
    workspace: 'pow-ledger',
    sealed: true,
    content: {
      artifactId: artifact.id,
      sealHash: artifact.hash,
      captureAgentId: CAPTURE_AGENT_ID,
      ledgerEntryId: ledgerEntry.id,
      sealTrigger: trigger,
    },
    tags: ['seal', trigger],
  };
  validateSealEvent(sealEvent); // Validates hash format, agent identity, ledger ref

  // 3. Log the A2A communication
  const a2aLog: A2AMessage = {
    id: crypto.randomUUID(),
    type: 'a2a-message',
    hash: createHash('sha256').update(`a2a:seal:${artifact.id}`).digest('hex'),
    timestamp: new Date().toISOString(),
    sourceTerminal: 'pow-ledger',
    workspace: 'pow-ledger',
    sealed: false,
    content: {
      fromAgent: 'orchestrator',
      toAgent: CAPTURE_AGENT_ID,
      intent: 'capture-decision',
      payloadSummary: `Seal artifact ${artifact.id}`,
      responseStatus: 'success',
      latencyMs: 0, // Updated after round-trip
      protocol: 'stream_query',
    },
    tags: ['a2a', 'seal'],
  };

  // 4. Mark the original artifact as sealed
  artifact.sealed = true;

  return { ledgerEntry, sealEvent, a2aLog };
}
```

#### Memory Bus — Validate Incoming Events

The central Memory Bus endpoint validates every incoming event
against the ontology before accepting it:

```typescript
import type { MemoryBusEvent, Artifact } from '@talonsight/ontology';
import { validate, validateMemoryBusEvent } from '@talonsight/ontology/constraints';

// POST /api/memory/events
app.post('/api/memory/events', async (req, res) => {
  const event: MemoryBusEvent = req.body;

  // 1. Validate the event envelope
  const eventViolations = validateMemoryBusEvent(event);
  const eventErrors = eventViolations.filter(v => v.severity === 'error');

  if (eventErrors.length > 0) {
    return res.status(422).json({
      error: 'Ontology validation failed',
      violations: eventErrors,
    });
  }

  // 2. Route to the appropriate handler based on artifactClass
  switch (event.artifactClass) {
    case 'beat':
    case 'loop':
    case 'flow-session':
      await handleSonicGenesisArtifact(event);
      break;
    case 'freestyle-session':
    case 'lyric-composition':
      await handleDaCypherArtifact(event);
      break;
    case 'comic-panel':
    case 'comic-page':
    case 'character-sheet':
    case 'location-sheet':
      await handleTalonVisionArtifact(event);
      break;
    case 'decision':
      await handleDecision(event);
      break;
    case 'knowledge-node':
    case 'session-brief':
    case 'relationship-edge':
      await handleArtifactMemoryInternal(event);
      break;
    default:
      await handleGenericArtifact(event);
  }

  // 3. Index in Artifact Memory
  await indexArtifact(event.payload);

  // 4. Check governance policies for auto-sealing
  await checkGovernancePolicies(event.payload);

  return res.status(201).json({ eventId: event.eventId, accepted: true });
});
```

---

## Phase 3: Enforce (Governance Layer)

Once everything emits typed artifacts, the governance layer
can enforce policies automatically:

```typescript
import type { GovernancePolicy, Decision } from '@talonsight/ontology';
import { validateDecision } from '@talonsight/ontology/constraints';

async function checkGovernancePolicies(artifact: Artifact): Promise<void> {
  if (artifact.type !== 'decision') return;

  const decision = artifact as Decision;
  const policies = await db.query<GovernancePolicy>(
    'SELECT * FROM governance_policies WHERE content->scope->>global = true'
  );

  for (const policy of policies) {
    for (const rule of policy.content.rules) {
      const violated = evaluateRule(rule, decision);
      if (violated) {
        switch (rule.onViolation) {
          case 'block':
            throw new Error(`Governance policy "${policy.content.name}" blocks this decision: ${rule.statement}`);
          case 'warn':
            await notify(decision.participants, `Warning: ${rule.statement}`);
            break;
          case 'log':
            console.warn(`Policy "${policy.content.name}": ${rule.statement}`);
            break;
        }
      }
    }
  }
}
```

---

## Rollout Order

Do this in order — each step builds on the previous:

| Step | System | What Changes | Why First |
|------|--------|-------------|-----------|
| 1 | **Ontology package** | Publish, `npm run test`, `npm run build` | Everything depends on it |
| 2 | **Memory Bus** | Add `validateMemoryBusEvent()` at the endpoint | Central gateway — catches invalid artifacts from any terminal |
| 3 | **Artifact Memory** | Replace generic extraction with `KnowledgeNode`, add `RelationshipEdge` | Makes the constellation a real knowledge graph |
| 4 | **One CIAS terminal** (Sonic Genesis or Da Cypher) | Wrap artifact creation with `validateOrThrow()` | Proves the integration pattern works end-to-end |
| 5 | **Remaining CIAS terminals** | Same pattern | Mechanical repetition once the pattern is proven |
| 6 | **Decision Intelligence OS** | Add `DecisionTemplate`, template-driven capture | Requires Artifact Memory edges to be working |
| 7 | **POW Ledger** | Add `SealEvent`, `AuditTrail`, `A2AMessage` | Requires Decision Intelligence to be emitting typed decisions |
| 8 | **Talon Agent** | Add `AgentIdentity`, `EventClaim`, `OrchestratorRouting` | Last — wraps the orchestration layer around everything else |
| 9 | **Governance policies** | Add `GovernancePolicy`, enforcement rules | Only meaningful once decisions are typed and sealed |

---

## What You Get When It's Done

1. **Cross-terminal queries**: "Show me every Decision where Evidence came from Sonic Genesis AND was verified in POW Ledger within 48 hours" — this is a graph traversal, not a text search.

2. **The constellation becomes a knowledge graph**: Every edge has a type, a direction, a strength. The visualization can render `derivedFrom` edges differently than `supportedBy` edges. Clusters have cross-cluster edges with relationship types.

3. **Governance is automatic**: Policies fire on every Decision. Templates enforce required Context fields. Approval chains gate sealing. This isn't process — it's code.

4. **New terminals auto-integrate**: Add a terminal ID, define its artifact subclass, register in the terminal registry, import `validateOrThrow()`. The Memory Bus routes it, Artifact Memory indexes it, POW Ledger can seal it. Zero custom integration code.

5. **Agent communication is auditable**: Every A2A message between Orchestrator, Capture, and Verification agents is a typed, validated artifact. You can replay the entire decision flow from intent to seal.

6. **The PCOMJR spec is executable**: It's not a document someone reads — it's a package someone installs. The convergence with GitMoney's framework isn't a narrative claim, it's a type-checked import.
