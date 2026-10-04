import { 
  CampaignData, 
  CreativeData, 
  PlatformConnectionInfo, 
  ActionQueueItem, 
  TrackingCheckItem, 
  OptimizationRuleItem,
  MetricSummary,
  BreakdownItem
} from '@/types';

export const INITIAL_CONNECTIONS: PlatformConnectionInfo[] = [
  {
    platform: 'META',
    name: 'Meta Ads Manager',
    accountId: '',
    status: 'DISCONNECTED',
    lastSynced: 'Not connected',
    campaignCount: 0,
  },
  {
    platform: 'GOOGLE',
    name: 'Google Ads',
    accountId: '',
    status: 'DISCONNECTED',
    lastSynced: 'Not connected',
    campaignCount: 0,
  },
  {
    platform: 'TIKTOK',
    name: 'TikTok Ads For Business',
    accountId: '',
    status: 'DISCONNECTED',
    lastSynced: 'Not connected',
    campaignCount: 0,
  },
];

const emptyMetricSummary: MetricSummary = {
  spend: 0,
  revenue: 0,
  conversions: 0,
  cpa: 0,
  roas: 0,
  impressions: 0,
  clicks: 0,
  ctr: 0,
  cpc: 0,
  prevSpend: 0,
  prevRoas: 0,
  prevCpa: 0,
  prevConversions: 0,
};

export const INITIAL_METRICS_OVERVIEW: Record<string, MetricSummary> = {
  ALL: { ...emptyMetricSummary },
  META: { ...emptyMetricSummary },
  GOOGLE: { ...emptyMetricSummary },
  TIKTOK: { ...emptyMetricSummary },
};

export const INITIAL_CAMPAIGNS: CampaignData[] = [];

export const INITIAL_CREATIVES: CreativeData[] = [];

export const INITIAL_ACTION_QUEUE: ActionQueueItem[] = [];

export const INITIAL_TRACKING_CHECKS: TrackingCheckItem[] = [];

export const INITIAL_OPTIMIZATION_RULES: OptimizationRuleItem[] = [];

export const BREAKDOWN_DATA: Record<string, BreakdownItem[]> = {
  placement: [],
  region: [],
  device: [],
};
