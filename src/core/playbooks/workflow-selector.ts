import { IWorkflowSelector, IPlaybookRegistry, Playbook } from './types';
import { Platform } from '../types/account';
import { ILogger } from '../interfaces/logger.interface';

export class WorkflowSelector implements IWorkflowSelector {
  constructor(
    private readonly registry: IPlaybookRegistry,
    private readonly logger?: ILogger
  ) {}

  selectPlaybook(
    operation: string, 
    platforms: Platform[], 
    context?: Record<string, unknown>
  ): Playbook | undefined {
    const op = operation.toUpperCase();
    this.logger?.debug(`[WorkflowSelector] Selecting playbook for operation: ${op}, platforms: [${platforms.join(', ')}]`);

    // Specific Playbook ID overrides in context
    if (context?.preferredPlaybookId && typeof context.preferredPlaybookId === 'string') {
      const preferred = this.registry.get(context.preferredPlaybookId);
      if (preferred) return preferred;
    }

    // Direct operation mapping
    switch (op) {
      case 'SETUP':
      case 'ACCOUNT_SETUP':
        return this.registry.get('playbook-account-setup');

      case 'LAUNCH':
      case 'CREATE':
        if (platforms.length === 1 && platforms[0] === 'META' && context?.campaignType === 'ADVANTAGE_PLUS') {
          return this.registry.get('playbook-meta-advantage-plus-sales') || this.registry.get('playbook-campaign-creation');
        }
        return this.registry.get('playbook-campaign-creation');

      case 'AUDIT':
      case 'CHECK':
        return this.registry.get('playbook-campaign-audit');

      case 'OPTIMIZE':
      case 'BID_ADJUSTMENT':
        return this.registry.get('playbook-campaign-optimization');

      case 'VERIFY_TRACKING':
      case 'TRACK':
      case 'CONVERSION_TRACKING':
        return this.registry.get('playbook-conversion-tracking');

      case 'CATALOG':
      case 'MERCHANT_CENTER':
        return this.registry.get('playbook-catalog-merchant-center');

      case 'REPORT':
      case 'REPORTING':
        return this.registry.get('playbook-reporting');

      case 'SCALE':
      case 'SCALING':
        return this.registry.get('playbook-scaling');

      case 'BUDGET_ALLOCATION':
      case 'CROSS_PLATFORM_BUDGET':
        return this.registry.get('playbook-cross-platform-budget-allocation');

      case 'CREATIVE_TESTING':
      case 'CREATIVE_REFRESH':
        return this.registry.get('playbook-creative-testing-refresh');

      default:
        // Fallback: match by platform
        if (platforms.length > 0) {
          const platformPlaybooks = this.registry.getByPlatform(platforms[0]);
          if (platformPlaybooks.length > 0) {
            return platformPlaybooks[0];
          }
        }
        return this.registry.getAll()[0];
    }
  }
}
