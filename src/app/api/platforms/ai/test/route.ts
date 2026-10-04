import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = body?.baseUrl?.trim() || 'https://openrouter.ai/api/v1';
    const secretKey = body?.secretKey?.trim();
    const modelEngine = body?.modelEngine?.trim() || 'deepseek-v4-flash';

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'দয়া করে OpenRouter / OpenClaw API Secret Key প্রদান করুন।' },
        { status: 400 }
      );
    }

    if (secretKey.includes('998410294857') || secretKey.length < 15) {
      return NextResponse.json(
        { success: false, error: 'প্রদত্ত API Secret Key-টি একটি ডামি বা অসম্পূর্ণ কী। অনুগ্রহ করে আপনার আসল OpenRouter বা OpenClaw কী প্রদান করুন।' },
        { status: 400 }
      );
    }

    // Determine verification target
    const isLocalDigiPort = baseUrl.includes(':18789') || baseUrl.includes('digiport.neexion.com');
    const isExplicitOpenRouter = baseUrl.includes('openrouter.ai');
    
    // For OpenRouter keys, verify via official auth/key endpoint
    // For external custom gateways, verify via their /v1/models endpoint
    let verifyUrl = 'https://openrouter.ai/api/v1/auth/key';
    if (!isLocalDigiPort && !isExplicitOpenRouter && !secretKey.startsWith('sk-or-v1-')) {
      verifyUrl = `${baseUrl.replace(/\/+$/, '')}/v1/models`;
    }

    try {
      const pingRes = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'HTTP-Referer': 'https://digiport.neexion.com',
          'X-Title': 'DigiPort Marketing Suite',
        },
      });

      if (!pingRes.ok) {
        const pingJson = await pingRes.json().catch(() => null);
        let errorMsg = pingJson?.error?.message || `Gateway returned HTTP status ${pingRes.status}`;
        if (pingRes.status === 401) {
          errorMsg = 'API Secret Key সঠিক নয় অথবা অননুমোদিত (401 Unauthorized)। অনুগ্রহ করে কী চেক করুন।';
        } else if (pingRes.status === 404) {
          errorMsg = `গেটওয়ে এন্ডপয়েন্ট (${verifyUrl}) পাওয়া যায়নি (404 Not Found)। Base URL সঠিক কিনা যাচাই করুন।`;
        }
        return NextResponse.json(
          { success: false, error: `AI Gateway ভেরিফিকেশন ব্যর্থ: ${errorMsg}` },
          { status: 400 }
        );
      }

      const pingData = await pingRes.json().catch(() => ({}));
      const keyLabel = pingData?.data?.label || modelEngine;

      return NextResponse.json({
        success: true,
        message: `OpenClaw / OpenRouter AI Gateway সফলভাবে কানেক্ট ও যাচাই করা হয়েছে (${keyLabel})!`,
        gatewayInfo: {
          baseUrl,
          modelEngine,
          status: 'CONNECTED',
        },
      });
    } catch (netErr: any) {
      return NextResponse.json(
        { success: false, error: `AI Gateway হোস্টের (${baseUrl}) সাথে যোগাযোগ করা সম্ভব হয়নি: ${netErr.message}` },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('AI gateway verify error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI Gateway ভেরিফিকেশন ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
