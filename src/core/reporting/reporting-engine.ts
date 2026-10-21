import { UnifiedReportMetric } from '../types/metric';
import { ActionableRecommendation } from '../decision/types';
import { DocxGenerator } from './docx-generator';
import { EmailFormatter } from './email-formatter';
import { ExecutiveSummaryGenerator } from './executive-summary-generator';
import { MarkdownGenerator } from './markdown-generator';
import { PdfGenerator } from './pdf-generator';
import { ReportBuilder } from './report-builder';
import { ReportScorer } from './report-scorer';
import { TelegramFormatter } from './telegram-formatter';
import { ReportTemplateEngine } from './template-engine';
import {
  IDocxGenerator,
  IEmailFormatter,
  IMarkdownGenerator,
  IPdfGenerator,
  IReportingEngine,
  ITelegramFormatter,
  ReportDocument,
  ReportType,
} from './types';

/**
 * Enterprise Reporting Engine (Contract 9 Implementation)
 * Multi-format publishing engine delivering reports in PDF, DOCX, Markdown,
 * HTML Email, and Telegram Alert formats across 10 deterministic audit/performance templates.
 */
export class ReportingEngine implements IReportingEngine {
  private templateEngine: ReportTemplateEngine;
  private builder: ReportBuilder;
  private pdfGenerator: IPdfGenerator;
  private docxGenerator: IDocxGenerator;
  private markdownGenerator: IMarkdownGenerator;
  private telegramFormatter: ITelegramFormatter;
  private emailFormatter: IEmailFormatter;

  constructor(options?: {
    templateEngine?: ReportTemplateEngine;
    builder?: ReportBuilder;
    pdfGenerator?: IPdfGenerator;
    docxGenerator?: IDocxGenerator;
    markdownGenerator?: IMarkdownGenerator;
    telegramFormatter?: ITelegramFormatter;
    emailFormatter?: IEmailFormatter;
  }) {
    this.templateEngine = options?.templateEngine ?? new ReportTemplateEngine();
    this.builder =
      options?.builder ??
      new ReportBuilder(
        new ReportScorer(),
        new ExecutiveSummaryGenerator(),
        this.templateEngine
      );
    this.pdfGenerator = options?.pdfGenerator ?? new PdfGenerator();
    this.docxGenerator = options?.docxGenerator ?? new DocxGenerator();
    this.markdownGenerator = options?.markdownGenerator ?? new MarkdownGenerator();
    this.telegramFormatter = options?.telegramFormatter ?? new TelegramFormatter();
    this.emailFormatter = options?.emailFormatter ?? new EmailFormatter();
  }

  /**
   * Generates a unified cross-platform performance summary document (Contract 9 core requirement)
   */
  public async generatePerformanceSummary(
    metrics: UnifiedReportMetric[]
  ): Promise<ReportDocument> {
    const clientId = metrics[0]?.entityId ? `client_${metrics[0].entityId.substring(0, 8)}` : 'client_omnichannel';
    return this.buildReport('CROSS_PLATFORM_PERFORMANCE', clientId, metrics);
  }

  /**
   * Builds any of the 10 supported report types with full sections, bilingual summaries, and action plans
   */
  public async buildReport(
    reportType: ReportType,
    clientId: string,
    metrics: UnifiedReportMetric[],
    dateRange?: { startDate: string; endDate: string },
    recommendations?: ActionableRecommendation[]
  ): Promise<ReportDocument> {
    return this.builder.buildReport({
      reportType,
      clientId,
      metrics,
      dateRange,
      recommendations,
    });
  }

  /**
   * Export report document as high-resolution PDF Buffer (Contract 9)
   */
  public async exportPdf(report: ReportDocument): Promise<Buffer> {
    return this.pdfGenerator.generatePdf(report);
  }

  /**
   * Export report document as Word (.docx) Buffer (Contract 9)
   */
  public async exportDocx(report: ReportDocument): Promise<Buffer> {
    return this.docxGenerator.generateDocx(report);
  }

  /**
   * Export report document as formatted GitHub Markdown
   */
  public exportMarkdown(report: ReportDocument): string {
    return this.markdownGenerator.generateMarkdown(report);
  }

  /**
   * Format a high-priority operational alert for Telegram (Contract 9)
   */
  public formatTelegramAlert(
    title: string,
    metrics: Record<string, string | number>
  ): string {
    return this.telegramFormatter.formatAlert(title, metrics);
  }

  /**
   * Format a concise executive report summary for Telegram dispatch (Contract 9)
   */
  public formatTelegramReport(report: ReportDocument): string {
    return this.telegramFormatter.formatReportSummary(report);
  }

  /**
   * Format report document as a responsive HTML email
   */
  public formatEmail(report: ReportDocument): string {
    return this.emailFormatter.formatEmailHtml(report);
  }

  /**
   * Access the underlying template engine
   */
  public getTemplateEngine(): ReportTemplateEngine {
    return this.templateEngine;
  }
}
