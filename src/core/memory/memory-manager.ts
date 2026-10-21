import * as fs from 'fs';
import * as path from 'path';
import { ValidationException } from '../errors/domain.errors';
import { ClientMemory, IMemoryManager, PromptMemoryOptions } from '../interfaces/memory.interface';
import { Platform } from '../types/account';
import {
  ApprovalRules,
  BrandVoiceGuidelines,
  BusinessGoals,
  ClientMemoryProfile,
  IMemoryRanking,
  IMemoryRetrieval,
  IMemoryUpdater,
  IMemoryValidator,
  MemoryCategory,
  MemoryEntry,
  MemoryQueryOptions,
  MemoryRankingCriteria,
  PlatformPreferences,
  RankedMemoryEntry,
} from './types';
import { MemoryRanking } from './memory-ranking';
import { MemoryRetrieval } from './memory-retrieval';
import { MemoryUpdater } from './memory-updater';
import { MemoryValidator } from './memory-validator';

/**
 * Enterprise Production Memory Manager
 * Coordinates client-isolated memory retrieval, deterministic ranking,
 * validated updates with audit trails, and PII-free LLM prompt context grounding.
 */
export class MemoryManager implements IMemoryManager {
  private readonly storage: Map<string, Map<string, MemoryEntry>>;
  private readonly validator: IMemoryValidator;
  private readonly ranking: IMemoryRanking;
  private readonly retrieval: IMemoryRetrieval;
  private readonly updater: IMemoryUpdater;
  private readonly baseStorageDir: string;

  constructor(options?: {
    storageDir?: string;
    validator?: IMemoryValidator;
    ranking?: IMemoryRanking;
  }) {
    this.storage = new Map<string, Map<string, MemoryEntry>>();
    this.validator = options?.validator ?? new MemoryValidator();
    this.ranking = options?.ranking ?? new MemoryRanking();
    this.retrieval = new MemoryRetrieval(this.storage, this.ranking);
    this.updater = new MemoryUpdater(this.storage, this.validator);
    this.baseStorageDir = options?.storageDir ?? path.join(process.cwd(), 'data', 'memory');
  }

  // ==========================================
  // Contract 8 Implementation
  // ==========================================

  /**
   * Retrieves high-level ClientMemory adhering to Contract 8.
   */
  public async getClientMemory(clientId: string): Promise<ClientMemory> {
    const profile = await this.retrieval.getProfile(clientId);

    const brandVoice = profile.platformPreferences?.brandVoice?.tone ?? 'Professional and data-driven';
    const preferredPlatforms: Platform[] = profile.platformPreferences?.preferredPlatforms ?? ['GOOGLE', 'META'];
    const targetCpaThreshold = profile.businessGoals?.maxAllowableCpa ?? 50;
    const targetRoasFloor = profile.businessGoals?.targetRoasFloor ?? 2.5;
    const approvedKeywords = profile.platformPreferences?.approvedKeywords ?? [];
    const negativeKeywords = profile.platformPreferences?.negativeKeywords ?? [];

    return {
      clientId,
      brandVoice,
      preferredPlatforms,
      targetCpaThreshold,
      targetRoasFloor,
      approvedKeywords,
      negativeKeywords,
    };
  }

  /**
   * Updates ClientMemory adhering to Contract 8 with full validation and audit logging.
   */
  public async updateClientMemory(
    clientId: string,
    updates: Partial<ClientMemory>,
    actor: string = 'system_admin',
    reason: string = 'Client memory update via API'
  ): Promise<ClientMemory> {
    // 1. Update or create Business Goals if CPA or ROAS is specified
    if (updates.targetCpaThreshold !== undefined || updates.targetRoasFloor !== undefined) {
      const existingGoals = await this.retrieval.getEntry(clientId, 'business_goals');
      const currentVal = (existingGoals?.value as BusinessGoals) ?? {
        targetRoasFloor: 2.5,
        maxAllowableCpa: 50,
        monthlyBudgetCeiling: 10000,
      };

      const newVal: BusinessGoals = {
        ...currentVal,
        targetRoasFloor: updates.targetRoasFloor ?? currentVal.targetRoasFloor,
        maxAllowableCpa: updates.targetCpaThreshold ?? currentVal.maxAllowableCpa,
      };

      if (existingGoals) {
        await this.updater.updateEntry(clientId, 'business_goals', newVal, actor, reason);
      } else {
        await this.updater.createEntry(
          {
            id: `mem_${clientId}_business_goals`,
            clientId,
            category: 'BUSINESS_GOALS',
            key: 'business_goals',
            value: newVal,
            confidence: 1.0,
            importance: 9,
            isApproved: true,
            approvedBy: actor,
            source: 'api_update',
          },
          actor,
          reason
        );
      }
    }

    // 2. Update or create Platform Preferences if brand voice, platforms, or keywords changed
    if (
      updates.brandVoice !== undefined ||
      updates.preferredPlatforms !== undefined ||
      updates.approvedKeywords !== undefined ||
      updates.negativeKeywords !== undefined
    ) {
      const existingPref = await this.retrieval.getEntry(clientId, 'platform_preferences');
      const currentVal = (existingPref?.value as PlatformPreferences) ?? {
        preferredPlatforms: ['GOOGLE', 'META'] as Platform[],
        defaultBudgetSplit: { GOOGLE: 60, META: 40 },
        brandVoice: {
          tone: 'Professional and data-driven',
          prohibitedWords: [],
          coreSellingPropositions: [],
          approvedThemes: [],
        },
      };

      const newBrandVoice: BrandVoiceGuidelines = {
        ...currentVal.brandVoice,
        tone: updates.brandVoice ?? currentVal.brandVoice.tone,
      };

      const newVal: PlatformPreferences = {
        ...currentVal,
        preferredPlatforms: updates.preferredPlatforms ?? currentVal.preferredPlatforms,
        brandVoice: newBrandVoice,
        approvedKeywords: updates.approvedKeywords ?? currentVal.approvedKeywords,
        negativeKeywords: updates.negativeKeywords ?? currentVal.negativeKeywords,
      };

      if (existingPref) {
        await this.updater.updateEntry(clientId, 'platform_preferences', newVal, actor, reason);
      } else {
        await this.updater.createEntry(
          {
            id: `mem_${clientId}_platform_preferences`,
            clientId,
            category: 'PLATFORM_PREFERENCES',
            key: 'platform_preferences',
            value: newVal,
            confidence: 1.0,
            importance: 8,
            isApproved: true,
            approvedBy: actor,
            source: 'api_update',
          },
          actor,
          reason
        );
      }
    }

    return this.getClientMemory(clientId);
  }

  /**
   * Extracts clean, structured markdown context for LLM prompt grounding.
   * Guarantees zero PII, zero tokens/credentials, and zero live performance metrics.
   */
  public async extractContextForPrompt(
    clientId: string,
    options?: PromptMemoryOptions
  ): Promise<string> {
    const profile = await this.retrieval.getProfile(clientId);
    const sections: string[] = [];

    sections.push(`### CLIENT BUSINESS MEMORY (Client ID: ${clientId})`);
    sections.push(`> [!NOTE]`);
    sections.push(`> Authoritative long-term business rules and brand strategy. Live metrics are queried via Platform Adapters.`);

    // 1. Business Goals
    if (profile.businessGoals) {
      const bg = profile.businessGoals;
      sections.push('\n#### 1. Business Goals & Economic Targets');
      sections.push(`- Target ROAS Floor: ${bg.targetRoasFloor}x`);
      sections.push(`- Maximum Allowable CPA: $${bg.maxAllowableCpa}`);
      sections.push(`- Monthly Budget Ceiling: $${bg.monthlyBudgetCeiling}`);
      if (bg.targetProfitMargin) {
        sections.push(`- Target Profit Margin: ${bg.targetProfitMargin}%`);
      }
      if (bg.targetAov) {
        sections.push(`- Target Average Order Value (AOV): $${bg.targetAov}`);
      }
    }

    // 2. Brand Voice & Creative Rules
    if (profile.platformPreferences?.brandVoice) {
      const bv = profile.platformPreferences.brandVoice;
      sections.push('\n#### 2. Brand Voice & Creative Guidelines');
      sections.push(`- Brand Tone: ${bv.tone}`);
      if (bv.coreSellingPropositions.length > 0) {
        sections.push(`- Value Propositions: ${bv.coreSellingPropositions.join('; ')}`);
      }
      if (bv.prohibitedWords.length > 0) {
        sections.push(`- Prohibited Words / Phrases: ${bv.prohibitedWords.join(', ')}`);
      }
      if (bv.approvedThemes.length > 0) {
        sections.push(`- Approved Themes: ${bv.approvedThemes.join(', ')}`);
      }
    }

    // 3. Platform Preferences & Budget Allocations
    if (profile.platformPreferences) {
      const pp = profile.platformPreferences;
      sections.push('\n#### 3. Platform Preferences & Channel Mix');
      sections.push(`- Active Channels: ${pp.preferredPlatforms.join(', ')}`);
      const splitStr = Object.entries(pp.defaultBudgetSplit)
        .map(([plt, pct]) => `${plt}: ${pct}%`)
        .join(', ');
      sections.push(`- Target Budget Split: ${splitStr}`);
      if (pp.negativeKeywords && pp.negativeKeywords.length > 0) {
        sections.push(`- Brand Negative Keywords: ${pp.negativeKeywords.join(', ')}`);
      }
      if (pp.approvedKeywords && pp.approvedKeywords.length > 0) {
        sections.push(`- Priority Keywords: ${pp.approvedKeywords.join(', ')}`);
      }
      if (pp.excludedGeographies && pp.excludedGeographies.length > 0) {
        sections.push(`- Excluded Geographies: ${pp.excludedGeographies.join(', ')}`);
      }
    }

    // 4. Approval Rules & Governance
    if (profile.approvalRules) {
      const ar = profile.approvalRules;
      sections.push('\n#### 4. Governance & Human Approval Thresholds');
      sections.push(`- Auto-Approve Budget Adjustment Threshold: $${ar.autoApproveBudgetThreshold}/day`);
      sections.push(`- Require Human Approval for Creative Deletion: ${ar.requireHumanForCreativeDelete ? 'YES' : 'NO'}`);
      sections.push(`- High-Risk ROAS Protection Threshold: ${ar.highRiskRoasProtectionThreshold}x`);
    }

    // 5. Naming Conventions
    if (profile.namingConventions) {
      const nc = profile.namingConventions;
      sections.push('\n#### 5. Entity Naming Conventions');
      sections.push(`- Campaign Naming: \`${nc.campaignTemplate}\``);
      sections.push(`- Ad Set / Group Naming: \`${nc.adGroupTemplate}\``);
      sections.push(`- Creative Naming: \`${nc.creativeTemplate}\``);
    }

    // 6. Workflow Preferences
    if (profile.workflowPreferences) {
      const wp = profile.workflowPreferences;
      sections.push('\n#### 6. Workflow Preferences');
      sections.push(`- Auto-Pause Fatigue Creative: ${wp.autoPauseFatigueCreativeEnabled ? 'ENABLED' : 'DISABLED'}`);
      sections.push(`- Auto-Rebalance Budgets: ${wp.autoRebalanceBudgetsEnabled ? 'ENABLED' : 'DISABLED'}`);
    }

    const fullText = sections.join('\n');

    // Strict safety assertion: verify no prohibited content leaked into prompt markdown
    const check = this.validator.validateProhibitedContent(fullText);
    if (check.hasProhibited) {
      throw new ValidationException(
        `Memory prompt context generation failed security check: ${check.reasons.join('; ')}`,
        check.reasons
      );
    }

    return fullText;
  }

  // ==========================================
  // Granular Memory CRUD & Query Methods
  // ==========================================

  public async getProfile(clientId: string): Promise<ClientMemoryProfile> {
    return this.retrieval.getProfile(clientId);
  }

  public async getEntry(clientId: string, key: string): Promise<MemoryEntry | null> {
    return this.retrieval.getEntry(clientId, key);
  }

  public async getEntriesByCategory(clientId: string, category: MemoryCategory): Promise<MemoryEntry[]> {
    return this.retrieval.getEntriesByCategory(clientId, category);
  }

  public async setEntry<T = unknown>(
    entryData: Omit<MemoryEntry<T>, 'version' | 'createdAt' | 'updatedAt' | 'auditTrail'>,
    actor: string,
    reason: string
  ): Promise<MemoryEntry<T>> {
    return this.updater.createEntry(entryData, actor, reason);
  }

  public async updateEntry<T = unknown>(
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
  ): Promise<MemoryEntry<T>> {
    return this.updater.updateEntry(clientId, key, newValue, actor, reason, adjustments);
  }

  public async searchMemory(
    clientId: string,
    query: string,
    options?: MemoryQueryOptions,
    criteria?: MemoryRankingCriteria
  ): Promise<RankedMemoryEntry[]> {
    return this.retrieval.searchMemory(clientId, query, options, criteria);
  }

  public async deleteEntry(
    clientId: string,
    key: string,
    actor: string,
    reason: string
  ): Promise<boolean> {
    return this.updater.deleteEntry(clientId, key, actor, reason);
  }

  // ==========================================
  // Persistence: Disk Serialization
  // ==========================================

  /**
   * Persists client memory items to isolated disk partitions under data/memory/<clientId>.json
   */
  public async saveToDisk(customDir?: string): Promise<void> {
    const targetDir = customDir ?? this.baseStorageDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const [clientId, partition] of this.storage.entries()) {
      const filePath = path.join(targetDir, `${clientId}.json`);
      const entries = Array.from(partition.values());
      fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), 'utf-8');
    }
  }

  /**
   * Hydrates client memory from disk partitions.
   */
  public async loadFromDisk(customDir?: string): Promise<number> {
    const targetDir = customDir ?? this.baseStorageDir;
    if (!fs.existsSync(targetDir)) {
      return 0;
    }

    const files = fs.readdirSync(targetDir).filter((f) => f.endsWith('.json'));
    let totalLoaded = 0;

    for (const file of files) {
      const clientId = path.basename(file, '.json');
      const filePath = path.join(targetDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const entries: MemoryEntry[] = JSON.parse(raw);

      let partition = this.storage.get(clientId);
      if (!partition) {
        partition = new Map<string, MemoryEntry>();
        this.storage.set(clientId, partition);
      }

      for (const entry of entries) {
        this.validator.assertValidEntry(entry);
        partition.set(entry.key, entry);
        totalLoaded++;
      }
    }

    return totalLoaded;
  }
}
