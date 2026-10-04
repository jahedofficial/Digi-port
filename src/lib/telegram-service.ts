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

  const botToken = customToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('[TELEGRAM] Token or Chat ID missing in .env.local');
    return {
      success: false,
      error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env.local',
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
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.description || 'Telegram API Error' };
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error connecting to Telegram',
    };
  }
}
