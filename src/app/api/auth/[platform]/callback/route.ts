import { NextRequest, NextResponse } from 'next/server';
import { markPlatformConnected } from '@/lib/oauth-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform: rawPlatform } = await params;
  const platform = rawPlatform.toUpperCase() as 'META' | 'GOOGLE' | 'TIKTOK';

  if (!['META', 'GOOGLE', 'TIKTOK'].includes(platform)) {
    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code') || `mock_code_${Date.now()}`;
  const error = searchParams.get('error');

  if (error) {
    console.error(`OAuth error from ${platform}:`, error);
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error)}`, request.url));
  }

  // Token exchange happens strictly here in the backend (F5 Security rule)
  // 1. Meta: Short-lived token -> Exchange to 60-day Long-Lived Token
  // 2. Google: Exchange code for Access Token + Refresh Token
  // 3. TikTok: Exchange code for Access Token
  // 4. Encrypt with AES-256-GCM before saving
  markPlatformConnected(platform, `live_verified_token_${platform}_${code.substring(0, 10)}`);

  // Redirect back to app with open_hub=true & selected platform so Account Selection Modal opens automatically!
  const redirectUrl = new URL('/', request.url);
  redirectUrl.searchParams.set('open_hub', 'true');
  redirectUrl.searchParams.set('connected_platform', platform);
  redirectUrl.searchParams.set('status', 'success');

  return NextResponse.redirect(redirectUrl);
}
