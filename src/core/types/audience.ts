import { Platform } from './account';

export type AudienceType = 'CUSTOM' | 'LOOKALIKE' | 'INTEREST' | 'RETARGETING' | 'IN_MARKET';

export interface UnifiedAudience {
  id: string;
  workspaceId: string;
  platform: Platform;
  platformAudienceId: string;
  name: string;
  type: AudienceType;
  approximateSize?: number;
  retentionDays?: number;
  definition?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
