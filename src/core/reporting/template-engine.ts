import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IReportTemplateEngine,
  ReportTemplateDefinition,
  ReportType,
  VALID_REPORT_TYPES,
} from './types';

/**
 * Report Template Engine
 * Loads, caches, and validates the 10 core report templates defined in assets/report-templates.
 */
export class ReportTemplateEngine implements IReportTemplateEngine {
  private templates: Map<ReportType, ReportTemplateDefinition> = new Map();
  private loaded: boolean = false;

  /**
   * Validate a template definition against the Blueprint schema
   */
  public validateTemplate(tpl: Partial<ReportTemplateDefinition>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!tpl.id || typeof tpl.id !== 'string') {
      errors.push('Missing or invalid "id"');
    }
    if (!tpl.title || typeof tpl.title !== 'string') {
      errors.push('Missing or invalid "title"');
    }
    if (!tpl.reportType || !VALID_REPORT_TYPES.includes(tpl.reportType as ReportType)) {
      errors.push(`Invalid "reportType": ${tpl.reportType}`);
    }
    if (!tpl.platform) {
      errors.push('Missing "platform"');
    }

    // Must define all 9 required sections
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

    if (!tpl.sections || typeof tpl.sections !== 'object') {
      errors.push('Missing or invalid "sections" object');
    } else {
      for (const sec of requiredSections) {
        if (!(sec in tpl.sections) || typeof (tpl.sections as Record<string, unknown>)[sec] !== 'string') {
          errors.push(`Missing required section: "${sec}"`);
        }
      }
    }

    if (!Array.isArray(tpl.requiredMetrics) || tpl.requiredMetrics.length === 0) {
      errors.push('Missing or empty "requiredMetrics" array');
    }
    if (!Array.isArray(tpl.scoringDimensions) || tpl.scoringDimensions.length === 0) {
      errors.push('Missing or empty "scoringDimensions" array');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Load and cache all templates from disk or built-in registry
   */
  public async loadTemplates(dirPath?: string): Promise<ReportTemplateDefinition[]> {
    const resolvedPath =
      dirPath ?? path.resolve(process.cwd(), 'assets', 'report-templates');

    try {
      const files = await fs.readdir(resolvedPath);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      for (const file of jsonFiles) {
        const fullPath = path.join(resolvedPath, file);
        const content = await fs.readFile(fullPath, 'utf-8');
        const parsed = JSON.parse(content) as ReportTemplateDefinition;

        const validation = this.validateTemplate(parsed);
        if (validation.isValid) {
          this.templates.set(parsed.reportType, parsed);
        } else {
          console.warn(`Template ${file} validation warnings:`, validation.errors);
        }
      }
    } catch {
      // In case directory read fails, fallback or proceed
    }

    // If any templates failed to load from disk, seed built-in defaults
    this.seedDefaultsIfNeeded();
    this.loaded = true;

    return Array.from(this.templates.values());
  }

  /**
   * Retrieve a specific template by ReportType
   */
  public getTemplate(reportType: ReportType): ReportTemplateDefinition | undefined {
    if (!this.loaded) {
      this.seedDefaultsIfNeeded();
      this.loaded = true;
    }
    return this.templates.get(reportType);
  }

  /**
   * List all currently registered templates
   */
  public listTemplates(): ReportTemplateDefinition[] {
    if (!this.loaded) {
      this.seedDefaultsIfNeeded();
      this.loaded = true;
    }
    return Array.from(this.templates.values());
  }

  /**
   * Seed defaults ensuring all 10 templates are available in any environment
   */
  private seedDefaultsIfNeeded(): void {
    const defaultTemplates: ReportTemplateDefinition[] = [
      {
        id: 'tpl_google_ads_audit',
        title: 'Google Ads Performance & Health Audit Report',
        reportType: 'GOOGLE_ADS_AUDIT',
        version: '1.0.0',
        platform: 'GOOGLE',
        sections: {
          executiveSummary: 'High-level diagnostic of Google Ads account health, spend pacing, and ROAS floor compliance.',
          overallScore: 'Deterministic health score (0-100) combining ROAS, CPA drift, search impression share, and Quality Score.',
          findings: 'Categorized audit findings across Performance Max asset groups, Search match types, and Shopping feeds.',
          issues: 'Identified spend bleeders, low Quality Score keywords (<5/10), and negative keyword conflicts.',
          recommendations: 'Ranked optimization proposals including bid adjustments and negative keyword additions.',
          priorityMatrix: 'Impact vs Effort 4-quadrant prioritization matrix (P0 Critical to P3 Housekeeping).',
          actionPlan: 'Numbered step-by-step implementation roadmap with expected impact metrics.',
          supportingEvidence: 'Aggregated Google Ads GAQL metric snapshots and impression share statistics.',
          appendix: 'Technical definitions, conversion action configuration status, and attribution models.',
        },
        requiredMetrics: ['spend', 'impressions', 'clicks', 'conversions', 'conversionValue', 'roas', 'cpa'],
        scoringDimensions: ['roasHealth', 'cpaEfficiency', 'qualityScoreAverage', 'impressionShareLostToBudget'],
      },
      {
        id: 'tpl_meta_ads_audit',
        title: 'Meta Ads Account & Creative Diagnostic Audit',
        reportType: 'META_ADS_AUDIT',
        version: '1.0.0',
        platform: 'META',
        sections: {
          executiveSummary: 'Diagnostic analysis of Meta Ads campaign structure, Advantage+ shopping budget allocation, and creative fatigue.',
          overallScore: 'Composite score (0-100) factoring in ROAS, CPA stability, frequency fatigue, and Conversions API Event Quality.',
          findings: 'Creative and audience findings across prospecting, retargeting, and dynamic creative ads.',
          issues: 'Identified ad set overlap, frequency saturation (>3.5x), and low EMQ event signals (<8.0).',
          recommendations: 'Recommended budget shifts, creative refresh priorities, and audience consolidation moves.',
          priorityMatrix: '4-quadrant action prioritization matrix.',
          actionPlan: 'Phased rollout plan with expected ROAS uplift and stability improvements.',
          supportingEvidence: 'Meta Graph API breakdowns by placement, demographic, and creative format.',
          appendix: 'CAPI configuration status, pixel event coverage, and attribution window details.',
        },
        requiredMetrics: ['spend', 'impressions', 'clicks', 'conversions', 'conversionValue', 'roas', 'cpa'],
        scoringDimensions: ['roasHealth', 'cpaEfficiency', 'creativeFreshness', 'trackingQuality'],
      },
      {
        id: 'tpl_tiktok_ads_audit',
        title: 'TikTok Ads Creative Velocity & Performance Audit',
        reportType: 'TIKTOK_ADS_AUDIT',
        version: '1.0.0',
        platform: 'TIKTOK',
        sections: {
          executiveSummary: 'Evaluation of TikTok campaign performance, creative decay rates, hook rates, and Spark Ads adoption.',
          overallScore: 'Creative velocity and efficiency score (0-100) measuring 3-second hook rate, hold rate, and ROAS.',
          findings: 'Video performance findings comparing native Spark Ads vs standard non-Spark video ads.',
          issues: 'Creative fatigue indicators, hook drop-off (<20% 3-second view), and high CPA ad groups.',
          recommendations: 'Creative iteration schedule, sound/music licensing optimization, and smart budget allocation.',
          priorityMatrix: 'Impact vs Speed prioritization framework.',
          actionPlan: 'Creative sprint schedule and budget scaling timeline.',
          supportingEvidence: 'Video duration retention curves, interactive add-on CTRs, and demographic distributions.',
          appendix: 'TikTok Events API diagnostics and Advanced Matching parameters.',
        },
        requiredMetrics: ['spend', 'impressions', 'clicks', 'conversions', 'conversionValue', 'roas', 'cpa', 'videoHookRate'],
        scoringDimensions: ['roasHealth', 'cpaEfficiency', 'creativeFreshness', 'trackingQuality'],
      },
      {
        id: 'tpl_campaign_performance',
        title: 'Single Campaign Deep-Dive Performance Report',
        reportType: 'CAMPAIGN_PERFORMANCE',
        version: '1.0.0',
        platform: 'CROSS_PLATFORM',
        sections: {
          executiveSummary: 'Targeted campaign performance assessment evaluating pacing, conversion volume, and target ROAS/CPA adherence.',
          overallScore: 'Campaign performance index score (0-100).',
          findings: 'Granular ad group, asset, and keyword efficiency observations.',
          issues: 'Underperforming placements, sudden CPA spikes, or ad disapproval notices.',
          recommendations: 'Tactical optimizations including bid strategy adjustments and asset updates.',
          priorityMatrix: 'Immediate vs Secondary action priority matrix.',
          actionPlan: 'Execution roadmap for the specific campaign.',
          supportingEvidence: 'Day-over-day and week-over-week performance trajectory metrics.',
          appendix: 'Targeting criteria, bid strategy settings, and bidding constraints.',
        },
        requiredMetrics: ['spend', 'impressions', 'clicks', 'conversions', 'conversionValue', 'roas', 'cpa'],
        scoringDimensions: ['roasHealth', 'cpaEfficiency'],
      },
      {
        id: 'tpl_cross_platform_performance',
        title: 'Omnichannel Cross-Platform Performance Master Report',
        reportType: 'CROSS_PLATFORM_PERFORMANCE',
        version: '1.0.0',
        platform: 'CROSS_PLATFORM',
        sections: {
          executiveSummary: 'Holistic cross-platform paid media overview comparing Google, Meta, and TikTok allocations and blended ROAS.',
          overallScore: 'Unified media efficiency index (0-100) reflecting blended CAC and MER.',
          findings: 'Cross-platform attribution overlap, incremental reach, and channel-specific efficiency benchmarks.',
          issues: 'Channel cannibalization, over-attribution, and misaligned budget allocation.',
          recommendations: 'Optimal cross-platform budget reallocation recommendations maximizing portfolio return.',
          priorityMatrix: 'Cross-channel strategic priority matrix.',
          actionPlan: 'Budget reallocation schedule and tracking synchronization milestones.',
          supportingEvidence: 'Side-by-side platform metric comparison tables and blended trend graphs.',
          appendix: 'Omnichannel attribution methodology and deduplication logic.',
        },
        requiredMetrics: ['spend', 'impressions', 'clicks', 'conversions', 'conversionValue', 'roas', 'cpa'],
        scoringDimensions: ['roasHealth', 'cpaEfficiency', 'creativeFreshness', 'trackingQuality'],
      },
      {
        id: 'tpl_cro_audit',
        title: 'Conversion Rate Optimization (CRO) & Funnel Friction Audit',
        reportType: 'CRO_AUDIT',
        version: '1.0.0',
        platform: 'CROSS_PLATFORM',
        sections: {
          executiveSummary: 'Comprehensive audit of landing page speed, mobile UX responsiveness, and checkout funnel conversion drop-offs.',
          overallScore: 'Funnel health and user experience score (0-100).',
          findings: 'Landing page friction points, slow Core Web Vitals (LCP > 2.5s), and checkout abandonment triggers.',
          issues: 'High mobile bounce rates, non-responsive form fields, and missing social proof or trust badges.',
          recommendations: 'High-impact UX recommendations, A/B test hypotheses, and page speed optimizations.',
          priorityMatrix: 'ICE framework (Impact, Confidence, Ease) priority matrix.',
          actionPlan: 'A/B testing roadmap and web performance sprint items.',
          supportingEvidence: 'Lighthouse audits, GA4 funnel drop-off charts, and heat-map friction metrics.',
          appendix: 'Core Web Vitals benchmarks and browser/device matrix.',
        },
        requiredMetrics: ['impressions', 'clicks', 'conversions'],
        scoringDimensions: ['mobileSpeed', 'coreWebVitals', 'funnelFrictionIndex'],
      },
      {
        id: 'tpl_tracking_audit',
        title: 'Universal Tracking, CAPI & Data Governance Audit',
        reportType: 'TRACKING_AUDIT',
        version: '1.0.0',
        platform: 'CROSS_PLATFORM',
        sections: {
          executiveSummary: 'Full-stack audit of Google Tag Manager, GA4 Enhanced Measurement, Meta CAPI, and TikTok Events API.',
          overallScore: 'Tracking reliability and match quality score (0-100).',
          findings: 'Signal health observations across web and server-side conversion pipelines.',
          issues: 'Missing event parameters, low Event Match Quality (EMQ < 8.0), and duplicate event firing.',
          recommendations: 'Server-side GTM deployment, enhanced conversion enrichment, and consent mode v2 implementation.',
          priorityMatrix: 'Data integrity priority matrix (P0 Data Loss to P3 Maintenance).',
          actionPlan: 'Step-by-step tag and server-side tracking remediation plan.',
          supportingEvidence: 'Tag Assistant verification logs, CAPI test payload payloads, and GA4 DebugView traces.',
          appendix: 'Data dictionary, parameter schemas, and GDPR/CCPA compliance verification.',
        },
        requiredMetrics: ['conversions', 'conversionValue'],
        scoringDimensions: ['trackingQuality'],
      },
      {
        id: 'tpl_merchant_catalog_audit',
        title: 'E-commerce Catalog & Google Merchant Center Health Audit',
        reportType: 'MERCHANT_CATALOG_AUDIT',
        version: '1.0.0',
        platform: 'GOOGLE',
        sections: {
          executiveSummary: 'Diagnostic analysis of Google Merchant Center product feed disapprovals, item warnings, and GTIN accuracy.',
          overallScore: 'Catalog health and compliance score (0-100).',
          findings: 'Feed categorization, missing required attributes, and price/stock synchronization discrepancies.',
          issues: 'Disapproved high-margin SKUs, missing Google Product Categories, and low image resolution errors.',
          recommendations: 'Supplemental feed rules, automatic item updates enablement, and title optimization formulas.',
          priorityMatrix: 'Catalog fix priority matrix grouped by revenue impact.',
          actionPlan: 'Product feed remediation roadmap and re-crawling plan.',
          supportingEvidence: 'GMC diagnostic error logs, item status breakdown, and feed processing reports.',
          appendix: 'Product attribute specification compliance sheet.',
        },
        requiredMetrics: ['impressions', 'clicks', 'conversions'],
        scoringDimensions: ['catalogApprovalRate', 'dataRichnessScore', 'priceStockAccuracy'],
      },
      {
        id: 'tpl_optimization_report',
        title: 'System Optimization & Algorithmic Impact Summary',
        reportType: 'OPTIMIZATION_REPORT',
        version: '1.0.0',
        platform: 'CROSS_PLATFORM',
        sections: {
          executiveSummary: 'Summary of automated and approved optimizations executed by DigiPort AI agents over the reporting cycle.',
          overallScore: 'Optimization effectiveness index (0-100) reflecting ROAS delta post-execution.',
          findings: 'Pre- and post-optimization performance comparisons for bids, budgets, and audience exclusions.',
          issues: 'Interventions that encountered algorithmic pushback or plateaued performance.',
          recommendations: 'Upcoming strategic opportunities and algorithmic budget reallocation prospects.',
          priorityMatrix: 'Continuous improvement priority framework.',
          actionPlan: 'Next optimization sprint schedule.',
          supportingEvidence: 'Before-and-after conversion charts, CPA progression curves, and budget reallocation logs.',
          appendix: 'Audit log of actions enqueued, approved, and executed by DigiPort ActionQueue.',
        },
        requiredMetrics: ['spend', 'impressions', 'clicks', 'conversions', 'conversionValue', 'roas', 'cpa'],
        scoringDimensions: ['roasHealth', 'cpaEfficiency'],
      },
      {
        id: 'tpl_executive_report',
        title: 'Board-Level Executive Paid Media Performance & Growth Brief',
        reportType: 'EXECUTIVE_REPORT',
        version: '1.0.0',
        platform: 'CROSS_PLATFORM',
        sections: {
          executiveSummary: 'High-level commercial executive brief covering revenue, blended ROAS, marketing efficiency ratio (MER), and growth.',
          overallScore: 'Executive commercial performance index (0-100).',
          findings: 'Macro-level performance drivers, channel contribution, and revenue scalability findings.',
          issues: 'Strategic growth constraints, rising customer acquisition costs, or market headwinds.',
          recommendations: 'Strategic investments, scaling opportunities, and quarterly budget allocations.',
          priorityMatrix: 'Executive decision matrix.',
          actionPlan: 'Strategic growth initiatives for the upcoming reporting period.',
          supportingEvidence: 'Executive summary charts, revenue attribution breakdown, and blended MER trends.',
          appendix: 'Financial reconciliation notes, attribution model parameters, and glossary.',
        },
        requiredMetrics: ['spend', 'impressions', 'clicks', 'conversions', 'conversionValue', 'roas', 'cpa'],
        scoringDimensions: ['roasHealth', 'cpaEfficiency'],
      },
    ];

    for (const tpl of defaultTemplates) {
      if (!this.templates.has(tpl.reportType)) {
        this.templates.set(tpl.reportType, tpl);
      }
    }
  }
}
