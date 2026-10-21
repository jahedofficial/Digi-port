import { 
  IPromptContextBuilder, 
  IKnowledgeRegistry, 
  PromptContextBuildOptions, 
  BuiltPromptContext 
} from './types';
import { ILogger } from '../interfaces/logger.interface';
import { ValidationException } from '../errors/domain.errors';

export class PromptContextBuilder implements IPromptContextBuilder {
  constructor(
    private readonly registry: IKnowledgeRegistry,
    private readonly logger?: ILogger
  ) {}

  buildContext(options: PromptContextBuildOptions): BuiltPromptContext {
    const template = this.registry.getPromptTemplate(options.promptTemplateId);
    if (!template) {
      throw new ValidationException(
        `Prompt template not found with ID '${options.promptTemplateId}'`,
        [options.promptTemplateId]
      );
    }

    // 1. Substitute variables into user prompt
    let userPrompt = template.userPromptTemplate;
    const missingVariables: string[] = [];

    for (const v of template.variables) {
      const val = options.variables[v];
      if (val === undefined || val === null) {
        missingVariables.push(v);
      } else {
        const regex = new RegExp(`\\{\\{${v}\\}\\}`, 'g');
        userPrompt = userPrompt.replace(regex, this.sanitizeInput(val));
      }
    }

    if (missingVariables.length > 0) {
      throw new ValidationException(
        `Missing required prompt variables for template '${options.promptTemplateId}': ${missingVariables.join(', ')}`,
        missingVariables
      );
    }

    // 2. Build enriched system prompt with official knowledge
    let systemPrompt = template.systemPrompt;
    const includedReferences = new Set<string>();

    const knowledgeModulesToInclude = new Set<string>(options.includeKnowledgeIds || []);

    // Automatically append platform-specific knowledge modules if platform is specified
    if (options.platform) {
      const platformModules = this.registry.getModulesByPlatform(options.platform);
      for (const m of platformModules) {
        knowledgeModulesToInclude.add(m.id);
      }
    }

    if (knowledgeModulesToInclude.size > 0) {
      systemPrompt += '\n\n=== AUTHORITATIVE PLATFORM KNOWLEDGE BASE ===';

      for (const kId of knowledgeModulesToInclude) {
        const kMod = this.registry.getModule(kId);
        if (kMod) {
          systemPrompt += `\n\n[MODULE: ${kMod.title} (v${kMod.version})]\n`;
          systemPrompt += `Overview: ${kMod.overview}\n`;
          systemPrompt += `Core Concepts: ${kMod.coreConcepts.join('; ')}\n`;
          systemPrompt += `Best Practices: ${kMod.bestPractices.join('; ')}\n`;
          systemPrompt += `Policies & Constraints: ${kMod.policies.join('; ')}\n`;
          systemPrompt += `Limitations: ${kMod.limitations.join('; ')}\n`;

          for (const ref of kMod.references) {
            includedReferences.add(ref);
          }
        }
      }

      systemPrompt += '\n=== END OF KNOWLEDGE BASE ===';
    }

    // Security invariant: Ensure no sensitive patterns exist in prompts
    systemPrompt = this.sanitizeInput(systemPrompt);
    userPrompt = this.sanitizeInput(userPrompt);

    this.logger?.debug(`[PromptContextBuilder] Built context for template '${options.promptTemplateId}' with ${knowledgeModulesToInclude.size} knowledge modules`);

    return {
      systemPrompt,
      userPrompt,
      includedReferences: Array.from(includedReferences),
    };
  }

  private sanitizeInput(input: string): string {
    if (!input) return input;
    return input
      .replace(/Bearer\s+[a-zA-Z0-9_\-]{15,}/gi, 'Bearer [REDACTED]')
      .replace(/sk-or-v1-[a-zA-Z0-9_\-]{15,}/g, '[REDACTED_API_KEY]')
      .replace(/ya29\.[a-zA-Z0-9_\-]{20,}/g, '[REDACTED_GOOGLE_TOKEN]')
      .replace(/EAAB[a-zA-Z0-9_\-]{20,}/g, '[REDACTED_META_TOKEN]');
  }
}
