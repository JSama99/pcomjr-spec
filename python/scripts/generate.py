#!/usr/bin/env python3
"""
PCOMJR Python Code Generator

Reads schema/pcomjr.schema.json and emits:
  - python/talonsight_ontology/generated/models.py  — Pydantic v2 models
  - python/talonsight_ontology/generated/enums.py   — Literal types + const lists

Run: cd pcomjr-spec && python python/scripts/generate.py
"""

import json
import os
import textwrap
from pathlib import Path
from typing import Any

SCHEMA_PATH = Path(__file__).resolve().parent.parent.parent / "schema" / "pcomjr.schema.json"
OUT_DIR = Path(__file__).resolve().parent.parent / "talonsight_ontology" / "generated"


def load_schema() -> dict[str, Any]:
    with open(SCHEMA_PATH) as f:
        return json.load(f)


# ── Classification ───────────────────────────────────────────────────────────

def classify_defs(defs: dict[str, Any]) -> tuple[set[str], set[str], set[str], set[str]]:
    """Classify schema definitions into enums, unions, interfaces, artifact subtypes."""
    enum_types: set[str] = set()
    union_types: set[str] = set()
    interface_types: set[str] = set()
    artifact_subtypes: set[str] = set()

    for name, defn in defs.items():
        if defn.get("type") == "string" and "enum" in defn:
            enum_types.add(name)
        elif "oneOf" in defn and all("$ref" in o for o in defn["oneOf"]):
            union_types.add(name)
        elif defn.get("type") == "object" or "allOf" in defn:
            interface_types.add(name)
            if any(
                a.get("$ref") == "#/$defs/Artifact"
                for a in defn.get("allOf", [])
            ):
                artifact_subtypes.add(name)

    return enum_types, union_types, interface_types, artifact_subtypes


# ── Type Resolution ──────────────────────────────────────────────────────────

def resolve_ref(ref: str) -> str:
    return ref.replace("#/$defs/", "")


def to_snake(name: str) -> str:
    """Convert CamelCase to snake_case."""
    result = []
    for i, c in enumerate(name):
        if c.isupper() and i > 0:
            prev = name[i - 1]
            # Don't insert underscore between consecutive capitals unless next is lower
            if prev.islower() or (i + 1 < len(name) and name[i + 1].islower()):
                result.append("_")
        result.append(c.lower())
    return "".join(result)


def schema_to_python(prop: dict[str, Any], defs: dict[str, Any]) -> str:
    """Convert a JSON Schema property to a Python type annotation."""
    if "$ref" in prop:
        ref_name = resolve_ref(prop["$ref"])
        # If ref is an enum type, use the Literal alias
        if ref_name in _enum_types:
            return ref_name
        return f'"{ref_name}"'

    if "const" in prop:
        return f'Literal["{prop["const"]}"]'

    if "oneOf" in prop:
        parts = [schema_to_python(o, defs) for o in prop["oneOf"]]
        return " | ".join(parts)

    typ = prop.get("type")

    if typ == "string":
        if "enum" in prop:
            values = ", ".join(f'"{v}"' for v in prop["enum"])
            return f"Literal[{values}]"
        return "str"

    if typ in ("number", "integer"):
        if typ == "integer":
            return "int"
        return "float"

    if typ == "boolean":
        return "bool"

    if typ == "array":
        items = prop.get("items")
        if items:
            item_type = schema_to_python(items, defs)
            return f"list[{item_type}]"
        return "list[Any]"

    if typ == "object":
        if "properties" in prop and prop["properties"]:
            # Inline object — use dict for simplicity in generated code
            return "dict[str, Any]"
        additional = prop.get("additionalProperties")
        if additional is True or (isinstance(additional, dict) and additional):
            if isinstance(additional, dict) and "type" in additional:
                val_type = schema_to_python(additional, defs)
                return f"dict[str, {val_type}]"
            return "dict[str, Any]"
        return "dict[str, Any]"

    return "Any"


# ── Code Generation ──────────────────────────────────────────────────────────

# Module-level set populated by classify_defs for use in schema_to_python
_enum_types: set[str] = set()


def generate_enums(defs: dict[str, Any], enum_types: set[str]) -> str:
    """Generate enums.py — Literal type aliases and const lists."""
    lines: list[str] = [
        '"""',
        "PCOMJR Data Ontology — Generated Enum Types",
        "",
        "AUTO-GENERATED from schema/pcomjr.schema.json",
        "DO NOT EDIT MANUALLY — run `python scripts/generate.py` to regenerate.",
        '"""',
        "",
        "from typing import Literal",
        "",
    ]

    for name in sorted(enum_types):
        defn = defs[name]
        desc = defn.get("description", "")

        # Literal type alias
        values = ", ".join(f'"{v}"' for v in defn["enum"])
        lines.append(f"# {desc}" if desc else "")
        lines.append(f"{name} = Literal[{values}]")
        lines.append("")

        # Const list
        const_name = to_snake(name).upper()
        values_list = ", ".join(f'"{v}"' for v in defn["enum"])
        lines.append(f"{const_name}: list[{name}] = [{values_list}]")
        lines.append("")

    return "\n".join(lines)


def generate_models(
    defs: dict[str, Any],
    enum_types: set[str],
    union_types: set[str],
    interface_types: set[str],
    artifact_subtypes: set[str],
) -> str:
    """Generate models.py — Pydantic v2 BaseModel classes."""
    lines: list[str] = [
        '"""',
        "PCOMJR Data Ontology — Generated Pydantic Models",
        "",
        "AUTO-GENERATED from schema/pcomjr.schema.json",
        "DO NOT EDIT MANUALLY — run `python scripts/generate.py` to regenerate.",
        '"""',
        "",
        "from __future__ import annotations",
        "",
        "from datetime import datetime",
        "from typing import Any, Literal, Optional",
        "",
        "from pydantic import BaseModel, Field",
        "",
        "from .enums import (",
    ]

    # Import all enum types
    for name in sorted(enum_types):
        lines.append(f"    {name},")
    lines.append(")")
    lines.append("")

    # Union type aliases
    for name in sorted(union_types):
        defn = defs[name]
        desc = defn.get("description", "")
        members = " | ".join(resolve_ref(o["$ref"]) for o in defn["oneOf"])
        if desc:
            lines.append(f"# {desc}")
        lines.append(f"{name} = {members}")
        lines.append("")

    # Determine emit order: base types first, then subtypes
    # Collect simple interfaces (no allOf, not Decision)
    simple = sorted(
        name
        for name in interface_types
        if name not in artifact_subtypes and name != "Decision"
    )

    # Emit Artifact first (it's the base)
    artifact_order = ["Artifact"] + sorted(
        name for name in artifact_subtypes if name != "Decision"
    ) + ["Decision"]

    # Filter: only emit what exists
    simple = [n for n in simple if n != "Artifact"]

    # Emit simple interfaces
    for name in simple:
        _emit_model(lines, name, defs[name], defs, is_artifact_sub=False)

    # Emit Artifact and subtypes
    for name in artifact_order:
        if name not in defs:
            continue
        is_sub = name in artifact_subtypes or name == "Decision"
        _emit_model(lines, name, defs[name], defs, is_artifact_sub=is_sub and name != "Artifact")

    return "\n".join(lines)


def _emit_model(
    lines: list[str],
    name: str,
    defn: dict[str, Any],
    defs: dict[str, Any],
    is_artifact_sub: bool,
) -> None:
    """Emit a single Pydantic model class."""
    desc = defn.get("description", "")

    base_class = "Artifact" if is_artifact_sub else "BaseModel"
    lines.append("")
    lines.append(f"class {name}({base_class}):")
    if desc:
        lines.append(f'    """{desc}"""')
    lines.append("")

    # Collect all properties
    all_props: dict[str, Any] = {}
    all_required: set[str] = set(defn.get("required", []))

    if "properties" in defn:
        all_props.update(defn["properties"])

    # allOf merging
    for entry in defn.get("allOf", []):
        if "$ref" in entry:
            continue  # Skip base class ref
        if "properties" in entry:
            all_props.update(entry["properties"])
        for r in entry.get("required", []):
            all_required.add(r)

    # For subtypes, skip fields that are on the base Artifact
    skip_fields: set[str] = set()
    if is_artifact_sub:
        base_props = defs.get("Artifact", {}).get("properties", {})
        skip_fields = set(base_props.keys())

    emitted = False
    for prop_name, prop_def in all_props.items():
        # Skip inherited fields (unless they have a const override or narrow the type via $ref)
        if prop_name in skip_fields and "const" not in prop_def and "$ref" not in prop_def:
            continue

        py_type = schema_to_python(prop_def, defs)
        field_name = prop_name

        is_required = (prop_name in all_required and prop_name not in skip_fields) or (prop_name == "content" and "$ref" in prop_def)
        has_const = "const" in prop_def

        if has_const:
            # Const fields get a default
            const_val = prop_def["const"]
            field_desc = prop_def.get("description", "")
            if field_desc:
                lines.append(f'    {field_name}: {py_type} = Field(default="{const_val}", description="{field_desc}")')
            else:
                lines.append(f'    {field_name}: {py_type} = "{const_val}"')
        elif is_required:
            field_desc = prop_def.get("description", "")
            if field_desc:
                lines.append(f'    {field_name}: {py_type} = Field(..., description="{field_desc}")')
            else:
                lines.append(f"    {field_name}: {py_type}")
        else:
            field_desc = prop_def.get("description", "")
            default = prop_def.get("default")
            if default is not None:
                # Convert JSON literals to Python: false→False, true→True, null→None
                if isinstance(default, bool):
                    default_repr = "True" if default else "False"
                elif default is None:
                    default_repr = "None"
                else:
                    default_repr = json.dumps(default)
                if field_desc:
                    lines.append(f'    {field_name}: Optional[{py_type}] = Field(default={default_repr}, description="{field_desc}")')
                else:
                    lines.append(f"    {field_name}: Optional[{py_type}] = {default_repr}")
            else:
                if field_desc:
                    lines.append(f'    {field_name}: Optional[{py_type}] = Field(default=None, description="{field_desc}")')
                else:
                    lines.append(f"    {field_name}: Optional[{py_type}] = None")
        emitted = True

    if not emitted:
        lines.append("    pass")

    lines.append("")


def main():
    schema = load_schema()
    defs = schema["$defs"]

    global _enum_types
    enum_types, union_types, interface_types, artifact_subtypes = classify_defs(defs)
    _enum_types = enum_types

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Generate enums
    enums_code = generate_enums(defs, enum_types)
    (OUT_DIR / "enums.py").write_text(enums_code)
    print(f"✓ Generated {OUT_DIR / 'enums.py'} ({len(enum_types)} enum types)")

    # Generate models
    models_code = generate_models(defs, enum_types, union_types, interface_types, artifact_subtypes)
    (OUT_DIR / "models.py").write_text(models_code)
    print(f"✓ Generated {OUT_DIR / 'models.py'} ({len(interface_types)} models)")

    # __init__.py for the generated subpackage
    init_code = '"""Auto-generated PCOMJR types. Do not edit."""\n\nfrom .enums import *  # noqa: F401,F403\nfrom .models import *  # noqa: F401,F403\n'
    (OUT_DIR / "__init__.py").write_text(init_code)
    print(f"✓ Generated {OUT_DIR / '__init__.py'}")


if __name__ == "__main__":
    main()
