import { 
  KnowledgeModule, 
  PromptTemplate, 
  IKnowledgeRegistry, 
  KnowledgePlatform 
} from './types';
import { ValidationException } from '../errors/domain.errors';
import { ILogger } from '../interfaces/logger.interface';

export class KnowledgeRegistry implements IKnowledgeRegistry {
  private readonly modulesById = new Map<string, KnowledgeModule>();
  private readonly modulesByPlatform = new Map<KnowledgePlatform, Set<string>>();
  private readonly promptTemplatesById = new Map<string, PromptTemplate>();

  constructor(private readonly logger?: ILogger) {
    this.modulesByPlatform.set('GOOGLE', new Set());
    this.modulesByPlatform.set('META', new Set());
    this.modulesByPlatform.set('TIKTOK', new Set());
    this.modulesByPlatform.set('CROSS_PLATFORM', new Set());
    this.modulesByPlatform.set('GENERAL', new Set());
  }

  registerModule(module: KnowledgeModule): void {
    const val = this.validateKnowledgeModule(module);
    if (!val.valid) {
      throw new ValidationException(
        `Failed to register KnowledgeModule '${module.id || 'unknown'}': ${val.errors.join(', ')}`,
        val.errors
      );
    }

    this.modulesById.set(module.id, module);
    this.modulesByPlatform.get(module.platform)?.add(module.id);
    this.logger?.debug(`[KnowledgeRegistry] Registered module: ${module.title} (${module.id})`);
  }

  getModule(id: string): KnowledgeModule | undefined {
    return this.modulesById.get(id);
  }

  getModulesByPlatform(platform: KnowledgePlatform): KnowledgeModule[] {
    const ids = this.modulesByPlatform.get(platform);
    if (!ids) return [];
    return Array.from(ids).map(id => this.modulesById.get(id)!).filter(Boolean);
  }

  getAllModules(): KnowledgeModule[] {
    return Array.from(this.modulesById.values());
  }

  hasModule(id: string): boolean {
    return this.modulesById.has(id);
  }

  registerPromptTemplate(template: PromptTemplate): void {
    const val = this.validatePromptTemplate(template);
    if (!val.valid) {
      throw new ValidationException(
        `Failed to register PromptTemplate '${template.id || 'unknown'}': ${val.errors.join(', ')}`,
        val.errors
      );
    }

    this.promptTemplatesById.set(template.id, template);
    this.logger?.debug(`[KnowledgeRegistry] Registered prompt template: ${template.name} (${template.id})`);
  }

  getPromptTemplate(id: string): PromptTemplate | undefined {
    return this.promptTemplatesById.get(id);
  }

  getAllPromptTemplates(): PromptTemplate[] {
    return Array.from(this.promptTemplatesById.values());
  }

  hasPromptTemplate(id: string): boolean {
    return this.promptTemplatesById.has(id);
  }

  validateKnowledgeModule(module: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!module || typeof module !== 'object') {
      return { valid: false, errors: ['KnowledgeModule must be a non-null object'] };
    }

    const m = module as Partial<KnowledgeModule>;

    const requiredStrings: Array<keyof KnowledgeModule> = ['id', 'title', 'category', 'version', 'overview'];
    for (const key of requiredStrings) {
      if (typeof m[key] !== 'string' || (m[key] as string).trim().length === 0) {
        errors.push(`Field '${key}' is required and must be a non-empty string`);
      }
    }

    const allowedPlatforms: KnowledgePlatform[] = ['GOOGLE', 'META', 'TIKTOK', 'CROSS_PLATFORM', 'GENERAL'];
    if (!m.platform || !allowedPlatforms.includes(m.platform)) {
      errors.push(`Field 'platform' must be one of [${allowedPlatforms.join(', ')}]`);
    }

    const requiredArrays: Array<keyof KnowledgeModule> = [
      'coreConcepts',
      'features',
      'bestPractices',
      'policies',
      'limitations',
      'commonIssues',
      'troubleshootingGuide',
      'references',
    ];

    for (const key of requiredArrays) {
      if (!Array.isArray(m[key]) || (m[key] as unknown[]).length === 0) {
        errors.push(`Field '${key}' is required and must be a non-empty array`);
      }
    }

    if (Array.isArray(m.troubleshootingGuide)) {
      for (let i = 0; i < m.troubleshootingGuide.length; i++) {
        const item = m.troubleshootingGuide[i];
        if (!item || typeof item !== 'object' || !item.issue || !item.resolution) {
          errors.push(`troubleshootingGuide[${i}] must define 'issue' and 'resolution'`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validatePromptTemplate(template: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template || typeof template !== 'object') {
      return { valid: false, errors: ['PromptTemplate must be a non-null object'] };
    }

    const p = template as Partial<PromptTemplate>;

    const requiredStrings: Array<keyof PromptTemplate> = ['id', 'name', 'category', 'version', 'systemPrompt', 'userPromptTemplate'];
    for (const key of requiredStrings) {
      if (typeof p[key] !== 'string' || (p[key] as string).trim().length === 0) {
        errors.push(`Field '${key}' is required and must be a non-empty string`);
      }
    }

    if (!Array.isArray(p.variables)) {
      errors.push("Field 'variables' is required as an array of placeholder strings");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
