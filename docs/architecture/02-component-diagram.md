# Architecture Document 02: Component Diagram
## Component Architecture, Credential Flows & Interface Matrix

**Version:** 2.0.0  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Integration Type:** Direct Platform Adapters & Dedicated Credential Manager

---

### 1. Detailed System Component Diagram

```mermaid
graph TB
    subgraph "Client Ingress & Interaction"
        UI[Next.js 16 Web Dashboard]
        TG[Telegram Bot Webhook / Long-polling]
        API_GW[Internal Route Handlers /api/*]
    end

    subgraph "Core Runtime & DI Container"
        BOOT[Runtime Bootstrap]
        EV_BUS[Typed Event Bus]
        LOGGER[Structured Logger & Audit Trail]
    end

    subgraph "Autonomous Brain & Reasoning"
        OPENCLAW[OpenClaw Gateway v2026.7.1-2 / port 18789]
        OPENROUTER[OpenRouter DeepSeek/Claude/GPT Fallbacks]
    end

    subgraph "Orchestration & Governance"
        CEO[CEO Orchestration Agent]
        DECISION[Decision Engine]
        RISK[Risk & Policy Engine]
        QUEUE[ActionQueue Approval Store]
    end

    subgraph "Specialist Agent Layer"
        AUDIT[Audit Specialist Agent]
        CAMP[Campaign Specialist Agent]
        TRACK[Tracking Specialist Agent]
        OPT[Optimization Specialist Agent]
        REP[Reporting Specialist Agent]
        CREAT[Creative Analysis Agent]
        MERCH[Merchant & Catalog Agent]
        CRO[CRO Specialist Agent]
    end

    subgraph "Platform Adapter & Credential Core"
        CRED[ICredentialManager Module]
        GADAPT[Google Ads & GA4 Direct Adapter]
        MADAPT[Meta Marketing API & CAPI Adapter]
        TADAPT[TikTok Ads & Events Direct Adapter]
    end

    subgraph "External Target APIs"
        EXT_G[(Google Ads & GA4 API)]
        EXT_M[(Meta Graph API v20.0)]
        EXT_T[(TikTok Business API v1.3)]
    end

    subgraph "Storage & Memory Layer"
        MEM[Client Memory Manager]
        PRISMA[(Prisma ORM - PostgreSQL)]
        REDIS[(Redis Cache / BullMQ)]
        ENC_STORE[(AES-256 Encrypted File Store)]
    end

    UI & TG --> API_GW
    API_GW --> CEO
    CEO <--> MEM
    CEO <--> OPENCLAW
    OPENCLAW -.-> OPENROUTER
    CEO --> DECISION & RISK
    RISK --> QUEUE
    CEO --> AUDIT & CAMP & TRACK & OPT & REP & CREAT & MERCH & CRO
    AUDIT & CAMP & TRACK & OPT --> GADAPT & MADAPT & TADAPT
    GADAPT & MADAPT & TADAPT <--> CRED
    CRED <--> PRISMA & ENC_STORE
    GADAPT <--> EXT_G
    MADAPT <--> EXT_M
    TADAPT <--> EXT_T
```

---

### 2. Credential Flow & Authorization Lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant Agent as Specialist Agent (e.g. CampaignAgent)
    participant Adapter as MetaPlatformAdapter
    participant CredMgr as ICredentialManager
    participant Vault as AES-256 Secret Store / Env
    participant MetaAPI as Meta Graph API (v20.0)

    Agent->>Adapter: executeOperation(createAdSet, payload, clientId)
    Adapter->>CredMgr: getPlatformCredentials('META', clientId)
    CredMgr->>Vault: fetchDecryptedTokens(clientId)
    Vault-->>CredMgr: { META_ACCESS_TOKEN, META_AD_ACCOUNT_ID }
    CredMgr->>CredMgr: validateTokenScopes(['ads_management'])
    CredMgr-->>Adapter: Validated PlatformCredentials (In-Memory Only)
    Adapter->>MetaAPI: POST /act_{AD_ACCOUNT_ID}/adsets (Header: Bearer Token)
    MetaAPI-->>Adapter: HTTP 200 { id: "adset_984128" }
    Adapter-->>Agent: ExecutionResult { success: true, platformEntityId: "adset_984128" }
    Note over CredMgr,Adapter: Tokens flushed from stack immediately after dispatch
```

---

### 3. Component Interface Matrix

| Source Component | Target Component | Protocol / Interface | Responsibility |
|---|---|---|---|
| **CEO Agent** | `ISpecialistAgent` | In-process TypeScript Contract | Task delegation with validated playbooks |
| **CEO Agent** | `IRiskEngine` | In-process TypeScript Contract | Safety evaluation, budget check, policy check |
| **Specialist Agents** | `IPlatformAdapter` | In-process TypeScript Contract | Normalized ad entity dispatch & metrics retrieval |
| **Platform Adapters** | `ICredentialManager` | Async In-process Contract | Retrieval and refresh of platform OAuth & system keys |
| **Platform Adapters** | Google / Meta / TikTok | Direct HTTPS REST / GraphQL | Official platform operations |
| **CEO & Specialists** | OpenClaw Gateway | HTTP/REST `/v1/chat/completions` | Complex reasoning, copy generation, analysis |
| **ICredentialManager** | Prisma / AES-256 Store | Database / Filesystem AES-GCM | Persistent encrypted credentials retrieval |
| **Risk Engine** | ActionQueue | Database State Record | Human approval card creation and resolution |
