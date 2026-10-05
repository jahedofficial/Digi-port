import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram-service';

export async function GET() {
  const hasToken = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const hasChatId = Boolean(process.env.TELEGRAM_CHAT_ID);
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  const chatId = process.env.TELEGRAM_CHAT_ID || '';
  
  return NextResponse.json({
    configured: hasToken && hasChatId,
    hasToken,
    hasChatId,
    chatId: chatId,
    botTokenMasked: hasToken && token.length > 10 ? `${token.slice(0, 10)}•••••••••••••` : '',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, metrics, botToken, chatId } = body;

    const result = await sendTelegramNotification({
      title: title || 'Digital Marketr AI Alert',
      message: message || 'Your ad campaigns are running smoothly.',
      metrics: metrics || {
        'Total Spend': '৳14,200',
        'Orders': '42 orders',
        'Blended ROAS': '4.85x',
        'Status': 'Healthy',
      },
      botToken,
      chatId,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error',
    }, { status: 500 });
  }
}
