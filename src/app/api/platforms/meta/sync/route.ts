import { NextRequest, NextResponse } from 'next/server';
import { CampaignData, CreativeData, MetricSummary } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body?.token?.trim();
    let adAccountId = body?.adAccountId?.trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'দয়া করে Meta System User Access Token ইনপুট করুন।' },
        { status: 400 }
      );
    }

    if (!adAccountId) {
      return NextResponse.json(
        { success: false, error: 'দয়া করে Target Meta Ad Account ID ইনপুট করুন।' },
        { status: 400 }
      );
    }

    // Clean account ID to always have 'act_' prefix
    adAccountId = adAccountId.replace(/^act_?/i, '');
    const cleanId = `act_${adAccountId}`;

    // 1. Verify Ad Account Access & Meta Token validity
    const accountUrl = `https://graph.facebook.com/v20.0/${cleanId}?fields=id,name,account_status,currency,amount_spent&access_token=${token}`;
    const accRes = await fetch(accountUrl);
    const accJson = await accRes.json();

    if (accJson.error) {
      let friendlyMsg = accJson.error.message || 'Meta API error';
      if (accJson.error.code === 190) {
        friendlyMsg = 'আপনার Meta Access Token-টি অবৈধ বা এর মেয়াদ শেষ হয়ে গেছে। Meta Business Suite > Users > System Users থেকে নতুন Long-Lived Token তৈরি করুন।';
      } else if (accJson.error.code === 100) {
        friendlyMsg = `অ্যাড অ্যাকাউন্ট (${cleanId}) পাওয়া যায়নি। অনুগ্রহ করে আপনার Ads Manager URL থেকে সঠিক অ্যাকাউন্ট আইডি দিন।`;
      } else if (accJson.error.code === 200 || accJson.error.code === 294) {
        friendlyMsg = `এই সিস্টেম ইউজারের কাছে অ্যাড অ্যাকাউন্ট (${cleanId}) অ্যাক্সেস করার অনুমতি (ads_read / ads_management) নেই। Meta Business Settings > Accounts > Ad Accounts এ গিয়ে এই System User-কে পারমিশন দিন।`;
      }

      return NextResponse.json(
        { 
          success: false, 
          error: friendlyMsg,
          rawError: accJson.error.message,
          code: accJson.error.code,
        },
        { status: 400 }
      );
    }

    const accountName = accJson.name || cleanId;
    const accountCurrency = accJson.currency || 'USD';

    // 2. Fetch campaigns safely
    const campaignsUrl = `https://graph.facebook.com/v20.0/${cleanId}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget&limit=50&access_token=${token}`;
    const campRes = await fetch(campaignsUrl);
    const campJson = await campRes.json();
    const rawCampaigns = campJson.data || [];

    // 3. Fetch campaign-level insights safely
    let insightsMap: Record<string, any> = {};
    try {
      const insUrl = `https://graph.facebook.com/v20.0/${cleanId}/insights?level=campaign&fields=campaign_id,spend,purchase_roas,actions,action_values,impressions,clicks,cpc,ctr&date_preset=maximum&limit=100&access_token=${token}`;
      const insRes = await fetch(insUrl);
      const insJson = await insRes.json();
      if (insJson.data && Array.isArray(insJson.data)) {
        insJson.data.forEach((item: any) => {
          if (item.campaign_id) {
            insightsMap[item.campaign_id] = item;
          }
        });
      }
    } catch (e) {
      console.warn('Failed to fetch campaign insights:', e);
    }

    // 4. Map into CampaignData[]
    const campaigns: CampaignData[] = rawCampaigns.map((c: any) => {
      const ins = insightsMap[c.id] || {};
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

    // 5. Fetch Ads with creatives
    let creatives: CreativeData[] = [];
    try {
      const adsUrl = `https://graph.facebook.com/v20.0/${cleanId}/ads?fields=id,name,creative{id,name,title,body,image_url,thumbnail_url}&limit=25&access_token=${token}`;
      const adsRes = await fetch(adsUrl);
      const adsJson = await adsRes.json();
      if (!adsJson.error && adsJson.data) {
        creatives = adsJson.data.map((ad: any, index: number) => {
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
            spend: 0,
            conversions: 0,
            cpa: 0,
            roas: 0,
            impressions: 0,
            hookRate: 35.0,
            holdRate: 18.0,
            frequency: 1.0,
            ctr: 1.5,
            fatigueScore: 'HEALTHY',
            isUnderperformer: false,
            isMvpWinner: false,
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

    // 6. Calculate Overall Meta Metrics
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

    const statusMsg = campaigns.length > 0
      ? `Meta Ads (${accountName}) থেকে সফলভাবে ${campaigns.length}টি লাইভ ক্যাম্পেইন সিঙ্ক হয়েছে!`
      : `Meta Ad Account (${accountName}) সফলভাবে কানেক্ট হয়েছে! (বর্তমানে অ্যাকাউন্টে কোনো অ্যাক্টিভ ক্যাম্পেইন নেই)।`;

    return NextResponse.json({
      success: true,
      accountName,
      currency: accountCurrency,
      message: statusMsg,
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
