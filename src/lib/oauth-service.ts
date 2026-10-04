import { DiscoveredBusiness, DiscoveredAdAccount, PlatformConnectionDetails } from '@/types';
import { encryptToken, decryptToken } from './encryption';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export const PLATFORM_CONFIGS = {
  META: {
    name: 'Meta (Facebook Login for Business)',
    authUrl: 'https://www.facebook.com/v20.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v20.0/oauth/access_token',
    scopes: ['ads_read', 'ads_management', 'business_management'],
    docUrl: 'https://developers.facebook.com/docs/facebook-login/facebook-login-for-business',
  },
  GOOGLE: {
    name: 'Google Ads (Sign in with Google)',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/adwords'],
    docUrl: 'https://developers.google.com/google-ads/api/docs/oauth/overview',
  },
  TIKTOK: {
    name: 'TikTok for Business (Marketing API)',
    authUrl: 'https://business-api.tiktok.com/portal/auth',
    tokenUrl: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/token/',
    scopes: ['ads.read', 'ads.management'],
    docUrl: 'https://business-api.tiktok.com/portal/docs',
  },
};

/**
 * In-memory connection and discovered accounts state
 * (Used alongside Prisma in production)
 */
export interface StoredPlatformConnection {
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED';
  encryptedAccessToken: string;
  encryptedRefreshToken?: string;
  tokenExpiresAt: string;
  businesses: DiscoveredBusiness[];
  selectedAccountIds: string[];
  lastSyncedAt: string;
}

// Initial state with pre-configured businesses matching user specification
// Initial state with disconnected platforms ready for real user connection
let connectionsStore: Record<string, StoredPlatformConnection> = {
  META: {
    platform: 'META',
    status: 'DISCONNECTED',
    encryptedAccessToken: '',
    tokenExpiresAt: '',
    lastSyncedAt: '',
    selectedAccountIds: [],
    businesses: [],
  },
  GOOGLE: {
    platform: 'GOOGLE',
    status: 'DISCONNECTED',
    encryptedAccessToken: '',
    tokenExpiresAt: '',
    lastSyncedAt: '',
    selectedAccountIds: [],
    businesses: [],
  },
  TIKTOK: {
    platform: 'TIKTOK',
    status: 'DISCONNECTED',
    encryptedAccessToken: '',
    tokenExpiresAt: '',
    lastSyncedAt: '',
    selectedAccountIds: [],
    businesses: [],
  },
};

/**
 * Generate OAuth Authorization URL for the requested platform
 */
export function generateOAuthStartUrl(platform: 'META' | 'GOOGLE' | 'TIKTOK', baseUrl: string): string {
  const state = Buffer.from(JSON.stringify({ platform, timestamp: Date.now(), csrf: Math.random().toString(36).substring(7) })).toString('base64');
  const redirectUri = `${baseUrl}/api/auth/${platform.toLowerCase()}/callback`;

  if (platform === 'META') {
    const clientId = process.env.META_APP_ID || '102938475610293';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: PLATFORM_CONFIGS.META.scopes.join(','),
      response_type: 'code',
    });
    return `${PLATFORM_CONFIGS.META.authUrl}?${params.toString()}`;
  }

  if (platform === 'GOOGLE') {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'google-ads-client-id.apps.googleusercontent.com';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: PLATFORM_CONFIGS.GOOGLE.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `${PLATFORM_CONFIGS.GOOGLE.authUrl}?${params.toString()}`;
  }

  if (platform === 'TIKTOK') {
    const appId = process.env.TIKTOK_APP_ID || 'tiktok-marketing-app-id';
    const params = new URLSearchParams({
      app_id: appId,
      redirect_uri: redirectUri,
      state,
    });
    return `${PLATFORM_CONFIGS.TIKTOK.authUrl}?${params.toString()}`;
  }

  return '#';
}

/**
 * Get all platform connection details and business / ad accounts hierarchy
 */
export function getAllConnectionsDetails(): PlatformConnectionDetails[] {
  return (['META', 'GOOGLE', 'TIKTOK'] as const).map((plat) => {
    const conn = connectionsStore[plat];
    const expiry = conn?.tokenExpiresAt ? new Date(conn.tokenExpiresAt) : null;
    const daysUntilExpiry = expiry ? Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : undefined;

    return {
      platform: plat,
      status: conn?.status || 'DISCONNECTED',
      connectedAt: conn?.lastSyncedAt,
      tokenExpiresAt: conn?.tokenExpiresAt,
      daysUntilExpiry,
      scopes: PLATFORM_CONFIGS[plat].scopes,
      businesses: conn?.businesses || [],
      activeAccountsCount: conn?.selectedAccountIds.length || 0,
    };
  });
}

/**
 * Toggle selection of an ad account for syncing (F1 Multi-Account support)
 */
export function toggleAccountSelection(platform: 'META' | 'GOOGLE' | 'TIKTOK', accountId: string, isSelected: boolean) {
  const conn = connectionsStore[platform];
  if (!conn) return;

  if (isSelected) {
    if (!conn.selectedAccountIds.includes(accountId)) {
      conn.selectedAccountIds.push(accountId);
    }
  } else {
    conn.selectedAccountIds = conn.selectedAccountIds.filter((id) => id !== accountId);
  }

  // Update inside businesses tree
  conn.businesses.forEach((biz) => {
    biz.adAccounts.forEach((acc) => {
      if (acc.id === accountId) {
        acc.isSelected = isSelected;
      }
    });
  });

  conn.lastSyncedAt = new Date().toISOString();
}

/**
 * Disconnect a platform
 */
export function disconnectPlatform(platform: 'META' | 'GOOGLE' | 'TIKTOK') {
  connectionsStore[platform] = {
    platform,
    status: 'DISCONNECTED',
    encryptedAccessToken: '',
    tokenExpiresAt: '',
    selectedAccountIds: [],
    businesses: connectionsStore[platform]?.businesses.map((biz) => ({
      ...biz,
      adAccounts: biz.adAccounts.map((a) => ({ ...a, isSelected: false })),
    })) || [],
    lastSyncedAt: new Date().toISOString(),
  };
}

/**
 * Connect or simulate successful OAuth authorization for a platform
 */
export function markPlatformConnected(platform: 'META' | 'GOOGLE' | 'TIKTOK', rawToken: string) {
  const expiresInDays = platform === 'META' ? 60 : platform === 'GOOGLE' ? 1 : 30;
  const tokenExpiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const conn = connectionsStore[platform];
  if (conn) {
    conn.status = 'CONNECTED';
    conn.encryptedAccessToken = encryptToken(rawToken || `${platform.toLowerCase()}_live_token_${Date.now()}`);
    conn.tokenExpiresAt = tokenExpiresAt;
    conn.lastSyncedAt = new Date().toISOString();
  }
}
