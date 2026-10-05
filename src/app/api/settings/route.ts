import { NextRequest, NextResponse } from 'next/server';
import { 
  getAiGatewayConfig, 
  saveAiGatewayConfig, 
  getTelegramAlertsConfig, 
  saveTelegramAlertsConfig,
  deleteAiGatewayConfig,
  deleteTelegramAlertsConfig,
  getMetaDirectConfig,
  saveMetaDirectConfig,
  deleteMetaDirectConfig,
  getGoogleDirectConfig,
  saveGoogleDirectConfig,
  deleteGoogleDirectConfig,
  getTiktokDirectConfig,
  saveTiktokDirectConfig,
  deleteTiktokDirectConfig,
  getSmtpConfig,
  saveSmtpConfig,
  deleteSmtpConfig,
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

    if (key === 'META_DIRECT') {
      const meta = await getMetaDirectConfig();
      const maskedToken = meta.token && meta.token.length > 10
        ? `${meta.token.slice(0, 10)}•••••••••••••`
        : '';
      const maskedSecret = meta.appSecret && meta.appSecret.length > 6
        ? `${meta.appSecret.slice(0, 6)}•••••••••••••`
        : '';
      return NextResponse.json({
        success: true,
        data: {
          token: meta.token || '',
          adAccountId: meta.adAccountId || '',
          appId: meta.appId || '',
          appSecret: meta.appSecret || '',
          scope: meta.scope || 'READ_WRITE',
          isConnected: meta.isConnected,
          hasToken: Boolean(meta.token),
          hasAppSecret: Boolean(meta.appSecret),
          maskedToken,
          maskedSecret,
          source: meta.source,
          savedAt: meta.savedAt,
        },
      });
    }

    if (key === 'GOOGLE_DIRECT') {
      const google = await getGoogleDirectConfig();
      const maskedDevToken = google.developerToken && google.developerToken.length > 6
        ? `${google.developerToken.slice(0, 6)}•••••••••••••`
        : '';
      const maskedSecret = google.clientSecret && google.clientSecret.length > 6
        ? `${google.clientSecret.slice(0, 6)}•••••••••••••`
        : '';
      return NextResponse.json({
        success: true,
        data: {
          customerId: google.customerId || '',
          developerToken: google.developerToken || '',
          clientId: google.clientId || '',
          clientSecret: google.clientSecret || '',
          ga4PropertyId: google.ga4PropertyId || '',
          scope: google.scope || 'READ_WRITE',
          isConnected: google.isConnected,
          isGa4Connected: google.isGa4Connected,
          hasDevToken: Boolean(google.developerToken),
          hasSecret: Boolean(google.clientSecret),
          hasServiceAccount: Boolean(google.hasServiceAccount || google.serviceAccountEmail),
          serviceAccountEmail: google.serviceAccountEmail || '',
          serviceAccountProjectId: google.serviceAccountProjectId || '',
          maskedDevToken,
          maskedSecret,
          source: google.source,
          savedAt: google.savedAt,
        },
      });
    }

    if (key === 'TIKTOK_DIRECT') {
      const tiktok = await getTiktokDirectConfig();
      const maskedToken = tiktok.accessToken && tiktok.accessToken.length > 10
        ? `${tiktok.accessToken.slice(0, 10)}•••••••••••••`
        : '';
      const maskedSecret = tiktok.appSecret && tiktok.appSecret.length > 6
        ? `${tiktok.appSecret.slice(0, 6)}•••••••••••••`
        : '';
      return NextResponse.json({
        success: true,
        data: {
          advertiserId: tiktok.advertiserId || '',
          appId: tiktok.appId || '',
          appSecret: tiktok.appSecret || '',
          accessToken: tiktok.accessToken || '',
          scope: tiktok.scope || 'READ_WRITE',
          isConnected: tiktok.isConnected,
          hasToken: Boolean(tiktok.accessToken),
          hasSecret: Boolean(tiktok.appSecret),
          maskedToken,
          maskedSecret,
          source: tiktok.source,
          savedAt: tiktok.savedAt,
        },
      });
    }

    if (key === 'SMTP_CONFIG') {
      const smtp = await getSmtpConfig();
      const maskedPass = smtp.smtpPass && smtp.smtpPass.length > 4
        ? `${smtp.smtpPass.slice(0, 4)}••••••••••••`
        : '';
      return NextResponse.json({
        success: true,
        data: {
          smtpUser: smtp.smtpUser || '',
          smtpPass: smtp.smtpPass || '',
          isConfigured: smtp.isConfigured,
          hasPass: Boolean(smtp.smtpPass),
          maskedPass,
          source: smtp.source,
          savedAt: smtp.savedAt,
        },
      });
    }

    // Default: Return all
    const [ai, tg, meta, google, tiktok, smtp] = await Promise.all([
      getAiGatewayConfig(),
      getTelegramAlertsConfig(),
      getMetaDirectConfig(),
      getGoogleDirectConfig(),
      getTiktokDirectConfig(),
      getSmtpConfig(),
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
          savedAt: ai.savedAt,
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
          savedAt: tg.savedAt,
        },
        metaDirect: {
          token: meta.token || '',
          adAccountId: meta.adAccountId || '',
          appId: meta.appId || '',
          appSecret: meta.appSecret || '',
          scope: meta.scope || 'READ_WRITE',
          isConnected: meta.isConnected,
          hasToken: Boolean(meta.token),
          maskedToken: meta.token && meta.token.length > 10 ? `${meta.token.slice(0, 10)}•••••••••••••` : '',
          source: meta.source,
          savedAt: meta.savedAt,
        },
        googleDirect: {
          customerId: google.customerId || '',
          developerToken: google.developerToken || '',
          clientId: google.clientId || '',
          clientSecret: google.clientSecret || '',
          ga4PropertyId: google.ga4PropertyId || '',
          scope: google.scope || 'READ_WRITE',
          isConnected: google.isConnected,
          isGa4Connected: google.isGa4Connected,
          hasDevToken: Boolean(google.developerToken),
          hasServiceAccount: Boolean(google.hasServiceAccount || google.serviceAccountEmail),
          serviceAccountEmail: google.serviceAccountEmail || '',
          serviceAccountProjectId: google.serviceAccountProjectId || '',
          maskedDevToken: google.developerToken && google.developerToken.length > 6 ? `${google.developerToken.slice(0, 6)}•••••••••••••` : '',
          source: google.source,
          savedAt: google.savedAt,
        },
        tiktokDirect: {
          advertiserId: tiktok.advertiserId || '',
          appId: tiktok.appId || '',
          appSecret: tiktok.appSecret || '',
          accessToken: tiktok.accessToken || '',
          scope: tiktok.scope || 'READ_WRITE',
          isConnected: tiktok.isConnected,
          hasToken: Boolean(tiktok.accessToken),
          maskedToken: tiktok.accessToken && tiktok.accessToken.length > 10 ? `${tiktok.accessToken.slice(0, 10)}•••••••••••••` : '',
          source: tiktok.source,
          savedAt: tiktok.savedAt,
        },
        smtpConfig: {
          smtpUser: smtp.smtpUser || '',
          smtpPass: smtp.smtpPass || '',
          isConfigured: smtp.isConfigured,
          hasPass: Boolean(smtp.smtpPass),
          maskedPass: smtp.smtpPass && smtp.smtpPass.length > 4 ? `${smtp.smtpPass.slice(0, 4)}••••••••••••` : '',
          source: smtp.source,
          savedAt: smtp.savedAt,
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

    if (key === 'META_DIRECT') {
      const { token, adAccountId, appId, appSecret, scope, isConnected } = data;

      const res = await saveMetaDirectConfig({
        token,
        adAccountId,
        appId,
        appSecret,
        scope,
        isConnected,
      });

      return NextResponse.json({
        success: true,
        message: `Meta API ক্রেডেনশিয়াল ডাটাবেসে (${res.source}) সফলভাবে সেভ করা হয়েছে!`,
        source: res.source,
      });
    }

    if (key === 'GOOGLE_DIRECT') {
      const {
        customerId,
        developerToken,
        clientId,
        clientSecret,
        ga4PropertyId,
        scope,
        isConnected,
        isGa4Connected,
        serviceAccountJson,
        serviceAccountEmail,
        serviceAccountProjectId,
      } = data;

      const res = await saveGoogleDirectConfig({
        customerId,
        developerToken,
        clientId,
        clientSecret,
        ga4PropertyId,
        scope,
        isConnected,
        isGa4Connected,
        serviceAccountJson,
        serviceAccountEmail,
        serviceAccountProjectId,
      });

      return NextResponse.json({
        success: true,
        message: `Google Ads ও GA4 ক্রেডেনশিয়াল ডাটাবেসে (${res.source}) সফলভাবে সেভ করা হয়েছে!`,
        source: res.source,
      });
    }

    if (key === 'TIKTOK_DIRECT') {
      const { advertiserId, appId, appSecret, accessToken, scope, isConnected } = data;

      const res = await saveTiktokDirectConfig({
        advertiserId,
        appId,
        appSecret,
        accessToken,
        scope,
        isConnected,
      });

      return NextResponse.json({
        success: true,
        message: `TikTok Marketing API ক্রেডেনশিয়াল ডাটাবেসে (${res.source}) সফলভাবে সেভ করা হয়েছে!`,
        source: res.source,
      });
    }

    if (key === 'SMTP_CONFIG') {
      const { smtpUser, smtpPass } = data;

      const res = await saveSmtpConfig({
        smtpUser,
        smtpPass,
      });

      return NextResponse.json({
        success: true,
        message: `Gmail SMTP সার্ভিস ক্রেডেনশিয়াল ডাটাবেসে (${res.source}) সফলভাবে সেভ করা হয়েছে!`,
        source: res.source,
      });
    }

    return NextResponse.json({
      success: false,
      error: `অজানা ক্যাটাগরি: ${key}`,
    }, { status: 400 });
  } catch (error: any) {
    console.error('[SETTINGS_POST_ERROR]:', error);
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

    if (key === 'META_DIRECT') {
      await deleteMetaDirectConfig();
      return NextResponse.json({
        success: true,
        message: 'Meta ক্রেডেনশিয়াল সফলভাবে মুছে ফেলা হয়েছে',
      });
    }

    if (key === 'GOOGLE_DIRECT') {
      await deleteGoogleDirectConfig();
      return NextResponse.json({
        success: true,
        message: 'Google Ads ক্রেডেনশিয়াল সফলভাবে মুছে ফেলা হয়েছে',
      });
    }

    if (key === 'TIKTOK_DIRECT') {
      await deleteTiktokDirectConfig();
      return NextResponse.json({
        success: true,
        message: 'TikTok ক্রেডেনশিয়াল সফলভাবে মুছে ফেলা হয়েছে',
      });
    }

    if (key === 'SMTP_CONFIG') {
      await deleteSmtpConfig();
      return NextResponse.json({
        success: true,
        message: 'Gmail SMTP ক্রেডেনশিয়াল সফলভাবে মুছে ফেলা হয়েছে',
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
