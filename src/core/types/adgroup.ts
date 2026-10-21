import { Platform } from './account';

export type AdGroupStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type BidOptimizationGoal = 
  | 'MAXIMIZE_CONVERSIONS' 
  | 'TARGET_CPA' 
  | 'TARGET_ROAS' 
  | 'MAXIMIZE_CLICKS' 
  | 'LOWEST_COST';

export interface UnifiedAdGroup {
  id: string;
  campaignId: string;
  platform: Platform;
  platformAdGroupId: string; // AdGroup ID (Google) or AdSet ID (Meta/TikTok)
  name: string;
  status: AdGroupStatus;
  bidStrategy: BidOptimizationGoal;
  bidAmount?: number;
  dailyBudget?: number;
  targetAudienceId?: string;
  targetingRules?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnifiedAdGroupCreateInput {
  campaignId: string;
  name: string;
  status: AdGroupStatus;
  bidStrategy: BidOptimizationGoal;
  bidAmount?: number;
  dailyBudget?: number;
  targetAudienceId?: string;
  targetingRules?: Record<string, unknown>;
}
