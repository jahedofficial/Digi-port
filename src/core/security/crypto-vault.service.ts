import * as crypto from 'node:crypto';
import { SecurityException } from '../errors/domain.errors';

export interface EncryptedPayload {
  iv: string;
  authTag: string;
  ciphertext: string;
  encoded: string; // iv:authTag:ciphertext
}

export class CryptoVaultService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(secretKey?: string) {
    const rawSecret = secretKey || process.env.ENCRYPTION_SECRET || '';
    if (!rawSecret || rawSecret.trim().length < 32) {
      throw new SecurityException(
        'Cryptographic master key (ENCRYPTION_SECRET) must be at least 32 characters (256 bits)',
        'ERR_WEAK_ENCRYPTION_KEY'
      );
    }
    // Derive a fixed 32-byte key using SHA-256 hash of the secret
    this.key = crypto.createHash('sha256').update(rawSecret.trim()).digest();
  }

  /**
   * Encrypts plaintext string using AES-256-GCM authenticated encryption.
   * Produces an authenticated bundle containing IV (12 bytes), AuthTag (16 bytes), and Ciphertext.
   */
  encrypt(plaintext: string): EncryptedPayload {
    if (typeof plaintext !== 'string') {
      throw new SecurityException('Encryption input must be a valid string', 'ERR_INVALID_CRYPTO_INPUT');
    }

    const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    const ivHex = iv.toString('hex');

    return {
      iv: ivHex,
      authTag,
      ciphertext,
      encoded: `${ivHex}:${authTag}:${ciphertext}`,
    };
  }

  /**
   * Decrypts an AES-256-GCM payload in `iv:authTag:ciphertext` format.
   * Ensures cryptographic authenticity via GCM auth tag verification.
   */
  decrypt(payloadOrEncoded: string | { iv: string; authTag: string; ciphertext: string }): string {
    let ivHex: string;
    let authTagHex: string;
    let ciphertextHex: string;

    if (typeof payloadOrEncoded === 'string') {
      const parts = payloadOrEncoded.split(':');
      if (parts.length !== 3) {
        throw new SecurityException('Malformed encrypted payload format. Expected iv:authTag:ciphertext', 'ERR_CRYPTO_INTEGRITY');
      }
      [ivHex, authTagHex, ciphertextHex] = parts;
    } else {
      ivHex = payloadOrEncoded.iv;
      authTagHex = payloadOrEncoded.authTag;
      ciphertextHex = payloadOrEncoded.ciphertext;
    }

    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      if (iv.length !== 12 || authTag.length !== 16) {
        throw new Error('Invalid IV or AuthTag length');
      }

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err: any) {
      throw new SecurityException(
        `Cryptographic decryption failed: authentication tag mismatch or corrupted ciphertext (${err.message})`,
        'ERR_CRYPTO_INTEGRITY'
      );
    }
  }

  /**
   * Zeroizes sensitive buffer in memory to mitigate heap inspection attacks.
   */
  zeroize(buf: Buffer): void {
    if (Buffer.isBuffer(buf)) {
      buf.fill(0);
    }
  }
}

/**
 * Enterprise Secret and PII Redactor
 * Automatically sanitizes logs, error stacks, and messages to prevent credential and PII leakage.
 */
export class SecretRedactor {
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private static readonly PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  private static readonly IPV4_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  private static readonly BEARER_REGEX = /Bearer\s+([A-Za-z0-9_\-\.]{15,})/gi;
  private static readonly TOKEN_PARAM_REGEX = /([?&](?:access_token|refresh_token|client_secret|api_key|token)=)[^&]*/gi;

  /**
   * Sanitizes any arbitrary text, masking emails, phones, IPs, and API tokens.
   */
  static redact(input: string, customSecrets: string[] = []): string {
    if (!input || typeof input !== 'string') return input;

    let sanitized = input;

    // Redact explicit custom secrets first
    for (const secret of customSecrets) {
      if (secret && secret.trim().length >= 4) {
        const escaped = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        sanitized = sanitized.replace(new RegExp(escaped, 'g'), '[REDACTED_SECRET]');
      }
    }

    // Redact bearer tokens
    sanitized = sanitized.replace(this.BEARER_REGEX, 'Bearer [REDACTED_TOKEN]');

    // Redact query parameter tokens
    sanitized = sanitized.replace(this.TOKEN_PARAM_REGEX, '$1[REDACTED]');

    // Redact PII
    sanitized = sanitized.replace(this.EMAIL_REGEX, '[REDACTED_EMAIL]');
    sanitized = sanitized.replace(this.PHONE_REGEX, '[REDACTED_PHONE]');
    sanitized = sanitized.replace(this.IPV4_REGEX, '[REDACTED_IP]');

    return sanitized;
  }

  /**
   * Deeply redacts an object's string properties recursively.
   */
  static redactObject<T>(obj: T, customSecrets: string[] = []): T {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactObject(item, customSecrets)) as unknown as T;
    }

    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj as Record<string, any>)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('credential') ||
        lowerKey.includes('auth')
      ) {
        result[key] = '[REDACTED_CREDENTIAL]';
      } else if (typeof val === 'string') {
        result[key] = this.redact(val, customSecrets);
      } else if (typeof val === 'object' && val !== null) {
        result[key] = this.redactObject(val, customSecrets);
      } else {
        result[key] = val;
      }
    }

    return result as T;
  }
}
