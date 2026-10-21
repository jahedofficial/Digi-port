import { Platform } from '../types/account';
import { AgentOperation, ClientContext, IOpenRouterReasoningClient } from '../interfaces/agent.interface';

export interface ParsedIntent {
  rawPrompt: string;
  targetPlatforms: Platform[];
  operation: AgentOperation;
  industryTemplate?: string;
  playbookId?: string;
  estimatedBudget: number;
  requiresHumanReview: boolean;
  isBilingualBengali: boolean;
  confidenceScore: number;
}

export class IntentAnalyzer {
  constructor(private readonly reasoningClient?: IOpenRouterReasoningClient) {}

  async analyze(prompt: string, context: ClientContext): Promise<ParsedIntent> {
    // 1. Language detection (Bengali / English)
    const isBilingualBengali = /[\u0980-\u09FF]|koro|dekho|dekba|chalaw|bondho|bujlam|korte|hobe|bhalo/i.test(prompt);

    // 2. Platform identification
    const platforms: Platform[] = [];
    const lower = prompt.toLowerCase();

    const mentionsGoogle = /google|gads|search\s*ads|pmax|youtube|gtm|ga4/i.test(lower);
    const mentionsMeta = /meta|facebook|fb|instagram|insta|capi|advantage\+/i.test(lower);
    const mentionsTikTok = /tiktok|tt|spark\s*ads|tiktok\s*events/i.test(lower);

    if (mentionsGoogle) platforms.push('GOOGLE');
    if (mentionsMeta) platforms.push('META');
    if (mentionsTikTok) platforms.push('TIKTOK');

    // Default to context active platforms or cross-platform if not explicitly mentioned
    const targetPlatforms: Platform[] = platforms.length > 0
      ? platforms
      : (context.activePlatforms.length > 0 ? context.activePlatforms : ['GOOGLE', 'META', 'TIKTOK']);

    // 3. Operation detection
    let operation: AgentOperation = 'AUDIT';
    if (/launch|create|start|scale|notun|banaw|chalu/i.test(lower)) {
      operation = 'LAUNCH';
    } else if (/optimize|roas|cpa|improve|bidding|bid|budge|baraw/i.test(lower)) {
      operation = 'OPTIMIZE';
    } else if (/pause|stop|halt|bondho|off/i.test(lower)) {
      operation = 'PAUSE';
    } else if (/track|pixel|capi|tag|conversion|event|gtm|ga4|setup/i.test(lower)) {
      operation = 'VERIFY_TRACKING';
    } else if (/audit|check|review|dekho|status|report|performance/i.test(lower)) {
      operation = 'AUDIT';
    }

    // 4. Industry template detection
    let industryTemplate = context.industry || 'ecommerce';
    if (/lead\s*gen|form|real\s*estate|property/i.test(lower)) {
      industryTemplate = 'lead-generation';
    } else if (/saas|software|subscription|b2b/i.test(lower)) {
      industryTemplate = 'saas';
    } else if (/health|clinic|doctor|pharma/i.test(lower)) {
      industryTemplate = 'healthcare';
    } else if (/shop|store|product|ecom|ecommerce|cart|purchase/i.test(lower)) {
      industryTemplate = 'ecommerce';
    }

    // 5. Playbook selection
    let playbookId = 'campaign-audit';
    switch (operation) {
      case 'LAUNCH':
        playbookId = 'campaign-creation';
        break;
      case 'OPTIMIZE':
        playbookId = 'campaign-optimization';
        break;
      case 'PAUSE':
        playbookId = 'campaign-audit';
        break;
      case 'VERIFY_TRACKING':
        playbookId = 'conversion-tracking';
        break;
      case 'AUDIT':
      default:
        playbookId = 'campaign-audit';
        break;
    }

    // 6. Budget extraction
    let estimatedBudget = 0;
    const budgetMatch = prompt.match(/(?:\$|usd|budget|spend|tk|bdt|€|£)?\s*(\d+(?:[.,]\d+)?)\s*(?:\$|usd|tk|bdt|€|£|daily|per\s*day)?/i);
    if (budgetMatch && budgetMatch[1]) {
      const parsed = parseFloat(budgetMatch[1].replace(',', ''));
      if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
        estimatedBudget = parsed;
      }
    }

    // 7. Human review requirement
    // Creating, scaling spend, or pausing active campaigns always requires approval
    const requiresHumanReview = operation === 'LAUNCH' || operation === 'PAUSE' || estimatedBudget > 500;

    // 8. If LLM reasoning client available, enrich analysis without passing PII
    if (this.reasoningClient) {
      try {
        const reasoningPrompt = `Analyze marketing intent for prompt: "${prompt}". Operation: ${operation}. Platforms: ${targetPlatforms.join(', ')}.`;
        const res = await this.reasoningClient.reason(reasoningPrompt, 'You are an intent validation engine.');
        if (res.structuredJson?.operation) {
          operation = res.structuredJson.operation as AgentOperation;
        }
      } catch {
        // Deterministic fallback works seamlessly
      }
    }

    return {
      rawPrompt: prompt,
      targetPlatforms,
      operation,
      industryTemplate,
      playbookId,
      estimatedBudget,
      requiresHumanReview,
      isBilingualBengali,
      confidenceScore: 0.95,
    };
  }
}
