import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { encryptToken, decryptToken } from './encryption';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'system_settings.enc.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readLocalEncryptedFile(): Record<string, any> {
  try {
    ensureDataDir();
    if (!fs.existsSync(SETTINGS_FILE)) return {};
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('[SETTINGS_DB] Failed to read fallback file:', err);
    return {};
  }
}

function writeLocalEncryptedFile(data: Record<string, any>) {
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[SETTINGS_DB] Failed to write fallback file:', err);
  }
}

// Safe dynamic delegate for systemSetting to prevent IDE TypeScript cache desync
const db = prisma as any;

/**
 * Universal System Setting getter with Prisma DB + Persistent AES-256 File Store + Env Fallback
 */
export async function getSystemSetting<T = any>(key: string): Promise<T | null> {
  // 1. Try Prisma Database
  try {
    if (db.systemSetting) {
      const record = await db.systemSetting.findUnique({
        where: { key },
      });
      if (record && record.valueJson) {
        return record.valueJson as T;
      }
    }
  } catch (dbErr) {
    // If Prisma connection fails (e.g. database offline or credentials unconfigured), gracefully use file store
  }

  // 2. Try Local Encrypted File Store
  const fileData = readLocalEncryptedFile();
  if (fileData[key]) {
    return fileData[key] as T;
  }

  return null;
}

/**
 * Universal System Setting saver with dual DB write + encrypted persistent backup
 */
export async function saveSystemSetting<T = any>(
  key: string,
  value: T,
  isEncrypted: boolean = false
): Promise<{ success: boolean; source: 'prisma' | 'file'; error?: string }> {
  let savedToPrisma = false;

  // 1. Attempt Prisma DB Save
  try {
    if (db.systemSetting) {
      await db.systemSetting.upsert({
        where: { key },
        update: {
          valueJson: value as any,
          isEncrypted,
        },
        create: {
          key,
          valueJson: value as any,
          isEncrypted,
        },
      });
      savedToPrisma = true;
    }
  } catch (dbErr: any) {
    // Graceful fallback if database service is not yet migrated/connected
  }

  // 2. Write to local encrypted file store to ensure zero data loss
  const currentData = readLocalEncryptedFile();
  currentData[key] = value;
  writeLocalEncryptedFile(currentData);

  return {
    success: true,
    source: savedToPrisma ? 'prisma' : 'file',
  };
}

export interface StoredAiGatewaySettings {
  baseUrl: string;
  secretKey: string; // Decrypted when returned by getter, encrypted in storage
  modelEngine: string;
  persona: string;
  isConfigured: boolean;
  savedAt?: string;
  source?: 'database' | 'env' | 'none';
}

export async function getAiGatewayConfig(): Promise<StoredAiGatewaySettings> {
  const dbData = await getSystemSetting<{
    baseUrl?: string;
    encryptedKey?: string;
    modelEngine?: string;
    persona?: string;
    isConfigured?: boolean;
    savedAt?: string;
  }>('AI_GATEWAY');

  if (dbData && dbData.encryptedKey) {
    const plainKey = decryptToken(dbData.encryptedKey);
    if (plainKey && plainKey.length > 10) {
      return {
        baseUrl: dbData.baseUrl || 'https://openrouter.ai/api/v1',
        secretKey: plainKey,
        modelEngine: dbData.modelEngine || 'deepseek-v4-flash',
        persona: dbData.persona || 'Senior Performance Marketing Strategist & Copywriter',
        isConfigured: true,
        savedAt: dbData.savedAt,
        source: 'database',
      };
    }
  }

  // Fallback to process.env.OPENROUTER_API_KEY
  const envKey = process.env.OPENROUTER_API_KEY?.trim() || '';
  if (envKey && envKey.length > 15) {
    return {
      baseUrl: 'https://openrouter.ai/api/v1',
      secretKey: envKey,
      modelEngine: 'deepseek-v4-flash',
      persona: 'Senior Performance Marketing Strategist & Copywriter',
      isConfigured: true,
      source: 'env',
    };
  }

  return {
    baseUrl: 'https://openrouter.ai/api/v1',
    secretKey: '',
    modelEngine: 'deepseek-v4-flash',
    persona: 'Senior Performance Marketing Strategist & Copywriter',
    isConfigured: false,
    source: 'none',
  };
}

export async function saveAiGatewayConfig(settings: {
  baseUrl: string;
  secretKey: string;
  modelEngine: string;
  persona?: string;
}) {
  const encryptedKey = encryptToken(settings.secretKey);
  const payload = {
    baseUrl: settings.baseUrl,
    encryptedKey,
    modelEngine: settings.modelEngine,
    persona: settings.persona || 'Senior Performance Marketing Strategist & Copywriter',
    isConfigured: true,
    savedAt: new Date().toISOString(),
  };

  return await saveSystemSetting('AI_GATEWAY', payload, true);
}

export interface StoredTelegramSettings {
  botToken: string; // Decrypted when returned by getter
  chatId: string;
  whatsappNumber?: string;
  alertOnRoasDrop?: boolean;
  alertDailySummary?: boolean;
  isConfigured: boolean;
  savedAt?: string;
  source?: 'database' | 'env' | 'none';
}

export async function getTelegramAlertsConfig(): Promise<StoredTelegramSettings> {
  const dbData = await getSystemSetting<{
    encryptedToken?: string;
    chatId?: string;
    whatsappNumber?: string;
    alertOnRoasDrop?: boolean;
    alertDailySummary?: boolean;
    isConfigured?: boolean;
    savedAt?: string;
  }>('TELEGRAM_ALERTS');

  if (dbData && (dbData.encryptedToken || dbData.chatId)) {
    const plainToken = dbData.encryptedToken ? decryptToken(dbData.encryptedToken) : '';
    if (plainToken || dbData.chatId) {
      return {
        botToken: plainToken,
        chatId: dbData.chatId || '',
        whatsappNumber: dbData.whatsappNumber || '',
        alertOnRoasDrop: dbData.alertOnRoasDrop !== false,
        alertDailySummary: dbData.alertDailySummary !== false,
        isConfigured: Boolean(plainToken && dbData.chatId),
        savedAt: dbData.savedAt,
        source: 'database',
      };
    }
  }

  // Fallback to process.env.TELEGRAM_BOT_TOKEN
  const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  const envChatId = process.env.TELEGRAM_CHAT_ID?.trim() || '';

  if (envToken || envChatId) {
    return {
      botToken: envToken,
      chatId: envChatId,
      whatsappNumber: '',
      alertOnRoasDrop: true,
      alertDailySummary: true,
      isConfigured: Boolean(envToken && envChatId),
      source: 'env',
    };
  }

  return {
    botToken: '',
    chatId: '',
    whatsappNumber: '',
    alertOnRoasDrop: true,
    alertDailySummary: true,
    isConfigured: false,
    source: 'none',
  };
}

export async function saveTelegramAlertsConfig(settings: {
  botToken?: string;
  chatId?: string;
  whatsappNumber?: string;
  alertOnRoasDrop?: boolean;
  alertDailySummary?: boolean;
}) {
  // If botToken is not provided or masked, keep the existing one
  let tokenToEncrypt = settings.botToken?.trim() || '';
  if (!tokenToEncrypt || tokenToEncrypt.includes('•')) {
    const existing = await getTelegramAlertsConfig();
    tokenToEncrypt = existing.botToken;
  }

  const encryptedToken = tokenToEncrypt ? encryptToken(tokenToEncrypt) : '';
  const payload = {
    encryptedToken,
    chatId: settings.chatId?.trim() || '',
    whatsappNumber: settings.whatsappNumber?.trim() || '',
    alertOnRoasDrop: settings.alertOnRoasDrop !== false,
    alertDailySummary: settings.alertDailySummary !== false,
    isConfigured: Boolean(tokenToEncrypt && settings.chatId?.trim()),
    savedAt: new Date().toISOString(),
  };

  return await saveSystemSetting('TELEGRAM_ALERTS', payload, true);
}

export async function deleteSystemSetting(key: string): Promise<{ success: boolean }> {
  try {
    if (db.systemSetting) {
      await db.systemSetting.delete({
        where: { key },
      });
    }
  } catch {}

  const currentData = readLocalEncryptedFile();
  if (currentData[key]) {
    delete currentData[key];
    writeLocalEncryptedFile(currentData);
  }

  return { success: true };
}

export async function deleteAiGatewayConfig(): Promise<{ success: boolean }> {
  return await deleteSystemSetting('AI_GATEWAY');
}

export async function deleteTelegramAlertsConfig(): Promise<{ success: boolean }> {
  return await deleteSystemSetting('TELEGRAM_ALERTS');
}

// ==========================================
// 1. META DIRECT SYSTEM USER TOKEN & APP CREDENTIALS
// ==========================================
export interface StoredMetaDirectSettings {
  token: string;
  adAccountId: string;
  appId?: string;
  appSecret?: string;
  scope?: 'READ_ONLY' | 'READ_WRITE';
  isConnected: boolean;
  savedAt?: string;
  source?: 'database' | 'env' | 'none';
}

export async function getMetaDirectConfig(): Promise<StoredMetaDirectSettings> {
  const dbData = await getSystemSetting<{
    encryptedToken?: string;
    adAccountId?: string;
    appId?: string;
    encryptedAppSecret?: string;
    scope?: 'READ_ONLY' | 'READ_WRITE';
    isConnected?: boolean;
    savedAt?: string;
  }>('META_DIRECT');

  if (dbData && (dbData.encryptedToken || dbData.adAccountId)) {
    const plainToken = dbData.encryptedToken ? decryptToken(dbData.encryptedToken) : '';
    const plainSecret = dbData.encryptedAppSecret ? decryptToken(dbData.encryptedAppSecret) : '';
    return {
      token: plainToken,
      adAccountId: dbData.adAccountId || '',
      appId: dbData.appId || process.env.META_APP_ID || '',
      appSecret: plainSecret || process.env.META_APP_SECRET || '',
      scope: dbData.scope || 'READ_WRITE',
      isConnected: Boolean(dbData.isConnected && plainToken),
      savedAt: dbData.savedAt,
      source: 'database',
    };
  }

  const envAppId = process.env.META_APP_ID || '';
  const envAppSecret = process.env.META_APP_SECRET || '';
  if (envAppId || envAppSecret) {
    return {
      token: '',
      adAccountId: '',
      appId: envAppId,
      appSecret: envAppSecret,
      scope: 'READ_WRITE',
      isConnected: false,
      source: 'env',
    };
  }

  return {
    token: '',
    adAccountId: '',
    appId: '',
    appSecret: '',
    scope: 'READ_WRITE',
    isConnected: false,
    source: 'none',
  };
}

export async function saveMetaDirectConfig(settings: {
  token?: string;
  adAccountId?: string;
  appId?: string;
  appSecret?: string;
  scope?: 'READ_ONLY' | 'READ_WRITE';
  isConnected?: boolean;
}) {
  let tokenToEncrypt = settings.token?.trim() || '';
  if (!tokenToEncrypt || tokenToEncrypt.includes('•')) {
    const existing = await getMetaDirectConfig();
    tokenToEncrypt = existing.token;
  }
  let secretToEncrypt = settings.appSecret?.trim() || '';
  if (!secretToEncrypt || secretToEncrypt.includes('•')) {
    const existing = await getMetaDirectConfig();
    secretToEncrypt = existing.appSecret || '';
  }

  const payload = {
    encryptedToken: tokenToEncrypt ? encryptToken(tokenToEncrypt) : '',
    adAccountId: (settings.adAccountId || '').replace(/^act_?/i, ''),
    appId: settings.appId?.trim() || '',
    encryptedAppSecret: secretToEncrypt ? encryptToken(secretToEncrypt) : '',
    scope: settings.scope || 'READ_WRITE',
    isConnected: settings.isConnected !== false && Boolean(tokenToEncrypt),
    savedAt: new Date().toISOString(),
  };

  return await saveSystemSetting('META_DIRECT', payload, true);
}

export async function deleteMetaDirectConfig(): Promise<{ success: boolean }> {
  return await deleteSystemSetting('META_DIRECT');
}

// ==========================================
// ==========================================
// 2. GOOGLE ADS & GA4 DIRECT CREDENTIALS
// ==========================================
export interface StoredGoogleDirectSettings {
  customerId: string;
  developerToken: string;
  clientId: string;
  clientSecret: string;
  ga4PropertyId: string;
  scope?: 'READ_ONLY' | 'READ_WRITE';
  isConnected: boolean;
  isGa4Connected: boolean;
  serviceAccountJson?: string;
  serviceAccountEmail?: string;
  serviceAccountProjectId?: string;
  hasServiceAccount?: boolean;
  savedAt?: string;
  source?: 'database' | 'env' | 'file' | 'none';
}

function getFilesystemServiceAccount(): { json: string; email: string; projectId: string } {
  try {
    const credPath = path.join(process.cwd(), 'credentials', 'google-service-account.json');
    if (fs.existsSync(credPath)) {
      const raw = fs.readFileSync(credPath, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        return {
          json: raw,
          email: parsed.client_email || '',
          projectId: parsed.project_id || '',
        };
      }
    }
  } catch {}

  const envJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '';
  if (envJson.trim()) {
    try {
      const parsed = JSON.parse(envJson);
      return {
        json: envJson,
        email: parsed.client_email || '',
        projectId: parsed.project_id || '',
      };
    } catch {}
  }

  return { json: '', email: '', projectId: '' };
}

export async function getGoogleDirectConfig(): Promise<StoredGoogleDirectSettings> {
  const fsSa = getFilesystemServiceAccount();

  const dbData = await getSystemSetting<{
    customerId?: string;
    encryptedDevToken?: string;
    clientId?: string;
    encryptedSecret?: string;
    ga4PropertyId?: string;
    scope?: 'READ_ONLY' | 'READ_WRITE';
    isConnected?: boolean;
    isGa4Connected?: boolean;
    encryptedServiceAccountJson?: string;
    serviceAccountEmail?: string;
    serviceAccountProjectId?: string;
    savedAt?: string;
  }>('GOOGLE_DIRECT');

  if (dbData && (dbData.customerId || dbData.encryptedDevToken || dbData.ga4PropertyId || dbData.encryptedServiceAccountJson || dbData.serviceAccountEmail)) {
    const plainDevToken = dbData.encryptedDevToken ? decryptToken(dbData.encryptedDevToken) : '';
    const plainSecret = dbData.encryptedSecret ? decryptToken(dbData.encryptedSecret) : '';
    const plainSaJson = dbData.encryptedServiceAccountJson ? decryptToken(dbData.encryptedServiceAccountJson) : fsSa.json;
    
    let saEmail = dbData.serviceAccountEmail || fsSa.email || '';
    let saProjectId = dbData.serviceAccountProjectId || fsSa.projectId || '';
    if (!saEmail && plainSaJson) {
      try {
        const parsed = JSON.parse(plainSaJson);
        saEmail = parsed.client_email || '';
        saProjectId = parsed.project_id || '';
      } catch {}
    }

    const hasSa = Boolean(plainSaJson || saEmail);

    return {
      customerId: dbData.customerId || '',
      developerToken: plainDevToken || process.env.GOOGLE_DEVELOPER_TOKEN || '',
      clientId: dbData.clientId || process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: plainSecret || process.env.GOOGLE_CLIENT_SECRET || '',
      ga4PropertyId: dbData.ga4PropertyId || '',
      scope: dbData.scope || 'READ_WRITE',
      isConnected: Boolean(dbData.isConnected),
      isGa4Connected: Boolean(dbData.isGa4Connected || hasSa || dbData.ga4PropertyId),
      serviceAccountJson: plainSaJson,
      serviceAccountEmail: saEmail,
      serviceAccountProjectId: saProjectId,
      hasServiceAccount: hasSa,
      savedAt: dbData.savedAt,
      source: 'database',
    };
  }

  const envDev = process.env.GOOGLE_DEVELOPER_TOKEN || '';
  const envClientId = process.env.GOOGLE_CLIENT_ID || '';
  const envClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  if (envDev || envClientId || envClientSecret || fsSa.json) {
    const hasSa = Boolean(fsSa.json || fsSa.email);
    return {
      customerId: '',
      developerToken: envDev,
      clientId: envClientId,
      clientSecret: envClientSecret,
      ga4PropertyId: '',
      scope: 'READ_WRITE',
      isConnected: false,
      isGa4Connected: hasSa,
      serviceAccountJson: fsSa.json,
      serviceAccountEmail: fsSa.email,
      serviceAccountProjectId: fsSa.projectId,
      hasServiceAccount: hasSa,
      source: fsSa.json ? 'file' : 'env',
    };
  }

  return {
    customerId: '',
    developerToken: '',
    clientId: '',
    clientSecret: '',
    ga4PropertyId: '',
    scope: 'READ_WRITE',
    isConnected: false,
    isGa4Connected: false,
    serviceAccountJson: '',
    serviceAccountEmail: '',
    serviceAccountProjectId: '',
    hasServiceAccount: false,
    source: 'none',
  };
}

export async function saveGoogleDirectConfig(settings: {
  customerId?: string;
  developerToken?: string;
  clientId?: string;
  clientSecret?: string;
  ga4PropertyId?: string;
  scope?: 'READ_ONLY' | 'READ_WRITE';
  isConnected?: boolean;
  isGa4Connected?: boolean;
  serviceAccountJson?: string;
  serviceAccountEmail?: string;
  serviceAccountProjectId?: string;
}) {
  let devTokenToEncrypt = settings.developerToken?.trim() || '';
  if (!devTokenToEncrypt || devTokenToEncrypt.includes('•')) {
    const existing = await getGoogleDirectConfig();
    devTokenToEncrypt = existing.developerToken;
  }
  let secretToEncrypt = settings.clientSecret?.trim() || '';
  if (!secretToEncrypt || secretToEncrypt.includes('•')) {
    const existing = await getGoogleDirectConfig();
    secretToEncrypt = existing.clientSecret;
  }

  let saJsonToEncrypt = settings.serviceAccountJson?.trim() || '';
  let saEmail = settings.serviceAccountEmail?.trim() || '';
  let saProjectId = settings.serviceAccountProjectId?.trim() || '';

  // Preserve existing encrypted SA JSON if user didn't re-upload
  if (!saJsonToEncrypt) {
    const existing = await getGoogleDirectConfig();
    if (existing.serviceAccountJson) {
      saJsonToEncrypt = existing.serviceAccountJson;
      saEmail = saEmail || existing.serviceAccountEmail || '';
      saProjectId = saProjectId || existing.serviceAccountProjectId || '';
    }
  } else {
    try {
      const parsed = typeof saJsonToEncrypt === 'string' ? JSON.parse(saJsonToEncrypt) : saJsonToEncrypt;
      if (parsed.client_email) saEmail = parsed.client_email;
      if (parsed.project_id) saProjectId = parsed.project_id;
    } catch {}
  }

  const hasSa = Boolean(saJsonToEncrypt || saEmail);

  const payload = {
    customerId: settings.customerId?.trim() || '',
    encryptedDevToken: devTokenToEncrypt ? encryptToken(devTokenToEncrypt) : '',
    clientId: settings.clientId?.trim() || '',
    encryptedSecret: secretToEncrypt ? encryptToken(secretToEncrypt) : '',
    ga4PropertyId: settings.ga4PropertyId?.trim() || '',
    scope: settings.scope || 'READ_WRITE',
    isConnected: Boolean(settings.isConnected),
    isGa4Connected: Boolean(settings.isGa4Connected || hasSa || settings.ga4PropertyId),
    encryptedServiceAccountJson: saJsonToEncrypt ? encryptToken(saJsonToEncrypt) : '',
    serviceAccountEmail: saEmail,
    serviceAccountProjectId: saProjectId,
    hasServiceAccount: hasSa,
    savedAt: new Date().toISOString(),
  };

  // Safely write a local credentials copy for filesystem access
  if (saJsonToEncrypt) {
    try {
      const credsDir = path.join(process.cwd(), 'credentials');
      if (!fs.existsSync(credsDir)) fs.mkdirSync(credsDir, { recursive: true });
      fs.writeFileSync(path.join(credsDir, 'google-service-account.json'), saJsonToEncrypt, 'utf-8');
    } catch (err) {
      console.warn('[SETTINGS_DB] Could not write credentials file:', err);
    }
  }

  return await saveSystemSetting('GOOGLE_DIRECT', payload, true);
}

export async function deleteGoogleDirectConfig(): Promise<{ success: boolean }> {
  try {
    const credPath = path.join(process.cwd(), 'credentials', 'google-service-account.json');
    if (fs.existsSync(credPath)) {
      fs.unlinkSync(credPath);
    }
  } catch {}
  return await deleteSystemSetting('GOOGLE_DIRECT');
}


// ==========================================
// 3. TIKTOK DIRECT MARKETING API CREDENTIALS
// ==========================================
export interface StoredTiktokDirectSettings {
  advertiserId: string;
  appId: string;
  appSecret: string;
  accessToken: string;
  scope?: 'READ_ONLY' | 'READ_WRITE';
  isConnected: boolean;
  savedAt?: string;
  source?: 'database' | 'env' | 'none';
}

export async function getTiktokDirectConfig(): Promise<StoredTiktokDirectSettings> {
  const dbData = await getSystemSetting<{
    advertiserId?: string;
    appId?: string;
    encryptedAppSecret?: string;
    encryptedAccessToken?: string;
    scope?: 'READ_ONLY' | 'READ_WRITE';
    isConnected?: boolean;
    savedAt?: string;
  }>('TIKTOK_DIRECT');

  if (dbData && (dbData.advertiserId || dbData.encryptedAccessToken)) {
    const plainSecret = dbData.encryptedAppSecret ? decryptToken(dbData.encryptedAppSecret) : '';
    const plainToken = dbData.encryptedAccessToken ? decryptToken(dbData.encryptedAccessToken) : '';
    return {
      advertiserId: dbData.advertiserId || '',
      appId: dbData.appId || process.env.TIKTOK_APP_ID || '',
      appSecret: plainSecret || process.env.TIKTOK_SECRET || '',
      accessToken: plainToken,
      scope: dbData.scope || 'READ_WRITE',
      isConnected: Boolean(dbData.isConnected && plainToken),
      savedAt: dbData.savedAt,
      source: 'database',
    };
  }

  const envAppId = process.env.TIKTOK_APP_ID || '';
  const envSecret = process.env.TIKTOK_SECRET || '';
  if (envAppId || envSecret) {
    return {
      advertiserId: '',
      appId: envAppId,
      appSecret: envSecret,
      accessToken: '',
      scope: 'READ_WRITE',
      isConnected: false,
      source: 'env',
    };
  }

  return {
    advertiserId: '',
    appId: '',
    appSecret: '',
    accessToken: '',
    scope: 'READ_WRITE',
    isConnected: false,
    source: 'none',
  };
}

export async function saveTiktokDirectConfig(settings: {
  advertiserId?: string;
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  scope?: 'READ_ONLY' | 'READ_WRITE';
  isConnected?: boolean;
}) {
  let tokenToEncrypt = settings.accessToken?.trim() || '';
  if (!tokenToEncrypt || tokenToEncrypt.includes('•')) {
    const existing = await getTiktokDirectConfig();
    tokenToEncrypt = existing.accessToken;
  }
  let secretToEncrypt = settings.appSecret?.trim() || '';
  if (!secretToEncrypt || secretToEncrypt.includes('•')) {
    const existing = await getTiktokDirectConfig();
    secretToEncrypt = existing.appSecret;
  }

  const payload = {
    advertiserId: settings.advertiserId?.trim() || '',
    appId: settings.appId?.trim() || '',
    encryptedAppSecret: secretToEncrypt ? encryptToken(secretToEncrypt) : '',
    encryptedAccessToken: tokenToEncrypt ? encryptToken(tokenToEncrypt) : '',
    scope: settings.scope || 'READ_WRITE',
    isConnected: settings.isConnected !== false && Boolean(tokenToEncrypt),
    savedAt: new Date().toISOString(),
  };

  return await saveSystemSetting('TIKTOK_DIRECT', payload, true);
}

export async function deleteTiktokDirectConfig(): Promise<{ success: boolean }> {
  return await deleteSystemSetting('TIKTOK_DIRECT');
}

// ==========================================
// 4. GMAIL SMTP 2FA OTP SERVICE CONFIG
// ==========================================
export interface StoredSmtpSettings {
  smtpUser: string;
  smtpPass: string;
  isConfigured: boolean;
  savedAt?: string;
  source?: 'database' | 'env' | 'none';
}

export async function getSmtpConfig(): Promise<StoredSmtpSettings> {
  const dbData = await getSystemSetting<{
    smtpUser?: string;
    encryptedPass?: string;
    savedAt?: string;
  }>('SMTP_CONFIG');

  if (dbData && (dbData.smtpUser || dbData.encryptedPass)) {
    const plainPass = dbData.encryptedPass ? decryptToken(dbData.encryptedPass) : '';
    return {
      smtpUser: dbData.smtpUser || process.env.SMTP_USER || process.env.GMAIL_USER || '',
      smtpPass: plainPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '',
      isConfigured: Boolean(dbData.smtpUser && plainPass),
      savedAt: dbData.savedAt,
      source: 'database',
    };
  }

  const envUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const envPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
  if (envUser || envPass) {
    return {
      smtpUser: envUser,
      smtpPass: envPass,
      isConfigured: Boolean(envUser && envPass),
      source: 'env',
    };
  }

  return {
    smtpUser: '',
    smtpPass: '',
    isConfigured: false,
    source: 'none',
  };
}

export async function saveSmtpConfig(settings: {
  smtpUser?: string;
  smtpPass?: string;
}) {
  let passToEncrypt = settings.smtpPass?.trim() || '';
  if (!passToEncrypt || passToEncrypt.includes('•')) {
    const existing = await getSmtpConfig();
    passToEncrypt = existing.smtpPass;
  }

  const payload = {
    smtpUser: settings.smtpUser?.trim() || '',
    encryptedPass: passToEncrypt ? encryptToken(passToEncrypt) : '',
    isConfigured: Boolean(settings.smtpUser?.trim() && passToEncrypt),
    savedAt: new Date().toISOString(),
  };

  return await saveSystemSetting('SMTP_CONFIG', payload, true);
}

export async function deleteSmtpConfig(): Promise<{ success: boolean }> {
  return await deleteSystemSetting('SMTP_CONFIG');
}


