import { Platform } from './account';

export interface UnifiedReportMetric {
  entityId: string;
  entityType: 'ACCOUNT' | 'CAMPAIGN' | 'ADGROUP' | 'AD';
  platform: Platform;
  date: string; // YYYY-MM-DD
  currency: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  // Computed metrics
  ctr: number; // Percentage (0-100)
  cpc: number;
  cpa: number;
  roas: number;
  videoViews?: number;
  videoHookRate?: number; // 3-second views / impressions
  videoHoldRate?: number; // completion / 3-second views
  rawPlatformData?: Record<string, unknown>;
}
