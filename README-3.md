# PCOMJR Ontology

**TalonSight Technologies — Data Ontology for the Organizational Intelligence Platform**

The formal, machine-readable contract that unifies Artifact Memory, Decision Intelligence OS, and POW Ledger into a single semantic system. Every terminal imports this ontology. Every artifact conforms to it. Every relationship is typed and enforceable.

## What This Is

An ontology is not a schema. A schema says "this object has fields X, Y, Z." An ontology says "a Decision *is a kind of* Artifact, it *must have* at least one Context, it *must be supported by* at least one Evidence, and that Evidence *must reference* existing Artifacts." It encodes meaning, not just structure.

This package provides:

| File | Purpose |
|------|---------|
| `pcomjr-context.jsonld` | Formal ontology in JSON-LD — the semantic source of truth |
| `pcomjr-types.ts` | TypeScript types — what terminals import and code against |
| `constraints.ts` | Validation functions — runtime enforcement of ontological rules |
| `constraints.test.ts` | Test suite — 30+ tests verifying every constraint |
| `terminal-registry.json` | Terminal map — which terminals produce which artifact types |

## The Three-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│  CIAS Terminals (Creative Infrastructure)       │
│  Sonic Genesis · Da Cypher · TalonVision        │
│  TalonMotion · TalonFly · TalonLearn            │
│                    │ emit typed artifacts        │
│                    ▼                             │
│  ┌─────────────────────────────────────────┐    │
│  │  Memory Bus  (/api/memory/events)       │    │
│  │  Semantically typed · Class-routed      │    │
│  └──────────┬──────────────────────────────┘    │
│             │                                    │
│  ┌──────────▼──────────┐                        │
│  │  Artifact Memory    │  Knowledge layer       │
│  │  "What happened"    │  Indexes, relates,     │
│  │                     │  visualizes artifacts   │
│  └──────────┬──────────┘                        │
│             │                                    │
│  ┌──────────▼──────────┐                        │
│  │  Decision Intel OS  │  Judgment layer        │
│  │  "Why we acted"     │  Captures decisions    │
│  │                     │  with Context+Evidence  │
│  └──────────┬──────────┘                        │
│             │                                    │
│  ┌──────────▼──────────┐                        │
│  │  POW Ledger         │  Trust layer           │
│  │  "Can we prove it"  │  SHA-256 sealing,      │
│  │                     │  single-writer, chain   │
│  └─────────────────────┘                        │
│                                                  │
│  OIAS Platform (Organizational Infrastructure)  │
└─────────────────────────────────────────────────┘
```

## PCOMJR → Ontology Mapping

Each stage of the PCOMJR pipeline corresponds to an ontological layer:

| PCOMJR Stage | Ontology Layer | Governs |
|-------------|----------------|---------|
| **P**ipeline | Process | How work flows between terminals |
| **C**ontext | Situational | Conditions under which decisions are made |
| **O**rchestrator | Agent | Who routes what — identity and authority |
| **M**odel | Capability | What can reason — model selection |
| **J**udgment | Decision | What was decided — the Decision entity |
| **A**rtifact | Output | What was produced — all artifact subclasses |
| **R**eliability | Trust | Can we verify — Verification and LedgerEntry |

## Class Hierarchy

```
Artifact (base)
├── Decision (OIAS — requires Context + Evidence)
├── Beat (Sonic Genesis)
├── Loop (Sonic Genesis)
├── FlowSession (Sonic Genesis)
├── FreestyleSession (Da Cypher)
├── LyricComposition (Da Cypher)
├── ComicPanel (TalonVision)
├── ComicPage (TalonVision)
├── CharacterSheet (TalonVision)
├── LocationSheet (TalonVision)
├── AnimationClip (TalonMotion)
├── MarketplaceListing (TalonFly)
└── LearningModule (TalonLearn)

Context (conditions at decision time)
Evidence (supporting data, references Artifacts)
Verification (relationship: Artifact ↔ LedgerEntry)
LedgerEntry (immutable record, single-writer)
Pattern (recurring decision shape, ≥2 decisions)
WorkflowProposal (reusable workflow from Pattern)
```

## Hard Constraints

These are enforced at runtime by `constraints.ts`. Violations with severity `error` block artifact emission.

1. **Every Decision must have ≥1 Context.** No decision without conditions.
2. **Every Decision must have ≥1 Evidence.** No decision without supporting data.
3. **Every Evidence must reference ≥1 existing Artifact.** Evidence isn't freeform — it points to real work.
4. **Every Verification references exactly 1 Artifact and exactly 1 LedgerEntry.**
5. **Only the Capture Agent writes to the ledger.** Single-writer protocol — `validateLedgerEntry()` accepts an `expectedCaptureAgent` parameter.
6. **Sealed artifacts are immutable.** Once `sealed: true` and `hash` is set, the artifact cannot be modified.
7. **Terminals can only produce their registered artifact types.** A Beat from Da Cypher fails validation.
8. **LedgerEntry sequence numbers are monotonically increasing.** Chain integrity — non-first entries must reference a previous entry.
9. **Patterns require ≥2 decisions.** One occurrence isn't a pattern.
10. **Memory Bus events must match class to payload type.** The `artifactClass` field must equal the payload's `type`.

## Usage

### Validating an artifact before emission

```typescript
import { validate, validateOrThrow } from '@talonsight/ontology/constraints';
import type { Beat } from '@talonsight/ontology';

const beat: Beat = {
  id: crypto.randomUUID(),
  type: 'beat',
  hash: sha256(content),
  timestamp: new Date().toISOString(),
  sourceTerminal: 'sonic-genesis',
  workspace: 'sonic-genesis',
  sealed: false,
  content: { bpm: 140, key: 'Am', genre: 'trap', durationSeconds: 180, generationModel: 'lyria-3-pro' },
  tags: ['trap', 'dark'],
};

// Option A: Check result
const result = validate(beat);
if (!result.valid) {
  console.error('Ontology violations:', result.violations);
}

// Option B: Throw on failure (use in pipelines)
validateOrThrow(beat);
```

### Emitting to the Memory Bus

```typescript
import type { MemoryBusEvent, Beat } from '@talonsight/ontology';
import { validateMemoryBusEvent } from '@talonsight/ontology/constraints';

const event: MemoryBusEvent<Beat> = {
  eventId: crypto.randomUUID(),
  eventType: 'artifact.created',
  eventTimestamp: new Date().toISOString(),
  source: 'sonic-genesis',
  payload: beat,
  artifactClass: 'beat',
  relatedArtifactIds: [],
};

const violations = validateMemoryBusEvent(event);
if (violations.filter(v => v.severity === 'error').length === 0) {
  await fetch('/api/memory/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}
```

### Type guards

```typescript
import { isDecision, isCIASArtifact } from '@talonsight/ontology';

if (isDecision(artifact)) {
  // TypeScript narrows to Decision — hasContext, supportedBy available
  console.log(artifact.hasContext[0].conditions);
}

if (isCIASArtifact(artifact)) {
  // This came from a creative terminal
}
```

## Running Tests

```bash
npx tsx constraints.test.ts
```

Expected output: 30+ tests, all passing, covering every constraint in the ontology.

## Adding a New Terminal

1. Add the terminal ID to `TerminalId` in `pcomjr-types.ts`
2. Define its artifact subclass interface extending `Artifact`
3. Add its `ArtifactType` discriminator value
4. Register it in `terminal-registry.json` with division and allowed types
5. Add it to `TERMINAL_ALLOWED_TYPES` in `constraints.ts`
6. Add a type guard function
7. Run tests — the terminal-type mismatch constraint will catch misconfigurations

## Adding to pcomjr-spec

Copy this directory into your spec repo:

```bash
cp -r ontology/ /path/to/pcomjr-spec/ontology/
cd /path/to/pcomjr-spec
git add ontology/
git commit -m "Add formal PCOMJR ontology — types, constraints, tests, registry"
git push
```

The ontology turns the PCOMJR spec from a document someone reads into a contract something executes against.
