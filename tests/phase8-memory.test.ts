import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import {
  MemoryValidator,
  MemoryRanking,
  MemoryRetrieval,
  MemoryUpdater,
  MemoryManager,
  MemoryEntry,
  BusinessGoals,
  PlatformPreferences,
  ApprovalRules,
  NamingConventions,
  UserPreferences,
  ValidationException,
} from '../src/core';

describe('Phase 8 — Memory System Unit Tests', () => {
  const validator = new MemoryValidator();
  const ranking = new MemoryRanking();

  // --------------------------------------------------------------------------
  // 1. Memory Validator (Boundary Enforcement & Prohibited Content)
  // --------------------------------------------------------------------------
  describe('1. MemoryValidator & Boundary Enforcement', () => {
    it('should validate a compliant BusinessGoals memory entry', () => {
      const entry: Partial<MemoryEntry<BusinessGoals>> = {
        id: 'mem_client_01_goals',
        clientId: 'client_fashion_001',
        category: 'BUSINESS_GOALS',
        key: 'business_goals',
        value: {
          targetRoasFloor: 3.5,
          maxAllowableCpa: 45.0,
          monthlyBudgetCeiling: 25000,
          targetProfitMargin: 20,
        },
        confidence: 0.95,
        importance: 9,
        isApproved: true,
        approvedBy: 'admin_user',
      };

      const result = validator.validateEntry(entry);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
      assert.doesNotThrow(() => validator.assertValidEntry(entry));
    });

    it('should reject memory entry containing credentials / tokens', () => {
      const entry: Partial<MemoryEntry> = {
        id: 'mem_bad_token',
        clientId: 'client_fashion_001',
        category: 'BUSINESS_STRATEGIES',
        key: 'brand_strategy',
        value: {
          strategy: 'Focus on luxury buyers',
          secretToken: 'ya29.a0AfH6SMA...',
        },
        confidence: 0.8,
        importance: 5,
        isApproved: true,
      };

      const result = validator.validateEntry(entry);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('token') || e.includes('ya29')));
      assert.throws(() => validator.assertValidEntry(entry), ValidationException);
    });

    it('should reject memory entry containing customer PII (email, phone, ip)', () => {
      const piiEmailEntry: Partial<MemoryEntry> = {
        id: 'mem_pii_email',
        clientId: 'client_fashion_001',
        category: 'USER_PREFERENCES',
        key: 'contact_info',
        value: {
          customerSupportEmail: 'vip-client@example.com',
        },
        confidence: 0.9,
        importance: 5,
        isApproved: true,
      };

      const resultEmail = validator.validateEntry(piiEmailEntry);
      assert.strictEqual(resultEmail.isValid, false);
      assert.ok(resultEmail.errors.some((e) => e.includes('PII') && e.includes('Email')));

      const piiPhoneEntry: Partial<MemoryEntry> = {
        id: 'mem_pii_phone',
        clientId: 'client_fashion_001',
        category: 'USER_PREFERENCES',
        key: 'contact_info',
        value: {
          phone: '+1-555-123-4567',
        },
        confidence: 0.9,
        importance: 5,
        isApproved: true,
      };

      const resultPhone = validator.validateEntry(piiPhoneEntry);
      assert.strictEqual(resultPhone.isValid, false);
      assert.ok(resultPhone.errors.some((e) => e.includes('PII') && e.includes('Phone')));
    });

    it('should reject live performance metrics and platform dumps', () => {
      const metricEntry: Partial<MemoryEntry> = {
        id: 'mem_bad_metric',
        clientId: 'client_fashion_001',
        category: 'BUSINESS_GOALS',
        key: 'recent_spend',
        value: {
          impressions: 450000,
          clicks: 12000,
          spend: 5400,
          live_roas: 2.8,
        },
        confidence: 1.0,
        importance: 5,
        isApproved: true,
      };

      const result = validator.validateEntry(metricEntry);
      assert.strictEqual(result.isValid, false);
      assert.ok(
        result.errors.some(
          (e) => e.includes('Live performance metric') || e.includes('recent_spend')
        )
      );
    });

    it('should reject platform budget split if sum does not equal 100%', () => {
      const entry: Partial<MemoryEntry<PlatformPreferences>> = {
        id: 'mem_bad_split',
        clientId: 'client_fashion_001',
        category: 'PLATFORM_PREFERENCES',
        key: 'platform_preferences',
        value: {
          preferredPlatforms: ['GOOGLE', 'META'],
          defaultBudgetSplit: { GOOGLE: 70, META: 40 }, // sums to 110%
          brandVoice: {
            tone: 'Bold and elegant',
            prohibitedWords: [],
            coreSellingPropositions: [],
            approvedThemes: [],
          },
        },
        confidence: 0.9,
        importance: 8,
        isApproved: true,
      };

      const result = validator.validateEntry(entry);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('sum to 100%')));
    });

    it('should reject memory entry without valid clientId or unapproved items', () => {
      const emptyClientEntry: Partial<MemoryEntry> = {
        clientId: '',
        category: 'BUSINESS_GOALS',
        key: 'goals',
        value: { targetRoasFloor: 3.0 },
        isApproved: true,
      };
      assert.strictEqual(validator.validateEntry(emptyClientEntry).isValid, false);

      const unapprovedEntry: Partial<MemoryEntry> = {
        clientId: 'client_01',
        category: 'BUSINESS_GOALS',
        key: 'goals',
        value: { targetRoasFloor: 3.0 },
        isApproved: false,
      };
      assert.strictEqual(validator.validateEntry(unapprovedEntry).isValid, false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Memory Ranking (Deterministic Calculation & Query Relevance)
  // --------------------------------------------------------------------------
  describe('2. MemoryRanking & Deterministic Scoring', () => {
    it('should rank memory entries deterministically based on importance, confidence, and recency', () => {
      const now = new Date();
      const entries: MemoryEntry[] = [
        {
          id: 'mem_01',
          clientId: 'client_01',
          category: 'BUSINESS_GOALS',
          key: 'target_roas',
          value: { targetRoasFloor: 4.0 },
          confidence: 0.9,
          importance: 10,
          version: 1,
          isApproved: true,
          createdAt: now,
          updatedAt: now,
          source: 'brief',
          auditTrail: [],
        },
        {
          id: 'mem_02',
          clientId: 'client_01',
          category: 'USER_PREFERENCES',
          key: 'language_pref',
          value: { language: 'bn' },
          confidence: 0.7,
          importance: 4,
          version: 1,
          isApproved: true,
          createdAt: now,
          updatedAt: now,
          source: 'brief',
          auditTrail: [],
        },
        {
          id: 'mem_03',
          clientId: 'client_01',
          category: 'APPROVAL_RULES',
          key: 'budget_threshold',
          value: { autoApproveBudgetThreshold: 500 },
          confidence: 0.95,
          importance: 8,
          version: 1,
          isApproved: true,
          createdAt: now,
          updatedAt: now,
          source: 'brief',
          auditTrail: [],
        },
      ];

      const ranked = ranking.rankEntries(entries);
      assert.strictEqual(ranked.length, 3);

      // Highest importance (10) and confidence (0.9) must rank first
      assert.strictEqual(ranked[0].entry.id, 'mem_01');
      assert.strictEqual(ranked[1].entry.id, 'mem_03');
      assert.strictEqual(ranked[2].entry.id, 'mem_02');

      // Verify scores are decreasing deterministically
      assert.ok(ranked[0].score >= ranked[1].score);
      assert.ok(ranked[1].score >= ranked[2].score);
    });

    it('should boost entries matching search query in key or category', () => {
      const now = new Date();
      const entries: MemoryEntry[] = [
        {
          id: 'mem_brand',
          clientId: 'client_01',
          category: 'PLATFORM_PREFERENCES',
          key: 'brand_voice_tone',
          value: 'Empathetic, reassuring, clinical',
          confidence: 0.8,
          importance: 6,
          version: 1,
          isApproved: true,
          createdAt: now,
          updatedAt: now,
          source: 'brief',
          auditTrail: [],
        },
        {
          id: 'mem_goals',
          clientId: 'client_01',
          category: 'BUSINESS_GOALS',
          key: 'target_cpa',
          value: 40,
          confidence: 0.8,
          importance: 6,
          version: 1,
          isApproved: true,
          createdAt: now,
          updatedAt: now,
          source: 'brief',
          auditTrail: [],
        },
      ];

      const rankedForBrand = ranking.rankEntries(entries, 'brand');
      assert.strictEqual(rankedForBrand[0].entry.id, 'mem_brand');
      assert.ok(rankedForBrand[0].scoreBreakdown.relevance > rankedForBrand[1].scoreBreakdown.relevance);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Memory Retrieval & Strict Client Isolation
  // --------------------------------------------------------------------------
  describe('3. MemoryRetrieval & Client Isolation Boundary', () => {
    it('should guarantee zero cross-client memory leakage', async () => {
      const storage = new Map<string, Map<string, MemoryEntry>>();
      const retrieval = new MemoryRetrieval(storage);
      const updater = new MemoryUpdater(storage);

      // Create entry for Client Alpha
      await updater.createEntry(
        {
          id: 'mem_alpha_01',
          clientId: 'client_alpha',
          category: 'BUSINESS_GOALS',
          key: 'business_goals',
          value: { targetRoasFloor: 5.0, maxAllowableCpa: 30, monthlyBudgetCeiling: 50000 },
          confidence: 1.0,
          importance: 9,
          isApproved: true,
          source: 'onboarding',
        },
        'admin',
        'Alpha onboarding'
      );

      // Create entry for Client Beta
      await updater.createEntry(
        {
          id: 'mem_beta_01',
          clientId: 'client_beta',
          category: 'BUSINESS_GOALS',
          key: 'business_goals',
          value: { targetRoasFloor: 2.0, maxAllowableCpa: 80, monthlyBudgetCeiling: 10000 },
          confidence: 1.0,
          importance: 7,
          isApproved: true,
          source: 'onboarding',
        },
        'admin',
        'Beta onboarding'
      );

      // Querying Alpha must return Alpha only
      const alphaEntry = await retrieval.getEntry('client_alpha', 'business_goals');
      assert.ok(alphaEntry);
      assert.strictEqual(alphaEntry.clientId, 'client_alpha');
      assert.strictEqual((alphaEntry.value as BusinessGoals).targetRoasFloor, 5.0);

      // Beta must not see Alpha's values
      const betaEntry = await retrieval.getEntry('client_beta', 'business_goals');
      assert.ok(betaEntry);
      assert.strictEqual(betaEntry.clientId, 'client_beta');
      assert.strictEqual((betaEntry.value as BusinessGoals).targetRoasFloor, 2.0);

      // Cross-client isolation check
      const alphaEntries = await retrieval.getAllEntries('client_alpha');
      assert.strictEqual(alphaEntries.length, 1);
      assert.strictEqual(alphaEntries[0].clientId, 'client_alpha');

      // Invalid client ID query throws ValidationException
      await assert.rejects(async () => {
        await retrieval.getAllEntries('');
      }, ValidationException);
    });

    it('should construct consolidated ClientMemoryProfile accurately', async () => {
      const storage = new Map<string, Map<string, MemoryEntry>>();
      const retrieval = new MemoryRetrieval(storage);
      const updater = new MemoryUpdater(storage);

      await updater.createEntry(
        {
          id: 'mem_goals',
          clientId: 'client_gamma',
          category: 'BUSINESS_GOALS',
          key: 'business_goals',
          value: { targetRoasFloor: 3.2, maxAllowableCpa: 55, monthlyBudgetCeiling: 15000 },
          confidence: 1.0,
          importance: 9,
          isApproved: true,
          source: 'setup',
        },
        'admin',
        'Setup goals'
      );

      await updater.createEntry(
        {
          id: 'mem_naming',
          clientId: 'client_gamma',
          category: 'NAMING_CONVENTIONS',
          key: 'naming_conventions',
          value: {
            campaignTemplate: '{PLATFORM}_{VERTICAL}_{OBJECTIVE}',
            adGroupTemplate: '{AUDIENCE}_{ANGLE}',
            creativeTemplate: '{HOOK}_{FORMAT}_{DATE}',
          },
          confidence: 1.0,
          importance: 7,
          isApproved: true,
          source: 'setup',
        },
        'admin',
        'Setup naming'
      );

      const profile = await retrieval.getProfile('client_gamma');
      assert.strictEqual(profile.clientId, 'client_gamma');
      assert.strictEqual(profile.businessGoals?.targetRoasFloor, 3.2);
      assert.strictEqual(profile.namingConventions?.campaignTemplate, '{PLATFORM}_{VERTICAL}_{OBJECTIVE}');
      assert.strictEqual(profile.rawEntries.length, 2);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Memory Update & Traceable Audit Trail
  // --------------------------------------------------------------------------
  describe('4. MemoryUpdater & Traceability Audit Log', () => {
    it('should update memory entries with version bumping and append audit log', async () => {
      const storage = new Map<string, Map<string, MemoryEntry>>();
      const updater = new MemoryUpdater(storage);

      // 1. Initial creation (Version 1)
      const initial = await updater.createEntry<BusinessGoals>(
        {
          id: 'mem_update_test',
          clientId: 'client_audit_01',
          category: 'BUSINESS_GOALS',
          key: 'business_goals',
          value: { targetRoasFloor: 2.5, maxAllowableCpa: 60, monthlyBudgetCeiling: 20000 },
          confidence: 0.9,
          importance: 8,
          isApproved: true,
          source: 'initial_brief',
        },
        'marketing_director',
        'Initial quarterly targets'
      );

      assert.strictEqual(initial.version, 1);
      assert.strictEqual(initial.auditTrail.length, 1);
      assert.strictEqual(initial.auditTrail[0].action, 'CREATE');
      assert.strictEqual(initial.auditTrail[0].actor, 'marketing_director');

      // 2. First update (Version 2)
      const updatedV2 = await updater.updateEntry<BusinessGoals>(
        'client_audit_01',
        'business_goals',
        { targetRoasFloor: 3.0, maxAllowableCpa: 50, monthlyBudgetCeiling: 25000 },
        'cmo_user',
        'Adjusted targets after Q1 profitability review',
        { confidence: 0.98, importance: 9 }
      );

      assert.strictEqual(updatedV2.version, 2);
      assert.strictEqual(updatedV2.value.targetRoasFloor, 3.0);
      assert.strictEqual(updatedV2.confidence, 0.98);
      assert.strictEqual(updatedV2.auditTrail.length, 2);
      assert.strictEqual(updatedV2.auditTrail[1].action, 'UPDATE');
      assert.strictEqual(updatedV2.auditTrail[1].actor, 'cmo_user');
      assert.strictEqual((updatedV2.auditTrail[1].previousValue as BusinessGoals).targetRoasFloor, 2.5);

      // 3. Attempting update with prohibited data must fail and preserve state
      await assert.rejects(async () => {
        await updater.updateEntry(
          'client_audit_01',
          'business_goals',
          { targetRoasFloor: 3.0, secretKey: 'EAAB123456789' },
          'hacker',
          'Inject token'
        );
      }, ValidationException);

      // State remains V2
      const current = storage.get('client_audit_01')?.get('business_goals');
      assert.strictEqual(current?.version, 2);
    });

    it('should reject update if actor or reason is missing', async () => {
      const storage = new Map<string, Map<string, MemoryEntry>>();
      const updater = new MemoryUpdater(storage);

      await updater.createEntry(
        {
          id: 'mem_test',
          clientId: 'client_01',
          category: 'BUSINESS_GOALS',
          key: 'goals',
          value: { targetRoasFloor: 2.0 },
          confidence: 0.8,
          importance: 5,
          isApproved: true,
          source: 'test',
        },
        'admin',
        'initial'
      );

      await assert.rejects(async () => {
        await updater.updateEntry('client_01', 'goals', { targetRoasFloor: 3.0 }, '', 'reason');
      }, ValidationException);

      await assert.rejects(async () => {
        await updater.updateEntry('client_01', 'goals', { targetRoasFloor: 3.0 }, 'admin', '');
      }, ValidationException);
    });
  });

  // --------------------------------------------------------------------------
  // 5. MemoryManager & Prompt Context Grounding
  // --------------------------------------------------------------------------
  describe('5. MemoryManager & Safe Prompt Context Generation', () => {
    it('should satisfy Contract 8 getClientMemory and updateClientMemory', async () => {
      const manager = new MemoryManager();

      // Initial defaults
      const initial = await manager.getClientMemory('client_contract8_01');
      assert.strictEqual(initial.clientId, 'client_contract8_01');
      assert.strictEqual(initial.targetRoasFloor, 2.5);
      assert.strictEqual(initial.targetCpaThreshold, 50);

      // Update via Contract 8
      const updated = await manager.updateClientMemory(
        'client_contract8_01',
        {
          targetRoasFloor: 4.2,
          targetCpaThreshold: 35,
          brandVoice: 'Sleek, minimalist, premium',
          approvedKeywords: ['luxury leather', 'handcrafted footwear'],
          negativeKeywords: ['cheap', 'replica', 'discount'],
        },
        'lead_strategist',
        'Q2 Premium Pivot'
      );

      assert.strictEqual(updated.targetRoasFloor, 4.2);
      assert.strictEqual(updated.targetCpaThreshold, 35);
      assert.strictEqual(updated.brandVoice, 'Sleek, minimalist, premium');
      assert.deepStrictEqual(updated.approvedKeywords, ['luxury leather', 'handcrafted footwear']);
      assert.deepStrictEqual(updated.negativeKeywords, ['cheap', 'replica', 'discount']);
    });

    it('should extract structured Markdown prompt context with zero PII and zero metrics', async () => {
      const manager = new MemoryManager();
      const clientId = 'client_omnichannel_01';

      // Seed business goals
      await manager.setEntry<BusinessGoals>(
        {
          id: `mem_${clientId}_goals`,
          clientId,
          category: 'BUSINESS_GOALS',
          key: 'business_goals',
          value: {
            targetRoasFloor: 3.8,
            maxAllowableCpa: 42,
            monthlyBudgetCeiling: 30000,
            targetProfitMargin: 25,
            targetAov: 120,
          },
          confidence: 1.0,
          importance: 9,
          isApproved: true,
          source: 'onboarding',
        },
        'admin',
        'Initial setup'
      );

      // Seed platform preferences & brand voice
      await manager.setEntry<PlatformPreferences>(
        {
          id: `mem_${clientId}_plat`,
          clientId,
          category: 'PLATFORM_PREFERENCES',
          key: 'platform_preferences',
          value: {
            preferredPlatforms: ['GOOGLE', 'META', 'TIKTOK'],
            defaultBudgetSplit: { GOOGLE: 50, META: 35, TIKTOK: 15 },
            brandVoice: {
              tone: 'Bold, innovative, customer-obsessed',
              prohibitedWords: ['bargain', 'clearance'],
              coreSellingPropositions: ['Next-gen automation', 'Enterprise security'],
              approvedThemes: ['High Performance', 'Scalability'],
            },
            negativeKeywords: ['free', 'torrent'],
            excludedGeographies: ['US-AK', 'US-HI'],
          },
          confidence: 1.0,
          importance: 9,
          isApproved: true,
          source: 'onboarding',
        },
        'admin',
        'Initial setup'
      );

      // Seed governance rules
      await manager.setEntry<ApprovalRules>(
        {
          id: `mem_${clientId}_approval`,
          clientId,
          category: 'APPROVAL_RULES',
          key: 'approval_rules',
          value: {
            autoApproveBudgetThreshold: 1000,
            requireHumanForCreativeDelete: true,
            requireHumanForAudienceDelete: true,
            highRiskRoasProtectionThreshold: 3.0,
            requireApprovalForNewCampaign: true,
          },
          confidence: 1.0,
          importance: 8,
          isApproved: true,
          source: 'onboarding',
        },
        'admin',
        'Initial setup'
      );

      const promptContext = await manager.extractContextForPrompt(clientId);

      // Verify sections and contents
      assert.ok(promptContext.includes('### CLIENT BUSINESS MEMORY'));
      assert.ok(promptContext.includes('Target ROAS Floor: 3.8x'));
      assert.ok(promptContext.includes('Maximum Allowable CPA: $42'));
      assert.ok(promptContext.includes('GOOGLE: 50%, META: 35%, TIKTOK: 15%'));
      assert.ok(promptContext.includes('Bold, innovative, customer-obsessed'));
      assert.ok(promptContext.includes('Next-gen automation'));
      assert.ok(promptContext.includes('Auto-Approve Budget Adjustment Threshold: $1000/day'));

      // Strict safety validation: verify zero PII and zero credentials in prompt text
      const safetyCheck = validator.validateProhibitedContent(promptContext);
      assert.strictEqual(safetyCheck.hasProhibited, false);
    });

    it('should support isolated disk partition serialization and hydration', async () => {
      const testDir = path.join(process.cwd(), 'data', 'test-memory-scratch');
      const manager = new MemoryManager({ storageDir: testDir });
      const clientId = 'client_persist_01';

      try {
        await manager.setEntry<BusinessGoals>(
          {
            id: `mem_${clientId}_goals`,
            clientId,
            category: 'BUSINESS_GOALS',
            key: 'business_goals',
            value: { targetRoasFloor: 4.5, maxAllowableCpa: 28, monthlyBudgetCeiling: 18000 },
            confidence: 0.95,
            importance: 9,
            isApproved: true,
            source: 'test_persist',
          },
          'admin',
          'Disk test setup'
        );

        // Save to disk
        await manager.saveToDisk(testDir);
        const savedFilePath = path.join(testDir, `${clientId}.json`);
        assert.ok(fs.existsSync(savedFilePath));

        // Create fresh manager instance and hydrate from disk
        const hydratedManager = new MemoryManager({ storageDir: testDir });
        const loadedCount = await hydratedManager.loadFromDisk(testDir);
        assert.ok(loadedCount >= 1);

        const hydratedEntry = await hydratedManager.getEntry(clientId, 'business_goals');
        assert.ok(hydratedEntry);
        assert.strictEqual((hydratedEntry.value as BusinessGoals).targetRoasFloor, 4.5);
      } finally {
        // Cleanup test directory
        if (fs.existsSync(testDir)) {
          fs.rmSync(testDir, { recursive: true, force: true });
        }
      }
    });
  });
});
