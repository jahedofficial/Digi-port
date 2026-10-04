import { NextRequest, NextResponse } from 'next/server';
import { CampaignData, CreativeData, MetricSummary } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body?.token?.trim();
    let adAccountId = body?.adAccountId?.trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Meta System User Access Token প্রদান করা হয়নি।' },
        { status: 400 }
      );
    }

    if (!adAccountId) {
      return NextResponse.json(
        { success: false, error: 'Target Meta Ad Account ID প্রদান করা হয়নি।' },
        { status: 400 }
      );
    }

    // Ensure account ID has act_ prefix
    if (!adAccountId.startsWith('act_')) {
      adAccountId = `act_${adAccountId}`;
    }

    // 1. Fetch campaigns with insights from Meta Graph API v20.0
    const campaignsUrl = `https://graph.facebook.com/v20.0/${adAccountId}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,insights.date_preset(maximum){spend,purchase_roas,actions,action_values,impressions,clicks,cpc,ctr}&limit=50&access_token=${token}`;

    const campRes = await fetch(campaignsUrl);
    const campJson = await campRes.json();

    if (campJson.error) {
      const errMsg = campJson.error.message || 'Meta API error';
      return NextResponse.json(
        { 
          success: false, 
          error: `Meta Graph API Error: ${errMsg}`,
          code: campJson.error.code,
          subcode: campJson.error.error_subcode 
        },
        { status: 400 }
      );
    }

    const rawCampaigns = campJson.data || [];

    // Transform into CampaignData[]
    const campaigns: CampaignData[] = rawCampaigns.map((c: any) => {
      const ins = c.insights?.data?.[0] || {};
      const spend = parseFloat(ins.spend || '0');
      const purchaseAction = ins.actions?.find((a: any) => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
      const purchaseValue = ins.action_values?.find((a: any) => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
      const conversions = parseInt(purchaseAction?.value || '0', 10);
      const revenue = parseFloat(purchaseValue?.value || '0');
      const roasItem = ins.purchase_roas?.[0];
      const roas = roasItem?.value ? parseFloat(roasItem.value) : (spend > 0 && revenue > 0 ? revenue / spend : 0);
      const impressions = parseInt(ins.impressions || '0', 10);
      const clicks = parseInt(ins.clicks || '0', 10);
      const ctr = parseFloat(ins.ctr || '0');
      const cpc = parseFloat(ins.cpc || '0');
      const cpa = conversions > 0 ? spend / conversions : 0;

      const dailyBudget = c.daily_budget ? Number(c.daily_budget) / 100 : (c.lifetime_budget ? Number(c.lifetime_budget) / 100 : 0);

      return {
        id: c.id,
        name: c.name,
        platform: 'META',
        status: (c.status === 'ACTIVE' || c.effective_status === 'ACTIVE') ? 'ACTIVE' : 'PAUSED',
        objective: c.objective || 'OUTCOME_SALES',
        budgetType: c.daily_budget ? 'DAILY' : 'CBO',
        dailyBudget,
        spend,
        conversions,
        cpa,
        roas,
        impressions,
        clicks,
        ctr,
        cpc,
      };
    });

    // 2. Fetch Ads with creatives
    let creatives: CreativeData[] = [];
    try {
      const adsUrl = `https://graph.facebook.com/v20.0/${adAccountId}/ads?fields=id,name,creative{id,name,title,body,image_url,thumbnail_url},insights.date_preset(maximum){spend,purchase_roas,actions,impressions,clicks,ctr,frequency}&limit=25&access_token=${token}`;
      const adsRes = await fetch(adsUrl);
      const adsJson = await adsRes.json();
      if (!adsJson.error && adsJson.data) {
        creatives = adsJson.data.map((ad: any, index: number) => {
          const ins = ad.insights?.data?.[0] || {};
          const spend = parseFloat(ins.spend || '0');
          const purchaseAction = ins.actions?.find((a: any) => a.action_type === 'purchase');
          const conversions = parseInt(purchaseAction?.value || '0', 10);
          const roas = ins.purchase_roas?.[0]?.value ? parseFloat(ins.purchase_roas[0].value) : 0;
          const impressions = parseInt(ins.impressions || '0', 10);
          const cpa = conversions > 0 ? spend / conversions : 0;
          const frequency = parseFloat(ins.frequency || '1.0');
          const ctr = parseFloat(ins.ctr || '0');

          return {
            id: `cr-${ad.id}`,
            adId: ad.id,
            adName: ad.name || `Ad Creative ${index + 1}`,
            campaignName: 'Meta Campaign',
            platform: 'META',
            thumbnailUrl: ad.creative?.thumbnail_url || ad.creative?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
            mediaType: 'IMAGE',
            headline: ad.creative?.title || ad.name,
            bodyCopy: ad.creative?.body || 'Direct response campaign creative',
            callToAction: 'Shop Now',
            spend,
            conversions,
            cpa,
            roas,
            impressions,
            hookRate: 35.0,
            holdRate: 18.0,
            frequency,
            ctr,
            fatigueScore: frequency > 3.0 ? 'HIGH_FATIGUE' : frequency > 2.2 ? 'WARNING' : 'HEALTHY',
            isUnderperformer: roas < 1.5 && spend > 50,
            isMvpWinner: roas >= 3.0,
            aiTags: {
              format: 'Product Showcase',
              hookType: 'Direct Visual Hook',
              offer: 'Standard Offer',
              cta: 'Shop Now',
              first3SecondsDescription: 'High clarity creative asset',
            },
          };
        });
      }
    } catch (e) {
      console.warn('Failed to fetch creatives, skipping:', e);
    }

    // 3. Calculate Overall Meta Metrics
    const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
    const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
    const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
    const totalRevenue = campaigns.reduce((acc, c) => acc + (c.spend * c.roas), 0);
    const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const blendedCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const blendedCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const blendedCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;

    const metricsSummary: MetricSummary = {
      spend: totalSpend,
      revenue: totalRevenue,
      conversions: totalConversions,
      cpa: blendedCpa,
      roas: blendedRoas,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: blendedCtr,
      cpc: blendedCpc,
    };

    return NextResponse.json({
      success: true,
      message: `Meta Ads থেকে সফলভাবে ${campaigns.length}টি ক্যাম্পেইন সিঙ্ক হয়েছে!`,
      metrics: metricsSummary,
      campaigns,
      creatives,
    });
  } catch (error: any) {
    console.error('Meta sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Meta API sync failed' },
      { status: 500 }
    );
  }
}
