'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  Flame, 
  TrendingUp,
  Search,
  Video,
  Heart,
  Smartphone,
  Coins,
  Sparkles,
  ShieldCheck,
  Sliders,
  Zap
} from 'lucide-react';

interface TikTokAdsIntelligenceDashboardProps {
  theme: 'light' | 'dark';
  hasActiveData?: boolean;
  onOpenHub?: () => void;
  accountName?: string;
  accountId?: string;
}

export const TikTokAdsIntelligenceDashboard: React.FC<TikTokAdsIntelligenceDashboardProps> = ({
  theme,
  hasActiveData = false, // Default matches user screenshot (Initial / Connected Empty State)
  onOpenHub,
  accountName = 'TikTok Ads (Not connected)',
  accountId = '',
}) => {
  const isLight = theme === 'light';
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 days');
  const [searchCampaignQuery, setSearchCampaignQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const activeDataMode = hasActiveData;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 700);
  };

  const data = activeDataMode ? {
    spend: 320.00,
    conversions: 40,
    cpa: 8.00,
    roas: 2.80,
    impressions: 93000,
    clicks: 2150,
    cpc: 0.1488,
    winners: {
      topPlacement: 'TikTok For You Feed',
      topPlacementSub: '68% Video Plays',
      bestAge: '18-24',
      bestAgeSub: '41.2% Hook Rate',
      topObjective: 'Conversions (Spark UGC)',
      topObjectiveSub: '3.25x ROAS',
      bestCreative: 'TikTok_TryOn_GetReadyWithMe',
      bestCreativeSub: 'Viral Hook Winner',
    },
    funnel: {
      videoViews: '54,000',
      views2s: '38,200',
      views6s: '22,400',
      convRate: '2.43%',
    },
    engagement: {
      likes: '8,420',
      comments: '620',
      shares: '310',
      ctr: '2.31%',
    },
    reachVolume: {
      impressions: '93,000',
      totalClicks: '2,150',
      totalRevenue: '$896.00',
      avgFrequency: '1.42',
    },
    signals: {
      mvpCreative: 'TikTok_TryOn_GetReadyWithMe',
      underperformer: 'TikTok_InFeed_SilkSaree_Offer',
    },
    dailyDynamics: [
      { date: '2026-09-28', spend: 45.00, sales: 135.00, roas: 3.00 },
      { date: '2026-09-29', spend: 50.00, sales: 145.00, roas: 2.90 },
      { date: '2026-09-30', spend: 48.00, sales: 124.80, roas: 2.60 },
      { date: '2026-10-01', spend: 52.00, sales: 156.00, roas: 3.00 },
      { date: '2026-10-02', spend: 65.00, sales: 182.00, roas: 2.80 },
      { date: '2026-10-03', spend: 60.00, sales: 153.20, roas: 2.55 },
    ],
    campaigns: [
      { id: '1', name: 'TikTok_Spark_UGC_GenZ_Lifestyle', status: 'ACTIVE', spend: 210.00, orders: 29, revenue: 682.50, roas: 3.25 },
      { id: '2', name: 'TikTok_InFeed_SilkSaree_Offer', status: 'ACTIVE', spend: 110.00, orders: 11, revenue: 236.50, roas: 2.15 },
    ],
    ageGroup: [
      { group: '18-24', spend: 192.00, conv: 27, cpa: 7.11, roas: 3.10 },
      { group: '25-34', spend: 102.40, conv: 11, cpa: 9.30, roas: 2.40 },
      { group: '35-44', spend: 25.60, conv: 2, cpa: 12.80, roas: 1.90 },
    ],
    genderSplit: [
      { group: 'Female', spend: 272.00, conv: 36, cpa: 7.55, roas: 2.95 },
      { group: 'Male', spend: 48.00, conv: 4, cpa: 12.00, roas: 1.95 },
    ],
    region: [
      { group: 'Dhaka Division', spend: 211.20, conv: 28, cpa: 7.54, roas: 3.00 },
      { group: 'Chittagong', spend: 64.00, conv: 7, cpa: 9.14, roas: 2.50 },
      { group: 'Other Divisions', spend: 44.80, conv: 5, cpa: 8.96, roas: 2.30 },
    ],
    placement: [
      { group: 'TikTok In-Feed FYP', spend: 256.00, conv: 34, cpa: 7.52, roas: 2.95 },
      { group: 'Pangle Network', spend: 64.00, conv: 6, cpa: 10.66, roas: 2.20 },
    ],
    adFormat: [
      { group: 'Spark Ads (UGC)', spend: 210.00, conv: 29, cpa: 7.24, roas: 3.25 },
      { group: 'In-Feed Video Ads', spend: 110.00, conv: 11, cpa: 10.00, roas: 2.15 },
    ],
    device: [
      { group: 'Mobile (Android)', spend: 224.00, conv: 28, cpa: 8.00, roas: 2.75 },
      { group: 'Mobile (iOS)', spend: 96.00, conv: 12, cpa: 8.00, roas: 2.90 },
    ],
  } : {
    spend: 0.00,
    conversions: 0,
    cpa: 0.00,
    roas: 0.00,
    impressions: 0,
    clicks: 0,
    cpc: 0.0000,
    winners: {
      topPlacement: '—',
      topPlacementSub: 'No data',
      bestAge: '—',
      bestAgeSub: 'No data',
      topObjective: '—',
      topObjectiveSub: 'No data',
      bestCreative: '—',
      bestCreativeSub: 'No data',
    },
    funnel: {
      videoViews: '0',
      views2s: '0',
      views6s: '0',
      convRate: '0.00%',
    },
    engagement: {
      likes: '0',
      comments: '0',
      shares: '0',
      ctr: '0.00%',
    },
    reachVolume: {
      impressions: '0',
      totalClicks: '0',
      totalRevenue: '$0.00',
      avgFrequency: '0.00',
    },
    signals: {
      mvpCreative: '—',
      underperformer: '—',
    },
    dailyDynamics: [],
    campaigns: [],
    ageGroup: [],
    genderSplit: [],
    region: [],
    placement: [],
    adFormat: [],
    device: [],
  };

  // Exact dark mood palette matching user screenshot:
  // Body dark: #0a0d14, Card dark: #121620, Border dark: #1b2230
  const cardBg = isLight 
    ? 'bg-white border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' 
    : 'bg-[#121620] border-[#1b2230] shadow-sm';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputBg = isLight 
    ? 'bg-white border-slate-200 text-slate-700' 
    : 'bg-[#0a0d14] border-[#1e2638] text-slate-300';
  const innerBoxBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-[#0a0d14] border-[#1b212f]';

  return (
    <div className="space-y-4">
      {/* 1. Header Card: Creative performance engine */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg} shadow-sm relative`}>
        {/* Ambient brand glow */}
        <div className="absolute top-0 right-0 w-96 h-36 bg-gradient-to-bl from-rose-500/10 via-cyan-400/5 to-transparent pointer-events-none" />

        {/* Signature TikTok Neon Brand Bar (Cyan to Rose to Purple) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#7856FF]" />

        <div className="p-3.5 sm:p-5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Authentic TikTok Logo Squircle */}
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-black border border-slate-800 flex items-center justify-center shrink-0 shadow-md shadow-black/30 relative">
                <svg className="h-5 w-5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002-.003a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 6.271 6.341 6.341 0 0 0 6.341 6.341c3.5 0 6.341-2.84 6.341-6.341V8.754a8.275 8.275 0 0 0 4.85 1.563V6.86a4.838 4.838 0 0 1-1.905-.174z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className={`text-sm sm:text-base font-bold tracking-tight whitespace-nowrap ${textTitle}`}>
                    TikTok Ads
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 px-1.5 sm:px-2 py-0.5 text-[9px] font-semibold whitespace-nowrap shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Spark Ads
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">ID: {accountId || 'adv_692810491028'}</span>
                  <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
                  <span className="text-emerald-500 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenHub || (() => { window.location.href = '/api/auth/tiktok/start'; })}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition-all shadow-xs w-full sm:w-auto ${
                  isLight
                    ? 'bg-slate-950 hover:bg-black text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-900'
                }`}
                title="Connect TikTok Ads account"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Connect TikTok Ads</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </button>
            </div>
          </div>

          <div className={`mt-2.5 pt-2 border-t flex items-center justify-between gap-2 text-[10px] sm:text-[11px] ${
            isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-400'
          }`}>
            <span className="truncate">Events API v1.3 • Spark Video Funnel</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sync 2h
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 cards matching screenshot) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total spend */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="h-6 w-6 rounded-full bg-black border border-slate-800 text-white flex items-center justify-center shrink-0">
              <Clock className="h-3 w-3" />
            </div>
            <span className="rounded bg-slate-100 dark:bg-[#1a2130] px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              SPEND
            </span>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-slate-400">
            Total spend
          </div>
          <div className={`mt-0.5 text-2xl font-black ${textTitle}`}>
            ${data.spend.toFixed(2)}
          </div>
        </div>

        {/* Card 2: Conversions */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="h-6 w-6 rounded-full bg-black border border-slate-800 text-white flex items-center justify-center shrink-0">
              <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
            </div>
            <span className="rounded bg-slate-100 dark:bg-[#1a2130] px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              CONV
            </span>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-slate-400">
            Conversions
          </div>
          <div className={`mt-0.5 text-2xl font-black ${textTitle}`}>
            {data.conversions}
          </div>
        </div>

        {/* Card 3: Cost / conversion */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="h-6 w-6 rounded-full bg-black border border-slate-800 text-white flex items-center justify-center shrink-0">
              <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
            </div>
            <span className="rounded bg-slate-100 dark:bg-[#1a2130] px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              CPA INDEX
            </span>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-slate-400">
            Cost / conversion
          </div>
          <div className={`mt-0.5 text-2xl font-black ${textTitle}`}>
            ${data.cpa.toFixed(2)}
          </div>
        </div>

        {/* Card 4: Blended ROAS (Cyan to Blue to Magenta/Pink gradient card with PROFIT ENGINE) */}
        <div className="rounded-xl border border-transparent bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#ec4899] p-4 shadow-md text-white">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-4 w-4 text-white" />
            <span className="rounded bg-black/30 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
              PROFIT ENGINE
            </span>
          </div>
          <div className="mt-3 text-[11px] font-medium text-white/90">
            Blended ROAS
          </div>
          <div className="mt-0.5 text-2xl font-black tracking-tight text-white">
            {data.roas.toFixed(2)}x
          </div>
        </div>
      </div>

      {/* 3. Creative and audience winners (4 cards with Pink headers) */}
      <div className="space-y-2">
        <div className={`flex items-center gap-1.5 text-xs font-bold ${textTitle}`}>
          <span className="text-amber-500 text-sm">⏳</span>
          <span>Creative and audience winners</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOP PLACEMENT */}
          <div className={`rounded-xl border p-3 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#f43f5e]">
              TOP PLACEMENT
            </div>
            <div className={`mt-1 text-xs font-bold truncate ${textTitle}`}>
              {data.winners.topPlacement}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#f43f5e] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" />
              <span>{data.winners.topPlacementSub}</span>
            </div>
          </div>

          {/* BEST AGE RANGE */}
          <div className={`rounded-xl border p-3 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#f43f5e]">
              BEST AGE RANGE
            </div>
            <div className={`mt-1 text-xs font-bold truncate ${textTitle}`}>
              {data.winners.bestAge}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#f43f5e] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" />
              <span>{data.winners.bestAgeSub}</span>
            </div>
          </div>

          {/* TOP OBJECTIVE */}
          <div className={`rounded-xl border p-3 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#f43f5e]">
              TOP OBJECTIVE
            </div>
            <div className={`mt-1 text-xs font-bold truncate ${textTitle}`}>
              {data.winners.topObjective}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#f43f5e] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" />
              <span>{data.winners.topObjectiveSub}</span>
            </div>
          </div>

          {/* BEST CREATIVE */}
          <div className={`rounded-xl border p-3 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#f43f5e]">
              BEST CREATIVE
            </div>
            <div className={`mt-1 text-xs font-bold truncate ${textTitle}`}>
              {data.winners.bestCreative}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#f43f5e] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" />
              <span>{data.winners.bestCreativeSub}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Spend and ROAS dynamics + 3 Side Metric Cards */}
      <div className="grid gap-3.5 lg:grid-cols-12">
        {/* Left: Spend and ROAS dynamics */}
        <div className={`rounded-xl border p-4 lg:col-span-8 flex flex-col justify-between ${cardBg}`}>
          <div className={`text-xs font-semibold ${textTitle}`}>
            Spend and ROAS dynamics
          </div>

          <div className="my-auto py-10 flex items-center justify-center">
            {data.dailyDynamics.length === 0 ? (
              <div className={`w-full h-36 rounded-xl border flex items-center justify-center ${innerBoxBg}`}>
                <span className="text-xs text-slate-500 font-normal">
                  Chart data will appear when campaigns are active
                </span>
              </div>
            ) : (
              <div className="w-full space-y-2 text-xs">
                {data.dailyDynamics.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-lg p-2 border ${innerBoxBg}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-pink-500" />
                      <span className="font-mono text-xs">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-rose-500 font-semibold">Spend: ${item.spend.toFixed(2)}</span>
                      <span>Sales: ${item.sales.toFixed(2)}</span>
                      <span className="font-bold text-pink-600 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded border border-pink-200 dark:border-pink-500/30">
                        {item.roas.toFixed(2)}x ROAS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: 3 Metric Cards */}
        <div className="space-y-2.5 lg:col-span-4 flex flex-col justify-between">
          {/* Impressions */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="text-[11px] font-normal text-slate-400">
              Impressions
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#8b3a2b]" />
              <span className={`text-xl font-bold ${textTitle}`}>
                {data.impressions}
              </span>
            </div>
          </div>

          {/* Total clicks */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="text-[11px] font-normal text-slate-400">
              Total clicks
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              <span className={`text-xl font-bold ${textTitle}`}>
                {data.clicks}
              </span>
            </div>
          </div>

          {/* Avg CPC */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="text-[11px] font-normal text-slate-400">
              Avg CPC
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Coins className="h-4 w-4 text-slate-400" />
              <span className={`text-xl font-bold ${textTitle}`}>
                ${data.cpc.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Three Cards: VIDEO FUNNEL, AD ENGAGEMENT, REACH AND VOLUME */}
      <div className="grid gap-3.5 md:grid-cols-3">
        {/* VIDEO FUNNEL */}
        <div className={`rounded-xl border p-4 flex flex-col justify-between ${cardBg}`}>
          <div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border border-pink-300 dark:border-pink-800 text-pink-500 flex items-center justify-center shrink-0">
                <Video className="h-2.5 w-2.5" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>
                VIDEO FUNNEL
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Video views</span>
                <span className={`font-semibold ${textTitle}`}>{data.funnel.videoViews}</span>
              </div>
              <div className="flex justify-between">
                <span>2 sec views</span>
                <span className={`font-semibold ${textTitle}`}>{data.funnel.views2s}</span>
              </div>
              <div className="flex justify-between">
                <span>6 sec views</span>
                <span className={`font-semibold ${textTitle}`}>{data.funnel.views6s}</span>
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-2 border-t flex justify-between text-xs font-bold text-[#f43f5e] ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
            <span>Conv rate</span>
            <span>{data.funnel.convRate}</span>
          </div>
        </div>

        {/* AD ENGAGEMENT */}
        <div className={`rounded-xl border p-4 flex flex-col justify-between ${cardBg}`}>
          <div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border border-pink-300 dark:border-pink-800 text-pink-500 flex items-center justify-center shrink-0">
                <Heart className="h-2.5 w-2.5" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>
                AD ENGAGEMENT
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Likes</span>
                <span className={`font-semibold ${textTitle}`}>{data.engagement.likes}</span>
              </div>
              <div className="flex justify-between">
                <span>Comments</span>
                <span className={`font-semibold ${textTitle}`}>{data.engagement.comments}</span>
              </div>
              <div className="flex justify-between">
                <span>Shares</span>
                <span className={`font-semibold ${textTitle}`}>{data.engagement.shares}</span>
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-2 border-t flex justify-between text-xs font-bold text-[#f43f5e] ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
            <span>CTR</span>
            <span>{data.engagement.ctr}</span>
          </div>
        </div>

        {/* REACH AND VOLUME */}
        <div className={`rounded-xl border p-4 flex flex-col justify-between ${cardBg}`}>
          <div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border border-pink-300 dark:border-pink-800 text-pink-500 flex items-center justify-center shrink-0">
                <Smartphone className="h-2.5 w-2.5" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>
                REACH AND VOLUME
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Impressions</span>
                <span className={`font-semibold ${textTitle}`}>{data.reachVolume.impressions}</span>
              </div>
              <div className="flex justify-between">
                <span>Total clicks</span>
                <span className={`font-semibold ${textTitle}`}>{data.reachVolume.totalClicks}</span>
              </div>
              <div className="flex justify-between">
                <span>Total revenue</span>
                <span className={`font-semibold ${textTitle}`}>{data.reachVolume.totalRevenue}</span>
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-2 border-t flex justify-between text-xs font-bold text-[#f43f5e] ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
            <span>Avg frequency</span>
            <span>{data.reachVolume.avgFrequency}</span>
          </div>
        </div>
      </div>

      {/* 6. Breakdown by period & Creative analytics */}
      <div className="grid gap-3.5 md:grid-cols-2">
        {/* Breakdown by period */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className={`text-xs font-semibold ${textTitle}`}>
            Breakdown by period
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-2 font-semibold">DATE</th>
                  <th className="pb-2 font-semibold">SPEND</th>
                  <th className="pb-2 font-semibold">SALES</th>
                  <th className="pb-2 font-semibold text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.dailyDynamics.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-xs text-slate-500">
                      No daily data
                    </td>
                  </tr>
                ) : (
                  data.dailyDynamics.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="py-2 font-mono">{d.date}</td>
                      <td className="py-2 font-semibold text-rose-500">${d.spend.toFixed(2)}</td>
                      <td className="py-2">${d.sales.toFixed(2)}</td>
                      <td className="py-2 text-right font-bold text-pink-600">{d.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Creative analytics */}
        <div className={`rounded-xl border p-4 space-y-3 flex flex-col justify-between ${cardBg}`}>
          <div className={`text-xs font-semibold ${textTitle}`}>
            Creative analytics
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#134232] bg-[#0a1f18] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#34d399]">
                MVP CREATIVE
              </div>
              <div className="mt-1 text-sm font-bold text-[#34d399]">
                {data.signals.mvpCreative}
              </div>
            </div>
            <div className="rounded-xl border border-[#4d1d24] bg-[#251014] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#f87171]">
                UNDERPERFORMER
              </div>
              <div className="mt-1 text-sm font-bold text-[#f87171]">
                {data.signals.underperformer}
              </div>
            </div>
          </div>
          <div className="py-3 text-center text-xs text-slate-500">
            {activeDataMode ? 'Active TikTok Ads Performance Monitoring' : 'No ad data'}
          </div>
        </div>
      </div>

      {/* 7. Campaigns Section */}
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        <div className={`p-3.5 border-b flex items-center justify-between ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
          <div className={`text-xs font-semibold ${textTitle}`}>
            Campaigns ({data.campaigns.length})
          </div>
          <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs ${inputBg}`}>
            <Search className="h-3 w-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchCampaignQuery}
              onChange={(e) => setSearchCampaignQuery(e.target.value)}
              className="bg-transparent text-xs focus:outline-none w-28 placeholder-slate-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`text-[10px] text-slate-500 uppercase border-b ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
              <tr>
                <th className="px-4 py-2.5 font-semibold">STATUS</th>
                <th className="px-4 py-2.5 font-semibold">CAMPAIGN</th>
                <th className="px-4 py-2.5 font-semibold">SPEND</th>
                <th className="px-4 py-2.5 font-semibold">ORDERS</th>
                <th className="px-4 py-2.5 font-semibold">REVENUE</th>
                <th className="px-4 py-2.5 font-semibold">ROAS</th>
                <th className="px-4 py-2.5 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
              {data.campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-500">
                    No campaign data
                  </td>
                </tr>
              ) : (
                data.campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        {camp.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${textTitle}`}>{camp.name}</td>
                    <td className="px-4 py-3 font-medium">${camp.spend.toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold">{camp.orders}</td>
                    <td className="px-4 py-3 font-bold text-emerald-500">${camp.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3 font-black text-pink-500">{camp.roas.toFixed(2)}x</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-slate-400 text-xs">Manage</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Six TikTok Breakdown Tables (2x3 Grid with Cyan Left Accent Border) */}
      <div className="grid gap-3.5 md:grid-cols-3">
        {/* 1. AGE GROUP */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            AGE GROUP
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">GROUP</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-[#f43f5e]">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.ageGroup.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-[11px] text-slate-500">No data</td></tr>
                ) : (
                  data.ageGroup.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold">{r.group}</td>
                      <td className="py-1">${r.spend.toFixed(0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1">${r.cpa.toFixed(0)}</td>
                      <td className="py-1 text-right font-bold text-pink-500">{r.roas > 0 ? `${r.roas.toFixed(2)}x` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. GENDER SPLIT */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            GENDER SPLIT
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">GROUP</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-[#f43f5e]">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.genderSplit.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-[11px] text-slate-500">No data</td></tr>
                ) : (
                  data.genderSplit.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold">{r.group}</td>
                      <td className="py-1">${r.spend.toFixed(0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1">${r.cpa.toFixed(0)}</td>
                      <td className="py-1 text-right font-bold text-pink-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. REGION */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            REGION
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">GROUP</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-[#f43f5e]">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.region.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-[11px] text-slate-500">No data</td></tr>
                ) : (
                  data.region.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold">{r.group}</td>
                      <td className="py-1">${r.spend.toFixed(0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1">${r.cpa.toFixed(0)}</td>
                      <td className="py-1 text-right font-bold text-pink-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. PLACEMENT (TIKTOK / PANGLE) */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            PLACEMENT (TIKTOK / PANGLE)
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">GROUP</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-[#f43f5e]">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.placement.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-[11px] text-slate-500">No data</td></tr>
                ) : (
                  data.placement.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold">{r.group}</td>
                      <td className="py-1">${r.spend.toFixed(0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1">${r.cpa.toFixed(0)}</td>
                      <td className="py-1 text-right font-bold text-pink-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. AD FORMAT (IN-FEED / TOPVIEW / SPARK) */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            AD FORMAT (IN-FEED / TOPVIEW / SPARK)
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">GROUP</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-[#f43f5e]">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.adFormat.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-[11px] text-slate-500">No data</td></tr>
                ) : (
                  data.adFormat.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold">{r.group}</td>
                      <td className="py-1">${r.spend.toFixed(0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1">${r.cpa.toFixed(0)}</td>
                      <td className="py-1 text-right font-bold text-pink-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. DEVICE */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            DEVICE
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">GROUP</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-[#f43f5e]">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.device.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-[11px] text-slate-500">No data</td></tr>
                ) : (
                  data.device.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold">{r.group}</td>
                      <td className="py-1">${r.spend.toFixed(0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1">${r.cpa.toFixed(0)}</td>
                      <td className="py-1 text-right font-bold text-pink-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
