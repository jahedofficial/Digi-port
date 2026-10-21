import { describe, it, before } from 'node:test';
import * as assert from 'node:assert';
import {
  ReportingEngine,
  ReportTemplateEngine,
  ReportScorer,
  ExecutiveSummaryGenerator,
  MarkdownGenerator,
  PdfGenerator,
  DocxGenerator,
  TelegramFormatter,
  EmailFormatter,
  ReportBuilder,
  ReportType,
  VALID_REPORT_TYPES,
  UnifiedReportMetric,
} from '../src/core';

describe('Phase 12 — Reporting Engine Unit Tests', () => {
  const sampleMetrics: UnifiedReportMetric[] = [
    {
      entityId: 'camp_google_search_01',
      entityType: 'CAMPAIGN',
      platform: 'GOOGLE',
      date: '2026-10-15',
      currency: 'USD',
      spend: 1200,
      impressions: 45000,
      clicks: 1800,
      conversions: 45,
      conversionValue: 4800,
      ctr: 4.0,
      cpc: 0.67,
      cpa: 26.67,
      roas: 4.0,
    },
    {
      entityId: 'camp_meta_advantage_01',
      entityType: 'CAMPAIGN',
      platform: 'META',
      date: '2026-10-15',
      currency: 'USD',
      spend: 1500,
      impressions: 80000,
      clicks: 1600,
      conversions: 35,
      conversionValue: 5250,
      ctr: 2.0,
      cpc: 0.94,
      cpa: 42.86,
      roas: 3.5,
    },
    {
      entityId: 'camp_tiktok_spark_01',
      entityType: 'CAMPAIGN',
      platform: 'TIKTOK',
      date: '2026-10-15',
      currency: 'USD',
      spend: 800,
      impressions: 60000,
      clicks: 900,
      conversions: 20,
      conversionValue: 2400,
      ctr: 1.5,
      cpc: 0.89,
      cpa: 40.0,
      roas: 3.0,
      videoHookRate: 0.28,
    },
  ];

  // --------------------------------------------------------------------------
  // 1. Report Template Engine & Blueprint Schemas
  // --------------------------------------------------------------------------
  describe('1. ReportTemplateEngine', () => {
    const templateEngine = new ReportTemplateEngine();

    before(async () => {
      await templateEngine.loadTemplates();
    });

    it('should register and validate all 10 core report templates', () => {
      const templates = templateEngine.listTemplates();
      assert.strictEqual(templates.length, 10);

      const registeredTypes = templates.map((t) => t.reportType);
      for (const expectedType of VALID_REPORT_TYPES) {
        assert.ok(
          registeredTypes.includes(expectedType),
          `Missing template for report type: ${expectedType}`
        );
      }
    });

    it('each of the 10 templates must define all 9 required sections', () => {
      const requiredSections = [
        'executiveSummary',
        'overallScore',
        'findings',
        'issues',
        'recommendations',
        'priorityMatrix',
        'actionPlan',
        'supportingEvidence',
        'appendix',
      ];

      for (const tpl of templateEngine.listTemplates()) {
        assert.ok(tpl.sections, `Template ${tpl.id} is missing sections object`);
        for (const section of requiredSections) {
          assert.ok(
            typeof (tpl.sections as Record<string, string>)[section] === 'string',
            `Template ${tpl.id} missing required section: ${section}`
          );
          assert.ok(
            (tpl.sections as Record<string, string>)[section].length > 0,
            `Template ${tpl.id} section ${section} is empty`
          );
        }
      }
    });

    it('validateTemplate should detect missing required sections or fields', () => {
      const invalid = templateEngine.validateTemplate({
        id: 'tpl_incomplete',
        title: 'Incomplete Template',
        reportType: 'GOOGLE_ADS_AUDIT',
        platform: 'GOOGLE',
        sections: {
          executiveSummary: 'Brief',
          // Missing remaining 8 sections
        } as any,
      });

      assert.strictEqual(invalid.isValid, false);
      assert.ok(invalid.errors.length > 0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Deterministic Report Scorer
  // --------------------------------------------------------------------------
  describe('2. ReportScorer', () => {
    const scorer = new ReportScorer();

    it('should calculate overall health score and grade accurately for profitable metrics', () => {
      const scorecard = scorer.calculateScore(sampleMetrics, 3.0, 40.0);

      assert.ok(scorecard.overallScore >= 70 && scorecard.overallScore <= 100);
      assert.ok(['EXCELLENT', 'GOOD'].includes(scorecard.grade));
      assert.ok(scorecard.dimensionScores.roasHealth);
      assert.ok(scorecard.dimensionScores.cpaEfficiency);
      assert.ok(scorecard.dimensionScores.creativeFreshness);
      assert.ok(scorecard.dimensionScores.trackingQuality);
    });

    it('should drop health score and grade when ROAS collapses and CPA is high', () => {
      const poorMetrics: UnifiedReportMetric[] = [
        {
          entityId: 'camp_poor_01',
          entityType: 'CAMPAIGN',
          platform: 'META',
          date: '2026-10-15',
          currency: 'USD',
          spend: 3000,
          impressions: 50000,
          clicks: 500,
          conversions: 10,
          conversionValue: 1500, // ROAS 0.5x, CPA $300
          ctr: 1.0,
          cpc: 6.0,
          cpa: 300.0,
          roas: 0.5,
        },
      ];

      const scorecard = scorer.calculateScore(poorMetrics, 3.0, 40.0);
      assert.ok(scorecard.overallScore < 60);
      assert.ok(['ATTENTION_NEEDED', 'CRITICAL'].includes(scorecard.grade));
      assert.strictEqual(scorecard.dimensionScores.roasHealth.status, 'NEEDS_OPTIMIZATION');
      assert.strictEqual(scorecard.dimensionScores.cpaEfficiency.status, 'HIGH_CPA');
    });

    it('should return a neutral baseline score when empty metrics array provided', () => {
      const scorecard = scorer.calculateScore([]);
      assert.strictEqual(scorecard.overallScore, 50);
      assert.strictEqual(scorecard.grade, 'ATTENTION_NEEDED');
      assert.strictEqual(scorecard.dimensionScores.roasHealth.status, 'NO_DATA');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Bilingual Executive Summary Generator
  // --------------------------------------------------------------------------
  describe('3. ExecutiveSummaryGenerator', () => {
    const summaryGen = new ExecutiveSummaryGenerator();
    const scorer = new ReportScorer();

    it('should produce professional bilingual (English and Bengali) summaries with metrics', () => {
      const scorecard = scorer.calculateScore(sampleMetrics);
      const { summaryBangla, summaryEnglish } = summaryGen.generateSummary(
        'CROSS_PLATFORM_PERFORMANCE',
        scorecard,
        sampleMetrics,
        [],
        'client_global_01'
      );

      // Verify English summary
      assert.ok(summaryEnglish.includes('client_global_01'));
      assert.ok(summaryEnglish.includes('CROSS PLATFORM PERFORMANCE'));
      assert.ok(summaryEnglish.includes('Health Score'));
      assert.ok(summaryEnglish.includes('Total Spend: $3,500'));
      assert.ok(summaryEnglish.includes('Blended ROAS: 3.56x'));

      // Verify Bengali summary
      assert.ok(summaryBangla.includes('client_global_01'));
      assert.ok(summaryBangla.includes('সামগ্রিক স্কোর'));
      assert.ok(summaryBangla.includes('মোট খরচ: $3,500'));
      assert.ok(summaryBangla.includes('ব্লেন্ডেড ROAS: 3.56x'));
    });

    it('should highlight critical findings alert in both languages when present', () => {
      const scorecard = scorer.calculateScore(sampleMetrics);
      const criticalFindings = [
        {
          id: 'fnd_01',
          category: 'RISK',
          title: 'Tracking Pixel Disconnected',
          severity: 'CRITICAL' as const,
          description: 'CAPI dropped 100% events',
          impactBangla: 'কনভার্সন ট্র্যাকিং অচল',
          impactEnglish: 'Conversion tracking halted',
        },
      ];

      const { summaryBangla, summaryEnglish } = summaryGen.generateSummary(
        'TRACKING_AUDIT',
        scorecard,
        sampleMetrics,
        criticalFindings,
        'client_ecom_02'
      );

      assert.ok(summaryEnglish.includes('Alert: 1 critical issues identified'));
      assert.ok(summaryBangla.includes('সতর্কতা: 1টি সংকটজনক সমস্যা চিহ্নিত হয়েছে'));
    });
  });

  // --------------------------------------------------------------------------
  // 4. Report Builder & Document Assembly
  // --------------------------------------------------------------------------
  describe('4. ReportBuilder', () => {
    const builder = new ReportBuilder();

    it('should assemble a complete ReportDocument with all Blueprint sections', () => {
      const report = builder.buildReport({
        reportType: 'CROSS_PLATFORM_PERFORMANCE',
        clientId: 'client_enterprise_99',
        metrics: sampleMetrics,
      });

      assert.ok(report.id.startsWith('rep_cross_platform_performance_'));
      assert.strictEqual(report.reportType, 'CROSS_PLATFORM_PERFORMANCE');
      assert.strictEqual(report.clientId, 'client_enterprise_99');
      assert.ok(report.scorecard.overallScore > 0);
      assert.ok(report.executiveSummaryBangla.length > 0);
      assert.ok(report.executiveSummaryEnglish.length > 0);
      assert.ok(Array.isArray(report.findings));
      assert.ok(Array.isArray(report.issues));
      assert.ok(Array.isArray(report.recommendations));
      assert.strictEqual(report.priorityMatrix.length, 4); // P0, P1, P2, P3
      assert.ok(report.actionPlan.length > 0);
      assert.ok(report.supportingEvidence.aggregatedMetrics);
      assert.ok(report.appendix.complianceFramework);
    });

    it('should synthesize automated diagnostic findings when CPA or ROAS exceed thresholds', () => {
      const badMetrics: UnifiedReportMetric[] = [
        {
          entityId: 'camp_bad',
          entityType: 'CAMPAIGN',
          platform: 'META',
          date: '2026-10-15',
          currency: 'USD',
          spend: 2000,
          impressions: 40000,
          clicks: 600,
          conversions: 10,
          conversionValue: 1800, // ROAS 0.9x (floor 3.0), CPA $200 (target 40)
          ctr: 1.5,
          cpc: 3.33,
          cpa: 200,
          roas: 0.9,
        },
      ];

      const report = builder.buildReport({
        reportType: 'META_ADS_AUDIT',
        clientId: 'client_audit_01',
        metrics: badMetrics,
        targetRoasFloor: 3.0,
        targetCpa: 40.0,
      });

      assert.ok(report.findings.length >= 2);
      const roasFinding = report.findings.find((f) => f.category === 'PERFORMANCE_EFFICIENCY');
      assert.ok(roasFinding);
      assert.strictEqual(roasFinding.severity, 'CRITICAL');

      const cpaFinding = report.findings.find((f) => f.category === 'BUDGET_EFFICIENCY');
      assert.ok(cpaFinding);
      assert.strictEqual(cpaFinding.severity, 'CRITICAL');
    });
  });

  // --------------------------------------------------------------------------
  // 5. Markdown Generator
  // --------------------------------------------------------------------------
  describe('5. MarkdownGenerator', () => {
    const builder = new ReportBuilder();
    const mdGen = new MarkdownGenerator();

    it('should render rich GitHub-flavored markdown with structured tables and sections', () => {
      const report = builder.buildReport({
        reportType: 'GOOGLE_ADS_AUDIT',
        clientId: 'client_gads_01',
        metrics: sampleMetrics,
      });

      const md = mdGen.generateMarkdown(report);

      assert.ok(md.includes('# Google Ads Performance & Health Audit Report'));
      assert.ok(md.includes('## 1. Executive Summary & Health Scorecard'));
      assert.ok(md.includes('### English Executive Brief'));
      assert.ok(md.includes('### বাংলা সারসংক্ষেপ'));
      assert.ok(md.includes('| Dimension | Score | Weight | Status | Target Benchmark |'));
      assert.ok(md.includes('## 2. Key Diagnostic Findings'));
      assert.ok(md.includes('## 3. Critical Issues & Spend Inefficiencies'));
      assert.ok(md.includes('## 4. Prioritized Recommendations'));
      assert.ok(md.includes('## 5. Strategic Priority Matrix'));
      assert.ok(md.includes('## 6. Implementation Action Plan'));
      assert.ok(md.includes('## 7. Supporting Evidence & Metric Snapshots'));
      assert.ok(md.includes('## 8. Appendix & Technical Disclosures'));
    });
  });

  // --------------------------------------------------------------------------
  // 6. PDF Generator
  // --------------------------------------------------------------------------
  describe('6. PdfGenerator (PDFKit)', () => {
    const builder = new ReportBuilder();
    const pdfGen = new PdfGenerator();

    it('should generate a valid PDF Buffer with %PDF magic header', async () => {
      const report = builder.buildReport({
        reportType: 'CAMPAIGN_PERFORMANCE',
        clientId: 'client_pdf_test',
        metrics: sampleMetrics,
      });

      const pdfBuffer = await pdfGen.generatePdf(report);

      assert.ok(Buffer.isBuffer(pdfBuffer));
      assert.ok(pdfBuffer.length > 500, `PDF buffer too small: ${pdfBuffer.length} bytes`);
      // PDF specification magic header check
      const magic = pdfBuffer.subarray(0, 5).toString('ascii');
      assert.strictEqual(magic, '%PDF-');
    });
  });

  // --------------------------------------------------------------------------
  // 7. DOCX Generator
  // --------------------------------------------------------------------------
  describe('7. DocxGenerator (docx)', () => {
    const builder = new ReportBuilder();
    const docxGen = new DocxGenerator();

    it('should generate a valid DOCX Buffer with PK zip signature', async () => {
      const report = builder.buildReport({
        reportType: 'EXECUTIVE_REPORT',
        clientId: 'client_docx_test',
        metrics: sampleMetrics,
      });

      const docxBuffer = await docxGen.generateDocx(report);

      assert.ok(Buffer.isBuffer(docxBuffer));
      assert.ok(docxBuffer.length > 1000, `DOCX buffer too small: ${docxBuffer.length} bytes`);
      // DOCX specification is a ZIP package starting with 'PK\x03\x04'
      const magic = docxBuffer.subarray(0, 2).toString('ascii');
      assert.strictEqual(magic, 'PK');
    });
  });

  // --------------------------------------------------------------------------
  // 8. Telegram Formatter
  // --------------------------------------------------------------------------
  describe('8. TelegramFormatter', () => {
    const formatter = new TelegramFormatter();
    const builder = new ReportBuilder();

    it('should format an operational alert in Telegram HTML format with emojis', () => {
      const alert = formatter.formatAlert('CPA Spike Detected on Meta', {
        currentCpa: '$52.40',
        targetCpa: '$35.00',
        excessSpend: '$450',
        campaign: 'Prospecting_Advantage_Plus',
      });

      assert.ok(alert.includes('🚨 <b>[DIGIPORT ALERT] CPA Spike Detected on Meta</b>'));
      assert.ok(alert.includes('🎯 <b>Current Cpa:</b> <code>$52.40</code>'));
      assert.ok(alert.includes('💵 <b>Excess Spend:</b> <code>$450</code>'));
      assert.ok(alert.includes('<i>Generated at:'));
    });

    it('should properly escape HTML special characters to prevent Telegram parse errors', () => {
      const alert = formatter.formatAlert('Ad Title with <script> & "symbols"', {
        metricValue: '< 50% & > 10%',
      });

      assert.ok(!alert.includes('<script>'));
      assert.ok(alert.includes('&lt;script&gt;'));
      assert.ok(alert.includes('&amp;'));
    });

    it('should format report summary for Telegram dispatch', () => {
      const report = builder.buildReport({
        reportType: 'OPTIMIZATION_REPORT',
        clientId: 'client_tg_01',
        metrics: sampleMetrics,
      });

      const summary = formatter.formatReportSummary(report);
      assert.ok(summary.includes('📊 <b>System Optimization &amp; Algorithmic Impact Summary</b>'));
      assert.ok(summary.includes('Client: <code>client_tg_01</code>'));
      assert.ok(summary.includes('Score: <b>'));
      assert.ok(summary.includes('Executive Summary:</b>'));
    });
  });

  // --------------------------------------------------------------------------
  // 9. Email Formatter
  // --------------------------------------------------------------------------
  describe('9. EmailFormatter', () => {
    const builder = new ReportBuilder();
    const emailFormatter = new EmailFormatter();

    it('should format responsive HTML email with inline CSS styles and tables', () => {
      const report = builder.buildReport({
        reportType: 'CRO_AUDIT',
        clientId: 'client_email_cro',
        metrics: sampleMetrics,
      });

      const html = emailFormatter.formatEmailHtml(report);

      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes('DIGIPORT AI OPERATING SYSTEM'));
      assert.ok(html.includes('Conversion Rate Optimization (CRO) & Funnel Friction Audit'));
      assert.ok(html.includes('Overall Account Health Score'));
      assert.ok(html.includes('1. Executive Brief'));
      assert.ok(html.includes('বাংলা সারসংক্ষেপ:'));
      assert.ok(html.includes('2. Health Dimension Breakdown'));
      assert.ok(html.includes('3. Key Diagnostic Findings'));
      assert.ok(html.includes('4. Recommended Implementation Action Plan'));
      assert.ok(html.includes('Generated automatically by <strong>DigiPort Universal Paid Media AI Operating System</strong>'));
    });
  });

  // --------------------------------------------------------------------------
  // 10. Master Reporting Engine & Contract 9 Compliance
  // --------------------------------------------------------------------------
  describe('10. ReportingEngine (Master Engine & Contract 9)', () => {
    const engine = new ReportingEngine();

    it('generatePerformanceSummary should produce a unified report document', async () => {
      const report = await engine.generatePerformanceSummary(sampleMetrics);

      assert.ok(report);
      assert.strictEqual(report.reportType, 'CROSS_PLATFORM_PERFORMANCE');
      assert.ok(report.scorecard.overallScore > 0);
      assert.ok(report.platforms.includes('GOOGLE'));
      assert.ok(report.platforms.includes('META'));
      assert.ok(report.platforms.includes('TIKTOK'));
    });

    it('exportPdf should produce a PDF buffer from a report document', async () => {
      const report = await engine.generatePerformanceSummary(sampleMetrics);
      const pdf = await engine.exportPdf(report);

      assert.ok(Buffer.isBuffer(pdf));
      assert.ok(pdf.length > 500);
      assert.strictEqual(pdf.subarray(0, 5).toString('ascii'), '%PDF-');
    });

    it('exportDocx should produce a DOCX buffer from a report document', async () => {
      const report = await engine.generatePerformanceSummary(sampleMetrics);
      const docx = await engine.exportDocx(report);

      assert.ok(Buffer.isBuffer(docx));
      assert.ok(docx.length > 1000);
      assert.strictEqual(docx.subarray(0, 2).toString('ascii'), 'PK');
    });

    it('exportMarkdown should return formatted markdown string', async () => {
      const report = await engine.generatePerformanceSummary(sampleMetrics);
      const md = engine.exportMarkdown(report);

      assert.ok(typeof md === 'string');
      assert.ok(md.includes('# Omnichannel Cross-Platform Performance Master Report'));
    });

    it('formatTelegramAlert should format Telegram alert', () => {
      const alert = engine.formatTelegramAlert('Weekly Budget Exhausted', {
        remainingBudget: '$0.00',
        actionTaken: 'Campaigns automatically paused',
      });

      assert.ok(alert.includes('🚨 <b>[DIGIPORT ALERT] Weekly Budget Exhausted</b>'));
      assert.ok(alert.includes('Remaining Budget:'));
    });

    it('formatEmail should return valid HTML email', async () => {
      const report = await engine.generatePerformanceSummary(sampleMetrics);
      const email = engine.formatEmail(report);

      assert.ok(email.includes('<!DOCTYPE html>'));
      assert.ok(email.includes('Omnichannel Cross-Platform Performance Master Report'));
    });

    it('buildReport should support all 10 report types', async () => {
      for (const rType of VALID_REPORT_TYPES) {
        const report = await engine.buildReport(rType, 'client_multi_type_test', sampleMetrics);
        assert.strictEqual(report.reportType, rType);
        assert.ok(report.title.length > 0);
        assert.ok(report.scorecard.overallScore >= 0 && report.scorecard.overallScore <= 100);
      }
    });
  });
});
