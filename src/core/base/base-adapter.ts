import { IPlatformAdapter, PlatformConnectionStatus, DateRange } from '../interfaces/adapter.interface';
import { Platform, UnifiedAccount } from '../types/account';
import { UnifiedCampaign, UnifiedCampaignCreateInput } from '../types/campaign';
import { UnifiedAdGroup, UnifiedAdGroupCreateInput } from '../types/adgroup';
import { UnifiedAd } from '../types/ad';
import { UnifiedReportMetric } from '../types/metric';
import { ILoggerService } from '../interfaces/logger.interface';
import { IEventBusService } from '../interfaces/event-bus.interface';

export abstract class BasePlatformAdapter implements IPlatformAdapter {
  abstract readonly platform: Platform;

  constructor(
    protected readonly logger: ILoggerService,
    protected readonly eventBus?: IEventBusService
  ) {}

  protected logOperation(action: string, entityId?: string, meta?: Record<string, unknown>): void {
    this.logger.info(`[${this.platform} Adapter] ${action}`, {
      platform: this.platform,
      action,
      entityId,
      ...meta,
    });
  }

  protected publishAdapterEvent(eventType: string, payload: Record<string, unknown>): void {
    if (this.eventBus) {
      this.eventBus.publish(`adapter.${this.platform.toLowerCase()}.${eventType}`, {
        platform: this.platform,
        ...payload,
      });
    }
  }

  abstract verifyConnection(): Promise<PlatformConnectionStatus>;
  abstract getAccountDetails(): Promise<UnifiedAccount>;
  abstract listCampaigns(): Promise<UnifiedCampaign[]>;
  abstract getCampaign(campaignId: string): Promise<UnifiedCampaign | null>;
  abstract createCampaign(input: UnifiedCampaignCreateInput): Promise<UnifiedCampaign>;
  abstract updateCampaignBudget(campaignId: string, dailyBudget: number): Promise<boolean>;
  abstract setCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED'): Promise<boolean>;
  abstract listAdGroups(campaignId: string): Promise<UnifiedAdGroup[]>;
  abstract createAdGroup(input: UnifiedAdGroupCreateInput): Promise<UnifiedAdGroup>;
  abstract setAdGroupStatus(adGroupId: string, status: 'ACTIVE' | 'PAUSED'): Promise<boolean>;
  abstract listAds(adGroupId: string): Promise<UnifiedAd[]>;
  abstract setAdStatus(adId: string, status: 'ACTIVE' | 'PAUSED'): Promise<boolean>;
  abstract fetchMetrics(
    dateRange: DateRange,
    entityType: 'ACCOUNT' | 'CAMPAIGN' | 'ADGROUP' | 'AD',
    entityId?: string
  ): Promise<UnifiedReportMetric[]>;
}
