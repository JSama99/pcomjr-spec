/**
 * PCOMJR Data Ontology — Generated TypeScript Types
 *
 * AUTO-GENERATED from schema/pcomjr.schema.json
 * DO NOT EDIT MANUALLY — run `npm run generate` to regenerate.
 * Generated: 2026-06-21T18:23:03.521Z
 */
export const A2A_INTENT = ["capture", "verify", "query", "pattern_detect", "stream_query"];
export const CIAS_ARTIFACT_TYPE = ["beat", "loop", "stem-bundle", "mix-export", "arrangement", "flow-session", "freestyle-session", "battle-recording", "lyric-composition", "progression-signal", "comic-panel", "comic-page", "character-sheet", "location-sheet", "talonvision-export", "animation-clip", "motion-sequence", "marketplace-listing", "creator-profile", "learning-module", "curriculum"];
export const CIAS_TERMINAL_ID = ["sonic-genesis", "da-cypher", "talonvision", "talonmotion", "talonfly"];
export const DECISION_STATUS = ["draft", "in_review", "approved", "rejected", "implemented", "verified", "archived"];
export const DECISION_TYPE = ["strategic", "operational", "architectural", "tactical", "governance"];
export const DIVISION = ["cias", "oias"];
export const EVIDENCE_TYPE = ["document", "data", "analysis", "precedent", "expert_input", "metric", "external"];
export const KNOWLEDGE_CATEGORY = ["architecture", "decision", "bug-fix", "feature", "pattern", "requirement", "insight", "blocker", "milestone", "question", "action-item"];
export const MEMORY_BUS_EVENT_TYPE = ["artifact.created", "artifact.updated", "artifact.verified", "artifact.sealed", "artifact.superseded", "decision.created", "decision.sealed", "decision.verified", "pattern.detected", "workflow.proposed"];
export const OIAS_ARTIFACT_TYPE = ["decision", "context", "evidence", "verification", "knowledge-node", "session-brief", "transcript-ingestion", "ledger-entry", "seal-event", "audit-entry", "pattern", "workflow-proposal", "agent-task", "event-claim", "a2a-message", "constellation-cluster"];
export const OIAS_SYSTEM_ID = ["artifact-memory", "decision-intelligence", "pow-ledger", "talon-agent", "talon-llm"];
export const RELATION_TYPE = ["derived-from", "supersedes", "conflicts-with", "references", "implements", "validates", "influenced-by", "enables", "contradicts", "relates-to"];
export const VERIFICATION_STATUS = ["unverified", "pending", "verified", "tampered", "expired"];
//# sourceMappingURL=types.js.map