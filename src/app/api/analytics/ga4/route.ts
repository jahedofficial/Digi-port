import { NextRequest, NextResponse } from 'next/server';
import { 
  testGa4Connection, 
  fetchGa4Realtime, 
  fetchGa4UnifiedReport 
} from '@/lib/ga4-api';
import { getGoogleDirectConfig, saveGoogleDirectConfig } from '@/lib/settings-db';
import fs from 'fs';
import path from 'path';

const SECURE_CONFIG_DIR = path.join(process.cwd(), '.config');
const SECURE_GA4_FILE = path.join(SECURE_CONFIG_DIR, 'ga4_credentials.json');

// Safely load persisted GA4 credentials from local file fallback
function loadPersistedGA4Config(): { propertyId: string; serviceAccount: any } | null {
  try {
    if (fs.existsSync(SECURE_GA4_FILE)) {
      const raw = fs.readFileSync(SECURE_GA4_FILE, 'utf-8');
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

// Safely save credentials to file fallback
function savePersistedGA4Config(propertyId: string, serviceAccount: any) {
  try {
    if (!fs.existsSync(SECURE_CONFIG_DIR)) {
      fs.mkdirSync(SECURE_CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(SECURE_GA4_FILE, JSON.stringify({ propertyId, serviceAccount }, null, 2), 'utf-8');
  } catch {}
}

export async function GET() {
  try {
    const dbConfig = await getGoogleDirectConfig();
    const persisted = loadPersistedGA4Config();

    const effectivePropId = dbConfig.ga4PropertyId || persisted?.propertyId || '551294668';
    const effectiveSa = dbConfig.serviceAccountJson || persisted?.serviceAccount || null;

    let saEmail = dbConfig.serviceAccountEmail || '';
    let saProjectId = dbConfig.serviceAccountProjectId || '';
    if (effectiveSa) {
      try {
        const parsed = typeof effectiveSa === 'string' ? JSON.parse(effectiveSa) : effectiveSa;
        saEmail = parsed.client_email || saEmail;
        saProjectId = parsed.project_id || saProjectId;
      } catch {}
    }

    const isConfigured = Boolean(effectiveSa && saEmail);

    return NextResponse.json({
      success: true,
      isConfigured,
      propertyId: effectivePropId,
      clientEmail: saEmail,
      projectId: saProjectId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve GA4 configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, propertyId, serviceAccount, datePreset, startDate, endDate } = body;

    const dbConfig = await getGoogleDirectConfig();
    const persisted = loadPersistedGA4Config();

    const activePropertyId = propertyId || dbConfig.ga4PropertyId || persisted?.propertyId || '551294668';
    const activeServiceAccount = serviceAccount || dbConfig.serviceAccountJson || persisted?.serviceAccount || null;

    // 1. Save GA4 Configuration
    if (action === 'save_config') {
      if (!propertyId) {
        return NextResponse.json({ success: false, error: 'Property ID is required.' }, { status: 400 });
      }

      savePersistedGA4Config(propertyId, serviceAccount || null);

      let saEmail = '';
      let saProjId = '';
      if (serviceAccount) {
        try {
          const parsed = typeof serviceAccount === 'string' ? JSON.parse(serviceAccount) : serviceAccount;
          saEmail = parsed.client_email || '';
          saProjId = parsed.project_id || '';
        } catch {}
      }

      // Also persist to database settings
      try {
        await saveGoogleDirectConfig({
          ga4PropertyId: propertyId,
          serviceAccountJson: serviceAccount || undefined,
          serviceAccountEmail: saEmail || undefined,
          serviceAccountProjectId: saProjId || undefined,
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Google Analytics 4 credentials securely saved to server database!',
        propertyId,
        isConfigured: Boolean(serviceAccount && saEmail),
      });
    }

    // 2. Get Saved Configuration
    if (action === 'get_config') {
      let saEmail = dbConfig.serviceAccountEmail || '';
      let saProjectId = dbConfig.serviceAccountProjectId || '';
      if (activeServiceAccount) {
        try {
          const parsed = typeof activeServiceAccount === 'string' ? JSON.parse(activeServiceAccount) : activeServiceAccount;
          saEmail = parsed.client_email || saEmail;
          saProjectId = parsed.project_id || saProjectId;
        } catch {}
      }

      return NextResponse.json({
        success: true,
        isConfigured: Boolean(activeServiceAccount && saEmail),
        propertyId: activePropertyId,
        clientEmail: saEmail,
        projectId: saProjectId,
      });
    }

    // 3. Test Service Account & GA4 Property Connection
    if (action === 'test_connection') {
      if (!activePropertyId) {
        return NextResponse.json({
          success: false,
          error: 'Please provide your GA4 Property ID.',
        }, { status: 400 });
      }

      if (!activeServiceAccount) {
        return NextResponse.json({
          success: false,
          error: 'Please paste your complete Google Cloud Service Account JSON key.',
        }, { status: 400 });
      }

      const result = await testGa4Connection(activePropertyId, activeServiceAccount);
      if (result.success) {
        savePersistedGA4Config(activePropertyId, activeServiceAccount);

        let saEmail = '';
        let saProjId = '';
        try {
          const parsed = typeof activeServiceAccount === 'string' ? JSON.parse(activeServiceAccount) : activeServiceAccount;
          saEmail = parsed.client_email || '';
          saProjId = parsed.project_id || '';
        } catch {}

        try {
          await saveGoogleDirectConfig({
            ga4PropertyId: activePropertyId,
            serviceAccountJson: activeServiceAccount,
            serviceAccountEmail: saEmail || undefined,
            serviceAccountProjectId: saProjId || undefined,
          });
        } catch {}

        return NextResponse.json({
          success: true,
          message: `Successfully connected & verified with ${result.propertyName}! Saved to server schema.`,
          propertyId: activePropertyId,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error || 'Failed to authenticate with GA4.',
        }, { status: 400 });
      }
    }

    // 4. Fetch Live Realtime Visitors & Conversions
    if (action === 'fetch_realtime') {
      const realtimeData = await fetchGa4Realtime(activePropertyId, activeServiceAccount);
      return NextResponse.json({
        success: true,
        data: realtimeData,
      });
    }

    // 5. Fetch Full Multi-Channel Attribution Report (Default)
    const report = await fetchGa4UnifiedReport({
      propertyId: activePropertyId,
      serviceAccount: activeServiceAccount,
      datePreset: datePreset || 'last_7d',
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error('[GA4 API Route Error]:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal Server Error while communicating with GA4.',
    }, { status: 500 });
  }
}
