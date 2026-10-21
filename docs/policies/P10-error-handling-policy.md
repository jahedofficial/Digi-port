# System Policy P10: Error Handling Policy
## Error Classification, Circuit Breakers & Bilingual Messaging Standards

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** All Modules, Platform Adapters & Route Handlers  
**Standard:** Enterprise Resilient Error Handling Standard

---

### 1. Purpose & Core Philosophy
The DigiPort error handling architecture ensures that runtime failures are gracefully contained, automatically retried when transient, and communicated clearly to marketers in actionable, human-friendly terms without exposing internal stack traces.

### 2. Error Categorization & Handling Protocols

| Category | Typical Conditions | Handling Protocol | User Notification Style |
|---|---|---|---|
| **Transient Network** | DNS timeout, HTTP 502/503/504, TCP reset | Retry up to 3 times with exponential backoff (1s, 2s, 4s) | Silent retry; only notify if all 3 fail |
| **Authentication Expired** | HTTP 401, Google `UNAUTHENTICATED` | Trigger `ICredentialManager.refreshOAuthToken()` and replay request | Transparent recovery; notify only if refresh token invalid |
| **Platform Rate Limit** | HTTP 429, Meta Error 17 | Pause calls to target platform for backoff duration; queue requests | Info alert: "Platform rate limit reached; operations paused for 60s" |
| **Policy Violation** | Ad disapproved, prohibited content | Halt operation immediately; DO NOT retry. Log violation details | Critical warning with direct link to platform policy guidelines |
| **Invalid Client Input** | Negative budget, invalid date range | Reject at validation layer (HTTP 400); return structured error | Instant feedback: "বাজেট অবশ্যই ধনাত্মক সংখ্যা হতে হবে" |

### 3. Circuit Breaker Mechanism
If an external platform endpoint fails 5 consecutive times within a 3-minute window, the Circuit Breaker trips to `OPEN` state:
* Outgoing requests to that platform fail fast without waiting for timeouts.
* A canary health probe tests the endpoint every 30 seconds.
* Upon 2 successful canary responses, the breaker resets to `CLOSED`.

### 4. Bilingual Error Standards
API responses and UI alerts must provide clear, concise descriptions in Bengali and English:
* English: `"Google Ads refresh token expired. Please reconnect in Platform Hub."`
* Bengali: `"গুগল অ্যাডস টোকেন মেয়াদোত্তীর্ণ হয়েছে। অনুগ্রহ করে প্ল্যাটফর্ম হাবে রি-কানেক্ট করুন।"`
