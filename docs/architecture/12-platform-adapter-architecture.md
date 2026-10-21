# Architecture Document 12: Platform Adapter Architecture
## Direct Platform Adapters: Google OAuth2, Meta System User & TikTok API

**Version:** 2.0.0 (Direct Integration Rewrite)  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Standard:** Native Platform Adapters without Third-Party Middleware

---

### 1. Adapter Architecture Overview

The `PlatformAdapter` layer decouples DigiPort's unified marketing domain from platform-specific SDKs, wire protocols, and error codes:

```mermaid
graph TD
    UNIFIED_DOMAIN[Unified Specialist Contract] --> ADAPTER_CORE[Platform Adapter Manager]
    
    subgraph "Google Direct Adapter Subsystem"
        ADAPTER_CORE --> G_ADAPT[GooglePlatformAdapter]
        G_ADAPT --> G_AUTH[Google OAuth2 Client]
        G_ADAPT --> G_GAQL[GAQL Query Generator]
        G_ADAPT --> G_REST[Google Ads REST Client v17]
    end

    subgraph "Meta Direct Adapter Subsystem"
        ADAPTER_CORE --> M_ADAPT[MetaPlatformAdapter]
        M_ADAPT --> M_CAPI[Meta CAPI Client v20.0]
        M_ADAPT --> M_GRAPH[Meta Graph API Client]
        M_ADAPT --> M_LIMIT[X-Business-Use-Case Rate Guard]
    end

    subgraph "TikTok Direct Adapter Subsystem"
        ADAPTER_CORE --> T_ADAPT[TikTokPlatformAdapter]
        T_ADAPT --> T_REST[TikTok Business API v1.3]
        T_ADAPT --> T_EVENTS[TikTok Events API Client]
    end
```

---

### 2. Deep Dive: Platform Authentication & Wire Protocols

#### 1. Google Ads Platform Adapter
* **Authentication Method:** OAuth2 User Consent / Service Refresh Token.
* **Header Structure:**
  * `Authorization: Bearer <access_token>`
  * `developer-token: <GOOGLE_ADS_DEVELOPER_TOKEN>`
  * `login-customer-id: <GOOGLE_ADS_LOGIN_CUSTOMER_ID>` (required if accessing accounts under an MCC / Manager Account).
* **Automatic Token Refresh:** When an API call returns `UNAUTHENTICATED` (HTTP 401), the adapter invokes `ICredentialManager.refreshOAuthToken('GOOGLE', clientId)`, caches the fresh token, and retries the request once.

#### 2. Meta Marketing Platform Adapter
* **Authentication Method:** Long-Lived System User Access Token (`META_ACCESS_TOKEN`).
* **Header Structure:** `Authorization: Bearer <META_ACCESS_TOKEN>`.
* **Rate Limit Monitoring:** Meta returns rate limits in the response header `X-Business-Use-Case-Usage`. The adapter parses `call_count`, `cpu_time`, and `total_time`. If any metric exceeds 80%, the adapter throttles subsequent calls with exponential backoff.

#### 3. TikTok Business Platform Adapter
* **Authentication Method:** Permanent / Long-Term Advertiser Access Token (`TIKTOK_ACCESS_TOKEN`).
* **Header Structure:** `Access-Token: <TIKTOK_ACCESS_TOKEN>`.
* **API Version:** TikTok Marketing Open API `v1.3`.

---

### 3. Error Translation & Unified Status Mapping

Platform adapters translate heterogeneous error codes into uniform DigiPort exceptions:

| Platform Error Condition | Raw Error Code | DigiPort Unified Exception | Action Taken |
|---|---|---|---|
| **Google Expired Token** | `UNAUTHENTICATED (HTTP 401)` | `TokenExpiredException` | Trigger OAuth refresh and retry |
| **Meta Rate Limit Exceeded** | `Error 17 / User Request Limit` | `RateLimitExceededException` | Backoff 60s, notify queue |
| **TikTok Budget Lower Than Min** | `Error 40002` | `InvalidParameterException` | Return clear validation error |
| **Google Policy Violation** | `POLICY_VIOLATION` | `AdPolicyViolationException` | Halt campaign, require human review |
| **Meta Creative Rejected** | `AD_REVIEW_DECLINED` | `AdPolicyViolationException` | Notify marketer via Telegram |
