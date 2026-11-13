import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'Creative';
  const type = (searchParams.get('type') || 'IMAGE').toUpperCase();

  // If no target url or it's empty, return branded SVG directly
  if (!targetUrl || targetUrl === 'undefined' || targetUrl === 'null' || !targetUrl.startsWith('http')) {
    return generateFallbackSvgResponse(title, type);
  }

  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return generateFallbackSvgResponse(title, type);
    }

    // Fetch image from upstream (Facebook CDN, Cloudflare, etc.) without sending client referer
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
      },
      // Cache for 10 minutes in Next.js fetch cache
      next: { revalidate: 600 },
    });

    if (!upstreamRes.ok) {
      console.warn(`[media-proxy] Upstream returned status ${upstreamRes.status} for ${targetUrl.slice(0, 60)}...`);
      return generateFallbackSvgResponse(title, type);
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await upstreamRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.warn('[media-proxy] Fetch error:', err?.message || err);
    return generateFallbackSvgResponse(title, type);
  }
}

function generateFallbackSvgResponse(title: string, type: string) {
  const cleanTitle = (title || 'Ad Creative')
    .replace(/[<>&"]/g, '')
    .trim()
    .slice(0, 20);

  const isVideo = type.includes('VIDEO');
  const isCarousel = type.includes('CAROUSEL');

  // Gradient themes based on ad format
  const gradStart = isVideo ? '#7c3aed' : isCarousel ? '#2563eb' : '#059669';
  const gradEnd = isVideo ? '#ec4899' : isCarousel ? '#06b6d4' : '#10b981';
  const typeLabel = isVideo ? 'VIDEO AD' : isCarousel ? 'CAROUSEL' : 'IMAGE AD';

  // Icon definition
  const iconPath = isVideo
    ? `<polygon points="90,75 125,95 90,115" fill="#ffffff" />`
    : isCarousel
    ? `<rect x="70" y="75" width="35" height="40" rx="4" fill="#ffffff" opacity="0.9" />
       <rect x="95" y="80" width="35" height="40" rx="4" fill="#ffffff" opacity="0.6" />`
    : `<rect x="75" y="75" width="50" height="40" rx="4" fill="none" stroke="#ffffff" stroke-width="4" />
       <circle cx="88" cy="88" r="5" fill="#ffffff" />
       <path d="M78 110 L92 96 L104 106 L114 94 L122 108" fill="none" stroke="#ffffff" stroke-width="3" />`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="adGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradStart}" />
        <stop offset="100%" stop-color="${gradEnd}" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="16" fill="url(#adGrad)" />
    <circle cx="100" cy="95" r="38" fill="rgba(255, 255, 255, 0.15)" />
    ${iconPath}
    <text x="100" y="152" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700">${cleanTitle}</text>
    <rect x="65" y="162" width="70" height="18" rx="9" fill="rgba(0, 0, 0, 0.35)" />
    <text x="100" y="174" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="0.5">${typeLabel}</text>
  </svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
