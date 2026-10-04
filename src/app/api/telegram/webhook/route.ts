import { NextRequest, NextResponse } from 'next/server';
import { processAgentCommand } from '@/lib/agent-runner';
import { INITIAL_CLIENT_WORKSPACES } from '@/lib/workspace-presets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

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

    // Default primary workspace for context
    const primaryWs = INITIAL_CLIENT_WORKSPACES[0];

    // Process via our unified AI agent runner (same brain used by Web Copilot)
    const aiResponse = processAgentCommand(userText, {
      activePlatform: 'ALL',
      campaigns: primaryWs?.campaigns || [],
      creatives: primaryWs?.creatives || [],
      clientName: primaryWs?.clientName || 'Main Brand Account',
      currency: primaryWs?.currency || 'BDT',
      allWorkspaces: INITIAL_CLIENT_WORKSPACES,
    });

    if (botToken) {
      // Build inline action buttons if AI proposed an action requiring approval
      const replyMarkup = aiResponse.requiresApproval && aiResponse.proposedAction ? {
        inline_keyboard: [
          [
            { text: '✅ Approve', callback_data: `approve_${aiResponse.proposedAction.id}` },
            { text: '❌ Reject', callback_data: `reject_${aiResponse.proposedAction.id}` },
          ]
        ]
      } : undefined;

      // Send response back to Telegram chat
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 <b>Digital Marketr AI Copilot:</b>\n\n${aiResponse.reply.replace(/\*\*/g, '')}`,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

