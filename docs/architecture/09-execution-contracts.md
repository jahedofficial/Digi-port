# Architecture Document 09: Execution Contracts
## CEO-Specialist-Adapter Execution Contracts & Direct Platform API Specs

**Version:** 2.0.0  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Standard:** Uniform JSON Contracts & Strict Protocol Enforcements

---

### 1. CEO-to-Specialist Execution Contract

When the CEO Agent dispatches a task to a Specialist Agent, the input payload and return result follow this exact schema:

```typescript
export interface SpecialistTaskPayload {
  taskId: string;
  clientId: string;
  operation: 'AUDIT' | 'LAUNCH' | 'OPTIMIZE' | 'PAUSE' | 'VERIFY_TRACKING';
  platform: 'GOOGLE' | 'META' | 'TIKTOK' | 'CROSS_PLATFORM';
  parameters: Record<string, any>;
  constraints: {
    maxDailySpend?: number;
    targetRoas?: number;
    targetCpa?: number;
    requireApproval: boolean;
  };
  context: {
    brandVoice: string;
    currency: string;
  };
}

export interface SpecialistExecutionResult {
  taskId: string;
  success: boolean;
  executionStatus: 'COMPLETED' | 'PENDING_APPROVAL' | 'FAILED';
  summaryBangla: string;
  summaryEnglish: string;
  affectedEntities: Array<{
    platform: string;
    entityType: 'CAMPAIGN' | 'AD_SET' | 'AD' | 'PIXEL';
    entityId: string;
    actionTaken: string;
  }>;
  metricsObserved?: Record<string, number | string>;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}
```

---

### 2. Specialist-to-Adapter Execution Contract

Platform adapters enforce normalized inputs and outputs:

```typescript
export interface UnifiedCampaignInput {
  name: string;
  objective: 'CONVERSIONS' | 'LEADS' | 'TRAFFIC' | 'CATALOG_SALES';
  dailyBudget: number; // In client workspace currency
  status: 'ACTIVE' | 'PAUSED';
  targeting: {
    countries: string[];
    ageMin?: number;
    ageMax?: number;
    interests?: string[];
    customAudiences?: string[];
  };
  trackingConfig?: {
    pixelId?: string;
    conversionLabel?: string;
  };
}

export interface UnifiedCampaign {
  id: string;
  platform: 'GOOGLE' | 'META' | 'TIKTOK';
  platformCampaignId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  dailyBudget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
  roas: number;
  updatedAt: Date;
}
```

---

### 3. Per-Platform Direct API Specifications

#### A. Google Ads Direct API Specification
* **Base Endpoint:** `https://googleads.googleapis.com/v17/customers/{customerId}/`
* **Protocol:** HTTPS REST / gRPC with JSON body
* **Required Headers:**
  ```http
  Authorization: Bearer ya29.a0...
  developer-token: {GOOGLE_ADS_DEVELOPER_TOKEN}
  login-customer-id: {GOOGLE_ADS_LOGIN_CUSTOMER_ID}
  Content-Type: application/json
  ```
* **GAQL Search Endpoint:** `googleAds:searchStream`
* **Query Format:**
  ```sql
  SELECT campaign.id, campaign.name, campaign.status, metrics.cost_micros, metrics.conversions, metrics.conversions_value 
  FROM campaign 
  WHERE segments.date DURING LAST_7_DAYS
  ```

#### B. Meta Graph API (v20.0) Direct API Specification
* **Base Endpoint:** `https://graph.facebook.com/v20.0/`
* **Protocol:** HTTPS REST
* **Required Headers / Parameters:**
  ```http
  Authorization: Bearer {META_ACCESS_TOKEN}
  Content-Type: application/json
  ```
* **Insights Query:** `GET /v20.0/act_{account_id}/insights?fields=campaign_id,campaign_name,spend,impressions,clicks,purchase_roas,actions&date_preset=last_7d`
* **Mutation:** `POST /v20.0/act_{account_id}/campaigns`
  ```json
  {
    "name": "DigiPort Advantage+ Sales",
    "objective": "OUTCOME_SALES",
    "status": "PAUSED",
    "special_ad_categories": []
  }
  ```

#### C. TikTok Business API (v1.3) Direct API Specification
* **Base Endpoint:** `https://business-api.tiktok.com/open_api/v1.3/`
* **Protocol:** HTTPS REST
* **Required Headers:**
  ```http
  Access-Token: {TIKTOK_ACCESS_TOKEN}
  Content-Type: application/json
  ```
* **Campaign Query:** `GET /open_api/v1.3/campaign/get/?advertiser_id={advertiser_id}&page_size=50`
* **Events Ingestion:** `POST /open_api/v1.3/event/track/`
