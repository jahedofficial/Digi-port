import { ValidationException } from '../errors/domain.errors';
import {
  IMemoryValidator,
  MemoryCategory,
  MemoryEntry,
  MemoryValidationResult,
  VALID_MEMORY_CATEGORIES,
} from './types';

/**
 * Production Memory Validator enforcing Phase 8 boundary rules:
 * - Long-term business context only.
 * - Zero performance metrics.
 * - Zero live platform entity / API response dumps.
 * - Zero credentials / tokens.
 * - Zero customer PII.
 * - Strict client isolation.
 */
export class MemoryValidator implements IMemoryValidator {
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  private static readonly PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
  private static readonly IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
  private static readonly CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/;

  private static readonly TOKEN_PATTERNS = [
    /Bearer\s+[A-Za-z0-9_\-\.]+/i,
    /ya29\.[A-Za-z0-9_\-]+/,
    /EAAB[A-Za-z0-9]+/,
    /sk-or-v1-[A-Za-z0-9]+/,
    /ghp_[A-Za-z0-9]+/,
  ];

  private static readonly CREDENTIAL_KEY_REGEX =
    /^(api_key|access_token|refresh_token|client_secret|auth_secret|developer_token|private_key)$/i;

  private static readonly LIVE_METRIC_KEY_REGEX =
    /^(impressions|clicks|ctr|cpc|spend|cost_per_click|live_roas|current_roas|conversions_today|daily_spend|cpm|reach|frequency|video_views|cost_per_conversion)$/i;

  private static readonly RAW_DATA_KEY_REGEX =
    /^(raw_api_response|api_response|platform_dump|google_ads_row|ad_account_dump|realtime_ad_status)$/i;

  /**
   * Scans an object, array, or scalar for any prohibited content.
   */
  public validateProhibitedContent(target: unknown): { hasProhibited: boolean; reasons: string[] } {
    const reasons: string[] = [];
    this.scanTarget(target, '', reasons);
    return {
      hasProhibited: reasons.length > 0,
      reasons,
    };
  }

  private scanTarget(target: unknown, currentPath: string, reasons: string[]): void {
    if (target === null || target === undefined) {
      return;
    }

    if (typeof target === 'string') {
      // 1. Check for token leaks
      for (const pattern of MemoryValidator.TOKEN_PATTERNS) {
        if (pattern.test(target)) {
          reasons.push(`Sensitive token detected at '${currentPath}': matches ${pattern.toString()}`);
          return;
        }
      }

      // 2. Check for PII: Email
      if (MemoryValidator.EMAIL_REGEX.test(target)) {
        reasons.push(`Customer PII (Email address) detected at '${currentPath}'`);
        return;
      }

      // 3. Check for PII: Phone number
      if (MemoryValidator.PHONE_REGEX.test(target)) {
        reasons.push(`Customer PII (Phone number) detected at '${currentPath}'`);
        return;
      }

      // 4. Check for PII: IP Address
      if (MemoryValidator.IP_REGEX.test(target)) {
        reasons.push(`Customer PII (IP address) detected at '${currentPath}'`);
        return;
      }

      // 5. Check for PII: Credit Card
      if (MemoryValidator.CREDENTIAL_KEY_REGEX.test(target)) {
        reasons.push(`Credential key pattern detected in string value at '${currentPath}'`);
        return;
      }
      if (MemoryValidator.CREDIT_CARD_REGEX.test(target)) {
        reasons.push(`Payment card number detected at '${currentPath}'`);
        return;
      }
    } else if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i++) {
        this.scanTarget(target[i], `${currentPath}[${i}]`, reasons);
      }
    } else if (typeof target === 'object') {
      for (const [key, val] of Object.entries(target as Record<string, unknown>)) {
        const nextPath = currentPath ? `${currentPath}.${key}` : key;

        // Check key name for prohibited metric or credential
        if (MemoryValidator.CREDENTIAL_KEY_REGEX.test(key)) {
          reasons.push(`Sensitive credential key forbidden in long-term memory: '${nextPath}'`);
        }

        if (MemoryValidator.LIVE_METRIC_KEY_REGEX.test(key)) {
          reasons.push(
            `Live performance metric forbidden in long-term memory: '${nextPath}'. Live data must come from Platform Adapters.`
          );
        }

        if (MemoryValidator.RAW_DATA_KEY_REGEX.test(key)) {
          reasons.push(
            `Raw API response / platform dump forbidden in long-term memory: '${nextPath}'.`
          );
        }

        this.scanTarget(val, nextPath, reasons);
      }
    }
  }

  /**
   * Validates a complete or partial MemoryEntry.
   */
  public validateEntry(entry: Partial<MemoryEntry>): MemoryValidationResult {
    const errors: string[] = [];

    // 1. Client ID Isolation Check
    if (!entry.clientId || typeof entry.clientId !== 'string' || entry.clientId.trim().length === 0) {
      errors.push("Memory entry must include a non-empty 'clientId' for strict tenant isolation.");
    } else if (!/^[a-zA-Z0-9_\-]+$/.test(entry.clientId)) {
      errors.push(`Invalid clientId format: '${entry.clientId}'. Must contain only alphanumeric characters, underscores, or hyphens.`);
    }

    // 2. Category Check
    if (!entry.category) {
      errors.push("Memory entry must specify a 'category'.");
    } else if (!VALID_MEMORY_CATEGORIES.includes(entry.category as MemoryCategory)) {
      errors.push(
        `Invalid memory category '${entry.category}'. Valid categories are: ${VALID_MEMORY_CATEGORIES.join(', ')}`
      );
    }

    // 3. Key Check
    if (!entry.key || typeof entry.key !== 'string' || entry.key.trim().length === 0) {
      errors.push("Memory entry must specify a non-empty 'key'.");
    } else {
      if (MemoryValidator.LIVE_METRIC_KEY_REGEX.test(entry.key)) {
        errors.push(`Memory key '${entry.key}' represents a live metric. Metrics cannot be stored in long-term memory.`);
      }
      if (MemoryValidator.CREDENTIAL_KEY_REGEX.test(entry.key)) {
        errors.push(`Memory key '${entry.key}' represents a credential. Tokens cannot be stored in long-term memory.`);
      }
    }

    // 4. Value & Prohibited Content Deep Inspection
    if (entry.value === undefined || entry.value === null) {
      errors.push("Memory entry must specify a valid non-null 'value'.");
    } else {
      const scan = this.validateProhibitedContent(entry.value);
      if (scan.hasProhibited) {
        errors.push(...scan.reasons);
      }
    }

    // 5. Confidence Score Check
    if (entry.confidence !== undefined) {
      if (typeof entry.confidence !== 'number' || entry.confidence < 0.0 || entry.confidence > 1.0) {
        errors.push(`Confidence score must be a number between 0.0 and 1.0. Received: ${entry.confidence}`);
      }
    }

    // 6. Importance Score Check
    if (entry.importance !== undefined) {
      if (typeof entry.importance !== 'number' || entry.importance < 1 || entry.importance > 10) {
        errors.push(`Importance score must be an integer between 1 and 10. Received: ${entry.importance}`);
      }
    }

    // 7. Approval Requirement Check
    if (entry.isApproved === false) {
      errors.push("Unapproved memory items cannot be stored in production memory. Store only approved and validated information.");
    }

    // 8. Category-Specific Schema Validation
    if (entry.category && entry.value && typeof entry.value === 'object') {
      const val = entry.value as Record<string, unknown>;

      if (entry.category === 'PLATFORM_PREFERENCES' && val.defaultBudgetSplit) {
        const split = val.defaultBudgetSplit as Record<string, number>;
        const sum = Object.values(split).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
        if (Math.abs(sum - 100) > 0.5) {
          errors.push(
            `Platform budget split percentages must sum to 100%. Current sum: ${sum}%`
          );
        }
      }

      if (entry.category === 'BUSINESS_GOALS') {
        if (val.targetRoasFloor !== undefined && Number(val.targetRoasFloor) <= 0) {
          errors.push("targetRoasFloor must be greater than 0.");
        }
        if (val.maxAllowableCpa !== undefined && Number(val.maxAllowableCpa) < 0) {
          errors.push("maxAllowableCpa cannot be negative.");
        }
        if (val.monthlyBudgetCeiling !== undefined && Number(val.monthlyBudgetCeiling) < 0) {
          errors.push("monthlyBudgetCeiling cannot be negative.");
        }
      }

      if (entry.category === 'APPROVAL_RULES') {
        if (val.autoApproveBudgetThreshold !== undefined && Number(val.autoApproveBudgetThreshold) < 0) {
          errors.push("autoApproveBudgetThreshold cannot be negative.");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      detectedProhibitedContent: errors.filter(
        (e) =>
          e.includes('PII') ||
          e.includes('token') ||
          e.includes('credential') ||
          e.includes('metric') ||
          e.includes('dump')
      ),
    };
  }

  /**
   * Asserts entry is valid; throws ValidationException on failure.
   */
  public assertValidEntry(entry: Partial<MemoryEntry>): void {
    const result = this.validateEntry(entry);
    if (!result.isValid) {
      throw new ValidationException(
        `Memory validation failed: ${result.errors.join('; ')}`,
        result.errors,
        { entryId: entry.id, clientId: entry.clientId, key: entry.key }
      );
    }
  }
}
