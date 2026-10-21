import { Platform } from '../types/account';
import {
  AgentOperation,
  ClientContext,
  ISpecialistAgent,
  ScheduledTask,
  SpecialistCapability,
  SpecialistExecutionResult,
} from '../interfaces/agent.interface';

/**
 * Enterprise Agent Capability Definition
 * Strictly complies with Enterprise Blueprint Phase 9 requirements.
 */
export interface AgentCapabilityDefinition {
  $schema?: string;
  id: string;
  agentName: string;
  supportedPlatforms: Platform[];
  supportedCampaignTypes: Record<string, string[]>;
  supportedObjectives: Record<string, string[]>;
  supportedOperations: string[];
  supportedServices: string[];
  supportedAssetTypes: string[];
  supportedExtensions: string[];
  supportedBiddingStrategies: string[];
  requiredInputs: string[];
  expectedOutputs: string[];
  requiredApprovals: boolean;
  validationRules: string[];
  failureConditions: string[];
  recoveryStrategy: string;
}

/**
 * Registry interface for Agent Capability JSON definitions
 */
export interface ICapabilityRegistry {
  loadFromDisk(baseDir?: string): Promise<AgentCapabilityDefinition[]>;
  getCapability(agentName: string, platform?: Platform | 'CROSS_PLATFORM'): AgentCapabilityDefinition | undefined;
  getAllCapabilities(): AgentCapabilityDefinition[];
  validateCapability(def: Partial<AgentCapabilityDefinition>): { isValid: boolean; errors: string[] };
}

/**
 * Registry interface for runtime Specialist Agent instances
 */
export interface ISpecialistRegistry {
  registerAgent(agent: ISpecialistAgent): void;
  getAgent(agentName: string): ISpecialistAgent | undefined;
  getAllAgents(): ISpecialistAgent[];
  getAgentsForOperation(operation: AgentOperation, platform?: Platform): ISpecialistAgent[];
}
