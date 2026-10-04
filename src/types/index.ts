export type Platform = 'ALL' | 'META' | 'GOOGLE' | 'TIKTOK';

export type EntityStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type ActionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED' | 'UNDONE';

export type ActionType = 
  | 'PAUSE_AD' 
  | 'ENABLE_AD' 
  | 'CHANGE_BUDGET' 
  | 'CHANGE_BID_TARGET' 
  | 'ADD_NEGATIVE_KEYWORD';

export type HealthStatus = 'GREEN' | 'YELLOW' | 'RED' | 'GRAY';

export interface MetricSummary {
  spend: number;
  revenue: number;
  conversions: number;
  cpa: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  prevSpend?: number;
  prevRoas?: number;
  prevCpa?: number;
  prevConversions?: number;
}

export interface PlatformConnectionInfo {
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  name: string;
  accountId: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'ERROR';
  lastSynced: string;
  campaignCount: number;
}

export interface CampaignData {
  id: string;
  name: string;
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  status: EntityStatus;
  objective: string;
  budgetType: 'CBO' | 'ABO' | 'DAILY' | 'TARGET_CPA';
  dailyBudget: number;
  spend: number;
  conversions: number;
  cpa: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  lostImpressionShare?: number; // Google specific
  qualityScore?: number;        // Google specific
}

export interface CreativeData {
  id: string;
  adId: string;
  adName: string;
  campaignName: string;
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  thumbnailUrl: string;
  mediaType: 'VIDEO' | 'IMAGE' | 'CAROUSEL';
  headline: string;
  bodyCopy: string;
  callToAction: string;
  spend: number;
  conversions: number;
  cpa: number;
  roas: number;
  impressions: number;
  // Video hook metrics
  hookRate: number;  // 3s plays / impressions
  holdRate: number;  // 15s or ThruPlay / 3s plays
  frequency: number;
  ctr: number;
  fatigueScore: 'HEALTHY' | 'WARNING' | 'HIGH_FATIGUE';
  isUnderperformer: boolean;
  isMvpWinner: boolean;
  lowDataWarning?: boolean; // if spend < 1.5x target CPA
  aiTags: {
    format: string; // UGC, Product showcase, Problem-Solution, Carousel
    hookType: string; // Question, Shock value, Visual hook, Social proof
    offer: string; // 20% Off, Free Delivery, Bundle
    cta: string; // Shop Now, Order Now, Learn More
    first3SecondsDescription: string;
  };
}

export interface ActionQueueItem {
  id: string;
  actionType: ActionType;
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  entityType: 'CAMPAIGN' | 'ADSET' | 'AD' | 'KEYWORD';
  entityId: string;
  entityName: string;
  proposedBy: 'AGENT' | 'RULE' | 'MANUAL';
  reason: string;
  previousValue: string | number;
  newValue: string | number;
  status: ActionStatus;
  createdAt: string;
  executedAt?: string;
  safetyCheck: {
    passed: boolean;
    rule: string;
  };
}

export interface TrackingCheckItem {
  id: string;
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  channel: 'BROWSER_PIXEL' | 'SERVER_CAPI' | 'GA4_ENHANCED' | 'SERVER_GTM' | 'TIKTOK_EVENTS_API';
  name: string;
  status: HealthStatus;
  eventMatchQuality: number; // e.g. 8.6 out of 10
  deduplicationActive: boolean;
  eventsTested: {
    event: string;
    firedCount: number;
    matchRate: string;
  }[];
  notes: string;
  suggestedFix: string;
}

export type AutomationMode = 'MONITOR' | 'RECOMMEND' | 'AUTONOMOUS';
export type RuleRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RuleCategory = 
  | 'BUDGET' 
  | 'PERFORMANCE' 
  | 'CREATIVE' 
  | 'FUNNEL' 
  | 'TRACKING' 
  | 'INVENTORY' 
  | 'AUDIENCE' 
  | 'GOOGLE' 
  | 'TIKTOK';

export type RuleScope = 'CAMPAIGN' | 'ADSET' | 'AD' | 'KEYWORD' | 'FUNNEL' | 'INVENTORY' | 'TRACKING';

export interface RuleHistoryItem {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: string;
  conditionMet: string;
  metricSnapshot: Record<string, string | number>;
  decision: string;
  actionTaken: string;
  previousValue?: string | number;
  newValue?: string | number;
  executedBy: 'AI Automation' | 'Manual Approval' | 'Rule Engine';
  status: 'VERIFIED' | 'PENDING_APPROVAL' | 'REJECTED' | 'FAILED';
  risk: RuleRiskLevel;
}

export interface OptimizationRuleItem {
  id: string;
  title: string;
  platform: Platform | 'ALL';
  category?: RuleCategory;
  scope?: RuleScope;
  description: string;
  condition: string;
  actionSuggested: string;
  mode?: AutomationMode;
  riskLevel?: RuleRiskLevel;
  cooldown?: string;
  minDataRequirement?: string;
  maxLimit?: string;
  triggerCount: number;
  isEnabled: boolean;
  lastTriggered?: string;
  history?: RuleHistoryItem[];
}

export interface BreakdownItem {
  dimension: string;
  spend: number;
  conversions: number;
  cpa: number;
  roas: number;
  share: number;
}

export interface DiscoveredAdAccount {
  id: string; // e.g. act_123456789 or 982-114-8821
  name: string;
  currency: string;
  timezone?: string;
  businessId?: string;
  businessName?: string;
  status: 'ACTIVE' | 'DISABLED' | 'PENDING';
  isSelected: boolean;
  spendLast30Days?: number;
}

export interface DiscoveredBusiness {
  id: string; // Business Manager ID or Google MCC ID
  name: string;
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  adAccounts: DiscoveredAdAccount[];
}

export interface PlatformConnectionDetails {
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'PENDING_APPROVAL';
  connectedAt?: string;
  tokenExpiresAt?: string;
  daysUntilExpiry?: number;
  scopes: string[];
  businesses: DiscoveredBusiness[];
  activeAccountsCount: number;
}

export interface ClientWorkspace {
  id: string;
  name: string;
  clientName: string;
  category: string;
  currency: 'BDT' | 'USD';
  colorTag: string;
  connectedAccounts: {
    meta?: { id: string; name: string; status: 'CONNECTED' | 'DISCONNECTED' };
    google?: { id: string; name: string; status: 'CONNECTED' | 'DISCONNECTED' };
    tiktok?: { id: string; name: string; status: 'CONNECTED' | 'DISCONNECTED' };
    ga4PropertyId?: string;
  };
  metrics: Record<string, MetricSummary>;
  campaigns: CampaignData[];
  creatives: CreativeData[];
  isPinned?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN';
  avatar?: string;
  initials: string;
  workspaceAccess?: string[];
  lastLoginAt?: string;
}



