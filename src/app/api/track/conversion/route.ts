import { NextRequest, NextResponse } from 'next/server';
import { dispatchAutoConversion, ConversionEventPayload } from '@/lib/conversion-tracker';

/**
 * POST /api/track/conversion
 * Central Auto-Conversion Ingestion Endpoint
 * 
 * Accepts conversion payload from Website, Shopify, WooCommerce, or Payment Webhooks
 * and broadcasts to Meta CAPI, Google Enhanced Conversions, and TikTok Events API.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.eventName || !body.eventId) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: eventName and eventId are mandatory for deduplication.' 
        }, 
        { status: 400 }
      );
    }

    const payload: ConversionEventPayload = {
      eventName: body.eventName,
      eventId: String(body.eventId),
      currency: body.currency || 'BDT',
      value: typeof body.value === 'number' ? body.value : parseFloat(body.value || '0'),
      eventSourceUrl: body.eventSourceUrl || request.headers.get('referer') || undefined,
      userData: {
        email: body.userData?.email,
        phone: body.userData?.phone,
        firstName: body.userData?.firstName,
        lastName: body.userData?.lastName,
        city: body.userData?.city,
        clientIpAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || body.userData?.clientIpAddress,
        clientUserAgent: request.headers.get('user-agent') || body.userData?.clientUserAgent,
        fbp: body.userData?.fbp,
        fbc: body.userData?.fbc,
        gclid: body.userData?.gclid,
        ttclid: body.userData?.ttclid,
      },
      customData: body.customData || {
        orderId: String(body.eventId),
        contents: body.items,
        numItems: body.items?.length || 1,
      },
    };

    const dispatchResponse = await dispatchAutoConversion(payload);

    return NextResponse.json({
      ...dispatchResponse,
      message: `Event '${payload.eventName}' successfully tracked and dispatched to Meta CAPI, Google, & TikTok.`,
    });
  } catch (error: any) {
    console.error('Error handling conversion tracking:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process auto conversion event', 
        details: error?.message 
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/track/conversion
 * Health check & diagnostic status for the auto-conversion engine
 */
export async function GET() {
  return NextResponse.json({
    status: 'ACTIVE',
    engine: 'Digital Marketr Server-Side Auto Conversion Pipeline',
    supportedPlatforms: ['META_CONVERSIONS_API', 'GOOGLE_ENHANCED_CONVERSIONS', 'TIKTOK_EVENTS_API'],
    features: {
      deduplicationWithBrowserPixel: true,
      sha256IdentifierHashing: true,
      bangladeshPhoneNormalization: true,
      offlineConversionSync: true,
    },
    documentation: {
      method: 'POST',
      samplePayload: {
        eventName: 'Purchase',
        eventId: 'ORDER-10948',
        currency: 'BDT',
        value: 2950,
        userData: {
          email: 'customer@gmail.com',
          phone: '+8801712345678',
          fbp: 'fb.1.1689234.12345',
          fbc: 'fb.1.1689234.AbCdEf123',
          gclid: 'Cj0KCQj...xyz'
        },
        items: [
          { id: 'item-1', name: 'Eid Lawn 3-Piece', quantity: 1, item_price: 2950 }
        ]
      }
    }
  });
}
