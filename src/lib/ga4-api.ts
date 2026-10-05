import crypto from 'crypto';

export interface Ga4ReportResult {
  success: boolean;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  screenPageViews: number;
  conversions: number;
  totalRevenue: number;
  propertyId: string;
  clientEmail: string;
  error?: string;
  rawResponse?: any;
}

/**
 * Mint Google OAuth2 Bearer Token using Google Cloud Service Account JSON Key (RS256 JWT)
 */
export async function getGoogleServiceAccountAccessToken(serviceAccountJson: any): Promise<string> {
  let sa: { client_email?: string; private_key?: string } = {};
  if (typeof serviceAccountJson === 'string') {
    try {
      sa = JSON.parse(serviceAccountJson);
    } catch (e: any) {
      throw new Error(`Invalid Service Account JSON string: ${e.message}`);
    }
  } else {
    sa = serviceAccountJson || {};
  }

  if (!sa.client_email || !sa.private_key) {
    throw new Error('Service Account JSON-এ client_email অথবা private_key অনুপস্থিত।');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  signer.end();
  const signature = signer.sign(sa.private_key, 'base64url');

  const jwt = `${header}.${claim}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    const errMsg = tokenData.error_description || tokenData.error || 'Failed to authenticate Service Account';
    throw new Error(`Google Authentication Failed: ${errMsg}`);
  }

  return tokenData.access_token;
}

/**
 * Fetch Live GA4 Metrics (Active Users, New Users, Sessions, Conversions, Revenue)
 * via official Google Analytics Data API (v1beta)
 */
export async function fetchGa4LiveMetrics(
  serviceAccountJson: any,
  propertyId: string,
  dateRange: { startDate?: string; endDate?: string } = { startDate: '7daysAgo', endDate: 'today' }
): Promise<Ga4ReportResult> {
  const cleanPropertyId = propertyId.replace(/^properties\//i, '').replace(/[^0-9]/g, '');

  if (!cleanPropertyId) {
    throw new Error('সঠিক GA4 Property ID প্রদান করুন (যেমন: 551294668)।');
  }

  let saEmail = '';
  try {
    const parsed = typeof serviceAccountJson === 'string' ? JSON.parse(serviceAccountJson) : serviceAccountJson;
    saEmail = parsed.client_email || '';
  } catch {}

  const accessToken = await getGoogleServiceAccountAccessToken(serviceAccountJson);

  // Run Report on Google Analytics Data API v1beta
  const reportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${cleanPropertyId}:runReport`;
  
  const reportRes = await fetch(reportUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: dateRange.startDate || '7daysAgo', endDate: dateRange.endDate || 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
    }),
  });

  const reportData = await reportRes.json();

  if (!reportRes.ok) {
    let friendlyError = reportData?.error?.message || `HTTP ${reportRes.status}`;
    if (reportData?.error?.code === 403 || friendlyError.includes('permission') || friendlyError.includes('IAM')) {
      friendlyError = `Service Account (${saEmail || 'client_email'}) এর কাছে GA4 প্রপার্টি #${cleanPropertyId} এক্সেস করার অনুমতি নেই। Google Analytics 4 > Admin > Property Access Management এ গিয়ে এই Service Account-কে Viewer বা Analyst রোল দিয়ে যুক্ত করুন।`;
    } else if (friendlyError.includes('not found') || reportData?.error?.code === 404) {
      friendlyError = `GA4 Property #${cleanPropertyId} পাওয়া যায়নি। অনুগ্রহ করে সঠিক Property ID চেক করুন।`;
    }
    throw new Error(friendlyError);
  }

  // Parse GA4 Report Rows
  const metricHeaders: string[] = (reportData.metricHeaders || []).map((h: any) => h.name);
  const rowValues: string[] = reportData.rows?.[0]?.metricValues?.map((v: any) => v.value) || [];

  const getValue = (name: string): number => {
    const idx = metricHeaders.indexOf(name);
    if (idx === -1 || !rowValues[idx]) return 0;
    return parseFloat(rowValues[idx]) || 0;
  };

  const activeUsers = Math.round(getValue('activeUsers'));
  const newUsers = Math.round(getValue('newUsers'));
  const sessions = Math.round(getValue('sessions'));
  const screenPageViews = Math.round(getValue('screenPageViews'));
  const conversions = Math.round(getValue('conversions'));
  const totalRevenue = getValue('totalRevenue');

  return {
    success: true,
    activeUsers,
    newUsers,
    sessions,
    screenPageViews,
    conversions,
    totalRevenue,
    propertyId: cleanPropertyId,
    clientEmail: saEmail,
    rawResponse: reportData,
  };
}
