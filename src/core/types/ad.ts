import { Platform } from './account';

export type AdStatus = 'ACTIVE' | 'PAUSED' | 'DISAPPROVED' | 'ARCHIVED';

export type CreativeFormat = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'RESPONSIVE_SEARCH';

export interface UnifiedAd {
  id: string;
  adGroupId: string;
  platform: Platform;
  platformAdId: string;
  name: string;
  status: AdStatus;
  format: CreativeFormat;
  headline: string;
  secondaryHeadlines?: string[];
  bodyCopy: string;
  callToAction: string;
  destinationUrl: string;
  mediaUrls: string[];
  reviewStatus: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
