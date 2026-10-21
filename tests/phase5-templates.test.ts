import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'path';
import {
  IndustryTemplateRegistry,
  IndustryTemplateLoader,
  ValidationException,
  SystemException,
} from '../src/core';

describe('Phase 5 — Industry Templates Unit Tests', () => {
  const templatesDirectory = path.resolve(process.cwd(), 'assets', 'industry-templates');

  describe('1. IndustryTemplateLoader & Disk Ingestion', () => {
    it('should successfully load all 10 vertical templates from assets/industry-templates/', async () => {
      const registry = new IndustryTemplateRegistry();
      const loader = new IndustryTemplateLoader(registry);

      const templates = await loader.loadFromDirectory(templatesDirectory);

      assert.strictEqual(templates.length, 10);
      assert.strictEqual(registry.getAll().length, 10);
    });

    it('should throw SystemException when directory does not exist', async () => {
      const registry = new IndustryTemplateRegistry();
      const loader = new IndustryTemplateLoader(registry);

      await assert.rejects(async () => {
        await loader.loadFromDirectory(path.join(templatesDirectory, 'non_existent_dir'));
      }, (err: unknown) => {
        return err instanceof SystemException && err.code === 'ERR_TEMPLATE_DIR_NOT_FOUND';
      });
    });

    it('should support loading individual template JSON string', () => {
      const registry = new IndustryTemplateRegistry();
      const loader = new IndustryTemplateLoader(registry);

      const sample = registry.getAll();
      assert.strictEqual(sample.length, 0);

      const customTemplate = {
        id: 'template-custom-test',
        name: 'Custom Direct Test',
        industry: 'custom-retail',
        version: '1.0.0',
        businessGoals: ['Drive sales'],
        campaignStructure: { funnelStages: ['TOF', 'BOF'], namingConvention: 'CUST_{ID}' },
        recommendedCampaignTypes: { google: ['Search'], meta: ['Sales'], tiktok: ['Conversions'] },
        budgetStrategy: { google: 'tCPA', meta: 'CBO', tiktok: 'Lowest' },
        biddingStrategy: { google: 'tROAS', meta: 'Highest', tiktok: 'Lowest' },
        conversionGoals: ['Purchase'],
        trackingRequirements: ['CAPI'],
        assetRequirements: { formats: ['MP4'], aspectRatios: ['1:1'] },
        namingConventions: { campaignPattern: 'C_{ID}', adGroupPattern: 'AG_{ID}', adPattern: 'AD_{ID}' },
        kpiTargets: { targetROAS: 3.0 },
        reportingMetrics: ['Spend', 'ROAS'],
        bestPractices: ['Test creatives'],
        platformMix: {
          recommendedRoles: { google: 'Search', meta: 'Social', tiktok: 'Discovery' },
          budgetSplitRanges: {
            google: { minPercent: 20, maxPercent: 60, defaultPercent: 40 },
            meta: { minPercent: 20, maxPercent: 60, defaultPercent: 40 },
            tiktok: { minPercent: 10, maxPercent: 30, defaultPercent: 20 },
          },
          perPlatformCampaignTypes: { google: ['Search'], meta: ['Sales'], tiktok: ['Conversions'] },
          perPlatformObjectives: { google: 'SALES', meta: 'OUTCOME_SALES', tiktok: 'CONVERSIONS' },
          perPlatformOptimizationEvents: { google: 'PURCHASE', meta: 'PURCHASE', tiktok: 'COMPLETE_PAYMENT' },
          perPlatformCreativeRequirements: {
            google: { formats: ['IMAGE'], aspectRatios: ['1:1'] },
            meta: { formats: ['IMAGE'], aspectRatios: ['1:1'] },
            tiktok: { formats: ['VIDEO'], aspectRatios: ['9:16'] },
          },
          policyConstraints: { specialAdCategory: 'NONE' },
        },
      };

      const loaded = loader.loadTemplate(customTemplate);
      assert.strictEqual(loaded.id, 'template-custom-test');
      assert.strictEqual(registry.has('custom-retail'), true);
    });
  });

  describe('2. IndustryTemplateRegistry Validation & Retrieval', () => {
    it('should retrieve all 10 templates by ID and by industry name', async () => {
      const registry = new IndustryTemplateRegistry();
      const loader = new IndustryTemplateLoader(registry);
      await loader.loadFromDirectory(templatesDirectory);

      const expectedIndustries = [
        'ecommerce',
        'lead-generation',
        'healthcare',
        'education',
        'b2b',
        'saas',
        'real-estate',
        'local-services',
        'finance',
        'hospitality',
      ];

      for (const industry of expectedIndustries) {
        assert.ok(registry.has(industry), `Registry should have template for industry: ${industry}`);
        const template = registry.get(industry);
        assert.ok(template);
        assert.strictEqual(template?.industry, industry);
      }
    });

    it('should reject template when required fields are missing', () => {
      const registry = new IndustryTemplateRegistry();

      assert.throws(() => {
        registry.register({
          id: 'invalid-template',
          name: 'Missing Fields',
        } as any);
      }, ValidationException);
    });

    it('should reject template when default budget splits do not sum to 100%', () => {
      const registry = new IndustryTemplateRegistry();

      assert.throws(() => {
        registry.register({
          id: 'template-bad-split',
          name: 'Bad Split',
          industry: 'bad-split',
          version: '1.0.0',
          businessGoals: ['Goal'],
          campaignStructure: { funnelStages: ['TOF'], namingConvention: 'C_{ID}' },
          recommendedCampaignTypes: { google: ['Search'], meta: ['Sales'], tiktok: ['Conversions'] },
          budgetStrategy: { google: 'tCPA', meta: 'CBO', tiktok: 'Lowest' },
          biddingStrategy: { google: 'tROAS', meta: 'Highest', tiktok: 'Lowest' },
          conversionGoals: ['Purchase'],
          trackingRequirements: ['CAPI'],
          assetRequirements: { formats: ['MP4'], aspectRatios: ['1:1'] },
          namingConventions: { campaignPattern: 'C_{ID}', adGroupPattern: 'AG_{ID}', adPattern: 'AD_{ID}' },
          kpiTargets: { targetROAS: 3.0 },
          reportingMetrics: ['Spend'],
          bestPractices: ['Practice'],
          platformMix: {
            recommendedRoles: { google: 'Search', meta: 'Social', tiktok: 'Discovery' },
            budgetSplitRanges: {
              google: { minPercent: 10, maxPercent: 50, defaultPercent: 30 },
              meta: { minPercent: 10, maxPercent: 50, defaultPercent: 30 },
              tiktok: { minPercent: 10, maxPercent: 50, defaultPercent: 30 }, // Sum = 90% != 100%
            },
            perPlatformCampaignTypes: { google: ['Search'], meta: ['Sales'], tiktok: ['Conversions'] },
            perPlatformObjectives: { google: 'SALES', meta: 'OUTCOME_SALES', tiktok: 'CONVERSIONS' },
            perPlatformOptimizationEvents: { google: 'PURCHASE', meta: 'PURCHASE', tiktok: 'COMPLETE_PAYMENT' },
            perPlatformCreativeRequirements: {
              google: { formats: ['IMAGE'], aspectRatios: ['1:1'] },
              meta: { formats: ['IMAGE'], aspectRatios: ['1:1'] },
              tiktok: { formats: ['VIDEO'], aspectRatios: ['9:16'] },
            },
            policyConstraints: { specialAdCategory: 'NONE' },
          },
        } as any);
      }, ValidationException);
    });
  });

  describe('3. Template Quality & Compliance Audit (10/10 Verticals)', () => {
    it('every template must define valid Platform Mix, KPI targets, and policy constraints', async () => {
      const registry = new IndustryTemplateRegistry();
      const loader = new IndustryTemplateLoader(registry);
      const allTemplates = await loader.loadFromDirectory(templatesDirectory);

      for (const t of allTemplates) {
        // Business goals
        assert.ok(t.businessGoals.length >= 2, `${t.name} must have at least 2 business goals`);
        assert.ok(t.conversionGoals.length >= 2, `${t.name} must have at least 2 conversion goals`);
        assert.ok(t.trackingRequirements.length >= 2, `${t.name} must have at least 2 tracking requirements`);

        // Platform roles
        assert.ok(t.platformMix.recommendedRoles.google.length > 0);
        assert.ok(t.platformMix.recommendedRoles.meta.length > 0);
        assert.ok(t.platformMix.recommendedRoles.tiktok.length > 0);

        // Budget split sum
        const split = t.platformMix.budgetSplitRanges;
        const total = split.google.defaultPercent + split.meta.defaultPercent + split.tiktok.defaultPercent;
        assert.strictEqual(Math.round(total), 100, `${t.name} default budget split must sum to 100%`);

        // Creative requirements
        assert.ok(t.platformMix.perPlatformCreativeRequirements.google.aspectRatios.length > 0);
        assert.ok(t.platformMix.perPlatformCreativeRequirements.meta.aspectRatios.length > 0);
        assert.ok(t.platformMix.perPlatformCreativeRequirements.tiktok.aspectRatios.length > 0);

        // Policy constraints check for regulated sectors
        if (t.industry === 'real-estate') {
          assert.strictEqual(t.platformMix.policyConstraints.specialAdCategory, 'HOUSING');
        } else if (t.industry === 'finance') {
          assert.strictEqual(t.platformMix.policyConstraints.specialAdCategory, 'CREDIT');
        } else if (t.industry === 'healthcare') {
          assert.strictEqual(t.platformMix.policyConstraints.specialAdCategory, 'HEALTHCARE_REGULATED');
        }
      }
    });
  });
});
