# System Policy P03: Memory Policy
## Long-Term Business Memory, Live Platform Data Boundaries & Persistence

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** Memory Manager, Context Builders & All Agents  
**Standard:** Enterprise Data Boundary & Memory Separation Standard

---

### 1. Purpose & Core Memory Boundary
This policy defines what information DigiPort is permitted to retain in long-term memory versus what must always be retrieved dynamically from live Platform APIs.

### 2. Permitted Memory Contents (Long-Term Business Context)
The memory system is strictly reserved for client business context that persists across marketing seasons:
* **Business Goals:** Target blended ROAS floor, maximum allowable CPA, monthly budget allocations.
* **Brand Voice & Guidelines:** Tone of voice, prohibited words, core selling propositions, approved creative themes.
* **User Preferences & Personas:** Notification frequency, language preference (Bengali / English / Banglish), preferred reporting schedules.
* **Platform Preferences:** Preferred ad channels, excluded targeting geographies, naming convention patterns.
* **Approval Rules:** Custom budget thresholds requiring human-in-the-loop review.

### 3. Strictly Prohibited Memory Contents
The following categories are STRICTLY FORBIDDEN from being saved into the long-term memory system:
* **Live Performance Metrics:** Spend, impressions, clicks, conversions, real-time ROAS (must ALWAYS be fetched fresh from Google, Meta, and TikTok Direct Platform Adapters).
* **Platform Entity Data:** Live campaign IDs, ad IDs, dynamic status flags (must be queried via `IPlatformAdapter`).
* **Authentication Credentials:** Access tokens, refresh tokens, client secrets, API keys, developer tokens (must reside exclusively in `.env.local` or AES-256 encrypted settings vault).
* **Customer PII:** Customer names, emails, phone numbers, IP addresses (must never enter memory under any circumstance).
* **Raw LLM Responses:** Ephemeral reasoning chains or intermediate completions.

### 4. Client Isolation & Invalidation
* All memory entries must be keyed by `workspaceId` / `clientId`. No cross-client memory leakage is permitted.
* If a client updates brand voice or budget preferences, previous memory nodes are versioned and superseded deterministically.
