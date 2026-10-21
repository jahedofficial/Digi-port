export type MetricType = 'counter' | 'gauge' | 'histogram';

export interface MetricDefinition {
  name: string;
  help: string;
  type: MetricType;
  buckets?: number[]; // For histograms
}

export interface MetricSample {
  labels: Record<string, string>;
  value: number;
  timestamp?: number;
}

export class PrometheusMetricsRegistry {
  private readonly definitions: Map<string, MetricDefinition> = new Map();
  private readonly counters: Map<string, Map<string, number>> = new Map();
  private readonly gauges: Map<string, Map<string, number>> = new Map();
  private readonly histograms: Map<string, Map<string, number[]>> = new Map();

  constructor() {
    this.registerDefaultMetrics();
  }

  /**
   * Registers a new metric definition.
   */
  register(definition: MetricDefinition): void {
    this.definitions.set(definition.name, definition);
    if (definition.type === 'counter') this.counters.set(definition.name, new Map());
    if (definition.type === 'gauge') this.gauges.set(definition.name, new Map());
    if (definition.type === 'histogram') this.histograms.set(definition.name, new Map());
  }

  /**
   * Increments a counter metric.
   */
  incrementCounter(name: string, labels: Record<string, string> = {}, value = 1): void {
    if (!this.counters.has(name)) {
      this.register({ name, help: name, type: 'counter' });
    }
    const labelKey = this.serializeLabels(labels);
    const store = this.counters.get(name)!;
    const current = store.get(labelKey) || 0;
    store.set(labelKey, current + value);
  }

  /**
   * Sets the current value of a gauge metric.
   */
  setGauge(name: string, labels: Record<string, string> = {}, value: number): void {
    if (!this.gauges.has(name)) {
      this.register({ name, help: name, type: 'gauge' });
    }
    const labelKey = this.serializeLabels(labels);
    this.gauges.get(name)!.set(labelKey, value);
  }

  /**
   * Observes a sample in a histogram metric.
   */
  observeHistogram(name: string, labels: Record<string, string> = {}, value: number): void {
    if (!this.histograms.has(name)) {
      this.register({
        name,
        help: name,
        type: 'histogram',
        buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
      });
    }
    const labelKey = this.serializeLabels(labels);
    const store = this.histograms.get(name)!;
    if (!store.has(labelKey)) {
      store.set(labelKey, []);
    }
    store.get(labelKey)!.push(value);
  }

  /**
   * Retrieves current metric numeric value for assertions or health probes.
   */
  getMetricValue(name: string, labels: Record<string, string> = {}): number | undefined {
    const labelKey = this.serializeLabels(labels);
    if (this.counters.has(name)) {
      return this.counters.get(name)?.get(labelKey);
    }
    if (this.gauges.has(name)) {
      return this.gauges.get(name)?.get(labelKey);
    }
    return undefined;
  }

  /**
   * Exports all metrics into official Prometheus standard exposition text format.
   */
  toPrometheusText(): string {
    const lines: string[] = [];

    for (const [name, def] of this.definitions) {
      lines.push(`# HELP ${name} ${def.help}`);
      lines.push(`# TYPE ${name} ${def.type}`);

      if (def.type === 'counter') {
        const store = this.counters.get(name);
        if (store) {
          for (const [labelStr, val] of store) {
            lines.push(`${name}${labelStr ? `{${labelStr}}` : ''} ${val}`);
          }
        }
      } else if (def.type === 'gauge') {
        const store = this.gauges.get(name);
        if (store) {
          for (const [labelStr, val] of store) {
            lines.push(`${name}${labelStr ? `{${labelStr}}` : ''} ${val}`);
          }
        }
      } else if (def.type === 'histogram') {
        const store = this.histograms.get(name);
        if (store) {
          const buckets = def.buckets || [100, 500, 1000, 5000];
          for (const [labelStr, samples] of store) {
            const prefix = labelStr ? `${labelStr},` : '';
            for (const le of buckets) {
              const count = samples.filter((s) => s <= le).length;
              lines.push(`${name}_bucket{${prefix}le="${le}"} ${count}`);
            }
            lines.push(`${name}_bucket{${prefix}le="+Inf"} ${samples.length}`);
            const sum = samples.reduce((acc, curr) => acc + curr, 0);
            lines.push(`${name}_sum{${labelStr ? `${labelStr}` : ''}} ${sum}`);
            lines.push(`${name}_count{${labelStr ? `${labelStr}` : ''}} ${samples.length}`);
          }
        }
      }
    }

    return lines.join('\n') + '\n';
  }

  private registerDefaultMetrics(): void {
    this.register({
      name: 'digiport_api_requests_total',
      help: 'Total count of API requests handled by DigiPort',
      type: 'counter',
    });
    this.register({
      name: 'digiport_platform_mutations_total',
      help: 'Total count of mutating actions sent to ad platforms',
      type: 'counter',
    });
    this.register({
      name: 'digiport_errors_total',
      help: 'Total count of runtime and platform exceptions',
      type: 'counter',
    });
    this.register({
      name: 'digiport_active_campaigns',
      help: 'Number of active ad campaigns across platforms',
      type: 'gauge',
    });
    this.register({
      name: 'digiport_system_uptime_seconds',
      help: 'DigiPort universal OS process uptime in seconds',
      type: 'gauge',
    });
    this.register({
      name: 'digiport_workflow_execution_duration_ms',
      help: 'Execution duration of automated workflow DAGs in milliseconds',
      type: 'histogram',
    });
  }

  private serializeLabels(labels: Record<string, string>): string {
    const keys = Object.keys(labels).sort();
    if (keys.length === 0) return '';
    return keys.map((k) => `${k}="${labels[k]}"`).join(',');
  }
}
