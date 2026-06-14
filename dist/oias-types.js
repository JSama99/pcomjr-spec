/**
 * PCOMJR Ontology — OIAS Models
 * ==============================
 * TalonSight Technologies
 *
 * Internal data models for the four OIAS systems:
 *   • Artifact Memory    (Knowledge layer)
 *   • Decision Intel OS  (Judgment layer)
 *   • POW Ledger         (Trust layer)
 *   • Talon Agent        (Orchestration layer)
 *
 * These extend the base ontology in pcomjr-types.ts.
 * Import both:
 *   import type { Artifact, Decision } from './pcomjr-types';
 *   import type { KnowledgeNode, DecisionTemplate, AgentIdentity } from './oias-types';
 */
// ─────────────────────────────────────────────
// OIAS Terminal Registration Update
// ─────────────────────────────────────────────
/**
 * Updated artifact type lists for OIAS terminals.
 * Use these to update the TERMINAL_ALLOWED_TYPES
 * map in constraints.ts.
 */
export const OIAS_TERMINAL_TYPES = {
    'artifact-memory': [
        'knowledge-node',
        'session-brief',
        'constellation-cluster',
        'relationship-edge',
        'transcript-ingestion',
        'generic',
    ],
    'decision-intelligence': [
        'decision',
        'decision-template',
        'decision-review',
        'governance-policy',
        'approval-chain',
        'decision-impact',
    ],
    'pow-ledger': [
        'verification',
        'ledger-entry',
        'pattern',
        'workflow-proposal',
        'audit-trail',
        'integrity-report',
        'seal-event',
        'a2a-message',
    ],
    'talon-agent': [
        'agent-execution',
        'event-claim',
        'task-delegation',
        'orchestrator-routing',
    ],
};
//# sourceMappingURL=oias-types.js.map