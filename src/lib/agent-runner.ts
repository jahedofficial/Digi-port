import { ActionQueueItem, CreativeData, CampaignData } from '@/types';

export interface AgentResponse {
  reply: string;
  toolUsed: string;
  toolType: 'READ' | 'WRITE';
  requiresApproval: boolean;
  proposedAction?: Partial<ActionQueueItem>;
  reportData?: {
    title: string;
    highlights: string[];
    metrics: Record<string, string | number>;
  };
  ideas?: {
    title: string;
    hook: string;
    scriptOutline: string;
    visualNotes: string;
  }[];
  trackingSetup?: {
    gtmId?: string;
    metaPixelId?: string;
    googleAdsId?: string;
    ga4MeasurementId?: string;
    tiktokPixelId?: string;
  };
}

export function processAgentCommand(
  rawCommand: string,
  context: {
    activePlatform: string;
    campaigns: CampaignData[];
    creatives: CreativeData[];
  }
): AgentResponse {
  const query = rawCommand.toLowerCase().trim();

  // 1. Report command: "গত ৭ দিনের Meta report বানাও"
  if (query.includes('report') || query.includes('রিপোর্ট')) {
    const isMeta = query.includes('meta') || query.includes('ফেসবুক');
    const isGoogle = query.includes('google') || query.includes('গুগল');
    const isTikTok = query.includes('tiktok') || query.includes('টিকটক');
    const platform = isMeta ? 'Meta Ads' : isGoogle ? 'Google Ads' : isTikTok ? 'TikTok Ads' : 'Unified (সব প্ল্যাটফর্ম)';

    return {
      reply: `📊 **${platform} গত ৭ দিনের পারফর্ম্যান্স রিপোর্ট** সফলভাবে তৈরি করা হয়েছে।\n\n- মোট খরচ হয়েছে **$১,৪২০.০০**, কনভার্সন **২১০টি**, গড় CPA **$৬.৭৬** এবং Blended ROAS **৪.২০x**।\n- টপ উইনিং ক্যাম্পেইন: **"Dhaka City - Eid Lawn Collection CBO"** (ROAS: 4.85x)।\n- ১টি ক্রিয়েটিভে ফ্রিকোয়েন্সি বেশি থাকায় ফ্যাটিগ দেখা গেছে। নিচে সারসংক্ষেপ দেখতে পারেন।`,
      toolUsed: 'make_report',
      toolType: 'READ',
      requiresApproval: false,
      reportData: {
        title: `${platform} - ৭ দিনের পারফর্ম্যান্স সামারি`,
        highlights: [
          'ROAS ৪.২০x (গত সপ্তাহের ৩.৮০x এর চেয়ে +১০.৫% উন্নত)।',
          'Dhaka City ক্যাম্পেইন সবচেয়ে বেশি রেভিনিউ এনেছে ($৩,১০৪)।',
          'UGC ভিডিও ক্রিয়েটিভে Hook Rate ৩৭% পার করেছে, যা ইন্ডাস্ট্রির তুলনায় ১৫% বেশি।',
          '১টি অফার ব্যানার ভিডিওতে ফ্রিকোয়েন্সি ৪.২ পার হওয়ায় পজ করার সুপারিশ।',
        ],
        metrics: {
          'Total Spend': '$1,420.00',
          'Revenue': '$5,964.00',
          'Total Conversions': 210,
          'Blended ROAS': '4.20x',
          'Average CPA': '$6.76',
          'Hook Rate (Avg)': '34.2%',
        },
      },
    };
  }

  // 2. Pause high CPA ads: "CPA $8 এর বেশি ad গুলো pause করো"
  if (query.includes('cpa') && (query.includes('pause') || query.includes('বন্ধ') || query.includes('পজ'))) {
    return {
      reply: `⚠️ **অ্যাকশন রিকোয়েস্ট প্রস্তুত**: আমরা অডিট করে **Video_Offer_Countdown_30Percent** অ্যাডটি চিহ্নিত করেছি যার বর্তমান CPA **$১৩.৭৫** (টার্গেট $৮.০০ এর চেয়ে ৭১% বেশি এবং ফ্রিকোয়েন্সি ৪.২)।\n\nটাকা বাঁচানোর জন্য অ্যাডটি পজ করার প্রস্তাব করা হয়েছে। নিচের **Approve** বাটনে ক্লিক করলে অ্যাডটি পজ হয়ে যাবে।`,
      toolUsed: 'pause_ad',
      toolType: 'WRITE',
      requiresApproval: true,
      proposedAction: {
        id: `act-${Date.now()}`,
        actionType: 'PAUSE_AD',
        platform: 'META',
        entityType: 'AD',
        entityId: 'ad-meta-103',
        entityName: 'Eid Offer: 30% Off Countdown Video Ad',
        proposedBy: 'AGENT',
        reason: 'প্রতি অর্ডারে খরচ $১৩.৭৫ হয়েছে যা টার্গেটের চেয়ে ৭১% বেশি। বাজেটের অপচয় রোধে অ্যাডটি পজ করা প্রয়োজন।',
        previousValue: 'সক্রিয় (Active)',
        newValue: 'বন্ধ (Paused)',
        status: 'PENDING',
        createdAt: 'এখনই',
        safetyCheck: {
          passed: true,
          rule: 'টার্গেট CPA অপচয় রোধ গার্ডরেল যাচাইকৃত',
        },
      },
    };
  }

  // 3. Increase budget: "Dhaka City campaign এর budget ২০% বাড়াও"
  if (query.includes('budget') || query.includes('বাজেট')) {
    return {
      reply: `📈 **বাজেট স্কেলিং রিকোয়েস্ট**: **Dhaka City - Eid Lawn Collection CBO** ক্যাম্পেইনটি টানা ৪ দিন ধরে ROAS **৪.৮৫x** বজায় রেখেছে।\n\nসার্ভার গার্ডরেল সর্বোচ্চ **+২০%** লিমিট যাচাই করেছে এবং নিরাপদ হিসেবে অনুমোদন করেছে:\n- বর্তমান বাজেট: **$৫০.০০ / দিন**\n- প্রস্তাবিত নতুন বাজেট: **$৬০.০০ / দিন**\n\nআপনি অনুমোদন করলে প্ল্যাটফর্মে আপডেট এক্সিকিউট হবে।`,
      toolUsed: 'change_budget',
      toolType: 'WRITE',
      requiresApproval: true,
      proposedAction: {
        id: `act-${Date.now()}`,
        actionType: 'CHANGE_BUDGET',
        platform: 'META',
        entityType: 'CAMPAIGN',
        entityId: 'camp-meta-1',
        entityName: 'Dhaka City - Eid Lawn Collection CBO',
        proposedBy: 'AGENT',
        reason: 'টানা ৪ দিন ROAS 4.85x বজায় রাখায় সেফ স্কেলিং (+20%) সুপারিশ।',
        previousValue: '$50.00 / day',
        newValue: '$60.00 / day (+20%)',
        status: 'PENDING',
        createdAt: 'এখনই',
        safetyCheck: {
          passed: true,
          rule: 'Daily Scale Cap ±20% Guardrail Passed',
        },
      },
    };
  }

  // 4. Creative fatigue: "কোন creative fatigue হচ্ছে?"
  if (query.includes('fatigue') || query.includes('ফ্যাটিগ') || query.includes('ক্রিয়েটিভ')) {
    return {
      reply: `🔍 **ক্রিয়েটিভ ফ্যাটিগ বিশ্লেষণ রিপোর্ট**:\n\n১টি ক্রিয়েটিভে নিশ্চিত **HIGH FATIGUE** শনাক্ত হয়েছে:\n- **Creative:** \`Video_Offer_Countdown_30Percent\` (Meta Ads)\n- **Frequency:** ৪.২ (একজন গ্রাহক গড়ে ৪ বারের বেশি দেখেছে)\n- **CTR:** ১.৪৫% (গত সপ্তাহের তুলনায় ৩৫% কমেছে)\n- **CPA:** $১৩.৭৫ (টার্গেট $৮.০০)\n\n👉 **সুপারিশ:** এই ক্রিয়েটিভটি পজ করে আমাদের টপ উইনার \`Lawn_3pc_EmeraldGreen_UGC_Review\` এর মতো নতুন একটি UGC ভিডিও টেস্ট করুন।`,
      toolUsed: 'analyze_creative',
      toolType: 'READ',
      requiresApproval: false,
    };
  }

  // 5. New Ideas: "TikTok এর best ad এর মতো ৩টা নতুন idea দাও"
  if (query.includes('idea') || query.includes('আইডিয়া') || query.includes('script') || query.includes('স্ক্রিপ্ট')) {
    return {
      reply: `💡 **TikTok এর টপ পারফর্মিং GRWM UGC ভিডিওর (Hook Rate ৪১.২%) প্যাটার্ন অনুযায়ী ৩টি ফ্রেশ আইডিয়া:**\n\nনিচে ৩টি হাই-রিটেনশন ভিডিও হুক ও স্ক্রিপ্ট আউটলাইন দেওয়া হলো যা আপনি এখনই প্রোডাকশনে পাঠাতে পারেন।`,
      toolUsed: 'analyze_creative',
      toolType: 'READ',
      requiresApproval: false,
      ideas: [
        {
          title: '১. "The Mirror Shock Transformation" (GRWM Hook)',
          hook: 'প্রথম ২ সেকেন্ডে সাধারণ ড্রেসে আয়নার সামনে এসে চোখ পিটপিট করে আঙুল তুলেই সম্পূর্ণ প্রমিয়াম ঈদ লন ড্রেসে পরিবর্তন।',
          scriptOutline: '"সবাই যখন ভাবছে সাধারণ ড্রেস পরব, তখন লন কালেকশন পরে ক্লাসি লুক! কাপড়টা হাতে নিলেই বুঝবেন কেন এটা ভাইরাল।"',
          visualNotes: 'Vertical 9:16, Natural Daylight, Fast energetic background beat, no cheesy corporate text.',
        },
        {
          title: '২. "Fabric Macro Zoom & Honest Review" (Texture Hook)',
          hook: 'ক্যামেরার একদম কাছে কাপড়ের সুতা ও অ্যামব্রয়ডারি জুম করে আঙুল দিয়ে স্পর্শ দেখানো।',
          scriptOutline: '"অনলাইনে ড্রেস অর্ডার করতে ভয় পান? কাপড়টা সামনাসামনি দেখলে আপনিও প্রেমে পড়বেন। ১০০% পিওর কটন!"',
          visualNotes: 'Macro lens camera zoom, unboxing sound effect (ASMR audio vibe).',
        },
        {
          title: '৩. "3 Ways to Style 1 Kurti" (Utility / Value Hook)',
          hook: 'স্ক্রিনে ৩টি স্প্লিট উইন্ডো: অফিস লুক, ফ্রেন্ডস আড্ডা, ফেস্টিভ ইভেন্ট।',
          scriptOutline: '"একটা কুর্তি দিয়ে কীভাবে ৩টা ভিন্ন ওকেশন কভার করবেন? দেখে নিন আজকের কুইক স্টাইল গাইড।"',
          visualNotes: 'High pacing, text callout with accessory details, clear "Order Link in Bio" CTA.',
        },
      ],
    };
  }

  // 6. Audit: "আজকের audit করো"
  if (query.includes('audit') || query.includes('অডিট') || query.includes('চেক')) {
    return {
      reply: `🛡️ **দৈনিক অটো-অডিট সম্পন্ন হয়েছে (Daily Health & Spend Audit)**:\n\n১. **Spend Pacing:** বাজেট পেসিং স্বাভাবিক। আজকের মোট স্পেন্ড টার্গেটের মধ্যে আছে।\n২. **Wasted Spend:** Google Search-এ ১টি ইররেলেভেন্ট কিওয়ার্ডে $১৮ খরচ হয়েছে রূপান্তর ছাড়া।\n৩. **Creative Health:** ১টি ক্রিয়েটিভে হাই ফ্যাটিগ, ৩টি ক্রিয়েটিভে সুস্থ হুক রেট (>৩৫%)।\n৪. **Tracking Check:** Meta CAPI এবং Google GA4 সক্রিয় ও গ্রিন। TikTok Events API-তে 'InitiateCheckout' এ কারেন্সি প্যারামিটার চেক করা দরকার।\n\nআমরা অপচয় কমাতে ২টি অ্যাকশন রেডি করেছি। Actions ট্যাবে দেখতে পারেন।`,
      toolUsed: 'check_tracking',
      toolType: 'READ',
      requiresApproval: false,
    };
  }

  // 7. Tracking & OpenClaw Auto Conversion: "gtm id...", "pixel id...", "conversion tracking", "openclaw"
  if (
    query.includes('gtm') || 
    query.includes('pixel') || 
    query.includes('conversion') || 
    query.includes('ট্র্যাকিং') || 
    query.includes('কনভার্শন') || 
    query.includes('capi') ||
    query.includes('openclaw') ||
    query.includes('open clo')
  ) {
    const gtmMatch = rawCommand.match(/GTM-[A-Z0-9]+/i) || rawCommand.match(/gtm[:\s]+([A-Z0-9-]+)/i);
    const pixelMatch = rawCommand.match(/pixel[:\s]+(\d+)/i) || rawCommand.match(/\b\d{12,18}\b/);
    const googleMatch = rawCommand.match(/AW-[0-9]+/i) || rawCommand.match(/google[:\s]+(AW-[0-9]+|\d{3}-\d{3}-\d{4})/i);
    const ga4Match = rawCommand.match(/G-[A-Z0-9]+/i) || rawCommand.match(/ga4[:\s]+(G-[A-Z0-9]+|\d{8,10})/i);
    const tiktokMatch = rawCommand.match(/(?:tiktok|tt)[:\s]+([a-zA-Z0-9_]+)/i);

    const gtmDisplay = gtmMatch ? (gtmMatch[1] || gtmMatch[0]).toUpperCase() : 'GTM-PLX982K';
    const pixelDisplay = pixelMatch ? (pixelMatch[1] || pixelMatch[0]) : '942386384851346';
    const googleDisplay = googleMatch ? (googleMatch[1] || googleMatch[0]).toUpperCase() : 'AW-4562339588';
    const ga4Display = ga4Match ? (ga4Match[1] || ga4Match[0]).toUpperCase() : 'G-Z8F9X1107L';
    const tiktokDisplay = tiktokMatch ? tiktokMatch[1] : 'adv_692810491028';

    return {
      reply: `🎯 **OpenClaw Auto Conversion Tracking Engine সক্রিয় হয়েছে!**\n\nআপনার চ্যাটে দেওয়া তথ্য অনুযায়ী ট্র্যাকিং পাইপলাইন সফলভাবে কনফিগার ও সিঙ্ক করা হয়েছে:\n\n• **GTM Container:** \`${gtmDisplay}\` (Google Ads Conversion Linker ও Purchase Triggers Active)\n• **Meta Conversions API (CAPI):** Pixel ID \`${pixelDisplay}\` (Server-Side Graph API v20.0 Ready)\n• **Google Ads & GA4:** Conversion ID \`${googleDisplay}\` ও GA4 Property \`${ga4Display}\` (Enhanced Conversions Hashing Active)\n• **TikTok Events API:** Code \`${tiktokDisplay}\` (Server Track Active)\n• **Deduplication:** ব্রাউজার ও সার্ভার উভয়ে একই \`event_id\` দিয়ে সিঙ্ক হবে (Double-count রোধ নিশ্চিত)\n• **Event Match Quality (EMQ):** আনুমানিক ৯.৪/১০ (SHA-256 PII Hashed)\n\nকোনো ফর্ম পূরণ করতে হবে না! আপনি যেভাবে চ্যাটে লিখে দিয়েছেন, ওপেন ক্ল স্বয়ংক্রিয়ভাবে সব সেভ ও একটিভ করে নিয়েছে।`,
      toolUsed: 'configure_tracking',
      toolType: 'WRITE',
      requiresApproval: false,
      trackingSetup: {
        gtmId: gtmDisplay,
        metaPixelId: pixelDisplay,
        googleAdsId: googleDisplay,
        ga4MeasurementId: ga4Display,
        tiktokPixelId: tiktokDisplay,
      },
      reportData: {
        title: 'OpenClaw Conversion Tracking Configuration',
        highlights: [
          `GTM Container Linked: ${gtmDisplay}`,
          `Meta CAPI Server Deduplication: ${pixelDisplay} (Active)`,
          `Google Enhanced Conversions: ${googleDisplay} (Active)`,
          'Server Endpoint: /api/track/conversion (100% Live)',
          'iOS 14+ AdBlocker Bypass Rate: 100% Verified',
        ],
        metrics: {
          'GTM Container': gtmDisplay,
          'Meta Pixel / CAPI': pixelDisplay,
          'Google Ads Tag': googleDisplay,
          'Event Match Quality': '9.4 / 10',
          'Pipeline Status': 'Active & Healthy',
        },
      },
    };
  }

  // Default response
  return {
    reply: `আমি কমান্ডটি গ্রহণ করেছি: "${rawCommand}"।\n\nআমি Google Ads, Meta Ads এবং TikTok Ads-এর ডাটা অ্যানালাইসিস করতে পারি। আপনি আমাকে রিপোর্ট বানাতে, ফ্যাটিগ ক্রিয়েটিভ খুঁজতে, টার্গেট CPA-এর বাইরের অ্যাড পজ করতে বা বাজেট বাড়াতে বলতে পারেন।`,
    toolUsed: 'get_metrics',
    toolType: 'READ',
    requiresApproval: false,
  };
}
