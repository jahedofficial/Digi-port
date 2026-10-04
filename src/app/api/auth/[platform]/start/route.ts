import { NextRequest, NextResponse } from 'next/server';
import { generateOAuthStartUrl } from '@/lib/oauth-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform: rawPlatform } = await params;
  const platform = rawPlatform.toUpperCase() as 'META' | 'GOOGLE' | 'TIKTOK';

  if (!['META', 'GOOGLE', 'TIKTOK'].includes(platform)) {
    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  }

  const host = request.headers.get('host') || 'localhost:3005';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  const authUrl = generateOAuthStartUrl(platform, baseUrl);

  // If request accepts JSON or has query ?json=true, return URL
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.get('json') === 'true') {
    return NextResponse.json({
      platform,
      authUrl,
      instructions: `Redirect user to authUrl to grant permissions. Tokens will be retrieved strictly on backend.`,
    });
  }

  // Redirect to platform OAuth login
  return NextResponse.redirect(authUrl);
}
