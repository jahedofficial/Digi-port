# Architecture Document 03: Execution Flow
## Complete Sequence Diagrams & OAuth Token Refresh Lifecycle

**Version:** 2.0.0  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Standard:** 7 Production Sequence Diagrams covering Direct APIs & Agent Governance

---

### Sequence 1: Campaign Creation with Human Approval Gate

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Marketer
    participant UI as DigiPort Web UI
    participant CEO as CEO Agent
    participant PB as Playbook Registry
    participant Specialist as Campaign Specialist Agent
    participant Risk as Risk Engine
    participant Queue as Human Approval Queue
    participant Adapter as Platform Adapter Layer
    participant Platform as Direct Platform API (Meta/Google/TikTok)

    User->>UI: "Launch Advantage+ Shopping campaign for $50/day"
    UI->>CEO: Submit Campaign Intent (ClientContext)
    CEO->>PB: Resolve Playbook & Template ('ecommerce', 'advantage-plus-sales')
    PB-->>CEO: Playbook Blueprint & Validation Rules
    CEO->>Specialist: Delegate Campaign Build Task
    Specialist->>Risk: Assess Proposed Spend ($50/day vs $20 Daily Cap)
    Risk-->>Specialist: EvaluationResult { requiresApproval: true, reason: "Daily spend exceeds automated threshold" }
    Specialist->>Queue: Enqueue ActionItem (Type: CAMPAIGN_LAUNCH, Status: PENDING)
    Queue-->>UI: Push Real-Time Approval Card
    User->>UI: Click [Approve Campaign]
    UI->>Queue: Resolve ActionItem (Status: APPROVED)
    Queue->>Specialist: Trigger Execution
    Specialist->>Adapter: Dispatch Normalized Campaign Entity
    Adapter->>Platform: Direct HTTPS POST /v20.0/act_{id}/campaigns
    Platform-->>Adapter: { id: "camp_89218731", status: "ACTIVE" }
    Adapter-->>Specialist: ExecutionSuccess
    Specialist-->>CEO: TaskComplete
    CEO-->>UI: Campaign Active Notification & Telegram Alert
```

---

### Sequence 2: OAuth Token Refresh Flow (Google Ads Direct)

```mermaid
sequenceDiagram
    autonumber
    participant Adapter as GooglePlatformAdapter
    participant CredMgr as ICredentialManager
    participant TokenCache as In-Memory Token Cache
    participant GoogleAuth as Google Identity Server (oauth2.googleapis.com)
    participant GoogleAds as Google Ads API (v17)

    Adapter->>CredMgr: getAccessToken('GOOGLE', clientId)
    CredMgr->>TokenCache: Check Cached Token (expiry > 5m)
    alt Token Cached & Valid
        TokenCache-->>CredMgr: Valid Access Token
    else Token Expired or Missing
        CredMgr->>CredMgr: Retrieve GOOGLE_ADS_REFRESH_TOKEN, CLIENT_ID, CLIENT_SECRET
        CredMgr->>GoogleAuth: POST /token (grant_type=refresh_token, refresh_token=...)
        GoogleAuth-->>CredMgr: { access_token: "ya29.a0...", expires_in: 3600 }
        CredMgr->>TokenCache: Store Token with TTL (3300 seconds)
    end
    CredMgr-->>Adapter: Ready Access Token
    Adapter->>GoogleAds: POST /customers/{customerId}/googleAds:searchStream (Headers: Bearer + Developer-Token)
    GoogleAds-->>Adapter: 200 OK (Stream Result)
```

---

### Sequence 3: Conversion Tracking & CAPI Deduplication Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Shopper Browser
    participant Web as Store Website
    participant GTM as Google Tag Manager Web Container
    participant TrackAPI as DigiPort Tracking Ingestion Route (/api/track)
    participant CAPI as Meta Conversions API (Graph API)
    participant GA4 as Google Analytics 4 Measurement Protocol
    participant TTAPI as TikTok Events API

    Customer->>Web: Complete Purchase ($85.00)
    Web->>Web: Generate unique event_id: "evt_172950912"
    par Browser-Side Dispatch
        Web->>GTM: dataLayer.push({ event: 'purchase', event_id: 'evt_172950912', value: 85.00 })
        GTM->>Customer: Pixel fires with event_id
    and Server-Side Dispatch
        Web->>TrackAPI: POST /api/track { event_id: 'evt_172950912', value: 85.00, pii_hashed }
        TrackAPI->>TrackAPI: Validate SHA-256 PII Hashes & Event Deduplication Key
        par Direct Server CAPI
            TrackAPI->>CAPI: POST /v20.0/{PIXEL_ID}/events (event_id="evt_172950912")
            CAPI-->>TrackAPI: { events_received: 1, fbtrace_id: "..." }
        and Direct Server GA4
            TrackAPI->>GA4: POST /mp/collect?measurement_id={GA4_ID}
            GA4-->>TrackAPI: 204 No Content
        and Direct Server TikTok
            TrackAPI->>TTAPI: POST /open_api/v1.3/event/track/
            TTAPI-->>TrackAPI: { code: 0, message: "OK" }
        end
    end
```

---

### Sequence 4: Scheduled Autonomous Performance Audit (Heartbeat)

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Schedule Engine (BullMQ / Heartbeat)
    participant CEO as CEO Agent
    participant Audit as Audit Specialist Agent
    participant Adapter as Platform Adapter Layer
    participant Rep as Reporting Engine
    participant TG as Telegram Bot Channel

    Cron->>CEO: Trigger Event: "HEARTBEAT_DAILY_AUDIT"
    CEO->>Audit: Execute Cross-Platform Performance Inspection
    par Query Google Ads
        Audit->>Adapter: fetchPerformance(Google, last7Days)
    and Query Meta Ads
        Audit->>Adapter: fetchPerformance(Meta, last7Days)
    and Query TikTok Ads
        Audit->>Adapter: fetchPerformance(TikTok, last7Days)
    end
    Adapter-->>Audit: Normalized Performance Metrics
    Audit->>Audit: Compute Blended ROAS, CPA Drift, Wasted Spend
    Audit-->>CEO: AuditFindings (Score: 88/100, 2 Anomalies)
    CEO->>Rep: Generate Structured Telegram Summary
    Rep-->>TG: Send Beautiful HTML Dashboard Alert to User
```

---

### Sequence 5: Emergency ROAS Drop & Budget Protection Flow

```mermaid
sequenceDiagram
    autonumber
    participant Monitor as Real-time Metric Watchdog
    participant Risk as Risk Engine
    participant CEO as CEO Agent
    participant Opt as Optimization Specialist Agent
    participant Adapter as Platform Adapter Layer
    participant User as Marketer (Telegram / UI)

    Monitor->>Risk: Alert: "AdSet_992 CPA spiked to $64 (Target: $18)"
    Risk->>Risk: Evaluate Budget Protection Policy: CRITICAL_SPIKE
    Risk->>CEO: Request Emergency Intervention (AdSet_992)
    CEO->>Opt: Formulate Containment Action
    Opt->>Opt: Prepare Action: "Pause Underperforming AdSet"
    alt Auto-Guard Enabled
        Opt->>Adapter: Dispatch PAUSE to Meta Graph API
        Adapter-->>Opt: AdSet Status Changed to PAUSED
        Opt->>User: Telegram Critical Alert: "🚨 AdSet_992 auto-paused to protect budget"
    else Manual Approval Enforced
        Opt->>User: ActionCard Dispatched: "[Pause AdSet] or [Keep Running]"
    end
```

---

### Sequence 6: OpenClaw Reasoning & Cascading Fallback Flow

```mermaid
sequenceDiagram
    autonumber
    participant Agent as CEO / Specialist Agent
    participant Gateway as DigiPort AI Gateway (/api/ai/chat)
    participant Claw as OpenClaw Gateway (openclaw.neexion.com)
    participant Router as OpenRouter Cloud Fallback Chain

    Agent->>Gateway: POST /api/ai/chat { message, model: 'openclaw' }
    Gateway->>Claw: POST /v1/chat/completions (Bearer 4ece2d...)
    alt OpenClaw Responds Successfully
        Claw-->>Gateway: HTTP 200 { model: 'openclaw', reply: "..." }
        Gateway-->>Agent: AI Response (Gateway: OpenClaw Live)
    else OpenClaw Gateway Down or 502
        Gateway->>Router: POST /v1/chat/completions (DeepSeek v4 Flash)
        alt DeepSeek Fails
            Gateway->>Router: Try Fallback 1 (GPT-4o Mini)
            Gateway->>Router: Try Fallback 2 (Claude 3.5 Sonnet)
        end
        Router-->>Gateway: HTTP 200 { reply: "..." }
        Gateway-->>Agent: AI Response (Fallback Chain Active)
    end
```

---

### Sequence 7: Cross-Platform Budget Reallocation Flow

```mermaid
sequenceDiagram
    autonumber
    participant User as Marketer
    participant CEO as CEO Agent
    participant Decision as Decision Engine
    participant MetaAdapt as MetaPlatformAdapter
    participant GoogleAdapt as GooglePlatformAdapter
    participant Queue as ActionQueue

    User->>CEO: "Scale my top performing platform by $30 today"
    CEO->>Decision: Evaluate Cross-Platform Efficiency (Blended ROAS)
    Decision->>Decision: Meta ROAS = 5.2x, Google ROAS = 2.1x
    Decision-->>CEO: Recommendation: Allocate +$30 to Meta Advantage+
    CEO->>Queue: Submit Budget Increase Proposal (+20% within daily cap)
    Queue-->>User: Present One-Click Budget Scaling Card
    User->>Queue: Click [Approve]
    Queue->>MetaAdapt: updateDailyBudget(campaignId, newBudget)
    MetaAdapt-->>CEO: Budget Updated on Meta Graph API
    CEO-->>User: Confirmation: "Meta Budget increased by $30/day"
```
