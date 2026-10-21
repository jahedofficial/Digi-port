# Architecture Document 05: Dependency Graph
## Compile-Time Dependency Graph, Runtime DI Tree & SDK Isolation Rules

**Version:** 2.0.0  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Standard:** Unidirectional Architecture & Platform SDK Isolation

---

### 1. Compile-Time Dependency Graph

To prevent circular dependencies, tight coupling, and leaky platform abstractions, compile-time dependencies flow strictly downwards:

```mermaid
graph TD
    UI[src/components / UI Views] --> API[src/app/api Routes]
    API --> CEO[CEO Agent Orchestrator]
    CEO --> SPECIALISTS[Specialist Agents]
    SPECIALISTS --> ADAPTER_INTERFACES[IPlatformAdapter Contracts]
    SPECIALISTS --> ENGINES[Risk & Decision Engines]
    ADAPTER_INTERFACES --> ADAPTER_IMPL[Platform Adapters]
    ADAPTER_IMPL --> CRED_MGR[ICredentialManager]
    ADAPTER_IMPL --> EXTERNAL_SDKS[Official Platform SDKs / Direct HTTPS]
    CRED_MGR --> VAULT[Encryption & Settings Store]
    ENGINES --> TYPES[src/types Models]
    CEO --> MEMORY[Memory Manager]
    MEMORY --> TYPES

    classDef allowed fill:#1e293b,stroke:#3b82f6,color:#ffffff;
    classDef isolated fill:#0f172a,stroke:#ef4444,color:#ffffff;
    class UI,API,CEO,SPECIALISTS,ADAPTER_INTERFACES,ENGINES,ADAPTER_IMPL,CRED_MGR,VAULT,TYPES,MEMORY allowed;
    class EXTERNAL_SDKS isolated;
```

---

### 2. Runtime Dependency Injection (DI) Tree

```mermaid
graph TD
    ROOT[Root Container Application Bootstrap]
    
    subgraph "Infrastructure Singletons"
        ROOT --> PRISMA_SVC[PrismaService]
        ROOT --> REDIS_SVC[RedisCacheService]
        ROOT --> CRYPTO_SVC[EncryptionVaultService]
        ROOT --> LOG_SVC[StructuredLoggerService]
    end

    subgraph "Credential & Platform Providers"
        CRYPTO_SVC --> CRED_SVC[CredentialManagerService]
        CRED_SVC --> G_ADAPT[GoogleAdsPlatformAdapter]
        CRED_SVC --> M_ADAPT[MetaPlatformAdapter]
        CRED_SVC --> T_ADAPT[TikTokPlatformAdapter]
    end

    subgraph "Specialist Agent Singletons"
        G_ADAPT & M_ADAPT & T_ADAPT --> SPEC_AUDIT[AuditSpecialistAgent]
        G_ADAPT & M_ADAPT & T_ADAPT --> SPEC_CAMP[CampaignSpecialistAgent]
        G_ADAPT & M_ADAPT & T_ADAPT --> SPEC_TRACK[TrackingSpecialistAgent]
        G_ADAPT & M_ADAPT & T_ADAPT --> SPEC_OPT[OptimizationSpecialistAgent]
    end

    subgraph "Governance & Orchestration"
        SPEC_AUDIT & SPEC_CAMP & SPEC_TRACK & SPEC_OPT --> RISK_SVC[RiskEngine]
        SPEC_AUDIT & SPEC_CAMP & SPEC_TRACK & SPEC_OPT --> DEC_SVC[DecisionEngine]
        RISK_SVC & DEC_SVC --> CEO_SVC[CEOAgentOrchestrator]
    end
```

---

### 3. Platform SDK Isolation Rules

To protect the system from breaking platform SDK updates, API deprecations, and architectural lock-in, the following strict rules are enforced:

1. **Rule 1: Direct Platform SDK Imports Forbidden in Agents:**  
   Specialist Agents, CEO Agents, and Decision Engines must NEVER import platform-specific SDKs (e.g. `google-ads-api`, `facebook-nodejs-business-sdk`, `tiktok-business-sdk`). They interact ONLY with `IPlatformAdapter`.
2. **Rule 2: Normalized Type Boundary:**  
   Any raw JSON returned by Meta Graph API, Google Ads Query Language (GAQL), or TikTok Business API must be transformed into DigiPort normalized types (`UnifiedCampaign`, `UnifiedAdGroup`, `UnifiedMetricRecord`) within the adapter before returning to the caller.
3. **Rule 3: Credential Encapsulation:**  
   Access tokens, OAuth client secrets, and developer tokens never travel beyond the `PlatformAdapter` boundary. Specialist agents only pass a `clientId` string.
4. **Rule 4: Network Isolation:**  
   External HTTPS calls to `googleads.googleapis.com`, `graph.facebook.com`, and `business-api.tiktok.com` can only be initiated from files located under `src/lib/adapters/*` or `src/lib/credential-manager.ts`.
