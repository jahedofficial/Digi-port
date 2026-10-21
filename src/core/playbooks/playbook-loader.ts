import * as fs from 'fs';
import * as path from 'path';
import { Playbook, IPlaybookRegistry } from './types';
import { ILogger } from '../interfaces/logger.interface';
import { SystemException } from '../errors/domain.errors';

export class PlaybookLoader {
  constructor(
    private readonly registry: IPlaybookRegistry,
    private readonly logger?: ILogger
  ) {}

  async loadFromDirectory(directoryPath: string): Promise<Playbook[]> {
    this.logger?.info(`[PlaybookLoader] Loading playbooks recursively from: ${directoryPath}`);

    if (!fs.existsSync(directoryPath)) {
      throw new SystemException(
        `Playbooks directory does not exist: ${directoryPath}`,
        'ERR_PLAYBOOK_DIR_NOT_FOUND',
        { directoryPath }
      );
    }

    const loadedPlaybooks: Playbook[] = [];
    const jsonFiles = this.findJsonFilesRecursively(directoryPath);

    for (const fullPath of jsonFiles) {
      const fileName = path.basename(fullPath);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(content) as Playbook;
        this.registry.register(parsed);
        loadedPlaybooks.push(parsed);
        this.logger?.debug(`[PlaybookLoader] Loaded playbook from ${fileName}: ${parsed.name}`);
      } catch (error) {
        this.logger?.error(`[PlaybookLoader] Failed to load playbook file ${fileName}:`, error);
        throw new SystemException(
          `Failed to load playbook file ${fileName}: ${error instanceof Error ? error.message : String(error)}`,
          'ERR_PLAYBOOK_PARSE_FAILED',
          { file: fileName, fullPath }
        );
      }
    }

    this.logger?.info(`[PlaybookLoader] Successfully loaded ${loadedPlaybooks.length} playbooks`);
    return loadedPlaybooks;
  }

  loadPlaybook(playbookOrJson: string | Record<string, unknown>): Playbook {
    const playbook: Playbook = typeof playbookOrJson === 'string'
      ? JSON.parse(playbookOrJson)
      : (playbookOrJson as unknown as Playbook);

    this.registry.register(playbook);
    return playbook;
  }

  private findJsonFilesRecursively(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.findJsonFilesRecursively(filePath));
      } else if (file.endsWith('.json')) {
        results.push(filePath);
      }
    }

    return results;
  }
}
