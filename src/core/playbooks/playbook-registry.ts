import { Playbook, IPlaybookRegistry } from './types';
import { Platform } from '../types/account';
import { ValidationException } from '../errors/domain.errors';
import { ILogger } from '../interfaces/logger.interface';

export class PlaybookRegistry implements IPlaybookRegistry {
  private readonly playbooksById = new Map<string, Playbook>();
  private readonly playbooksByPlatform = new Map<Platform, Set<string>>();

  constructor(private readonly logger?: ILogger) {
    this.playbooksByPlatform.set('GOOGLE', new Set());
    this.playbooksByPlatform.set('META', new Set());
    this.playbooksByPlatform.set('TIKTOK', new Set());
  }

  register(playbook: Playbook): void {
    const validation = this.validatePlaybook(playbook);
    if (!validation.valid) {
      throw new ValidationException(
        `Failed to register Playbook '${playbook.id || 'unknown'}': ${validation.errors.join(', ')}`,
        validation.errors
      );
    }

    this.playbooksById.set(playbook.id, playbook);

    for (const platform of playbook.targetPlatforms) {
      this.playbooksByPlatform.get(platform)?.add(playbook.id);
    }

    this.logger?.debug(`[PlaybookRegistry] Registered playbook: ${playbook.name} (${playbook.id})`);
  }

  get(id: string): Playbook | undefined {
    return this.playbooksById.get(id);
  }

  getByPlatform(platform: Platform): Playbook[] {
    const ids = this.playbooksByPlatform.get(platform);
    if (!ids) return [];
    return Array.from(ids).map(id => this.playbooksById.get(id)!).filter(Boolean);
  }

  getAll(): Playbook[] {
    return Array.from(this.playbooksById.values());
  }

  has(id: string): boolean {
    return this.playbooksById.has(id);
  }

  validatePlaybook(playbook: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!playbook || typeof playbook !== 'object') {
      return { valid: false, errors: ['Playbook must be a non-null object'] };
    }

    const p = playbook as Partial<Playbook>;

    const requiredStrings: Array<keyof Playbook> = ['id', 'name', 'version', 'purpose', 'rollbackStrategy'];
    for (const key of requiredStrings) {
      if (typeof p[key] !== 'string' || (p[key] as string).trim().length === 0) {
        errors.push(`Field '${key}' is required and must be a non-empty string`);
      }
    }

    if (typeof p.requiredApprovals !== 'boolean') {
      errors.push("Field 'requiredApprovals' is required and must be a boolean");
    }

    if (!Array.isArray(p.targetPlatforms) || p.targetPlatforms.length === 0) {
      errors.push("Field 'targetPlatforms' is required as a non-empty array");
    } else {
      const allowed: Platform[] = ['GOOGLE', 'META', 'TIKTOK'];
      for (const plat of p.targetPlatforms) {
        if (!allowed.includes(plat)) {
          errors.push(`Invalid platform '${plat}' in targetPlatforms. Allowed: [${allowed.join(', ')}]`);
        }
      }
    }

    const requiredArrays: Array<keyof Playbook> = [
      'triggerConditions',
      'prerequisites',
      'specialistAgents',
      'expectedOutputs',
      'successCriteria',
    ];
    for (const key of requiredArrays) {
      if (!Array.isArray(p[key]) || (p[key] as unknown[]).length === 0) {
        errors.push(`Field '${key}' is required and must be a non-empty array`);
      }
    }

    if (!Array.isArray(p.executionSteps) || p.executionSteps.length === 0) {
      errors.push("Field 'executionSteps' is required and must contain at least one step");
    } else {
      for (let i = 0; i < p.executionSteps.length; i++) {
        const step = p.executionSteps[i];
        if (!step || typeof step !== 'object') {
          errors.push(`executionSteps[${i}] must be an object`);
          continue;
        }
        if (typeof step.step !== 'number' || !step.name || !step.specialistAgent || !step.action) {
          errors.push(`executionSteps[${i}] must define 'step' (number), 'name', 'specialistAgent', and 'action'`);
        }
      }
    }

    if (!p.failureHandling || typeof p.failureHandling !== 'object') {
      errors.push("Field 'failureHandling' is required as an object");
    } else {
      if (!p.failureHandling.retryStrategy || !p.failureHandling.alertChannel) {
        errors.push("failureHandling must define 'retryStrategy' and 'alertChannel'");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
