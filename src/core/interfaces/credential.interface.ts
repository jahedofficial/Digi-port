import { Platform } from '../types/account';

export interface GooglePlatformCredentials {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  loginCustomerId?: string;
  ga4PropertyId?: string;
  gtmAccountId?: string;
  gtmContainerId?: string;
  merchantId?: string;
  gscSiteUrl?: string;
}

export interface MetaPlatformCredentials {
  accessToken: string;
  adAccountId: string;
  pixelId?: string;
  appId?: string;
  appSecret?: string;
}

export interface TikTokPlatformCredentials {
  accessToken: string;
  advertiserId: string;
  appId?: string;
  appSecret?: string;
  pixelId?: string;
}

export interface ICredentialProvider {
  /**
   * Load and validate platform credentials strictly from environment variables.
   * Credentials must never be logged, stored in LLM context, or leaked across clients.
   */
  getGoogleCredentials(): GooglePlatformCredentials;
  getMetaCredentials(): MetaPlatformCredentials;
  getTikTokCredentials(): TikTokPlatformCredentials;
  hasPlatformCredentials(platform: Platform): boolean;
  validateAllEnvironmentCredentials(): {
    valid: boolean;
    missingVariables: string[];
    presentCount: number;
    totalRequired: number;
  };
}
