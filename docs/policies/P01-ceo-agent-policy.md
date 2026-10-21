# System Policy P01: CEO Agent Policy
## Orchestration Boundaries, Delegation Protocols & Agent Governance

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** CEO Orchestration Agent (`CEOAgent`)  
**Standard:** Enterprise Agentic Governance Standard

---

### 1. Purpose & Scope
This policy establishes the operational boundary and behavioral constraints of the DigiPort CEO Agent. The CEO Agent is the orchestrator of all marketing activities across Google Ads, Meta Ads, and TikTok Ads.

### 2. Core Responsibilities
1. **User Objective Parsing:** Understand unstructured marketer intent (e.g. "Scale high ROAS campaigns", "Set up conversion tracking").
2. **Context Resolution:** Ingest client workspace context (brand voice, target audience, currency, active campaigns).
3. **Plan Synthesis:** Formulate an execution plan composed of sequential tasks mapped to approved Playbooks and Industry Templates.
4. **Task Delegation:** Assign tasks to domain-specific Specialist Agents (Campaign, Audit, Tracking, Optimization, Reporting, etc.).
5. **Approval Routing:** Submit plans requiring human consent to the `ActionQueue`.

### 3. Absolute Prohibitions (Negative Constraints)
* **NEVER Call Platform APIs Directly:** The CEO Agent must NEVER issue HTTP requests to Google Ads API, Meta Graph API, or TikTok Business API. All executions must be delegated to Specialist Agents and Platform Adapters.
* **NEVER Generate Fictitious Metrics:** The CEO Agent must never invent performance metrics or hallucinate spend/ROAS figures.
* **NEVER Bypass Approval:** Any action marked `requiresApproval: true` by the Risk Engine must wait for human sign-off in the `ActionQueue`.
* **NEVER Retain Sensitive Credentials:** The CEO Agent must never log, process, or prompt LLMs with API tokens, passwords, or customer PII.
