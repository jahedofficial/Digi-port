const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment from .env.local if present
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.substring(0, idx).trim();
        let v = trimmed.substring(idx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  });
}

const botToken = process.env.TELEGRAM_BOT_TOKEN || '8202907344:AAGzue1FYgVe06zA4j6qxVLhEQ5IbZc2h8g';
const openclawUrl = (process.env.OPENCLAW_BASE_URL || 'https://openclaw.neexion.com').replace(/\/+$/, '');
const openclawToken = process.env.OPENCLAW_GATEWAY_TOKEN || '4ece2d197256275d2f46027da92b46010f1311ce8a5a7a6b';

console.log('🤖 [DigiPort Telegram Copilot Polling Service]');
console.log('Bot Token:', botToken.substring(0, 10) + '...');
console.log('OpenClaw URL:', openclawUrl);

let offset = 0;
let isPolling = true;

const systemPrompt = `You are "DigiPort AI Copilot", an elite autonomous Performance Marketing Strategist and personal Media Buyer partner chatting with Boss directly on Telegram.

CRITICAL INSTRUCTIONS FOR TELEGRAM CHAT:
1. User Address: ALWAYS address the user respectfully and warmly as "বস" (Boss) or "Boss" (e.g. "জি বস!", "হ্যাঁ বস, কি অবস্থা?"). NEVER call him just by his first name. You are his loyal, high-IQ media buyer right-hand.
2. Tone: Friendly, sharp, energetic, loyal, and confident Telegram digital marketing partner style.
3. Natural Language: Speak natural, smooth Bengali / Banglish (সাবলীল বাংলা বা বাংলিশ).
4. Direct & Proactive: Keep answers crisp, informative, and actionable for mobile Telegram reading. If user asks about heartbeat, system status, campaigns, or marketing advice, answer directly with deep intelligence.
5. Autonomous Authority: Never say you are an AI simulation or without access. You are the live autonomous marketing brain of DigiPort.`;

async function getAiReply(chatId, userText) {
  const trimmed = userText.trim();
  if (trimmed === '/start' || trimmed === '/help') {
    return `👋 <b>জি বস! আমি DigiPort AI Copilot 🚀</b>\n\nআমি সার্বক্ষণিক আপনার অ্যাড অ্যাকাউন্ট ও ক্যাম্পেইনগুলোর উপর নজর রাখছি। আপনি সরাসরি টেলিগ্রাম থেকেই যেকোনো ক্যাম্পেইন বিশ্লেষণ বা পরামর্শ নিতে পারেন!\n\n💡 <b>আপনি যা যা জিজ্ঞাসা করতে পারেন:</b>\n• <i>"আজকের ক্যাম্পেইনের কি অবস্থা?"</i>\n• <i>"কোন অ্যাডটা ভালো কনভার্শন দিচ্ছে?"</i>\n• <i>"বাজেট বাড়াবো নাকি কমাবো?"</i>\n• <i>"অডিট রিপোর্ট দাও"</i>\n\nআপনার যেকোনো নির্দেশ দিন বস! ⚡`;
  }

  try {
    const targetUrl = openclawUrl.includes(':18789')
      ? 'http://127.0.0.1:18789/v1/chat/completions'
      : `${openclawUrl}/v1/chat/completions`;

    const res = await fetch(targetUrl, {
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

    if (res.ok) {
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) return reply;
    }
  } catch (err) {
    console.warn('[Telegram Worker] OpenClaw error:', err.message);
  }

  return 'জি বস! আপনার মেসেজ পেয়েছি। ক্যাম্পেইন ও সিস্টেম স্ট্যাটাস সার্বক্ষণিক সক্রিয় আছে।';
}

async function sendTelegramMessage(chatId, text) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });
    const data = await res.json();
    return data.ok;
  } catch (err) {
    console.error('[Telegram Worker] Send failed:', err.message);
    return false;
  }
}

async function pollUpdates() {
  while (isPolling) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}&timeout=20`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          const msg = update.message;
          if (msg && msg.text) {
            const chatId = msg.chat.id;
            const fromUser = msg.from?.username || msg.from?.first_name || 'Boss';
            console.log(`📩 [Telegram Incoming] From: @${fromUser} (${chatId}): "${msg.text}"`);

            // Send "typing..." action
            fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
            }).catch(() => {});

            // Generate AI Copilot reply
            const reply = await getAiReply(chatId, msg.text);
            console.log(`📤 [Telegram Outgoing] Reply to @${fromUser}: "${reply.substring(0, 50)}..."`);

            await sendTelegramMessage(chatId, reply);
          }
        }
      }
    } catch (err) {
      console.warn('[Telegram Worker] Polling network warning:', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// Ensure webhook is cleared before starting long polling so getUpdates succeeds
fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`)
  .then(() => {
    console.log('✅ Telegram Webhook cleared for realtime polling mode');
    pollUpdates();
  })
  .catch(err => {
    console.warn('Webhook delete failed, attempting poll anyway:', err.message);
    pollUpdates();
  });
