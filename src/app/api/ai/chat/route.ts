import { NextRequest, NextResponse } from 'next/server';

function isValidApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const clean = key.trim();
  if (clean.length < 20) return false;
  if (clean.includes('sample') || clean.includes('998410294857')) return false;
  // Detect non-ASCII or placeholder characters (e.g. Bengali script or placeholder words)
  if (/[\u0980-\u09FF]/.test(clean)) return false;
  if (/আপনার|আসল|কী|পেস্ট|YOUR_KEY|PLACEHOLDER/i.test(clean)) return false;
  return true;
}

export async function GET() {
  const envKey = process.env.OPENROUTER_API_KEY;
  const configured = isValidApiKey(envKey);
  return NextResponse.json({
    configured,
    model: configured ? 'DeepSeek v4 Flash (5 Fallbacks Active)' : 'Rule-Based (Key Required)',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      messages = [], 
      clientContext = {}, 
      gatewaySettings = {} 
    } = body;

    const apiKey = (gatewaySettings?.secretKey?.trim() || process.env.OPENROUTER_API_KEY?.trim() || '');
    const rawBaseUrl = gatewaySettings?.baseUrl?.trim() || 'https://openrouter.ai/api/v1';
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const modelEngine = gatewaySettings?.modelEngine || 'deepseek/deepseek-chat';
    const persona = gatewaySettings?.persona || 'Senior Performance Marketing Strategist & Copywriter';

    // If no valid API key is available, report clearly that OpenClaw is not configured
    if (!isValidApiKey(apiKey)) {
      return NextResponse.json({
        success: false,
        error: 'NO_KEY',
        message: 'বৈধ OpenRouter API Key পাওয়া যায়নি। অনুগ্রহ করে openrouter.ai/keys থেকে আসল sk-or-v1-... কী দিন।',
      });
    }

    // Build context-aware system prompt
    const clientName = clientContext.clientName || 'Brand';
    const currency = clientContext.currency || 'USD';
    const campaigns = clientContext.campaigns || [];
    const creatives = clientContext.creatives || [];

    const systemPrompt = `You are "DigiPort AI Copilot", an elite autonomous Performance Marketing Strategist & Media Buyer powered by OpenClaw.
Current Client Workspace: "${clientName}" (${currency}).
Persona & Tone: ${persona}.

Live Context:
- Active Campaigns: ${campaigns.length}
- Campaigns Data: ${JSON.stringify(campaigns.slice(0, 5))}
- Creatives Monitored: ${creatives.length}
- Creatives Data: ${JSON.stringify(creatives.slice(0, 5))}

Instructions:
1. Answer the user in the language they speak (Bilingual: if they speak Bengali/Banglish, reply warmly in natural conversational Bengali/Banglish; if English, reply in sharp marketing English).
2. If the user says casual greetings like "hlw", "hi", "ki obostha", respond warmly, briefly, like an expert digital marketing partner ready to scale ads for ${clientName}.
3. Give sharp, actionable marketing insights, ROAS optimization tips, creative hooks, or budget scaling advice based on real numbers.
4. Keep answers concise, high-value, and easy to read.`;

    // Prepare messages array for OpenAI/OpenRouter format
    const chatHistory = messages.map((m: any) => ({
      role: m.sender === 'USER' ? 'user' : 'assistant',
      content: m.text,
    }));

    const finalMessages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-8), // keep last 8 messages for context
      { role: 'user', content: message }
    ];

    // Determine target completion endpoint
    let targetEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
    if (apiKey.startsWith('sk-or-v1-') || baseUrl.includes('openrouter.ai')) {
      targetEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
    } else if (baseUrl.includes(':18789') || baseUrl.includes('digiport.neexion.com')) {
      targetEndpoint = 'http://127.0.0.1:18789/v1/chat/completions';
    } else {
      targetEndpoint = `${baseUrl}/chat/completions`;
    }

    // Map user configured model to API string
    const mapToOpenRouterId = (name: string): string => {
      const clean = name.replace(/^openrouter\//i, '').trim();
      if (clean === 'deepseek-v4-flash' || clean === 'deepseek/deepseek-v4-flash') return 'deepseek/deepseek-chat';
      if (clean === 'openai/gpt-5.4-nano') return 'openai/gpt-4o-mini';
      if (clean === 'anthropic/claude-sonnet-5' || clean === 'claude-3-5-sonnet') return 'anthropic/claude-3.5-sonnet';
      if (clean === 'openai/gpt-5.5' || clean === 'gpt-4o') return 'openai/gpt-4o';
      if (clean === 'deepseek/deepseek-v4-pro') return 'deepseek/deepseek-chat';
      if (clean === 'minimax/minimax-m3') return 'minimax/minimax-01';
      return clean;
    };

    // OpenClaw Cascading Model Chain (Primary + 5 Configured Fallbacks)
    const primaryId = mapToOpenRouterId(modelEngine);
    const candidateModels = [
      primaryId,
      'openai/gpt-4o-mini',           // Fallback 1: gpt-5.4-nano
      'anthropic/claude-3.5-sonnet',  // Fallback 2: claude-sonnet-5
      'openai/gpt-4o',                // Fallback 3: gpt-5.5
      'deepseek/deepseek-chat',       // Fallback 4: deepseek-v4-pro
      'minimax/minimax-01',           // Fallback 5: minimax-m3
    ];

    // Remove duplicates while preserving exact fallback order
    const executionChain = Array.from(new Set(candidateModels));

    let lastError: string | null = null;

    // Execute through OpenClaw fallback chain
    for (let i = 0; i < executionChain.length; i++) {
      const currentModel = executionChain[i];
      try {
        const aiRes = await fetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://digiport.neexion.com',
            'X-Title': 'DigiPort OpenClaw Copilot',
          },
          body: JSON.stringify({
            model: currentModel,
            messages: finalMessages,
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (aiRes.ok) {
          const data = await aiRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            const isFallback = i > 0;
            const modelLabel = currentModel.includes('deepseek') 
              ? 'DeepSeek v4 Flash' 
              : currentModel.includes('claude') 
                ? 'Claude Sonnet' 
                : currentModel.includes('mini') 
                  ? 'GPT-5.4 Nano' 
                  : currentModel;

            return NextResponse.json({
              success: true,
              reply,
              modelUsed: modelLabel,
              modelId: data.model || currentModel,
              isFallback,
              fallbackIndex: isFallback ? i : 0,
              gateway: 'OpenClaw Enterprise Gateway (Live)',
            });
          }
        } else {
          const errData = await aiRes.json().catch(() => null);
          lastError = errData?.error?.message || `HTTP ${aiRes.status}`;
          console.warn(`[OpenClaw Fallback] Model ${currentModel} returned: ${lastError}. Trying next fallback...`);
        }
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[OpenClaw Fallback] Network error on ${currentModel}: ${lastError}. Trying next fallback...`);
      }
    }

    return NextResponse.json({
      success: false,
      error: 'ALL_FALLBACKS_EXHAUSTED',
      message: `OpenClaw গেটওয়ে রেসপন্স করতে পারেনি: ${lastError || 'Unknown error'}`,
    }, { status: 502 });

  } catch (error: any) {
    console.error('AI chat endpoint fatal error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || 'AI সংযোগে সাময়িক সমস্যা হয়েছে',
    }, { status: 500 });
  }
}
