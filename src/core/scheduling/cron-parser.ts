import { ICronParser } from './types';

/**
 * Deterministic Pure-TypeScript 5-Field Cron Parser & Evaluator
 * Supports: wildcards (*), step values (* / 15), ranges (1-5), and lists (0,15,30).
 */
export class CronParser implements ICronParser {
  /**
   * Validate standard 5-field cron syntax
   */
  public validate(expression: string): boolean {
    if (!expression || typeof expression !== 'string') return false;
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return false;

    try {
      this.parseField(parts[0], 0, 59);
      this.parseField(parts[1], 0, 23);
      this.parseField(parts[2], 1, 31);
      this.parseField(parts[3], 1, 12);
      this.parseField(parts[4], 0, 7); // 0 or 7 is Sunday
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate next execution timestamp after fromDate
   */
  public getNextRun(expression: string, fromDate: Date = new Date()): Date {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error(`Invalid cron expression format: "${expression}"`);
    }

    const minutes = this.parseField(parts[0], 0, 59);
    const hours = this.parseField(parts[1], 0, 23);
    const daysOfMonth = this.parseField(parts[2], 1, 31);
    const months = this.parseField(parts[3], 1, 12);
    const daysOfWeek = this.parseField(parts[4], 0, 7);

    // Normalize Sunday: both 0 and 7 are treated as Sunday (0)
    const normalizedDaysOfWeek = new Set(
      Array.from(daysOfWeek).map((d) => (d === 7 ? 0 : d))
    );

    // Advance by 1 minute from fromDate to ensure strictly in the future (UTC based)
    const cursor = new Date(fromDate.getTime());
    cursor.setUTCSeconds(0, 0);
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);

    // Scan up to 366 days in 1-minute increments
    const maxMinutes = 366 * 24 * 60;
    let checked = 0;

    while (checked < maxMinutes) {
      const curMonth = cursor.getUTCMonth() + 1; // 1-12
      const curDay = cursor.getUTCDate(); // 1-31
      const curDow = cursor.getUTCDay(); // 0-6 (0 is Sunday)
      const curHour = cursor.getUTCHours(); // 0-23
      const curMin = cursor.getUTCMinutes(); // 0-59

      if (!months.has(curMonth)) {
        // Skip ahead to beginning of next month (UTC)
        cursor.setUTCMonth(cursor.getUTCMonth() + 1, 1);
        cursor.setUTCHours(0, 0, 0, 0);
        checked += 60;
        continue;
      }

      if (!daysOfMonth.has(curDay) || !normalizedDaysOfWeek.has(curDow)) {
        // Skip ahead to start of next day (UTC)
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        cursor.setUTCHours(0, 0, 0, 0);
        checked += 60;
        continue;
      }

      if (!hours.has(curHour)) {
        // Skip ahead to next hour (UTC)
        cursor.setUTCHours(cursor.getUTCHours() + 1, 0, 0, 0);
        checked += 60;
        continue;
      }

      if (minutes.has(curMin)) {
        return new Date(cursor.getTime());
      }

      cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
      checked++;
    }

    throw new Error(`Unable to determine next run within 366 days for cron: "${expression}"`);
  }

  /**
   * Determine whether a cron schedule is due given current time and last run time
   */
  public isDue(expression: string, lastRunAt?: Date, now: Date = new Date()): boolean {
    if (!lastRunAt) {
      // Never run before; check if current minute matches
      return this.matchesCurrentMinute(expression, now);
    }

    const nextExpected = this.getNextRun(expression, lastRunAt);
    return now.getTime() >= nextExpected.getTime();
  }

  private matchesCurrentMinute(expression: string, now: Date): boolean {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return false;

    const curMin = now.getUTCMinutes();
    const curHour = now.getUTCHours();
    const curDay = now.getUTCDate();
    const curMonth = now.getUTCMonth() + 1;
    const curDow = now.getUTCDay();

    const minutes = this.parseField(parts[0], 0, 59);
    const hours = this.parseField(parts[1], 0, 23);
    const daysOfMonth = this.parseField(parts[2], 1, 31);
    const months = this.parseField(parts[3], 1, 12);
    const daysOfWeek = this.parseField(parts[4], 0, 7);

    const dowSet = new Set(Array.from(daysOfWeek).map((d) => (d === 7 ? 0 : d)));

    return (
      minutes.has(curMin) &&
      hours.has(curHour) &&
      daysOfMonth.has(curDay) &&
      months.has(curMonth) &&
      dowSet.has(curDow)
    );
  }

  /**
   * Parse an individual cron field token into a Set of matching integers
   */
  private parseField(field: string, min: number, max: number): Set<number> {
    const result = new Set<number>();

    // Handle comma-separated lists: "1,2,5"
    const subParts = field.split(',');

    for (const part of subParts) {
      if (part === '*') {
        for (let i = min; i <= max; i++) result.add(i);
      } else if (part.includes('/')) {
        // Step syntax: "*/15" or "10-50/5"
        const [rangeStr, stepStr] = part.split('/');
        const step = parseInt(stepStr, 10);
        if (isNaN(step) || step <= 0) throw new Error(`Invalid step: ${stepStr}`);

        let start = min;
        let end = max;

        if (rangeStr !== '*') {
          if (rangeStr.includes('-')) {
            const [rStart, rEnd] = rangeStr.split('-').map((n) => parseInt(n, 10));
            start = rStart;
            end = rEnd;
          } else {
            start = parseInt(rangeStr, 10);
          }
        }

        for (let i = start; i <= end; i += step) {
          if (i >= min && i <= max) result.add(i);
        }
      } else if (part.includes('-')) {
        // Range syntax: "1-5"
        const [rStart, rEnd] = part.split('-').map((n) => parseInt(n, 10));
        if (isNaN(rStart) || isNaN(rEnd) || rStart > rEnd || rStart < min || rEnd > max) {
          throw new Error(`Invalid range: ${part}`);
        }
        for (let i = rStart; i <= rEnd; i++) result.add(i);
      } else {
        // Exact number: "15"
        const num = parseInt(part, 10);
        if (isNaN(num) || num < min || num > max) {
          throw new Error(`Invalid value: ${part} (must be between ${min} and ${max})`);
        }
        result.add(num);
      }
    }

    return result;
  }
}
