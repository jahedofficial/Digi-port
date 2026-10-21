# Architecture Document 13: Cross-Platform Data Model
## Entity Relationship Diagram, Normalized Metrics & Attribution Model

**Version:** 2.0.0  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Standard:** Cross-Platform Normalized Schema & Attribution Modeling

---

### 1. Cross-Platform Relational ERD

```mermaid
erDiagram
    ClientWorkspace ||--o{ PlatformAccount : owns
    ClientWorkspace ||--o{ Campaign : manages
    ClientWorkspace ||--o{ ConversionEvent : receives
    ClientWorkspace ||--o{ ActionQueueItem : generates
    
    PlatformAccount ||--o{ Campaign : contains
    Campaign ||--o{ AdSet : contains
    AdSet ||--o{ AdCreative : serves
    Campaign ||--o{ MetricSnapshot : records

    ClientWorkspace {
        string id PK
        string name
        string currency
        string timezone
        datetime createdAt
    }

    PlatformAccount {
        string id PK
        string workspaceId FK
        string platform "GOOGLE | META | TIKTOK"
        string externalAccountId
        string status
    }

    Campaign {
        string id PK
        string accountId FK
        string platform
        string platformCampaignId
        string name
        string objective
        float dailyBudget
        string status
    }

    AdSet {
        string id PK
        string campaignId FK
        string platformAdSetId
        string name
        json targetingRules
        float bidAmount
    }

    AdCreative {
        string id PK
        string adSetId FK
        string platformAdId
        string headline
        string bodyCopy
        string mediaUrl
        string callToAction
    }

    ConversionEvent {
        string id PK
        string workspaceId FK
        string eventId "Client Deduplication Key"
        string eventName "Purchase | Lead | AddToCart"
        float eventValue
        string currency
        string hashedEmail
        string hashedPhone
        datetime eventTimestamp
    }

    MetricSnapshot {
        string id PK
        string campaignId FK
        date recordedDate
        float spend
        int impressions
        int clicks
        int conversions
        float conversionValue
        float roas
        float cpa
    }
```

---

### 2. Normalized Metric Standard Definitions

Across Google Ads, Meta Ads, and TikTok Ads, metrics have varying names (e.g. `cost` in Google vs `spend` in Meta). DigiPort standardizes them to the following:

| Unified Metric | Google Ads Metric | Meta Marketing API Metric | TikTok Ads Metric | Formula / Standard |
|---|---|---|---|---|
| **Spend** | `metrics.cost_micros / 1e6` | `spend` | `stat_cost` | Total monetary spend in account currency |
| **Impressions** | `metrics.impressions` | `impressions` | `show_cnt` | Number of times ads were displayed |
| **Clicks** | `metrics.clicks` | `clicks` (link_clicks) | `click_cnt` | Count of clicks navigating to landing page |
| **CTR** | `metrics.ctr` | `inline_link_click_ctr` | `ctr` | `(Clicks / Impressions) * 100` (%) |
| **CPC** | `metrics.average_cpc / 1e6` | `cpc` | `cpc` | `Spend / Clicks` |
| **Conversions** | `metrics.conversions` | `actions.purchase` | `conversion` | Validated tracked business outcomes |
| **CPA** | `metrics.cost_per_conversion` | `cost_per_action_type` | `cost_per_conversion` | `Spend / Conversions` |
| **ROAS** | `metrics.conversions_value / cost` | `purchase_roas` | `roas` | `Conversion Value / Spend` |
| **Blended ROAS** | — | — | — | `Sum(All Platform Revenue) / Sum(All Platform Spend)` |

---

### 3. Multi-Touch Attribution Model

DigiPort supports cross-platform attribution normalization:
1. **Deduplicated Last-Touch Attribution:** Default operational model. Attributes conversion to the ad platform that recorded the final click within 7 days prior to `event_id` receipt.
2. **Linear Cross-Platform Blend:** Spreads conversion credit equally across touchpoints detected in Google GA4 and Meta CAPI.
3. **Event Deduplication Algorithm:**  
   Every client web event emits a UUID `event_id`. When received simultaneously by browser pixels and DigiPort server CAPI, the server tags the event with `event_id`, ensuring Meta and TikTok deduplicate the event and prevent double-counted conversions.
