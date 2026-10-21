import { Platform } from '../types/account';
import { LoggerService } from '../logging/logger.service';

export interface StartupAuditReport {
  timestamp: string;
  isReadyForProduction: boolean;
  securityChecks: {
    encryptionKeyValid: boolean;
    jwtSecretValid: boolean;
    databaseUrlConfigured: boolean;
    redisUrlConfigured: boolean;
  };
  platformReadiness: Record<
    Platform,
    {
      configured: boolean;
      identifier: string;
      errors: string[];
    }
  >;
  warnings: string[];
  errors: string[];
}

export class StartupValidatorService {
  private readonly logger: LoggerService;

  constructor(logger?: LoggerService) {
    this.logger = logger || new LoggerService('StartupValidatorService');
  }

  /**
   * Performs deep inspection of production environment and configuration.
   * Guarantees zero secret exposure in audit outputs.
   */
  validateProductionEnvironment(): StartupAuditReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Security Checks
    const encSecret = process.env.ENCRYPTION_SECRET || '';
    const jwtSecret = process.env.JWT_SECRET || '';
    const dbUrl = process.env.DATABASE_URL || '';
    const redisUrl = process.env.REDIS_URL || '';

    const encryptionKeyValid = encSecret.trim().length >= 32;
    if (!encryptionKeyValid) {
      errors.push('ENCRYPTION_SECRET must be at least 32 characters long (256-bit entropy)');
    }

    const jwtSecretValid = jwtSecret.trim().length >= 16;
    if (!jwtSecretValid) {
      errors.push('JWT_SECRET must be at least 16 characters long');
    }

    const databaseUrlConfigured = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
    if (!databaseUrlConfigured) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection URI (postgresql://...)');
    }

    const redisUrlConfigured = redisUrl.startsWith('redis://');
    if (!redisUrlConfigured) {
      warnings.push('REDIS_URL is not configured; fallback to in-memory cache');
    }

    // 2. Google Ads Platform Checks
    const googleDevToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
    const googleClientId = process.env.GOOGLE_ADS_CLIENT_ID || '';
    const googleClientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || '';
    const googleRefreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN || '';
    const googleCustomerId = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/-/g, '').trim();

    const googleErrors: string[] = [];
    if (!googleDevToken) googleErrors.push('Missing GOOGLE_ADS_DEVELOPER_TOKEN');
    if (!googleClientId) googleErrors.push('Missing GOOGLE_ADS_CLIENT_ID');
    if (!googleClientSecret) googleErrors.push('Missing GOOGLE_ADS_CLIENT_SECRET');
    if (!googleRefreshToken) googleErrors.push('Missing GOOGLE_ADS_REFRESH_TOKEN');
    if (!googleCustomerId) {
      googleErrors.push('Missing GOOGLE_ADS_CUSTOMER_ID');
    } else if (!/^\d{10}$/.test(googleCustomerId)) {
      googleErrors.push('GOOGLE_ADS_CUSTOMER_ID must be a 10-digit numeric ID');
    }

    // 3. Meta Ads Platform Checks
    const metaToken = process.env.META_ACCESS_TOKEN || '';
    const metaAdAccountId = (process.env.META_AD_ACCOUNT_ID || '').trim();

    const metaErrors: string[] = [];
    if (!metaToken) metaErrors.push('Missing META_ACCESS_TOKEN');
    if (!metaAdAccountId) {
      metaErrors.push('Missing META_AD_ACCOUNT_ID');
    } else if (!metaAdAccountId.startsWith('act_') && !/^\d+$/.test(metaAdAccountId)) {
      metaErrors.push('META_AD_ACCOUNT_ID must be formatted as act_<id> or numeric');
    }

    // 4. TikTok Ads Platform Checks
    const tiktokToken = process.env.TIKTOK_ACCESS_TOKEN || '';
    const tiktokAdvertiserId = (process.env.TIKTOK_ADVERTISER_ID || '').trim();

    const tiktokErrors: string[] = [];
    if (!tiktokToken) tiktokErrors.push('Missing TIKTOK_ACCESS_TOKEN');
    if (!tiktokAdvertiserId) {
      tiktokErrors.push('Missing TIKTOK_ADVERTISER_ID');
    } else if (!/^\d+$/.test(tiktokAdvertiserId)) {
      tiktokErrors.push('TIKTOK_ADVERTISER_ID must be a numeric string');
    }

    const platformReadiness = {
      GOOGLE: {
        configured: googleErrors.length === 0,
        identifier: googleCustomerId ? `***${googleCustomerId.slice(-4)}` : 'unconfigured',
        errors: googleErrors,
      },
      META: {
        configured: metaErrors.length === 0,
        identifier: metaAdAccountId ? `***${metaAdAccountId.slice(-4)}` : 'unconfigured',
        errors: metaErrors,
      },
      TIKTOK: {
        configured: tiktokErrors.length === 0,
        identifier: tiktokAdvertiserId ? `***${tiktokAdvertiserId.slice(-4)}` : 'unconfigured',
        errors: tiktokErrors,
      },
    };

    const isReadyForProduction = errors.length === 0 && googleErrors.length === 0 && metaErrors.length === 0 && tiktokErrors.length === 0;

    const report: StartupAuditReport = {
      timestamp: new Date().toISOString(),
      isReadyForProduction,
      securityChecks: {
        encryptionKeyValid,
        jwtSecretValid,
        databaseUrlConfigured,
        redisUrlConfigured,
      },
      platformReadiness,
      warnings,
      errors,
    };

    if (isReadyForProduction) {
      this.logger.info('[StartupValidator] Production environment checks PASSED successfully.');
    } else {
      this.logger.warn(`[StartupValidator] Production environment checks identified ${errors.length} configuration gaps.`);
    }

    return report;
  }
}
