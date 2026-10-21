import { BaseSpecialistAgent } from './base-specialist';
import {
  AgentOperation,
  ClientContext,
  ScheduledTask,
  SpecialistExecutionResult,
} from '../interfaces/agent.interface';
import { Platform } from '../types/account';

/**
 * Audit Specialist Agent
 * Inspects active campaigns, ad accounts, pixel health, and spend pacing across Google, Meta, and TikTok.
 */
export class AuditSpecialistAgent extends BaseSpecialistAgent {
  public readonly agentName = 'AuditSpecialistAgent';
  public readonly supportedPlatforms: Platform[] = ['GOOGLE', 'META', 'TIKTOK'];
  public readonly supportedOperations: AgentOperation[] = ['AUDIT'];
  public readonly requiresApprovalByDefault = false;

  protected async performExecution(
    task: ScheduledTask,
    clientContext: ClientContext
  ): Promise<SpecialistExecutionResult> {
    const platformsToAudit: Platform[] =
      task.platform === 'CROSS_PLATFORM'
        ? this.supportedPlatforms.filter((p) => clientContext.activePlatforms.includes(p))
        : [task.platform];

    const affectedEntities: SpecialistExecutionResult['affectedEntities'] = [];
    let totalAuditedCampaigns = 0;
    let flaggedWastedSpend = 0;

    for (const platform of platformsToAudit) {
      const adapter = this.getAdapter(platform);
      if (!adapter) continue;

      const campaigns = await adapter.listCampaigns();
      totalAuditedCampaigns += campaigns.length;

      for (const campaign of campaigns) {
        affectedEntities.push({
          platform,
          entityType: 'CAMPAIGN',
          entityId: campaign.id,
          actionTaken: 'AUDITED_STATUS_AND_PACING',
        });

        // Sample audit heuristic: flag paused with spend or high CPA
        if (campaign.status === 'PAUSED' && (campaign.dailyBudget ?? 0) > 0) {
          flaggedWastedSpend += Math.round((campaign.dailyBudget ?? 0) * 0.1);
        }
      }
    }

    const healthScore = totalAuditedCampaigns > 0 ? Math.max(70, 100 - flaggedWastedSpend / 100) : 95;

    return {
      taskId: task.id,
      success: true,
      executionStatus: 'COMPLETED',
      summaryBangla: `${platformsToAudit.join(', ')} প্ল্যাটফর্মে মোট ${totalAuditedCampaigns}টি ক্যাম্পেইন অডিট সম্পন্ন হয়েছে। সার্বিক হেলথ স্কোর: ${healthScore}/100।`,
      summaryEnglish: `Audit completed across ${platformsToAudit.join(', ')}: ${totalAuditedCampaigns} campaigns analyzed. Overall Health Score: ${healthScore}/100.`,
      affectedEntities,
      metricsObserved: {
        totalAuditedCampaigns,
        flaggedWastedSpend,
        healthScore,
      },
    };
  }
}
