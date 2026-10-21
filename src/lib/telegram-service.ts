import { getTelegramAlertsConfig } from './settings-db';

export interface TelegramAlertPayload {
  title: string;
  message: string;
  platform?: string;
  metrics?: Record<string, string | number>;
  actionUrl?: string;
  botToken?: string;
  chatId?: string;
}

export async function sendTelegramNotification(payload: TelegramAlertPayload | string): Promise<{ success: boolean; error?: string }> {
  let customToken: string | undefined;
  let customChatId: string | undefined;

  if (typeof payload !== 'string') {
    customToken = payload.botToken;
    customChatId = payload.chatId;
  }

  const dbConfig = await getTelegramAlertsConfig();
  const botToken = customToken || dbConfig.botToken || process.env.TELEGRAM_BOT_TOKEN || '8202907344:AAGzue1FYgVe06zA4j6qxVLhEQ5IbZc2h8g';
  const chatId = customChatId || dbConfig.chatId || process.env.TELEGRAM_CHAT_ID || '6540687043';

  if (!botToken || !chatId) {
    console.log('[TELEGRAM] Token or Chat ID missing in database or .env.local');
    return {
      success: false,
      error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in database or .env.local',
    };
  }

  let formattedText = '';
  if (typeof payload === 'string') {
    formattedText = payload;
  } else {
    formattedText = `🚀 <b>${payload.title}</b>\n\n${payload.message}`;
    if (payload.metrics) {
      formattedText += `\n\n📊 <b>Live Performance:</b>\n`;
      for (const [key, val] of Object.entries(payload.metrics)) {
        formattedText += `• <b>${key}:</b> ${val}\n`;
      }
    }
    formattedText += `\n⚡ <i>Digital Marketr Autonomous AI Watchdog</i>`;
    if (payload.actionUrl) {
      formattedText += `\n🔗 <a href="${payload.actionUrl}">Open Command Center</a>`;
    }
  }

  try {
    let res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    let data = await res.json();
    if (data.ok) {
      return { success: true };
    }

    // If HTML parsing failed due to tags, retry as plain text
    if (data.description?.includes('can\'t parse entities')) {
      const plainRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: formattedText.replace(/<[^>]*>?/gm, ''),
          disable_web_page_preview: true,
        }),
      });
      const plainData = await plainRes.json();
      if (plainData.ok) {
        return { success: true };
      }
      return { success: false, error: plainData.description || 'Telegram API Error' };
    }

    return { success: false, error: data.description || 'Telegram API Error' };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error connecting to Telegram',
    };
  }
}
