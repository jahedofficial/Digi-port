import { 
  fetchGa4UnifiedReport, 
  fetchGa4Realtime, 
  GA4UnifiedReport, 
  Ga4RealtimeReport 
} from '@/lib/ga4-api';
import { getGoogleDirectConfig } from '@/lib/settings-db';
import fs from 'fs';
import path from 'path';

function getStoredGA4Config(): { propertyId: string; serviceAccount: any } | null {
  try {
    const filePath = path.join(process.cwd(), '.config', 'ga4_credentials.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

/**
 * Google Analytics 4 (GA4) Multi-Channel Attribution & Funnel MCP
 * Used by OpenClaw AI Agents and Growth Copilot
 */
export class GA4AnalyticsMCP {
  static async getOverview(timeframe: 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'this_month' = 'last_7d') {
    const dbConfig = await getGoogleDirectConfig();
    const fileConfig = getStoredGA4Config();

    const propertyId = dbConfig.ga4PropertyId || fileConfig?.propertyId || '551294668';
    const serviceAccount = dbConfig.serviceAccountJson || fileConfig?.serviceAccount || null;

    try {
      const report = await fetchGa4UnifiedReport({
        propertyId,
        serviceAccount,
        datePreset: timeframe,
      });

      return {
        success: true,
        propertyId,
        isLive: report.isLiveConnection,
        timeframe,
        totalSessions: report.totalSessions,
        totalUsers: report.totalUsers,
        totalPurchases: report.totalPurchases,
        totalRevenue: report.totalRevenue,
        conversionRate: report.overallConversionRate,
        aov: report.averageOrderValue,
        blendedRoas: report.blendedRoas,
        channels: report.channels,
        funnel: {
          itemsViewed: report.itemsViewed,
          itemsAddedToCart: report.itemsAddedToCart,
          addToCartRate: report.addToCartRate,
          cartAbandonmentRate: report.cartAbandonmentRate,
          itemViewToPurchaseRate: report.itemViewToPurchaseRate,
          customerLtv: report.customerLtv,
          newVsReturning: report.newVsReturning,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        propertyId,
        totalSessions: 0,
        totalUsers: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        conversionRate: 0,
        aov: 0,
      };
    }
  }

  static async getRealtime() {
    const dbConfig = await getGoogleDirectConfig();
    const fileConfig = getStoredGA4Config();

    const propertyId = dbConfig.ga4PropertyId || fileConfig?.propertyId || '551294668';
    const serviceAccount = dbConfig.serviceAccountJson || fileConfig?.serviceAccount || null;

    try {
      const rt: Ga4RealtimeReport = await fetchGa4Realtime(propertyId, serviceAccount);
      return {
        success: true,
        propertyId,
        isLive: rt.isLive,
        activeUsers30m: rt.activeUsersLast30Min || 0,
        devices: rt.devices,
        topCities: rt.topCities,
        recentEvents: rt.recentEvents,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        propertyId,
        activeUsers30m: 0,
        devices: { mobile: 0, desktop: 0, tablet: 0 },
        topCities: [],
        recentEvents: [],
      };
    }
  }

  static async getChannelAttribution(timeframe: 'today' | 'yesterday' | 'last_7d' | 'last_30d' = 'last_7d') {
    const overview = await this.getOverview(timeframe);
    return {
      success: overview.success,
      propertyId: overview.propertyId,
      timeframe,
      channels: overview.channels || [],
      blendedRoas: overview.blendedRoas,
    };
  }

  static async getEcommerceFunnel(timeframe: 'today' | 'yesterday' | 'last_7d' | 'last_30d' = 'last_7d') {
    const overview = await this.getOverview(timeframe);
    return {
      success: overview.success,
      propertyId: overview.propertyId,
      timeframe,
      funnel: overview.funnel,
    };
  }
}
