# Architecture Document 01: System Architecture
## 7-Layer Enterprise Stack & Direct API Integration Architecture

**Version:** 2.0.0 (Direct Platform API Revised)  
**Governance:** Enterprise Agentic Architecture (Phase 1 Deliverable)  
**Security Standard:** Strict Zero-Credential Leakage & Client-Isolated Execution

---

### 1. The 7-Layer Architectural Stack

DigiPort is structured as a 7-layer decoupled enterprise system where each layer has strictly defined boundaries, unidirectional dependencies, and no direct bypass mechanisms.

```mermaid
graph TD
    subgraph "Layer 1: Presentation & Interaction Layer"
        L1_UI[Next.js 16 App Router UI / React 19]
        L1_TG[Telegram Bot Channel @digiportai_bot]
        L1_AQ[ActionQueue Human-in-the-Loop Modal Cards]
    end

    subgraph "Layer 2: Orchestration & Workflow Layer"
        L2_CEO[CEO Orchestrator Agent]
        L2_Plan[Workflow Planner & DAG Engine]
        L2_Context[Context Builder & Client Isolator]
    end

    subgraph "Layer 3: Governance, Decision & Safety Layer"
        L3_Risk[Risk Engine - Budget & Policy Rails]
        L3_Decision[Decision Engine - Confidence & Ranking]
        L3_Gate[Human-in-the-Loop Approval Gatekeeper]
    end

    subgraph "Layer 4: Specialist Agent Layer"
        L4_Audit[Audit Specialist Agent]
        L4_Camp[Campaign Specialist Agent]
        L4_Track[Tracking & Conversion Specialist Agent]
        L4_Opt[Optimization Specialist Agent]
        L4_Rep[Reporting Specialist Agent]
        L4_Creat[Creative Analysis Agent]
        L4_Merch[Merchant & Catalog Agent]
        L4_CRO[CRO Specialist Agent]
    end

    subgraph "Layer 5: Platform Adapter & Credential Layer"
        L5_Cred[ICredentialManager & Token Vault]
        L5_Google[Google Ads, GA4 & GTM Direct Adapter]
        L5_Meta[Meta Marketing API & CAPI Direct Adapter]
        L5_TikTok[TikTok Ads & Events API Direct Adapter]
    end

    subgraph "Layer 6: Autonomous AI Gateway Layer"
        L6_Claw[OpenClaw Gateway v2026.7.1-2 /port 18789]
        L6_Router[OpenRouter Direct Fallback Chain]
    end

    subgraph "Layer 7: Persistence & Infrastructure Layer"
        L7_PG[(PostgreSQL Database via Prisma ORM)]
        L7_Redis[(Redis Job Queue & Rate Limit Cache)]
        L7_EncStore[AES-256 System Settings Encrypted File Store]
    end

    L1_UI & L1_TG --> L2_CEO
    L2_CEO --> L3_Risk & L3_Decision
    L3_Risk --> L3_Gate
    L3_Gate -- Approved --> L4_Audit & L4_Camp & L4_Track & L4_Opt & L4_Rep & L4_Creat & L4_Merch & L4_CRO
    L4_Camp & L4_Audit & L4_Track & L4_Opt --> L5_Google & L5_Meta & L5_TikTok
    L5_Google & L5_Meta & L5_TikTok <--> L5_Cred
    L2_CEO & L4_Audit --> L6_Claw
    L6_Claw -. Fallback .-> L6_Router
    L2_CEO & L5_Cred & L3_Risk <--> L7_PG & L7_Redis & L7_EncStore
```

---

### 2. Direct Platform API Integration Model

All external communications with advertising platforms (Google Ads, Meta, TikTok) bypass third-party aggregator intermediaries and communicate directly with official platform endpoints via authenticated adapters:

1. **Google Ads Direct Adapter:**
   * **Endpoint:** `https://googleads.googleapis.com/v17/`
   * **Authentication:** OAuth2 Refresh Token exchange via Google Identity (`https://oauth2.googleapis.com/token`) signed with `GOOGLE_ADS_DEVELOPER_TOKEN` and `GOOGLE_ADS_CLIENT_ID` / `GOOGLE_ADS_CLIENT_SECRET`.
   * **Scope:** `https://www.googleapis.com/auth/adwords`, `https://www.googleapis.com/auth/analytics.readonly`, `https://www.googleapis.com/auth/tagmanager.edit.containers`.

2. **Meta Marketing API & CAPI Direct Adapter:**
   * **Endpoint:** `https://graph.facebook.com/v20.0/`
   * **Authentication:** Long-Lived System User Access Token (`META_ACCESS_TOKEN`) with `ads_management`, `ads_read`, `business_management` permissions.
   * **Server-side Tracking:** Direct HTTPS POST to `https://graph.facebook.com/v20.0/{PIXEL_ID}/events`.

3. **TikTok Marketing API & Events API Direct Adapter:**
   * **Endpoint:** `https://business-api.tiktok.com/open_api/v1.3/`
   * **Authentication:** Long-Term Advertiser Access Token (`TIKTOK_ACCESS_TOKEN`) authorized via TikTok Developer Portal with App Secret HMAC validation.

---

### 3. Credential Security & Isolation Principle

* **Zero Memory Storage:** Live API tokens, secrets, client secrets, and developer tokens are NEVER written to the AI Memory system, prompt logs, or client-facing responses.
* **Storage Invariance:** All production credentials reside exclusively in `.env.local` or inside the database encrypted via AES-256-GCM (`system_settings.enc.json` fallback).
* **Ephemeral In-Memory Token Lifecycle:** The `ICredentialManager` resolves tokens just-in-time for outgoing requests and never caches decrypted tokens beyond their explicit TTL.
* **Client Isolation:** Each client workspace operates under an isolated partition ID (`workspaceId`). Tokens for Client A are strictly unreachable by tasks executing for Client B.
