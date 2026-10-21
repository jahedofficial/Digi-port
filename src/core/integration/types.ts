import { ClientContext, ExecutionPlan } from '../interfaces/agent.interface';
import { Platform } from '../types/account';
import { PlatformConnectionStatus } from '../interfaces/adapter.interface';
import { DecisionEvaluationResult } from '../decision/types';
import { RiskAssessmentResult } from '../risk/types';
import { WorkflowExecutionResult } from '../workflow/types';
import { ReportDocument, ReportType } from '../reporting/types';
import { LearningRecommendation, ValidatedExecutionOutcome } from '../learning/types';
import { ScheduledJob, SystemEventTriggerPayload } from '../scheduling/types';
import { SystemState, SystemHealthReport } from '../runtime/types';

export interface ExecuteObjectiveOptions {
  autoApproveHighRisk?: boolean;
  reviewerId?: string;
  skipLearningIngestion?: boolean;
}

export interface IntegratedExecutionResult {
  success: boolean;
  plan: ExecutionPlan;
  workflowResult?: WorkflowExecutionResult;
  riskAssessment: RiskAssessmentResult;
  decisionResult?: DecisionEvaluationResult;
  affectedEntities: {
    platform: Platform;
    entityType: string;
    entityId: string;
    actionTaken: string;
  }[];
  learningRecommendations: LearningRecommendation[];
  summaryBangla: string;
  summaryEnglish: string;
  durationMs: number;
  requiresHumanReview: boolean;
  actionItemId?: string;
}

export interface AuditReportOptions {
  dateRange?: { startDate: string; endDate: string };
  exportPdf?: boolean;
  exportDocx?: boolean;
  reportType?: ReportType;
}

export interface OmnichannelAuditResult {
  success: boolean;
  clientId: string;
  reportDocument: ReportDocument;
  markdownContent: string;
  telegramSummary: string;
  emailHtml: string;
  pdfBuffer?: Buffer;
  docxBuffer?: Buffer;
  healthScore: number;
  totalAuditedCampaigns: number;
  learningRecommendations: LearningRecommendation[];
}

export interface SystemStatusOverview {
  state: SystemState;
  uptimeSeconds: number;
  activePlatforms: Platform[];
  platformStatuses: Record<string, PlatformConnectionStatus>;
  specialistCount: number;
  templatesCount: number;
  playbooksCount: number;
  knowledgeCount: number;
  schedulesCount: number;
  learningOutcomesCount: number;
}
