# Connectivity Validation Report: Direct Platform & Service Endpoints

**System:** DigiPort Universal Paid Media OS  
**Module:** `PlatformAdapterRegistry` & `HealthMonitorService`  
**Status:** ✅ Validated  

---

## 1. Direct Advertising Platform Connectivity

DigiPort communicates directly with official ad platform APIs over HTTPS without intermediate middleware.

| Target Platform | Official API Endpoint | Auth Protocol | Direct Adapter Class | Connectivity Status |
|---|---|---|---|:---:|
| **Google Ads** | `https://googleads.googleapis.com/v17/customers/{customerId}/googleAds:searchStream` | OAuth2 Bearer Token | `GoogleAdsAdapter` | ✅ Verified |
| **Meta Ads** | `https://graph.facebook.com/v20.0/{adAccountId}/insights` | System User Access Token | `MetaGraphAdapter` | ✅ Verified |
| **TikTok Ads** | `https://business-api.tiktok.com/open_api/v1.3/campaign/get/` | Access-Token Header | `TikTokBusinessAdapter` | ✅ Verified |

---

## 2. Infrastructure Services Connectivity

| Service | Target Host / Port | Protocol / Transport | Purpose | Status |
|---|---|---|---|:---:|
| **PostgreSQL** | `postgres:5432` | TCP / PostgreSQL Wire Protocol | Persistent Relational Store (Campaigns, Actions) | ✅ Verified |
| **Redis** | `redis:6379` | TCP / Redis RESP Protocol | Distributed Cache, Queue, and Session Locks | ✅ Verified |
| **OpenClaw** | `openclaw:18789` | HTTP / JSON-RPC | AI Gateway Model Routing | ✅ Verified |
| **Telegram Bot**| `https://api.telegram.org` | HTTPS / REST | Critical Alerts & One-Click Human Approval Cards | ✅ Verified |
| **OpenRouter** | `https://openrouter.ai/api/v1` | HTTPS / SSE Streaming | Large Language Model Provider (DeepSeek / Claude) | ✅ Verified |

---

## 3. Resilience & Failure Recovery

- **Connection Timeouts:** Configured with 5000ms socket connection timeout.
- **Circuit Breaker:** Consecutive platform failures trigger status transition to `DEGRADED`, pausing non-critical audits while keeping core application responsive.
- **Safe Mode Probing:** Connectivity probes use read-only inspection endpoints to prevent unintentional campaign budget spend or state changes.
