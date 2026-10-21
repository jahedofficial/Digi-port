import { Platform } from '../types/account';
import { LoggerService } from '../logging/logger.service';
import { SYSTEM_ERROR_CODES } from '../constants/platform.constants';

export type TokenHealthStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REAUTH_REQUIRED' | 'INVALID_GRANT';

export interface TokenMetadata {
  platform: Platform;
  identifier: string; // Ad account ID or Customer ID
  tokenSnippet: string; // Last 4 characters for identification
  status: TokenHealthStatus;
  issuedAt: Date;
  expiresAt: Date | null; // null if indefinite or refresh token
  remainingSeconds: number | null;
  lastVerifiedAt: Date;
  scopes: string[];
  reauthUrl?: string;
  errorMessage?: string;
}

export interface TokenInspectionResult {
  valid: boolean;
  platform: Platform;
  scopes: string[];
  expiresInSeconds?: number;
  status: TokenHealthStatus;
  advertiserId?: string;
  error?: string;
}

export class TokenLifecycleMonitor {
  private readonly logger: LoggerService;
  private readonly tokenRegistry: Map<string, TokenMetadata> = new Map();

  constructor(logger?: LoggerService) {
    this.logger = logger || new LoggerService('TokenLifecycleMonitor');
  }

  /**
   * Registers a platform token in the monitoring registry.
   */
  registerToken(
    platform: Platform,
    identifier: string,
    rawToken: string,
    options: {
      expiresInSeconds?: number | null;
      issuedAt?: Date;
      scopes?: string[];
    } = {}
  ): TokenMetadata {
    const snippet = rawToken.length > 4 ? rawToken.slice(-4) : '****';
    const now = new Date();
    const issuedAt = options.issuedAt || now;
    let expiresAt: Date | null = null;
    let remainingSeconds: number | null = null;

    if (options.expiresInSeconds !== undefined && options.expiresInSeconds !== null) {
      expiresAt = new Date(issuedAt.getTime() + options.expiresInSeconds * 1000);
      remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    }

    const key = `${platform}:${identifier}`;
    const status = this.determineStatus(remainingSeconds);

    const metadata: TokenMetadata = {
      platform,
      identifier,
      tokenSnippet: snippet,
      status,
      issuedAt,
      expiresAt,
      remainingSeconds,
      lastVerifiedAt: now,
      scopes: options.scopes || this.getDefaultScopes(platform),
    };

    this.tokenRegistry.set(key, metadata);
    this.logger.info(`[TokenLifecycleMonitor] Registered token for ${platform} (${identifier}), status: ${status}`);
    return metadata;
  }

  /**
   * Returns current status of all tracked platform tokens.
   */
  getAllTokenStatuses(): TokenMetadata[] {
    const now = new Date();
    const results: TokenMetadata[] = [];

    for (const [_, meta] of this.tokenRegistry) {
      if (meta.expiresAt) {
        meta.remainingSeconds = Math.max(0, Math.floor((meta.expiresAt.getTime() - now.getTime()) / 1000));
        meta.status = this.determineStatus(meta.remainingSeconds);
      }
      results.push({ ...meta });
    }

    return results;
  }

  /**
   * Inspects a live platform token against simulated or actual provider debug endpoints.
   */
  async inspectToken(platform: Platform, token: string): Promise<TokenInspectionResult> {
    if (!token || token.trim().length === 0) {
      return {
        valid: false,
        platform,
        scopes: [],
        status: 'EXPIRED',
        error: SYSTEM_ERROR_CODES.CREDENTIAL_MISSING,
      };
    }

    // Platform-specific inspection rules
    if (platform === 'META') {
      // Long-lived system token check
      const isSystemToken = token.startsWith('EAAG') || token.startsWith('EAA') || token.length > 40;
      if (!isSystemToken) {
        return {
          valid: false,
          platform,
          scopes: [],
          status: 'INVALID_GRANT',
          error: 'Invalid Meta access token format. Must be a valid system user access token.',
        };
      }
      return {
        valid: true,
        platform,
        scopes: ['ads_management', 'ads_read', 'business_management'],
        expiresInSeconds: 5184000, // 60 days standard long-lived token
        status: 'ACTIVE',
      };
    }

    if (platform === 'GOOGLE') {
      // Offline refresh token check
      const isValidRefreshToken = token.startsWith('1//') || token.length >= 30;
      if (!isValidRefreshToken) {
        return {
          valid: false,
          platform,
          scopes: [],
          status: 'INVALID_GRANT',
          error: 'Invalid Google Ads refresh token format. Expected OAuth2 refresh token.',
        };
      }
      return {
        valid: true,
        platform,
        scopes: ['https://www.googleapis.com/auth/adwords'],
        expiresInSeconds: undefined, // Refresh tokens don't expire unless revoked
        status: 'ACTIVE',
      };
    }

    if (platform === 'TIKTOK') {
      // TikTok advertiser token check
      const isValidTikTokToken = token.length >= 32;
      if (!isValidTikTokToken) {
        return {
          valid: false,
          platform,
          scopes: [],
          status: 'INVALID_GRANT',
          error: 'Invalid TikTok Business API access token format.',
        };
      }
      return {
        valid: true,
        platform,
        scopes: ['advertiser_management', 'ad_management', 'report_management'],
        expiresInSeconds: 86400 * 30, // 30 days
        status: 'ACTIVE',
      };
    }

    return {
      valid: true,
      platform,
      scopes: [],
      status: 'ACTIVE',
    };
  }

  /**
   * Generates urgent alert message when a platform token is about to expire or has expired.
   */
  generateAlertMessage(meta: TokenMetadata): string {
    const platformEmoji = meta.platform === 'GOOGLE' ? '🔴 Google Ads' : meta.platform === 'META' ? '🔵 Meta Ads' : '🎵 TikTok Ads';
    
    if (meta.status === 'EXPIRED' || meta.status === 'REAUTH_REQUIRED') {
      return (
        `🚨 <b>CRITICAL TOKEN EXPIRATION ALERT</b>\n` +
        `Platform: ${platformEmoji}\n` +
        `Account: <code>${meta.identifier}</code>\n` +
        `Status: <b>${meta.status}</b>\n` +
        `Action Required: API mutations are paused. Re-authenticate immediately via Dashboard.`
      );
    }

    if (meta.status === 'EXPIRING_SOON') {
      const days = meta.remainingSeconds ? Math.floor(meta.remainingSeconds / 86400) : 0;
      return (
        `⚠️ <b>TOKEN EXPIRING SOON</b>\n` +
        `Platform: ${platformEmoji}\n` +
        `Account: <code>${meta.identifier}</code>\n` +
        `Remaining Days: <b>${days} days</b>\n` +
        `Recommendation: Rotate and renew system user token before expiration.`
      );
    }

    return `Token for ${meta.platform} is healthy.`;
  }

  private determineStatus(remainingSeconds: number | null): TokenHealthStatus {
    if (remainingSeconds === null) return 'ACTIVE';
    if (remainingSeconds <= 0) return 'EXPIRED';
    if (remainingSeconds <= 86400 * 7) return 'EXPIRING_SOON'; // Less than 7 days
    return 'ACTIVE';
  }

  private getDefaultScopes(platform: Platform): string[] {
    switch (platform) {
      case 'GOOGLE':
        return ['https://www.googleapis.com/auth/adwords'];
      case 'META':
        return ['ads_management', 'ads_read', 'business_management'];
      case 'TIKTOK':
        return ['advertiser_management', 'ad_management', 'report_management'];
      default:
        return [];
    }
  }
}
