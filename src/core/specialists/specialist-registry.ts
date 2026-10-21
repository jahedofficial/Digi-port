import {
  AgentOperation,
  ISpecialistAgent,
} from '../interfaces/agent.interface';
import { IPlatformAdapter } from '../interfaces/adapter.interface';
import { Platform } from '../types/account';
import { ISpecialistRegistry } from './types';
import { AuditSpecialistAgent } from './audit-agent';
import { CampaignSpecialistAgent } from './campaign-agent';
import { TrackingSpecialistAgent } from './tracking-agent';
import { OptimizationSpecialistAgent } from './optimization-agent';
import { ReportingSpecialistAgent } from './reporting-agent';
import { CroSpecialistAgent } from './cro-agent';
import { MerchantCatalogSpecialistAgent } from './merchant-catalog-agent';
import { CreativeSpecialistAgent } from './creative-agent';

/**
 * Central Runtime Registry for Specialist Agents
 */
export class SpecialistRegistry implements ISpecialistRegistry {
  private readonly agents: Map<string, ISpecialistAgent> = new Map();

  public registerAgent(agent: ISpecialistAgent): void {
    const capabilities = agent.getCapabilities();
    this.agents.set(capabilities.agentName.toLowerCase(), agent);
  }

  public getAgent(agentName: string): ISpecialistAgent | undefined {
    return this.agents.get(agentName.toLowerCase());
  }

  public getAllAgents(): ISpecialistAgent[] {
    return Array.from(this.agents.values());
  }

  public getAgentsForOperation(
    operation: AgentOperation,
    platform?: Platform
  ): ISpecialistAgent[] {
    return Array.from(this.agents.values()).filter((agent) => {
      const caps = agent.getCapabilities();
      const supportsOp = caps.supportedOperations.includes(operation);
      if (!supportsOp) return false;
      if (!platform) return true;
      return caps.supportedPlatforms.includes(platform);
    });
  }

  /**
   * Factory method to create and register all 8 production specialist agents.
   */
  public static createDefaultRoster(
    adapters?: Map<Platform, IPlatformAdapter>
  ): SpecialistRegistry {
    const registry = new SpecialistRegistry();

    registry.registerAgent(new AuditSpecialistAgent(adapters));
    registry.registerAgent(new CampaignSpecialistAgent(adapters));
    registry.registerAgent(new TrackingSpecialistAgent(adapters));
    registry.registerAgent(new OptimizationSpecialistAgent(adapters));
    registry.registerAgent(new ReportingSpecialistAgent(adapters));
    registry.registerAgent(new CroSpecialistAgent(adapters));
    registry.registerAgent(new MerchantCatalogSpecialistAgent(adapters));
    registry.registerAgent(new CreativeSpecialistAgent(adapters));

    return registry;
  }
}
