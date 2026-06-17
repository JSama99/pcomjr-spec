# talonsight-ontology (Python)

Pydantic v2 models, validators, and canonical hash functions for the PCOMJR data ontology.

Generated from `schema/pcomjr.schema.json` — the shared source of truth with the TypeScript package.

## Install

```bash
pip install -e ".[dev]"
```

## Regenerate from schema

```bash
python scripts/generate.py
```

## Test

```bash
pytest tests/ -v
```

## Usage

```python
from talonsight_ontology import Beat, Decision, MemoryBusEvent
from talonsight_ontology.hash import hash_artifact, verify
from talonsight_ontology.constraints import validate, validate_memory_bus_event

beat = Beat(
    id="b-1", type="beat", title="Phoenix Rising",
    sourceTerminal="sonic-genesis", createdAt="2026-06-15T12:00:00Z",
    version=1, bpm=140.0, duration=120.0,
)

# Validate at system boundaries
result = validate(beat)
assert result.valid

# Deterministic cross-language hashing
h = hash_artifact(beat.model_dump())
assert verify(beat.model_dump(), h)
```
