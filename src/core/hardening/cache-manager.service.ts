import { LoggerService } from '../logging/logger.service';

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
  tags: string[];
  createdAt: number;
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  hitRatio: number;
  itemCount: number;
  maxItems: number;
}

export class CacheManagerService {
  private readonly logger: LoggerService;
  private readonly store: Map<string, CacheEntry<any>> = new Map();
  private readonly maxItems: number;
  private hits = 0;
  private misses = 0;

  constructor(maxItems = 1000, logger?: LoggerService) {
    this.maxItems = maxItems;
    this.logger = logger || new LoggerService('CacheManagerService');
  }

  /**
   * Sets a value in the cache with a specified TTL and optional tags.
   */
  set<T>(key: string, value: T, ttlSeconds = 300, tags: string[] = []): void {
    this.evictExpired();

    // If cache is at max capacity, evict oldest entry (LRU-like)
    if (this.store.size >= this.maxItems) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }

    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, {
      key,
      value,
      expiresAt,
      tags,
      createdAt: Date.now(),
    });
  }

  /**
   * Retrieves a cached value if present and unexpired.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Read-through caching utility: Returns cached value or executes fetcher.
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 300, tags: string[] = []): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    this.set(key, fresh, ttlSeconds, tags);
    return fresh;
  }

  /**
   * Invalidate entry by exact key.
   */
  invalidate(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Invalidate all entries tagged with any of the specified tags.
   */
  invalidateByTags(tags: string[]): number {
    let evictedCount = 0;
    const targetTags = new Set(tags);

    for (const [key, entry] of this.store) {
      const matches = entry.tags.some((t) => targetTags.has(t));
      if (matches) {
        this.store.delete(key);
        evictedCount++;
      }
    }

    this.logger.debug(`[CacheManager] Evicted ${evictedCount} entries matching tags: [${tags.join(', ')}]`);
    return evictedCount;
  }

  /**
   * Clears all cache entries.
   */
  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Returns cache metrics and hit ratio.
   */
  getStats(): CacheStatistics {
    const total = this.hits + this.misses;
    const hitRatio = total > 0 ? Math.round((this.hits / total) * 1000) / 1000 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRatio,
      itemCount: this.store.size,
      maxItems: this.maxItems,
    };
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
