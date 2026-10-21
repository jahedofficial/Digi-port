import { ValidationException } from '../errors/domain.errors';
import {
  ApprovalRules,
  BusinessGoals,
  BusinessStrategies,
  ClientMemoryProfile,
  IMemoryRanking,
  IMemoryRetrieval,
  MemoryCategory,
  MemoryEntry,
  MemoryQueryOptions,
  MemoryRankingCriteria,
  NamingConventions,
  PlatformPreferences,
  RankedMemoryEntry,
  UserPreferences,
  WorkflowPreferences,
} from './types';
import { MemoryRanking } from './memory-ranking';

/**
 * Client-Isolated Memory Retrieval Engine
 * Strictly enforces tenant boundaries: queries for one client will NEVER cross into another.
 */
export class MemoryRetrieval implements IMemoryRetrieval {
  private readonly rankingEngine: IMemoryRanking;
  // Partitioned storage: clientId -> (key -> MemoryEntry)
  private readonly storage: Map<string, Map<string, MemoryEntry>>;

  constructor(
    storage?: Map<string, Map<string, MemoryEntry>>,
    rankingEngine?: IMemoryRanking
  ) {
    this.storage = storage ?? new Map<string, Map<string, MemoryEntry>>();
    this.rankingEngine = rankingEngine ?? new MemoryRanking();
  }

  private validateClientId(clientId: string): void {
    if (!clientId || typeof clientId !== 'string' || clientId.trim().length === 0) {
      throw new ValidationException(
        "MemoryRetrieval requires a valid non-empty 'clientId' to guarantee isolation.",
        ['MISSING_CLIENT_ID']
      );
    }
  }

  /**
   * Retrieves a single entry by client ID and key.
   */
  public async getEntry(clientId: string, key: string): Promise<MemoryEntry | null> {
    this.validateClientId(clientId);
    const clientPartition = this.storage.get(clientId);
    if (!clientPartition) {
      return null;
    }
    return clientPartition.get(key) ?? null;
  }

  /**
   * Retrieves all entries for a specific category within a client workspace.
   */
  public async getEntriesByCategory(
    clientId: string,
    category: MemoryCategory
  ): Promise<MemoryEntry[]> {
    this.validateClientId(clientId);
    const clientPartition = this.storage.get(clientId);
    if (!clientPartition) {
      return [];
    }
    return Array.from(clientPartition.values()).filter((e) => e.category === category);
  }

  /**
   * Retrieves all entries strictly scoped to the specified client.
   */
  public async getAllEntries(clientId: string): Promise<MemoryEntry[]> {
    this.validateClientId(clientId);
    const clientPartition = this.storage.get(clientId);
    if (!clientPartition) {
      return [];
    }
    return Array.from(clientPartition.values());
  }

  /**
   * Reconstructs the complete consolidated ClientMemoryProfile.
   */
  public async getProfile(clientId: string): Promise<ClientMemoryProfile> {
    this.validateClientId(clientId);
    const entries = await this.getAllEntries(clientId);

    const profile: ClientMemoryProfile = {
      clientId,
      rawEntries: entries,
      updatedAt: new Date(0),
    };

    for (const entry of entries) {
      if (new Date(entry.updatedAt).getTime() > profile.updatedAt.getTime()) {
        profile.updatedAt = new Date(entry.updatedAt);
      }

      switch (entry.category) {
        case 'BUSINESS_GOALS':
          profile.businessGoals = entry.value as BusinessGoals;
          break;
        case 'USER_PREFERENCES':
          profile.userPreferences = entry.value as UserPreferences;
          break;
        case 'BUSINESS_STRATEGIES':
          profile.businessStrategies = entry.value as BusinessStrategies;
          break;
        case 'APPROVAL_RULES':
          profile.approvalRules = entry.value as ApprovalRules;
          break;
        case 'NAMING_CONVENTIONS':
          profile.namingConventions = entry.value as NamingConventions;
          break;
        case 'WORKFLOW_PREFERENCES':
          profile.workflowPreferences = entry.value as WorkflowPreferences;
          break;
        case 'PLATFORM_PREFERENCES':
          profile.platformPreferences = entry.value as PlatformPreferences;
          break;
      }
    }

    if (entries.length === 0) {
      profile.updatedAt = new Date();
    }

    return profile;
  }

  /**
   * Searches and deterministically ranks memory items for a client.
   */
  public async searchMemory(
    clientId: string,
    query: string,
    options?: MemoryQueryOptions,
    criteria?: MemoryRankingCriteria
  ): Promise<RankedMemoryEntry[]> {
    this.validateClientId(clientId);
    let entries = await this.getAllEntries(clientId);

    if (options?.category) {
      entries = entries.filter((e) => e.category === options.category);
    }

    if (options?.minImportance !== undefined) {
      entries = entries.filter((e) => e.importance >= options.minImportance!);
    }

    if (options?.minConfidence !== undefined) {
      entries = entries.filter((e) => e.confidence >= options.minConfidence!);
    }

    const ranked = this.rankingEngine.rankEntries(entries, query, criteria);

    if (options?.limit && options.limit > 0) {
      return ranked.slice(0, options.limit);
    }

    return ranked;
  }
}
