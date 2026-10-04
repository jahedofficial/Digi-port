import { NextRequest, NextResponse } from 'next/server';
import { processAgentCommand } from '@/lib/agent-runner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Telegram webhook payload has message: { chat: { id }, text }
    const message = body?.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const userText = message.text;

    // Process via our AI agent runner
    const aiResponse = processAgentCommand(userText, {
      activePlatform: 'ALL',
      campaigns: [],
      creatives: [],
    });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      // Send response back to Telegram chat
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 <b>Digital Marketr AI Copilot:</b>\n\n${aiResponse.reply.replace(/\*\*/g, '')}`,
          parse_mode: 'HTML',
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
