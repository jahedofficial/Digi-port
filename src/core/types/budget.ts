import { Platform } from './account';

export interface UnifiedBudget {
  id: string;
  workspaceId: string;
  platform: Platform;
  currency: string;
  dailySpendCap: number;
  currentDailySpend: number;
  monthlySpendCap: number;
  currentMonthlySpend: number;
  maxScalingPercentPerDay: number; // e.g. 20 (meaning 20%)
  autoGuardEnabled: boolean; // Emergency stop if CPA spikes
  emergencyCpaThreshold: number;
  updatedAt: Date;
}
