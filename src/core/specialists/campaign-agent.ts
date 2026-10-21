import { BaseSpecialistAgent } from './base-specialist';
import {
  AgentOperation,
  ClientContext,
  ScheduledTask,
  SpecialistExecutionResult,
} from '../interfaces/agent.interface';
import { Platform } from '../types/account';
import { CampaignObjective, UnifiedCampaignCreateInput } from '../types/campaign';

/**
 * Campaign Specialist Agent
 * Assembles, launches, pauses, and updates campaigns, adsets, and creatives following approved Playbooks.
 */
export class CampaignSpecialistAgent extends BaseSpecialistAgent {
  public readonly agentName = 'CampaignSpecialistAgent';
  public readonly supportedPlatforms: Platform[] = ['GOOGLE', 'META', 'TIKTOK'];
  public readonly supportedOperations: AgentOperation[] = ['LAUNCH', 'PAUSE'];
  public readonly requiresApprovalByDefault = true;

  protected async performExecution(
    task: ScheduledTask,
    clientContext: ClientContext
  ): Promise<SpecialistExecutionResult> {
    if (task.platform === 'CROSS_PLATFORM') {
      throw new Error('Campaign creation must target a specific concrete platform (GOOGLE, META, or TIKTOK).');
    }

    const adapter = this.getAdapter(task.platform);
    if (!adapter) {
      throw new Error(`Platform adapter not registered for '${task.platform}'.`);
    }

    // 1. Handle PAUSE operation
    if (task.operation === 'PAUSE') {
      let campaignId = task.parameters.campaignId as string;
      if (!campaignId) {
        const campaigns = await adapter.listCampaigns();
        campaignId = campaigns[0]?.id ?? 'camp_active_01';
      }
      await adapter.setCampaignStatus(campaignId, 'PAUSED');

      return {
        taskId: task.id,
        success: true,
        executionStatus: 'COMPLETED',
        summaryBangla: `${task.platform} প্ল্যাটফর্মে ক্যাম্পেইন [${campaignId}] সফলভাবে পজ (PAUSE) করা হয়েছে।`,
        summaryEnglish: `Successfully paused campaign [${campaignId}] on ${task.platform}.`,
        affectedEntities: [
          {
            platform: task.platform,
            entityType: 'CAMPAIGN',
            entityId: campaignId,
            actionTaken: 'SET_STATUS_PAUSED',
          },
        ],
      };
    }

    // 2. Handle LAUNCH operation
    const campaignName =
      (task.parameters.campaignName as string) ??
      `Auto_${clientContext.clientId}_${task.platform}_${Date.now()}`;
    const budgetAmount = task.estimatedBudget ?? (task.parameters.dailyBudget as number) ?? 100;

    const campaignType = (task.parameters.campaignType as string) ?? 'PERFORMANCE_MAX';
    const input: UnifiedCampaignCreateInput = {
      name: campaignName,
      platform: task.platform,
      objective: (task.parameters.objective as CampaignObjective) ?? 'SALES',
      status: 'ACTIVE',
      budgetStrategy: 'DAILY',
      dailyBudget: budgetAmount,
      metadata: {
        campaignType,
        workspaceId: clientContext.workspaceId ?? 'ws_default',
      },
    };

    const createdCampaign = await adapter.createCampaign(input);

    return {
      taskId: task.id,
      success: true,
      executionStatus: 'COMPLETED',
      summaryBangla: `${task.platform}-এ নতুন ক্যাম্পেইন [${createdCampaign.id}] ($${budgetAmount}/day) সফলভাবে তৈরি করা হয়েছে।`,
      summaryEnglish: `Successfully launched new campaign [${createdCampaign.id}] with $${budgetAmount}/day budget on ${task.platform}.`,
      affectedEntities: [
        {
          platform: task.platform,
          entityType: 'CAMPAIGN',
          entityId: createdCampaign.id,
          actionTaken: 'CREATED_AND_ACTIVATED',
        },
      ],
      metricsObserved: {
        dailyBudget: budgetAmount,
        campaignType,
      },
    };
  }
}
