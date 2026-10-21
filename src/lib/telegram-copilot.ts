import { processAgentCommand } from './agent-runner';
import { INITIAL_CLIENT_WORKSPACES } from './workspace-presets';
import { getTelegramAlertsConfig, getAiGatewayConfig } from './settings-db';

export async function handleTelegramCopilotChat(chatId: string | number, userText: string): Promise<string> {
  const trimmed = (userText || '').trim();

  // 1. Standard Telegram Commands
  if (trimmed === '/start' || trimmed === '/help') {
    return `👋 <b>জি বস! আমি DigiPort AI Copilot 🚀</b>\n\nআমি সার্বক্ষণিক আপনার অ্যাড অ্যাকাউন্ট ও ক্যাম্পেইনগুলোর উপর নজর রাখছি। আপনি সরাসরি টেলিগ্রাম থেকেই যেকোনো ক্যাম্পেইন বিশ্লেষণ বা পরামর্শ নিতে পারেন!\n\n💡 <b>আপনি যা যা জিজ্ঞাসা করতে পারেন:</b>\n• <i>"আজকের ক্যাম্পেইনের কি অবস্থা?"</i>\n• <i>"কোন অ্যাডটা ভালো কনভার্শন দিচ্ছে?"</i>\n• <i>"বাজেট বাড়াবো নাকি কমাবো?"</i>\n• <i>"অডিট রিপোর্ট দাও"</i>\n\nআপনার যেকোনো নির্দেশ দিন বস! ⚡`;
  }

  // 2. Resolve credentials from database & environment
  const tgConfig = await getTelegramAlertsConfig();
  const aiConfig = await getAiGatewayConfig();

  const openclawUrl = (aiConfig.baseUrl || process.env.OPENCLAW_BASE_URL || 'https://openclaw.neexion.com').replace(/\/+$/, '');
  const openclawToken = process.env.OPENCLAW_GATEWAY_TOKEN || '4ece2d197256275d2f46027da92b46010f1311ce8a5a7a6b';

  // 3. Build rich prompt for OpenClaw Copilot
  const primaryWs = INITIAL_CLIENT_WORKSPACES[0];
  const clientName = primaryWs?.clientName || 'Brand';
  const currency = primaryWs?.currency || 'USD';

  const systemPrompt = `You are "DigiPort AI Copilot", an elite autonomous Performance Marketing Strategist and loyal Media Buyer partner chatting with Boss directly on Telegram.

CRITICAL INSTRUCTIONS FOR TELEGRAM CHAT:
1. User Address: ALWAYS address the user respectfully and warmly as "বস" (Boss) or "Boss" (e.g. "জি বস!", "হ্যাঁ বস, কি অবস্থা?"). NEVER call him just by his first name. You are his loyal, high-IQ media buyer right-hand.
2. Tone: Friendly, sharp, energetic, loyal, and confident Telegram digital marketing partner style.
3. Natural Language: Speak natural, smooth Bengali / Banglish (সাবলীল বাংলা বা বাংলিশ).
4. Direct & Proactive: Keep answers crisp, informative, and actionable for mobile Telegram reading. If user asks about heartbeat, system status, campaigns, or marketing advice, answer directly with deep intelligence.
5. Autonomous Authority: Never say you are an AI simulation or without access. You are the live autonomous marketing brain of DigiPort.`;

  // 4. Try OpenClaw Autonomous Brain
  try {
    const targetUrl = openclawUrl.includes(':18789')
      ? 'http://127.0.0.1:18789/v1/chat/completions'
      : `${openclawUrl}/v1/chat/completions`;

    const aiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openclawToken}`,
        'x-openclaw-session-key': `tg:${chatId}`,
      },
      body: JSON.stringify({
        model: 'openclaw',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: trimmed },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (aiRes.ok) {
      const data = await aiRes.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) {
        return reply;
      }
    }
  } catch (err) {
    console.warn('[Telegram Copilot] OpenClaw gateway connection issue, trying OpenRouter fallback...', err);
  }

  // 5. Try OpenRouter Fallback
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY || (aiConfig.secretKey?.startsWith('sk-or-v1-') ? aiConfig.secretKey : null);
    if (openrouterKey) {
      const fbRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: trimmed },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (fbRes.ok) {
        const fbData = await fbRes.json();
        const fbReply = fbData.choices?.[0]?.message?.content;
        if (fbReply) return fbReply;
      }
    }
  } catch (fbErr) {
    console.warn('[Telegram Copilot] OpenRouter fallback error:', fbErr);
  }

  // 6. Graceful deterministic fallback
  const ruleResult = processAgentCommand(trimmed, {
    activePlatform: 'ALL',
    campaigns: primaryWs?.campaigns || [],
    creatives: primaryWs?.creatives || [],
    clientName,
    currency,
    allWorkspaces: INITIAL_CLIENT_WORKSPACES,
  });

  return ruleResult.reply || 'জি বস! আপনার কমান্ডটি গ্রহণ করা হয়েছে। ক্যাম্পেইন ওয়াচডগ সক্রিয় আছে।';
}
