'use client';

import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Award, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Pause, 
  Play, 
  Settings, 
  Compass, 
  ShoppingCart, 
  Heart,
  Search,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface MetaAdsPerformanceDashboardProps {
  theme?: 'light' | 'dark';
  hasActiveData?: boolean;
  onOpenHub?: () => void;
  accountName?: string;
  accountId?: string;
  currency?: 'BDT' | 'USD';
  onNavigatePlatform?: (platform: 'META' | 'GOOGLE' | 'TIKTOK' | 'AUDIT' | 'SEO') => void;
}

export const MetaAdsPerformanceDashboard: React.FC<MetaAdsPerformanceDashboardProps> = ({
  theme = 'dark',
  hasActiveData = false,
  onOpenHub,
  accountName = 'Meta Ads Manager (Not connected)',
  accountId = '',
  currency = 'USD',
  onNavigatePlatform,
}) => {
  const isLight = theme === 'light';
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 days');
  const [searchCampaignQuery, setSearchCampaignQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScaledMode, setIsScaledMode] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 700);
  };

  // Exact data from user's screenshot
  const screenshotData = {
    spend: 10.02,
    purchases: 0,
    cpa: 0.00,
    roas: 0.00,
    impressions: 30738,
    clicks: 846,
    cpc: 0.0118,
    winners: {
      topRegion: 'Dhaka Division',
      topRegionSub: '62% Order Volume',
      bestAge: '21-34',
      bestAgeSub: '4.60x ROAS Winner',
      topPlatform: 'Instagram Feed',
      topPlatformSub: 'Highest Conversion Rate',
      bestCampaign: 'BOXY SHIRT|SALE|18/9/2026',
      bestCampaignSub: '0 Orders Attributed',
    },
    funnel: {
      outboundClicks: 846,
      landingPageViews: 744,
      costLpv: '$0.01',
      lpvDropOff: '12.00%',
      viewContent: 626,
      addToCart: 0,
      checkoutInit: 0,
      convRate: '1.71%',
      postReactions: 550,
      postComments: 102,
      postShares: 76,
      ctr: '2.75%',
    },
    signals: {
      mvpCreative: 'Streetwear Lookbook Carousel #1',
      underperformer: 'General Interest Broad Image',
    },
    dailyDynamics: [
      { date: '2026-09-17', spend: 2.36, sales: 0.00, roas: 0.00 },
      { date: '2026-09-18', spend: 3.74, sales: 0.00, roas: 0.00 },
      { date: '2026-09-19', spend: 3.92, sales: 0.00, roas: 0.00 },
      { date: '2026-09-20', spend: 0.00, sales: 0.00, roas: 0.00 },
      { date: '2026-09-23', spend: 0.00, sales: 0.00, roas: 0.00 },
      { date: '2026-09-24', spend: 0.00, sales: 0.00, roas: 0.00 },
    ],
    campaigns: [
      { id: '1', name: 'BOXY SHIRT|SALE|18/9/2026', status: 'PAUSED', spend: 0.52, orders: 0, revenue: 0.00, roas: 0.00 },
      { id: '2', name: 'Spaidy sale|Message|17-09-2026', status: 'PAUSED', spend: 9.50, orders: 0, revenue: 0.00, roas: 0.00 },
    ],
    ageBreakdown: [
      { group: '18-24', spend: 7.00, sales: 0, cpa: 0, roas: 0 },
      { group: '25-34', spend: 2.55, sales: 0, cpa: 0, roas: 0 },
      { group: '35-44', spend: 0.35, sales: 0, cpa: 0, roas: 0 },
      { group: '45-54', spend: 0.09, sales: 0, cpa: 0, roas: 0 },
      { group: '55-64', spend: 0.04, sales: 0, cpa: 0, roas: 0 },
      { group: '65+', spend: 0.05, sales: 0, cpa: 0, roas: 0 },
    ],
    regionBreakdown: [
      { group: 'Barisal Division', spend: 0.33, sales: 0, cpa: 0, roas: 0 },
      { group: 'Chittagong Division', spend: 1.85, sales: 0, cpa: 0, roas: 0 },
      { group: 'Dhaka Division', spend: 5.67, sales: 0, cpa: 0, roas: 0 },
      { group: 'Khulna Division', spend: 0.63, sales: 0, cpa: 0, roas: 0 },
      { group: 'Rajshahi Division', spend: 0.63, sales: 0, cpa: 0, roas: 0 },
    ],
    genderBreakdown: [
      { group: 'Male', spend: 9.31, sales: 0, cpa: 0, roas: 0 },
      { group: 'Female', spend: 0.69, sales: 0, cpa: 0, roas: 0 },
      { group: 'Other', spend: 0.02, sales: 0, cpa: 0, roas: 0 },
    ],
    platformBreakdown: [
      { group: 'Instagram', spend: 5.55, sales: 0, cpa: 0, roas: 0 },
      { group: 'Facebook', spend: 4.47, sales: 0, cpa: 0, roas: 0 },
    ],
    deviceBreakdown: [
      { group: 'Desktop', spend: 0.10, sales: 0, cpa: 0, roas: 0 },
      { group: 'mobile_app', spend: 9.91, sales: 0, cpa: 0, roas: 0 },
      { group: 'mobile_web', spend: 0.01, sales: 0, cpa: 0, roas: 0 },
    ],
  };

  // Scaled live data
  const scaledData = {
    spend: 1420.00,
    purchases: 210,
    cpa: 6.76,
    roas: 4.42,
    impressions: 278000,
    clicks: 8640,
    cpc: 0.1643,
    winners: {
      topRegion: 'Dhaka Division',
      topRegionSub: '62% Order Volume • 4.80x ROAS',
      bestAge: '21-34',
      bestAgeSub: '4.85x ROAS Winner',
      topPlatform: 'Instagram Feed',
      topPlatformSub: 'Highest Conversion Rate',
      bestCampaign: 'BOXY SHIRT|SALE|18/9/2026',
      bestCampaignSub: '$3,104 Revenue Attributed',
    },
    funnel: {
      outboundClicks: 8640,
      landingPageViews: 7820,
      costLpv: '$0.18',
      lpvDropOff: '9.50%',
      viewContent: 6410,
      addToCart: 920,
      checkoutInit: 410,
      convRate: '2.68%',
      postReactions: 4120,
      postComments: 680,
      postShares: 430,
      ctr: '3.11%',
    },
    signals: {
      mvpCreative: 'Streetwear Lookbook Carousel #1',
      underperformer: 'General Interest Broad Image',
    },
    dailyDynamics: [
      { date: '2026-09-17', spend: 195.40, sales: 880.00, roas: 4.50 },
      { date: '2026-09-18', spend: 210.00, sales: 945.00, roas: 4.50 },
      { date: '2026-09-19', spend: 185.00, sales: 740.00, roas: 4.00 },
      { date: '2026-09-20', spend: 205.50, sales: 863.10, roas: 4.20 },
      { date: '2026-09-23', spend: 224.10, sales: 1053.27, roas: 4.70 },
      { date: '2026-09-24', spend: 210.00, sales: 882.00, roas: 4.20 },
    ],
    campaigns: [
      { id: '1', name: 'BOXY SHIRT|SALE|18/9/2026', status: 'ACTIVE', spend: 640.00, orders: 112, revenue: 3104.00, roas: 4.85 },
      { id: '2', name: 'Spaidy sale|Message|17-09-2026', status: 'ACTIVE', spend: 310.00, orders: 58, revenue: 1612.00, roas: 5.20 },
    ],
    ageBreakdown: [
      { group: '18-24', spend: 284.00, sales: 42, cpa: 6.76, roas: 4.10 },
      { group: '25-34', spend: 653.20, sales: 118, cpa: 5.53, roas: 4.85 },
      { group: '35-44', spend: 312.40, sales: 38, cpa: 8.22, roas: 3.40 },
      { group: '45-54', spend: 113.60, sales: 10, cpa: 11.36, roas: 2.50 },
      { group: '55-64', spend: 42.60, sales: 2, cpa: 21.30, roas: 1.80 },
      { group: '65+', spend: 14.20, sales: 0, cpa: 0, roas: 0 },
    ],
    regionBreakdown: [
      { group: 'Barisal Division', spend: 42.60, sales: 4, cpa: 10.65, roas: 2.40 },
      { group: 'Chittagong Division', spend: 326.60, sales: 44, cpa: 7.42, roas: 3.80 },
      { group: 'Dhaka Division', spend: 880.40, sales: 142, cpa: 6.20, roas: 4.60 },
      { group: 'Khulna Division', spend: 42.60, sales: 4, cpa: 10.65, roas: 2.40 },
      { group: 'Rajshahi Division', spend: 56.80, sales: 6, cpa: 9.46, roas: 2.80 },
    ],
    genderBreakdown: [
      { group: 'Male', spend: 198.80, sales: 24, cpa: 8.28, roas: 3.10 },
      { group: 'Female', spend: 1192.80, sales: 184, cpa: 6.48, roas: 4.45 },
      { group: 'Other', spend: 28.40, sales: 2, cpa: 14.20, roas: 2.00 },
    ],
    platformBreakdown: [
      { group: 'Instagram', spend: 852.00, sales: 136, cpa: 6.26, roas: 4.65 },
      { group: 'Facebook', spend: 568.00, sales: 74, cpa: 7.67, roas: 3.80 },
    ],
    deviceBreakdown: [
      { group: 'Desktop', spend: 56.80, sales: 4, cpa: 14.20, roas: 2.20 },
      { group: 'mobile_app', spend: 1349.00, sales: 204, cpa: 6.61, roas: 4.50 },
      { group: 'mobile_web', spend: 14.20, sales: 2, cpa: 7.10, roas: 3.40 },
    ],
  };

  const emptyData = {
    spend: 0.00,
    purchases: 0,
    cpa: 0.00,
    roas: 0.00,
    impressions: 0,
    clicks: 0,
    cpc: 0.0000,
    winners: {
      topRegion: '—',
      topRegionSub: 'No data',
      bestAge: '—',
      bestAgeSub: 'No data',
      topPlatform: '—',
      topPlatformSub: 'No data',
      bestCampaign: '—',
      bestCampaignSub: 'No data',
    },
    funnel: {
      outboundClicks: 0,
      landingPageViews: 0,
      costLpv: '$0.00',
      lpvDropOff: '0.00%',
      viewContent: 0,
      addToCart: 0,
      checkoutInit: 0,
      convRate: '0.00%',
      postReactions: 0,
      postComments: 0,
      postShares: 0,
      ctr: '0.00%',
    },
    signals: {
      mvpCreative: '—',
      underperformer: '—',
    },
    dailyDynamics: [],
    campaigns: [],
    ageBreakdown: [],
    regionBreakdown: [],
    genderBreakdown: [],
    platformBreakdown: [],
    deviceBreakdown: [],
  };

  const currentData = hasActiveData ? (isScaledMode ? scaledData : screenshotData) : emptyData;

  // Complete Theme Tokens for Clean White Mode & Authentic Dark Mode:
  const cardBg = isLight 
    ? 'bg-white border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' 
    : 'bg-[#0e131f] border-slate-800 shadow-xl';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputBg = isLight 
    ? 'bg-slate-50 border-slate-200 text-slate-800' 
    : 'bg-slate-950 border-slate-800 text-white';
  const rowItemBg = isLight
    ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/90 text-slate-800'
    : 'bg-slate-950/60 border-slate-800/60 hover:bg-slate-900/60 text-slate-300';
  const pillInactiveBg = isLight
    ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
    : 'bg-[#121826] text-slate-300 hover:bg-slate-800 border border-slate-800';
  const btnActionBg = isLight
    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
    : 'bg-[#121826] hover:bg-slate-800 border-slate-800 text-slate-300';

  return (
    <div className="space-y-6">

      {/* 2. Performance Engine Header Card */}
      <div className={`rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Meta Blue Gradient Icon */}
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <BarChart2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className={`text-sm sm:text-base font-bold tracking-tight whitespace-nowrap ${textTitle}`}>
                  Meta Ads Engine
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 px-1.5 sm:px-2 py-0.5 text-[9px] font-semibold whitespace-nowrap shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="font-medium truncate">{accountName}</span>
              </div>
            </div>
          </div>

          {/* Right Action: Clean Official Meta OAuth Connect Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenHub || (() => { window.location.href = '/api/auth/meta/start'; })}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition-all shadow-xs w-full sm:w-auto ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                  : 'bg-[#131927] hover:bg-[#1a2336] text-white border border-[#25324d]'
              }`}
              title="Connect Meta / Facebook Ads account"
            >
              {/* Meta Blue Logo */}
              <svg className="h-3.5 w-3.5 shrink-0 fill-[#0081FB]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Connect Facebook Ads</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </button>
          </div>
        </div>

        <div className={`mt-2.5 pt-2 border-t flex items-center justify-between gap-2 text-[10px] sm:text-[11px] ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-400'
        }`}>
          <span className="truncate">CAPI Graph API v20.0 • Server Deduplication</span>
          <span className="text-emerald-500 font-semibold flex items-center gap-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sync 2h
          </span>
        </div>
      </div>

      {/* 3. Top Metrics Row (Total ad spend, Web purchases, Cost per order, Blended ROAS [PROFIT ENGINE]) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total ad spend */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Clock className="h-3 w-3" />
              </div>
              <span className={`font-semibold ${textMuted}`}>Total ad spend</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">SPEND</span>
          </div>
          <div className={`mt-2 text-2xl font-black ${textTitle}`}>
            ${currentData.spend.toFixed(2)}
          </div>
        </div>

        {/* Web purchases */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <ShoppingCart className="h-3 w-3" />
              </div>
              <span className={`font-semibold ${textMuted}`}>Web purchases</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ORDERS</span>
          </div>
          <div className={`mt-2 text-2xl font-black ${textTitle}`}>
            {currentData.purchases}
          </div>
        </div>

        {/* Cost per order */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <BarChart2 className="h-3 w-3" />
              </div>
              <span className={`font-semibold ${textMuted}`}>Cost per order</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">CPA INDEX</span>
          </div>
          <div className={`mt-2 text-2xl font-black ${textTitle}`}>
            ${currentData.cpa.toFixed(2)}
          </div>
        </div>

        {/* Blended ROAS (Vibrant Blue Card with PROFIT ENGINE pill, exact match to screenshot) */}
        <div className="rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 p-4 shadow-xl text-white">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>Blended ROAS</span>
            </div>
            <span className="rounded bg-black/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-200">
              PROFIT ENGINE
            </span>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight">
            {currentData.roas.toFixed(2)}x
          </div>
        </div>
      </div>

      {/* 4. Creative and audience winners (4 cards matching screenshot exactly) */}
      <div className="space-y-2">
        <div className={`flex items-center gap-2 text-xs font-bold ${textTitle}`}>
          <span className="text-amber-500 text-sm">⏳</span>
          <span>Creative and audience winners</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Top Region */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              TOP REGION
            </div>
            <div className={`mt-1 text-xs font-bold ${textTitle} truncate`}>
              {currentData.winners.topRegion}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <span>{currentData.winners.topRegionSub}</span>
            </div>
          </div>

          {/* Best Age Range */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              BEST AGE RANGE
            </div>
            <div className={`mt-1 text-xs font-bold ${textTitle}`}>
              {currentData.winners.bestAge}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <span>{currentData.winners.bestAgeSub}</span>
            </div>
          </div>

          {/* Top Platform */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              TOP PLATFORM
            </div>
            <div className={`mt-1 text-xs font-bold ${textTitle} truncate`}>
              {currentData.winners.topPlatform}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <span>{currentData.winners.topPlatformSub}</span>
            </div>
          </div>

          {/* Best Campaign */}
          <div className={`rounded-xl border p-3.5 ${cardBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              BEST CAMPAIGN
            </div>
            <div className={`mt-1 text-xs font-bold ${textTitle} truncate`}>
              {currentData.winners.bestCampaign}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <span>{currentData.winners.bestCampaignSub}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Middle Two Column: Spend & ROAS Dynamics + 3 KPI Tiles */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Spend and ROAS dynamics (8 cols) */}
        <div className={`rounded-2xl border p-5 lg:col-span-8 ${cardBg}`}>
          <div className={`border-b pb-3 ${isLight ? 'border-slate-100' : 'border-slate-800/80'}`}>
            <h3 className={`text-sm font-bold ${textTitle}`}>Spend and ROAS dynamics</h3>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            {currentData.dailyDynamics.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-lg p-2.5 border transition-colors ${rowItemBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className={`font-mono ${isLight ? 'text-slate-800 font-semibold' : 'text-slate-300'}`}>{item.date}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-rose-500 font-semibold">
                    Spend: ${item.spend.toFixed(2)}
                  </span>
                  <span className={isLight ? 'text-slate-700 font-semibold' : 'text-cyan-400'}>
                    Sales: ${item.sales.toFixed(0)}
                  </span>
                  <span className={`font-bold ${isLight ? 'text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200' : 'text-cyan-400'}`}>
                    {item.roas.toFixed(2)}x ROAS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Impressions, Total clicks, Avg CPC (4 cols) */}
        <div className="space-y-3 lg:col-span-4 flex flex-col justify-between">
          {/* Impressions */}
          <div className={`rounded-xl border p-4 ${cardBg}`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
              Impressions
            </div>
            <div className={`mt-2 flex items-center gap-2 text-2xl font-black ${textTitle}`}>
              <Eye className="h-5 w-5 text-rose-500" />
              <span>{currentData.impressions.toLocaleString()}</span>
            </div>
          </div>

          {/* Total clicks */}
          <div className={`rounded-xl border p-4 ${cardBg}`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
              Total clicks
            </div>
            <div className={`mt-2 flex items-center gap-2 text-2xl font-black ${textTitle}`}>
              <Flame className="h-5 w-5 text-amber-500" />
              <span>{currentData.clicks.toLocaleString()}</span>
            </div>
          </div>

          {/* Avg CPC */}
          <div className={`rounded-xl border p-4 ${cardBg}`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
              Avg CPC
            </div>
            <div className={`mt-2 flex items-center gap-2 text-2xl font-black ${textTitle}`}>
              <DollarSign className="h-5 w-5 text-slate-400" />
              <span>${currentData.cpc.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Three Funnel Cards Row (TRAFFIC QUALITY, E-COM FUNNEL, AD ENGAGEMENT) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* TRAFFIC QUALITY */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Compass className="h-4 w-4" />
            <span className="uppercase text-[11px] tracking-wider">TRAFFIC QUALITY</span>
          </div>
          <div className="mt-3.5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Outbound clicks</span>
              <strong className={textTitle}>{currentData.funnel.outboundClicks}</strong>
            </div>
            <div className="flex justify-between">
              <span>Landing page views</span>
              <strong className={textTitle}>{currentData.funnel.landingPageViews}</strong>
            </div>
            <div className="flex justify-between">
              <span>Cost / LPV</span>
              <strong className={textTitle}>{currentData.funnel.costLpv}</strong>
            </div>
          </div>
          <div className={`mt-4 rounded-lg p-2 text-center text-xs font-bold border ${
            isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950/40 text-blue-400 border-blue-500/20'
          }`}>
            LPV drop-off rate: {currentData.funnel.lpvDropOff}
          </div>
        </div>

        {/* E-COM FUNNEL */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <ShoppingCart className="h-4 w-4" />
            <span className="uppercase text-[11px] tracking-wider">E-COM FUNNEL</span>
          </div>
          <div className="mt-3.5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>View content</span>
              <strong className={textTitle}>{currentData.funnel.viewContent}</strong>
            </div>
            <div className="flex justify-between">
              <span>Add to cart</span>
              <strong className={textTitle}>{currentData.funnel.addToCart}</strong>
            </div>
            <div className="flex justify-between">
              <span>Checkout init</span>
              <strong className={textTitle}>{currentData.funnel.checkoutInit}</strong>
            </div>
          </div>
          <div className={`mt-4 rounded-lg p-2 text-center text-xs font-bold border ${
            isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950/40 text-blue-400 border-blue-500/20'
          }`}>
            Conv rate: {currentData.funnel.convRate}
          </div>
        </div>

        {/* AD ENGAGEMENT */}
        <div className={`rounded-xl border p-4 ${cardBg}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Heart className="h-4 w-4" />
            <span className="uppercase text-[11px] tracking-wider">AD ENGAGEMENT</span>
          </div>
          <div className="mt-3.5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Post reactions</span>
              <strong className={textTitle}>{currentData.funnel.postReactions}</strong>
            </div>
            <div className="flex justify-between">
              <span>Post comments</span>
              <strong className={textTitle}>{currentData.funnel.postComments}</strong>
            </div>
            <div className="flex justify-between">
              <span>Post shares</span>
              <strong className={textTitle}>{currentData.funnel.postShares}</strong>
            </div>
          </div>
          <div className={`mt-4 rounded-lg p-2 text-center text-xs font-bold border ${
            isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950/40 text-blue-400 border-blue-500/20'
          }`}>
            CTR: {currentData.funnel.ctr}
          </div>
        </div>
      </div>

      {/* 7. Breakdown by period & Creative analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Breakdown by period */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <h3 className={`text-xs font-bold ${textTitle}`}>
            Breakdown by period
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`text-[10px] uppercase border-b ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-500'
              }`}>
                <tr>
                  <th className="py-2">DATE</th>
                  <th className="py-2">SPEND</th>
                  <th className="py-2">SALES</th>
                  <th className="py-2 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {currentData.dailyDynamics.map((d, i) => (
                  <tr key={i} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/20'}`}>
                    <td className={`py-2 font-mono ${isLight ? 'text-slate-800 font-semibold' : 'text-slate-300'}`}>{d.date}</td>
                    <td className="py-2 font-semibold text-rose-500">${d.spend.toFixed(2)}</td>
                    <td className={`py-2 font-semibold ${isLight ? 'text-slate-800' : 'text-emerald-400'}`}>${d.sales.toFixed(2)}</td>
                    <td className={`py-2 text-right font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>{d.roas.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Creative analytics (MVP vs Underperformer) */}
        <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
          <h3 className={`text-xs font-bold ${textTitle}`}>
            Creative analytics
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* MVP Creative */}
            <div className={`rounded-xl border p-3.5 ${
              isLight 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                : 'bg-[#0a1e16] border-emerald-500/30 text-emerald-300'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                MVP CREATIVE
              </div>
              <div className="mt-1 text-xs font-bold truncate">
                {currentData.signals.mvpCreative}
              </div>
            </div>

            {/* Underperformer */}
            <div className={`rounded-xl border p-3.5 ${
              isLight 
                ? 'bg-rose-50/80 border-rose-200 text-rose-900' 
                : 'bg-[#251014] border-rose-500/30 text-rose-300'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                UNDERPERFORMER
              </div>
              <div className="mt-1 text-xs font-bold truncate">
                {currentData.signals.underperformer}
              </div>
            </div>
          </div>

          <div className={`text-[11px] ${textMuted}`}>
            Active Meta Ads Performance Monitoring
          </div>
        </div>
      </div>

      {/* 8. Campaigns Table with Status, Spend, Orders, Revenue, ROAS, Action */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className={`p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
          isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}>
          <h3 className={`text-sm font-bold ${textTitle}`}>
            Campaigns ({currentData.campaigns.length})
          </h3>

          <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs ${inputBg}`}>
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchCampaignQuery}
              onChange={(e) => setSearchCampaignQuery(e.target.value)}
              className="bg-transparent focus:outline-none w-32 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/70 border-slate-800 text-slate-400'
            }`}>
              <tr>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3">CAMPAIGN</th>
                <th className="px-4 py-3">SPEND</th>
                <th className="px-4 py-3">ORDERS</th>
                <th className="px-4 py-3">REVENUE</th>
                <th className="px-4 py-3">ROAS</th>
                <th className="px-4 py-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
              {currentData.campaigns.length > 0 ? (
                currentData.campaigns.map((camp) => (
                  <tr key={camp.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/30'}`}>
                    <td className="px-4 py-3">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                        {camp.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${textTitle}`}>
                      {camp.name}
                    </td>
                    <td className={`px-4 py-3 font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                      ${camp.spend.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 font-bold ${textTitle}`}>
                      {camp.orders}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ${camp.revenue.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 font-black text-cyan-600 dark:text-cyan-400">
                      {camp.roas.toFixed(2)}x
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button className="hover:text-blue-600 dark:hover:text-white" title="Toggle Status">
                          <Play className="h-3.5 w-3.5" />
                        </button>
                        <button className="hover:text-blue-600 dark:hover:text-white" title="Settings">
                          <Settings className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">
                    কোনো সক্রিয় ক্যাম্পেইন পাওয়া যায়নি। মেটা অ্যাড একাউন্ট কানেক্ট করলে অটোমেটিক সিঙ্ক হবে।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Six Deep Breakdown Tables (Exact 2x3 Grid from user screenshot with Cyan Left Accent Border) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* 1. AGE GROUP */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-4 ${cardBg}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${textTitle}`}>
            AGE GROUP
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className={`text-[9px] uppercase border-b ${isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-500'}`}>
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-600 dark:text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {currentData.ageBreakdown.map((row, i) => (
                  <tr key={i} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/20'}>
                    <td className={`py-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{row.group}</td>
                    <td className={`py-1 ${textMuted}`}>${row.spend.toFixed(0)}</td>
                    <td className={`py-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{row.sales}</td>
                    <td className={`py-1 ${textMuted}`}>${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-600 dark:text-cyan-400">{row.roas > 0 ? `${row.roas.toFixed(2)}x` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. REGION */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-4 ${cardBg}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${textTitle}`}>
            REGION
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className={`text-[9px] uppercase border-b ${isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-500'}`}>
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-600 dark:text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {currentData.regionBreakdown.map((row, i) => (
                  <tr key={i} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/20'}>
                    <td className={`py-1 font-semibold truncate max-w-[90px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{row.group}</td>
                    <td className={`py-1 ${textMuted}`}>${row.spend.toFixed(2)}</td>
                    <td className={`py-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{row.sales}</td>
                    <td className={`py-1 ${textMuted}`}>${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-600 dark:text-cyan-400">{row.roas > 0 ? `${row.roas.toFixed(2)}x` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. GENDER SPLIT */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-4 ${cardBg}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${textTitle}`}>
            GENDER SPLIT
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className={`text-[9px] uppercase border-b ${isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-500'}`}>
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-600 dark:text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {currentData.genderBreakdown.map((row, i) => (
                  <tr key={i} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/20'}>
                    <td className={`py-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{row.group}</td>
                    <td className={`py-1 ${textMuted}`}>${row.spend.toFixed(2)}</td>
                    <td className={`py-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{row.sales}</td>
                    <td className={`py-1 ${textMuted}`}>${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-600 dark:text-cyan-400">{row.roas > 0 ? `${row.roas.toFixed(2)}x` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. PLATFORM BREAKDOWN (FB / IG) */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-4 ${cardBg}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${textTitle}`}>
            PLATFORM BREAKDOWN (FB / IG)
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className={`text-[9px] uppercase border-b ${isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-500'}`}>
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-600 dark:text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {currentData.platformBreakdown.map((row, i) => (
                  <tr key={i} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/20'}>
                    <td className={`py-1 font-semibold truncate max-w-[90px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{row.group}</td>
                    <td className={`py-1 ${textMuted}`}>${row.spend.toFixed(2)}</td>
                    <td className={`py-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{row.sales}</td>
                    <td className={`py-1 ${textMuted}`}>${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-600 dark:text-cyan-400">{row.roas > 0 ? `${row.roas.toFixed(2)}x` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. PLACEMENT */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-4 ${cardBg}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${textTitle}`}>
            PLACEMENT
          </div>
          <div className={`py-10 text-center text-xs ${textMuted}`}>
            No live placement breakdown recorded for this period
          </div>
        </div>

        {/* 6. DEVICE MATRIX */}
        <div className={`rounded-xl border border-l-4 border-l-cyan-400 p-4 ${cardBg}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${textTitle}`}>
            DEVICE MATRIX
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className={`text-[9px] uppercase border-b ${isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-500'}`}>
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-600 dark:text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {currentData.deviceBreakdown.map((row, i) => (
                  <tr key={i} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/20'}>
                    <td className={`py-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{row.group}</td>
                    <td className={`py-1 ${textMuted}`}>${row.spend.toFixed(2)}</td>
                    <td className={`py-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{row.sales}</td>
                    <td className={`py-1 ${textMuted}`}>${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-600 dark:text-cyan-400">{row.roas > 0 ? `${row.roas.toFixed(2)}x` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
