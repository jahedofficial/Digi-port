import * as fs from 'fs';
import * as path from 'path';
import { IndustryTemplate, IIndustryTemplateRegistry } from './types';
import { ILogger } from '../interfaces/logger.interface';
import { SystemException } from '../errors/domain.errors';

export class IndustryTemplateLoader {
  constructor(
    private readonly registry: IIndustryTemplateRegistry,
    private readonly logger?: ILogger
  ) {}

  async loadFromDirectory(directoryPath: string): Promise<IndustryTemplate[]> {
    this.logger?.info(`[IndustryTemplateLoader] Loading industry templates from: ${directoryPath}`);

    if (!fs.existsSync(directoryPath)) {
      throw new SystemException(
        `Industry templates directory does not exist: ${directoryPath}`,
        'ERR_TEMPLATE_DIR_NOT_FOUND',
        { directoryPath }
      );
    }

    const files = fs.readdirSync(directoryPath).filter(f => f.endsWith('.json'));
    const loadedTemplates: IndustryTemplate[] = [];

    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(content) as IndustryTemplate;
        this.registry.register(parsed);
        loadedTemplates.push(parsed);
        this.logger?.debug(`[IndustryTemplateLoader] Loaded template from ${file}: ${parsed.name}`);
      } catch (error) {
        this.logger?.error(`[IndustryTemplateLoader] Failed to load template file ${file}:`, error);
        throw new SystemException(
          `Failed to load industry template file ${file}: ${error instanceof Error ? error.message : String(error)}`,
          'ERR_TEMPLATE_PARSE_FAILED',
          { file, fullPath }
        );
      }
    }

    this.logger?.info(`[IndustryTemplateLoader] Successfully loaded ${loadedTemplates.length} industry templates`);
    return loadedTemplates;
  }

  loadTemplate(templateOrJson: string | Record<string, unknown>): IndustryTemplate {
    const template: IndustryTemplate = typeof templateOrJson === 'string'
      ? JSON.parse(templateOrJson)
      : (templateOrJson as unknown as IndustryTemplate);

    this.registry.register(template);
    return template;
  }
}
