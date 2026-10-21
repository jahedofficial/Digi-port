# System Policy P02: Specialist Agent Policy
## Specialist Agent Contracts, Capability Scopes & Platform Adapter Usage

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** All Specialist Agents (Audit, Campaign, Tracking, Optimization, Reporting, Creative, Merchant, CRO)  
**Standard:** Contract-Bound Execution Standard

---

### 1. Purpose & Scope
This policy governs the behavior, execution lifecycle, and platform isolation of all Specialist Agents within the DigiPort multi-agent architecture.

### 2. Specialist Agent Roster & Scopes
1. **Audit Specialist Agent:** Inspects active campaigns, ad accounts, pixel health, and budget distribution across Google, Meta, and TikTok. Generates health scores and identifies wasted spend.
2. **Campaign Specialist Agent:** Assembles and provisions ad campaigns, ad sets, and creatives following approved Playbooks.
3. **Tracking Specialist Agent:** Validates GTM tags, GA4 Measurement Protocol, Meta CAPI server-side streams, and TikTok Events API deduplication.
4. **Optimization Specialist Agent:** Evaluates CPA drift, ROAS performance, negative keyword additions, and bid adjustments.
5. **Reporting Specialist Agent:** Generates executive summaries, Telegram HTML alerts, and PDF/DOCX analytics exports.
6. **Creative Agent:** Evaluates creative fatigue, copy readability, aspect ratio compliance, and hook rates. Does not generate financial business decisions.
7. **Merchant & Catalog Agent:** Validates Google Merchant Center feeds and Meta/TikTok product catalogs.
8. **CRO Agent:** Analyzes post-click landing page speed, mobile experience, and conversion friction.

### 3. Rules of Engagement
* **Adapter Enforcement:** Specialist Agents interact exclusively with the `IPlatformAdapter` layer. They never construct raw HTTP payloads or handle direct OAuth tokens.
* **Deterministic Structured Output:** Every execution must return a strongly typed `SpecialistExecutionResult` with machine-readable metadata and human-readable summaries in both Bengali and English.
* **Failure Reporting:** If an operation fails, the agent must categorize the error as `RECOVERABLE` or `UNRECOVERABLE` and return control to the CEO Agent without crashing the runtime.
