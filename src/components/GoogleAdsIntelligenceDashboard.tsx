'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Award, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Play, 
  Pause, 
  Settings, 
  Compass, 
  Layers, 
  Percent, 
  TrendingUp,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Ban,
  Plus
} from 'lucide-react';

import { CampaignData } from '@/types';

interface GoogleAdsIntelligenceDashboardProps {
  theme: 'light' | 'dark';
  hasActiveData?: boolean;
  onOpenHub?: () => void;
  accountName?: string;
  accountId?: string;
  currency?: 'BDT' | 'USD';
  campaigns?: CampaignData[];
  metrics?: any;
}

export const GoogleAdsIntelligenceDashboard: React.FC<GoogleAdsIntelligenceDashboardProps> = ({
  theme,
  hasActiveData = false,
  onOpenHub,
  accountName = 'Google Ads (Not connected)',
  accountId = '',
  currency: initialCurrency = 'USD',
  campaigns = [],
  metrics,
}) => {
  const isLight = theme === 'light';
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 days');
  const [searchCampaignQuery, setSearchCampaignQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const activeDataMode = hasActiveData;
  const [currency, setCurrency] = useState<'BDT' | 'USD'>(initialCurrency);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Exchange rate multiplier
  const rate = currency === 'BDT' ? 120 : 1;
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  const formatCurr = (valUsd: number, decimals: number = 2) => {
    const converted = valUsd * rate;
    if (currency === 'BDT') {
      return `৳${Math.round(converted).toLocaleString()}`;
    }
    return `$${converted.toFixed(decimals)}`;
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 700);
  };

  // Google Ads Comprehensive Data Set
  const data = activeDataMode ? {
    spend: 1840.50,
    conversions: 284,
    cpa: 6.48,
    roas: 4.82,
    revenue: 8871.20,
    impressions: 342000,
    clicks: 14820,
    cpc: 0.1242,
    ctr: '4.33%',
    winners: {
      topCampaign: 'BD_Search_Brand_Core (Sapphire & Lawn)',
      topCampaignSub: '6.10x ROAS • 124 Orders Attributed',
      bestCpa: 'PMax_High_Margin_Women_Fashion',
      bestCpaSub: '$5.20 CPA (Lowest Cost Per Order)',
      searchShare: '86.4% Top of Page Share',
      searchShareSub: 'Outranking Daraz & Yellow in Dhaka',
      topKeyword: '"fakeit premium oversized tee"',
      topKeywordSub: '58 Conversions • 5.40x ROAS',
    },
    quality: {
      avgQualityScore: '8.8 / 10',
      qualityTier: 'Excellent',
      expectedCtr: 'Above Average',
      adRelevance: 'Above Average',
      landingPageExp: 'Above Average',
      searchImprShare: '78.40%',
      lostIsBudget: '6.20%',
      lostIsRank: '7.40%',
    },
    campaignMix: [
      { name: 'Google Search (High Intent)', spend: 828.20, pct: 45, color: '#3b82f6', roas: 5.40 },
      { name: 'Performance Max (Omnichannel AI)', spend: 699.40, pct: 38, color: '#10b981', roas: 4.60 },
      { name: 'Google Shopping (Merchant Center)', spend: 220.80, pct: 12, color: '#f59e0b', roas: 3.90 },
      { name: 'YouTube & Demand Gen', spend: 92.10, pct: 5, color: '#ef4444', roas: 2.80 },
    ],
    auctionInsights: [
      { competitor: 'FAKEIT BD (Your Store)', imprShare: '78.4%', overlapRate: '—', outrankingShare: '—', isYou: true },
      { competitor: 'Daraz Fashion BD', imprShare: '54.2%', overlapRate: '68.5%', outrankingShare: '64.2%', isYou: false },
      { competitor: 'Yellow Clothing BD', imprShare: '42.1%', overlapRate: '52.0%', outrankingShare: '71.8%', isYou: false },
      { competitor: 'Aarong E-Shop', imprShare: '36.8%', overlapRate: '44.3%', outrankingShare: '76.4%', isYou: false },
    ],
    searchTerms: [
      { query: 'buy silk saree online dhaka', clicks: 124, conv: 28, spend: 32.50, roas: 6.80, type: 'Exact Match', action: 'TOP_PERFORMER' },
      { query: 'fakeit streetwear collection bd', clicks: 248, conv: 62, spend: 41.20, roas: 7.90, type: 'Brand Core', action: 'TOP_PERFORMER' },
      { query: 'best oversized drop shoulder tshirt bd', clicks: 96, conv: 18, spend: 22.40, roas: 4.90, type: 'Phrase Match', action: 'SCALING' },
      { query: 'free lawn dress delivery daraz promo', clicks: 42, conv: 1, spend: 18.20, roas: 0.90, type: 'Wasted Broad', action: 'ADD_NEGATIVE' },
      { query: 'wholesale unstitched suit chittagong', clicks: 38, conv: 0, spend: 14.50, roas: 0.00, type: 'Low Intent', action: 'ADD_NEGATIVE' },
    ],
    dailyDynamics: [
      { date: '2026-09-28', spend: 52.00, conv: 8, value: 275.60, roas: 5.30 },
      { date: '2026-09-29', spend: 58.00, conv: 9, value: 295.80, roas: 5.10 },
      { date: '2026-09-30', spend: 61.50, conv: 10, value: 301.35, roas: 4.90 },
      { date: '2026-10-01', spend: 64.00, conv: 11, value: 313.60, roas: 4.90 },
      { date: '2026-10-02', spend: 72.00, conv: 13, value: 367.20, roas: 5.10 },
      { date: '2026-10-03', spend: 85.00, conv: 16, value: 433.50, roas: 5.10 },
      { date: '2026-10-04', spend: 94.00, conv: 18, value: 479.40, roas: 5.10 },
    ],
    campaigns: [
      { id: '1', name: 'BD_Search_Brand_Core (Sapphire & Lawn)', type: 'SEARCH', status: 'ACTIVE', dailyBudget: 35.00, spend: 640.00, conv: 124, value: 3904.00, roas: 6.10, cpa: 5.16 },
      { id: '2', name: 'PMax_High_Margin_Women_Fashion', type: 'PMAX', status: 'ACTIVE', dailyBudget: 40.00, spend: 699.40, conv: 98, value: 3217.24, roas: 4.60, cpa: 7.13 },
      { id: '3', name: 'Shopping_Smart_Feed_BestSellers', type: 'SHOPPING', status: 'ACTIVE', dailyBudget: 15.00, spend: 220.80, conv: 38, value: 861.12, roas: 3.90, cpa: 5.81 },
      { id: '4', name: 'YouTube_InStream_Festive_Drop', type: 'YOUTUBE', status: 'ACTIVE', dailyBudget: 10.00, spend: 92.10, conv: 14, value: 257.88, roas: 2.80, cpa: 6.57 },
      { id: '5', name: 'Search_Generic_Festive_Kurtis', type: 'SEARCH', status: 'PAUSED', dailyBudget: 20.00, spend: 188.20, conv: 10, value: 338.76, roas: 1.80, cpa: 18.82 },
    ],
    campaignType: [
      { group: 'Search (Intent Driven)', spend: 828.20, conv: 134, cpa: 6.18, roas: 5.12 },
      { group: 'Performance Max', spend: 699.40, conv: 98, cpa: 7.13, roas: 4.60 },
      { group: 'Google Shopping', spend: 220.80, conv: 38, cpa: 5.81, roas: 3.90 },
      { group: 'YouTube & Demand Gen', spend: 92.10, conv: 14, cpa: 6.57, roas: 2.80 },
    ],
    network: [
      { group: 'Google Search Top', spend: 760.00, conv: 128, cpa: 5.93, roas: 5.30 },
      { group: 'Search Partners', spend: 68.20, conv: 6, cpa: 11.36, roas: 3.10 },
      { group: 'Google Display Network', spend: 45.00, conv: 4, cpa: 11.25, roas: 2.40 },
      { group: 'YouTube Videos', spend: 92.10, conv: 14, cpa: 6.57, roas: 2.80 },
    ],
    location: [
      { group: 'Dhaka Division (Urban Core)', spend: 1196.30, conv: 198, cpa: 6.04, roas: 5.10 },
      { group: 'Chittagong Division', spend: 368.10, conv: 52, cpa: 7.07, roas: 4.35 },
      { group: 'Sylhet Division', spend: 147.20, conv: 20, cpa: 7.36, roas: 4.10 },
      { group: 'Rajshahi Division', spend: 73.60, conv: 9, cpa: 8.17, roas: 3.60 },
      { group: 'Khulna & Others', spend: 55.30, conv: 5, cpa: 11.06, roas: 2.90 },
    ],
    device: [
      { group: 'Mobile (Android & iOS)', spend: 1564.40, conv: 246, cpa: 6.35, roas: 4.95 },
      { group: 'Desktop Computers', spend: 257.60, conv: 36, cpa: 7.15, roas: 4.20 },
      { group: 'Tablets', spend: 18.50, conv: 2, cpa: 9.25, roas: 3.20 },
    ],
    keywordMatch: [
      { group: 'Exact Match [ ]', spend: 580.00, conv: 104, cpa: 5.57, roas: 5.80 },
      { group: 'Phrase Match " "', spend: 280.00, conv: 38, cpa: 7.36, roas: 4.20 },
      { group: 'Broad Match (Target CPA)', spend: 148.20, conv: 14, cpa: 10.58, roas: 2.95 },
    ],
    audience: [
      { group: 'In-Market Women Apparel', spend: 640.00, conv: 106, cpa: 6.03, roas: 5.20 },
      { group: 'Custom Intent (Silk & Lawn)', spend: 420.00, conv: 68, cpa: 6.17, roas: 4.90 },
      { group: 'Cart Abandoners (GA4 30D)', spend: 310.00, conv: 56, cpa: 5.53, roas: 5.60 },
      { group: 'Customer Match (1st Party LTV)', spend: 180.50, conv: 32, cpa: 5.64, roas: 5.40 },
    ],
  } : {
    spend: 0.00,
    conversions: 0,
    cpa: 0.00,
    roas: 0.00,
    revenue: 0.00,
    impressions: 0,
    clicks: 0,
    cpc: 0.0000,
    ctr: '0.00%',
    winners: {
      topCampaign: '—',
      topCampaignSub: 'No active campaigns synced',
      bestCpa: '—',
      bestCpaSub: 'No conversion data yet',
      searchShare: '—',
      searchShareSub: 'Connect account to pull share',
      topKeyword: '—',
      topKeywordSub: 'No search queries recorded',
    },
    quality: {
      avgQualityScore: '—',
      qualityTier: 'Pending Sync',
      expectedCtr: '—',
      adRelevance: '—',
      landingPageExp: '—',
      searchImprShare: '0.00%',
      lostIsBudget: '0.00%',
      lostIsRank: '0.00%',
    },
    campaignMix: [],
    auctionInsights: [],
    searchTerms: [],
    dailyDynamics: [],
    campaigns: [],
    campaignType: [],
    network: [],
    location: [],
    device: [],
    keywordMatch: [],
    audience: [],
  };

  // Aesthetic Card Theme classes matching TikTok exactly:
  // Light: Clean `#ffffff` with slate borders
  // Dark: Card `#121620`, Background `#090d14`, Border `#1b2230`
  const cardBg = isLight 
    ? 'bg-white border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' 
    : 'bg-[#121620] border-[#1b2230] shadow-sm';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputBg = isLight 
    ? 'bg-slate-50 border-slate-200 text-slate-800' 
    : 'bg-[#0a0d14] border-[#1e2638] text-slate-200';
  const innerBoxBg = isLight
    ? 'bg-slate-50/80 border-slate-200'
    : 'bg-[#0a0d14] border-[#1b212f]';

  const getMatchTypeBadge = (type: string) => {
    switch (type) {
      case 'Exact Match':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight border transition-all ${
            isLight 
              ? 'bg-blue-50 text-blue-700 border-blue-200/90 shadow-[0_1px_2px_rgba(59,130,246,0.08)]' 
              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            Exact Match
          </span>
        );
      case 'Brand Core':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight border transition-all ${
            isLight 
              ? 'bg-purple-50 text-purple-700 border-purple-200/90 shadow-[0_1px_2px_rgba(168,85,247,0.08)]' 
              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
          }`}>
            <Sparkles className="h-2.5 w-2.5 text-purple-500" />
            Brand Core
          </span>
        );
      case 'Phrase Match':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight border transition-all ${
            isLight 
              ? 'bg-sky-50 text-sky-700 border-sky-200/90 shadow-[0_1px_2px_rgba(14,165,233,0.08)]' 
              : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
            Phrase Match
          </span>
        );
      case 'Wasted Broad':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight border transition-all ${
            isLight 
              ? 'bg-rose-50 text-rose-700 border-rose-200/90 shadow-[0_1px_2px_rgba(244,63,94,0.08)]' 
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}>
            <Ban className="h-2.5 w-2.5 text-rose-500" />
            Wasted Broad
          </span>
        );
      case 'Low Intent':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight border transition-all ${
            isLight 
              ? 'bg-amber-50 text-amber-700 border-amber-200/90 shadow-[0_1px_2px_rgba(245,158,11,0.08)]' 
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}>
            <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
            Low Intent
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Card with Google 4-Color Stripe & Native Controls */}
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        {/* Google Signature 4-Color Brand Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left Title with Google Ads Icon */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-[#4285F4] to-[#1a73e8] border border-blue-400/30 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                <Search className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className={`text-sm sm:text-base font-bold tracking-tight whitespace-nowrap ${textTitle}`}>
                    Google Ads
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 px-1.5 sm:px-2 py-0.5 text-[9px] font-semibold whitespace-nowrap shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Search &amp; PMax
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">CID: {accountId}</span>
                  <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
                  <span className="text-emerald-500 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action: Clean Official Google OAuth Connect Button */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenHub || (() => { window.location.href = '/api/auth/google/start'; })}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition-all shadow-xs w-full sm:w-auto ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                    : 'bg-[#131927] hover:bg-[#1a2336] text-white border border-[#25324d]'
                }`}
                title="Connect Google Ads account"
              >
                {/* Official Google G Logo */}
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Connect Google Ads</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </button>
            </div>
          </div>

          <div className={`mt-2.5 pt-2 border-t flex items-center justify-between gap-2 text-[10px] sm:text-[11px] ${
            isLight ? 'border-slate-100 text-slate-500' : 'border-[#1b2230] text-slate-400'
          }`}>
            <span className="truncate">Enhanced Conversions • Consent Mode v2</span>
            <span className="flex items-center gap-1 text-blue-500 font-medium shrink-0">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards (Total Spend, Conversions, Cost/Conv, GOOGLE PROFIT ENGINE) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Spend */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="h-6 w-6 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center shrink-0">
              <Clock className="h-3 w-3" />
            </div>
            <span className="rounded bg-slate-100 dark:bg-[#1a2130] px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              SPEND
            </span>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-slate-400">
            Total Google ad spend
          </div>
          <div className={`mt-0.5 text-2xl font-black ${textTitle}`}>
            {formatCurr(data.spend)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
            <ArrowUpRight className="h-3 w-3" />
            <span>+14.2% vs last 30 days</span>
          </div>
        </div>

        {/* Card 2: Conversions */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
              <Target className="h-3 w-3" />
            </div>
            <span className="rounded bg-slate-100 dark:bg-[#1a2130] px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              CONV
            </span>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-slate-400">
            Google conversions
          </div>
          <div className={`mt-0.5 text-2xl font-black ${textTitle}`}>
            {data.conversions} orders
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
            <span>CVR: 3.82% • High Intent</span>
          </div>
        </div>

        {/* Card 3: Cost / Conversion */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
              <DollarSign className="h-3 w-3" />
            </div>
            <span className="rounded bg-slate-100 dark:bg-[#1a2130] px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              CPA INDEX
            </span>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-slate-400">
            Cost / conversion
          </div>
          <div className={`mt-0.5 text-2xl font-black ${textTitle}`}>
            {formatCurr(data.cpa)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
            <ArrowDownRight className="h-3 w-3" />
            <span>-18.4% cost efficiency</span>
          </div>
        </div>

        {/* Card 4: Conv. value / cost (Vibrant Google Blue to Cyan Gradient PROFIT ENGINE) */}
        <div className="rounded-xl border border-transparent bg-gradient-to-r from-[#2563eb] via-[#0284c7] to-[#0d9488] p-4 shadow-md text-white">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-4 w-4 text-white" />
            <span className="rounded bg-black/30 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-200">
              PROFIT ENGINE
            </span>
          </div>
          <div className="mt-3 text-[11px] font-medium text-white/90">
            Conv. value / cost (ROAS)
          </div>
          <div className="mt-0.5 text-2xl font-black tracking-tight text-white flex items-baseline gap-2">
            <span>{data.roas.toFixed(2)}x</span>
            <span className="text-xs font-semibold text-cyan-200">
              ({formatCurr(data.revenue)} Value)
            </span>
          </div>
          <div className="mt-1 text-[10px] text-cyan-100 font-medium">
            Net Profit Multiplier Active
          </div>
        </div>
      </div>

      {/* 3. Campaign & Keyword Winners (4 Cards with Google Blue Headers) */}
      <div className="space-y-2">
        <div className={`flex items-center gap-2 text-xs font-bold ${textTitle}`}>
          <Award className="h-4 w-4 text-blue-500" />
          <span>Google Search & Shopping Winners</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOP CAMPAIGN (ROAS) */}
          <div className={`rounded-xl border p-3 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#3b82f6]">
              TOP CAMPAIGN (ROAS)
            </div>
            <div className={`mt-1 text-xs font-bold truncate ${textTitle}`} title={data.winners.topCampaign}>
              {data.winners.topCampaign}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#3b82f6] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
              <span>{data.winners.topCampaignSub}</span>
            </div>
          </div>

          {/* BEST CPA (LOWEST COST) */}
          <div className={`rounded-xl border p-3 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#10b981]">
              BEST CPA (LOWEST COST)
            </div>
            <div className={`mt-1 text-xs font-bold truncate ${textTitle}`} title={data.winners.bestCpa}>
              {data.winners.bestCpa}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#10b981] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              <span>{data.winners.bestCpaSub}</span>
            </div>
          </div>

          {/* SEARCH IMPRESSION SHARE */}
          <div className={`rounded-xl border p-3 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">
              SEARCH IMPRESSION SHARE
            </div>
            <div className={`mt-1 text-xs font-bold truncate ${textTitle}`}>
              {data.winners.searchShare}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#f59e0b] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              <span>{data.winners.searchShareSub}</span>
            </div>
          </div>

          {/* TOP CONVERTING KEYWORD */}
          <div className={`rounded-xl border p-3 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8b5cf6]">
              TOP CONVERTING KEYWORD
            </div>
            <div className={`mt-1 text-xs font-bold truncate ${textTitle}`} title={data.winners.topKeyword}>
              {data.winners.topKeyword}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#8b5cf6] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
              <span>{data.winners.topKeywordSub}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Spend & Conversion Dynamics Interactive Visual Area Chart + 3 Side Tiles */}
      <div className="grid gap-3.5 lg:grid-cols-12">
        {/* Left: Spend and Conversion Value Dynamics SVG Area Chart */}
        <div className={`rounded-xl border p-4 lg:col-span-8 flex flex-col justify-between ${cardBg}`}>
          <div className="flex items-center justify-between border-b pb-3 mb-2">
            <div>
              <div className={`text-xs font-bold ${textTitle}`}>
                Spend and Conversion Value Dynamics
              </div>
              <p className="text-[10px] text-slate-400">
                Daily ad investment vs revenue attributed through Google Ads Click ID (GCLID)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-blue-500">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Revenue Attributed
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Daily Spend
              </span>
            </div>
          </div>

          {data.dailyDynamics.length === 0 ? (
            <div className={`w-full h-44 rounded-xl border flex items-center justify-center my-auto ${innerBoxBg}`}>
              <span className="text-xs text-slate-500 font-normal">
                Chart data will appear when campaigns are active
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Interactive SVG Area Chart */}
              <div className="relative w-full h-40 pt-2">
                <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="googleRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="googleSpendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="30" x2="700" y2="30" stroke={isLight ? '#f1f5f9' : '#1b2230'} strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="700" y2="80" stroke={isLight ? '#f1f5f9' : '#1b2230'} strokeDasharray="3 3" />
                  <line x1="0" y1="130" x2="700" y2="130" stroke={isLight ? '#f1f5f9' : '#1b2230'} strokeDasharray="3 3" />

                  {/* Revenue Area (Blue) */}
                  <polygon
                    points="0,150 0,90 116,84 233,80 350,75 466,55 583,38 700,20 700,150"
                    fill="url(#googleRevGrad)"
                  />
                  {/* Revenue Line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,90 116,84 233,80 350,75 466,55 583,38 700,20"
                  />

                  {/* Spend Area (Rose) */}
                  <polygon
                    points="0,150 0,135 116,132 233,130 350,128 466,122 583,116 700,110 700,150"
                    fill="url(#googleSpendGrad)"
                  />
                  {/* Spend Line */}
                  <polyline
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,135 116,132 233,130 350,128 466,122 583,116 700,110"
                  />

                  {/* Data Points */}
                  {data.dailyDynamics.map((item, idx) => {
                    const cx = (idx / (data.dailyDynamics.length - 1)) * 700;
                    const cyRev = 90 - (idx * 11);
                    const cySpend = 135 - (idx * 4);
                    const isHovered = hoveredPoint === idx;

                    return (
                      <g key={idx} onMouseEnter={() => setHoveredPoint(idx)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                        <circle cx={cx} cy={cyRev} r={isHovered ? 6 : 4} fill="#3b82f6" className="transition-all" />
                        <circle cx={cx} cy={cySpend} r={isHovered ? 5 : 3.5} fill="#f43f5e" className="transition-all" />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Daily breakdown rows */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 text-xs">
                {data.dailyDynamics.map((item, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-2 border transition-all ${
                      hoveredPoint === idx ? 'border-blue-500 bg-blue-500/10' : innerBoxBg
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-400">{item.date.slice(5)}</div>
                    <div className="mt-1 font-bold text-rose-500">{formatCurr(item.spend, 0)}</div>
                    <div className="text-[11px] font-semibold text-blue-500">{formatCurr(item.value, 0)}</div>
                    <div className="mt-0.5 text-[10px] font-bold text-emerald-500">{item.roas.toFixed(1)}x ROAS</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: 3 Metric Cards (Impressions, Total Clicks, Avg CPC) */}
        <div className="space-y-2.5 lg:col-span-4 flex flex-col justify-between">
          {/* Impressions */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total Impressions</span>
              <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                82.4% Top of Page
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <span className={`text-xl font-black ${textTitle}`}>
                {data.impressions.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              High intent search & shopping ad displays
            </div>
          </div>

          {/* Total Clicks */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total Clicks</span>
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                CTR: {data.ctr}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-emerald-500" />
              <span className={`text-xl font-black ${textTitle}`}>
                {data.clicks.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              Above Google fashion benchmark (2.8%)
            </div>
          </div>

          {/* Avg CPC */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Avg Cost Per Click (CPC)</span>
              <span className="text-[9px] font-bold text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                Optimized
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-500" />
              <span className={`text-xl font-black ${textTitle}`}>
                {formatCurr(data.cpc, 4)}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              Target ROAS Smart Bidding active
            </div>
          </div>
        </div>
      </div>

      {/* 5. Google Intelligence Triad: QUALITY SCORE & IMPRESSION SHARE, CAMPAIGN MIX, AUCTION INSIGHTS */}
      <div className="grid gap-3.5 md:grid-cols-3">
        {/* Card 1: QUALITY SCORE & SEARCH IMPRESSION SHARE */}
        <div className={`rounded-xl border p-4 flex flex-col justify-between ${cardBg}`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Compass className="h-3 w-3" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>
                  QUALITY SCORE & SHARE
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {data.quality.qualityTier}
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span>Avg Quality Score:</span>
                <span className="font-bold text-blue-500 text-sm">{data.quality.avgQualityScore}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected CTR:</span>
                <span className="font-semibold text-emerald-500">{data.quality.expectedCtr}</span>
              </div>
              <div className="flex justify-between">
                <span>Ad Relevance:</span>
                <span className="font-semibold text-emerald-500">{data.quality.adRelevance}</span>
              </div>
              <div className="flex justify-between">
                <span>Landing Page Experience:</span>
                <span className="font-semibold text-emerald-500">{data.quality.landingPageExp}</span>
              </div>
            </div>
          </div>

          <div className={`mt-3 pt-2.5 border-t space-y-1.5 text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-400">Search Impr. Share:</span>
              <span className="text-blue-500">{data.quality.searchImprShare}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Lost IS (Budget / Rank):</span>
              <span className="text-amber-500">{data.quality.lostIsBudget} / {data.quality.lostIsRank}</span>
            </div>
          </div>
        </div>

        {/* Card 2: CAMPAIGN MIX ALLOCATION */}
        <div className={`rounded-xl border p-4 flex flex-col justify-between ${cardBg}`}>
          <div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Layers className="h-3 w-3" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>
                CAMPAIGN TYPE MIX
              </span>
            </div>

            {/* Visual Multi-Color Progress Bar */}
            <div className="mt-3.5 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
              {data.campaignMix.map((mix, idx) => (
                <div
                  key={idx}
                  style={{ width: `${mix.pct}%`, backgroundColor: mix.color }}
                  title={`${mix.name}: ${mix.pct}%`}
                />
              ))}
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              {data.campaignMix.map((mix, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mix.color }} />
                    <span className="truncate max-w-[150px]">{mix.name}</span>
                  </div>
                  <span className={`font-semibold ${textTitle}`}>
                    {formatCurr(mix.spend, 0)} ({mix.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-3 pt-2 border-t flex justify-between text-xs font-bold text-blue-500 ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
            <span>PMax & Search Share</span>
            <span>83% Total Spend</span>
          </div>
        </div>

        {/* Card 3: AUCTION INSIGHTS & COMPETITOR OUTRANKING */}
        <div className={`rounded-xl border p-4 flex flex-col justify-between ${cardBg}`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Percent className="h-3 w-3" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>
                  AUCTION INSIGHTS (BD)
                </span>
              </div>
              <span className="text-[10px] font-bold text-blue-500">
                Rank #1
              </span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="text-[9px] text-slate-400 uppercase">
                  <tr>
                    <th className="pb-1.5 font-semibold">STORE</th>
                    <th className="pb-1.5 font-semibold">IMPR. SHARE</th>
                    <th className="pb-1.5 text-right font-semibold text-blue-500">OUTRANK</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                  {data.auctionInsights.map((comp, idx) => (
                    <tr key={idx} className={comp.isYou ? 'font-bold text-blue-500 bg-blue-500/5' : ''}>
                      <td className="py-1 truncate max-w-[110px]">{comp.competitor}</td>
                      <td className="py-1">{comp.imprShare}</td>
                      <td className="py-1 text-right">{comp.outrankingShare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`mt-3 pt-2 border-t flex justify-between text-xs font-bold text-emerald-500 ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
            <span>Outranking Share</span>
            <span>+64.2% Over Daraz</span>
          </div>
        </div>
      </div>

      {/* 6. Google Search Queries & Negative Keywords Engine */}
      <div className={`rounded-xl border p-3.5 sm:p-4 ${cardBg}`}>
        <div className="flex items-center justify-between gap-2 border-b pb-3 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <h3 className={`text-xs sm:text-sm font-bold truncate ${textTitle}`}>
              Search Queries & Negatives
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-500 border border-blue-500/20">
            5 Actions
          </span>
        </div>

        {/* Mobile View: High-density Native Cards */}
        <div className="sm:hidden space-y-2.5">
          {data.searchTerms.map((term, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                isLight
                  ? 'bg-slate-50/70 border-slate-200/90 shadow-sm'
                  : 'bg-[#121824] border-[#1e293b]'
              }`}
            >
              {/* Header row: Query + Match Type */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs font-bold leading-snug break-words flex-1 ${textTitle}`}>
                  "{term.query}"
                </span>
                <div className="shrink-0">{getMatchTypeBadge(term.type)}</div>
              </div>

              {/* 4-Stat Grid */}
              <div className={`grid grid-cols-4 gap-1 p-2 rounded-lg mb-2.5 ${isLight ? 'bg-white border border-slate-100' : 'bg-[#0b0f17] border border-slate-800/60'}`}>
                <div className="text-center">
                  <div className="text-[9px] font-semibold text-slate-400 uppercase">Clicks</div>
                  <div className={`text-xs font-bold ${textTitle}`}>{term.clicks}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-semibold text-slate-400 uppercase">Orders</div>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{term.conv}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-semibold text-slate-400 uppercase">Spend</div>
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400">{formatCurr(term.spend)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-semibold text-slate-400 uppercase">ROAS</div>
                  <div className="text-xs font-black text-blue-600 dark:text-blue-400">{term.roas.toFixed(2)}x</div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Action</span>
                {term.action === 'ADD_NEGATIVE' ? (
                  <button
                    onClick={() => alert(`Added "${term.query}" to Negative Keywords List to prevent wasted spend!`)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border inline-flex items-center gap-1.5 transition-all active:scale-95 ${
                      isLight
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-sm'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    <Ban className="h-3 w-3" />
                    <span>Add Negative</span>
                  </button>
                ) : (
                  <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border inline-flex items-center gap-1.5 ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Scaling Winner</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Responsive Table */}
        <div className="hidden sm:block overflow-x-auto no-scrollbar pb-1">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className={`text-[10px] text-slate-400 uppercase border-b ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
              <tr>
                <th className="px-3 pb-2 font-semibold whitespace-nowrap">CUSTOMER SEARCH QUERY</th>
                <th className="px-3 pb-2 font-semibold whitespace-nowrap">MATCH TYPE</th>
                <th className="px-3 pb-2 font-semibold whitespace-nowrap">CLICKS</th>
                <th className="px-3 pb-2 font-semibold whitespace-nowrap">CONVERSIONS</th>
                <th className="px-3 pb-2 font-semibold whitespace-nowrap">SPEND</th>
                <th className="px-3 pb-2 font-semibold whitespace-nowrap">ROAS</th>
                <th className="px-3 pb-2 text-right font-semibold whitespace-nowrap">AI ACTION</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
              {data.searchTerms.map((term, idx) => (
                <tr key={idx} className={`transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/30'}`}>
                  <td className={`px-3 py-2.5 font-medium whitespace-nowrap ${textTitle}`}>
                    "{term.query}"
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {getMatchTypeBadge(term.type)}
                  </td>
                  <td className={`px-3 py-2.5 whitespace-nowrap ${textMuted}`}>{term.clicks}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">{term.conv} orders</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-medium text-rose-600 dark:text-rose-400">{formatCurr(term.spend)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-black text-blue-600 dark:text-blue-400">{term.roas.toFixed(2)}x</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-right">
                    {term.action === 'ADD_NEGATIVE' ? (
                      <button
                        onClick={() => alert(`Added "${term.query}" to Negative Keywords List to prevent wasted spend!`)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border inline-flex items-center gap-1 transition-all ${
                          isLight
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-sm'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        <Ban className="h-3 w-3" />
                        <span>Add Negative</span>
                      </button>
                    ) : (
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border inline-flex items-center gap-1 ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Scaling Winner</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Campaigns Section Table */}
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        <div className={`p-3 sm:p-3.5 border-b flex items-center justify-between gap-2 ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
          <div className={`text-xs font-bold truncate ${textTitle}`}>
            Active Campaigns ({data.campaigns.length})
          </div>
          <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs shrink-0 ${inputBg}`}>
            <Search className="h-3 w-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchCampaignQuery}
              onChange={(e) => setSearchCampaignQuery(e.target.value)}
              className="bg-transparent text-xs focus:outline-none w-24 sm:w-36 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Mobile View: High-density Campaign Cards */}
        <div className="sm:hidden p-3 space-y-2.5">
          {data.campaigns.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No active campaign data
            </div>
          ) : (
            data.campaigns.map((camp) => (
              <div
                key={camp.id}
                className={`p-3 rounded-xl border transition-all ${
                  isLight
                    ? 'bg-slate-50/70 border-slate-200/90 shadow-sm'
                    : 'bg-[#121824] border-[#1e293b]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        camp.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-[#1a2130] text-slate-400 border border-slate-700'
                      }`}>
                        {camp.status}
                      </span>
                      <span className="rounded px-1.5 py-0.2 text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {camp.type}
                      </span>
                    </div>
                    <div className={`text-xs font-bold leading-tight truncate ${textTitle}`}>
                      {camp.name}
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Optimizing bid strategy for ${camp.name}`)}
                    className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 active:scale-95 transition-all"
                  >
                    Optimize
                  </button>
                </div>

                <div className={`grid grid-cols-4 gap-1 p-2 rounded-lg ${isLight ? 'bg-white border border-slate-100' : 'bg-[#0b0f17] border border-slate-800/60'}`}>
                  <div className="text-center">
                    <div className="text-[9px] font-semibold text-slate-400 uppercase">Spend</div>
                    <div className="text-xs font-bold text-rose-500">{formatCurr(camp.spend)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-semibold text-slate-400 uppercase">Conv</div>
                    <div className="text-xs font-bold text-emerald-500">{camp.conv}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-semibold text-slate-400 uppercase">Revenue</div>
                    <div className="text-xs font-bold text-emerald-500">{formatCurr(camp.value)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-semibold text-slate-400 uppercase">ROAS</div>
                    <div className="text-xs font-black text-blue-500">{camp.roas.toFixed(2)}x</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden sm:block overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className={`text-[10px] text-slate-400 uppercase border-b ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
              <tr>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">STATUS</th>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">TYPE</th>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">CAMPAIGN NAME</th>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">DAILY BUDGET</th>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">SPEND</th>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">CONV</th>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">CPA</th>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">REVENUE</th>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">ROAS</th>
                <th className="px-4 py-2.5 font-semibold text-right whitespace-nowrap">ACTION</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
              {data.campaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-xs text-slate-500">
                    No active campaign data
                  </td>
                </tr>
              ) : (
                data.campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        camp.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-[#1a2130] text-slate-400 border border-slate-700'
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {camp.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${textTitle}`}>
                      {camp.name}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatCurr(camp.dailyBudget)}/day
                    </td>
                    <td className="px-4 py-3 font-medium text-rose-500 whitespace-nowrap">
                      {formatCurr(camp.spend)}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-500 whitespace-nowrap">
                      {camp.conv} orders
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatCurr(camp.cpa)}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-500 whitespace-nowrap">
                      {formatCurr(camp.value)}
                    </td>
                    <td className="px-4 py-3 font-black text-blue-500 whitespace-nowrap">
                      {camp.roas.toFixed(2)}x
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => alert(`Optimizing bid strategy for ${camp.name}`)}
                        className="rounded px-2 py-1 text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                      >
                        Optimize
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Six Google Breakdown Tables (2x3 Grid with Blue Left Accent Border matching TikTok) */}
      <div className="grid gap-3.5 md:grid-cols-3">
        {/* 1. CAMPAIGN TYPE */}
        <div className={`rounded-xl border border-l-4 border-l-blue-500 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            CAMPAIGN TYPE
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">TYPE</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-blue-500">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.campaignType.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-500">No data</td></tr>
                ) : (
                  data.campaignType.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold truncate max-w-[90px]">{r.group}</td>
                      <td className="py-1 font-medium">{formatCurr(r.spend, 0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1 text-slate-400">{formatCurr(r.cpa, 0)}</td>
                      <td className="py-1 text-right font-bold text-blue-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. NETWORK (SEARCH / DISPLAY / YOUTUBE) */}
        <div className={`rounded-xl border border-l-4 border-l-emerald-500 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            NETWORK PLACEMENT
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">NETWORK</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-blue-500">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.network.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-500">No data</td></tr>
                ) : (
                  data.network.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold truncate max-w-[90px]">{r.group}</td>
                      <td className="py-1 font-medium">{formatCurr(r.spend, 0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1 text-slate-400">{formatCurr(r.cpa, 0)}</td>
                      <td className="py-1 text-right font-bold text-blue-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. BANGLADESH DIVISIONS / LOCATIONS */}
        <div className={`rounded-xl border border-l-4 border-l-amber-500 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            LOCATION (DIVISIONS BD)
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">DIVISION</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-blue-500">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.location.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-500">No data</td></tr>
                ) : (
                  data.location.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold truncate max-w-[90px]">{r.group}</td>
                      <td className="py-1 font-medium">{formatCurr(r.spend, 0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1 text-slate-400">{formatCurr(r.cpa, 0)}</td>
                      <td className="py-1 text-right font-bold text-blue-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. DEVICE SEGMENTS */}
        <div className={`rounded-xl border border-l-4 border-l-indigo-500 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            DEVICE HARDWARE
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">DEVICE</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-blue-500">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.device.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-500">No data</td></tr>
                ) : (
                  data.device.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold truncate max-w-[90px]">{r.group}</td>
                      <td className="py-1 font-medium">{formatCurr(r.spend, 0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1 text-slate-400">{formatCurr(r.cpa, 0)}</td>
                      <td className="py-1 text-right font-bold text-blue-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. KEYWORD MATCH TYPES */}
        <div className={`rounded-xl border border-l-4 border-l-purple-500 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            KEYWORD MATCH TYPE
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">MATCH</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-blue-500">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.keywordMatch.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-500">No data</td></tr>
                ) : (
                  data.keywordMatch.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold truncate max-w-[90px]">{r.group}</td>
                      <td className="py-1 font-medium">{formatCurr(r.spend, 0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1 text-slate-400">{formatCurr(r.cpa, 0)}</td>
                      <td className="py-1 text-right font-bold text-blue-500">{r.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. AUDIENCE SEGMENTS */}
        <div className={`rounded-xl border border-l-4 border-l-rose-500 p-3.5 ${cardBg}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>
            AUDIENCE SEGMENT
          </div>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase">
                <tr>
                  <th className="pb-1.5 font-normal">AUDIENCE</th>
                  <th className="pb-1.5 font-normal">SPEND</th>
                  <th className="pb-1.5 font-normal">CONV</th>
                  <th className="pb-1.5 font-normal">CPA</th>
                  <th className="pb-1.5 text-right font-normal text-blue-500">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1b2230]'}`}>
                {data.audience.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-500">No data</td></tr>
                ) : (
                  data.audience.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold truncate max-w-[90px]">{r.group}</td>
                      <td className="py-1 font-medium">{formatCurr(r.spend, 0)}</td>
                      <td className="py-1">{r.conv}</td>
                      <td className="py-1 text-slate-400">{formatCurr(r.cpa, 0)}</td>
                      <td className="py-1 text-right font-bold text-blue-500">{r.roas.toFixed(2)}x</td>
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
