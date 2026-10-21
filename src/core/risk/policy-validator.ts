import { Platform } from '../types/account';
import { IPolicyValidator, PolicyViolation } from './types';

/**
 * Deterministic Advertising Policy Validator
 * Validates ad copy, headlines, and destination links against Google Ads, Meta, and TikTok advertising standards.
 */
export class PolicyValidator implements IPolicyValidator {
  // Prohibited Claims & Misleading Sensationalism
  private static readonly MISLEADING_CLAIMS_REGEX =
    /\b(100%\s*guaranteed?\s*cure|miracle\s*(cure|pill|remedy)|risk[\s-]*free\s*(money|profit)|get\s*rich\s*quick|cure\s*all\s*diseases|instant\s*weight\s*loss|lose\s*\d+\s*(kg|lbs)\s*in\s*\d+\s*days)\b/i;

  // Personal Attributes & Inappropriate Targeting (Meta)
  private static readonly PERSONAL_ATTRIBUTES_REGEX =
    /\b(are\s*you\s*(bankrupt|depressed|in\s*debt|overweight|broke)|struggling\s*with\s*(bad\s*credit|addiction))\b/i;

  // Special Ad Categories (Credit, Housing, Employment)
  private static readonly SPECIAL_AD_CATEGORY_KEYWORDS =
    /\b(home\s*loans?|mortgage\s*rates?|credit\s*card\s*approval|housing\s*for\s*rent|job\s*opening|hiring\s*immediately)\b/i;

  // Editorial Gimmicks (Google & TikTok)
  private static readonly GIMMICKY_CAPS_REGEX = /\b[A-Z\s]{16,}\b/;
  private static readonly GIMMICKY_PUNCTUATION_REGEX = /(!{3,}|\?{3,}|\${2,})/;

  public validateContent(
    content: {
      headlines?: string[];
      descriptions?: string[];
      bodyText?: string;
      targetUrl?: string;
    },
    platform: Platform | 'CROSS_PLATFORM'
  ): { isValid: boolean; violations: PolicyViolation[] } {
    const violations: PolicyViolation[] = [];
    const textCorpus = [
      ...(content.headlines ?? []),
      ...(content.descriptions ?? []),
      content.bodyText ?? '',
    ].filter(Boolean);

    for (const text of textCorpus) {
      // 1. Prohibited Misleading Content (Cross-platform)
      if (PolicyValidator.MISLEADING_CLAIMS_REGEX.test(text)) {
        violations.push({
          platform,
          ruleId: 'POLICY_PROHIBITED_MISLEADING_CONTENT',
          category: 'PROHIBITED',
          message: 'Absolute guarantees, miracle cures, and get-rich-quick claims are strictly prohibited.',
          offendingTextOrElement: text,
          remediationGuidance: 'Remove absolute promises and focus on authentic, verifiable value propositions.',
        });
      }

      // 2. Meta Personal Attributes Violation
      if ((platform === 'META' || platform === 'CROSS_PLATFORM') && PolicyValidator.PERSONAL_ATTRIBUTES_REGEX.test(text)) {
        violations.push({
          platform: 'META',
          ruleId: 'META_PERSONAL_ATTRIBUTES',
          category: 'PROHIBITED',
          message: 'Meta Advertising Standards prohibit ads asserting or implying personal attributes (debt, health, depression).',
          offendingTextOrElement: text,
          remediationGuidance: 'Reframe copy toward product solutions without directly addressing user vulnerabilities.',
        });
      }

      // 3. Meta Special Ad Categories (Credit, Housing, Employment)
      if ((platform === 'META' || platform === 'CROSS_PLATFORM') && PolicyValidator.SPECIAL_AD_CATEGORY_KEYWORDS.test(text)) {
        violations.push({
          platform: 'META',
          ruleId: 'META_SPECIAL_AD_CATEGORY_REQUIRED',
          category: 'SPECIAL_AD_CATEGORY',
          message: 'Keywords related to credit, loans, housing, or employment trigger Meta Special Ad Category requirements.',
          offendingTextOrElement: text,
          remediationGuidance: 'Declare the appropriate Special Ad Category (HOUSING, CREDIT, EMPLOYMENT) and disable discriminatory audience filters.',
        });
      }

      // 4. TikTok Weight Loss & Health Policy
      if (platform === 'TIKTOK' || platform === 'CROSS_PLATFORM') {
        if (/\b(diet\s*pills?|fast\s*weight\s*loss|cosmetic\s*surgery)\b/i.test(text)) {
          violations.push({
            platform: 'TIKTOK',
            ruleId: 'TIKTOK_RESTRICTED_HEALTH_CLAIMS',
            category: 'PROHIBITED',
            message: 'TikTok Commercial Content Guidelines prohibit promoting drastic weight loss supplements or cosmetic surgery to general audiences.',
            offendingTextOrElement: text,
            remediationGuidance: 'Ensure health and wellness offers adhere to local licensing and age restrictions (18+ only).',
          });
        }
      }

      // 5. Editorial Standards: Excessive Capitalization or Gimmicks
      if (PolicyValidator.GIMMICKY_CAPS_REGEX.test(text) || PolicyValidator.GIMMICKY_PUNCTUATION_REGEX.test(text)) {
        violations.push({
          platform,
          ruleId: 'EDITORIAL_STYLE_VIOLATION',
          category: 'EDITORIAL',
          message: 'Excessive capitalization, repeated punctuation, or gimmicky symbols violate platform editorial guidelines.',
          offendingTextOrElement: text,
          remediationGuidance: 'Use standard sentence casing and avoid multiple consecutive exclamation marks.',
        });
      }
    }

    // 6. Destination URL Validation
    if (content.targetUrl) {
      if (!/^https?:\/\/[a-zA-Z0-9_\-.]+\.[a-zA-Z]{2,}/.test(content.targetUrl)) {
        violations.push({
          platform,
          ruleId: 'DESTINATION_URL_INVALID',
          category: 'EDITORIAL',
          message: 'Destination URL is malformed or missing a valid protocol (https:// required).',
          offendingTextOrElement: content.targetUrl,
          remediationGuidance: 'Provide a valid, reachable destination URL with active SSL encryption.',
        });
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }
}
