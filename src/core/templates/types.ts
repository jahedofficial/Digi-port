export interface BudgetSplit {
  minPercent: number;
  maxPercent: number;
  defaultPercent: number;
}

export interface PlatformCreativeSpec {
  formats: string[];
  aspectRatios: string[];
  maxDurationSeconds?: number;
}

export interface PlatformMix {
  recommendedRoles: {
    google: string;
    meta: string;
    tiktok: string;
  };
  budgetSplitRanges: {
    google: BudgetSplit;
    meta: BudgetSplit;
    tiktok: BudgetSplit;
  };
  perPlatformCampaignTypes: {
    google: string[];
    meta: string[];
    tiktok: string[];
  };
  perPlatformObjectives: {
    google: string;
    meta: string;
    tiktok: string;
  };
  perPlatformOptimizationEvents: {
    google: string;
    meta: string;
    tiktok: string;
  };
  perPlatformCreativeRequirements: {
    google: PlatformCreativeSpec;
    meta: PlatformCreativeSpec;
    tiktok: PlatformCreativeSpec;
  };
  policyConstraints: {
    specialAdCategory?: string;
    google?: string[];
    meta?: string[];
    tiktok?: string[];
  };
}

export interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  version: string;
  businessGoals: string[];
  campaignStructure: {
    funnelStages: string[];
    namingConvention: string;
  };
  recommendedCampaignTypes: {
    google: string[];
    meta: string[];
    tiktok: string[];
  };
  budgetStrategy: {
    google: string;
    meta: string;
    tiktok: string;
  };
  biddingStrategy: {
    google: string;
    meta: string;
    tiktok: string;
  };
  conversionGoals: string[];
  trackingRequirements: string[];
  assetRequirements: {
    formats: string[];
    aspectRatios: string[];
    maxVideoDurationSeconds?: number;
    headlineCharacterLimit?: number;
  };
  namingConventions: {
    campaignPattern: string;
    adGroupPattern: string;
    adPattern: string;
  };
  kpiTargets: Record<string, number | string>;
  reportingMetrics: string[];
  bestPractices: string[];
  platformMix: PlatformMix;
}

export interface IIndustryTemplateRegistry {
  register(template: IndustryTemplate): void;
  get(idOrIndustry: string): IndustryTemplate | undefined;
  getAll(): IndustryTemplate[];
  has(idOrIndustry: string): boolean;
  validateTemplate(template: unknown): { valid: boolean; errors: string[] };
}
