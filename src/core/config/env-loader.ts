import { 
  ICredentialProvider, 
  GooglePlatformCredentials, 
  MetaPlatformCredentials, 
  TikTokPlatformCredentials 
} from '../interfaces/credential.interface';
import { Platform } from '../types/account';
import { PLATFORM_REQUIRED_ENV_VARS } from '../constants/platform.constants';
import { CredentialException } from '../errors/domain.errors';

export class EnvironmentCredentialProvider implements ICredentialProvider {
  getGoogleCredentials(): GooglePlatformCredentials {
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() || '';
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID?.trim() || '';
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET?.trim() || '';
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN?.trim() || '';
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.trim() || '';

    if (!devToken || !clientId || !clientSecret || !refreshToken || !customerId) {
      throw new CredentialException('Required Google Ads environment credentials are missing', undefined, {
        platform: 'GOOGLE',
      });
    }

    return {
      developerToken: devToken,
      clientId,
      clientSecret,
      refreshToken,
      customerId,
      loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.trim(),
      ga4PropertyId: process.env.GA4_PROPERTY_ID?.trim(),
      gtmAccountId: process.env.GTM_ACCOUNT_ID?.trim(),
      gtmContainerId: process.env.GTM_CONTAINER_ID?.trim(),
      merchantId: process.env.GOOGLE_MERCHANT_ID?.trim(),
      gscSiteUrl: process.env.GSC_SITE_URL?.trim(),
    };
  }

  getMetaCredentials(): MetaPlatformCredentials {
    const accessToken = process.env.META_ACCESS_TOKEN?.trim() || '';
    const adAccountId = process.env.META_AD_ACCOUNT_ID?.trim() || '';

    if (!accessToken || !adAccountId) {
      throw new CredentialException('Required Meta Ads environment credentials (META_ACCESS_TOKEN, META_AD_ACCOUNT_ID) are missing', undefined, {
        platform: 'META',
      });
    }

    return {
      accessToken,
      adAccountId,
      pixelId: process.env.META_PIXEL_ID?.trim(),
      appId: process.env.META_APP_ID?.trim(),
      appSecret: process.env.META_APP_SECRET?.trim(),
    };
  }

  getTikTokCredentials(): TikTokPlatformCredentials {
    const accessToken = process.env.TIKTOK_ACCESS_TOKEN?.trim() || '';
    const advertiserId = process.env.TIKTOK_ADVERTISER_ID?.trim() || '';

    if (!accessToken || !advertiserId) {
      throw new CredentialException('Required TikTok Ads environment credentials (TIKTOK_ACCESS_TOKEN, TIKTOK_ADVERTISER_ID) are missing', undefined, {
        platform: 'TIKTOK',
      });
    }

    return {
      accessToken,
      advertiserId,
      appId: process.env.TIKTOK_APP_ID?.trim(),
      appSecret: process.env.TIKTOK_APP_SECRET?.trim(),
      pixelId: process.env.TIKTOK_PIXEL_ID?.trim(),
    };
  }

  hasPlatformCredentials(platform: Platform): boolean {
    try {
      if (platform === 'GOOGLE') this.getGoogleCredentials();
      if (platform === 'META') this.getMetaCredentials();
      if (platform === 'TIKTOK') this.getTikTokCredentials();
      return true;
    } catch {
      return false;
    }
  }

  validateAllEnvironmentCredentials(): {
    valid: boolean;
    missingVariables: string[];
    presentCount: number;
    totalRequired: number;
  } {
    const allRequired = [
      ...PLATFORM_REQUIRED_ENV_VARS.GOOGLE,
      ...PLATFORM_REQUIRED_ENV_VARS.META,
      ...PLATFORM_REQUIRED_ENV_VARS.TIKTOK,
      ...PLATFORM_REQUIRED_ENV_VARS.CORE,
    ];

    const missingVariables: string[] = [];
    let presentCount = 0;

    for (const key of allRequired) {
      const val = process.env[key];
      if (val && val.trim().length > 0) {
        presentCount++;
      } else {
        missingVariables.push(key);
      }
    }

    return {
      valid: missingVariables.length === 0,
      missingVariables,
      presentCount,
      totalRequired: allRequired.length,
    };
  }
}
