### Upgrade Plan (Next Releases)

Goal: Evolve from “single snapshot + ad-hoc apply” into a resilient, agentic, fully functional system with session history, resumable jobs, powerful UI, and safer automation.

### Guiding Principles
- **Deterministic flows**: all long actions become jobs with a state machine and idempotency.
- **Observability-first**: detailed logs, traces, and metrics for every step.
- **Human-in-the-loop**: diffs, approvals, and resumable checkpoints.
- **Backwards-compatible**: v1 endpoints work during phased rollout; new v2 API under `/api/v2/*`.

### Milestones

#### M0 — Foundations (Infra + Data) [Week 1–2]
- **Persistent storage**:
  - Add DB (SQLite/Prisma to start; upgradeable to Postgres). Models: `Session`, `Message`, `Job`, `Task`, `Artifact`, `Sandbox`, `ToolRun`.
  - Persist `conversationState` (replace globals) + file manifests & diffs.
- **Job system**:
  - Add server-side job queue/runner (BullMQ or lightweight worker) with a job state machine: `queued → running → paused → completed → failed → cancelled`.
  - Idempotency keys and retry policy with exponential backoff.
- **Artifacts**:
  - Store generated code, zips, logs, structured analyses as durable artifacts linked to jobs.

Acceptance:
- Sessions/messages survive server restarts.
- Jobs are tracked, cancelable, and resume-safe.

#### M1 — Session & History [Week 2–3]
- **Sessions**:
  - API: `POST /api/v2/sessions`, `GET /api/v2/sessions/:id`, `POST /api/v2/sessions/:id/checkpoint`.
  - Checkpoints for rollback/“undo” and “resume from”.
- **Timeline**:
  - Persist all AI prompts, model used, files touched, packages installed, commands run.

Acceptance:
- View prior sessions, restore any checkpoint, re-run a past job with new model.

#### M2 — Agentic RAG (Planning + Retrieval + Action) [Week 3–5]
- **Corpus**:
  - Index code (sandbox files, `docs/*`, extracted component trees) into a vector store (pgvector or SQLite FTS as a start). Chunk by component/function.
- **Planner → Retriever → Executor loop**:
  - Planner selects goals + tools; Retriever augments with top-k chunks; Executor calls tools or emits file edits.
- **Fallback**: Retain XML tag parsing as compatibility path when tool calling is not available.

Acceptance:
- Measurable reduction in wrong-file edits; higher precision in minimal diffs.

#### M3 — MCP Tool Calling [Week 4–6]
- **Tool registry**:
  - Register safe tools: filesystem, npm, vite control, http fetch, git, screenshot/scrape, zip.
  - Implement Model Context Protocol adapters (server-side) and enforce JSON schemas.
- **Policy & safety**:
  - Allowlist commands; redact secrets; per-session capabilities.
- **Bridging**: Map existing endpoints to tools; emit tool traces as `ToolRun` rows.

Acceptance:
- AI can call tools to install packages, write files, and restart Vite without XML; traces visible in UI.

#### M4 — UI Overhaul [Week 5–7]
- **Multi-pane layout**:
  - Chat + Plan/Steps + Jobs + Live Logs + File Diff/Apply + Package dashboard.
- **Resumability controls**:
  - Resume/rollback buttons; checkpoint selector; job detail page with step logs.
- **Diff-first edits**:
  - Show proposed file changes; approve/modify; apply selectively.

Acceptance:
- Users can resume an unfinished job, inspect diffs, and apply changes incrementally.

#### M5 — API v2 [Week 6–8]
- **Endpoints**:
  - Sessions: `POST/GET` (+ checkpoints)
  - Jobs: `POST /jobs` (type: scrape, plan, generate, apply, install), `GET /jobs/:id`, `POST /jobs/:id/cancel`
  - Files: `GET /files`, `GET /files/:path`, `POST /diffs/apply`
  - Tools: `POST /tools/run` (MCP schema), `GET /tools/runs/:id`
  - Artifacts: `GET /artifacts/:id`
- **Streaming**:
  - Keep SSE, add WebSocket channel for multiplexed job streams.

Acceptance:
- v2 endpoints drive new UI; v1 remains functional behind a flag.

#### M6 — From Snapshot → Functional App [Week 7–9]
- **Scrape → Model → Generate**:
  - Multi-page scrape (sitemaps, in-domain crawling). Extract sections/components and assets.
  - Heuristics to map sections to React components; build routing; download assets.
- **Data handling**:
  - Forms → basic handlers; mock APIs; environment config.

Acceptance:
- Provide a URL; system generates a navigable, styled, multi-page React/Next app with assets.

#### M7 — Reliability & Observability [Week 8–10]
- **Tracing**: OpenTelemetry traces for all long ops; link spans to jobs/tasks.
- **Metrics**: Job durations, error rates, install retries, model token usage.
- **Feature flags**: Gradual rollout of agentic path vs legacy path.

Acceptance:
- Dashboards show job health and usage; on-call can diagnose a failed run.

#### M8 — Security & Governance [Ongoing]
- **Secrets**: Vault/ENV policy; never echo secrets to models.
- **Rate limits**: Per session; abuse prevention for tool calls.
- **Isolation**: Fortify sandbox usage; command allowlist; timeouts.

### Architecture Changes (Mapping to Current Code)
- Replace `global.conversationState` with DB-backed `Session` + `Message` + `ProjectEvolution` records. Keep `/api/conversation-state` as a thin v1 shim.
- Introduce job runner; refactor `apply-ai-code(-stream)`, `install-packages`, `create-zip`, `generate-ai-code-stream` to enqueue tasks and stream job events.
- Extract a shared writer for files and diffs; unify path normalization.
- Add MCP tool layer; map existing capabilities:
  - `fs.write`, `fs.read`, `npm.install`, `vite.restart`, `scrape.url`, `screenshot.capture`, `zip.create`, `cmd.run`.
- Add RAG pipeline: `indexer` (ingests `get-sandbox-files` results + docs), `retriever` (top-k), and `context composer` (replaces ad-hoc prompts).

### Data Model (initial)
```sql
Session(id, createdAt, updatedAt, title, status)
Message(id, sessionId, role, content, metadata, createdAt)
Job(id, sessionId, type, state, input, output, error, createdAt, updatedAt, parentJobId)
Task(id, jobId, name, state, logs, startedAt, finishedAt)
Artifact(id, jobId, type, uri, size, metadata, createdAt)
Sandbox(id, sessionId, sandboxId, url, status, lastSeenAt)
ToolRun(id, jobId, tool, input, output, error, createdAt, durationMs)
Checkpoint(id, sessionId, label, snapshotRef, createdAt)
```

### API Additions (v2)
- Sessions: create/fetch/list; checkpoints: create/restore.
- Jobs: create by type; get; cancel; list by session.
- Tools: run with schema; list tool runs.
- Files: list files; get file content; propose diffs; apply diffs (HITL flow).

### UI Plan
- Left: Sessions & Jobs list. Center: Chat + Plan/Steps. Right: Diffs/Files/Packages.
- Job drawer with live logs (SSE/WS), steps, artifacts.
- “Resume last job” and “Revert to checkpoint” actions per session.

### Migration & Compatibility
- Phase gate with feature flags: `agentic_rag`, `mcp_tools`, `jobs_v2`.
- Keep `/api/apply-ai-code(-stream)` and XML tags; gradually shift models to tool calling.

### KPIs
- Edit precision (files touched per request)
- Resume success rate for interrupted jobs
- Time-to-first-render for generated apps
- Package install error rate

### Risks & Mitigations
- Tool misuse by models → strict schemas, allowlists, tool cooldowns.
- Flaky npm installs → retries, `--legacy-peer-deps`, cache warmup.
- Vector store costs/latency → SQLite/pgvector baseline; cache retriever results.

### Next Steps (2-week Sprint Backlog)
- Add Prisma + SQLite; implement models above; migrate conversation state.
- Implement basic job runner; wrap `install-packages` and `apply-ai-code` as jobs; stream job events via SSE.
- UI: Jobs panel + job details page; wire resume/cancel.
- Add `GET /api/v2/sessions/:id/checkpoints` + `POST /.../checkpoint` and restore.
- Create tool registry; wire `npm.install` + `fs.write` tool; log `ToolRun`.


