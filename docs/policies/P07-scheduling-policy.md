# System Policy P07: Scheduling Policy
## Heartbeat Monitoring, Cron Schedules & Event Trigger Governance

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** Schedule Engine (`assets/schedules/`), BullMQ & Background Workers  
**Standard:** Deterministic Scheduling & Non-Blocking Background Execution

---

### 1. Purpose & Scheduling Topology
This policy governs autonomous periodic and event-driven marketing workflows, including health heartbeats, spend pacing inspections, and weekly performance audits.

### 2. Core Scheduling Mechanisms
1. **System Heartbeat:**
   * Periodically validates database connectivity, Redis state, OpenClaw gateway health, and platform API token validity.
   * Dynamic Interval Support: Supports natural language and structured duration formats (e.g. `15m`, `45min`, `2 hours`, `6hr`, `24h`).
2. **Recurring Marketing Cron Jobs:**
   * **Daily Budget Pacing (08:00 Local):** Inspects morning burn rate, compares to target daily cap, detects runaway spend.
   * **Midday ROAS & CPA Audit (14:00 Local):** Checks campaign conversion metrics, evaluates bid efficiency.
   * **Nightly Reconciliation & Report Generation (23:30 Local):** Computes final daily blended ROAS, generates executive summary, sends Telegram digest.
3. **Event-Driven Workflows:**
   * **Conversion Anomaly Trigger:** Triggered immediately when CAPI ingestion drops below 50% of the 7-day average.
   * **Token Expiry Notice:** Triggered 24 hours prior to token expiration.

### 3. Execution Constraints
* **Non-Blocking Execution:** Scheduled jobs must execute asynchronously without blocking user web interactions or synchronous API endpoints.
* **Per-Client Job Isolation:** Scheduled runs execute inside client-specific context scopes. A failure in Client A's audit job must never halt Client B's scheduled jobs.
