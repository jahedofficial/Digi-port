import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as crypto from 'node:crypto';
import { CryptoVaultService, SecretRedactor } from '../src/core/security/crypto-vault.service';
import { TokenLifecycleMonitor } from '../src/core/security/token-lifecycle.service';
import { PlatformRateLimiter } from '../src/core/hardening/rate-limiter.service';
import { CacheManagerService } from '../src/core/hardening/cache-manager.service';
import { StartupValidatorService } from '../src/core/hardening/startup-validator.service';
import { HealthMonitorService } from '../src/core/hardening/health-monitor.service';
import { GracefulShutdownManager } from '../src/core/hardening/graceful-shutdown.service';
import { TraceContextManager } from '../src/core/observability/trace-context.service';
import { PrometheusMetricsRegistry } from '../src/core/observability/metrics.service';
import { UniversalPaidMediaOS } from '../src/core/integration/system-integrator';
import { ClientContext } from '../src/core/interfaces/agent.interface';
import { SecurityException } from '../src/core/errors/domain.errors';

describe('Phase 17 — Production Hardening & Security Unit & Integration Tests', () => {
  const validSecretKey = 'standard_enterprise_secret_encryption_key_32chars!';

  describe('1. Cryptographic Vault & Enterprise Secret Redactor', () => {
    it('should successfully encrypt and decrypt strings using authenticated AES-256-GCM', () => {
      const vault = new CryptoVaultService(validSecretKey);
      const plaintext = 'sensitive_meta_system_user_token_value_981247';

      const encrypted = vault.encrypt(plaintext);
      assert.ok(encrypted.encoded.includes(':'));
      assert.strictEqual(encrypted.encoded.split(':').length, 3);
      assert.strictEqual(encrypted.iv.length, 24); // 12 bytes hex
      assert.strictEqual(encrypted.authTag.length, 32); // 16 bytes hex

      const decrypted = vault.decrypt(encrypted.encoded);
      assert.strictEqual(decrypted, plaintext);
    });

    it('should reject encryption secret keys shorter than 32 characters (256-bit entropy)', () => {
      assert.throws(
        () => new CryptoVaultService('short_weak_key'),
        (err: any) => err instanceof SecurityException && err.code === 'ERR_WEAK_ENCRYPTION_KEY'
      );
    });

    it('should detect cryptographic tampering and reject tampered payloads with ERR_CRYPTO_INTEGRITY', () => {
      const vault = new CryptoVaultService(validSecretKey);
      const encrypted = vault.encrypt('top_secret_ad_account_credential');

      // Tamper ciphertext
      const parts = encrypted.encoded.split(':');
      const tamperedCiphertext = parts[2].slice(0, -2) + 'aa';
      const tamperedPayload = `${parts[0]}:${parts[1]}:${tamperedCiphertext}`;

      assert.throws(
        () => vault.decrypt(tamperedPayload),
        (err: any) => err instanceof SecurityException && err.code === 'ERR_CRYPTO_INTEGRITY'
      );
    });

    it('should scrub credentials, tokens, and PII from text and objects recursively', () => {
      const dirtyText =
        'Marketer user test@agency.com (Phone: +1-555-123-4567, IP: 192.168.1.100) dispatched Bearer ya29.a0AfH6SMA829148172938172938 to https://api.meta.com?access_token=EAAG1092837419';

      const sanitized = SecretRedactor.redact(dirtyText, ['custom_agency_secret']);
      assert.ok(!sanitized.includes('test@agency.com'));
      assert.ok(!sanitized.includes('+1-555-123-4567'));
      assert.ok(!sanitized.includes('192.168.1.100'));
      assert.ok(!sanitized.includes('ya29.a0AfH6SMA829148172938172938'));
      assert.ok(!sanitized.includes('EAAG1092837419'));
      assert.ok(sanitized.includes('[REDACTED_EMAIL]'));
      assert.ok(sanitized.includes('[REDACTED_PHONE]'));
      assert.ok(sanitized.includes('[REDACTED_TOKEN]'));

      // Object redaction
      const dirtyObj = {
        metaAccessToken: 'EAAG999999999999',
        campaignName: 'Black Friday Campaign for client client@shop.com',
        nested: {
          clientSecret: 'secret_12345',
          description: 'Safe description',
        },
      };

      const sanitizedObj: any = SecretRedactor.redactObject(dirtyObj);
      assert.strictEqual(sanitizedObj.metaAccessToken, '[REDACTED_CREDENTIAL]');
      assert.strictEqual(sanitizedObj.nested.clientSecret, '[REDACTED_CREDENTIAL]');
      assert.ok(sanitizedObj.campaignName.includes('[REDACTED_EMAIL]'));
      assert.strictEqual(sanitizedObj.nested.description, 'Safe description');
    });
  });

  describe('2. Token Lifecycle & Expiration Monitoring', () => {
    it('should register tokens and determine health status accurately', () => {
      const monitor = new TokenLifecycleMonitor();

      // Register healthy token
      const healthyMeta = monitor.registerToken('META', 'act_10293847', 'EAAG_dummy_long_token_string', {
        expiresInSeconds: 86400 * 30, // 30 days
      });
      assert.strictEqual(healthyMeta.status, 'ACTIVE');
      assert.ok(healthyMeta.tokenSnippet.length === 4);

      // Register token expiring soon (< 7 days)
      const expiringSoon = monitor.registerToken('TIKTOK', 'adv_998877', 'tiktok_token_sample_32_characters_long', {
        expiresInSeconds: 86400 * 3, // 3 days
      });
      assert.strictEqual(expiringSoon.status, 'EXPIRING_SOON');

      // Register expired token
      const expired = monitor.registerToken('GOOGLE', '1234567890', '1//dummy_expired_refresh_token_string', {
        expiresInSeconds: -10,
      });
      assert.strictEqual(expired.status, 'EXPIRED');

      const alertMsg = monitor.generateAlertMessage(expired);
      assert.ok(alertMsg.includes('CRITICAL TOKEN EXPIRATION ALERT'));
      assert.ok(alertMsg.includes('Google Ads'));
    });

    it('should inspect platform tokens and validate format rules', async () => {
      const monitor = new TokenLifecycleMonitor();

      // Meta inspection
      const validMeta = await monitor.inspectToken('META', 'EAAG_valid_meta_system_user_token_exceeding_40_chars_easily');
      assert.strictEqual(validMeta.valid, true);
      assert.strictEqual(validMeta.status, 'ACTIVE');

      const invalidMeta = await monitor.inspectToken('META', 'short_fake_token');
      assert.strictEqual(invalidMeta.valid, false);
      assert.strictEqual(invalidMeta.status, 'INVALID_GRANT');

      // Google inspection
      const validGoogle = await monitor.inspectToken('GOOGLE', '1//valid_google_refresh_token_format_standard_length');
      assert.strictEqual(validGoogle.valid, true);

      // Empty token
      const emptyToken = await monitor.inspectToken('TIKTOK', '');
      assert.strictEqual(emptyToken.valid, false);
      assert.strictEqual(emptyToken.status, 'EXPIRED');
    });
  });

  describe('3. Platform Rate Limiting & Quota Management', () => {
    it('should consume tokens and throttle when burst bucket is exhausted', async () => {
      const limiter = new PlatformRateLimiter();

      // TikTok has a burst limit of 10 tokens
      const statusBefore = limiter.getQuotaStatus('TIKTOK');
      assert.strictEqual(statusBefore.availableTokens, 10);
      assert.strictEqual(statusBefore.isThrottled, false);

      // Consume 10 tokens
      for (let i = 0; i < 10; i++) {
        await limiter.consume('TIKTOK');
      }

      // 11th token must be throttled
      const statusAfter = limiter.getQuotaStatus('TIKTOK');
      assert.strictEqual(statusAfter.isThrottled, true);
      assert.strictEqual(limiter.tryConsume('TIKTOK'), false);

      await assert.rejects(
        async () => limiter.consume('TIKTOK'),
        /ERR_RATE_LIMIT_EXCEEDED/
      );
    });

    it('should calculate exponential backoff with full jitter to avoid thundering herd', () => {
      const limiter = new PlatformRateLimiter();

      const delay0 = limiter.calculateBackoffWithJitter(0, 'GOOGLE', 1000, 30000);
      const delay1 = limiter.calculateBackoffWithJitter(1, 'GOOGLE', 1000, 30000);
      const delay2 = limiter.calculateBackoffWithJitter(2, 'GOOGLE', 1000, 30000);

      assert.ok(delay0 >= 1000 && delay0 <= 1300);
      assert.ok(delay1 >= 2000 && delay1 <= 2600);
      assert.ok(delay2 >= 4000 && delay2 <= 5200);
    });
  });

  describe('4. Multi-Tier Cache Layer', () => {
    it('should store, retrieve, and evict cached entries with TTL and tag invalidation', async () => {
      const cache = new CacheManagerService(100);

      // Store item with tags
      cache.set('metrics:campaign_101', { roas: 3.8, spend: 500 }, 300, ['campaign:101', 'client:shop']);
      cache.set('metrics:campaign_102', { roas: 2.1, spend: 300 }, 300, ['campaign:102', 'client:shop']);
      cache.set('config:system', { debug: false }, 300, ['system']);

      // Direct lookup
      const cached = cache.get<{ roas: number }>('metrics:campaign_101');
      assert.ok(cached);
      assert.strictEqual(cached.roas, 3.8);

      // Invalidate by entity tag
      const evicted = cache.invalidateByTags(['campaign:101']);
      assert.strictEqual(evicted, 1);
      assert.strictEqual(cache.get('metrics:campaign_101'), null);
      assert.ok(cache.get('metrics:campaign_102') !== null);

      // Read-through pattern
      let fetchCount = 0;
      const fetcher = async () => {
        fetchCount++;
        return { freshData: 100 };
      };

      const res1 = await cache.getOrSet('test_key', fetcher, 300);
      const res2 = await cache.getOrSet('test_key', fetcher, 300);
      assert.strictEqual(fetchCount, 1);
      assert.strictEqual(res1.freshData, 100);
      assert.strictEqual(res2.freshData, 100);

      const stats = cache.getStats();
      assert.ok(stats.hitRatio > 0);
      assert.ok(stats.hits >= 2);
    });
  });

  describe('5. Observability, Distributed Tracing & Prometheus Metrics', () => {
    it('should propagate W3C TraceContext across asynchronous boundaries', async () => {
      const traceId = TraceContextManager.generateTraceId();
      assert.strictEqual(traceId.length, 32);

      await TraceContextManager.runInContext({ traceId, operation: 'campaign_launch' }, async () => {
        const active = TraceContextManager.getActiveContext();
        assert.ok(active);
        assert.strictEqual(active.traceId, traceId);
        assert.strictEqual(active.operation, 'campaign_launch');

        const traceParent = TraceContextManager.toTraceParent();
        assert.ok(traceParent.startsWith('00-'));
        assert.ok(traceParent.includes(traceId));
      });
    });

    it('should collect counters, gauges, and histograms and export valid Prometheus format', () => {
      const metrics = new PrometheusMetricsRegistry();

      metrics.incrementCounter('digiport_api_requests_total', { platform: 'google', status: '200' }, 5);
      metrics.setGauge('digiport_active_campaigns', { client: 'tenant_alpha' }, 12);
      metrics.observeHistogram('digiport_workflow_execution_duration_ms', { type: 'audit' }, 350);

      assert.strictEqual(
        metrics.getMetricValue('digiport_api_requests_total', { platform: 'google', status: '200' }),
        5
      );
      assert.strictEqual(
        metrics.getMetricValue('digiport_active_campaigns', { client: 'tenant_alpha' }),
        12
      );

      const prometheusOutput = metrics.toPrometheusText();
      assert.ok(prometheusOutput.includes('# HELP digiport_api_requests_total'));
      assert.ok(prometheusOutput.includes('# TYPE digiport_api_requests_total counter'));
      assert.ok(prometheusOutput.includes('digiport_api_requests_total{platform="google",status="200"} 5'));
      assert.ok(prometheusOutput.includes('digiport_active_campaigns{client="tenant_alpha"} 12'));
      assert.ok(prometheusOutput.includes('digiport_workflow_execution_duration_ms_bucket'));
    });
  });

  describe('6. Production Health Probes & Graceful Shutdown', () => {
    it('should report comprehensive liveness and readiness status', () => {
      const monitor = new HealthMonitorService();

      const liveness = monitor.getLiveness();
      assert.strictEqual(liveness.status, 'UP');
      assert.ok(liveness.uptimeSeconds >= 0);
      assert.ok(liveness.memory.heapUsedMb > 0);
      assert.ok(liveness.pid > 0);

      const readiness = monitor.getReadiness();
      assert.strictEqual(readiness.status, 'READY');
      assert.strictEqual(readiness.checks.diskWritable, true);
      assert.strictEqual(readiness.checks.dataDirExists, true);
    });

    it('should track active operations and drain cleanly during graceful shutdown', async () => {
      const shutdown = new GracefulShutdownManager(2000);
      let hookExecuted = false;

      shutdown.registerHook('test_cleanup_hook', async () => {
        hookExecuted = true;
      });

      shutdown.trackOperationStart();
      assert.strictEqual(shutdown.getActiveOperations(), 1);

      // Complete operation
      shutdown.trackOperationEnd();
      assert.strictEqual(shutdown.getActiveOperations(), 0);

      const result = await shutdown.shutdown('TEST_TERMINATION');
      assert.strictEqual(result.success, true);
      assert.strictEqual(hookExecuted, true);
      assert.strictEqual(shutdown.getIsShuttingDown(), true);

      // Rejects new operations when shutting down
      assert.throws(
        () => shutdown.trackOperationStart(),
        /System is currently shutting down/
      );
    });
  });

  describe('7. Startup Environment & Secret Validation', () => {
    it('should audit configuration and detect format gaps without leaking secrets', () => {
      const validator = new StartupValidatorService();
      const report = validator.validateProductionEnvironment();

      assert.ok(report.timestamp);
      assert.ok(typeof report.isReadyForProduction === 'boolean');
      assert.ok(report.securityChecks);
      assert.ok(report.platformReadiness.GOOGLE);
      assert.ok(report.platformReadiness.META);
      assert.ok(report.platformReadiness.TIKTOK);

      // Zero secret exposure verification
      const reportJson = JSON.stringify(report);
      assert.ok(!reportJson.includes('secret_key'));
      assert.ok(!reportJson.includes('access_token'));
    });
  });

  describe('8. Master Operating System Hardening Integration', () => {
    let os: UniversalPaidMediaOS;

    before(async () => {
      os = new UniversalPaidMediaOS();
      await os.initialize();
    });

    after(async () => {
      await os.shutdown();
    });

    it('should execute objective with distributed tracing, rate limiting, and metrics telemetry', async () => {
      const client: ClientContext = {
        clientId: 'client_hardening_test',
        workspaceId: 'ws_default',
        currency: 'USD',
        industry: 'E-commerce Retail',
        monthlyBudgetCap: 10000,
        activePlatforms: ['GOOGLE', 'META'],
      };

      // Reset rate limiter for test
      os.rateLimiter.resetQuotas();

      const result = await os.executeObjective(
        'Launch sales campaign with high-intent keywords on Google',
        client,
        { autoApproveHighRisk: true }
      );

      assert.strictEqual(result.success, true);

      // Verify metrics recorded
      const requestCount = os.metrics.getMetricValue('digiport_api_requests_total', {
        operation: 'executeObjective',
        client: client.clientId,
      });
      assert.ok(requestCount && requestCount >= 1);

      // Verify token bucket was consumed
      const googleQuota = os.rateLimiter.getQuotaStatus('GOOGLE');
      assert.ok(googleQuota.availableTokens < 60);

      // Verify cache layer exists and operates
      os.cache.set('test_os_cache', 'val', 60);
      assert.strictEqual(os.cache.get('test_os_cache'), 'val');
    });
  });
});
