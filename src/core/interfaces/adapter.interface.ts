import { Platform } from '../types/account';
import { UnifiedAccount } from '../types/account';
import { UnifiedCampaign, UnifiedCampaignCreateInput } from '../types/campaign';
import { UnifiedAdGroup, UnifiedAdGroupCreateInput } from '../types/adgroup';
import { UnifiedAd } from '../types/ad';
import { UnifiedReportMetric } from '../types/metric';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface PlatformConnectionStatus {
  platform: Platform;
  connected: boolean;
  accountId: string;
  accountName?: string;
  statusCode: number;
  message: string;
  checkedAt: Date;
}

export interface IPlatformAdapter {
  readonly platform: Platform;
  
  // Connection and Health Verification
  verifyConnection(): Promise<PlatformConnectionStatus>;
  getAccountDetails(): Promise<UnifiedAccount>;
  
  // Campaign Operations
  listCampaigns(): Promise<UnifiedCampaign[]>;
  getCampaign(campaignId: string): Promise<UnifiedCampaign | null>;
  createCampaign(input: UnifiedCampaignCreateInput): Promise<UnifiedCampaign>;
  updateCampaignBudget(campaignId: string, dailyBudget: number): Promise<boolean>;
  setCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED'): Promise<boolean>;
  
  // AdGroup / AdSet Operations
  listAdGroups(campaignId: string): Promise<UnifiedAdGroup[]>;
  createAdGroup(input: UnifiedAdGroupCreateInput): Promise<UnifiedAdGroup>;
  setAdGroupStatus(adGroupId: string, status: 'ACTIVE' | 'PAUSED'): Promise<boolean>;
  
  // Ad Operations
  listAds(adGroupId: string): Promise<UnifiedAd[]>;
  setAdStatus(adId: string, status: 'ACTIVE' | 'PAUSED'): Promise<boolean>;
  
  // Performance and Reporting Metrics
  fetchMetrics(dateRange: DateRange, entityType: 'ACCOUNT' | 'CAMPAIGN' | 'ADGROUP' | 'AD', entityId?: string): Promise<UnifiedReportMetric[]>;
}

export interface IGoogleAdsAdapter extends IPlatformAdapter {
  readonly platform: 'GOOGLE';
  executeGaqlQuery<T = unknown>(query: string): Promise<T[]>;
}

export interface IMetaMarketingAdapter extends IPlatformAdapter {
  readonly platform: 'META';
  getRateLimitStatus(): { callCountPercent: number; cpuTimePercent: number; totalTimePercent: number };
}

export interface ITikTokAdsAdapter extends IPlatformAdapter {
  readonly platform: 'TIKTOK';
  getAdvertiserInfo(): Promise<Record<string, unknown>>;
}
