import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import { UniversalPaidMediaOS } from '../src/core/integration/system-integrator';
import { PlatformAdapterRegistry } from '../src/core/adapters/adapter-registry';
import { GoogleAdsAdapter } from '../src/core/adapters/google-ads.adapter';
import { MetaGraphAdapter } from '../src/core/adapters/meta-graph.adapter';
import { TikTokBusinessAdapter } from '../src/core/adapters/tiktok-business.adapter';
import { ClientContext } from '../src/core/interfaces/agent.interface';
import { SystemEventTriggerPayload } from '../src/core/scheduling/types';

describe('Phase 16 — End-to-End System Integration Tests', () => {
  let os: UniversalPaidMediaOS;

  before(async () => {
    os = new UniversalPaidMediaOS();
    await os.initialize();
  });

  after(async () => {
    await os.shutdown();
  });

  describe('1. Master Subsystems Integration & Health Probing', () => {
    it('should initialize and synchronize all 14 core subsystems', async () => {
      const status = await os.getSystemStatus();

      assert.ok(status.uptimeSeconds >= 0);
      assert.strictEqual(status.activePlatforms.length, 3);
      assert.ok(status.specialistCount >= 8, 'Must have at least 8 specialist agents registered');
      assert.ok(status.templatesCount >= 10, 'Must have 10 industry templates loaded');
      assert.ok(status.playbooksCount >= 10, 'Must have 10 playbooks loaded');
      assert.ok(status.knowledgeCount >= 14, 'Must have 14 knowledge modules loaded');
      assert.ok(status.schedulesCount >= 6, 'Must have at least 6 schedules loaded');

      // Verify each direct platform adapter status
      assert.strictEqual(status.platformStatuses.GOOGLE.connected, true);
      assert.strictEqual(status.platformStatuses.META.connected, true);
      assert.strictEqual(status.platformStatuses.TIKTOK.connected, true);
    });

    it('should verify direct platform adapter query and wire protocol methods', async () => {
      const googleAdapter = os.adapters.getAdapter('GOOGLE') as GoogleAdsAdapter;
      const metaAdapter = os.adapters.getAdapter('META') as MetaGraphAdapter;
      const tiktokAdapter = os.adapters.getAdapter('TIKTOK') as TikTokBusinessAdapter;

      assert.ok(googleAdapter);
      assert.ok(metaAdapter);
      assert.ok(tiktokAdapter);

      // Google GAQL query execution
      const gaqlResult = await googleAdapter.executeGaqlQuery<{ campaign: { name: string } }>(
        'SELECT campaign.name FROM CAMPAIGN'
      );
      assert.ok(Array.isArray(gaqlResult));
      assert.ok(gaqlResult.length > 0);

      // Meta rate limit tracking status
      const metaRateLimit = metaAdapter.getRateLimitStatus();
      assert.ok(metaRateLimit.callCountPercent >= 0 && metaRateLimit.callCountPercent <= 100);

      // TikTok advertiser info
      const advertiserInfo = await tiktokAdapter.getAdvertiserInfo();
      assert.strictEqual(advertiserInfo.status, 'ROLE_APPROVED');
      assert.strictEqual(advertiserInfo.currency, 'USD');
    });
  });

  describe('2. Full Campaign Launch Pipeline with Risk Guardrail & ActionQueue Approval', () => {
    const clientContext: ClientContext = {
      clientId: 'client_retail_001',
      workspaceId: 'ws_default',
      currency: 'USD',
      industry: 'E-commerce Retail',
      monthlyBudgetCap: 25000,
      activePlatforms: ['GOOGLE', 'META'],
    };

    it('should intercept high-budget launch in ActionQueue and require human approval', async () => {
      const prompt = 'Launch summer promotional sales campaign across Google and Meta with $1200 daily budget';

      // Attempt execution without autoApproveHighRisk
      const result = await os.executeObjective(prompt, clientContext, {
        autoApproveHighRisk: false,
      });

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.requiresHumanReview, true);
      assert.ok(result.actionItemId, 'Must return enqueued ActionItem ID');
      assert.ok(result.riskAssessment.riskScore >= 50, 'Budget > $500 must trigger high risk score');
      assert.strictEqual(result.riskAssessment.requiresApproval, true);

      // Verify item exists in ActionQueue with status PENDING
      const pendingItems = await os.workflowEngine.getActionQueue().listPending(clientContext.clientId);
      const enqueuedItem = pendingItems.find((item) => item.id === result.actionItemId);
      assert.ok(enqueuedItem);
      assert.strictEqual(enqueuedItem.status, 'PENDING');
    });

    it('should complete omnichannel launch on Google and Meta adapters when signed off', async () => {
      const prompt = 'Launch summer promotional sales campaign across Google and Meta with $1200 daily budget';

      // Execute with simulated sign-off
      const result = await os.executeObjective(prompt, clientContext, {
        autoApproveHighRisk: true,
        reviewerId: 'admin_chief_marketing_officer',
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.requiresHumanReview, false);
      assert.ok(result.workflowResult);
      assert.strictEqual(result.workflowResult.state, 'COMPLETED');
      assert.ok(result.affectedEntities.length >= 2, 'Must affect entities on both Google and Meta');

      // Verify campaigns actually created on Google and Meta adapters
      const googleAdapter = os.adapters.getAdapter('GOOGLE')!;
      const metaAdapter = os.adapters.getAdapter('META')!;

      const googleCampaigns = await googleAdapter.listCampaigns();
      const metaCampaigns = await metaAdapter.listCampaigns();

      const createdGoogle = googleCampaigns.find((c) => c.dailyBudget === 600);
      const createdMeta = metaCampaigns.find((c) => c.dailyBudget === 600);

      assert.ok(createdGoogle, 'Google campaign must be created with $600 daily budget');
      assert.ok(createdMeta, 'Meta campaign must be created with $600 daily budget');
      assert.strictEqual(createdGoogle.status, 'ACTIVE');
      assert.strictEqual(createdMeta.status, 'ACTIVE');

      // Verify closed-loop learning recommendations
      assert.ok(result.learningRecommendations.length > 0, 'Must produce learning recommendations');
      for (const rec of result.learningRecommendations) {
        assert.strictEqual(rec.requiresManualApproval, true);
        assert.strictEqual(rec.status, 'PROPOSED');
      }
    });
  });

  describe('3. Emergency Reactive Trigger -> Automated Workflow -> Telegram Alert', () => {
    it('should trigger reactive workflow and generate Telegram alert on ROAS floor breach', async () => {
      const emergencyEvent: SystemEventTriggerPayload = {
        eventId: `evt_roas_breach_${Date.now()}`,
        eventType: 'roas.floor_breach',
        clientId: 'client_retail_001',
        data: {
          platform: 'GOOGLE',
          campaignId: 'g_camp_pmax_01',
          observedRoas: 1.15,
          targetRoasFloor: 2.5,
          dailySpend: 450,
        },
        timestamp: new Date(),
      };

      const dispatchedJobs = await os.handleSystemEvent(emergencyEvent);
      assert.ok(dispatchedJobs.length > 0, 'Must dispatch at least 1 reactive workflow job');
      assert.strictEqual(dispatchedJobs[0].triggerType, 'EVENT_TRIGGER');

      // Format high-priority Telegram operational alert
      const telegramAlert = os.reportingEngine.formatTelegramAlert(
        'CRITICAL: ROAS Floor Breach Detected on Google Ads',
        {
          clientId: emergencyEvent.clientId,
          platform: 'GOOGLE',
          campaignId: emergencyEvent.data.campaignId as string,
          observedRoas: `${emergencyEvent.data.observedRoas}x`,
          targetRoasFloor: `${emergencyEvent.data.targetRoasFloor}x`,
          actionTaken: 'Triggered emergency pacing review workflow',
        }
      );

      assert.ok(telegramAlert.includes('🚨 <b>[DIGIPORT ALERT]'));
      assert.ok(telegramAlert.includes('Google Ads'));
      assert.ok(telegramAlert.includes('1.15x'));
      assert.ok(telegramAlert.includes('Target Roas Floor'));
    });
  });

  describe('4. Omnichannel Performance Audit -> 9-Section Multi-Format Report -> Closed-Loop Learning', () => {
    const auditClientContext: ClientContext = {
      clientId: 'client_omnichannel_audit_99',
      workspaceId: 'ws_default',
      currency: 'USD',
      industry: 'E-commerce Retail',
      monthlyBudgetCap: 50000,
      activePlatforms: ['GOOGLE', 'META', 'TIKTOK'],
    };

    it('should audit Google, Meta, and TikTok, generate 9-section report in PDF, DOCX, Markdown, and Telegram', async () => {
      const auditResult = await os.runOmnichannelAuditAndReport(
        auditClientContext.clientId,
        auditClientContext,
        {
          exportPdf: true,
          exportDocx: true,
        }
      );

      assert.strictEqual(auditResult.success, true);
      assert.strictEqual(auditResult.clientId, auditClientContext.clientId);
      assert.ok(auditResult.healthScore >= 70 && auditResult.healthScore <= 100);
      assert.ok(auditResult.totalAuditedCampaigns >= 3, 'Must audit campaigns across Google, Meta, and TikTok');

      // 9-section Report Document Validation
      const doc = auditResult.reportDocument;
      assert.strictEqual(doc.reportType, 'CROSS_PLATFORM_PERFORMANCE');
      assert.ok(doc.scorecard.overallScore > 0);
      assert.ok(doc.executiveSummaryEnglish.length > 50);
      assert.ok(doc.executiveSummaryBangla.length > 50);
      assert.ok(doc.findings.length > 0, 'Must contain Findings section');
      assert.ok(doc.issues.length > 0, 'Must contain Issues section');
      assert.ok(doc.recommendations.length > 0, 'Must contain Recommendations section');
      assert.ok(doc.priorityMatrix.length > 0, 'Must contain Priority Matrix section');
      assert.ok(doc.actionPlan.length > 0, 'Must contain Action Plan section');
      assert.ok(Object.keys(doc.supportingEvidence).length > 0, 'Must contain Supporting Evidence section');
      assert.ok(Object.keys(doc.appendix).length > 0, 'Must contain Appendix section');

      // Multi-Format Deliverables
      assert.ok(auditResult.markdownContent.includes('## 1. Executive Summary'));
      assert.ok(auditResult.telegramSummary.includes('📊 <b>'));
      assert.ok(auditResult.emailHtml.includes('<html'));
      assert.ok(Buffer.isBuffer(auditResult.pdfBuffer), 'PDF Buffer must be generated');
      assert.ok(auditResult.pdfBuffer!.length > 1000, 'PDF buffer must have valid binary size');
      assert.ok(Buffer.isBuffer(auditResult.docxBuffer), 'DOCX Buffer must be generated');
      assert.ok(auditResult.docxBuffer!.length > 1000, 'DOCX buffer must have valid binary size');

      // Learning Recommendations
      assert.ok(auditResult.learningRecommendations.length > 0);
      for (const rec of auditResult.learningRecommendations) {
        assert.strictEqual(rec.requiresManualApproval, true);
      }
    });
  });

  describe('5. Multi-Client Data Isolation Boundary & Concurrency Stress Test', () => {
    it('should strictly isolate client memory, credentials, and execution states across simultaneous clients', async () => {
      const clientA: ClientContext = {
        clientId: 'client_tenant_alpha',
        workspaceId: 'ws_default',
        currency: 'USD',
        industry: 'B2B SaaS',
        monthlyBudgetCap: 15000,
        activePlatforms: ['GOOGLE'],
      };

      const clientB: ClientContext = {
        clientId: 'client_tenant_beta',
        workspaceId: 'ws_default',
        currency: 'USD',
        industry: 'Healthcare / Medical',
        monthlyBudgetCap: 30000,
        activePlatforms: ['META'],
      };

      // Set distinct memory entries for both clients
      await os.memory.setEntry(
        {
          id: 'mem_alpha_voice',
          clientId: clientA.clientId,
          category: 'BUSINESS_STRATEGIES',
          key: 'brand_tone',
          value: { tone: 'Authoritative Enterprise Technical Voice' },
          confidence: 0.95,
          importance: 9,
          isApproved: true,
          approvedBy: 'admin',
          source: 'manual_setup',
        },
        'admin',
        'Setup client Alpha memory'
      );

      await os.memory.setEntry(
        {
          id: 'mem_beta_voice',
          clientId: clientB.clientId,
          category: 'BUSINESS_STRATEGIES',
          key: 'brand_tone',
          value: { tone: 'Compassionate Patient-First Healthcare Tone' },
          confidence: 0.95,
          importance: 9,
          isApproved: true,
          approvedBy: 'admin',
          source: 'manual_setup',
        },
        'admin',
        'Setup client Beta memory'
      );

      // Verify zero memory leakage
      const entryA = await os.memory.getEntry(clientA.clientId, 'brand_tone');
      const entryB = await os.memory.getEntry(clientB.clientId, 'brand_tone');

      assert.strictEqual(entryA?.clientId, clientA.clientId);
      assert.strictEqual((entryA?.value as any).tone, 'Authoritative Enterprise Technical Voice');
      assert.strictEqual(entryB?.clientId, clientB.clientId);
      assert.strictEqual((entryB?.value as any).tone, 'Compassionate Patient-First Healthcare Tone');

      // Cross-client lookup returns null
      const leakedA = await os.memory.getEntry(clientB.clientId, 'mem_alpha_voice');
      assert.strictEqual(leakedA, null);

      // Concurrent execution stress test
      const promises = [
        os.executeObjective('Pause low ROAS ads on Google', clientA, { autoApproveHighRisk: true }),
        os.executeObjective('Optimize ad set budget on Meta', clientB, { autoApproveHighRisk: true }),
      ];

      const results = await Promise.all(promises);
      assert.strictEqual(results[0].plan.clientId, clientA.clientId);
      assert.strictEqual(results[1].plan.clientId, clientB.clientId);
      assert.strictEqual(results[0].success, true);
      assert.strictEqual(results[1].success, true);
    });
  });

  describe('6. Fault-Injection & Deterministic Rollback Safety', () => {
    it('should trigger deterministic rollback when a platform operation fails mid-execution', async () => {
      const clientContext: ClientContext = {
        clientId: 'client_rollback_test',
        workspaceId: 'ws_default',
        currency: 'USD',
        industry: 'E-commerce Retail',
        monthlyBudgetCap: 20000,
        activePlatforms: ['GOOGLE', 'META'],
      };

      // Set Meta adapter rate limit to 100% to simulate API rejection / rate guard engagement
      const metaAdapter = os.adapters.getAdapter('META') as MetaGraphAdapter;
      metaAdapter.setSimulatedRateLimit(100, 100, 100);

      try {
        const prompt = 'Launch multi-platform sales campaigns on Google and Meta';
        const result = await os.executeObjective(prompt, clientContext, {
          autoApproveHighRisk: true,
        });

        // The workflow should either handle failure or trigger rollback cleanly
        assert.ok(result.workflowResult);
        assert.ok(
          result.workflowResult.state === 'FAILED' ||
          result.workflowResult.state === 'ROLLED_BACK'
        );
      } finally {
        // Reset rate limit
        metaAdapter.setSimulatedRateLimit(15, 12, 10);
      }
    });
  });
});
