import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllConnectionsDetails, 
  toggleAccountSelection, 
  disconnectPlatform,
  markPlatformConnected 
} from '@/lib/oauth-service';

export async function GET() {
  const connections = getAllConnectionsDetails();
  return NextResponse.json({
    success: true,
    connections,
    securityNotice: 'Protected by AES-256-GCM. Tokens are strictly encapsulated on backend and never exposed to the client.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, platform, accountId, isSelected } = body;

    if (action === 'TOGGLE_ACCOUNT' && platform && accountId !== undefined) {
      toggleAccountSelection(platform, accountId, isSelected);
      return NextResponse.json({
        success: true,
        message: `Account ${accountId} ${isSelected ? 'selected for sync' : 'deselected'}.`,
        connections: getAllConnectionsDetails(),
      });
    }

    if (action === 'SIMULATE_CONNECT' && platform) {
      markPlatformConnected(platform, `simulated_token_${platform}_${Date.now()}`);
      return NextResponse.json({
        success: true,
        message: `Successfully connected ${platform}!`,
        connections: getAllConnectionsDetails(),
      });
    }

    return NextResponse.json({ error: 'Invalid action or parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error handling connection action:', error);
    return NextResponse.json({ error: 'Server processing failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform')?.toUpperCase() as 'META' | 'GOOGLE' | 'TIKTOK';

    if (!platform || !['META', 'GOOGLE', 'TIKTOK'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform parameter' }, { status: 400 });
    }

    disconnectPlatform(platform);
    return NextResponse.json({
      success: true,
      message: `Disconnected ${platform}. Token removed securely.`,
      connections: getAllConnectionsDetails(),
    });
  } catch (error) {
    console.error('Error disconnecting platform:', error);
    return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 });
  }
}
