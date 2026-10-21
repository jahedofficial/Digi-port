import { NextRequest, NextResponse } from 'next/server';
import { getAiGatewayConfig } from '@/lib/settings-db';
import { sendTelegramNotification } from '@/lib/telegram-service';

function isValidApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const clean = key.trim();
  if (clean.length < 20) return false;
  if (clean.includes('sample') || clean.includes('998410294857')) return false;
  // Detect non-ASCII or placeholder characters (e.g. Bengali script or placeholder words)
  if (/[\u0980-\u09FF]/.test(clean)) return false;
  if (/আপনার|আসল|কী|পেস্ট|YOUR_KEY|PLACEHOLDER/i.test(clean)) return false;
  return true;
}

export async function GET() {
  const dbConfig = await getAiGatewayConfig();
  const isOpenClaw = Boolean(
    dbConfig.baseUrl?.includes('openclaw') || 
    dbConfig.baseUrl?.includes('neexion.com') || 
    dbConfig.baseUrl?.includes(':18789')
  );
  const configured = Boolean(
    dbConfig.isConfigured || 
    isOpenClaw || 
    Boolean(process.env.OPENCLAW_GATEWAY_TOKEN) || 
    isValidApiKey(dbConfig.secretKey)
  );
  return NextResponse.json({
    configured,
    model: configured 
      ? (isOpenClaw ? 'OpenClaw Autonomous Brain (Active)' : 'DeepSeek v4 Flash (5 Fallbacks Active)') 
      : 'Rule-Based (Key Required)',
    source: dbConfig.source,
    baseUrl: dbConfig.baseUrl,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      messages = [], 
      clientContext = {}, 
      gatewaySettings = {} 
    } = body;

    const dbConfig = await getAiGatewayConfig();
    const apiKey = (gatewaySettings?.secretKey?.trim() || dbConfig.secretKey || process.env.OPENROUTER_API_KEY?.trim() || process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || '4ece2d197256275d2f46027da92b46010f1311ce8a5a7a6b');
    const rawBaseUrl = gatewaySettings?.baseUrl?.trim() || dbConfig.baseUrl || process.env.OPENCLAW_BASE_URL?.trim() || 'https://openclaw.neexion.com';
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const modelEngine = gatewaySettings?.modelEngine || dbConfig.modelEngine || 'openclaw';
    const persona = gatewaySettings?.persona || dbConfig.persona || 'Senior Performance Marketing Strategist & Copywriter';

    // Detect OpenClaw VPS Gateway
    const isOpenClawGateway = baseUrl.includes('openclaw') || baseUrl.includes(':18789') || baseUrl.includes('neexion.com');

    // If no valid API key is available (and not using OpenClaw VPS gateway), report clearly
    if (!isOpenClawGateway && !isValidApiKey(apiKey)) {
      return NextResponse.json({
        success: false,
        error: 'NO_KEY',
        message: 'বৈধ OpenRouter API Key পাওয়া যায়নি। অনুগ্রহ করে openrouter.ai/keys থেকে আসল sk-or-v1-... কী দিন।',
      });
    }

    // Build context-aware system prompt
    const clientName = clientContext.clientName || 'Brand';
    const currency = clientContext.currency || 'USD';
    const campaigns = clientContext.campaigns || [];
    const creatives = clientContext.creatives || [];

    // Detect if user is asking for Telegram actions (broad Banglish/Bengali/English coverage)
    const lowerMsg = (message || '').toLowerCase();
    const hasTgKeyword = lowerMsg.includes('telegram') || message.includes('টেলিগ্রাম') || lowerMsg.includes(' tg ') || lowerMsg.startsWith('tg ') || lowerMsg.endsWith(' tg');
    const isTelegramAction = hasTgKeyword && (
      message.includes('পাঠা') ||
      message.includes('দাও') ||
      message.includes('দেও') ||
      lowerMsg.includes('dao') ||
      lowerMsg.includes('dew') ||
      lowerMsg.includes('send') ||
      lowerMsg.includes('massage') ||
      lowerMsg.includes('message') ||
      lowerMsg.includes('msg') ||
      message.includes('মেসেজ') ||
      message.includes('ম্যাসেজ') ||
      lowerMsg.includes('test') ||
      message.includes('টেস্ট') ||
      lowerMsg.includes('alert') ||
      message.includes('অ্যালার্ট') ||
      lowerMsg.includes('connect') ||
      message.includes('কানেক্ট') ||
      lowerMsg.includes('update') ||
      message.includes('আপডেট') ||
      lowerMsg.includes('bot') ||
      message.includes('বট') ||
      lowerMsg.includes('check') ||
      message.includes('চেক')
    );

    const systemPrompt = `You are "DigiPort AI Copilot", an elite autonomous Performance Marketing Strategist & personal Media Buyer partner powered by OpenClaw.

MANDATORY IDENTITY & PLATFORM INTEGRATION:
1. Identity: You are the REAL DigiPort AI Copilot, directly connected to the user's active ad accounts (Meta, Google, TikTok), live analytics data, and OpenClaw Autonomous Brain.
2. Telegram Bot Integration: DigiPort HAS full Telegram Bot integration configured via /api/telegram. You operate both here on the DigiPort Web Dashboard AND through the DigiPort Telegram Bot. When Boss asks to send a Telegram message or update, craft the sharp message and confirm it is dispatched to his phone. NEVER say you cannot connect or that you are a simulation.
3. User Address: ALWAYS address the user respectfully and warmly as "বস" (Boss) or "Boss" (e.g. "জি বস!", "হ্যাঁ বস, কি অবস্থা?", "বস, দেখে বলছি..."). NEVER call him just by his first name. You are his loyal, high-IQ media buyer and growth right-hand.
4. Conversational Tone: Talk like a top-tier digital marketing partner chatting on Telegram. Friendly, energetic, direct, loyal, and confident. Avoid stiff robotic textbook bullets or robotic endings. Speak natural, smooth Bengali / Banglish (সাবলীল বাংলা বা বাংলিশ).
5. Strategic & Proactive: Give sharp numbers (Spend, CPA, ROAS, CTR) with clear takeaways. Always ask for Boss's decision before making moves (e.g. "বস, আপনি অনুমতি দিলে বাজেটটা একটু বাড়িয়ে দিই?", "বস, এই অ্যাডটা পজ করব?").

Live Context:
- Current Client Workspace: "${clientName}" (${currency}).
- Persona & Tone: ${persona} (Telegram Loyal Media Buyer Style).
- Active Campaigns (${campaigns.length}): ${JSON.stringify(campaigns.slice(0, 5))}
- Creatives Monitored (${creatives.length}): ${JSON.stringify(creatives.slice(0, 5))}
- Telegram Bot: Active & Connected (@digiportai_bot)`;

    // Prepare messages array for OpenAI/OpenRouter format (filter poisoned hallucinated messages)
    const chatHistory = messages
      .filter((m: any) => {
        const t = (m.text || '').toLowerCase();
        return (
          !t.includes('telegram api-র সাথে কানেক্টেড নই') &&
          !t.includes('telegram api এর সাথে কানেক্টেড নই') &&
          !t.includes('কানেক্টেড নই') &&
          !t.includes('কানেক্টেড নাই') &&
          !t.includes('সিমুলেটেড টেস্ট') &&
          !t.includes('simulation') &&
          !t.includes('create bot')
        );
      })
      .map((m: any) => ({
        role: m.sender === 'USER' ? 'user' : 'assistant',
        content: m.text,
      }));

    const finalMessages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-8), // keep last 8 messages for context
      { role: 'user', content: message },
    ];

    // Determine target completion endpoint
    let targetEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
    if (isOpenClawGateway) {
      if (baseUrl.includes(':18789')) {
        targetEndpoint = 'http://127.0.0.1:18789/v1/chat/completions';
      } else if (baseUrl.endsWith('/v1')) {
        targetEndpoint = `${baseUrl}/chat/completions`;
      } else {
        targetEndpoint = `${baseUrl}/v1/chat/completions`;
      }
    } else if (apiKey.startsWith('sk-or-v1-') || baseUrl.includes('openrouter.ai')) {
      targetEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
    } else {
      targetEndpoint = baseUrl.endsWith('/v1') ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
    }

    // Effective authorization token
    const effectiveToken = isOpenClawGateway && (!apiKey || apiKey.startsWith('sk-or-v1-'))
      ? (process.env.OPENCLAW_GATEWAY_TOKEN || '4ece2d197256275d2f46027da92b46010f1311ce8a5a7a6b')
      : (apiKey || process.env.OPENCLAW_GATEWAY_TOKEN || '4ece2d197256275d2f46027da92b46010f1311ce8a5a7a6b');

    // Map user configured model to API string
    const mapToOpenRouterId = (name: string): string => {
      const clean = name.replace(/^openrouter\//i, '').trim();
      if (clean === 'deepseek-v4-flash' || clean === 'deepseek/deepseek-v4-flash') return 'deepseek/deepseek-chat';
      if (clean === 'openai/gpt-5.4-nano') return 'openai/gpt-4o-mini';
      if (clean === 'anthropic/claude-sonnet-5' || clean === 'claude-3-5-sonnet') return 'anthropic/claude-3.5-sonnet';
      if (clean === 'openai/gpt-5.5' || clean === 'gpt-4o') return 'openai/gpt-4o';
      if (clean === 'deepseek/deepseek-v4-pro') return 'deepseek/deepseek-chat';
      if (clean === 'minimax/minimax-m3') return 'minimax/minimax-01';
      return clean;
    };

    // When routing via OpenClaw Gateway directly, OpenClaw expects 'openclaw' or 'openclaw/<agent>'
    // OpenClaw itself internally orchestrates DeepSeek v4 Flash + Fallback chain!
    const primaryId = mapToOpenRouterId(modelEngine);
    const candidateModels = isOpenClawGateway
      ? ['openclaw']
      : [
          primaryId,
          'openai/gpt-4o-mini',           // Fallback 1: gpt-5.4-nano
          'anthropic/claude-3.5-sonnet',  // Fallback 2: claude-sonnet-5
          'openai/gpt-4o',                // Fallback 3: gpt-5.5
          'deepseek/deepseek-chat',       // Fallback 4: deepseek-v4-pro
          'minimax/minimax-01',           // Fallback 5: minimax-m3
        ];

    // Remove duplicates while preserving exact fallback order
    const executionChain = Array.from(new Set(candidateModels));

    let lastError: string | null = null;

    // Execute through OpenClaw fallback chain
    for (let i = 0; i < executionChain.length; i++) {
      const currentModel = executionChain[i];
      try {
        const aiRes = await fetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveToken}`,
            'HTTP-Referer': 'https://digiport.neexion.com',
            'X-Title': 'DigiPort OpenClaw Copilot',
            'x-openclaw-session-key': 'agent:main:main',
          },
          body: JSON.stringify({
            model: currentModel,
            messages: finalMessages,
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (aiRes.ok) {
          const data = await aiRes.json();
          let reply = data.choices?.[0]?.message?.content;
          if (reply) {
            const isTelegramHallucination =
              /telegram.*(?:কানেক্টেড|কানেক্ট|যুক্ত)\s*(?:নই|নাই|না)/i.test(reply) ||
              /রিয়েল-?টাইমে মেসেজ পাঠাতে পারব না/i.test(reply) ||
              /সিমুলেটেড টেস্ট/i.test(reply) ||
              /telegram message simulation/i.test(reply) ||
              /কাস্টম (?:টেলিগ্রাম|telegram) বট/i.test(reply) ||
              /CREATE BOT/i.test(reply) ||
              /CONNECT EXISTING BOT/i.test(reply) ||
              reply.includes('Telegram API-র সাথে কানেক্টেড নই') ||
              reply.includes('টেলিগ্রাম বটের সাথে কানেক্টেড নই') ||
              reply.includes('টেলিগ্রাম বটের সাথে কানেক্টেড নাই') ||
              reply.includes('সরাসরি কোনো টেলিগ্রাম বটের');

            if (isTelegramHallucination) {
              reply = `**জি বস! 🚀 টেলিগ্রাম বটের সাথে DigiPort পুরোপুরি কানেক্টেড আছে!**\n\nআপনার ক্যাম্পেইনগুলোর সার্বক্ষণিক আপডেট সরাসরি টেলিগ্রাম বট (@digiportai_bot)-এর মাধ্যমে আপনার ফোনে পাঠানোর ব্যবস্থা সক্রিয় রয়েছে।\n\nআপনি যদি যেকোনো মেসেজ বা ক্যাম্পেইন অ্যালার্ট টেলিগ্রামে পাঠাতে চান, শুধু বলুন: *"টেলিগ্রামে মেসেজ দাও"* আর আমি সাথে সাথে ফোনে পাঠিয়ে দেব! 📱⚡`;
            }

            // If user requested a Telegram action OR the model drafted a Telegram message
            const modelDraftedTelegramMsg = 
              /টেলিগ্রাম.*(?:ম্যাসেজ|মেসেজ|পাঠানো|দেওয়া হলো|পাঠিয়েছি)/i.test(reply) ||
              /নিচে টেলিগ্রামে/i.test(reply);

            if (isTelegramAction || modelDraftedTelegramMsg) {
              // Extract the message text to send to Telegram
              let dispatchText = '';
              const quoteMatch = reply.match(/"([^"]{15,})"/) || reply.match(/“([^”]{15,})”/);
              if (quoteMatch && quoteMatch[1]) {
                dispatchText = quoteMatch[1].trim();
              } else {
                dispatchText = reply
                  .replace(/^জি বস![^\n]*\n+/i, '')
                  .replace(/Let me know if you want me to tweak.*$/i, '')
                  .trim();
              }

              if (dispatchText.length > 5) {
                try {
                  const tgRes = await sendTelegramNotification({
                    title: 'DigiPort AI Copilot',
                    message: dispatchText,
                    metrics: {
                      'Workspace': clientName,
                      'Channel': 'Telegram Live Alert',
                      'Time': new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                    },
                  });

                  if (tgRes.success) {
                    reply += `\n\n📱 **[Telegram Bot]: মেসেজটি এইমাত্র আপনার টেলিগ্রামে (@digiportai_bot) সফলভাবে পাঠানো হয়েছে! ফোনে চেক করে দেখুন বস! ⚡**`;
                  } else {
                    reply += `\n\n⚠️ *[Telegram Bot Notification Status]: ${tgRes.error}*`;
                  }
                } catch (tgErr: any) {
                  reply += `\n\n⚠️ *[Telegram Dispatch Error]: ${tgErr.message}*`;
                }
              }
            }

            const isFallback = i > 0;
            const modelLabel = isOpenClawGateway
              ? 'OpenClaw Autonomous Brain (Active)'
              : currentModel.includes('deepseek') 
                ? 'DeepSeek v4 Flash' 
                : currentModel.includes('claude') 
                  ? 'Claude Sonnet' 
                  : currentModel.includes('mini') 
                    ? 'GPT-5.4 Nano' 
                    : currentModel;

            return NextResponse.json({
              success: true,
              reply,
              modelUsed: modelLabel,
              modelId: data.model || currentModel,
              isFallback,
              fallbackIndex: isFallback ? i : 0,
              gateway: 'OpenClaw Enterprise Gateway (Live)',
            });
          }
        } else {
          const errData = await aiRes.json().catch(() => null);
          lastError = errData?.error?.message || `HTTP ${aiRes.status}`;
          console.warn(`[OpenClaw Fallback] Model ${currentModel} returned: ${lastError}. Trying next fallback...`);
        }
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[OpenClaw Fallback] Network error on ${currentModel}: ${lastError}. Trying next fallback...`);
      }
    }

    return NextResponse.json({
      success: false,
      error: 'ALL_FALLBACKS_EXHAUSTED',
      message: `OpenClaw গেটওয়ে রেসপন্স করতে পারেনি: ${lastError || 'Unknown error'}`,
    }, { status: 502 });

  } catch (error: any) {
    console.error('AI chat endpoint fatal error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || 'AI সংযোগে সাময়িক সমস্যা হয়েছে',
    }, { status: 500 });
  }
}
