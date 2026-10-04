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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // If a valid OpenRouter or OpenClaw key is passed, verify with upstream OpenRouter
    if (token && (token.startsWith('sk-or-v1-') || token.length > 20)) {
      try {
        const upstreamRes = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'HTTP-Referer': 'https://digiport.neexion.com',
            'X-Title': 'DigiPort OpenClaw Gateway',
          },
        });

        if (upstreamRes.ok) {
          const upstreamData = await upstreamRes.json();
          return NextResponse.json(upstreamData, {
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      } catch (e) {
        // Fallback to static model list if upstream has transient network issue
      }
    }

    // Default OpenAI-compatible model listing for OpenClaw Gateway
    return NextResponse.json(
      {
        object: 'list',
        data: [
          {
            id: 'deepseek/deepseek-chat',
            object: 'model',
            created: 1700000000,
            owned_by: 'deepseek',
            permission: [],
            root: 'deepseek/deepseek-chat',
            parent: null,
          },
          {
            id: 'deepseek-v4-flash',
            object: 'model',
            created: 1700000000,
            owned_by: 'openclaw',
            permission: [],
            root: 'deepseek-v4-flash',
            parent: null,
          },
          {
            id: 'anthropic/claude-3.5-sonnet',
            object: 'model',
            created: 1700000000,
            owned_by: 'anthropic',
            permission: [],
            root: 'anthropic/claude-3.5-sonnet',
            parent: null,
          },
          {
            id: 'openai/gpt-4o',
            object: 'model',
            created: 1700000000,
            owned_by: 'openai',
            permission: [],
            root: 'openai/gpt-4o',
            parent: null,
          },
        ],
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Failed to list models' } },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
