import { IConfigurationManager } from '../interfaces/config.interface';

export class ConfigurationManager implements IConfigurationManager {
  private readonly envStore: Map<string, string>;

  constructor(customEnv?: Record<string, string | undefined>) {
    this.envStore = new Map<string, string>();
    const source = customEnv || process.env;

    for (const [key, value] of Object.entries(source)) {
      if (value !== undefined) {
        this.envStore.set(key, value);
      }
    }
  }

  get<T = string>(key: string, defaultValue?: T): T {
    const val = this.envStore.get(key);
    if (val !== undefined && val.trim().length > 0) {
      return val as unknown as T;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return '' as unknown as T;
  }

  getNumber(key: string, defaultValue = 0): number {
    const val = this.envStore.get(key);
    if (val !== undefined && val.trim().length > 0) {
      const parsed = Number(val);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return defaultValue;
  }

  getBoolean(key: string, defaultValue = false): boolean {
    const val = this.envStore.get(key);
    if (val !== undefined) {
      const lower = val.trim().toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes' || lower === 'enabled') {
        return true;
      }
      if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'disabled') {
        return false;
      }
    }
    return defaultValue;
  }

  has(key: string): boolean {
    const val = this.envStore.get(key);
    return val !== undefined && val.trim().length > 0;
  }

  set(key: string, value: string): void {
    this.envStore.set(key, value);
  }

  validateRequired(keys: string[]): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    for (const key of keys) {
      if (!this.has(key)) {
        missing.push(key);
      }
    }
    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
