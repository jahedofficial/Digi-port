import { Platform } from '../types/account';

/**
 * Contract 8: ClientMemory interface matching Enterprise Architecture
 */
export interface ClientMemory {
  clientId: string;
  brandVoice: string;
  preferredPlatforms: Platform[];
  targetCpaThreshold: number;
  targetRoasFloor: number;
  approvedKeywords: string[];
  negativeKeywords: string[];
}

/**
 * Options for extracting context for LLM prompt grounding
 */
export interface PromptMemoryOptions {
  maxTokens?: number;
  includeCategories?: string[];
  includeBrandGuidelines?: boolean;
}

/**
 * Base Memory Manager interface (Contract 8)
 */
export interface IMemoryManager {
  getClientMemory(clientId: string): Promise<ClientMemory>;
  updateClientMemory(clientId: string, updates: Partial<ClientMemory>, actor?: string, reason?: string): Promise<ClientMemory>;
  extractContextForPrompt(clientId: string, options?: PromptMemoryOptions): Promise<string>;
}
