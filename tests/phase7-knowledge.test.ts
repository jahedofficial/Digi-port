import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'path';
import {
  KnowledgeRegistry,
  KnowledgeLoader,
  PromptTemplateLoader,
  PromptContextBuilder,
  ValidationException,
  SystemException,
} from '../src/core';

describe('Phase 7 — Knowledge Base & Prompt Templates Unit Tests', () => {
  const knowledgeDir = path.resolve(process.cwd(), 'assets', 'knowledge');
  const promptTemplatesDir = path.resolve(process.cwd(), 'assets', 'prompt-templates');

  describe('1. KnowledgeLoader & KnowledgeRegistry Ingestion', () => {
    it('should successfully load all 14 knowledge modules from assets/knowledge/', async () => {
      const registry = new KnowledgeRegistry();
      const loader = new KnowledgeLoader(registry);

      const modules = await loader.loadFromDirectory(knowledgeDir);

      assert.ok(modules.length >= 14, `Expected at least 14 knowledge modules, loaded ${modules.length}`);
      assert.ok(registry.getAllModules().length >= 14);
    });

    it('should verify presence of all 14 required platform knowledge modules', async () => {
      const registry = new KnowledgeRegistry();
      const loader = new KnowledgeLoader(registry);
      await loader.loadFromDirectory(knowledgeDir);

      const requiredModuleIds = [
        'knowledge-google-ads',
        'knowledge-google-analytics-4',
        'knowledge-google-tag-manager',
        'knowledge-google-merchant-center',
        'knowledge-google-search-console',
        'knowledge-google-ads-policies',
        'knowledge-meta-ads',
        'knowledge-meta-pixel-capi',
        'knowledge-meta-advertising-policies',
        'knowledge-tiktok-ads',
        'knowledge-tiktok-pixel-events-api',
        'knowledge-tiktok-advertising-policies',
        'knowledge-cross-platform-attribution',
        'knowledge-industry-best-practices',
      ];

      for (const id of requiredModuleIds) {
        assert.ok(registry.hasModule(id), `Missing required knowledge module: ${id}`);
        const mod = registry.getModule(id);
        assert.ok(mod);
        assert.strictEqual(mod?.id, id);
      }
    });

    it('should filter knowledge modules by platform', async () => {
      const registry = new KnowledgeRegistry();
      const loader = new KnowledgeLoader(registry);
      await loader.loadFromDirectory(knowledgeDir);

      const googleMods = registry.getModulesByPlatform('GOOGLE');
      assert.ok(googleMods.length >= 6);

      const metaMods = registry.getModulesByPlatform('META');
      assert.ok(metaMods.length >= 3);

      const tiktokMods = registry.getModulesByPlatform('TIKTOK');
      assert.ok(tiktokMods.length >= 3);

      const crossMods = registry.getModulesByPlatform('CROSS_PLATFORM');
      assert.ok(crossMods.length >= 2);
    });

    it('should throw SystemException when knowledge directory does not exist', async () => {
      const registry = new KnowledgeRegistry();
      const loader = new KnowledgeLoader(registry);

      await assert.rejects(async () => {
        await loader.loadFromDirectory(path.join(knowledgeDir, 'non_existent_knowledge'));
      }, (err: unknown) => {
        return err instanceof SystemException && err.code === 'ERR_KNOWLEDGE_DIR_NOT_FOUND';
      });
    });

    it('should reject knowledge module missing required sections', () => {
      const registry = new KnowledgeRegistry();

      assert.throws(() => {
        registry.registerModule({
          id: 'invalid-mod',
          title: 'Invalid',
          platform: 'GOOGLE',
          // missing overview, coreConcepts, features, etc.
        } as any);
      }, ValidationException);
    });
  });

  describe('2. PromptTemplateLoader & Prompt Templates Ingestion', () => {
    it('should successfully load all 8 prompt templates from assets/prompt-templates/', async () => {
      const registry = new KnowledgeRegistry();
      const promptLoader = new PromptTemplateLoader(registry);

      const templates = await promptLoader.loadFromDirectory(promptTemplatesDir);

      assert.ok(templates.length >= 8, `Expected at least 8 prompt templates, loaded ${templates.length}`);
      assert.ok(registry.getAllPromptTemplates().length >= 8);
    });

    it('should verify presence of all 8 required prompt templates', async () => {
      const registry = new KnowledgeRegistry();
      const promptLoader = new PromptTemplateLoader(registry);
      await promptLoader.loadFromDirectory(promptTemplatesDir);

      const requiredPromptIds = [
        'prompt-campaign-creation',
        'prompt-campaign-audit',
        'prompt-cro-audit',
        'prompt-tracking-audit',
        'prompt-optimization',
        'prompt-reporting',
        'prompt-creative-analysis',
        'prompt-cross-platform-budget-review',
      ];

      for (const id of requiredPromptIds) {
        assert.ok(registry.hasPromptTemplate(id), `Missing required prompt template: ${id}`);
        const pt = registry.getPromptTemplate(id);
        assert.ok(pt);
        assert.strictEqual(pt?.id, id);
        assert.ok(pt!.variables.length > 0);
      }
    });

    it('should throw SystemException when prompt templates directory does not exist', async () => {
      const registry = new KnowledgeRegistry();
      const promptLoader = new PromptTemplateLoader(registry);

      await assert.rejects(async () => {
        await promptLoader.loadFromDirectory(path.join(promptTemplatesDir, 'non_existent_prompts'));
      }, (err: unknown) => {
        return err instanceof SystemException && err.code === 'ERR_PROMPT_TEMPLATE_DIR_NOT_FOUND';
      });
    });
  });

  describe('3. PromptContextBuilder Grounding & Sanitization', () => {
    it('should substitute variables and attach authoritative platform knowledge', async () => {
      const registry = new KnowledgeRegistry();
      const kLoader = new KnowledgeLoader(registry);
      const pLoader = new PromptTemplateLoader(registry);

      await kLoader.loadFromDirectory(knowledgeDir);
      await pLoader.loadFromDirectory(promptTemplatesDir);

      const builder = new PromptContextBuilder(registry);

      const context = builder.buildContext({
        promptTemplateId: 'prompt-campaign-creation',
        platform: 'GOOGLE',
        variables: {
          client_name: 'Glamour Apparel',
          platform: 'Google Ads',
          objective: 'SALES',
          industry: 'E-commerce',
          daily_budget: '500',
          currency: 'USD',
        },
      });

      assert.ok(context.userPrompt.includes('Glamour Apparel'));
      assert.ok(context.userPrompt.includes('500 USD'));
      assert.ok(context.systemPrompt.includes('AUTHORITATIVE PLATFORM KNOWLEDGE BASE'));
      assert.ok(context.systemPrompt.includes('Google Ads Campaign Architecture'));
      assert.ok(context.includedReferences.length > 0);
    });

    it('should throw ValidationException when required prompt variables are missing', async () => {
      const registry = new KnowledgeRegistry();
      const pLoader = new PromptTemplateLoader(registry);
      await pLoader.loadFromDirectory(promptTemplatesDir);

      const builder = new PromptContextBuilder(registry);

      assert.throws(() => {
        builder.buildContext({
          promptTemplateId: 'prompt-campaign-creation',
          variables: {
            client_name: 'Incomplete Client',
            // missing platform, objective, industry, etc.
          },
        });
      }, ValidationException);
    });

    it('should sanitize credentials and prevent token leakage into LLM context', async () => {
      const registry = new KnowledgeRegistry();
      const pLoader = new PromptTemplateLoader(registry);
      await pLoader.loadFromDirectory(promptTemplatesDir);

      const builder = new PromptContextBuilder(registry);

      const context = builder.buildContext({
        promptTemplateId: 'prompt-campaign-creation',
        variables: {
          client_name: 'Test Client ya29.a0AfH6SMDfakegooglesecrettoken12345',
          platform: 'Google Ads',
          objective: 'SALES',
          industry: 'E-commerce',
          daily_budget: '500',
          currency: 'USD',
        },
      });

      assert.ok(!context.userPrompt.includes('ya29.a0AfH6SMDfakegooglesecrettoken12345'));
      assert.ok(context.userPrompt.includes('[REDACTED_GOOGLE_TOKEN]'));
    });
  });

  describe('4. Master Knowledge Quality & Compliance Audit (14/14 Modules)', () => {
    it('every knowledge module must define all 9 required sections with official references', async () => {
      const registry = new KnowledgeRegistry();
      const loader = new KnowledgeLoader(registry);
      const allModules = await loader.loadFromDirectory(knowledgeDir);

      for (const m of allModules) {
        assert.ok(m.id.length > 0);
        assert.ok(m.title.length > 0);
        assert.ok(m.overview.length > 0);
        assert.ok(m.coreConcepts.length >= 1, `${m.id} must define coreConcepts`);
        assert.ok(m.features.length >= 1, `${m.id} must define features`);
        assert.ok(m.bestPractices.length >= 1, `${m.id} must define bestPractices`);
        assert.ok(m.policies.length >= 1, `${m.id} must define policies`);
        assert.ok(m.limitations.length >= 1, `${m.id} must define limitations`);
        assert.ok(m.commonIssues.length >= 1, `${m.id} must define commonIssues`);
        assert.ok(m.troubleshootingGuide.length >= 1, `${m.id} must define troubleshootingGuide`);
        assert.ok(m.references.length >= 1, `${m.id} must define references`);

        for (const item of m.troubleshootingGuide) {
          assert.ok(item.issue.length > 0);
          assert.ok(item.resolution.length > 0);
        }

        for (const ref of m.references) {
          assert.ok(ref.startsWith('http'), `${m.id} reference must be valid URL: ${ref}`);
        }
      }
    });
  });
});
