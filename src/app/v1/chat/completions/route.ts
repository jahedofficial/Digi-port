import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Title, HTTP-Referer',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const body = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: { message: 'Missing Authorization header with API key' } },
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Proxy to OpenRouter upstream
    const upstreamRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'HTTP-Referer': 'https://digiport.neexion.com',
        'X-Title': 'DigiPort OpenClaw Gateway',
      },
      body: JSON.stringify(body),
    });

    const data = await upstreamRes.json();
    return NextResponse.json(data, {
      status: upstreamRes.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Failed to process chat completion' } },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
