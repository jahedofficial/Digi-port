import { Platform } from '../types/account';
import { ClientMemory, PromptMemoryOptions } from '../interfaces/memory.interface';

/**
 * Standard Long-term Memory Categories (Phase 8 Blueprint compliance)
 */
export type MemoryCategory =
  | 'BUSINESS_GOALS'
  | 'USER_PREFERENCES'
  | 'BUSINESS_STRATEGIES'
  | 'APPROVAL_RULES'
  | 'NAMING_CONVENTIONS'
  | 'WORKFLOW_PREFERENCES'
  | 'PLATFORM_PREFERENCES';

export const VALID_MEMORY_CATEGORIES: readonly MemoryCategory[] = [
  'BUSINESS_GOALS',
  'USER_PREFERENCES',
  'BUSINESS_STRATEGIES',
  'APPROVAL_RULES',
  'NAMING_CONVENTIONS',
  'WORKFLOW_PREFERENCES',
  'PLATFORM_PREFERENCES',
] as const;

/**
 * Business Goals long-term memory payload
 */
export interface BusinessGoals {
  targetRoasFloor: number;
  maxAllowableCpa: number;
  monthlyBudgetCeiling: number;
  targetProfitMargin?: number;
  targetAov?: number;
  currency?: string;
}

/**
 * User Preferences long-term memory payload
 */
export interface UserPreferences {
  language: 'bn' | 'en' | 'bng';
  notificationFrequency: 'realtime' | 'daily_digest' | 'weekly_summary';
  reportingSchedule: 'daily' | 'weekly' | 'monthly';
  contactChannel: 'telegram' | 'email' | 'in_app';
  timezone?: string;
}

/**
 * Target persona structure
 */
export interface TargetPersona {
  name: string;
  demographics?: string;
  painPoints?: string[];
  interests?: string[];
}

/**
 * Business Strategies long-term memory payload
 */
export interface BusinessStrategies {
  valuePropositions: string[];
  targetPersonas: TargetPersona[];
  seasonalityCalendar?: Record<string, string>;
  competitivePositioning?: string;
  brandDifferentiators?: string[];
}

/**
 * Approval Rules long-term memory payload
 */
export interface ApprovalRules {
  autoApproveBudgetThreshold: number;
  requireHumanForCreativeDelete: boolean;
  requireHumanForAudienceDelete: boolean;
  highRiskRoasProtectionThreshold: number;
  requireApprovalForNewCampaign: boolean;
}

/**
 * Naming Conventions long-term memory payload
 */
export interface NamingConventions {
  campaignTemplate: string;
  adGroupTemplate: string;
  creativeTemplate: string;
  utmCampaignTemplate?: string;
  utmSourceTemplate?: string;
  utmMediumTemplate?: string;
}

/**
 * Workflow Preferences long-term memory payload
 */
export interface WorkflowPreferences {
  autoPauseFatigueCreativeEnabled: boolean;
  autoRebalanceBudgetsEnabled: boolean;
  frequencyCapThreshold?: number;
  fatigueCtrDropThresholdPercent?: number;
}

/**
 * Brand voice and creative guidelines
 */
export interface BrandVoiceGuidelines {
  tone: string;
  prohibitedWords: string[];
  coreSellingPropositions: string[];
  approvedThemes: string[];
  creativeGuidelines?: string[];
}

/**
 * Platform Preferences long-term memory payload
 */
export interface PlatformPreferences {
  preferredPlatforms: Platform[];
  defaultBudgetSplit: Record<string, number>;
  brandVoice: BrandVoiceGuidelines;
  excludedGeographies?: string[];
  negativeKeywords?: string[];
  approvedKeywords?: string[];
}

/**
 * Audit log record for traceability of memory updates
 */
export interface MemoryAuditRecord {
  timestamp: Date;
  actor: string;
  action: 'CREATE' | 'UPDATE' | 'SUPERSEDE' | 'INVALIDATE';
  previousValue?: unknown;
  newValue: unknown;
  reason: string;
}

/**
 * Master Memory Entry structure
 */
export interface MemoryEntry<T = unknown> {
  id: string;
  clientId: string;
  category: MemoryCategory;
  key: string;
  value: T;
  confidence: number; // 0.0 - 1.0
  importance: number; // 1 - 10
  version: number;
  isApproved: boolean;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  source: string;
  auditTrail: MemoryAuditRecord[];
}

/**
 * Consolidated Client Memory Profile
 */
export interface ClientMemoryProfile {
  clientId: string;
  businessGoals?: BusinessGoals;
  userPreferences?: UserPreferences;
  businessStrategies?: BusinessStrategies;
  approvalRules?: ApprovalRules;
  namingConventions?: NamingConventions;
  workflowPreferences?: WorkflowPreferences;
  platformPreferences?: PlatformPreferences;
  rawEntries: MemoryEntry[];
  updatedAt: Date;
}

/**
 * Memory Ranking Criteria
 */
export interface MemoryRankingCriteria {
  importanceWeight?: number; // default 0.4
  confidenceWeight?: number; // default 0.3
  recencyWeight?: number; // default 0.2
  queryRelevanceWeight?: number; // default 0.1
}

/**
 * Ranked Memory Entry with score breakdown
 */
export interface RankedMemoryEntry {
  entry: MemoryEntry;
  score: number;
  scoreBreakdown: {
    importance: number;
    confidence: number;
    recency: number;
    relevance: number;
  };
}

/**
 * Memory Validation Result
 */
export interface MemoryValidationResult {
  isValid: boolean;
  errors: string[];
  detectedProhibitedContent?: string[];
}

/**
 * Memory Query Options
 */
export interface MemoryQueryOptions {
  category?: MemoryCategory;
  minImportance?: number;
  minConfidence?: number;
  limit?: number;
}

/**
 * IMemoryValidator interface
 */
export interface IMemoryValidator {
  validateEntry(entry: Partial<MemoryEntry>): MemoryValidationResult;
  assertValidEntry(entry: Partial<MemoryEntry>): void;
  validateProhibitedContent(target: unknown): { hasProhibited: boolean; reasons: string[] };
}

/**
 * IMemoryRanking interface
 */
export interface IMemoryRanking {
  rankEntries(
    entries: MemoryEntry[],
    query?: string,
    criteria?: MemoryRankingCriteria
  ): RankedMemoryEntry[];
}

/**
 * IMemoryRetrieval interface
 */
export interface IMemoryRetrieval {
  getEntry(clientId: string, key: string): Promise<MemoryEntry | null>;
  getEntriesByCategory(clientId: string, category: MemoryCategory): Promise<MemoryEntry[]>;
  getAllEntries(clientId: string): Promise<MemoryEntry[]>;
  getProfile(clientId: string): Promise<ClientMemoryProfile>;
  searchMemory(
    clientId: string,
    query: string,
    options?: MemoryQueryOptions,
    criteria?: MemoryRankingCriteria
  ): Promise<RankedMemoryEntry[]>;
}

/**
 * IMemoryUpdater interface
 */
export interface IMemoryUpdater {
  createEntry<T = unknown>(
    entry: Omit<MemoryEntry<T>, 'version' | 'createdAt' | 'updatedAt' | 'auditTrail'>,
    actor: string,
    reason: string
  ): Promise<MemoryEntry<T>>;

  updateEntry<T = unknown>(
    clientId: string,
    key: string,
    newValue: T,
    actor: string,
    reason: string,
    adjustments?: {
      confidence?: number;
      importance?: number;
      approvedBy?: string;
    }
  ): Promise<MemoryEntry<T>>;

  deleteEntry(clientId: string, key: string, actor: string, reason: string): Promise<boolean>;
}
