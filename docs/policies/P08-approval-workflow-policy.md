# System Policy P08: Approval Workflow Policy
## Human-in-the-Loop Approval Policy & ActionQueue Execution Thresholds

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** Risk Engine, ActionQueue & All Specialist Agents  
**Standard:** Enterprise Human-in-the-Loop Financial Safety Standard

---

### 1. Purpose & Core Philosophy
Autonomous marketing agents operate under strict financial and regulatory guardrails. The system ensures that high-impact or risk-bearing decisions require explicit human authorization before mutating live advertising accounts.

### 2. Mandatory Approval Triggers
The following operations CANNOT be executed automatically by any AI agent and must be submitted to the `ActionQueue` as interactive approval cards:
1. **New Campaign Launch:** Any new ad campaign, ad set, or creative deployment across Google, Meta, or TikTok.
2. **Budget Modifications Greater than ±20%:** Any scale or reduction exceeding 20% of the current daily budget.
3. **Ad or Campaign Pausing / Termination:** Halting active campaigns or disabling high-spend ad sets.
4. **Targeting or Bidding Strategy Shifts:** Switching from Target CPA to Maximize Conversions or altering geographic boundaries.
5. **Special Ad Categories:** Campaigns involving Housing, Employment, Credit, or Health.
6. **Pixel / Tracking Structural Changes:** Adding or removing server-side CAPI endpoints.

### 3. Permitted Autonomous Actions (Zero-Approval Required)
Specialist Agents may execute the following read-only and protective actions autonomously:
* Generating audits, performance reports, and executive summaries.
* Sending proactive Telegram alerts and performance notifications.
* Emergency protective pause during catastrophic CPA spikes (>300% of target) if "Auto-Guard" is explicitly enabled by the client in settings.
* Logging audit scores and recording daily metrics.

### 4. Approval Resolution Lifecycle
* **Expiration Policy:** If an action card is neither approved nor rejected within 24 hours, it transitions to `EXPIRED` status and cannot be executed without re-evaluation.
* **Audit Trail:** Approved actions must record the reviewer's identifier, confirmation timestamp, and exact diff of parameters applied.
