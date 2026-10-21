import { Platform } from './account';

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';

export type CampaignObjective = 
  | 'CONVERSIONS' 
  | 'SALES' 
  | 'LEAD_GENERATION' 
  | 'WEBSITE_TRAFFIC' 
  | 'APP_PROMOTION' 
  | 'BRAND_AWARENESS' 
  | 'CATALOG_SALES';

export type BudgetStrategy = 'DAILY' | 'LIFETIME' | 'CAMPAIGN_BUDGET_OPTIMIZATION' | 'ADSET_BUDGET';

export interface UnifiedCampaign {
  id: string;
  accountId: string;
  platform: Platform;
  platformCampaignId: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  budgetStrategy: BudgetStrategy;
  dailyBudget: number;
  lifetimeBudget?: number;
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnifiedCampaignCreateInput {
  name: string;
  platform: Platform;
  objective: CampaignObjective;
  status: CampaignStatus;
  budgetStrategy: BudgetStrategy;
  dailyBudget: number;
  lifetimeBudget?: number;
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, unknown>;
}
