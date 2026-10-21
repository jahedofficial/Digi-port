import * as crypto from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled: boolean;
  clientId?: string;
  platform?: string;
  operation?: string;
  startTime: number;
}

export class TraceContextManager {
  private static readonly storage = new AsyncLocalStorage<TraceContext>();

  /**
   * Generates a 32-character hex trace ID (128-bit).
   */
  static generateTraceId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generates a 16-character hex span ID (64-bit).
   */
  static generateSpanId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Executes a callback within a distributed trace context.
   */
  static runInContext<T>(
    context: Partial<TraceContext>,
    callback: () => Promise<T> | T
  ): Promise<T> | T {
    const traceId = context.traceId || this.generateTraceId();
    const spanId = context.spanId || this.generateSpanId();

    const fullContext: TraceContext = {
      traceId,
      spanId,
      parentSpanId: context.parentSpanId,
      sampled: context.sampled ?? true,
      clientId: context.clientId,
      platform: context.platform,
      operation: context.operation,
      startTime: Date.now(),
    };

    return this.storage.run(fullContext, callback);
  }

  /**
   * Retrieves active trace context from async local storage.
   */
  static getActiveContext(): TraceContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Formats current context into a W3C traceparent header string:
   * version-traceId-spanId-flags (e.g. 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01)
   */
  static toTraceParent(context?: TraceContext): string {
    const ctx = context || this.getActiveContext();
    if (!ctx) {
      return `00-${this.generateTraceId()}-${this.generateSpanId()}-01`;
    }
    const flags = ctx.sampled ? '01' : '00';
    return `00-${ctx.traceId}-${ctx.spanId}-${flags}`;
  }
}
