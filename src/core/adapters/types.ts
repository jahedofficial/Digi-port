import { Platform } from '../types/account';
import { IPlatformAdapter, PlatformConnectionStatus } from '../interfaces/adapter.interface';

export interface GoogleAdsAdapterConfig {
  developerToken?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  customerId?: string;
  loginCustomerId?: string;
  isSandbox?: boolean;
}

export interface MetaGraphAdapterConfig {
  accessToken?: string;
  adAccountId?: string;
  pixelId?: string;
  apiVersion?: string;
  isSandbox?: boolean;
}

export interface TikTokBusinessAdapterConfig {
  accessToken?: string;
  advertiserId?: string;
  appId?: string;
  appSecret?: string;
  pixelId?: string;
  apiVersion?: string;
  isSandbox?: boolean;
}

export interface IPlatformAdapterRegistry {
  registerAdapter(platform: Platform, adapter: IPlatformAdapter): void;
  getAdapter(platform: Platform): IPlatformAdapter | undefined;
  hasAdapter(platform: Platform): boolean;
  getAllAdapters(): IPlatformAdapter[];
  getAdapterMap(): Map<Platform, IPlatformAdapter>;
  verifyAllConnections(): Promise<Map<Platform, PlatformConnectionStatus>>;
}
