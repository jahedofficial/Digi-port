import * as fs from 'fs';
import * as path from 'path';
import { KnowledgeModule, IKnowledgeRegistry } from './types';
import { ILogger } from '../interfaces/logger.interface';
import { SystemException } from '../errors/domain.errors';

export class KnowledgeLoader {
  constructor(
    private readonly registry: IKnowledgeRegistry,
    private readonly logger?: ILogger
  ) {}

  async loadFromDirectory(directoryPath: string): Promise<KnowledgeModule[]> {
    this.logger?.info(`[KnowledgeLoader] Loading knowledge modules from: ${directoryPath}`);

    if (!fs.existsSync(directoryPath)) {
      throw new SystemException(
        `Knowledge directory does not exist: ${directoryPath}`,
        'ERR_KNOWLEDGE_DIR_NOT_FOUND',
        { directoryPath }
      );
    }

    const loadedModules: KnowledgeModule[] = [];
    const files = this.findKnowledgeFilesRecursively(directoryPath);

    for (const fullPath of files) {
      const fileName = path.basename(fullPath);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        let module: KnowledgeModule;

        if (fileName.endsWith('.json')) {
          module = JSON.parse(content) as KnowledgeModule;
        } else if (fileName.endsWith('.md')) {
          module = this.parseMarkdownKnowledge(fileName, content);
        } else {
          continue;
        }

        this.registry.registerModule(module);
        loadedModules.push(module);
        this.logger?.debug(`[KnowledgeLoader] Loaded knowledge module from ${fileName}: ${module.title}`);
      } catch (error) {
        this.logger?.error(`[KnowledgeLoader] Failed to load knowledge file ${fileName}:`, error);
        throw new SystemException(
          `Failed to load knowledge file ${fileName}: ${error instanceof Error ? error.message : String(error)}`,
          'ERR_KNOWLEDGE_PARSE_FAILED',
          { file: fileName, fullPath }
        );
      }
    }

    this.logger?.info(`[KnowledgeLoader] Successfully loaded ${loadedModules.length} knowledge modules`);
    return loadedModules;
  }

  loadModule(moduleOrJson: string | Record<string, unknown>): KnowledgeModule {
    const module: KnowledgeModule = typeof moduleOrJson === 'string'
      ? JSON.parse(moduleOrJson)
      : (moduleOrJson as unknown as KnowledgeModule);

    this.registry.registerModule(module);
    return module;
  }

  private findKnowledgeFilesRecursively(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.findKnowledgeFilesRecursively(filePath));
      } else if (file.endsWith('.json') || file.endsWith('.md')) {
        results.push(filePath);
      }
    }

    return results;
  }

  private parseMarkdownKnowledge(fileName: string, content: string): KnowledgeModule {
    const id = fileName.replace(/\.md$/, '').toLowerCase();
    const lines = content.split('\n');

    let title = id;
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim();

    // Platform inference from filename or path
    let platform: KnowledgeModule['platform'] = 'GENERAL';
    if (/google/i.test(id)) platform = 'GOOGLE';
    else if (/meta|facebook|instagram/i.test(id)) platform = 'META';
    else if (/tiktok/i.test(id)) platform = 'TIKTOK';
    else if (/cross-platform|attribution|best-practices/i.test(id)) platform = 'CROSS_PLATFORM';

    const extractSection = (headingRegex: RegExp): string => {
      const match = content.match(headingRegex);
      if (!match || match.index === undefined) return '';
      const start = match.index + match[0].length;
      const rest = content.substring(start);
      const nextHeadingMatch = rest.match(/\n##\s+/);
      const end = nextHeadingMatch && nextHeadingMatch.index !== undefined ? nextHeadingMatch.index : rest.length;
      return rest.substring(0, end).trim();
    };

    const extractList = (headingRegex: RegExp): string[] => {
      const sectionText = extractSection(headingRegex);
      if (!sectionText) return [];
      return sectionText
        .split('\n')
        .map(l => l.replace(/^[-*•]\s+/, '').trim())
        .filter(l => l.length > 0 && !l.startsWith('#'));
    };

    const overview = extractSection(/##\s+Overview/i) || `${title} reference module.`;
    const coreConcepts = extractList(/##\s+Core Concepts/i);
    const features = extractList(/##\s+Features/i);
    const bestPractices = extractList(/##\s+Best Practices/i);
    const policies = extractList(/##\s+Policies/i);
    const limitations = extractList(/##\s+Limitations/i);
    const commonIssues = extractList(/##\s+Common Issues/i);
    const references = extractList(/##\s+References/i);

    // Troubleshooting guide
    const troubleshootingSection = extractSection(/##\s+Troubleshooting Guide/i);
    const troubleshootingGuide: Array<{ issue: string; resolution: string }> = [];
    if (troubleshootingSection) {
      const items = troubleshootingSection.split(/\n(?=[-•*]\s+\*\*|\d+\.\s+\*\*)/);
      for (const item of items) {
        const clean = item.replace(/^[-•*]\s+|\d+\.\s+/, '').trim();
        const parts = clean.split(/(?::|\*\* -|\*\* –|\*\* —)/);
        if (parts.length >= 2) {
          troubleshootingGuide.push({
            issue: parts[0].replace(/\*\*/g, '').trim(),
            resolution: parts.slice(1).join(':').replace(/\*\*/g, '').trim(),
          });
        }
      }
    }

    return {
      id,
      title,
      platform,
      category: 'Documentation',
      version: '1.0.0',
      overview,
      coreConcepts: coreConcepts.length > 0 ? coreConcepts : ['Core platform functionality'],
      features: features.length > 0 ? features : ['Standard API features'],
      bestPractices: bestPractices.length > 0 ? bestPractices : ['Follow official documentation guidelines'],
      policies: policies.length > 0 ? policies : ['Comply with official platform advertising standards'],
      limitations: limitations.length > 0 ? limitations : ['Subject to standard API quotas and rate limits'],
      commonIssues: commonIssues.length > 0 ? commonIssues : ['Transient network or credential expiration issues'],
      troubleshootingGuide: troubleshootingGuide.length > 0 ? troubleshootingGuide : [{ issue: 'Connection failure', resolution: 'Verify credentials and network connectivity' }],
      references: references.length > 0 ? references : ['https://developers.google.com', 'https://developers.facebook.com', 'https://ads.tiktok.com'],
      rawMarkdown: content,
    };
  }
}
