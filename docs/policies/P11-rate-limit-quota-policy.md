# System Policy P11: Rate Limit & Quota Policy
## Per-Platform Quota Management: Google Ads, Meta Marketing & TikTok APIs

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** Platform Adapters, Credential Manager & Redis Rate Limiter  
**Standard:** Platform Quota Compliance & Multi-Tier Throttling Standard

---

### 1. Purpose & Quota Governance
Advertising platforms strictly regulate API call volume, query complexity, and concurrent mutation rates. This policy defines the per-platform throttling constraints and backoff algorithms required to guarantee uninterrupted operational availability without incurring platform bans.

### 2. Per-Platform Quota Specifications

#### A. Google Ads Direct API Quotas
* **Developer Token Tiers:**
  * **Test / Basic Access:** Up to 15,000 operations per day.
  * **Standard Access:** Unlimited operations, subject to per-customer query concurrency limits.
* **Query Optimization Rule:** Always use `googleAds:searchStream` instead of paginated `googleAds:search` to minimize HTTP overhead and consume fewer quota units.
* **Concurrency Cap:** Maximum of 5 concurrent streaming queries per `customerId`.

#### B. Meta Marketing API Quotas (Graph API v20.0)
* **Rate Limit Headers:** Inspected on every response header `X-Business-Use-Case-Usage` and `X-App-Usage`.
  * `call_count`: Percentage of allowed calls made.
  * `cpu_time`: Percentage of allowed backend CPU consumed.
  * `total_time`: Percentage of allowed total execution time consumed.
* **Proactive Throttling Thresholds:**
  * When any metric reaches **75%**: System introduces a 500ms delay between consecutive requests.
  * When any metric reaches **90%**: System halts non-critical audits and permits only user-approved mutations.
  * When any metric reaches **100% (Error 17)**: Full backoff for 60 seconds.

#### C. TikTok Business API Quotas (Open API v1.3)
* **Queries Per Second (QPS):** Capped at 10 QPS per `advertiser_id` for reporting queries, and 5 QPS for campaign mutations.
* **Events API:** Burst allowance of up to 1,000 events per single batch POST (`/open_api/v1.3/event/track/`).

---

### 3. DigiPort Internal Rate Limiting Architecture
* **Redis Token Bucket:** Internal requests to platform adapters pass through a Redis-backed token bucket algorithm (`src/lib/rate-limiter.ts`) ensuring smooth traffic distribution.
* **Priority Queue:** User-initiated live mutations (e.g. Campaign Launch, Emergency Pause) bypass background audit tasks in the execution queue.
