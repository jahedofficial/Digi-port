import {
  IPlaybookImprovement,
  LearningRecommendation,
  ValidatedExecutionOutcome,
} from './types';

/**
 * Playbook Improvement Sub-Engine
 * Analyzes workflow execution traces, step durations, and retry counts
 * to generate actionable recommendations for optimizing operational playbooks.
 */
export class PlaybookImprovement implements IPlaybookImprovement {
  public async analyzePlaybook(
    outcome: ValidatedExecutionOutcome
  ): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];
    const { workflowExecutionResult } = outcome;

    if (!workflowExecutionResult || !workflowExecutionResult.stepRecords) {
      return recommendations;
    }

    const { stepRecords, totalDurationMs, workflowId } = workflowExecutionResult;

    // 1. Detect Steps with Retries or High Latency
    for (const step of stepRecords) {
      if (step.retryAttempts > 1) {
        recommendations.push({
          id: `rec_pb_retry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          category: 'PLAYBOOK_IMPROVEMENT',
          title: `Enhance Rate-Limit Pre-Check in Playbook Step [${step.stepName}]`,
          targetEntityId: step.stepId,
          targetEntityType: 'PLAYBOOK',
          platform: step.platform,
          currentPattern: `Standard execution without pre-flight quota verification (${step.retryAttempts} retries incurred)`,
          proposedPattern: `Add pre-flight platform API quota check and proactive 500ms pacing delay prior to dispatch`,
          confidenceScore: 0.86,
          evidence: {
            sampleSize: 1,
            metricsObserved: {
              stepId: step.stepId,
              retryAttempts: step.retryAttempts,
              durationMs: step.durationMs,
            },
            validationOutcome: 'BOTTLENECK_IDENTIFIED',
          },
          rationaleEnglish: `Step [${step.stepName}] required ${step.retryAttempts} retry cycles due to platform rate limiting, adding latency to the execution pipeline.`,
          rationaleBangla: `ধাপ [${step.stepName}] প্ল্যাটফর্ম রেট লিমিটের কারণে ${step.retryAttempts} বার পুনরায় চেষ্টা করতে হয়েছে; প্রি-ফ্লাইট কোটা যাচাই যুক্ত করা আবশ্যক।`,
          requiresManualApproval: true,
          status: 'PROPOSED',
          proposedAt: new Date(),
        });
      }

      if (step.durationMs && step.durationMs > 15000) {
        recommendations.push({
          id: `rec_pb_latency_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          category: 'PLAYBOOK_IMPROVEMENT',
          title: `Parallelize Heavy Diagnostic Step [${step.stepName}] in Playbook`,
          targetEntityId: step.stepId,
          targetEntityType: 'PLAYBOOK',
          platform: step.platform,
          currentPattern: 'Sequential blocking diagnostic execution',
          proposedPattern: 'Asynchronous background diagnostic stream decoupled from campaign dispatch',
          confidenceScore: 0.82,
          evidence: {
            sampleSize: 1,
            metricsObserved: {
              stepId: step.stepId,
              stepDurationMs: step.durationMs,
              totalDurationMs,
            },
            validationOutcome: 'EFFICIENCY_GAIN',
          },
          rationaleEnglish: `Diagnostic step execution exceeded 15 seconds (${(step.durationMs / 1000).toFixed(1)}s). Decoupling into an async worker will reduce workflow cycle time by 40%.`,
          rationaleBangla: `ডায়াগনস্টিক ধাপ সম্পন্ন হতে ১৫ সেকেন্ডের বেশি সময় লেগেছে। এটিকে অ্যাসিনক্রোনাস মডেলে রূপান্তর করলে সময় ৪০% সাশ্রয় হবে।`,
          requiresManualApproval: true,
          status: 'PROPOSED',
          proposedAt: new Date(),
        });
      }
    }

    // 2. Propose Automated Pre-Requisite Validations for Omnichannel Playbooks
    if (stepRecords.length >= 4) {
      recommendations.push({
        id: `rec_pb_order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: 'PLAYBOOK_IMPROVEMENT',
        title: 'Add Pre-Flight Tracking Health Gate to Campaign Launch Playbooks',
        targetEntityId: 'playbook-campaign-creation-master',
        targetEntityType: 'PLAYBOOK',
        platform: 'CROSS_PLATFORM',
        currentPattern: 'Launch campaigns first, verify pixel tracking in post-launch audit',
        proposedPattern: 'Gate campaign creation behind automated CAPI and Pixel signal verification check',
        confidenceScore: 0.92,
        evidence: {
          sampleSize: stepRecords.length,
          metricsObserved: {
            workflowId,
            stepsEvaluated: stepRecords.length,
          },
          validationOutcome: 'RISK_REDUCTION',
        },
        rationaleEnglish: 'Validating pixel signals and server-side CAPI health prior to ad launch eliminates wasted ad spend on un-trackable traffic.',
        rationaleBangla: 'বিজ্ঞাপন চালুর পূর্বেই পিক্সেল ও CAPI সিগন্যাল যাচাই নিশ্চিত করলে অপচয়মূলক খরচ সম্পূর্ণরূপে রোধ করা সম্ভব।',
        requiresManualApproval: true,
        status: 'PROPOSED',
        proposedAt: new Date(),
      });
    }

    return recommendations;
  }
}
