export interface ToolDefinition {
  name: string;
  type: 'READ' | 'WRITE';
  requiresApproval: boolean;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
}

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    name: 'get_metrics',
    type: 'READ',
    requiresApproval: false,
    description: 'Fetch real-time or historical spend, ROAS, CPA, conversions, CTR, and CPC for any platform or campaign.',
    parameters: [
      { name: 'platform', type: 'string', description: 'META | GOOGLE | TIKTOK | ALL', required: false },
      { name: 'dateRange', type: 'string', description: '7d | 14d | 30d | today | yesterday', required: false },
      { name: 'campaignName', type: 'string', description: 'Filter by campaign name', required: false },
    ],
  },
  {
    name: 'analyze_creative',
    type: 'READ',
    requiresApproval: false,
    description: 'Evaluate creative performance, 3s Hook Rate, Hold Rate, Frequency, and detect Creative Fatigue.',
    parameters: [
      { name: 'platform', type: 'string', description: 'META | TIKTOK', required: false },
      { name: 'filterFatiguedOnly', type: 'boolean', description: 'Only show fatigued creatives', required: false },
    ],
  },
  {
    name: 'make_report',
    type: 'READ',
    requiresApproval: false,
    description: 'Generate an executive performance report in Bengali or English with key highlights and next actions.',
    parameters: [
      { name: 'platform', type: 'string', description: 'META | GOOGLE | TIKTOK | ALL', required: false },
      { name: 'dateRange', type: 'string', description: 'e.g. last 7 days', required: false },
      { name: 'language', type: 'string', description: 'BN | EN', required: false },
    ],
  },
  {
    name: 'check_tracking',
    type: 'READ',
    requiresApproval: false,
    description: 'Audit tracking health, Pixel vs CAPI deduplication, GA4 Enhanced Conversions, and TikTok Events API.',
    parameters: [
      { name: 'platform', type: 'string', description: 'META | GOOGLE | TIKTOK | ALL', required: false },
    ],
  },
  {
    name: 'pause_ad',
    type: 'WRITE',
    requiresApproval: true,
    description: 'Pause an underperforming or fatigued ad to prevent budget waste. Creates an Approval Card.',
    parameters: [
      { name: 'adId', type: 'string', description: 'Ad identifier', required: true },
      { name: 'reason', type: 'string', description: 'Explanation for pause recommendation', required: true },
    ],
  },
  {
    name: 'enable_ad',
    type: 'WRITE',
    requiresApproval: true,
    description: 'Re-activate a previously paused ad. Creates an Approval Card.',
    parameters: [
      { name: 'adId', type: 'string', description: 'Ad identifier', required: true },
      { name: 'reason', type: 'string', description: 'Reason for enabling', required: true },
    ],
  },
  {
    name: 'change_budget',
    type: 'WRITE',
    requiresApproval: true,
    description: 'Adjust daily budget (strictly capped at max ±20% per day by server guardrail). Creates an Approval Card.',
    parameters: [
      { name: 'campaignId', type: 'string', description: 'Campaign identifier', required: true },
      { name: 'percentageChange', type: 'number', description: 'Percentage increase or decrease (-20 to +20)', required: true },
      { name: 'reason', type: 'string', description: 'Strategic reason for scale/cut', required: true },
    ],
  },
  {
    name: 'add_negative_keyword',
    type: 'WRITE',
    requiresApproval: true,
    description: 'Add wasteful search term to Google Ads negative keyword list to eliminate non-converting spend.',
    parameters: [
      { name: 'campaignId', type: 'string', description: 'Google Campaign ID', required: true },
      { name: 'keyword', type: 'string', description: 'Negative keyword phrase or exact match', required: true },
      { name: 'reason', type: 'string', description: 'Spend or relevance justification', required: true },
    ],
  },
  {
    name: 'configure_tracking',
    type: 'WRITE',
    requiresApproval: false,
    description: 'Configure GTM, Meta Pixel, Meta CAPI, Google Ads, and TikTok Events API conversion tracking pipeline.',
    parameters: [
      { name: 'gtmId', type: 'string', description: 'Google Tag Manager Container ID', required: false },
      { name: 'pixelId', type: 'string', description: 'Meta Pixel ID', required: false },
      { name: 'googleAdsId', type: 'string', description: 'Google Ads Conversion ID', required: false },
    ],
  },
  {
    name: 'test_conversion_tracking',
    type: 'READ',
    requiresApproval: false,
    description: 'Dispatch a simulated purchase conversion event to Meta CAPI, Google Enhanced, and TikTok APIs to verify tracking health and EMQ.',
    parameters: [
      { name: 'orderValue', type: 'number', description: 'Order value amount', required: false },
      { name: 'currency', type: 'string', description: 'BDT or USD', required: false },
    ],
  },
];
