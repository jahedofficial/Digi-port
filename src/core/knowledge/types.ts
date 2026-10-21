import { Platform } from '../types/account';

export type KnowledgePlatform = Platform | 'CROSS_PLATFORM' | 'GENERAL';

export interface TroubleshootingItem {
  issue: string;
  resolution: string;
}

export interface KnowledgeModule {
  id: string;
  title: string;
  platform: KnowledgePlatform;
  category: string;
  version: string;
  overview: string;
  coreConcepts: string[];
  features: string[];
  bestPractices: string[];
  policies: string[];
  limitations: string[];
  commonIssues: string[];
  troubleshootingGuide: TroubleshootingItem[];
  references: string[];
  rawMarkdown?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  version: string;
  variables: string[];
  systemPrompt: string;
  userPromptTemplate: string;
}

export interface BuiltPromptContext {
  systemPrompt: string;
  userPrompt: string;
  includedReferences: string[];
}

export interface PromptContextBuildOptions {
  promptTemplateId: string;
  platform?: Platform | 'CROSS_PLATFORM';
  variables: Record<string, string>;
  includeKnowledgeIds?: string[];
}

export interface IKnowledgeRegistry {
  registerModule(module: KnowledgeModule): void;
  getModule(id: string): KnowledgeModule | undefined;
  getModulesByPlatform(platform: KnowledgePlatform): KnowledgeModule[];
  getAllModules(): KnowledgeModule[];
  hasModule(id: string): boolean;
  registerPromptTemplate(template: PromptTemplate): void;
  getPromptTemplate(id: string): PromptTemplate | undefined;
  getAllPromptTemplates(): PromptTemplate[];
  hasPromptTemplate(id: string): boolean;
  validateKnowledgeModule(module: unknown): { valid: boolean; errors: string[] };
  validatePromptTemplate(template: unknown): { valid: boolean; errors: string[] };
}

export interface IPromptContextBuilder {
  buildContext(options: PromptContextBuildOptions): BuiltPromptContext;
}
