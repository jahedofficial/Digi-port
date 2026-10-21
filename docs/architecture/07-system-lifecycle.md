# Architecture Document 07: System Lifecycle
## System Lifecycle, State Transitions & Credential Validation Sequence

**Version:** 2.0.0  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Standard:** Resilient State Machine & Startup Verification

---

### 1. Master System State Diagram

```mermaid
stateDiagram-v2
    [*] --> BOOTING: Process Start / npm run start
    
    BOOTING --> VALIDATING_ENVIRONMENT: Load .env.local & Init Modules
    
    VALIDATING_ENVIRONMENT --> VALIDATING_CREDENTIALS: Core DB & Redis Ready
    VALIDATING_ENVIRONMENT --> FAILED_STARTUP: Missing Infrastructure (.env / DB Offline)
    
    VALIDATING_CREDENTIALS --> RUNNING_HEALTHY: All Platform Credentials Present & Verified
    VALIDATING_CREDENTIALS --> RUNNING_DEGRADED: Partial Platform Credentials (e.g. Google OK, Meta Missing)
    VALIDATING_CREDENTIALS --> LOCKED_SAFE_MODE: Critical Encryption Secret Corrupt / JWT Missing
    
    RUNNING_HEALTHY --> RUNNING_DEGRADED: Platform API Outage / Expired Token Detected
    RUNNING_DEGRADED --> RUNNING_HEALTHY: Token Refreshed / Connection Hub Verified
    
    RUNNING_HEALTHY --> SHUTTING_DOWN: SIGTERM / SIGINT Received
    RUNNING_DEGRADED --> SHUTTING_DOWN: SIGTERM / SIGINT Received
    LOCKED_SAFE_MODE --> SHUTTING_DOWN: Admin Stop
    
    SHUTTING_DOWN --> [*]: Graceful Cleanup & Exit
```

---

### 2. Startup Credential Validation Sequence

During startup, the `SystemLifecycleManager` runs a non-destructive verification sequence:

```mermaid
sequenceDiagram
    autonumber
    participant Boot as Application Bootstrap
    participant CredMgr as ICredentialManager
    participant Vault as AES-256 Vault / Env
    participant Platforms as Platform Health Probes
    participant Gateway as OpenClaw Gateway Probe

    Boot->>Vault: Probe ENCRYPTION_SECRET & DATABASE_URL
    Vault-->>Boot: Core Secrets Active (256-bit Key Valid)
    Boot->>CredMgr: Verify Platform Credentials
    par Google Ads Probe
        CredMgr->>Platforms: Validate Google Refresh Token (oauth2.googleapis.com)
    and Meta Ads Probe
        CredMgr->>Platforms: Validate Meta System User Token (/debug_token)
    and TikTok Ads Probe
        CredMgr->>Platforms: Validate TikTok Access Token (/oauth2/advertiser/get/)
    and OpenClaw Probe
        CredMgr->>Gateway: Ping OpenClaw Gateway (/health at port 18789)
    end
    Platforms-->>CredMgr: Verification Status Matrix
    Gateway-->>CredMgr: Gateway Live (DeepSeek v4 Active)
    CredMgr-->>Boot: System Health Report (Degraded or Healthy)
    Boot->>Boot: Mount App Router & Listen on PORT
```

---

### 3. Graceful Degradation & Fault Tolerance Rules

1. **Per-Platform Fault Isolation:**  
   If Meta Marketing API credentials expire or return `401 Unauthorized`, the system marks Meta as `DEGRADED`. Google Ads and TikTok campaigns continue running uninterrupted.
2. **AI Gateway Fallback:**  
   If OpenClaw VPS is temporarily unreachable, the AI Gateway automatically cascades to the direct OpenRouter fallback chain (DeepSeek v4 Flash -> GPT-4o Mini -> Claude 3.5 Sonnet) without failing user chats.
3. **Graceful Shutdown Protocol:**  
   Upon receiving `SIGINT` or `SIGTERM`, running in-flight API mutations are allowed up to 10 seconds to finish. Database connection pools and Redis queues are cleanly flushed and closed.
