import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramCopilotChat } from '@/lib/telegram-copilot';
import { getTelegramAlertsConfig } from '@/lib/settings-db';

export async function GET(req: NextRequest) {
  try {
    const tgConfig = await getTelegramAlertsConfig();
    const botToken = tgConfig.botToken || process.env.TELEGRAM_BOT_TOKEN || '8202907344:AAGzue1FYgVe06zA4j6qxVLhEQ5IbZc2h8g';

    const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoData = await infoRes.json();

    const action = req.nextUrl.searchParams.get('action');
    if (action === 'set' || action === 'register') {
      const webhookUrl = 'https://digiport.neexion.com/api/telegram/webhook';
      const setRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      const setData = await setRes.json();
      return NextResponse.json({
        success: setData.ok,
        result: setData,
        webhookUrl,
      });
    }

    if (action === 'delete' || action === 'clear') {
      const delRes = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
      const delData = await delRes.json();
      return NextResponse.json({
        success: delData.ok,
        result: delData,
      });
    }

    return NextResponse.json({
      success: true,
      webhookInfo: infoData.result,
      botConfigured: Boolean(botToken),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tgConfig = await getTelegramAlertsConfig();
    const botToken = tgConfig.botToken || process.env.TELEGRAM_BOT_TOKEN || '8202907344:AAGzue1FYgVe06zA4j6qxVLhEQ5IbZc2h8g';

    // Handle Telegram Inline Keyboard Callbacks (e.g. Approve / Reject actions)
    if (body?.callback_query) {
      const cq = body.callback_query;
      const chatId = cq.message?.chat?.id;
      const data = cq.data as string; // e.g. "approve_act-123" or "reject_act-123"

      if (botToken && chatId) {
        const isApprove = data.startsWith('approve_');
        const feedbackText = isApprove
          ? '✅ <b>অ্যাকশন অনুমোদিত হয়েছে (Approved):</b> পরিবর্তনটি সরাসরি লাইভ প্ল্যাটফর্মে প্রয়োগ করা হচ্ছে।'
          : '❌ <b>অ্যাকশন বাতিল করা হয়েছে (Rejected):</b> কোনো পরিবর্তন করা হয়নি।';

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: feedbackText,
            parse_mode: 'HTML',
          }),
        });

        // Answer callback query to stop loading spinner in Telegram
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: cq.id }),
        });
      }

      return NextResponse.json({ ok: true });
    }

    // Telegram webhook payload has message: { chat: { id }, text }
    const message = body?.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const userText = message.text;

    // Process message through OpenClaw AI Copilot
    const copilotReply = await handleTelegramCopilotChat(chatId, userText);

    if (botToken) {
      // Send response back to Telegram chat with plain text fallback to prevent markdown entity errors
      const sendRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: copilotReply,
        }),
      });

      const sendData = await sendRes.json();
      if (!sendData.ok && sendData.description?.includes('parse')) {
        // Fallback retry
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: copilotReply.replace(/<[^>]*>?/gm, '').replace(/[*_`]/g, ''),
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

