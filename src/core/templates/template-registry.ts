import { IndustryTemplate, IIndustryTemplateRegistry } from './types';
import { ValidationException } from '../errors/domain.errors';
import { ILogger } from '../interfaces/logger.interface';

export class IndustryTemplateRegistry implements IIndustryTemplateRegistry {
  private readonly templatesById = new Map<string, IndustryTemplate>();
  private readonly templatesByIndustry = new Map<string, IndustryTemplate>();

  constructor(private readonly logger?: ILogger) {}

  register(template: IndustryTemplate): void {
    const validation = this.validateTemplate(template);
    if (!validation.valid) {
      throw new ValidationException(
        `Failed to register IndustryTemplate '${template.id || 'unknown'}': ${validation.errors.join(', ')}`,
        validation.errors
      );
    }

    this.templatesById.set(template.id, template);
    this.templatesByIndustry.set(template.industry.toLowerCase(), template);
    this.logger?.debug(`[IndustryTemplateRegistry] Registered template: ${template.name} (${template.id})`);
  }

  get(idOrIndustry: string): IndustryTemplate | undefined {
    const normalized = idOrIndustry.toLowerCase();
    return this.templatesById.get(idOrIndustry) || this.templatesByIndustry.get(normalized);
  }

  has(idOrIndustry: string): boolean {
    const normalized = idOrIndustry.toLowerCase();
    return this.templatesById.has(idOrIndustry) || this.templatesByIndustry.has(normalized);
  }

  getAll(): IndustryTemplate[] {
    return Array.from(this.templatesById.values());
  }

  validateTemplate(template: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template || typeof template !== 'object') {
      return { valid: false, errors: ['Template must be a non-null object'] };
    }

    const t = template as Partial<IndustryTemplate>;

    const requiredStrings: Array<keyof IndustryTemplate> = ['id', 'name', 'industry', 'version'];
    for (const key of requiredStrings) {
      if (typeof t[key] !== 'string' || (t[key] as string).trim().length === 0) {
        errors.push(`Field '${key}' is required and must be a non-empty string`);
      }
    }

    const requiredArrays: Array<keyof IndustryTemplate> = [
      'businessGoals',
      'conversionGoals',
      'trackingRequirements',
      'reportingMetrics',
      'bestPractices',
    ];
    for (const key of requiredArrays) {
      if (!Array.isArray(t[key]) || (t[key] as unknown[]).length === 0) {
        errors.push(`Field '${key}' is required and must be a non-empty array`);
      }
    }

    if (!t.campaignStructure || !Array.isArray(t.campaignStructure.funnelStages)) {
      errors.push("Field 'campaignStructure.funnelStages' is required as an array");
    }

    if (!t.namingConventions || !t.namingConventions.campaignPattern) {
      errors.push("Field 'namingConventions.campaignPattern' is required");
    }

    if (!t.assetRequirements || !Array.isArray(t.assetRequirements.formats)) {
      errors.push("Field 'assetRequirements.formats' is required as an array");
    }

    if (!t.kpiTargets || typeof t.kpiTargets !== 'object') {
      errors.push("Field 'kpiTargets' is required as an object");
    }

    // Platform Mix Validation
    if (!t.platformMix || typeof t.platformMix !== 'object') {
      errors.push("Field 'platformMix' is required");
    } else {
      const pm = t.platformMix;
      if (!pm.recommendedRoles?.google || !pm.recommendedRoles?.meta || !pm.recommendedRoles?.tiktok) {
        errors.push("platformMix.recommendedRoles must define roles for 'google', 'meta', and 'tiktok'");
      }

      if (!pm.budgetSplitRanges?.google || !pm.budgetSplitRanges?.meta || !pm.budgetSplitRanges?.tiktok) {
        errors.push("platformMix.budgetSplitRanges must define splits for 'google', 'meta', and 'tiktok'");
      } else {
        const sum =
          pm.budgetSplitRanges.google.defaultPercent +
          pm.budgetSplitRanges.meta.defaultPercent +
          pm.budgetSplitRanges.tiktok.defaultPercent;
        if (Math.round(sum) !== 100) {
          errors.push(`platformMix budgetSplitRanges defaultPercent must sum to 100% (currently ${sum}%)`);
        }
      }

      if (!pm.perPlatformCampaignTypes?.google || !pm.perPlatformCampaignTypes?.meta || !pm.perPlatformCampaignTypes?.tiktok) {
        errors.push("platformMix.perPlatformCampaignTypes must define campaign types for google, meta, and tiktok");
      }

      if (!pm.perPlatformObjectives?.google || !pm.perPlatformObjectives?.meta || !pm.perPlatformObjectives?.tiktok) {
        errors.push("platformMix.perPlatformObjectives must define objectives for google, meta, and tiktok");
      }

      if (!pm.perPlatformOptimizationEvents?.google || !pm.perPlatformOptimizationEvents?.meta || !pm.perPlatformOptimizationEvents?.tiktok) {
        errors.push("platformMix.perPlatformOptimizationEvents must define events for google, meta, and tiktok");
      }

      if (!pm.perPlatformCreativeRequirements?.google || !pm.perPlatformCreativeRequirements?.meta || !pm.perPlatformCreativeRequirements?.tiktok) {
        errors.push("platformMix.perPlatformCreativeRequirements must define creative requirements for google, meta, and tiktok");
      }

      if (!pm.policyConstraints || typeof pm.policyConstraints !== 'object') {
        errors.push("platformMix.policyConstraints must be an object");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
