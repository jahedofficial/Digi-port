import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  CapabilityRegistry,
  SpecialistRegistry,
  AuditSpecialistAgent,
  CampaignSpecialistAgent,
  TrackingSpecialistAgent,
  OptimizationSpecialistAgent,
  ReportingSpecialistAgent,
  CroSpecialistAgent,
  MerchantCatalogSpecialistAgent,
  CreativeSpecialistAgent,
  CEOAgent,
  IPlatformAdapter,
  PlatformConnectionStatus,
  UnifiedAccount,
  UnifiedCampaign,
  UnifiedAdGroup,
  UnifiedAd,
  UnifiedReportMetric,
  DateRange,
  Platform,
  ClientContext,
  ScheduledTask,
  SystemException,
} from '../src/core';

// Mock Platform Adapter for Unit Tests
class TestPlatformAdapter implements IPlatformAdapter {
  constructor(public readonly platform: Platform) {}

  async verifyConnection(): Promise<PlatformConnectionStatus> {
    return {
      platform: this.platform,
      connected: true,
      accountId: `act_${this.platform.toLowerCase()}_123`,
      statusCode: 200,
      message: 'OK',
      checkedAt: new Date(),
    };
  }

  async getAccountDetails(): Promise<UnifiedAccount> {
    return {
      id: `acc_${this.platform.toLowerCase()}`,
      workspaceId: 'ws_01',
      platform: this.platform,
      externalAccountId: '1234567890',
      name: `${this.platform} Account`,
      currency: 'USD',
      timezone: 'UTC',
      status: 'ACTIVE',
      isManagerAccount: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async listCampaigns(): Promise<UnifiedCampaign[]> {
    return [
      {
        id: `camp_${this.platform.toLowerCase()}_1`,
        accountId: `acc_${this.platform.toLowerCase()}`,
        platform: this.platform,
        platformCampaignId: 'ext_1',
        name: `${this.platform} Campaign 1`,
        status: 'ACTIVE',
        objective: 'SALES',
        dailyBudget: 500,
        budgetStrategy: 'DAILY',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getCampaign(campaignId: string): Promise<UnifiedCampaign | null> {
    return {
      id: campaignId,
      accountId: `acc_${this.platform.toLowerCase()}`,
      platform: this.platform,
      platformCampaignId: 'ext_1',
      name: `Campaign ${campaignId}`,
      status: 'ACTIVE',
      objective: 'SALES',
      dailyBudget: 500,
      budgetStrategy: 'DAILY',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async createCampaign(input: any): Promise<UnifiedCampaign> {
    return {
      id: `camp_new_${Date.now()}`,
      accountId: `acc_${this.platform.toLowerCase()}`,
      platform: this.platform,
      platformCampaignId: 'ext_new',
      name: input.name,
      status: input.status,
      objective: input.objective,
      dailyBudget: input.dailyBudget ?? 100,
      budgetStrategy: input.budgetStrategy ?? 'DAILY',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateCampaignBudget(_campaignId: string, _dailyBudget: number): Promise<boolean> {
    return true;
  }

  async setCampaignStatus(_campaignId: string, _status: 'ACTIVE' | 'PAUSED'): Promise<boolean> {
    return true;
  }

  async listAdGroups(_campaignId: string): Promise<UnifiedAdGroup[]> {
    return [];
  }

  async createAdGroup(input: any): Promise<UnifiedAdGroup> {
    return {
      id: 'adg_01',
      campaignId: input.campaignId,
      platform: this.platform,
      platformAdGroupId: 'ext_adg_01',
      name: input.name,
      status: 'ACTIVE',
      bidStrategy: 'MAXIMIZE_CONVERSIONS',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async setAdGroupStatus(_adGroupId: string, _status: 'ACTIVE' | 'PAUSED'): Promise<boolean> {
    return true;
  }

  async listAds(_adGroupId: string): Promise<UnifiedAd[]> {
    return [];
  }

  async setAdStatus(_adId: string, _status: 'ACTIVE' | 'PAUSED'): Promise<boolean> {
    return true;
  }

  async fetchMetrics(_range: DateRange, _type: any): Promise<UnifiedReportMetric[]> {
    return [
      {
        platform: this.platform,
        entityType: 'ACCOUNT',
        entityId: 'acc_01',
        date: '2026-10-20',
        currency: 'USD',
        impressions: 50000,
        clicks: 2200,
        spend: 450,
        conversions: 85,
        conversionValue: 1850,
        ctr: 4.4,
        cpc: 0.2,
        cpa: 5.29,
        roas: 4.11,
      },
    ];
  }
}

describe('Phase 9 — Specialist Agents Unit Tests', () => {
  const adapters = new Map<Platform, IPlatformAdapter>([
    ['GOOGLE', new TestPlatformAdapter('GOOGLE')],
    ['META', new TestPlatformAdapter('META')],
    ['TIKTOK', new TestPlatformAdapter('TIKTOK')],
  ]);

  const testClientContext: ClientContext = {
    clientId: 'client_retail_001',
    workspaceId: 'ws_01',
    brandVoice: 'Dynamic, premium, direct-to-consumer',
    currency: 'USD',
    activePlatforms: ['GOOGLE', 'META', 'TIKTOK'],
    monthlyBudgetCap: 50000,
    industry: 'ecommerce',
  };

  // --------------------------------------------------------------------------
  // 1. Capability Registry & Schema Validation
  // --------------------------------------------------------------------------
  describe('1. CapabilityRegistry & Schema Validation', () => {
    it('should successfully load all capability definitions from assets/agent-capabilities/', async () => {
      const registry = new CapabilityRegistry();
      const capabilities = await registry.loadFromDisk();

      assert.ok(capabilities.length >= 10, `Expected at least 10 capabilities, found ${capabilities.length}`);
    });

    it('every capability definition must include all 14 required Blueprint fields', async () => {
      const registry = new CapabilityRegistry();
      const capabilities = await registry.loadFromDisk();

      for (const cap of capabilities) {
        assert.ok(cap.id, `Capability must have 'id': ${JSON.stringify(cap)}`);
        assert.ok(cap.agentName, `Capability must have 'agentName': ${cap.id}`);
        assert.ok(Array.isArray(cap.supportedPlatforms) && cap.supportedPlatforms.length > 0, `Missing supportedPlatforms: ${cap.id}`);
        assert.ok(typeof cap.supportedCampaignTypes === 'object', `Missing supportedCampaignTypes: ${cap.id}`);
        assert.ok(typeof cap.supportedObjectives === 'object', `Missing supportedObjectives: ${cap.id}`);
        assert.ok(Array.isArray(cap.supportedOperations) && cap.supportedOperations.length > 0, `Missing supportedOperations: ${cap.id}`);
        assert.ok(Array.isArray(cap.supportedServices), `Missing supportedServices: ${cap.id}`);
        assert.ok(Array.isArray(cap.supportedAssetTypes), `Missing supportedAssetTypes: ${cap.id}`);
        assert.ok(Array.isArray(cap.supportedExtensions), `Missing supportedExtensions: ${cap.id}`);
        assert.ok(Array.isArray(cap.supportedBiddingStrategies), `Missing supportedBiddingStrategies: ${cap.id}`);
        assert.ok(Array.isArray(cap.requiredInputs) && cap.requiredInputs.length > 0, `Missing requiredInputs: ${cap.id}`);
        assert.ok(Array.isArray(cap.expectedOutputs) && cap.expectedOutputs.length > 0, `Missing expectedOutputs: ${cap.id}`);
        assert.strictEqual(typeof cap.requiredApprovals, 'boolean', `requiredApprovals must be boolean: ${cap.id}`);
        assert.ok(Array.isArray(cap.validationRules) && cap.validationRules.length > 0, `Missing validationRules: ${cap.id}`);
        assert.ok(Array.isArray(cap.failureConditions) && cap.failureConditions.length > 0, `Missing failureConditions: ${cap.id}`);
        assert.ok(typeof cap.recoveryStrategy === 'string' && cap.recoveryStrategy.length > 0, `Missing recoveryStrategy: ${cap.id}`);
      }
    });

    it('should throw SystemException if capability directory does not exist', async () => {
      const registry = new CapabilityRegistry('./non_existent_caps_dir');
      await assert.rejects(async () => {
        await registry.loadFromDisk();
      }, SystemException);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Specialist Roster & Interface Compliance
  // --------------------------------------------------------------------------
  describe('2. Specialist Roster & Interface Compliance', () => {
    it('should create default roster containing all 8 distinct Specialist Agents', () => {
      const roster = SpecialistRegistry.createDefaultRoster(adapters);
      const agents = roster.getAllAgents();

      assert.strictEqual(agents.length, 8);
      const agentNames = agents.map((a) => a.getCapabilities().agentName);

      assert.ok(agentNames.includes('AuditSpecialistAgent'));
      assert.ok(agentNames.includes('CampaignSpecialistAgent'));
      assert.ok(agentNames.includes('TrackingSpecialistAgent'));
      assert.ok(agentNames.includes('OptimizationSpecialistAgent'));
      assert.ok(agentNames.includes('ReportingSpecialistAgent'));
      assert.ok(agentNames.includes('CroSpecialistAgent'));
      assert.ok(agentNames.includes('MerchantCatalogSpecialistAgent'));
      assert.ok(agentNames.includes('CreativeSpecialistAgent'));
    });

    it('should find agents by operation and platform', () => {
      const roster = SpecialistRegistry.createDefaultRoster(adapters);

      const auditAgents = roster.getAgentsForOperation('AUDIT', 'GOOGLE');
      assert.strictEqual(auditAgents.length, 1);
      assert.strictEqual(auditAgents[0].getCapabilities().agentName, 'AuditSpecialistAgent');

      const launchAgents = roster.getAgentsForOperation('LAUNCH', 'META');
      assert.strictEqual(launchAgents.length, 1);
      assert.strictEqual(launchAgents[0].getCapabilities().agentName, 'CampaignSpecialistAgent');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Specialist Agents Execution Contracts
  // --------------------------------------------------------------------------
  describe('3. Specialist Agents Execution Contracts (All 8 Agents)', () => {
    it('1. AuditSpecialistAgent should audit active campaigns and produce bilingual report', async () => {
      const agent = new AuditSpecialistAgent(adapters);
      const task: ScheduledTask = {
        id: 'task_audit_01',
        title: 'Audit Google and Meta campaigns',
        operation: 'AUDIT',
        platform: 'CROSS_PLATFORM',
        agentName: 'AuditSpecialistAgent',
        parameters: {},
        requiresApproval: false,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.executionStatus, 'COMPLETED');
      assert.ok(result.summaryBangla.includes('অডিট'));
      assert.ok(result.summaryEnglish.includes('Audit completed'));
      assert.ok(result.affectedEntities.length >= 2);
    });

    it('2. CampaignSpecialistAgent should launch new campaign on target platform', async () => {
      const agent = new CampaignSpecialistAgent(adapters);
      const task: ScheduledTask = {
        id: 'task_launch_01',
        title: 'Launch Performance Max Campaign',
        operation: 'LAUNCH',
        platform: 'GOOGLE',
        agentName: 'CampaignSpecialistAgent',
        parameters: {
          campaignName: 'Test PMax Launch',
          campaignType: 'PERFORMANCE_MAX',
          dailyBudget: 250,
        },
        requiresApproval: true,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.executionStatus, 'COMPLETED');
      assert.ok(result.summaryBangla.includes('GOOGLE'));
      assert.ok(result.summaryEnglish.includes('Successfully launched'));
      assert.strictEqual(result.affectedEntities[0].actionTaken, 'CREATED_AND_ACTIVATED');
    });

    it('3. TrackingSpecialistAgent should verify CAPI and Pixel streams', async () => {
      const agent = new TrackingSpecialistAgent(adapters);
      const task: ScheduledTask = {
        id: 'task_track_01',
        title: 'Verify Pixel Health',
        operation: 'VERIFY_TRACKING',
        platform: 'CROSS_PLATFORM',
        agentName: 'TrackingSpecialistAgent',
        parameters: {},
        requiresApproval: false,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.executionStatus, 'COMPLETED');
      assert.ok(result.metricsObserved?.deduplicationRatio);
      assert.ok(result.summaryBangla.includes('ট্র্যাকিং'));
    });

    it('4. OptimizationSpecialistAgent should update campaign daily budget', async () => {
      const agent = new OptimizationSpecialistAgent(adapters);
      const task: ScheduledTask = {
        id: 'task_opt_01',
        title: 'Rebalance Daily Budget',
        operation: 'OPTIMIZE',
        platform: 'META',
        agentName: 'OptimizationSpecialistAgent',
        parameters: {
          campaignId: 'camp_meta_1',
          newDailyBudget: 350,
        },
        requiresApproval: true,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.executionStatus, 'COMPLETED');
      assert.strictEqual(result.metricsObserved?.adjustedDailyBudget, 350);
      assert.ok(result.summaryBangla.includes('অপটিমাইজ'));
    });

    it('5. ReportingSpecialistAgent should fetch metrics and generate blended ROAS summary', async () => {
      const agent = new ReportingSpecialistAgent(adapters);
      const task: ScheduledTask = {
        id: 'task_rep_01',
        title: 'Generate Weekly Executive Summary',
        operation: 'REPORT',
        platform: 'CROSS_PLATFORM',
        agentName: 'ReportingSpecialistAgent',
        parameters: {},
        requiresApproval: false,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.executionStatus, 'COMPLETED');
      assert.ok(result.metricsObserved?.blendedRoas);
      assert.ok(result.summaryBangla.includes('রিপোর্টিং'));
    });

    it('6. CroSpecialistAgent should audit landing page experience and speed', async () => {
      const agent = new CroSpecialistAgent(adapters);
      const task: ScheduledTask = {
        id: 'task_cro_01',
        title: 'Audit Shop Landing Page',
        operation: 'CRO_AUDIT',
        platform: 'CROSS_PLATFORM',
        agentName: 'CroSpecialistAgent',
        parameters: { landingPageUrl: 'https://myshop.com/summer-sale' },
        requiresApproval: false,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.executionStatus, 'COMPLETED');
      assert.strictEqual(result.metricsObserved?.conversionFrictionIndex, 'LOW');
      assert.ok(result.summaryBangla.includes('CRO'));
    });

    it('7. MerchantCatalogSpecialistAgent should inspect product catalog feed', async () => {
      const agent = new MerchantCatalogSpecialistAgent(adapters);
      const task: ScheduledTask = {
        id: 'task_cat_01',
        title: 'Audit Google Merchant Center Feed',
        operation: 'CATALOG_AUDIT',
        platform: 'GOOGLE',
        agentName: 'MerchantCatalogSpecialistAgent',
        parameters: { totalProducts: 2500, disapproved: 15 },
        requiresApproval: false,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.executionStatus, 'COMPLETED');
      assert.strictEqual(result.metricsObserved?.approvedProducts, 2485);
      assert.ok(result.summaryBangla.includes('ক্যাটালগ'));
    });

    it('8. CreativeSpecialistAgent should evaluate creative fatigue without business decision tampering', async () => {
      const agent = new CreativeSpecialistAgent(adapters);
      const task: ScheduledTask = {
        id: 'task_cre_01',
        title: 'Evaluate TikTok Ad Fatigue',
        operation: 'CREATIVE_ANALYSIS',
        platform: 'TIKTOK',
        agentName: 'CreativeSpecialistAgent',
        parameters: { assetCount: 12, fatiguedCount: 3 },
        requiresApproval: false,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.executionStatus, 'COMPLETED');
      assert.strictEqual(result.metricsObserved?.fatiguedCount, 3);
      assert.ok(result.summaryBangla.includes('ক্রিয়েটিভ'));
    });
  });

  // --------------------------------------------------------------------------
  // 4. Prerequisite & Error Handling Boundary
  // --------------------------------------------------------------------------
  describe('4. Prerequisite & Error Boundary Handling', () => {
    it('should reject task if operation is not supported by specialist', async () => {
      const agent = new AuditSpecialistAgent(adapters);
      const task: ScheduledTask = {
        id: 'task_invalid_op',
        title: 'Invalid Launch on Audit Agent',
        operation: 'LAUNCH', // Audit agent only supports AUDIT
        platform: 'GOOGLE',
        agentName: 'AuditSpecialistAgent',
        parameters: {},
        requiresApproval: false,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.executionStatus, 'FAILED');
      assert.strictEqual(result.error?.code, 'ERR_PREREQUISITE_FAILED');
      assert.strictEqual(result.error?.recoverable, false);
    });

    it('should reject task if platform adapter is missing', async () => {
      const emptyAdapters = new Map<Platform, IPlatformAdapter>();
      const agent = new CampaignSpecialistAgent(emptyAdapters);

      const task: ScheduledTask = {
        id: 'task_no_adapter',
        title: 'Launch with missing adapter',
        operation: 'LAUNCH',
        platform: 'META',
        agentName: 'CampaignSpecialistAgent',
        parameters: {},
        requiresApproval: true,
        order: 1,
      };

      const result = await agent.executeTask(task, testClientContext);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error?.code, 'ERR_PREREQUISITE_FAILED');
    });
  });

  // --------------------------------------------------------------------------
  // 5. CEO Agent Orchestration Integration
  // --------------------------------------------------------------------------
  describe('5. CEO Agent Registration & End-to-End Orchestration', () => {
    it('should register all 8 specialist agents into CEOAgent and delegate execution', async () => {
      const ceo = new CEOAgent();
      const roster = SpecialistRegistry.createDefaultRoster(adapters);

      for (const agent of roster.getAllAgents()) {
        ceo.registerSpecialist(agent);
      }

      const registered = ceo.getRegisteredSpecialists();
      assert.strictEqual(registered.length, 8);

      // Verify CEO coordinates execution with approved plan
      const plan = await ceo.parseObjective(
        'Run complete marketing audit across Google and Meta',
        testClientContext
      );
      assert.ok(plan.tasks.length > 0);

      const approved = await ceo.approvePlan(plan.id, 'admin_user');
      assert.strictEqual(approved, true);

      const summary = await ceo.coordinateExecution(plan, testClientContext);
      assert.strictEqual(summary.success, true);
      assert.ok(summary.completedTasks > 0);
      assert.ok(summary.summaryBangla.length > 0);
    });
  });
});
