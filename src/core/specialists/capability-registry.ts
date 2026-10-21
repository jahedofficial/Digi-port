import * as fs from 'fs';
import * as path from 'path';
import { Platform } from '../types/account';
import { ValidationException, SystemException } from '../errors/domain.errors';
import { AgentCapabilityDefinition, ICapabilityRegistry } from './types';

/**
 * Capability Registry for Specialist Agents
 * Validates that capability definitions meet the 14 required fields mandated by Enterprise Blueprint.
 */
export class CapabilityRegistry implements ICapabilityRegistry {
  private readonly capabilities: Map<string, AgentCapabilityDefinition> = new Map();
  private readonly capabilitiesDir: string;

  constructor(capabilitiesDir?: string) {
    this.capabilitiesDir =
      capabilitiesDir ?? path.join(process.cwd(), 'assets', 'agent-capabilities');
  }

  public async loadFromDisk(baseDir?: string): Promise<AgentCapabilityDefinition[]> {
    const targetDir = baseDir ?? this.capabilitiesDir;

    if (!fs.existsSync(targetDir)) {
      throw new SystemException(`Capability directory not found: ${targetDir}`, 'ERR_CAPABILITY_DIR_NOT_FOUND');
    }

    const loadedList: AgentCapabilityDefinition[] = [];
    this.scanDirectoryRecursively(targetDir, loadedList);

    for (const cap of loadedList) {
      const validation = this.validateCapability(cap);
      if (!validation.isValid) {
        throw new ValidationException(
          `Capability definition '${cap.id || cap.agentName}' failed schema validation: ${validation.errors.join('; ')}`,
          validation.errors
        );
      }
      // Index by id, and by agentName:platform
      this.capabilities.set(cap.id, cap);
      for (const p of cap.supportedPlatforms) {
        this.capabilities.set(`${cap.agentName.toLowerCase()}:${p.toLowerCase()}`, cap);
      }
      this.capabilities.set(cap.agentName.toLowerCase(), cap);
    }

    return loadedList;
  }

  private scanDirectoryRecursively(dir: string, output: AgentCapabilityDefinition[]): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this.scanDirectoryRecursively(fullPath, output);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const raw = fs.readFileSync(fullPath, 'utf-8');
          const parsed = JSON.parse(raw) as AgentCapabilityDefinition;
          output.push(parsed);
        } catch (err: unknown) {
          throw new SystemException(
            `Failed to parse capability definition JSON at '${fullPath}': ${(err as Error).message}`,
            'ERR_CAPABILITY_PARSE'
          );
        }
      }
    }
  }

  public validateCapability(def: Partial<AgentCapabilityDefinition>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!def.agentName || typeof def.agentName !== 'string') {
      errors.push("Missing required field: 'agentName'");
    }
    if (!def.id || typeof def.id !== 'string') {
      errors.push("Missing required field: 'id'");
    }
    if (!Array.isArray(def.supportedPlatforms) || def.supportedPlatforms.length === 0) {
      errors.push("Missing or empty required field: 'supportedPlatforms'");
    }
    if (!def.supportedCampaignTypes || typeof def.supportedCampaignTypes !== 'object') {
      errors.push("Missing required field: 'supportedCampaignTypes'");
    }
    if (!def.supportedObjectives || typeof def.supportedObjectives !== 'object') {
      errors.push("Missing required field: 'supportedObjectives'");
    }
    if (!Array.isArray(def.supportedOperations) || def.supportedOperations.length === 0) {
      errors.push("Missing or empty required field: 'supportedOperations'");
    }
    if (!Array.isArray(def.supportedServices)) {
      errors.push("Missing required field: 'supportedServices'");
    }
    if (!Array.isArray(def.supportedAssetTypes)) {
      errors.push("Missing required field: 'supportedAssetTypes'");
    }
    if (!Array.isArray(def.supportedExtensions)) {
      errors.push("Missing required field: 'supportedExtensions'");
    }
    if (!Array.isArray(def.supportedBiddingStrategies)) {
      errors.push("Missing required field: 'supportedBiddingStrategies'");
    }
    if (!Array.isArray(def.requiredInputs) || def.requiredInputs.length === 0) {
      errors.push("Missing or empty required field: 'requiredInputs'");
    }
    if (!Array.isArray(def.expectedOutputs) || def.expectedOutputs.length === 0) {
      errors.push("Missing or empty required field: 'expectedOutputs'");
    }
    if (typeof def.requiredApprovals !== 'boolean') {
      errors.push("Missing boolean field: 'requiredApprovals'");
    }
    if (!Array.isArray(def.validationRules) || def.validationRules.length === 0) {
      errors.push("Missing or empty required field: 'validationRules'");
    }
    if (!Array.isArray(def.failureConditions) || def.failureConditions.length === 0) {
      errors.push("Missing or empty required field: 'failureConditions'");
    }
    if (!def.recoveryStrategy || typeof def.recoveryStrategy !== 'string') {
      errors.push("Missing required string field: 'recoveryStrategy'");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public getCapability(
    agentName: string,
    platform?: Platform | 'CROSS_PLATFORM'
  ): AgentCapabilityDefinition | undefined {
    if (platform && platform !== 'CROSS_PLATFORM') {
      const specific = this.capabilities.get(`${agentName.toLowerCase()}:${platform.toLowerCase()}`);
      if (specific) return specific;
    }
    return this.capabilities.get(agentName.toLowerCase());
  }

  public getAllCapabilities(): AgentCapabilityDefinition[] {
    const unique = new Map<string, AgentCapabilityDefinition>();
    for (const cap of this.capabilities.values()) {
      unique.set(cap.id, cap);
    }
    return Array.from(unique.values());
  }
}
