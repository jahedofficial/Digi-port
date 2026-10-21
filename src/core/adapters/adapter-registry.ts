import { IPlatformAdapter, PlatformConnectionStatus } from '../interfaces/adapter.interface';
import { IEventBus } from '../interfaces/event-bus.interface';
import { ILogger } from '../interfaces/logger.interface';
import { StructuredLogger } from '../logging/logger.service';
import { Platform } from '../types/account';
import { GoogleAdsAdapter } from './google-ads.adapter';
import { MetaGraphAdapter } from './meta-graph.adapter';
import { TikTokBusinessAdapter } from './tiktok-business.adapter';
import {
  GoogleAdsAdapterConfig,
  IPlatformAdapterRegistry,
  MetaGraphAdapterConfig,
  TikTokBusinessAdapterConfig,
} from './types';

/**
 * Enterprise Platform Adapter Registry
 * Central coordinator and discovery point for direct platform adapters (Google, Meta, TikTok).
 */
export class PlatformAdapterRegistry implements IPlatformAdapterRegistry {
  private readonly adapters = new Map<Platform, IPlatformAdapter>();
  private readonly logger: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger ?? new StructuredLogger('PlatformAdapterRegistry');
  }

  public registerAdapter(platform: Platform, adapter: IPlatformAdapter): void {
    this.adapters.set(platform, adapter);
    this.logger.info(`[PlatformAdapterRegistry] Registered adapter for platform [${platform}]`);
  }

  public getAdapter(platform: Platform): IPlatformAdapter | undefined {
    return this.adapters.get(platform);
  }

  public hasAdapter(platform: Platform): boolean {
    return this.adapters.has(platform);
  }

  public getAllAdapters(): IPlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  public getAdapterMap(): Map<Platform, IPlatformAdapter> {
    return new Map(this.adapters);
  }

  /**
   * Verify connections to all registered platform APIs concurrently
   */
  public async verifyAllConnections(): Promise<Map<Platform, PlatformConnectionStatus>> {
    const statuses = new Map<Platform, PlatformConnectionStatus>();
    const promises: Promise<void>[] = [];

    for (const [platform, adapter] of this.adapters.entries()) {
      promises.push(
        adapter
          .verifyConnection()
          .then((status) => {
            statuses.set(platform, status);
          })
          .catch((err) => {
            statuses.set(platform, {
              platform,
              connected: false,
              accountId: 'unknown',
              statusCode: 500,
              message: `Adapter error: ${err instanceof Error ? err.message : String(err)}`,
              checkedAt: new Date(),
            });
          })
      );
    }

    await Promise.all(promises);
    return statuses;
  }

  /**
   * Factory to construct and register default direct platform adapters (Google, Meta, TikTok)
   */
  public static createDefaultRegistry(options?: {
    googleConfig?: GoogleAdsAdapterConfig;
    metaConfig?: MetaGraphAdapterConfig;
    tiktokConfig?: TikTokBusinessAdapterConfig;
    logger?: ILogger;
    eventBus?: IEventBus;
  }): PlatformAdapterRegistry {
    const registry = new PlatformAdapterRegistry(options?.logger);

    const googleAdapter = new GoogleAdsAdapter(
      options?.googleConfig,
      options?.logger,
      options?.eventBus
    );
    const metaAdapter = new MetaGraphAdapter(
      options?.metaConfig,
      options?.logger,
      options?.eventBus
    );
    const tiktokAdapter = new TikTokBusinessAdapter(
      options?.tiktokConfig,
      options?.logger,
      options?.eventBus
    );

    registry.registerAdapter('GOOGLE', googleAdapter);
    registry.registerAdapter('META', metaAdapter);
    registry.registerAdapter('TIKTOK', tiktokAdapter);

    return registry;
  }
}
