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

export const INITIAL_TRACKING_CHECKS: TrackingCheckItem[] = [
  {
    id: 'trk-1',
    platform: 'META',
    channel: 'SERVER_CAPI',
    name: 'Meta Conversions API (Server-Side Gateway)',
    status: 'GRAY',
    eventMatchQuality: 0,
    deduplicationActive: false,
    eventsTested: [],
    notes: 'অ্যাকাউন্ট কানেক্ট করে পিক্সেল আইডি দিলে অটোমেটিক CAPI এবং ব্রাউজার ইভেন্ট হেলথ চেক হবে।',
    suggestedFix: 'Meta Ads একাউন্ট কানেক্ট করুন।',
  },
  {
    id: 'trk-2',
    platform: 'GOOGLE',
    channel: 'GA4_ENHANCED',
    name: 'Google Ads Enhanced Conversions & GA4',
    status: 'GRAY',
    eventMatchQuality: 0,
    deduplicationActive: false,
    eventsTested: [],
    notes: 'GA4 Property ID ও Google Ads কানেক্ট করার অপেক্ষায়।',
    suggestedFix: 'Google Ads বা GA4 কানেক্ট করুন।',
  },
  {
    id: 'trk-3',
    platform: 'TIKTOK',
    channel: 'TIKTOK_EVENTS_API',
    name: 'TikTok Events API & Pixel',
    status: 'GRAY',
    eventMatchQuality: 0,
    deduplicationActive: false,
    eventsTested: [],
    notes: 'TikTok Business Center এবং Events API টোকেন কনফিগার করার অপেক্ষায়।',
    suggestedFix: 'TikTok Marketing API ক্রেডেনশিয়াল কানেক্ট করুন।',
  },
];

export const INITIAL_OPTIMIZATION_RULES: OptimizationRuleItem[] = [];

export const BREAKDOWN_DATA: Record<string, BreakdownItem[]> = {
  placement: [],
  region: [],
  device: [],
};
