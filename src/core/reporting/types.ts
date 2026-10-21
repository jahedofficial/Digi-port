import { Platform } from '../types/account';
import { UnifiedReportMetric } from '../types/metric';
import { ActionableRecommendation } from '../decision/types';

/**
 * The 10 Supported Report Types (Phase 12 Blueprint compliance)
 */
export type ReportType =
  | 'GOOGLE_ADS_AUDIT'
  | 'META_ADS_AUDIT'
  | 'TIKTOK_ADS_AUDIT'
  | 'CAMPAIGN_PERFORMANCE'
  | 'CROSS_PLATFORM_PERFORMANCE'
  | 'CRO_AUDIT'
  | 'TRACKING_AUDIT'
  | 'MERCHANT_CATALOG_AUDIT'
  | 'OPTIMIZATION_REPORT'
  | 'EXECUTIVE_REPORT';

export const VALID_REPORT_TYPES: readonly ReportType[] = [
  'GOOGLE_ADS_AUDIT',
  'META_ADS_AUDIT',
  'TIKTOK_ADS_AUDIT',
  'CAMPAIGN_PERFORMANCE',
  'CROSS_PLATFORM_PERFORMANCE',
  'CRO_AUDIT',
  'TRACKING_AUDIT',
  'MERCHANT_CATALOG_AUDIT',
  'OPTIMIZATION_REPORT',
  'EXECUTIVE_REPORT',
] as const;

/**
 * Report Template Definition (JSON schema in assets/report-templates/)
 */
export interface ReportTemplateDefinition {
  $schema?: string;
  id: string;
  title: string;
  reportType: ReportType;
  version: string;
  platform: Platform | 'CROSS_PLATFORM';
  sections: {
    executiveSummary: string;
    overallScore: string;
    findings: string;
    issues: string;
    recommendations: string;
    priorityMatrix: string;
    actionPlan: string;
    supportingEvidence: string;
    appendix: string;
  };
  requiredMetrics: string[];
  scoringDimensions: string[];
}

/**
 * Report Scorecard and Grade
 */
export interface ReportScorecard {
  overallScore: number; // 0 to 100
  grade: 'EXCELLENT' | 'GOOD' | 'ATTENTION_NEEDED' | 'CRITICAL';
  dimensionScores: Record<
    string,
    {
      score: number;
      weight: number;
      status: string;
      benchmark: number;
    }
  >;
}

/**
 * Detailed Diagnostic Finding
 */
export interface ReportFinding {
  id: string;
  category: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  description: string;
  metricObserved?: {
    name: string;
    value: string | number;
    benchmark?: string | number;
  };
  impactBangla: string;
  impactEnglish: string;
}

/**
 * Concrete Action Item in Action Plan
 */
export interface ReportActionItem {
  stepNumber: number;
  title: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  platform: Platform | 'CROSS_PLATFORM';
  action: string;
  expectedResult: string;
}

/**
 * Master Report Document (Contract 9 compliant)
 */
export interface ReportDocument {
  id: string;
  reportType: ReportType;
  title: string;
  clientId: string;
  generatedAt: Date;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  platforms: Platform[];
  scorecard: ReportScorecard;
  executiveSummaryBangla: string;
  executiveSummaryEnglish: string;
  findings: ReportFinding[];
  issues: string[];
  recommendations: ActionableRecommendation[] | string[];
  priorityMatrix: Array<{
    priority: string;
    items: string[];
  }>;
  actionPlan: ReportActionItem[];
  supportingEvidence: Record<string, unknown>;
  appendix: Record<string, unknown>;
}

/**
 * Sub-Engine Interfaces
 */

export interface IReportScorer {
  calculateScore(
    metrics: UnifiedReportMetric[],
    targetRoasFloor?: number,
    targetCpa?: number
  ): ReportScorecard;
}

export interface IExecutiveSummaryGenerator {
  generateSummary(
    reportType: ReportType,
    scorecard: ReportScorecard,
    metrics: UnifiedReportMetric[],
    findings: ReportFinding[],
    clientId: string
  ): { summaryBangla: string; summaryEnglish: string };
}

export interface IMarkdownGenerator {
  generateMarkdown(report: ReportDocument): string;
}

export interface IPdfGenerator {
  generatePdf(report: ReportDocument): Promise<Buffer>;
}

export interface IDocxGenerator {
  generateDocx(report: ReportDocument): Promise<Buffer>;
}

export interface ITelegramFormatter {
  formatAlert(title: string, metrics: Record<string, string | number>): string;
  formatReportSummary(report: ReportDocument): string;
}

export interface IEmailFormatter {
  formatEmailHtml(report: ReportDocument): string;
}

export interface IReportTemplateEngine {
  loadTemplates(dirPath?: string): Promise<ReportTemplateDefinition[]>;
  getTemplate(reportType: ReportType): ReportTemplateDefinition | undefined;
  validateTemplate(tpl: Partial<ReportTemplateDefinition>): { isValid: boolean; errors: string[] };
}

export interface IReportingEngine {
  generatePerformanceSummary(metrics: UnifiedReportMetric[]): Promise<ReportDocument>;
  buildReport(
    reportType: ReportType,
    clientId: string,
    metrics: UnifiedReportMetric[],
    dateRange?: { startDate: string; endDate: string },
    recommendations?: ActionableRecommendation[]
  ): Promise<ReportDocument>;
  exportPdf(report: ReportDocument): Promise<Buffer>;
  exportDocx(report: ReportDocument): Promise<Buffer>;
  exportMarkdown(report: ReportDocument): string;
  formatTelegramAlert(title: string, metrics: Record<string, string | number>): string;
  formatTelegramReport(report: ReportDocument): string;
  formatEmail(report: ReportDocument): string;
}
