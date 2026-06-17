# PCOMJR: A Pipeline Standard for Governed AI Agent Behavior

**Version:** 0.1.0
**Status:** Working Draft
**Author:** Jermaine Nelson (J-Sama)
**Origin:** TalonSight Technologies
**Date:** June 2026

---

## Abstract

PCOMJR is a seven-stage pipeline standard that defines how AI agents should operate in organizational settings. The stages are Pipeline, Context, Orchestrator, Model, Judgment, Artifact, and Reliability. Each stage has a defined input, output, and failure mode. Work enters the pipeline as a request, accumulates context and evidence, passes through orchestration and model execution, undergoes explicit judgment, produces a durable artifact, and terminates in a verification step that feeds outcomes back into organizational memory. The standard applies to any system where AI agents make or support decisions on behalf of an organization.

---

## Motivation

Organizations are deploying AI agents to write code, generate content, analyze data, manage projects, and make operational decisions. Most deployments follow no governance model. An agent receives a prompt, produces output, and the output disappears into a chat window, a Slack thread, or a Google Doc. There is no record of what the agent knew when it acted, what alternatives it considered, why it chose one path over another, or whether the outcome matched expectations.

This is not a tooling problem. It is an architectural one. The missing piece is not a better model or a faster inference engine. It is a pipeline that enforces structure on the full lifecycle of agent work, from the moment a task enters the system to the moment its outcome is verified and recorded.

PCOMJR provides that pipeline. It emerged from building five production creative-intelligence terminals (music generation, visual production, hip-hop training, video animation, and a creator marketplace) on a shared infrastructure, and discovering that every terminal required the same seven-stage lifecycle to produce trustworthy output. The standard is extracted from that operational experience, not designed in theory.

---

## Definitions

**Agent:** Any software system that uses a language model to perform work on behalf of a human or organization. This includes coding assistants, content generators, data analysts, workflow automators, and decision-support systems.

**Decision:** A commitment to a course of action, made by a human with agent support or by an agent under human-defined policy. Decisions have context, evidence, alternatives, outcomes, and consequences.

**Artifact:** Any durable output of agent work. Code, documents, analyses, recommendations, media, reports, database records.

**Organizational memory:** The accumulated knowledge, decisions, lessons, and patterns that an organization retains across time. Distinct from an agent's context window, which is ephemeral.

---

## The Seven Stages

### 1. Pipeline

**Definition:** The entry point. Work arrives as a request with a defined scope, and the system determines whether the request is well-formed, authorized, and routable.

**Input:** A task request from a human operator, an upstream system, or a scheduled trigger. The request must include at minimum: what is being asked, who is asking, and what type of work this represents.

**Output:** A validated, typed work item with an assigned owner and a status of "accepted." Malformed or unauthorized requests are rejected with a reason.

**Failure mode when skipped:** Agents operate on ambiguous instructions. Work begins without clarity on scope, ownership, or type. Multiple agents may act on the same request without coordination. There is no record that the work was ever requested.

**Implementation pattern:** In a decision-support system, this is decision creation with a title, type classification (strategic, operational, architectural, tactical), and owner assignment. In a code-generation system, this is ticket acceptance with scope validation. The pipeline stage exists to prevent agents from acting on vague prompts without structure.

### 2. Context

**Definition:** The stage where the agent acquires the information it needs to act. Context is not the prompt. Context is the objective, the constraints, the assumptions, the risks, and the operating environment that surround the work.

**Input:** The validated work item from the Pipeline stage.

**Output:** A structured context record attached to the work item, containing: the objective (what success looks like), the constraints (what cannot change), the assumptions (what is believed to be true but unverified), the risks (what could go wrong), and the environment (the technical, organizational, or market conditions under which the work occurs).

**Failure mode when skipped:** The agent hallucinates context. It fills gaps with plausible-sounding assumptions that were never validated. Decisions are made against imagined constraints. Risks are not identified until they materialize. When the outcome is reviewed, no one can reconstruct what the agent believed to be true at the time it acted. This is the most common failure mode in production agent systems.

**Implementation pattern:** In Decision Intelligence OS, this is the context record with five structured fields. In a code-generation system, this is the requirements document and the architectural constraints file that the agent reads before writing code. The critical design choice is making context a first-class record, not an inline prompt annotation. Context must persist independently of the agent's ephemeral memory.

### 3. Orchestrator

**Definition:** The stage where the system determines how the work will be executed. Which agents are involved. What evidence is needed. What prior work is relevant. How the current task relates to other active or completed tasks.

**Input:** The work item with its context record.

**Output:** An execution plan that includes: evidence attachments (data, documents, analyses, prior decisions that inform this work), alternative approaches considered, links to related work items (what this work supersedes, contradicts, enables, or depends on), and the assignment of responsibilities if multiple agents or humans are involved.

**Failure mode when skipped:** The agent works in isolation. It does not consult prior decisions. It does not gather evidence. It does not consider alternatives. The result may duplicate past work, contradict an active initiative, or ignore available data that would have changed the approach.

**Implementation pattern:** In Decision Intelligence OS, this is evidence attachment, alternative documentation (with rejection reasons), and decision linking with typed relationships (INFLUENCED_BY, SUPERSEDES, RELATES_TO, CONTRADICTS, ENABLES). In a multi-agent system, this is the orchestration layer that routes sub-tasks to specialist agents and manages their coordination.

### 4. Model

**Definition:** The stage where intelligence is applied. The language model (or ensemble of models) processes the accumulated context, evidence, and plan to generate analysis, recommendations, or draft outputs.

**Input:** The complete work package: the task, its context, its evidence, its alternatives, and its execution plan.

**Output:** Model-generated analysis, recommendations, predictions, or draft artifacts. The output is explicitly marked as model-generated and has not yet been approved or verified.

**Failure mode when skipped:** The work proceeds on human intuition alone, without the analytical leverage that model intelligence provides. In systems where agents operate autonomously, skipping this stage means the agent acts without applying its reasoning capabilities to the accumulated evidence, reducing it to a simple automation rather than an intelligent system.

**Implementation pattern:** In Decision Intelligence OS, this is the AI analysis integration (decision review, similar-decision detection, outcome prediction, executive brief generation). In a code-generation system, this is the model writing the code. The key constraint is that Model output is provisional. It enters the Judgment stage before becoming authoritative.

### 5. Judgment

**Definition:** The stage where a determination is made about the quality, correctness, and readiness of the work. Judgment can be exercised by a human, by an automated policy, or by a validation agent, but it must be explicit. Judgment is not implicit approval-by-silence.

**Input:** Model-generated output plus the full context and evidence package.

**Output:** An explicit judgment: approved, rejected, or returned for revision. The judgment includes a confidence assessment (how certain the decision-maker is that this is the right course of action) and the reasoning behind the determination.

**Failure mode when skipped:** Agent output ships without review. Errors, hallucinations, and poor reasoning propagate into production. Over time, the organization cannot distinguish between high-quality and low-quality agent work because no judgment was ever recorded. There is no basis for calibrating future confidence, because past confidence was never measured.

**Implementation pattern:** In Decision Intelligence OS, this is the confidence score, the status transition (proposed to approved), and the workspace-configurable confidence threshold. The Judgment Intelligence analytics layer measures calibration over time: are the organization's confidence assessments accurate predictors of actual outcomes? High-confidence decisions that fail indicate systematic overconfidence. Low-confidence decisions that succeed indicate untapped capability. This meta-cognitive feedback loop is unique to systems that treat judgment as a recorded, measurable stage rather than an informal gut check.

### 6. Artifact

**Definition:** The stage where the approved work is executed and produces durable output. The artifact is the thing that was created, changed, deployed, published, or recorded as a result of the work.

**Input:** The approved work package with its judgment determination.

**Output:** One or more durable artifacts: committed code, published documents, executed decisions, deployed configurations, completed analyses, generated media. The artifacts are stored in a system of record with ownership, timestamps, and lineage.

**Failure mode when skipped:** Work is approved but never executed, or executed but never recorded. Approved decisions sit in limbo. Completed work exists only in ephemeral contexts (chat windows, local files, unsaved sessions). The organization cannot point to what was produced or when.

**Implementation pattern:** In Decision Intelligence OS, this is the execution tracking system (execution items with status, progress, start and end dates) and the decision record itself as a persistent, queryable object. In a code-generation system, this is the committed code with its pull request, review, and merge history. The artifact must be addressable (it has a stable identifier), durable (it persists beyond the session that created it), and attributed (the agent, human, and decision that produced it are recorded).

### 7. Reliability

**Definition:** The stage where the work is verified, its outcomes are measured, and its lessons are captured. Reliability closes the loop by feeding verified outcomes back into organizational memory, where they become context for future work.

**Input:** The completed artifact and the passage of time sufficient to observe outcomes.

**Output:** A verification record containing: a cryptographic hash of the artifact and its decision context (proving the record has not been tampered with), outcome measurements (success score, impact score, revenue or time impact), lessons learned, unexpected consequences, and a verification status. The verification record is appended to an immutable ledger.

**Failure mode when skipped:** The organization never learns from its own decisions. Successful patterns are not identified. Repeated mistakes are not detected. Confidence calibration is impossible because outcomes are never compared to predictions. The decision history exists but carries no evaluative weight, no lessons, no proof.

**Implementation pattern:** In Decision Intelligence OS, this is the outcome recording system (timeframe, success score, impact score, lessons learned, unexpected consequences) combined with the POW Ledger integration (SHA-256 hash of the canonical decision representation, appended to a tamper-evident ledger). The `sealDecision` function computes a hash over the decision's title, type, status, context, evidence, alternatives, and outcomes, producing a cryptographic fingerprint that proves the record existed in its current form at a specific point in time.

---

## Stage Transitions

PCOMJR is a pipeline, not a checklist. The stages execute in order. Each stage's output is the next stage's input. Skipping a stage does not produce an error message. It produces a degraded outcome whose cause is invisible at the time and expensive to diagnose later.

The transitions between stages are the observable boundaries of the pipeline. In a distributed system where different components handle different stages, the transitions manifest as API calls, event emissions, or database writes. In a federated architecture where memory, decision, and verification are handled by separate systems, the cross-system edges between those systems are stage transitions: an artifact entering a decision process is the Pipeline-to-Context transition; a completed decision being verified is the Artifact-to-Reliability transition; a verified outcome entering organizational memory is the Reliability-to-Pipeline loop closing.

A system is PCOMJR-compliant when every stage is implemented, every transition is recorded, and no stage can be silently bypassed.

---

## The Verification Loop

The pipeline is not linear. Reliability feeds back into Pipeline through organizational memory. A verified outcome becomes available context for future work. A detected pattern (such as recurring overconfidence in a specific decision type) becomes a risk factor in future context records. A lesson learned from one decision becomes evidence in the next related decision.

This feedback loop is what separates a governance framework from a workflow engine. Workflow engines enforce process. Governance frameworks enforce learning. PCOMJR enforces both.

The loop operates at three timescales. Individual decisions complete the pipeline in days or weeks. Pattern detection operates over months, identifying recurring success and failure modes across decisions. Calibration operates over quarters, measuring whether the organization's judgment is improving, degrading, or stable.

---

## Relationship to Existing Frameworks

PCOMJR is not the first attempt to impose structure on AI agent behavior. It occupies a specific position relative to adjacent frameworks.

**The 12-Factor Agent** (adapted from Heroku's 12-Factor App) prescribes engineering hygiene for agent deployments: externalize configuration, treat prompts as code, log everything, handle failures gracefully. These are sound practices. They operate at the infrastructure layer. PCOMJR operates at the governance layer. A system can follow all twelve factors and still produce unverified decisions with no context record, no evidence trail, and no outcome measurement. The two frameworks are complementary, not competing. Twelve-factor practices make agents reliable. PCOMJR makes their work trustworthy.

**The AI Office model** (GitMoney, GitOps governance) proposes that organizations should treat GitHub as the central nervous system for AI operations, with IP vaults, agent chains of command, and exit-readiness scores. This is a strategic posture, not a pipeline specification. It answers "where should AI work live?" (in version-controlled repositories) and "who approves agent output?" (founders via pull requests). It does not specify the internal lifecycle of a piece of work from request to verification. PCOMJR provides that internal lifecycle. An AI Office is the organizational structure. PCOMJR is the operating system running inside it.

**Traditional SDLC and decision frameworks** (DACI, RAPID, ADR) define roles and approval flows for decisions. They are process models. They specify who decides, who is consulted, and who is informed. They do not address the computational pipeline: how context is assembled, how models contribute analysis, how judgment is calibrated over time, or how outcomes are cryptographically verified. PCOMJR absorbs the role-assignment function of these frameworks into the Orchestrator and Judgment stages, while adding the stages they lack: explicit context capture, model integration, artifact durability, and verification with feedback.

## Non-Goals

PCOMJR does not prescribe which language model to use, how to write prompts, how to fine-tune models, or how to deploy infrastructure. It does not specify a programming language, a database, a cloud provider, or a frontend framework. It does not require a specific organizational structure, team size, or industry. It is a lifecycle standard, not an implementation manual. Any technology stack that can implement the seven stages with recorded transitions and a feedback loop from Reliability to Pipeline is PCOMJR-compliant, regardless of how it is built.

## Compliance

A system is PCOMJR-compliant at three levels:

**Stage-complete:** All seven stages are implemented. Every work item that enters the pipeline passes through all seven stages before being considered finished. This is the minimum bar.

**Transition-auditable:** Every stage transition is recorded with a timestamp, actor, and reason. An external auditor can reconstruct the full lifecycle of any work item by reading the transition log. This is the standard required for organizational trust.

**Feedback-active:** The Reliability stage actively feeds verified outcomes back into the Context stage of future work items. The system detects patterns across decisions, measures confidence calibration, and surfaces attention items when governance gaps are detected. This is the standard required for organizational learning.

---

## Reference Implementation

Decision Intelligence OS, built by TalonSight Technologies, is the reference implementation of PCOMJR. It implements all seven stages as a full-stack application with a PostgreSQL database, an Express API server, a React frontend with D3 constellation visualization, and AI analysis integration via Gemini.

The source repository, deployment instructions, and API documentation are maintained at the TalonSight GitHub organization.

Artifact Memory (organizational knowledge graph) and POW Ledger (three-agent verification system on Google Cloud Vertex AI) serve as the Memory and Verification layers respectively, connected to Decision Intelligence OS through a federation protocol that resolves cross-system edges using cryptographic hash matching, title-based artifact linkage, Memory Bus event propagation, and shared entity resolution.

---

## License

This specification is published under CC BY 4.0. Anyone may implement, extend, or build upon PCOMJR with attribution to the original author and TalonSight Technologies as the originating organization.

---

*PCOMJR was extracted from the operational architecture of five production creative-intelligence terminals built between 2025 and 2026. The standard exists because every terminal independently required the same seven-stage lifecycle to produce work that an organization could trust, verify, and learn from.*
