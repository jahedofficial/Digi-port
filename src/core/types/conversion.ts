export type ConversionEventType = 
  | 'PURCHASE' 
  | 'LEAD' 
  | 'ADD_TO_CART' 
  | 'INITIATE_CHECKOUT' 
  | 'VIEW_CONTENT' 
  | 'COMPLETE_REGISTRATION';

export interface UnifiedConversionEvent {
  id: string;
  workspaceId: string;
  eventId: string; // Deduplication Key across browser pixel and server CAPI
  eventName: ConversionEventType;
  value: number;
  currency: string;
  userHashedEmail?: string; // SHA-256 lowercased
  userHashedPhone?: string; // SHA-256 E.164 formatted
  clientIpAddress?: string;
  clientUserAgent?: string;
  clickId?: {
    gclid?: string; // Google Click ID
    fbclid?: string; // Meta Click ID
    ttclid?: string; // TikTok Click ID
  };
  customData?: Record<string, unknown>;
  timestamp: Date;
}
