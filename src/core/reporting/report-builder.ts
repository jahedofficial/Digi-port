import { Platform } from '../types/account';
import { UnifiedReportMetric } from '../types/metric';
import { ActionableRecommendation } from '../decision/types';
import { ExecutiveSummaryGenerator } from './executive-summary-generator';
import { ReportScorer } from './report-scorer';
import { ReportTemplateEngine } from './template-engine';
import {
  ReportActionItem,
  ReportDocument,
  ReportFinding,
  ReportType,
} from './types';

/**
 * Master Report Builder
 * Orchestrates deterministic scoring, diagnostic finding synthesis, action planning,
 * and bilingual executive summary generation into a unified ReportDocument.
 */
export class ReportBuilder {
  private scorer: ReportScorer;
  private summaryGenerator: ExecutiveSummaryGenerator;
  private templateEngine: ReportTemplateEngine;

  constructor(
    scorer?: ReportScorer,
    summaryGenerator?: ExecutiveSummaryGenerator,
    templateEngine?: ReportTemplateEngine
  ) {
    this.scorer = scorer ?? new ReportScorer();
    this.summaryGenerator = summaryGenerator ?? new ExecutiveSummaryGenerator();
    this.templateEngine = templateEngine ?? new ReportTemplateEngine();
  }

  public buildReport(params: {
    reportType: ReportType;
    clientId: string;
    metrics: UnifiedReportMetric[];
    dateRange?: { startDate: string; endDate: string };
    recommendations?: ActionableRecommendation[] | string[];
    customFindings?: ReportFinding[];
    targetRoasFloor?: number;
    targetCpa?: number;
  }): ReportDocument {
    const {
      reportType,
      clientId,
      metrics,
      dateRange = {
        startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      recommendations = [],
      customFindings = [],
      targetRoasFloor = 3.0,
      targetCpa = 40.0,
    } = params;

    const tpl = this.templateEngine.getTemplate(reportType);
    const title = tpl ? tpl.title : `${reportType.replace(/_/g, ' ')} Report`;

    // 1. Calculate Scorecard
    const scorecard = this.scorer.calculateScore(metrics, targetRoasFloor, targetCpa);

    // 2. Synthesize Diagnostic Findings
    const findings: ReportFinding[] = [...customFindings];

    const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0);
    const totalRevenue = metrics.reduce((sum, m) => sum + (m.conversionValue ?? 0), 0);
    const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
    const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const blendedCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

    if (totalSpend > 0 && blendedRoas < targetRoasFloor) {
      findings.push({
        id: `fnd_roas_below_floor_${Date.now()}`,
        category: 'PERFORMANCE_EFFICIENCY',
        title: 'ROAS Below Minimum Floor Benchmark',
        severity: blendedRoas < targetRoasFloor * 0.7 ? 'CRITICAL' : 'HIGH',
        description: `Blended ROAS (${blendedRoas.toFixed(2)}x) is below the configured performance floor of ${targetRoasFloor.toFixed(2)}x.`,
        metricObserved: {
          name: 'blendedRoas',
          value: `${blendedRoas.toFixed(2)}x`,
          benchmark: `${targetRoasFloor.toFixed(2)}x`,
        },
        impactBangla: `বর্তমান ROAS লক্ষ্যমাত্রার চেয়ে কম থাকায় বিনিয়োগের লাভজনকতা হ্রাস পাচ্ছে।`,
        impactEnglish: `Current ROAS below target floor impacts overall account profitability.`,
      });
    }

    if (totalConversions > 0 && blendedCpa > targetCpa * 1.25) {
      findings.push({
        id: `fnd_cpa_spike_${Date.now()}`,
        category: 'BUDGET_EFFICIENCY',
        title: 'Acquisition Cost (CPA) Inflation',
        severity: blendedCpa > targetCpa * 1.5 ? 'CRITICAL' : 'HIGH',
        description: `Average CPA ($${blendedCpa.toFixed(2)}) exceeds target ceiling benchmark ($${targetCpa.toFixed(2)}).`,
        metricObserved: {
          name: 'blendedCpa',
          value: `$${blendedCpa.toFixed(2)}`,
          benchmark: `$${targetCpa.toFixed(2)}`,
        },
        impactBangla: `CPA বৃদ্ধি পাওয়ায় প্রতিটি কনভার্সনে অতিরিক্ত খরচ হচ্ছে।`,
        impactEnglish: `Elevated CPA increases conversion acquisition costs across ad sets.`,
      });
    }

    if (findings.length === 0) {
      findings.push({
        id: `fnd_optimal_performance_${Date.now()}`,
        category: 'PERFORMANCE_EFFICIENCY',
        title: 'Account Performance Within Guardrails',
        severity: 'LOW',
        description: `Blended ROAS (${blendedRoas.toFixed(2)}x) and CPA ($${blendedCpa.toFixed(2)}) remain within target operating ranges.`,
        metricObserved: {
          name: 'blendedRoas',
          value: `${blendedRoas.toFixed(2)}x`,
          benchmark: `${targetRoasFloor.toFixed(2)}x`,
        },
        impactBangla: `অ্যাকাউন্টের সার্বিক পারফরম্যান্স স্থিতিশীল ও স্বাস্থ্যকর রয়েছে।`,
        impactEnglish: `Account demonstrates solid efficiency with clear headroom for budget scaling.`,
      });
    }

    // Identify platforms present
    const platforms: Platform[] = Array.from(new Set(metrics.map((m) => m.platform)));
    if (platforms.length === 0) {
      if (tpl && tpl.platform !== 'CROSS_PLATFORM') {
        platforms.push(tpl.platform as Platform);
      } else {
        platforms.push('GOOGLE', 'META');
      }
    }

    // 3. Synthesize Issues from Findings
    const issues: string[] = findings.map((f) => `[${f.severity}] ${f.title}: ${f.description}`);
    if (issues.length === 0) {
      issues.push('No critical spend bleeders or threshold violations observed in the current period.');
    }

    // 4. Synthesize Action Plan
    const actionPlan: ReportActionItem[] = [];
    let step = 1;

    for (const rec of recommendations) {
      if (typeof rec === 'string') {
        actionPlan.push({
          stepNumber: step++,
          title: `Optimization Action ${step - 1}`,
          priority: 'P1',
          platform: platforms[0] ?? 'GOOGLE',
          action: rec,
          expectedResult: 'Stabilize CPA and lift overall ROAS towards benchmark.',
        });
      } else {
        const priorityTier: 'P0' | 'P1' | 'P2' | 'P3' =
          rec.priority === 'CRITICAL'
            ? 'P0'
            : rec.priority === 'HIGH'
              ? 'P1'
              : rec.priority === 'MEDIUM'
                ? 'P2'
                : 'P3';

        const targetName = rec.entityId ?? rec.entityType ?? 'entity';
        actionPlan.push({
          stepNumber: step++,
          title: rec.title,
          priority: priorityTier,
          platform: rec.platform,
          action: `Change ${targetName} from ${rec.currentValue} to ${rec.recommendedValue}.`,
          expectedResult: rec.explanationEnglish,
        });
      }
    }

    if (actionPlan.length === 0) {
      // Create baseline action plan if no recommendations provided
      actionPlan.push({
        stepNumber: 1,
        title: 'Bidding & Budget Pacing Rebalancing',
        priority: 'P1',
        platform: platforms[0] ?? 'GOOGLE',
        action: 'Reallocate spend towards top-performing ad sets and pause low-ROAS creatives.',
        expectedResult: 'Expected 10-15% ROAS improvement within 7 days.',
      });
      actionPlan.push({
        stepNumber: 2,
        title: 'Conversion Signal Verification',
        priority: 'P2',
        platform: platforms[0] ?? 'GOOGLE',
        action: 'Verify CAPI / GA4 event deduplication and match quality metrics.',
        expectedResult: 'Enhanced algorithmic bidding accuracy.',
      });
    }

    // 5. Strategic Priority Matrix
    const priorityMatrix = [
      {
        priority: 'P0 (Immediate / Emergency)',
        items: actionPlan.filter((a) => a.priority === 'P0').map((a) => a.title),
      },
      {
        priority: 'P1 (High Impact / Near Term)',
        items: actionPlan.filter((a) => a.priority === 'P1').map((a) => a.title),
      },
      {
        priority: 'P2 (Medium / Scalability)',
        items: actionPlan.filter((a) => a.priority === 'P2').map((a) => a.title),
      },
      {
        priority: 'P3 (Maintenance / Continuous)',
        items: actionPlan.filter((a) => a.priority === 'P3').map((a) => a.title),
      },
    ].map((pm) => ({
      priority: pm.priority,
      items: pm.items.length > 0 ? pm.items : ['Standard maintenance and pacing monitoring'],
    }));

    // 6. Executive Summaries (Bilingual)
    const { summaryBangla, summaryEnglish } = this.summaryGenerator.generateSummary(
      reportType,
      scorecard,
      metrics,
      findings,
      clientId
    );

    // 7. Supporting Evidence & Metric Snapshots
    const supportingEvidence: Record<string, unknown> = {
      aggregatedMetrics: {
        totalSpend,
        totalRevenue,
        totalConversions,
        blendedRoas: Number(blendedRoas.toFixed(2)),
        blendedCpa: Number(blendedCpa.toFixed(2)),
        entityCount: metrics.length,
      },
      platformBreakdown: platforms.map((p) => {
        const pMetrics = metrics.filter((m) => m.platform === p);
        const pSpend = pMetrics.reduce((sum, m) => sum + m.spend, 0);
        const pRev = pMetrics.reduce((sum, m) => sum + (m.conversionValue ?? 0), 0);
        return {
          platform: p,
          spend: pSpend,
          revenue: pRev,
          roas: pSpend > 0 ? Number((pRev / pSpend).toFixed(2)) : 0,
        };
      }),
    };

    // 8. Appendix
    const appendix: Record<string, unknown> = {
      templateVersion: tpl ? tpl.version : '1.0.0',
      complianceFramework: 'DigiPort Universal Paid Media AI Operating System (Phase 12)',
      attributionWindow: 'Platform default attribution (7-day click, 1-day view)',
      generatedTimestamp: new Date().toISOString(),
    };

    const effectiveRecommendations: string[] | ActionableRecommendation[] =
      recommendations.length > 0
        ? recommendations
        : [
            'Scale daily spend on high-ROAS creative clusters by 15-20% incrementally.',
            'Implement conversion value rules and enhanced conversions across active channels.',
          ];

    return {
      id: `rep_${reportType.toLowerCase()}_${clientId}_${Date.now()}`,
      reportType,
      title,
      clientId,
      generatedAt: new Date(),
      dateRange,
      platforms,
      scorecard,
      executiveSummaryBangla: summaryBangla,
      executiveSummaryEnglish: summaryEnglish,
      findings,
      issues,
      recommendations: effectiveRecommendations,
      priorityMatrix,
      actionPlan,
      supportingEvidence,
      appendix,
    };
  }
}
