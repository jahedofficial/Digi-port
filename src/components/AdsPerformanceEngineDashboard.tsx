'use client';

import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Clock, 
  Calendar, 
  DollarSign, 
  RefreshCw, 
  Play, 
  Pause, 
  Sliders, 
  ExternalLink, 
  Search, 
  Settings, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Award,
  Compass,
  ShoppingCart,
  Heart,
  Eye,
  MousePointer,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { CampaignData } from '@/types';

interface AdsPerformanceEngineDashboardProps {
  initialPlatform?: 'META' | 'GOOGLE' | 'TIKTOK' | 'AUDIT' | 'SEO';
  onNavigateToAudit?: () => void;
}

export const AdsPerformanceEngineDashboard: React.FC<AdsPerformanceEngineDashboardProps> = ({
  initialPlatform = 'META',
  onNavigateToAudit,
}) => {
  const [activePlatformTab, setActivePlatformTab] = useState<'META' | 'GOOGLE' | 'TIKTOK' | 'AUDIT' | 'SEO'>(initialPlatform);
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 days');
  const [searchCampaignQuery, setSearchCampaignQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Platform specific data simulation
  const platformConfig = {
    META: {
      title: 'Performance Engine',
      subtitle: 'META ADS INTELLIGENCE • ACTIVE 2026',
      accountName: 'Fakeit (act_942386384851346)',
      spend: 1420.00,
      purchases: 210,
      cpa: 6.76,
      roas: 4.20,
      impressions: 278000,
      clicks: 8640,
      cpc: 0.1643,
      topRegion: 'Dhaka Division (62% Order Volume)',
      bestAge: '21-34 (4.60x ROAS Winner)',
      topPlatform: 'Instagram Feed (Highest CVR)',
      bestCampaign: 'Dhaka City - Eid Lawn Collection CBO',
      mvpCreative: 'Lawn_3pc_EmeraldGreen_UGC_Review',
      underperformer: 'Video_Offer_Countdown_30Percent',
      campaigns: [
        { id: '1', name: 'Dhaka City - Eid Lawn Collection CBO', status: 'ACTIVE', spend: 640.00, orders: 112, revenue: 3104.00, roas: 4.85 },
        { id: '2', name: 'Retargeting - Cart Abandoners ABO 7D', status: 'ACTIVE', spend: 310.00, orders: 58, revenue: 1612.00, roas: 5.20 },
        { id: '3', name: 'Broad Prospecting - Women Kurtis & Stitched', status: 'ACTIVE', spend: 380.00, orders: 35, revenue: 931.00, roas: 2.45 },
        { id: '4', name: 'Test Creative - Festive Flash Sale', status: 'PAUSED', spend: 90.00, orders: 5, revenue: 117.00, roas: 1.30 },
      ],
      dailyDynamics: [
        { date: '2026-09-28', spend: 195.40, sales: 880.00, roas: 4.50 },
        { date: '2026-09-29', spend: 210.00, sales: 945.00, roas: 4.50 },
        { date: '2026-09-30', spend: 185.00, sales: 740.00, roas: 4.00 },
        { date: '2026-10-01', spend: 205.50, sales: 863.10, roas: 4.20 },
        { date: '2026-10-02', spend: 224.10, sales: 1053.27, roas: 4.70 },
        { date: '2026-10-03', spend: 210.00, sales: 882.00, roas: 4.20 },
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
        { group: 'Dhaka Division', spend: 880.40, sales: 142, cpa: 6.20, roas: 4.60 },
        { group: 'Chittagong Division', spend: 326.60, sales: 44, cpa: 7.42, roas: 3.80 },
        { group: 'Sylhet Division', spend: 113.60, sales: 14, cpa: 8.11, roas: 3.20 },
        { group: 'Rajshahi Division', spend: 56.80, sales: 6, cpa: 9.46, roas: 2.80 },
        { group: 'Khulna Division', spend: 42.60, sales: 4, cpa: 10.65, roas: 2.40 },
      ],
      genderBreakdown: [
        { group: 'Female', spend: 1192.80, sales: 184, cpa: 6.48, roas: 4.45 },
        { group: 'Male', spend: 198.80, sales: 24, cpa: 8.28, roas: 3.10 },
        { group: 'Other / Uncategorized', spend: 28.40, sales: 2, cpa: 14.20, roas: 2.00 },
      ],
      placementBreakdown: [
        { group: 'Instagram Feed', spend: 639.00, sales: 108, cpa: 5.91, roas: 4.80 },
        { group: 'Instagram Reels', spend: 355.00, sales: 52, cpa: 6.82, roas: 4.10 },
        { group: 'Facebook Feed', spend: 284.00, sales: 36, cpa: 7.88, roas: 3.60 },
        { group: 'Facebook Video Feeds', spend: 99.40, sales: 10, cpa: 9.94, roas: 2.80 },
        { group: 'Audience Network', spend: 42.60, sales: 4, cpa: 10.65, roas: 2.10 },
      ],
      deviceBreakdown: [
        { group: 'Mobile App (iOS)', spend: 426.00, sales: 74, cpa: 5.75, roas: 4.90 },
        { group: 'Mobile App (Android)', spend: 937.20, sales: 132, cpa: 7.10, roas: 3.95 },
        { group: 'Desktop Web', spend: 56.80, sales: 4, cpa: 14.20, roas: 2.20 },
      ],
    },
    GOOGLE: {
      title: 'Performance Engine',
      subtitle: 'GOOGLE ADS INTELLIGENCE (SEARCH & PMAX)',
      accountName: 'Google Ads (729-104-9210)',
      spend: 740.50,
      purchases: 92,
      cpa: 8.05,
      roas: 3.80,
      impressions: 114200,
      clicks: 3420,
      cpc: 0.2165,
      topRegion: 'Dhaka Division (71% Search Volume)',
      bestAge: '25-44 (4.10x ROAS Search Intent)',
      topPlatform: 'Google Search Top of Page',
      bestCampaign: 'BD_Search_Brand_Core (Sapphire & Lawn)',
      mvpCreative: 'Responsive Search Ad (Brand Core #1)',
      underperformer: 'Search_Generic_Unstitched_Dress',
      campaigns: [
        { id: '1', name: 'BD_Search_Brand_Core (Sapphire & Lawn)', status: 'ACTIVE', spend: 260.00, orders: 46, revenue: 1326.00, roas: 5.10 },
        { id: '2', name: 'PMax_High_Margin_Women_Fashion', status: 'ACTIVE', spend: 380.50, orders: 39, revenue: 1293.70, roas: 3.40 },
        { id: '3', name: 'Search_Generic_Unstitched_Dress', status: 'ACTIVE', spend: 100.00, orders: 7, revenue: 210.00, roas: 2.10 },
      ],
      dailyDynamics: [
        { date: '2026-09-28', spend: 98.00, sales: 382.20, roas: 3.90 },
        { date: '2026-09-29', spend: 105.00, sales: 420.00, roas: 4.00 },
        { date: '2026-09-30', spend: 112.50, sales: 405.00, roas: 3.60 },
        { date: '2026-10-01', spend: 115.00, sales: 448.50, roas: 3.90 },
        { date: '2026-10-02', spend: 120.00, sales: 480.00, roas: 4.00 },
        { date: '2026-10-03', spend: 190.00, sales: 677.20, roas: 3.56 },
      ],
      ageBreakdown: [
        { group: '18-24', spend: 111.00, sales: 12, cpa: 9.25, roas: 3.10 },
        { group: '25-34', spend: 370.25, sales: 52, cpa: 7.12, roas: 4.25 },
        { group: '35-44', spend: 185.10, sales: 22, cpa: 8.41, roas: 3.70 },
        { group: '45-54', spend: 59.20, sales: 5, cpa: 11.84, roas: 2.60 },
        { group: '55-64', spend: 14.95, sales: 1, cpa: 14.95, roas: 2.00 },
        { group: '65+', spend: 0, sales: 0, cpa: 0, roas: 0 },
      ],
      regionBreakdown: [
        { group: 'Dhaka Division', spend: 525.75, sales: 68, cpa: 7.73, roas: 4.10 },
        { group: 'Chittagong Division', spend: 148.10, sales: 17, cpa: 8.71, roas: 3.40 },
        { group: 'Sylhet Division', spend: 44.40, sales: 5, cpa: 8.88, roas: 3.10 },
        { group: 'Rajshahi Division', spend: 22.25, sales: 2, cpa: 11.12, roas: 2.40 },
      ],
      genderBreakdown: [
        { group: 'Female', spend: 555.30, sales: 74, cpa: 7.50, roas: 4.10 },
        { group: 'Male', spend: 148.10, sales: 15, cpa: 9.87, roas: 2.90 },
        { group: 'Unknown / Undefined', spend: 37.10, sales: 3, cpa: 12.36, roas: 2.20 },
      ],
      placementBreakdown: [
        { group: 'Google Search Top', spend: 407.25, sales: 58, cpa: 7.02, roas: 4.40 },
        { group: 'Performance Max Network', spend: 259.15, sales: 28, cpa: 9.25, roas: 3.20 },
        { group: 'Google Shopping Feed', spend: 74.10, sales: 6, cpa: 12.35, roas: 2.50 },
      ],
      deviceBreakdown: [
        { group: 'Mobile (Android & iOS)', spend: 592.40, sales: 76, cpa: 7.79, roas: 3.90 },
        { group: 'Desktop Computers', spend: 148.10, sales: 16, cpa: 9.25, roas: 3.40 },
      ],
    },
    TIKTOK: {
      title: 'Performance Engine',
      subtitle: 'TIKTOK ADS INTELLIGENCE (SPARK & IN-FEED)',
      accountName: 'TikTok For Business (adv_692810491028)',
      spend: 320.00,
      purchases: 40,
      cpa: 8.00,
      roas: 2.80,
      impressions: 93000,
      clicks: 2150,
      cpc: 0.1488,
      topRegion: 'Dhaka Gen-Z Urban (58% Video Views)',
      bestAge: '18-24 (41.2% Hook Rate)',
      topPlatform: 'TikTok Spark Ads In-Feed',
      bestCampaign: 'TikTok_Spark_UGC_GenZ_Lifestyle',
      mvpCreative: 'TikTok_TryOn_GetReadyWithMe (Viral Hook)',
      underperformer: 'TikTok_InFeed_SilkSaree_Offer',
      campaigns: [
        { id: '1', name: 'TikTok_Spark_UGC_GenZ_Lifestyle', status: 'ACTIVE', spend: 210.00, orders: 29, revenue: 682.50, roas: 3.25 },
        { id: '2', name: 'TikTok_InFeed_SilkSaree_Offer', status: 'ACTIVE', spend: 110.00, orders: 11, revenue: 236.50, roas: 2.15 },
      ],
      dailyDynamics: [
        { date: '2026-09-28', spend: 45.00, sales: 135.00, roas: 3.00 },
        { date: '2026-09-29', spend: 50.00, sales: 145.00, roas: 2.90 },
        { date: '2026-09-30', spend: 48.00, sales: 124.80, roas: 2.60 },
        { date: '2026-10-01', spend: 52.00, sales: 156.00, roas: 3.00 },
        { date: '2026-10-02', spend: 65.00, sales: 182.00, roas: 2.80 },
        { date: '2026-10-03', spend: 60.00, sales: 153.20, roas: 2.55 },
      ],
      ageBreakdown: [
        { group: '18-24', spend: 192.00, sales: 27, cpa: 7.11, roas: 3.10 },
        { group: '25-34', spend: 102.40, sales: 11, cpa: 9.30, roas: 2.40 },
        { group: '35-44', spend: 25.60, sales: 2, cpa: 12.80, roas: 1.90 },
      ],
      regionBreakdown: [
        { group: 'Dhaka Division', spend: 211.20, sales: 28, cpa: 7.54, roas: 3.00 },
        { group: 'Chittagong', spend: 64.00, sales: 7, cpa: 9.14, roas: 2.50 },
        { group: 'Other Divisions', spend: 44.80, sales: 5, cpa: 8.96, roas: 2.30 },
      ],
      genderBreakdown: [
        { group: 'Female', spend: 272.00, sales: 36, cpa: 7.55, roas: 2.95 },
        { group: 'Male', spend: 48.00, sales: 4, cpa: 12.00, roas: 1.95 },
      ],
      placementBreakdown: [
        { group: 'TikTok In-Feed For You Page', spend: 256.00, sales: 34, cpa: 7.52, roas: 2.95 },
        { group: 'TikTok Pangle Network', spend: 64.00, sales: 6, cpa: 10.66, roas: 2.20 },
      ],
      deviceBreakdown: [
        { group: 'Mobile (Android)', spend: 224.00, sales: 28, cpa: 8.00, roas: 2.75 },
        { group: 'Mobile (iOS)', spend: 96.00, sales: 12, cpa: 8.00, roas: 2.90 },
      ],
    },
    AUDIT: null,
    SEO: null,
  };

  const currentData = platformConfig[activePlatformTab as 'META' | 'GOOGLE' | 'TIKTOK'] || platformConfig.META;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Platform Switcher Pills (Matching user's screenshot exactly!) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2638] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Meta Ads pill */}
          <button
            onClick={() => setActivePlatformTab('META')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activePlatformTab === 'META'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#121826] text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            <span>Meta Ads</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </button>

          {/* Google Ads pill */}
          <button
            onClick={() => setActivePlatformTab('GOOGLE')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activePlatformTab === 'GOOGLE'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-[#121826] text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            <span>Google Ads</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </button>

          {/* TikTok Ads Intelligence */}
          <button
            onClick={() => setActivePlatformTab('TIKTOK')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activePlatformTab === 'TIKTOK'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-[#121826] text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" />
            <span>TikTok Ads Intelligence</span>
          </button>

          {/* OpenClaw Audit */}
          <button
            onClick={() => {
              if (onNavigateToAudit) onNavigateToAudit();
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium bg-[#121826] text-slate-300 hover:bg-slate-800 border border-slate-800 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>OpenClaw Audit</span>
          </button>

          {/* SEO Analytics */}
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium bg-[#121826] text-slate-300 hover:bg-slate-800 border border-slate-800 transition-all"
          >
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span>SEO Analytics</span>
          </button>
        </div>

        {/* Right Settings & Sync */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('API & Account Settings modal: OAuth tokens encrypted, auto refresh configured.')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#121826] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
          >
            <Sliders className="h-3 w-3 text-slate-400" />
            <span>API & Account Settings</span>
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg bg-black border border-slate-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-900 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* 2. Performance Engine Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e131f] p-5 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{currentData.title}</h2>
              <p className="text-[10px] font-mono tracking-wider text-slate-400">
                {currentData.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date range dropdown */}
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="Last 30 days">Last 30 days</option>
              <option value="Last 7 days">Last 7 days</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
            </select>

            {/* Ad account dropdown */}
            <select
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none"
            >
              <option>{currentData.accountName}</option>
            </select>

            {/* Status badge */}
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              Connected • Read & Write
            </span>

            {/* Manage in Hub button */}
            <button
              onClick={() => alert('Opening platform native Ads Manager in new tab')}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition-all"
            >
              <span>Manage in Hub</span>
              <ExternalLink className="h-3 w-3" />
            </button>

            {/* Refresh */}
            <button
              onClick={handleSync}
              className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 flex items-center justify-center hover:bg-slate-900"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
          Active Account: <strong className="text-slate-300">{currentData.accountName}</strong> • Background sync active every 2 hours.
        </div>
      </div>

      {/* 3. Top Metrics Row (Total ad spend, Web purchases, Cost per order, Blended ROAS [PROFIT ENGINE]) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total ad spend */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Total ad spend</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SPEND</span>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            ${currentData.spend.toFixed(2)}
          </div>
        </div>

        {/* Web purchases */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Web purchases</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ORDERS</span>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {currentData.purchases}
          </div>
        </div>

        {/* Cost per order */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Cost per order</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CPA INDEX</span>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
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

      {/* 4. Creative and audience winners (4 cards in a row) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Award className="h-4 w-4 text-cyan-400" />
          <span>Creative and audience winners</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Top Region */}
          <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              TOP REGION
            </div>
            <div className="mt-1 text-xs font-bold text-white truncate">
              {currentData.topRegion.split('(')[0]}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>{currentData.topRegion.split('(')[1]?.replace(')', '') || 'High Volume'}</span>
            </div>
          </div>

          {/* Best Age Range */}
          <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              BEST AGE RANGE
            </div>
            <div className="mt-1 text-xs font-bold text-white">
              {currentData.bestAge.split('(')[0]}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{currentData.bestAge.split('(')[1]?.replace(')', '') || 'Highest ROAS'}</span>
            </div>
          </div>

          {/* Top Platform */}
          <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              TOP PLATFORM
            </div>
            <div className="mt-1 text-xs font-bold text-white truncate">
              {currentData.topPlatform.split('(')[0]}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>{currentData.topPlatform.split('(')[1]?.replace(')', '') || 'Winning Channel'}</span>
            </div>
          </div>

          {/* Best Campaign */}
          <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              BEST CAMPAIGN
            </div>
            <div className="mt-1 text-xs font-bold text-white truncate">
              {currentData.bestCampaign}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Scale Recommended (+20%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Middle Two Column: Spend & ROAS Dynamics + 3 KPI Tiles */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Spend and ROAS dynamics (8 cols) */}
        <div className="rounded-2xl border border-slate-800 bg-[#0e131f] p-5 shadow-lg lg:col-span-8">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white">Spend and ROAS dynamics</h3>
            <p className="text-[11px] text-slate-400">
              Daily pacing, ad expenditure, and return on ad spend distribution
            </p>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            {currentData.dailyDynamics.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60 hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="font-mono text-slate-300">{item.date}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-rose-400 font-semibold">
                    Spend: ${item.spend.toFixed(2)}
                  </span>
                  <span className="text-slate-300">
                    Sales: ${item.sales.toFixed(2)}
                  </span>
                  <span className="font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
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
          <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              IMPRESSIONS
            </div>
            <div className="mt-2 flex items-center gap-2 text-2xl font-black text-white">
              <Eye className="h-5 w-5 text-purple-400" />
              <span>{currentData.impressions.toLocaleString()}</span>
            </div>
          </div>

          {/* Total clicks */}
          <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL CLICKS
            </div>
            <div className="mt-2 flex items-center gap-2 text-2xl font-black text-white">
              <MousePointer className="h-5 w-5 text-amber-400" />
              <span>{currentData.clicks.toLocaleString()}</span>
            </div>
          </div>

          {/* Avg CPC */}
          <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              AVG CPC
            </div>
            <div className="mt-2 flex items-center gap-2 text-2xl font-black text-white">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <span>${currentData.cpc.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Three Funnel Cards Row (TRAFFIC QUALITY, E-COM FUNNEL, AD ENGAGEMENT) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* TRAFFIC QUALITY */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <Compass className="h-4 w-4" />
            <span>TRAFFIC QUALITY</span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Outbound clicks:</span>
              <strong className="text-white">{currentData.clicks}</strong>
            </div>
            <div className="flex justify-between">
              <span>Landing page views:</span>
              <strong className="text-white">{Math.round(currentData.clicks * 0.88)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Cost / LPV:</span>
              <strong className="text-white">${(currentData.cpc * 1.14).toFixed(2)}</strong>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-cyan-950/40 p-2 text-center text-xs font-bold text-cyan-300 border border-cyan-500/20">
            LPV drop off rate: 12.00%
          </div>
        </div>

        {/* E-COM FUNNEL */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <ShoppingCart className="h-4 w-4" />
            <span>E-COM FUNNEL</span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>View content:</span>
              <strong className="text-white">6,240</strong>
            </div>
            <div className="flex justify-between">
              <span>Add to cart:</span>
              <strong className="text-white">840</strong>
            </div>
            <div className="flex justify-between">
              <span>Checkout init:</span>
              <strong className="text-white">390</strong>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-emerald-950/40 p-2 text-center text-xs font-bold text-emerald-300 border border-emerald-500/20">
            Conv rate: 2.43%
          </div>
        </div>

        {/* AD ENGAGEMENT */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
            <Heart className="h-4 w-4" />
            <span>AD ENGAGEMENT</span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Post reactions:</span>
              <strong className="text-white">5,520</strong>
            </div>
            <div className="flex justify-between">
              <span>Post comments:</span>
              <strong className="text-white">412</strong>
            </div>
            <div className="flex justify-between">
              <span>Post shares:</span>
              <strong className="text-white">186</strong>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-pink-950/40 p-2 text-center text-xs font-bold text-pink-300 border border-pink-500/20">
            CTR: 3.11%
          </div>
        </div>
      </div>

      {/* 7. Breakdown by period & Creative analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Breakdown by period */}
        <div className="rounded-2xl border border-slate-800 bg-[#0e131f] p-5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Breakdown by period
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Spend</th>
                  <th className="py-2">Sales</th>
                  <th className="py-2 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentData.dailyDynamics.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-800/20">
                    <td className="py-2 font-mono text-slate-300">{d.date}</td>
                    <td className="py-2 font-semibold text-rose-400">${d.spend.toFixed(2)}</td>
                    <td className="py-2 text-slate-300">${d.sales.toFixed(2)}</td>
                    <td className="py-2 text-right font-bold text-cyan-400">{d.roas.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Creative analytics (MVP vs Underperformer) */}
        <div className="rounded-2xl border border-slate-800 bg-[#0e131f] p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Creative analytics
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* MVP Creative */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                MVP CREATIVE
              </div>
              <div className="mt-1 text-xs font-bold text-white">
                {currentData.mvpCreative}
              </div>
              <div className="mt-2 text-[10px] text-emerald-300 font-medium">
                • 36.8% Hook • 4.85x ROAS
              </div>
            </div>

            {/* Underperformer */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                UNDERPERFORMER
              </div>
              <div className="mt-1 text-xs font-bold text-white">
                {currentData.underperformer}
              </div>
              <div className="mt-2 text-[10px] text-rose-300 font-medium">
                • High Fatigue • Frequency 4.2
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Active {activePlatformTab} Ads Performance Monitoring
          </div>
        </div>
      </div>

      {/* 8. Campaigns Table with Play/Pause & Actions */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e131f] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold text-white">
            Campaigns ({currentData.campaigns.length})
          </h3>

          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchCampaignQuery}
              onChange={(e) => setSearchCampaignQuery(e.target.value)}
              className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-32"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
            <tbody className="divide-y divide-slate-800/60">
              {currentData.campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      camp.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {camp.name}
                  </td>
                  <td className="px-4 py-3 text-slate-200 font-medium">
                    ${camp.spend.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    {camp.orders}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-400">
                    ${camp.revenue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-black text-cyan-400">
                    {camp.roas.toFixed(2)}x
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button 
                        onClick={() => alert(`Toggled status for ${camp.name}`)}
                        className="hover:text-white"
                        title={camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
                      >
                        {camp.status === 'ACTIVE' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                      <button 
                        onClick={() => alert(`Adjust settings for ${camp.name}`)}
                        className="hover:text-white"
                        title="Campaign Settings"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Six Deep Breakdown Tables (Exact 2x3 Grid from user screenshot) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* 1. AGE GROUP */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            AGE GROUP
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentData.ageBreakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/20">
                    <td className="py-1 font-semibold text-slate-200">{row.group}</td>
                    <td className="py-1 text-slate-400">${row.spend.toFixed(0)}</td>
                    <td className="py-1 text-slate-300">{row.sales}</td>
                    <td className="py-1 text-slate-400">${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-400">{row.roas > 0 ? `${row.roas.toFixed(2)}x` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. REGION */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            REGION
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentData.regionBreakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/20">
                    <td className="py-1 font-semibold text-slate-200 truncate max-w-[90px]">{row.group}</td>
                    <td className="py-1 text-slate-400">${row.spend.toFixed(0)}</td>
                    <td className="py-1 text-slate-300">{row.sales}</td>
                    <td className="py-1 text-slate-400">${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-400">{row.roas.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. GENDER SPLIT */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            GENDER SPLIT
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentData.genderBreakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/20">
                    <td className="py-1 font-semibold text-slate-200">{row.group}</td>
                    <td className="py-1 text-slate-400">${row.spend.toFixed(0)}</td>
                    <td className="py-1 text-slate-300">{row.sales}</td>
                    <td className="py-1 text-slate-400">${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-400">{row.roas.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. PLATFORM BREAKDOWN (FB / IG) */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            PLATFORM BREAKDOWN ({activePlatformTab})
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentData.placementBreakdown.slice(0, 3).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/20">
                    <td className="py-1 font-semibold text-slate-200 truncate max-w-[90px]">{row.group}</td>
                    <td className="py-1 text-slate-400">${row.spend.toFixed(0)}</td>
                    <td className="py-1 text-slate-300">{row.sales}</td>
                    <td className="py-1 text-slate-400">${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-400">{row.roas.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. PLACEMENT */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            PLACEMENT
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentData.placementBreakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/20">
                    <td className="py-1 font-semibold text-slate-200 truncate max-w-[90px]">{row.group}</td>
                    <td className="py-1 text-slate-400">${row.spend.toFixed(0)}</td>
                    <td className="py-1 text-slate-300">{row.sales}</td>
                    <td className="py-1 text-slate-400">${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-400">{row.roas.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. DEVICE MATRIX */}
        <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-4 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            DEVICE MATRIX
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-1.5">GROUP</th>
                  <th className="pb-1.5">SPEND</th>
                  <th className="pb-1.5">SALES</th>
                  <th className="pb-1.5">CPA</th>
                  <th className="pb-1.5 text-right text-cyan-400">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentData.deviceBreakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/20">
                    <td className="py-1 font-semibold text-slate-200 truncate max-w-[90px]">{row.group}</td>
                    <td className="py-1 text-slate-400">${row.spend.toFixed(0)}</td>
                    <td className="py-1 text-slate-300">{row.sales}</td>
                    <td className="py-1 text-slate-400">${row.cpa.toFixed(0)}</td>
                    <td className="py-1 text-right font-bold text-cyan-400">{row.roas.toFixed(2)}x</td>
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
