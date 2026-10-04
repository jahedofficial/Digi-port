import { NextRequest, NextResponse } from 'next/server';
import { CampaignData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const advertiserId = body?.advertiserId?.trim();
    const accessToken = body?.accessToken?.trim();
    const appId = body?.appId?.trim();
    const appSecret = body?.appSecret?.trim();

    if (!advertiserId) {
      return NextResponse.json(
        { success: false, error: 'দয়া করে TikTok Advertiser ID প্রদান করুন।' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'দয়া করে TikTok Long-Lived Access Token প্রদান করুন।' },
        { status: 400 }
      );
    }

    // Verify against TikTok Open API v1.3
    const testUrl = `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${advertiserId}"]`;
    
    let res: Response;
    try {
      res = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
    } catch (netErr: any) {
      return NextResponse.json(
        { success: false, error: `TikTok API সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি: ${netErr.message}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (data.code !== 0) {
      let friendlyMsg = data.message || 'TikTok API ভেরিফিকেশন ব্যর্থ হয়েছে';
      if (data.code === 40001 || data.code === 40100) {
        friendlyMsg = 'আপনার TikTok Access Token-টি অবৈধ বা এর মেয়াদ শেষ হয়ে গেছে। TikTok Developer Portal থেকে নতুন টোকেন নিন।';
      } else if (data.code === 40002 || data.code === 40004) {
        friendlyMsg = `Advertiser ID (${advertiserId}) পাওয়া যায়নি অথবা এই টোকেনের অধীনে এই অ্যাকাউন্টের অ্যাক্সেস নেই।`;
      }
      return NextResponse.json(
        { 
          success: false, 
          error: friendlyMsg,
          code: data.code,
          rawError: data.message 
        },
        { status: 400 }
      );
    }

    const advInfo = data.data?.list?.[0] || {};
    const advertiserName = advInfo.advertiser_name || `TikTok Account (${advertiserId})`;
    const currency = advInfo.currency || 'USD';

    // Fetch live campaigns if available
    let campaigns: CampaignData[] = [];
    try {
      const campUrl = `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${advertiserId}&page_size=20`;
      const campRes = await fetch(campUrl, {
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      const campData = await campRes.json();
      if (campData.code === 0 && campData.data?.list) {
        campaigns = campData.data.list.map((c: any) => ({
          id: c.campaign_id,
          name: c.campaign_name,
          platform: 'TIKTOK',
          status: c.operation_status === 'ENABLE' ? 'ACTIVE' : 'PAUSED',
          objective: c.objective_type || 'CONVERSIONS',
          budgetType: c.budget_mode === 'BUDGET_MODE_DAY' ? 'DAILY' : 'LIFETIME',
          dailyBudget: Number(c.budget) || 0,
          spend: 0,
          conversions: 0,
          cpa: 0,
          roas: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          cpc: 0,
        }));
      }
    } catch {
      // Continue even if campaigns fetch fails
    }

    return NextResponse.json({
      success: true,
      message: `TikTok Ads (${advertiserName}) সফলভাবে যাচাই ও সংযুক্ত হয়েছে!`,
      accountName: advertiserName,
      advertiserId,
      currency,
      campaigns,
      metrics: {
        spend: 0,
        revenue: 0,
        conversions: 0,
        cpa: 0,
        roas: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
      },
    });
  } catch (error: any) {
    console.error('TikTok sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'TikTok API ভেরিফিকেশন ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
