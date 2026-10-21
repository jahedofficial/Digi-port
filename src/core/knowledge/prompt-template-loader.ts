import * as fs from 'fs';
import * as path from 'path';
import { PromptTemplate, IKnowledgeRegistry } from './types';
import { ILogger } from '../interfaces/logger.interface';
import { SystemException } from '../errors/domain.errors';

export class PromptTemplateLoader {
  constructor(
    private readonly registry: IKnowledgeRegistry,
    private readonly logger?: ILogger
  ) {}

  async loadFromDirectory(directoryPath: string): Promise<PromptTemplate[]> {
    this.logger?.info(`[PromptTemplateLoader] Loading prompt templates from: ${directoryPath}`);

    if (!fs.existsSync(directoryPath)) {
      throw new SystemException(
        `Prompt templates directory does not exist: ${directoryPath}`,
        'ERR_PROMPT_TEMPLATE_DIR_NOT_FOUND',
        { directoryPath }
      );
    }

    const loadedTemplates: PromptTemplate[] = [];
    const files = this.findTemplateFilesRecursively(directoryPath);

    for (const fullPath of files) {
      const fileName = path.basename(fullPath);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        let template: PromptTemplate;

        if (fileName.endsWith('.json')) {
          template = JSON.parse(content) as PromptTemplate;
        } else if (fileName.endsWith('.md')) {
          template = this.parseMarkdownPromptTemplate(fileName, content);
        } else {
          continue;
        }

        this.registry.registerPromptTemplate(template);
        loadedTemplates.push(template);
        this.logger?.debug(`[PromptTemplateLoader] Loaded prompt template from ${fileName}: ${template.name}`);
      } catch (error) {
        this.logger?.error(`[PromptTemplateLoader] Failed to load prompt template file ${fileName}:`, error);
        throw new SystemException(
          `Failed to load prompt template file ${fileName}: ${error instanceof Error ? error.message : String(error)}`,
          'ERR_PROMPT_TEMPLATE_PARSE_FAILED',
          { file: fileName, fullPath }
        );
      }
    }

    this.logger?.info(`[PromptTemplateLoader] Successfully loaded ${loadedTemplates.length} prompt templates`);
    return loadedTemplates;
  }

  loadTemplate(templateOrJson: string | Record<string, unknown>): PromptTemplate {
    const template: PromptTemplate = typeof templateOrJson === 'string'
      ? JSON.parse(templateOrJson)
      : (templateOrJson as unknown as PromptTemplate);

    this.registry.registerPromptTemplate(template);
    return template;
  }

  private findTemplateFilesRecursively(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.findTemplateFilesRecursively(filePath));
      } else if (file.endsWith('.json') || file.endsWith('.md')) {
        results.push(filePath);
      }
    }

    return results;
  }

  private parseMarkdownPromptTemplate(fileName: string, content: string): PromptTemplate {
    const id = fileName.replace(/\.md$/, '').toLowerCase();
    let name = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) name = titleMatch[1].trim();

    // Extract variables pattern: {{variable_name}}
    const variableMatches = content.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || [];
    const variables = Array.from(new Set(variableMatches.map(v => v.replace(/[{}]/g, '').trim())));

    const extractSection = (headingRegex: RegExp): string => {
      const match = content.match(headingRegex);
      if (!match || match.index === undefined) return '';
      const start = match.index + match[0].length;
      const rest = content.substring(start);
      const nextHeadingMatch = rest.match(/\n##\s+/);
      const end = nextHeadingMatch && nextHeadingMatch.index !== undefined ? nextHeadingMatch.index : rest.length;
      return rest.substring(0, end).trim();
    };

    const systemPrompt = extractSection(/##\s+System\s*Prompt/i) || 'You are an enterprise marketing intelligence engine.';
    const userPromptTemplate = extractSection(/##\s+User\s*Prompt\s*Template/i) || content;

    return {
      id,
      name,
      category: 'Marketing',
      version: '1.0.0',
      variables,
      systemPrompt,
      userPromptTemplate,
    };
  }
}
