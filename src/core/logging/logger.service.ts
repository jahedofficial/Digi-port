import { ILogger, LogLevel, LogContext } from '../interfaces/logger.interface';

export class StructuredLogger implements ILogger {
  private componentName: string;

  constructor(componentName: string = 'DigiPortCore') {
    this.componentName = componentName;
  }

  debug(message: string, context?: LogContext): void {
    this.log('DEBUG', message, undefined, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('INFO', message, undefined, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, undefined, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.log('ERROR', message, error, context);
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    this.log('FATAL', message, error, context);
  }

  private log(level: LogLevel, message: string, error?: Error | unknown, context?: LogContext): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      component: context?.component || this.componentName,
      correlationId: context?.correlationId,
      workspaceId: context?.workspaceId,
      message: this.sanitize(message),
      error: error instanceof Error ? { name: error.name, message: this.sanitize(error.message), stack: error.stack } : error,
      context: context ? this.sanitizeObject(context) : undefined,
    };

    const output = JSON.stringify(entry);

    if (level === 'ERROR' || level === 'FATAL') {
      console.error(output);
    } else if (level === 'WARN') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  private sanitize(str: string): string {
    if (!str) return str;
    return str
      .replace(/sk-or-v1-[a-zA-Z0-9_\-]{15,}/g, 'sk-or-v1-••••••••')
      .replace(/ya29\.[a-zA-Z0-9_\-]{20,}/g, 'ya29.••••••••')
      .replace(/EAAB[a-zA-Z0-9_\-]{20,}/g, 'EAAB••••••••')
      .replace(/Bearer\s+[a-zA-Z0-9_\-]{15,}/gi, 'Bearer ••••••••')
      .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[REDACTED_EMAIL]');
  }

  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (/token|secret|password|key|auth/i.test(key) && typeof value === 'string') {
        sanitized[key] = '••••••••';
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitize(value);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

export const LoggerService = StructuredLogger;
export type LoggerService = StructuredLogger;
export class ConsoleLogger extends StructuredLogger {}

