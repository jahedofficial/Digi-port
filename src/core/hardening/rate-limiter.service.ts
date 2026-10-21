import { Platform } from '../types/account';
import { LoggerService } from '../logging/logger.service';
import { SYSTEM_ERROR_CODES } from '../constants/platform.constants';

export interface RateLimitConfig {
  maxTokens: number; // Maximum burst tokens available
  refillRatePerSecond: number; // Tokens added per second
  dailyOperationsCap: number; // Maximum operations allowed in a 24-hour cycle
  cooldownBackoffMs: number;
}

export interface PlatformQuotaStatus {
  platform: Platform;
  availableTokens: number;
  maxTokens: number;
  dailyOperationsUsed: number;
  dailyOperationsCap: number;
  utilizationPercent: number;
  isThrottled: boolean;
  retryAfterMs?: number;
}

export class PlatformRateLimiter {
  private readonly logger: LoggerService;
  private readonly configs: Record<Platform, RateLimitConfig>;
  private readonly tokenBuckets: Map<Platform, { tokens: number; lastRefill: number }>;
  private readonly dailyCounters: Map<Platform, { count: number; windowStart: number }>;

  constructor(logger?: LoggerService) {
    this.logger = logger || new LoggerService('PlatformRateLimiter');

    // Production platform quota limits based on official specs
    this.configs = {
      GOOGLE: {
        maxTokens: 60, // 60 QPM standard burst
        refillRatePerSecond: 1.0, // 1 token/sec (~60 queries/min)
        dailyOperationsCap: 15000, // Standard developer token daily cap
        cooldownBackoffMs: 2000,
      },
      META: {
        maxTokens: 100, // Graph API sliding window limit
        refillRatePerSecond: 2.0, // 2 tokens/sec
        dailyOperationsCap: 50000,
        cooldownBackoffMs: 1500,
      },
      TIKTOK: {
        maxTokens: 10, // 10 QPS per advertiser limit
        refillRatePerSecond: 10.0,
        dailyOperationsCap: 20000,
        cooldownBackoffMs: 1000,
      },
    };

    this.tokenBuckets = new Map();
    this.dailyCounters = new Map();

    const now = Date.now();
    for (const p of ['GOOGLE', 'META', 'TIKTOK'] as Platform[]) {
      this.tokenBuckets.set(p, { tokens: this.configs[p].maxTokens, lastRefill: now });
      this.dailyCounters.set(p, { count: 0, windowStart: now });
    }
  }

  /**
   * Attempts to consume tokens for a platform operation.
   * Throws Error if daily quota is exceeded or rate limit bucket is exhausted.
   */
  async consume(platform: Platform, cost = 1): Promise<void> {
    const success = this.tryConsume(platform, cost);
    if (!success) {
      const status = this.getQuotaStatus(platform);
      throw new Error(
        `[${SYSTEM_ERROR_CODES.RATE_LIMIT_EXCEEDED}] Rate limit reached for ${platform}. Retry after ${status.retryAfterMs || 1000}ms`
      );
    }
  }

  /**
   * Non-blocking attempt to consume token.
   * Returns true if quota was acquired, false otherwise.
   */
  tryConsume(platform: Platform, cost = 1): boolean {
    this.refillBucket(platform);
    this.checkDailyWindow(platform);

    const bucket = this.tokenBuckets.get(platform)!;
    const daily = this.dailyCounters.get(platform)!;
    const config = this.configs[platform];

    // Check daily cap
    if (daily.count + cost > config.dailyOperationsCap) {
      this.logger.warn(
        `[RateLimiter] Daily operations cap reached for ${platform} (${daily.count}/${config.dailyOperationsCap})`
      );
      return false;
    }

    // Check bucket tokens
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      daily.count += cost;
      return true;
    }

    return false;
  }

  /**
   * Calculates exponential backoff with full jitter to avoid the thundering herd problem.
   * delay = min(maxDelay, baseDelay * 2^attempt) + jitter
   */
  calculateBackoffWithJitter(attempt: number, platform: Platform, baseDelayMs = 1000, maxDelayMs = 30000): number {
    const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
    const jitter = Math.floor(Math.random() * (exponential * 0.3)); // 30% jitter
    return exponential + jitter;
  }

  /**
   * Returns detailed quota status for a platform.
   */
  getQuotaStatus(platform: Platform): PlatformQuotaStatus {
    this.refillBucket(platform);
    const bucket = this.tokenBuckets.get(platform)!;
    const daily = this.dailyCounters.get(platform)!;
    const config = this.configs[platform];

    const utilizationPercent = Math.min(
      100,
      Math.round((daily.count / config.dailyOperationsCap) * 1000) / 10
    );

    const isThrottled = bucket.tokens < 1 || daily.count >= config.dailyOperationsCap;
    const retryAfterMs = isThrottled ? Math.ceil((1 - bucket.tokens) / config.refillRatePerSecond) * 1000 : 0;

    return {
      platform,
      availableTokens: Math.floor(bucket.tokens),
      maxTokens: config.maxTokens,
      dailyOperationsUsed: daily.count,
      dailyOperationsCap: config.dailyOperationsCap,
      utilizationPercent,
      isThrottled,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  /**
   * Manually resets rate limiters for testing or administrative recovery.
   */
  resetQuotas(): void {
    const now = Date.now();
    for (const p of ['GOOGLE', 'META', 'TIKTOK'] as Platform[]) {
      this.tokenBuckets.set(p, { tokens: this.configs[p].maxTokens, lastRefill: now });
      this.dailyCounters.set(p, { count: 0, windowStart: now });
    }
  }

  private refillBucket(platform: Platform): void {
    const bucket = this.tokenBuckets.get(platform);
    if (!bucket) return;

    const now = Date.now();
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    const config = this.configs[platform];

    if (elapsedSeconds > 0) {
      const addedTokens = elapsedSeconds * config.refillRatePerSecond;
      bucket.tokens = Math.min(config.maxTokens, bucket.tokens + addedTokens);
      bucket.lastRefill = now;
    }
  }

  private checkDailyWindow(platform: Platform): void {
    const daily = this.dailyCounters.get(platform);
    if (!daily) return;

    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (now - daily.windowStart >= twentyFourHours) {
      daily.count = 0;
      daily.windowStart = now;
    }
  }
}
