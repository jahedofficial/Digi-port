import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Encryption key fallback for development / testing
const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-length!!';
const KEY = crypto.createHash('sha256').update(String(ENCRYPTION_SECRET)).digest();

/**
 * Encrypts sensitive text (e.g. Access Tokens, Refresh Tokens) using AES-256-GCM.
 * Tokens NEVER touch the client browser.
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted token string.
 * Strictly called on server-side when dispatching background API sync or management requests.
 */
export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return '';
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Token decryption failure:', error);
    return '';
  }
}
