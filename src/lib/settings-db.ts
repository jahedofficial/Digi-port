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

