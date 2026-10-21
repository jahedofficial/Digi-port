import { SYSTEM_ERROR_CODES } from '../constants/platform.constants';

export class DomainException extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string = 'ERR_DOMAIN', context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}

export class CredentialException extends DomainException {
  constructor(message: string, code: string = SYSTEM_ERROR_CODES.CREDENTIAL_MISSING, context?: Record<string, unknown>) {
    super(message, code, context);
  }
}

export class AdapterException extends DomainException {
  public readonly platform: string;
  public readonly statusCode?: number;

  constructor(message: string, platform: string, statusCode?: number, context?: Record<string, unknown>) {
    super(message, SYSTEM_ERROR_CODES.ADAPTER_UNAVAILABLE, { ...context, platform, statusCode });
    this.platform = platform;
    this.statusCode = statusCode;
  }
}

export class RateLimitException extends DomainException {
  public readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number = 60, context?: Record<string, unknown>) {
    super(message, SYSTEM_ERROR_CODES.RATE_LIMIT_EXCEEDED, { ...context, retryAfterSeconds });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ValidationException extends DomainException {
  public readonly validationErrors: string[];

  constructor(message: string, validationErrors: string[] = [], context?: Record<string, unknown>) {
    super(message, SYSTEM_ERROR_CODES.VALIDATION_FAILED, { ...context, validationErrors });
    this.validationErrors = validationErrors;
  }
}

export class PolicyViolationException extends DomainException {
  public readonly violatedRules: string[];

  constructor(message: string, violatedRules: string[] = [], context?: Record<string, unknown>) {
    super(message, SYSTEM_ERROR_CODES.POLICY_VIOLATION, { ...context, violatedRules });
    this.violatedRules = violatedRules;
  }
}

export class BudgetCapException extends DomainException {
  public readonly requestedAmount: number;
  public readonly maxAllowedAmount: number;

  constructor(message: string, requestedAmount: number, maxAllowedAmount: number) {
    super(message, SYSTEM_ERROR_CODES.BUDGET_CAP_EXCEEDED, { requestedAmount, maxAllowedAmount });
    this.requestedAmount = requestedAmount;
    this.maxAllowedAmount = maxAllowedAmount;
  }
}

export class SystemException extends DomainException {
  constructor(message: string, code: string = 'ERR_SYSTEM', context?: Record<string, unknown>) {
    super(message, code, context);
  }
}

export class SecurityException extends DomainException {
  constructor(message: string, code: string = 'ERR_SECURITY_VIOLATION', context?: Record<string, unknown>) {
    super(message, code, context);
  }
}

