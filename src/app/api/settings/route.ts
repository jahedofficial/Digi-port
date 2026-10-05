import { NextRequest, NextResponse } from 'next/server';
import { 
  getAiGatewayConfig, 
  saveAiGatewayConfig, 
  getTelegramAlertsConfig, 
  saveTelegramAlertsConfig,
  deleteAiGatewayConfig,
  deleteTelegramAlertsConfig,
  deleteSystemSetting
} from '@/lib/settings-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key === 'AI_GATEWAY') {
      const ai = await getAiGatewayConfig();
      const maskedKey = ai.secretKey && ai.secretKey.length > 10 
        ? `${ai.secretKey.slice(0, 10)}•••••••••••••` 
        : '';
      return NextResponse.json({
        success: true,
        data: {
          baseUrl: ai.baseUrl,
          modelEngine: ai.modelEngine,
          persona: ai.persona,
          isConfigured: ai.isConfigured,
          secretKey: ai.secretKey || '',
          maskedKey,
          hasKey: Boolean(ai.secretKey),
          source: ai.source,
          savedAt: ai.savedAt,
        },
      });
    }

    if (key === 'TELEGRAM_ALERTS') {
      const tg = await getTelegramAlertsConfig();
      const maskedToken = tg.botToken && tg.botToken.length > 10
        ? `${tg.botToken.slice(0, 10)}•••••••••••••`
        : '';
      return NextResponse.json({
        success: true,
        data: {
          botToken: tg.botToken || '',
          chatId: tg.chatId || '',
          whatsappNumber: tg.whatsappNumber || '',
          alertOnRoasDrop: tg.alertOnRoasDrop,
          alertDailySummary: tg.alertDailySummary,
          isConfigured: tg.isConfigured,
          maskedToken,
          hasToken: Boolean(tg.botToken),
          source: tg.source,
          savedAt: tg.savedAt,
        },
      });
    }

    // Default: Return both
    const [ai, tg] = await Promise.all([
      getAiGatewayConfig(),
      getTelegramAlertsConfig(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        aiGateway: {
          baseUrl: ai.baseUrl,
          modelEngine: ai.modelEngine,
          persona: ai.persona,
          isConfigured: ai.isConfigured,
          secretKey: ai.secretKey || '',
          maskedKey: ai.secretKey && ai.secretKey.length > 10 ? `${ai.secretKey.slice(0, 10)}•••••••••••••` : '',
          hasKey: Boolean(ai.secretKey),
          source: ai.source,
        },
        telegramAlerts: {
          botToken: tg.botToken || '',
          chatId: tg.chatId || '',
          whatsappNumber: tg.whatsappNumber || '',
          alertOnRoasDrop: tg.alertOnRoasDrop,
          alertDailySummary: tg.alertDailySummary,
          isConfigured: tg.isConfigured,
          maskedToken: tg.botToken && tg.botToken.length > 10 ? `${tg.botToken.slice(0, 10)}•••••••••••••` : '',
          hasToken: Boolean(tg.botToken),
          source: tg.source,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'সেটিংস লোড করতে সমস্যা হয়েছে',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, data } = body;

    if (!key || !data) {
      return NextResponse.json({
        success: false,
        error: 'Key এবং data প্রদান আবশ্যক',
      }, { status: 400 });
    }

    if (key === 'AI_GATEWAY') {
      const { baseUrl, secretKey, modelEngine, persona } = data;
      if (!secretKey) {
        return NextResponse.json({
          success: false,
          error: 'OpenRouter / OpenClaw API Key প্রদান করুন',
        }, { status: 400 });
      }

      const res = await saveAiGatewayConfig({
        baseUrl: baseUrl || 'https://openrouter.ai/api/v1',
        secretKey,
        modelEngine: modelEngine || 'deepseek-v4-flash',
        persona,
      });

      return NextResponse.json({
        success: true,
        message: `AI Gateway সেটিংস ডাটাবেসে (${res.source}) সফলভাবে সেভ করা হয়েছে!`,
        source: res.source,
      });
    }

    if (key === 'TELEGRAM_ALERTS') {
      const { botToken, chatId, whatsappNumber, alertOnRoasDrop, alertDailySummary } = data;

      const res = await saveTelegramAlertsConfig({
        botToken,
        chatId,
        whatsappNumber,
        alertOnRoasDrop,
        alertDailySummary,
      });

      return NextResponse.json({
        success: true,
        message: `মোবাইল অ্যালার্ট সেটিংস ডাটাবেসে (${res.source}) সফলভাবে সেভ করা হয়েছে!`,
        source: res.source,
      });
    }

    return NextResponse.json({
      success: false,
      error: `অজানা ক্যাটাগরি: ${key}`,
    }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'ডাটাবেসে সেভ করতে সমস্যা হয়েছে',
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({
        success: false,
        error: 'Key প্যারামিটার প্রয়োজন',
      }, { status: 400 });
    }

    if (key === 'AI_GATEWAY') {
      await deleteAiGatewayConfig();
      return NextResponse.json({
        success: true,
        message: 'AI Gateway সেটিংস সফলভাবে মুছে ফেলা হয়েছে',
      });
    }

    if (key === 'TELEGRAM_ALERTS') {
      await deleteTelegramAlertsConfig();
      return NextResponse.json({
        success: true,
        message: 'টেলিগ্রাম অ্যালার্ট সেটিংস সফলভাবে মুছে ফেলা হয়েছে',
      });
    }

    await deleteSystemSetting(key);
    return NextResponse.json({
      success: true,
      message: `${key} সেটিংস মুছে ফেলা হয়েছে`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'মুছে ফেলতে সমস্যা হয়েছে',
    }, { status: 500 });
  }
}

