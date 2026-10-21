export interface IConfigurationManager {
  get<T = string>(key: string, defaultValue?: T): T;
  getNumber(key: string, defaultValue?: number): number;
  getBoolean(key: string, defaultValue?: boolean): boolean;
  has(key: string): boolean;
  validateRequired(keys: string[]): { valid: boolean; missing: string[] };
}
