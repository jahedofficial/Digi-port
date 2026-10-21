export type Platform = 'GOOGLE' | 'META' | 'TIKTOK';

export type AccountStatus = 'ACTIVE' | 'DISABLED' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface UnifiedAccount {
  id: string;
  workspaceId: string;
  platform: Platform;
  externalAccountId: string;
  name: string;
  currency: string;
  timezone: string;
  status: AccountStatus;
  isManagerAccount: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
