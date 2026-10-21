import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'path';
import {
  PlaybookRegistry,
  PlaybookLoader,
  WorkflowSelector,
  ValidationException,
  SystemException,
  Platform,
} from '../src/core';

describe('Phase 6 — Playbook System Unit Tests', () => {
  const playbooksDirectory = path.resolve(process.cwd(), 'assets', 'playbooks');

  describe('1. PlaybookLoader & Recursive Disk Ingestion', () => {
    it('should recursively load all 10 core playbooks plus subfolder playbooks from assets/playbooks/', async () => {
      const registry = new PlaybookRegistry();
      const loader = new PlaybookLoader(registry);

      const playbooks = await loader.loadFromDirectory(playbooksDirectory);

      assert.ok(playbooks.length >= 10, `Expected at least 10 playbooks, loaded ${playbooks.length}`);
      assert.ok(registry.getAll().length >= 10);
    });

    it('should throw SystemException when playbooks directory does not exist', async () => {
      const registry = new PlaybookRegistry();
      const loader = new PlaybookLoader(registry);

      await assert.rejects(async () => {
        await loader.loadFromDirectory(path.join(playbooksDirectory, 'non_existent_folder'));
      }, (err: unknown) => {
        return err instanceof SystemException && err.code === 'ERR_PLAYBOOK_DIR_NOT_FOUND';
      });
    });

    it('should support loading individual playbook JSON string', () => {
      const registry = new PlaybookRegistry();
      const loader = new PlaybookLoader(registry);

      const customPlaybook = {
        id: 'playbook-custom-test',
        name: 'Custom Test Playbook',
        version: '1.0.0',
        targetPlatforms: ['GOOGLE'] as Platform[],
        purpose: 'Test individual parsing and validation',
        triggerConditions: ['Manual trigger'],
        prerequisites: ['Ad account active'],
        executionSteps: [
          { step: 1, name: 'Step 1', specialistAgent: 'AuditAgent', action: 'Inspect account' },
        ],
        specialistAgents: ['AuditAgent'],
        requiredApprovals: false,
        expectedOutputs: ['Test report'],
        successCriteria: ['Completed without error'],
        failureHandling: { retryStrategy: 'Retry once', alertChannel: 'Telegram' },
        rollbackStrategy: 'Pause newly created entities',
      };

      const loaded = loader.loadPlaybook(customPlaybook);
      assert.strictEqual(loaded.id, 'playbook-custom-test');
      assert.strictEqual(registry.has('playbook-custom-test'), true);
    });
  });

  describe('2. PlaybookRegistry Validation & Retrieval', () => {
    it('should retrieve playbooks by ID and by Platform filter', async () => {
      const registry = new PlaybookRegistry();
      const loader = new PlaybookLoader(registry);
      await loader.loadFromDirectory(playbooksDirectory);

      const expectedCorePlaybooks = [
        'playbook-account-setup',
        'playbook-campaign-creation',
        'playbook-campaign-audit',
        'playbook-campaign-optimization',
        'playbook-conversion-tracking',
        'playbook-catalog-merchant-center',
        'playbook-reporting',
        'playbook-scaling',
        'playbook-cross-platform-budget-allocation',
        'playbook-creative-testing-refresh',
      ];

      for (const id of expectedCorePlaybooks) {
        assert.ok(registry.has(id), `Registry must contain core playbook: ${id}`);
        const pb = registry.get(id);
        assert.ok(pb);
        assert.strictEqual(pb?.id, id);
      }

      // Check platform-specific filtering
      const googlePlaybooks = registry.getByPlatform('GOOGLE');
      assert.ok(googlePlaybooks.length >= 10);

      const metaPlaybooks = registry.getByPlatform('META');
      assert.ok(metaPlaybooks.length >= 10);

      const tiktokPlaybooks = registry.getByPlatform('TIKTOK');
      assert.ok(tiktokPlaybooks.length >= 10);
    });

    it('should reject playbook when required fields are missing', () => {
      const registry = new PlaybookRegistry();

      assert.throws(() => {
        registry.register({
          id: 'invalid-playbook',
          name: 'Missing Purpose & Steps',
        } as any);
      }, ValidationException);
    });

    it('should reject playbook with invalid platform type', () => {
      const registry = new PlaybookRegistry();

      assert.throws(() => {
        registry.register({
          id: 'playbook-bad-platform',
          name: 'Bad Platform',
          version: '1.0.0',
          targetPlatforms: ['INVALID_PLATFORM'] as any,
          purpose: 'Test',
          triggerConditions: ['Trigger'],
          prerequisites: ['Prereq'],
          executionSteps: [{ step: 1, name: 'S1', specialistAgent: 'A', action: 'Do' }],
          specialistAgents: ['A'],
          requiredApprovals: false,
          expectedOutputs: ['Out'],
          successCriteria: ['Success'],
          failureHandling: { retryStrategy: 'Retry', alertChannel: 'Telegram' },
          rollbackStrategy: 'Rollback',
        } as any);
      }, ValidationException);
    });
  });

  describe('3. Platform-Aware WorkflowSelector', () => {
    it('should select appropriate playbooks based on marketing operation and platform context', async () => {
      const registry = new PlaybookRegistry();
      const loader = new PlaybookLoader(registry);
      await loader.loadFromDirectory(playbooksDirectory);

      const selector = new WorkflowSelector(registry);

      // Audit operation
      const auditPlaybook = selector.selectPlaybook('AUDIT', ['GOOGLE', 'META']);
      assert.strictEqual(auditPlaybook?.id, 'playbook-campaign-audit');

      // Campaign creation
      const launchPlaybook = selector.selectPlaybook('LAUNCH', ['GOOGLE', 'META', 'TIKTOK']);
      assert.strictEqual(launchPlaybook?.id, 'playbook-campaign-creation');

      // Meta Advantage+ override
      const ascPlaybook = selector.selectPlaybook('LAUNCH', ['META'], { campaignType: 'ADVANTAGE_PLUS' });
      assert.strictEqual(ascPlaybook?.id, 'playbook-meta-advantage-plus-sales');

      // Conversion tracking
      const trackingPlaybook = selector.selectPlaybook('VERIFY_TRACKING', ['TIKTOK']);
      assert.strictEqual(trackingPlaybook?.id, 'playbook-conversion-tracking');

      // Scaling
      const scalePlaybook = selector.selectPlaybook('SCALE', ['GOOGLE']);
      assert.strictEqual(scalePlaybook?.id, 'playbook-scaling');

      // Cross-platform budget allocation
      const budgetPlaybook = selector.selectPlaybook('BUDGET_ALLOCATION', ['GOOGLE', 'META', 'TIKTOK']);
      assert.strictEqual(budgetPlaybook?.id, 'playbook-cross-platform-budget-allocation');

      // Catalog & Merchant Center
      const catalogPlaybook = selector.selectPlaybook('CATALOG', ['GOOGLE']);
      assert.strictEqual(catalogPlaybook?.id, 'playbook-catalog-merchant-center');

      // Reporting
      const reportPlaybook = selector.selectPlaybook('REPORT', ['GOOGLE', 'META']);
      assert.strictEqual(reportPlaybook?.id, 'playbook-reporting');

      // Creative testing
      const creativePlaybook = selector.selectPlaybook('CREATIVE_TESTING', ['TIKTOK']);
      assert.strictEqual(creativePlaybook?.id, 'playbook-creative-testing-refresh');
    });
  });

  describe('4. Master Roster Quality & Compliance Audit (10/10 Core Playbooks)', () => {
    it('every playbook must define prerequisites, execution steps, expected outputs, and rollback strategies', async () => {
      const registry = new PlaybookRegistry();
      const loader = new PlaybookLoader(registry);
      const allPlaybooks = await loader.loadFromDirectory(playbooksDirectory);

      for (const pb of allPlaybooks) {
        assert.ok(pb.id.length > 0);
        assert.ok(pb.name.length > 0);
        assert.ok(pb.purpose.length > 0);
        assert.ok(pb.targetPlatforms.length > 0);
        assert.ok(pb.triggerConditions.length >= 1, `${pb.id} must define trigger conditions`);
        assert.ok(pb.prerequisites.length >= 2, `${pb.id} must define at least 2 prerequisites`);
        assert.ok(pb.executionSteps.length >= 3, `${pb.id} must define at least 3 sequential execution steps`);
        assert.ok(pb.specialistAgents.length >= 1, `${pb.id} must define specialist agents`);
        assert.ok(pb.expectedOutputs.length >= 2, `${pb.id} must define expected outputs`);
        assert.ok(pb.successCriteria.length >= 2, `${pb.id} must define success criteria`);
        assert.ok(pb.failureHandling.retryStrategy.length > 0, `${pb.id} must define retry strategy`);
        assert.ok(pb.failureHandling.alertChannel.length > 0, `${pb.id} must define alert channel`);
        assert.ok(pb.rollbackStrategy.length > 0, `${pb.id} must define rollback strategy`);
        assert.strictEqual(typeof pb.requiredApprovals, 'boolean');
      }
    });

    it('campaign creation playbook must declare multi-channel campaign types', async () => {
      const registry = new PlaybookRegistry();
      const loader = new PlaybookLoader(registry);
      await loader.loadFromDirectory(playbooksDirectory);

      const campaignCreation = registry.get('playbook-campaign-creation');
      assert.ok(campaignCreation?.supportedCampaignTypes);

      const types = campaignCreation!.supportedCampaignTypes!;
      assert.ok(types.google && types.google.includes('Performance Max'));
      assert.ok(types.google && types.google.includes('Shopping'));
      assert.ok(types.meta && types.meta.includes('Sales (Advantage+ Shopping)'));
      assert.ok(types.tiktok && types.tiktok.includes('Catalog Sales (Video Shopping Ads)'));
    });
  });
});
