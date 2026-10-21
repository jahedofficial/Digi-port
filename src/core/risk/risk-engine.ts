import { ClientContext } from '../interfaces/agent.interface';
import { ClientMemoryProfile } from '../memory/types';
import { Platform } from '../types/account';
import {
  IBudgetProtector,
  IPolicyValidator,
  IRiskEngine,
  IRollbackPlanner,
  PolicyViolation,
  ProposedAction,
  RiskAssessmentResult,
  RiskLevel,
} from './types';
import { PolicyValidator } from './policy-validator';
import { BudgetProtector } from './budget-protector';
import { RollbackPlanner } from './rollback-planner';

/**
 * Enterprise Production Risk Engine
 * Assesses operational risk, validates advertising policies, protects client budget ceilings,
 * and generates deterministic rollback plans before any modifying operation is executed.
 */
export class RiskEngine implements IRiskEngine {
  private readonly policyValidator: IPolicyValidator;
  private readonly budgetProtector: IBudgetProtector;
  private readonly rollbackPlanner: IRollbackPlanner;

  constructor(options?: {
    policyValidator?: IPolicyValidator;
    budgetProtector?: IBudgetProtector;
    rollbackPlanner?: IRollbackPlanner;
  }) {
    this.policyValidator = options?.policyValidator ?? new PolicyValidator();
    this.budgetProtector = options?.budgetProtector ?? new BudgetProtector();
    this.rollbackPlanner = options?.rollbackPlanner ?? new RollbackPlanner();
  }

  public async validatePolicy(
    creativeContent: {
      headlines?: string[];
      descriptions?: string[];
      bodyText?: string;
      targetUrl?: string;
    },
    platform: Platform | 'CROSS_PLATFORM'
  ): Promise<{ isValid: boolean; violations: PolicyViolation[] }> {
    return this.policyValidator.validateContent(creativeContent, platform);
  }

  public async assessRisk(
    proposedAction: ProposedAction,
    clientContext: ClientContext,
    memoryProfile?: ClientMemoryProfile
  ): Promise<RiskAssessmentResult> {
    const approvalReasons: string[] = [];
    let calculatedRiskScore = 0;

    // 1. Validate Creative Policy Compliance
    let policyViolations: PolicyViolation[] = [];
    if (proposedAction.creativeContent) {
      const policyCheck = this.policyValidator.validateContent(
        proposedAction.creativeContent,
        proposedAction.platform
      );
      policyViolations = policyCheck.violations;

      for (const pv of policyViolations) {
        if (pv.category === 'PROHIBITED') {
          calculatedRiskScore += 50;
          approvalReasons.push(`Prohibited policy violation detected: ${pv.message}`);
        } else if (pv.category === 'SPECIAL_AD_CATEGORY') {
          calculatedRiskScore += 30;
          approvalReasons.push(`Special Ad Category declaration required: ${pv.message}`);
        } else {
          calculatedRiskScore += 15;
        }
      }
    }

    // 2. Validate Budget Guardrails
    let budgetViolations: RiskAssessmentResult['budgetViolations'] = [];
    if (proposedAction.requestedBudget !== undefined) {
      const cur = proposedAction.currentBudget ?? 100;
      const cap =
        memoryProfile?.businessGoals?.monthlyBudgetCeiling ??
        clientContext.monthlyBudgetCap ??
        10000;

      const budgetCheck = this.budgetProtector.validateBudget(
        cur,
        proposedAction.requestedBudget,
        cap
      );
      budgetViolations = budgetCheck.violations;

      for (const bv of budgetViolations) {
        if (bv.type === 'DAILY_SCALING_EXCEEDED') {
          calculatedRiskScore += 30;
          approvalReasons.push(bv.message);
        } else if (bv.type === 'MONTHLY_CAP_EXCEEDED') {
          calculatedRiskScore += 40;
          approvalReasons.push(bv.message);
        } else if (bv.type === 'ZERO_BUDGET_DISALLOWED') {
          calculatedRiskScore += 50;
          approvalReasons.push(bv.message);
        }
      }
    }

    // 3. High-Risk Action: Pausing Campaign with High ROAS
    const highRoasThreshold = memoryProfile?.approvalRules?.highRiskRoasProtectionThreshold ?? 3.0;
    const observedRoas = proposedAction.observedRoas ?? 0;
    if (
      (proposedAction.operation === 'PAUSE' || proposedAction.operation === 'SET_STATUS') &&
      observedRoas >= highRoasThreshold
    ) {
      calculatedRiskScore += 35;
      approvalReasons.push(
        `High-Risk Operation: Pausing campaign with high ROAS (${observedRoas}x >= ${highRoasThreshold}x protection threshold).`
      );
    }

    // 4. Client Memory Auto-Approve Threshold Check
    const clientAutoApproveLimit = memoryProfile?.approvalRules?.autoApproveBudgetThreshold ?? 200;
    if (
      proposedAction.requestedBudget !== undefined &&
      proposedAction.currentBudget !== undefined
    ) {
      const delta = Math.abs(proposedAction.requestedBudget - proposedAction.currentBudget);
      if (delta > clientAutoApproveLimit) {
        calculatedRiskScore += 20;
        approvalReasons.push(
          `Budget change delta ($${delta}) exceeds client auto-approve limit ($${clientAutoApproveLimit}).`
        );
      }
    }

    // 5. Final Risk Score & Risk Level Calculation
    const riskScore = Math.min(100, calculatedRiskScore);
    let riskLevel: RiskLevel = 'LOW';
    if (riskScore >= 76) {
      riskLevel = 'CRITICAL';
    } else if (riskScore >= 51) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 26) {
      riskLevel = 'MEDIUM';
    }

    const requiresApproval =
      approvalReasons.length > 0 ||
      riskScore > 35 ||
      policyViolations.length > 0 ||
      budgetViolations.length > 0;

    const canAutoExecute = !requiresApproval && riskScore <= 35;

    // 6. Generate Deterministic Rollback Plan
    const rollbackPlan = this.rollbackPlanner.generateRollbackPlan(proposedAction);

    // 7. Bilingual Summary
    const summaryBangla = `ঝুঁকি মূল্যায়ন ফলাফল: স্কোর ${riskScore}/100 [লেভেল: ${riskLevel}]। স্বয়ংক্রিয় কার্যকরকরণ: ${canAutoExecute ? 'অনুমোদিত' : 'স্থগিত (অনুমোদন প্রয়োজন)'}। ${approvalReasons.length > 0 ? `কারণ: ${approvalReasons.join('; ')}` : 'কোনো ঝুঁকি চিহ্নিত হয়নি।'}`;
    const summaryEnglish = `Risk assessment completed: Score ${riskScore}/100 [Level: ${riskLevel}]. Auto-execution: ${canAutoExecute ? 'ALLOWED' : 'BLOCKED (Approval Required)'}. ${approvalReasons.length > 0 ? `Triggers: ${approvalReasons.join('; ')}` : 'No critical risks detected.'}`;

    return {
      assessmentId: `risk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
      clientId: clientContext.clientId,
      targetTaskId: proposedAction.taskId,
      riskScore,
      riskLevel,
      canAutoExecute,
      requiresApproval,
      approvalReasons,
      policyViolations,
      budgetViolations,
      rollbackPlan,
      summaryBangla,
      summaryEnglish,
    };
  }
}
