import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      messages = [], 
      clientContext = {}, 
      gatewaySettings = {} 
    } = body;

    const apiKey = gatewaySettings?.secretKey?.trim() || process.env.OPENROUTER_API_KEY || '';
    const rawBaseUrl = gatewaySettings?.baseUrl?.trim() || 'https://openrouter.ai/api/v1';
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const modelEngine = gatewaySettings?.modelEngine || 'deepseek/deepseek-chat';
    const persona = gatewaySettings?.persona || 'Senior Performance Marketing Strategist & Copywriter';

    // If no real API key is available, report clearly that OpenClaw is not configured
    if (!apiKey || apiKey.includes('sample') || apiKey.includes('998410294857')) {
      return NextResponse.json({
        success: false,
        error: 'NO_KEY',
        message: 'OpenClaw API Key কনফিগার করা নেই। লোকাল ইঞ্জিন ব্যবহার করা হচ্ছে।',
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
    if (baseUrl.includes(':18789') || baseUrl.includes('digiport.neexion.com')) {
      // Local or VPS Digi-Port OpenClaw Gateway
      targetEndpoint = `${baseUrl}/v1/chat/completions`;
    } else if (baseUrl.includes('openrouter.ai')) {
      targetEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
    } else {
      targetEndpoint = `${baseUrl}/chat/completions`;
    }

    // Map model names to OpenRouter supported IDs if needed
    let modelId = modelEngine;
    if (modelId === 'deepseek-v4-flash') {
      modelId = 'deepseek/deepseek-chat';
    }

    const aiRes = await fetch(targetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://digiport.neexion.com',
        'X-Title': 'DigiPort OpenClaw Copilot',
      },
      body: JSON.stringify({
        model: modelId,
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!aiRes.ok) {
      const errJson = await aiRes.json().catch(() => null);
      const errMsg = errJson?.error?.message || `AI Gateway HTTP error ${aiRes.status}`;
      return NextResponse.json({
        success: false,
        error: 'GATEWAY_ERROR',
        message: errMsg,
      });
    }

    const data = await aiRes.json();
    const reply = data.choices?.[0]?.message?.content || 'কোনো উত্তর পাওয়া যায়নি।';

    return NextResponse.json({
      success: true,
      reply,
      modelUsed: data.model || modelId,
      gateway: 'OpenClaw / OpenRouter (Live)',
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || 'AI সংযোগে সাময়িক সমস্যা হয়েছে',
    }, { status: 500 });
  }
}
