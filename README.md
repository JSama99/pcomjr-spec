# PCOMJR

**Pipeline · Context · Orchestrator · Model · Judgment · Artifact · Reliability**

A seven-stage pipeline standard for governed AI agent behavior in organizational settings.

---

## What this is

PCOMJR defines how AI agents should operate when they make or support decisions on behalf of an organization. It is a lifecycle model, not a checklist. Work enters the pipeline as a request, accumulates context and evidence, passes through orchestration and model execution, undergoes explicit judgment, produces a durable artifact, and terminates in a verification step that feeds outcomes back into organizational memory.

The standard applies to any system where AI agents write code, generate content, analyze data, manage projects, or make operational decisions.

## The problem it solves

Most AI agent deployments follow no governance model. An agent receives a prompt, produces output, and the output disappears into a chat window, a Slack thread, or a document. There is no record of what the agent knew when it acted, what alternatives it considered, why it chose one path over another, or whether the outcome matched expectations.

This is not a tooling problem. It is an architectural one. PCOMJR provides the missing pipeline.

## The seven stages

| Stage | Purpose | Failure mode when skipped |
|---|---|---|
| **Pipeline** | Entry point. Validate, type, and route the work request. | Agents act on ambiguous instructions with no record of the request. |
| **Context** | Capture the objective, constraints, assumptions, risks, and environment. | Agents hallucinate context and fill gaps with unverified assumptions. |
| **Orchestrator** | Gather evidence, identify alternatives, link related work. | Agents work in isolation, ignoring prior decisions and available data. |
| **Model** | Apply model intelligence to the accumulated context and evidence. | Work proceeds on intuition alone without analytical leverage. |
| **Judgment** | Explicitly approve, reject, or revise. Record confidence. | Output ships without review. No basis for calibrating future confidence. |
| **Artifact** | Execute and produce durable output with ownership and lineage. | Approved work sits in limbo or exists only in ephemeral contexts. |
| **Reliability** | Verify, measure outcomes, capture lessons. Hash and seal. | The organization never learns from its own decisions. |

## Read the spec

**[SPEC.md](./SPEC.md)** — The full specification (2,800 words).

---

## Data Ontology

This repository contains the **canonical type system** for the PCOMJR ecosystem, maintained as a single JSON Schema source of truth with code generators for both TypeScript and Python.

### Architecture

```
schema/pcomjr.schema.json          ← Single source of truth (56 types)
        │
        ├──→ ontology/scripts/generate.ts   → TypeScript interfaces + type guards
        │        └──→ ontology/src/generated/types.ts
        │        └──→ ontology/src/generated/guards.ts
        │
        └──→ python/scripts/generate.py     → Pydantic v2 models + Literal enums
                 └──→ python/talonsight_ontology/generated/models.py
                 └──→ python/talonsight_ontology/generated/enums.py
```

One file changes → `npm run generate` and `python scripts/generate.py` both emit updated types.

### TypeScript Package

```bash
cd ontology
npm install
npm run generate   # Regenerate types from schema
npm run build      # Compile to dist/
npm test           # Run constraint + hash tests
```

```typescript
import { Beat, BeatContent, Decision, DecisionContent } from '@talonsight/ontology';
import { validate, validateDecision, validateMemoryBusEvent } from '@talonsight/ontology/constraints';
import { hash, verify, canonicalize } from '@talonsight/ontology/hash';
import { isBeat, isDecision, isCIASArtifact } from '@talonsight/ontology/guards';

// Content-nested artifacts: base fields + typed content
const beat: Beat = {
  id: 'b-1', type: 'beat', hash: '...', timestamp: '2026-06-15T12:00:00Z',
  sourceTerminal: 'sonic-genesis', workspace: 'sonic-genesis',
  sealed: false,
  content: { bpm: 140, duration: 120, key: 'C minor' }
};

// Validate at system boundaries
const result = validate(beat);
if (!result.valid) console.error(result.violations);

// Gate Memory Bus events
const violations = validateMemoryBusEvent(event);

// Produce deterministic hashes
const h = hash(artifact);
const ok = verify(artifact, expectedHash);
```

### Python Package

```bash
cd python
pip install -e ".[dev]"
python scripts/generate.py   # Regenerate from schema
pytest tests/ -v              # Run all tests
```

```python
from talonsight_ontology import Beat, Decision, MemoryBusEvent
from talonsight_ontology.hash import hash_artifact, verify, canonicalize
from talonsight_ontology.constraints import (
    validate, validate_decision, validate_memory_bus_event
)

# Pydantic models with full validation
beat = Beat(id="b-1", type="beat", title="Phoenix", ...)

# Same validators, same rules, same violation names as TypeScript
result = validate(beat)
violations = validate_memory_bus_event(event)

# Cross-language hash compatibility
h = hash_artifact(artifact_dict)
assert verify(artifact_dict, typescript_produced_hash)  # ✓
```

### Type Coverage

**13 Enum types** — Division, TerminalId variants, ArtifactType variants, DecisionStatus, DecisionType, EvidenceType, KnowledgeCategory, RelationType, VerificationStatus, MemoryBusEventType, A2AIntent

**2 Union types** — ArtifactType (CIAS | OIAS), TerminalId (CIAS | OIAS)

**58 Interfaces/Models** — Artifact (base with `hash`, `timestamp`, `workspace`, `sealed`, `content` wrapper), 17 Content types (BeatContent, DecisionContent, KnowledgeNodeContent, SessionBriefContent, etc.), 13 CIAS subtypes, Decision, 4 OIAS artifact subtypes, standalone OIAS types (LedgerEntry, SealEvent, Verification, etc.), Agent protocol types, MemoryBusEvent, TerminalRegistration

---

## Canonical Hash Specification

All artifact hashes in the PCOMJR ecosystem use the same deterministic algorithm, producing identical output in TypeScript and Python.

**Algorithm:** SHA-256 of canonical JSON representation.

**Canonicalization rules:**
1. Object keys sorted by Unicode code point at every nesting level
2. `undefined` values stripped; `null` values preserved
3. Array element order preserved
4. No whitespace (`JSON.stringify` with no spacing / `json.dumps(separators=(',',':'))`)
5. UTF-8 encoding
6. Output: 64-character lowercase hexadecimal string

**Cross-language verification:** `fixtures/hash-vectors.json` contains 16 test vectors covering empty objects, nested sorting, null values, arrays, Unicode (emoji + CJK + Arabic), and full artifact/decision/event payloads. Both TypeScript and Python implementations are tested against every vector.

**Hash regex:** `^[a-f0-9]{64}$`

---

## Terminal-Type Enforcement

Validators enforce which terminals can produce which artifact types:

| Terminal | Allowed Artifact Types |
|---|---|
| `sonic-genesis` | beat, loop, stem_bundle, mix_export, arrangement |
| `da-cypher` | flow_session, freestyle_session, battle_recording, lyric_composition, progression_signal |
| `talonvision` | comic_panel, comic_page, character_sheet, location_sheet, talonvision_export |
| `talonmotion` | animation_clip, motion_sequence |
| `talonfly` | marketplace_listing, creator_profile |
| `artifact-memory` | knowledge_node, session_brief, transcript_ingestion |
| `decision-intelligence` | decision, context, evidence, verification, pattern, workflow_proposal |
| `pow-ledger` | ledger_entry, seal_event, audit_entry, verification |
| `talon-agent` | agent_task, event_claim, a2a_message |

---

## Test Suites

| Suite | Tests | What it covers |
|---|---|---|
| TypeScript constraints | 39 | All validation paths, terminal-type enforcement, content nesting |
| TypeScript hash vectors | 16 | Cross-language canonical hash verification |
| Python constraints | 37 | Mirror of TS suite, content nesting validation |
| Python hash vectors | 13 | Cross-language verification + edge cases |
| Python models | 17 | Content nesting, Pydantic instantiation, serialization |
| **Total** | **122** | |

---

## Origin

PCOMJR was extracted from building five production creative-intelligence terminals at [TalonSight Technologies](https://github.com/JSama99) between 2025 and 2026. Every terminal independently required the same seven-stage lifecycle to produce work that an organization could trust, verify, and learn from. The standard is extracted from that operational experience, not designed in theory.

## Reference Implementation

**Decision Intelligence OS** — A full-stack application implementing all seven PCOMJR stages with PostgreSQL, Express, React, D3 constellation visualization, and AI analysis via Gemini.

**POW Ledger** — A three-agent system on Google Cloud Vertex AI that creates tamper-evident proof records for organizational decisions. Agents: Orchestrator, Capture, Verification. Protocol: A2A via FastMCP on Cloud Run. Storage: Cloud SQL PostgreSQL.

**Artifact Memory** — An organizational knowledge graph that captures, indexes, and visualizes knowledge artifacts extracted from AI conversations. The Memory Bus pattern connects all terminals.

Together, these three systems form the **Memory → Decision → Verification** stack, connected by a federation protocol that renders the full organizational intelligence graph as a single interactive constellation.

## Compliance levels

**Stage-complete** — All seven stages are implemented. Every work item passes through all stages.

**Transition-auditable** — Every stage transition is recorded with timestamp, actor, and reason. An auditor can reconstruct the full lifecycle of any work item.

**Feedback-active** — Verified outcomes feed back into future context. The system detects patterns, measures confidence calibration, and surfaces governance gaps.

## License

[CC BY 4.0](./LICENSE) — Use it, implement it, build on it. Credit the original author and TalonSight Technologies.

---

*Author: Jermaine Nelson ([@JSama99](https://github.com/JSama99))*
*Organization: TalonSight Technologies*
*Version: 0.2.0 — Ontology + Hash Specification, June 2026*
