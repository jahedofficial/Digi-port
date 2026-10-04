'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  Edit3, 
  Search, 
  Download, 
  Flame, 
  AlertTriangle, 
  Layers, 
  Zap, 
  Globe, 
  Radio, 
  CreditCard, 
  BarChart2,
  Calendar,
  Eye,
  EyeOff,
  ArrowUpRight,
  Activity,
  Sparkles,
  Smartphone,
  Monitor,
  ShoppingBag,
  ShoppingCart,
  ChevronRight,
  Clock,
  MapPin,
  Server,
  ArrowDownRight,
  ShieldCheck,
  Percent,
  Filter,
  Check
} from 'lucide-react';
import { CampaignData, CreativeData, MetricSummary } from '@/types';

interface GtmGa4AnalyticsDashboardProps {
  metrics: MetricSummary;
  campaigns: CampaignData[];
  creatives: CreativeData[];
  theme?: 'light' | 'dark';
  onToggleStatus: (campaignId: string) => void;
  onScaleBudget: (campaignId: string) => void;
  onPauseCreative: (adId: string) => void;
}

export const GtmGa4AnalyticsDashboard: React.FC<GtmGa4AnalyticsDashboardProps> = ({
  metrics,
  campaigns,
  creatives,
  theme = 'light',
  onToggleStatus,
  onScaleBudget,
  onPauseCreative,
}) => {
  const isLight = theme === 'light';
  const [currency, setCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | '7d' | '30d' | 'month'>('7d');
  const [activeReportSubTab, setActiveReportSubTab] = useState<'SNAPSHOT' | 'TRAFFIC' | 'ECOMMERCE' | 'REALTIME'>('SNAPSHOT');
  const [chartMetric, setChartMetric] = useState<'REVENUE' | 'PURCHASES' | 'SESSIONS' | 'ROAS'>('REVENUE');
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Interactive Chart State
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const [hiddenChannels, setHiddenChannels] = useState<string[]>([]);

  // Subtab-specific filter states
  const [trafficDimension, setTrafficDimension] = useState<'CHANNEL' | 'SOURCE_MEDIUM' | 'CAMPAIGN'>('SOURCE_MEDIUM');
  const [trafficSearch, setTrafficSearch] = useState('');
  const [ecommerceSearch, setEcommerceSearch] = useState('');
  const [realtimeFilter, setRealtimeFilter] = useState<'ALL' | 'PURCHASES' | 'CART'>('ALL');

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Currency multiplier: 1 USD = 120 BDT
  const currSymbol = currency === 'BDT' ? '৳' : '$';
  const rate = currency === 'BDT' ? 120 : 1;

  const formatMoney = (amountInUsd: number) => {
    const val = amountInUsd * rate;
    return `${currSymbol}${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const toggleChannel = (channelId: string) => {
    if (hiddenChannels.includes(channelId)) {
      setHiddenChannels(hiddenChannels.filter(id => id !== channelId));
    } else {
      if (hiddenChannels.length >= 4) return; // Keep at least one visible
      setHiddenChannels([...hiddenChannels, channelId]);
    }
  };

  // Theme Palette Tokens
  const cardBg = isLight 
    ? 'bg-white border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' 
    : 'bg-[#121620] border-[#1b2230] shadow-sm';
  const innerCard = isLight 
    ? 'bg-slate-50/90 border-slate-200' 
    : 'bg-[#0a0d14] border-[#1e2638]';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputBg = isLight 
    ? 'bg-white border-slate-200 text-slate-800' 
    : 'bg-[#0a0d14] border-[#1e2638] text-slate-200';
  const tableHeaderBg = isLight 
    ? 'bg-slate-50/90 text-slate-500 border-slate-200' 
    : 'bg-[#0a0d14] text-slate-400 border-[#1b2230]';
  const tableBorder = isLight 
    ? 'border-slate-200 divide-slate-100' 
    : 'border-[#1b2230] divide-[#1b2230]';
  const rowHover = isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#161c28]';

  // Master Channels Data
  const hasLiveAttribution = (campaigns && campaigns.length > 0) || (metrics && metrics.spend > 0);

  const channelData = [
    {
      id: 'meta',
      name: 'Meta Ads (Facebook & IG)',
      shortName: 'Meta Ads',
      sub: 'facebook / cpc, instagram / cpc',
      sessions: hasLiveAttribution ? 8640 : 0,
      engagedUsers: hasLiveAttribution ? 5920 : 0,
      spendUsd: hasLiveAttribution ? 1420.00 : 0,
      purchases: hasLiveAttribution ? 210 : 0,
      revenueUsd: hasLiveAttribution ? 5964.00 : 0,
      roas: hasLiveAttribution ? 4.20 : 0,
      cpaUsd: hasLiveAttribution ? 6.76 : 0,
      cvr: hasLiveAttribution ? 2.43 : 0,
      color: '#3b82f6',
      sharePct: hasLiveAttribution ? 57 : 0,
    },
    {
      id: 'google',
      name: 'Google Ads (Search & PMax)',
      shortName: 'Google Ads',
      sub: 'google / cpc',
      sessions: hasLiveAttribution ? 3420 : 0,
      engagedUsers: hasLiveAttribution ? 2480 : 0,
      spendUsd: hasLiveAttribution ? 740.50 : 0,
      purchases: hasLiveAttribution ? 92 : 0,
      revenueUsd: hasLiveAttribution ? 2813.90 : 0,
      roas: hasLiveAttribution ? 3.80 : 0,
      cpaUsd: hasLiveAttribution ? 8.05 : 0,
      cvr: hasLiveAttribution ? 2.69 : 0,
      color: '#f59e0b',
      sharePct: hasLiveAttribution ? 30 : 0,
    },
    {
      id: 'tiktok',
      name: 'TikTok for Business Ads',
      shortName: 'TikTok Ads',
      sub: 'tiktok / cpc',
      sessions: hasLiveAttribution ? 2150 : 0,
      engagedUsers: hasLiveAttribution ? 1420 : 0,
      spendUsd: hasLiveAttribution ? 320.00 : 0,
      purchases: hasLiveAttribution ? 40 : 0,
      revenueUsd: hasLiveAttribution ? 896.00 : 0,
      roas: hasLiveAttribution ? 2.80 : 0,
      cpaUsd: hasLiveAttribution ? 8.00 : 0,
      cvr: hasLiveAttribution ? 1.86 : 0,
      color: '#f43f5e',
      sharePct: hasLiveAttribution ? 13 : 0,
    },
    {
      id: 'organic',
      name: 'Organic Search (SEO)',
      shortName: 'Organic Search',
      sub: 'google / organic',
      sessions: hasLiveAttribution ? 1820 : 0,
      engagedUsers: hasLiveAttribution ? 1340 : 0,
      spendUsd: 0,
      purchases: hasLiveAttribution ? 18 : 0,
      revenueUsd: hasLiveAttribution ? 620.00 : 0,
      roas: 0,
      cpaUsd: 0,
      cvr: hasLiveAttribution ? 0.99 : 0,
      color: '#10b981',
      sharePct: 0,
    },
    {
      id: 'direct',
      name: 'Direct & Brand Traffic',
      shortName: 'Direct',
      sub: 'direct / none',
      sessions: hasLiveAttribution ? 1420 : 0,
      engagedUsers: hasLiveAttribution ? 1110 : 0,
      spendUsd: 0,
      purchases: hasLiveAttribution ? 15 : 0,
      revenueUsd: hasLiveAttribution ? 540.00 : 0,
      roas: 0,
      cpaUsd: 0,
      cvr: hasLiveAttribution ? 1.05 : 0,
      color: '#a855f7',
      sharePct: 0,
    },
  ];

  // 8-Day Historical Data Points matching user's timeline (09/26 to 10/03 Today)
  const chartDays = [
    { label: '09/26', dateStr: 'Sep 26, 2026', dayName: 'Friday' },
    { label: '09/27', dateStr: 'Sep 27, 2026', dayName: 'Saturday' },
    { label: '09/28', dateStr: 'Sep 28, 2026', dayName: 'Sunday' },
    { label: '09/29', dateStr: 'Sep 29, 2026', dayName: 'Monday' },
    { label: '09/30', dateStr: 'Sep 30, 2026', dayName: 'Tuesday' },
    { label: '10/01', dateStr: 'Oct 01, 2026', dayName: 'Wednesday' },
    { label: '10/02', dateStr: 'Oct 02, 2026', dayName: 'Thursday' },
    { label: '10/03', dateStr: 'Oct 03, 2026 (Today)', dayName: 'Today', isToday: true },
  ];

  // Raw Channel Trend Series across 8 days
  const chartSeries = [
    {
      id: 'meta',
      name: 'Meta Ads',
      color: '#3b82f6',
      gradientId: 'metaGradient',
      data: {
        REVENUE: hasLiveAttribution ? [480, 610, 740, 880, 1040, 1110, 1220, 1310] : [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: hasLiveAttribution ? [16, 21, 25, 30, 35, 37, 41, 44] : [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: hasLiveAttribution ? [720, 890, 1050, 1220, 1420, 1510, 1680, 1780] : [0, 0, 0, 0, 0, 0, 0, 0],
        ROAS: hasLiveAttribution ? [3.9, 4.0, 4.1, 4.2, 4.4, 4.3, 4.5, 4.6] : [0, 0, 0, 0, 0, 0, 0, 0],
      }
    },
    {
      id: 'google',
      name: 'Google Ads',
      color: '#f59e0b',
      gradientId: 'googleGradient',
      data: {
        REVENUE: hasLiveAttribution ? [270, 330, 390, 450, 520, 560, 590, 630] : [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: hasLiveAttribution ? [9, 11, 13, 15, 17, 18, 19, 21] : [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: hasLiveAttribution ? [340, 410, 470, 530, 590, 620, 660, 700] : [0, 0, 0, 0, 0, 0, 0, 0],
        ROAS: hasLiveAttribution ? [3.5, 3.6, 3.7, 3.8, 3.9, 3.9, 4.0, 4.1] : [0, 0, 0, 0, 0, 0, 0, 0],
      }
    },
    {
      id: 'tiktok',
      name: 'TikTok Ads',
      color: '#f43f5e',
      gradientId: 'tiktokGradient',
      data: {
        REVENUE: hasLiveAttribution ? [95, 115, 135, 150, 170, 185, 195, 210] : [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: hasLiveAttribution ? [3, 4, 5, 5, 6, 7, 7, 8] : [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: hasLiveAttribution ? [200, 240, 280, 310, 350, 380, 410, 440] : [0, 0, 0, 0, 0, 0, 0, 0],
        ROAS: hasLiveAttribution ? [2.5, 2.6, 2.7, 2.8, 2.8, 2.9, 2.9, 3.0] : [0, 0, 0, 0, 0, 0, 0, 0],
      }
    },
    {
      id: 'organic',
      name: 'Organic Search',
      color: '#10b981',
      gradientId: 'organicGradient',
      dashed: true,
      data: {
        REVENUE: hasLiveAttribution ? [55, 62, 70, 78, 85, 90, 94, 102] : [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: hasLiveAttribution ? [2, 2, 2, 3, 3, 3, 4, 4] : [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: hasLiveAttribution ? [170, 190, 210, 230, 255, 270, 285, 300] : [0, 0, 0, 0, 0, 0, 0, 0],
        ROAS: [0, 0, 0, 0, 0, 0, 0, 0],
      }
    },
    {
      id: 'direct',
      name: 'Direct',
      color: '#a855f7',
      gradientId: 'directGradient',
      data: {
        REVENUE: hasLiveAttribution ? [40, 48, 55, 62, 70, 75, 78, 85] : [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: hasLiveAttribution ? [1, 2, 2, 2, 3, 3, 3, 3] : [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: hasLiveAttribution ? [130, 145, 160, 175, 190, 205, 215, 230] : [0, 0, 0, 0, 0, 0, 0, 0],
        ROAS: [0, 0, 0, 0, 0, 0, 0, 0],
      }
    },
  ];

  // Helper to format values according to current metric
  const formatMetricVal = (val: number, metric = chartMetric) => {
    if (metric === 'REVENUE') {
      const conv = val * rate;
      return `${currSymbol}${Math.round(conv).toLocaleString()}`;
    }
    if (metric === 'PURCHASES') {
      return `${Math.round(val)} orders`;
    }
    if (metric === 'SESSIONS') {
      return `${Math.round(val).toLocaleString()} visits`;
    }
    if (metric === 'ROAS') {
      return val > 0 ? `${val.toFixed(2)}x` : 'Organic';
    }
    return val.toString();
  };

  // SVG Chart Geometry Calculations
  const svgWidth = 840;
  const svgHeight = 230;
  const marginLeft = 65;
  const marginRight = 35;
  const marginTop = 25;
  const marginBottom = 35;
  const chartW = svgWidth - marginLeft - marginRight;
  const chartH = svgHeight - marginTop - marginBottom;

  // Compute Max Value across all visible channels for scaling
  const visibleSeries = chartSeries.filter(s => !hiddenChannels.includes(s.id));
  let maxRawVal = 10;
  visibleSeries.forEach(s => {
    const vals = s.data[chartMetric];
    vals.forEach(v => {
      const scaledV = chartMetric === 'REVENUE' ? v * rate : v;
      if (scaledV > maxRawVal) maxRawVal = scaledV;
    });
  });
  const maxAxisVal = maxRawVal * 1.15; // 15% headroom

  // Compute Coordinates for each series
  const seriesPlotData = chartSeries.map(s => {
    const rawVals = s.data[chartMetric];
    const points = rawVals.map((val, idx) => {
      const scaledVal = chartMetric === 'REVENUE' ? val * rate : val;
      const x = marginLeft + idx * (chartW / (chartDays.length - 1));
      const y = marginTop + chartH * (1 - (scaledVal / (maxAxisVal || 1)));
      return { x, y, rawVal: val, scaledVal };
    });

    // Smooth Bezier Curve Algorithm
    let curvePath = '';
    if (points.length > 0) {
      curvePath = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        curvePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
      }
    }

    const baselineY = marginTop + chartH;
    const areaPath = points.length > 0 
      ? `${curvePath} L ${points[points.length - 1].x.toFixed(1)},${baselineY} L ${points[0].x.toFixed(1)},${baselineY} Z`
      : '';

    return {
      ...s,
      points,
      curvePath,
      areaPath,
      isVisible: !hiddenChannels.includes(s.id),
      totalValue: rawVals.reduce((acc, curr) => acc + curr, 0),
    };
  });

  // Calculate day total for hovered tooltip
  const getDayBreakdown = (dayIdx: number) => {
    let dayTotal = 0;
    const channelItems = visibleSeries.map(s => {
      const val = s.data[chartMetric][dayIdx];
      const scaledVal = chartMetric === 'REVENUE' ? val * rate : val;
      dayTotal += scaledVal;
      return {
        id: s.id,
        name: s.name,
        color: s.color,
        val: val,
        scaledVal: scaledVal,
      };
    });

    return {
      dayTotal,
      items: channelItems.map(item => ({
        ...item,
        pct: dayTotal > 0 ? ((item.scaledVal / dayTotal) * 100).toFixed(1) : '0',
      })),
    };
  };

  // Y-axis tick values
  const yTicks = [
    { pct: 1.0, val: maxAxisVal, y: marginTop },
    { pct: 0.75, val: maxAxisVal * 0.75, y: marginTop + chartH * 0.25 },
    { pct: 0.5, val: maxAxisVal * 0.5, y: marginTop + chartH * 0.5 },
    { pct: 0.25, val: maxAxisVal * 0.25, y: marginTop + chartH * 0.75 },
    { pct: 0.0, val: 0, y: marginTop + chartH },
  ];

  const formatYTick = (val: number) => {
    if (val === 0) return '0';
    if (chartMetric === 'REVENUE') {
      if (val >= 1000000) return `${currSymbol}${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${currSymbol}${Math.round(val / 1000)}k`;
      return `${currSymbol}${Math.round(val)}`;
    }
    if (chartMetric === 'ROAS') return `${val.toFixed(1)}x`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return Math.round(val).toString();
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Card (Matching Google Analytics 4 — Single Source of Truth) */}
      <div className={`rounded-xl sm:rounded-2xl border p-3.5 sm:p-4.5 ${cardBg}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: GA4 Brand & Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Modern Google Analytics Icon */}
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm">
              <div className="flex items-end gap-0.5 sm:gap-1 h-4 sm:h-5 w-4 sm:w-5 justify-center">
                <span className="w-1 sm:w-1.5 h-2 sm:h-2.5 bg-gradient-to-t from-amber-500 to-yellow-400 rounded-xs" />
                <span className="w-1 sm:w-1.5 h-4 sm:h-5 bg-gradient-to-t from-orange-500 to-amber-400 rounded-xs" />
                <span className="w-1 sm:w-1.5 h-3 sm:h-3.5 bg-gradient-to-t from-amber-600 to-orange-500 rounded-xs" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
                <h2 className={`text-sm sm:text-base font-bold tracking-tight whitespace-nowrap ${textTitle}`}>
                  Google Analytics 4
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold whitespace-nowrap shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Server-Side </span>SSOT
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="font-mono text-slate-500 dark:text-slate-400 font-medium shrink-0">GA4-482910541</span>
                <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 hidden sm:inline shrink-0">G-SSSERVER89</span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline shrink-0">•</span>
                <span className="text-emerald-500 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  API Active
                </span>
              </div>
            </div>
          </div>

          {/* Right: Currency Toggle + Manual Refresh */}
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full lg:w-auto">
            {/* Currency Pill */}
            <div className={`flex items-center rounded-lg border p-0.5 text-[11px] sm:text-xs font-semibold ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'border-[#1e2638] bg-[#0a0d14]'
            }`}>
              <button
                onClick={() => setCurrency('BDT')}
                className={`rounded px-2 sm:px-2.5 py-1 transition-all ${
                  currency === 'BDT' 
                    ? isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white' 
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                BDT (৳)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`rounded px-2 sm:px-2.5 py-1 transition-all ${
                  currency === 'USD' 
                    ? isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white' 
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>

            {/* Time Filter Dropdown / Pill */}
            <div className={`flex items-center gap-1 rounded-lg border px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'border-[#1e2638] bg-[#0a0d14] text-slate-300'
            }`}>
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>Last 7 Days</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              className={`flex items-center gap-1.5 rounded-lg border p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold transition-all shrink-0 ${
                isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-[#1e2638] bg-[#0a0d14] text-slate-300 hover:bg-slate-800'
              }`}
              title="Refresh GA4 Server-Side Stream"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sub-nav Pills (Reports Snapshot, Traffic & Acquisition, E-commerce, Realtime Stream) */}
        <div className={`mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 border-t pt-2.5 sm:pt-3 overflow-x-auto no-scrollbar pb-0.5 text-xs font-semibold ${
          isLight ? 'border-slate-100' : 'border-[#1b2230]'
        }`}>
          <button
            onClick={() => setActiveReportSubTab('SNAPSHOT')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 shrink-0 whitespace-nowrap text-[11px] sm:text-xs transition-all ${
              activeReportSubTab === 'SNAPSHOT'
                ? isLight 
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900' 
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight 
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Layers className={`h-3.5 w-3.5 ${activeReportSubTab === 'SNAPSHOT' ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span>Reports Snapshot</span>
            {activeReportSubTab === 'SNAPSHOT' && (
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveReportSubTab('TRAFFIC')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 shrink-0 whitespace-nowrap text-[11px] sm:text-xs transition-all ${
              activeReportSubTab === 'TRAFFIC'
                ? isLight 
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900' 
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight 
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Globe className={`h-3.5 w-3.5 ${activeReportSubTab === 'TRAFFIC' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Traffic & Acquisition</span>
            <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold ${
              activeReportSubTab === 'TRAFFIC' ? 'bg-white/20 text-white' : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400')
            }`}>
              {hasLiveAttribution ? '17.4k' : '0'}
            </span>
          </button>

          <button
            onClick={() => setActiveReportSubTab('ECOMMERCE')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 shrink-0 whitespace-nowrap text-[11px] sm:text-xs transition-all ${
              activeReportSubTab === 'ECOMMERCE'
                ? isLight 
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900' 
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight 
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <CreditCard className={`h-3.5 w-3.5 ${activeReportSubTab === 'ECOMMERCE' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>E-commerce</span>
            <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold ${
              activeReportSubTab === 'ECOMMERCE' ? 'bg-white/20 text-white' : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400')
            }`}>
              {hasLiveAttribution ? '387 Orders' : `${metrics.conversions} Orders`}
            </span>
          </button>

          <button
            onClick={() => setActiveReportSubTab('REALTIME')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 shrink-0 whitespace-nowrap text-[11px] sm:text-xs transition-all ${
              activeReportSubTab === 'REALTIME'
                ? isLight 
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900' 
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight 
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span>Realtime</span>
            <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              {hasLiveAttribution ? '18 Live' : '0 Live'}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: REPORTS SNAPSHOT (Full Executive Overview with Redesigned Chart)
         ========================================================================= */}
      {activeReportSubTab === 'SNAPSHOT' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 2. Top KPI Cards Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* USERS */}
            <div className={`rounded-xl border p-4 ${cardBg}`}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">USERS</span>
                <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <div className={`mt-2 text-2xl font-black ${textTitle}`}>
                {hasLiveAttribution ? '14,210' : '0'}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>New users: {hasLiveAttribution ? '9,840' : '0'}</span>
                <span className="text-slate-400 font-medium">GA4 Direct</span>
              </div>
            </div>

            {/* KEY EVENTS (PURCHASES) */}
            <div className={`rounded-xl border p-4 ${cardBg}`}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">KEY EVENTS (PURCHASES)</span>
                <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <div className={`mt-2 text-2xl font-black ${textTitle}`}>
                {metrics.conversions} orders
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Total Items: {hasLiveAttribution ? '442' : '0'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {hasLiveAttribution ? '99.8% match' : '0%'}
                </span>
              </div>
            </div>

            {/* TOTAL REVENUE */}
            <div className={`rounded-xl border p-4 ${cardBg}`}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">TOTAL REVENUE</span>
                <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
                  Verified
                </span>
              </div>
              <div className={`mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400`}>
                {formatMoney(metrics.revenue)}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>AOV: {formatMoney(metrics.revenue / (metrics.conversions || 1))}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {hasLiveAttribution ? '+18.4%' : '0%'}
                </span>
              </div>
            </div>

            {/* TRUE BLENDED ROAS */}
            <div className={`rounded-xl border p-4 ${cardBg}`}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">TRUE BLENDED ROAS</span>
                <span className="rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 border border-indigo-500/30">
                  SSOT
                </span>
              </div>
              <div className={`mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400`}>
                {metrics.roas.toFixed(2)}x
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Total Spend: {formatMoney(metrics.spend)}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">CPA: {formatMoney(metrics.cpa)}</span>
              </div>
            </div>

            {/* USER CONVERSION RATE */}
            <div className={`rounded-xl border p-4 ${cardBg}`}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">USER CONVERSION RATE</span>
                <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <div className={`mt-2 text-2xl font-black ${textTitle}`}>
                2.41%
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Purchases / Visits</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">High Intent</span>
              </div>
            </div>
          </div>

          {/* 3. Growth & Campaign Decisions (GROWTH INTELLIGENCE) */}
          <div className={`rounded-xl border p-4.5 ${cardBg}`}>
            <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3 ${
              isLight ? 'border-slate-100' : 'border-[#1b2230]'
            }`}>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${textTitle}`}>Growth & Campaign Decisions</h3>
                  <p className="text-[11px] text-slate-400">
                    Live API metrics for apparel inventory, retargeting ROAS, and repeat customer retention
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                GROWTH INTELLIGENCE
              </span>
            </div>

            {/* 5 Decision Cards */}
            <div className="mt-3.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* 1. CART ABANDONMENT */}
              <div className={`rounded-xl border p-3.5 ${innerCard}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">1. CART ABANDONMENT</span>
                  <span className="rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] font-bold px-1.5 py-0.5 border border-rose-500/30">
                    {hasLiveAttribution ? 'High Drop-off' : 'No Data'}
                  </span>
                </div>
                <div className="mt-2 text-xl font-black text-rose-600 dark:text-rose-400">
                  {hasLiveAttribution ? '68.4%' : '0.0%'}
                </div>
                <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  {hasLiveAttribution ? '• Retargeting Ad Required' : '• Waiting for cart activity'}
                </div>
                <div className="mt-0.5 text-[9px] text-slate-400">
                  Formula: (1 - Orders/Add-to-Cart)
                </div>
              </div>

              {/* 2. ADD-TO-CART RATE */}
              <div className={`rounded-xl border p-3.5 ${innerCard}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">2. ADD-TO-CART RATE</span>
                  <span className="rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[9px] font-bold px-1.5 py-0.5 border border-cyan-500/30">
                    {hasLiveAttribution ? 'Purchase Intent' : 'No Data'}
                  </span>
                </div>
                <div className="mt-2 text-xl font-black text-cyan-600 dark:text-cyan-400">
                  {hasLiveAttribution ? '28.6%' : '0.0%'}
                </div>
                <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-300 font-medium">
                  • {hasLiveAttribution ? '1,120' : '0'} cart actions
                </div>
                <div className="mt-0.5 text-[9px] text-slate-400">
                  Ad vs Store Price-Match Fit
                </div>
              </div>

              {/* 3. CUSTOMER LTV */}
              <div className={`rounded-xl border p-3.5 ${innerCard}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">3. CUSTOMER LTV</span>
                  <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
                    {hasLiveAttribution ? 'Long Term Val' : 'No Data'}
                  </span>
                </div>
                <div className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {hasLiveAttribution ? formatMoney(64.50) : formatMoney(0)}
                </div>
                <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-300 font-medium">
                  • {hasLiveAttribution ? '2.3' : '0'} repeat purchases/yr
                </div>
                <div className="mt-0.5 text-[9px] text-slate-400">
                  CAC Recovery Power
                </div>
              </div>

              {/* 4. VIEW-TO-PURCHASE */}
              <div className={`rounded-xl border p-3.5 ${innerCard}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">4. VIEW-TO-PURCHASE</span>
                  <span className="rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[9px] font-bold px-1.5 py-0.5 border border-purple-500/30">
                    {hasLiveAttribution ? 'Item Velocity' : 'No Data'}
                  </span>
                </div>
                <div className="mt-2 text-xl font-black text-purple-600 dark:text-purple-400">
                  {hasLiveAttribution ? '4.18%' : '0.00%'}
                </div>
                <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-300 font-medium">
                  • {hasLiveAttribution ? '342 orders / 8,180 views' : `${metrics.conversions || 0} orders / 0 views`}
                </div>
                <div className="mt-0.5 text-[9px] text-slate-400">
                  Stock Re-order & Ad Shift
                </div>
              </div>

              {/* 5. NEW VS RETURNING */}
              <div className={`rounded-xl border p-3.5 ${innerCard}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">5. NEW VS RETURNING</span>
                  <span className="rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 border border-indigo-500/30">
                    {hasLiveAttribution ? 'Buyer Split' : 'No Data'}
                  </span>
                </div>
                <div className={`mt-2 text-sm font-bold ${textTitle}`}>
                  {hasLiveAttribution ? (
                    <><span className="text-cyan-600 dark:text-cyan-400 font-black">40%</span> New / <span className="text-emerald-600 dark:text-emerald-400 font-black">60%</span> Repeat</>
                  ) : (
                    '0% New / 0% Repeat'
                  )}
                </div>
                <div className={`mt-1.5 h-1.5 w-full rounded-full overflow-hidden flex ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div className="bg-cyan-500" style={{ width: hasLiveAttribution ? '40%' : '0%' }} />
                  <div className="bg-emerald-500" style={{ width: hasLiveAttribution ? '60%' : '0%' }} />
                </div>
                <div className="mt-1 text-[9px] text-slate-400">
                  {hasLiveAttribution ? '137 New • 205 Repeat | Retention Active' : 'No customer history recorded'}
                </div>
              </div>
            </div>
          </div>

          {/* 4. VERIFIED PURCHASE REVENUE OVER TIME (COMPLETELY REDESIGNED CHART) */}
          <div className={`rounded-xl border p-5 ${cardBg} relative overflow-hidden transition-all duration-300`}>
            {/* Top Bar: Title + Metric Switcher */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-sm">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${textTitle} flex items-center gap-2`}>
                      Verified Multi-Channel Performance over time
                      <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/20">
                        GA4 Verified
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Cross-channel attribution breakdown with server-side transaction matching
                    </p>
                  </div>
                </div>
              </div>

              {/* Metric Selector Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center rounded-lg border p-1 text-xs font-semibold ${
                  isLight ? 'bg-slate-100/90 border-slate-200' : 'border-[#1e2638] bg-[#0a0d14]'
                }`}>
                  <button
                    onClick={() => setChartMetric('REVENUE')}
                    className={`rounded-md px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                      chartMetric === 'REVENUE' 
                        ? isLight 
                          ? 'bg-white text-slate-900 shadow-sm font-bold' 
                          : 'bg-indigo-600 text-white shadow font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Revenue ({currSymbol})</span>
                  </button>
                  <button
                    onClick={() => setChartMetric('PURCHASES')}
                    className={`rounded-md px-3 py-1.5 transition-all ${
                      chartMetric === 'PURCHASES' 
                        ? isLight 
                          ? 'bg-white text-slate-900 shadow-sm font-bold' 
                          : 'bg-indigo-600 text-white shadow font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Purchases
                  </button>
                  <button
                    onClick={() => setChartMetric('SESSIONS')}
                    className={`rounded-md px-3 py-1.5 transition-all ${
                      chartMetric === 'SESSIONS' 
                        ? isLight 
                          ? 'bg-white text-slate-900 shadow-sm font-bold' 
                          : 'bg-indigo-600 text-white shadow font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sessions
                  </button>
                  <button
                    onClick={() => setChartMetric('ROAS')}
                    className={`rounded-md px-3 py-1.5 transition-all ${
                      chartMetric === 'ROAS' 
                        ? isLight 
                          ? 'bg-white text-slate-900 shadow-sm font-bold' 
                          : 'bg-indigo-600 text-white shadow font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    ROAS
                  </button>
                </div>

                <span className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${
                  isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Last 7 Days
                </span>
              </div>
            </div>

            {/* Quick KPI Strip inside Chart Card */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className={`p-3 rounded-lg border ${innerCard}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Period {chartMetric === 'REVENUE' ? 'Revenue' : chartMetric}
                </div>
                <div className={`text-lg font-black mt-1 ${textTitle}`}>
                  {chartMetric === 'REVENUE' && (hasLiveAttribution ? formatMoney(10486.9) : formatMoney(0))}
                  {chartMetric === 'PURCHASES' && (hasLiveAttribution ? '387 orders' : '0 orders')}
                  {chartMetric === 'SESSIONS' && (hasLiveAttribution ? '17,450 sessions' : '0 sessions')}
                  {chartMetric === 'ROAS' && (hasLiveAttribution ? '4.18x blended' : '0.00x')}
                </div>
                <div className={`text-[10px] ${hasLiveAttribution ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} font-semibold flex items-center gap-1 mt-0.5`}>
                  {hasLiveAttribution ? (
                    <>
                      <TrendingUp className="h-3 w-3" /> +19.2% vs previous 7d
                    </>
                  ) : (
                    <span>অপেক্ষমান (No live data)</span>
                  )}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${innerCard}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Top Converting Channel
                </div>
                <div className={`text-lg font-black mt-1 ${hasLiveAttribution ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                  {hasLiveAttribution ? 'Meta Ads (57.4%)' : 'None Active'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {hasLiveAttribution ? 'Facebook & Instagram Feed' : 'অ্যাকাউন্ট কানেক্ট করুন'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${innerCard}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Highest Scaling ROAS
                </div>
                <div className={`text-lg font-black mt-1 ${hasLiveAttribution ? 'text-amber-500' : 'text-slate-400'}`}>
                  {hasLiveAttribution ? 'Google PMax (4.10x)' : '0.00x'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {hasLiveAttribution ? 'High buyer purchase intent' : 'ক্যাম্পেইন রান করুন'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${innerCard}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Organic Contribution
                </div>
                <div className={`text-lg font-black mt-1 ${hasLiveAttribution ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {hasLiveAttribution ? formatMoney(1160) : formatMoney(0)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {hasLiveAttribution ? 'Zero ad spend acquisition' : 'অপেক্ষমান'}
                </div>
              </div>
            </div>

            {/* Interactive Legend with Click-to-Toggle & Hover Highlight */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 mr-1">CHANNELS:</span>
                {seriesPlotData.map((s) => {
                  const isHovered = hoveredChannel === s.id;
                  const isHidden = !s.isVisible;

                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleChannel(s.id)}
                      onMouseEnter={() => setHoveredChannel(s.id)}
                      onMouseLeave={() => setHoveredChannel(null)}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1 transition-all border text-xs font-semibold ${
                        isHidden
                          ? 'opacity-40 border-dashed border-slate-300 dark:border-slate-700 bg-transparent text-slate-400 line-through'
                          : isHovered
                            ? 'ring-2 ring-indigo-500/50 scale-105 shadow-sm ' + (isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-600 text-white')
                            : isLight 
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' 
                              : 'bg-[#0a0d14] border-[#1e2638] text-slate-300 hover:bg-slate-800/80'
                      }`}
                      title={isHidden ? `Click to show ${s.name}` : `Click to hide ${s.name}`}
                    >
                      <span 
                        className="h-2.5 w-2.5 rounded-full transition-transform" 
                        style={{ backgroundColor: s.color, transform: isHovered ? 'scale(1.2)' : 'scale(1)' }} 
                      />
                      <span>{s.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {formatMetricVal(s.totalValue / chartDays.length)} avg
                      </span>
                      {isHidden ? (
                        <EyeOff className="h-3 w-3 text-slate-400" />
                      ) : (
                        <Eye className={`h-3 w-3 ${isHovered ? 'text-indigo-500' : 'text-slate-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Hover over lines or points for day breakdown</span>
              </div>
            </div>

            {/* HIGH-PRECISION INTERACTIVE SVG CHART */}
            <div 
              className="mt-5 h-64 sm:h-72 w-full relative select-none"
              onMouseLeave={() => setHoveredChartIndex(null)}
            >
              <svg 
                className="h-full w-full overflow-visible" 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredChartIndex(null)}
              >
                <defs>
                  {/* Glowing Filter */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.35" />
                  </filter>

                  {/* Gradient Area Fills */}
                  <linearGradient id="metaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>

                  <linearGradient id="googleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines & Y-Axis Labels */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <line 
                      x1={marginLeft} 
                      y1={tick.y} 
                      x2={marginLeft + chartW} 
                      y2={tick.y} 
                      stroke={isLight ? '#e2e8f0' : '#1e293b'} 
                      strokeDasharray={tick.pct === 0 ? undefined : '4 4'}
                      strokeWidth={tick.pct === 0 ? '1.5' : '1'}
                    />
                    <text 
                      x={marginLeft - 12} 
                      y={tick.y + 3.5} 
                      textAnchor="end" 
                      fill={isLight ? '#94a3b8' : '#64748b'} 
                      fontSize="10" 
                      fontFamily="monospace"
                    >
                      {formatYTick(tick.val)}
                    </text>
                  </g>
                ))}

                {/* Translucent Area Fills for Top 2 Channels */}
                {seriesPlotData.find(s => s.id === 'meta')?.isVisible && (
                  <path 
                    d={seriesPlotData.find(s => s.id === 'meta')!.areaPath} 
                    fill="url(#metaGrad)" 
                    opacity={hoveredChannel && hoveredChannel !== 'meta' ? 0.05 : 0.9} 
                    className="transition-opacity duration-200"
                  />
                )}
                {seriesPlotData.find(s => s.id === 'google')?.isVisible && (
                  <path 
                    d={seriesPlotData.find(s => s.id === 'google')!.areaPath} 
                    fill="url(#googleGrad)" 
                    opacity={hoveredChannel && hoveredChannel !== 'google' ? 0.05 : 0.8} 
                    className="transition-opacity duration-200"
                  />
                )}

                {/* Render Channel Bezier Curves */}
                {seriesPlotData.map((s) => {
                  if (!s.isVisible) return null;
                  const isSpotlighted = hoveredChannel === s.id;
                  const isDimmed = hoveredChannel && hoveredChannel !== s.id;

                  return (
                    <g key={s.id} className="transition-opacity duration-200" opacity={isDimmed ? 0.2 : 1}>
                      {/* Base Path with smooth Bezier curve */}
                      <path
                        d={s.curvePath}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={isSpotlighted ? 3.8 : s.id === 'meta' ? 3 : 2.2}
                        strokeDasharray={s.dashed ? '4 4' : undefined}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={isSpotlighted ? 'url(#glow)' : undefined}
                      />

                      {/* Small dots on each data point */}
                      {s.points.map((pt, pIdx) => {
                        const isCurrentHoverDay = hoveredChartIndex === pIdx;
                        const isLatestDay = pIdx === s.points.length - 1;

                        return (
                          <g key={pIdx}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isCurrentHoverDay ? 5.5 : isLatestDay ? 4 : 2.5}
                              fill={s.color}
                              stroke={isLight ? '#ffffff' : '#121620'}
                              strokeWidth={isCurrentHoverDay ? 2.5 : 1.5}
                              className="transition-all duration-150"
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* Vertical Interactive Crosshair Guideline */}
                {hoveredChartIndex !== null && (
                  <g>
                    <line
                      x1={marginLeft + hoveredChartIndex * (chartW / (chartDays.length - 1))}
                      y1={marginTop}
                      x2={marginLeft + hoveredChartIndex * (chartW / (chartDays.length - 1))}
                      y2={marginTop + chartH}
                      stroke={isLight ? '#6366f1' : '#818cf8'}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.8"
                    />
                  </g>
                )}

                {/* X-Axis Date Labels aligned directly below data coordinates */}
                {chartDays.map((day, idx) => {
                  const x = marginLeft + idx * (chartW / (chartDays.length - 1));
                  const isHovered = hoveredChartIndex === idx;

                  return (
                    <g key={idx}>
                      <text
                        x={x}
                        y={marginTop + chartH + 18}
                        textAnchor="middle"
                        fill={isHovered ? (isLight ? '#0f172a' : '#ffffff') : (isLight ? '#64748b' : '#94a3b8')}
                        fontSize="10"
                        fontWeight={isHovered || day.isToday ? 'bold' : 'normal'}
                        fontFamily="monospace"
                      >
                        {day.label}
                      </text>
                      {day.isToday && (
                        <circle cx={x} cy={marginTop + chartH + 24} r="2" fill="#3b82f6" />
                      )}
                    </g>
                  );
                })}

                {/* Invisible Hit-Test Zones for High-Precision Hover */}
                {chartDays.map((_, idx) => {
                  const colWidth = chartW / (chartDays.length - 1);
                  const x = marginLeft + idx * colWidth - colWidth / 2;

                  return (
                    <rect
                      key={idx}
                      x={x}
                      y={marginTop - 10}
                      width={colWidth}
                      height={chartH + 30}
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() => setHoveredChartIndex(idx)}
                    />
                  );
                })}
              </svg>

              {/* Floating Glassmorphic Tooltip */}
              {hoveredChartIndex !== null && (
                <div 
                  className={`absolute pointer-events-none z-30 rounded-xl p-3 border shadow-2xl backdrop-blur-md transition-all duration-150 text-xs w-64 ${
                    isLight 
                      ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_12px_30px_rgba(0,0,0,0.12)]' 
                      : 'bg-[#10141e]/95 border-slate-700 text-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.6)]'
                  }`}
                  style={{
                    top: '12px',
                    left: hoveredChartIndex <= 4 
                      ? `calc(${((marginLeft + hoveredChartIndex * (chartW / (chartDays.length - 1))) / svgWidth) * 100}% + 14px)`
                      : undefined,
                    right: hoveredChartIndex > 4 
                      ? `calc(${((svgWidth - (marginLeft + hoveredChartIndex * (chartW / (chartDays.length - 1)))) / svgWidth) * 100}% + 14px)`
                      : undefined,
                  }}
                >
                  {/* Tooltip Header */}
                  <div className="flex items-center justify-between border-b pb-2 border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{chartDays[hoveredChartIndex].dateStr}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {chartDays[hoveredChartIndex].dayName}
                    </span>
                  </div>

                  {/* Day Total */}
                  <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Total {chartMetric}:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs">
                      {formatMetricVal(getDayBreakdown(hoveredChartIndex).dayTotal / (chartMetric === 'REVENUE' ? rate : 1))}
                    </span>
                  </div>

                  {/* Per-Channel Breakdown */}
                  <div className="mt-2 space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    {getDayBreakdown(hoveredChartIndex).items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="font-mono font-bold">
                            {formatMetricVal(item.val)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono w-7 text-right">
                            {item.pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Ticker */}
            <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between text-[11px] text-slate-400 ${
              isLight ? 'border-slate-100' : 'border-[#1b2230]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Server-Side Tagging Container: <strong className={textTitle}>99.9% deduplicated</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>Direct Data Feed: GA4 Measurement Protocol v2</span>
                <span className="font-mono text-slate-500">Updated: Just now</span>
              </div>
            </div>
          </div>

          {/* 5. Middle Two-Column Section: Channel Grouping + Realtime Stream */}
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Left: Session Default Channel Grouping (7 cols) */}
            <div className={`rounded-xl border p-4.5 lg:col-span-7 ${cardBg}`}>
              <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
                <div>
                  <h3 className={`text-sm font-bold ${textTitle}`}>Session Default Channel Grouping</h3>
                  <p className="text-[11px] text-slate-400">
                    Revenue & Conversion Share by Acquisition Channel
                  </p>
                </div>
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}`}>
                  Totals {currSymbol}
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5">
                {channelData.map((c, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 transition-colors ${innerCard}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <div>
                          <div className={`text-xs font-bold ${textTitle}`}>{c.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{c.sub}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xs font-black ${textTitle}`}>
                          {formatMoney(c.revenueUsd)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {c.sharePct}% share
                        </div>
                      </div>
                    </div>

                    <div className={`mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t pt-2 ${
                      isLight ? 'border-slate-200' : 'border-[#1b2230]'
                    }`}>
                      <span>{c.purchases} orders • CVR: {c.cvr}%</span>
                      <span>Spend: {formatMoney(c.spendUsd)} • ROAS: {c.roas > 0 ? `${c.roas}x` : 'Organic'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Realtime Activity (Last 30 Minutes) (5 cols) */}
            <div className={`rounded-xl border p-4.5 lg:col-span-5 ${cardBg}`}>
              <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-100' : 'border-[#1b2230]'}`}>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className={`text-sm font-bold ${textTitle}`}>Realtime Activity (Last 30 Min)</h3>
                </div>
                <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-500/30">
                  18 Active Users
                </span>
              </div>

              {/* Minute bars visualization */}
              <div className="mt-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  USERS PER MINUTE
                </div>
                <div className={`mt-2 flex items-end gap-1 h-20 w-full rounded-lg p-2 border ${innerCard}`}>
                  {[2, 3, 5, 4, 6, 8, 5, 7, 9, 12, 14, 11, 8, 10, 18].map((val, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all ${
                        i === 14 ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500/80 hover:bg-emerald-400'
                      }`}
                      style={{ height: `${(val / 20) * 100}%` }}
                      title={`${val} users`}
                    />
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>30 min ago</span>
                  <span className="text-emerald-500 font-bold">Now (18 live)</span>
                </div>
              </div>

              {/* Top Active Cities */}
              <div className="mt-3.5 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TOP ACTIVE REGIONS
                </div>
                <div className="space-y-1 text-xs">
                  <div className={`flex justify-between rounded p-2 ${innerCard}`}>
                    <span className={`font-medium ${textTitle}`}>1. Dhaka Division</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">11 users (61%)</span>
                  </div>
                  <div className={`flex justify-between rounded p-2 ${innerCard}`}>
                    <span className={`font-medium ${textTitle}`}>2. Chittagong</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">4 users (22%)</span>
                  </div>
                  <div className={`flex justify-between rounded p-2 ${innerCard}`}>
                    <span className={`font-medium ${textTitle}`}>3. Sylhet & Rajshahi</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">3 users (17%)</span>
                  </div>
                </div>
              </div>

              {/* Device Split */}
              <div className={`mt-3.5 rounded-xl p-3 border ${innerCard}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  DEVICE CATEGORY
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className={textMuted}>Android: <strong className={textTitle}>69%</strong></span>
                  <span className={textMuted}>iOS: <strong className={textTitle}>28%</strong></span>
                  <span className={textMuted}>Desktop: <strong className={textTitle}>3%</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Standard Acquisition & Attribution Table */}
          <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
            <div className={`p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
              isLight ? 'border-slate-100' : 'border-[#1b2230]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-1 rounded bg-amber-500" />
                <h3 className={`text-sm font-bold ${textTitle}`}>Standard Acquisition & Attribution Table</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs ${inputBg}`}>
                  <Search className="h-3 w-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search rows..."
                    value={searchTableQuery}
                    onChange={(e) => setSearchTableQuery(e.target.value)}
                    className="bg-transparent placeholder-slate-400 focus:outline-none w-32"
                  />
                </div>
                <button
                  onClick={() => alert('CSV Export generating...')}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition-all ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                  }`}
                >
                  <Download className="h-3 w-3" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${tableHeaderBg}`}>
                  <tr>
                    <th className="px-4 py-3">Default Channel Group</th>
                    <th className="px-4 py-3">Sessions</th>
                    <th className="px-4 py-3">Engaged Users</th>
                    <th className="px-4 py-3">Ad Spend</th>
                    <th className="px-4 py-3">Key Events (Purchases)</th>
                    <th className="px-4 py-3">Total Revenue</th>
                    <th className="px-4 py-3">True ROAS</th>
                    <th className="px-4 py-3">Cost / Order (CPA)</th>
                    <th className="px-4 py-3 text-right">CVR %</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {channelData
                    .filter(c => c.name.toLowerCase().includes(searchTableQuery.toLowerCase()) || c.sub.toLowerCase().includes(searchTableQuery.toLowerCase()))
                    .map((c, i) => (
                    <tr key={i} className={`transition-colors ${rowHover}`}>
                      <td className={`px-4 py-3 font-semibold flex items-center gap-2 ${textTitle}`}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{c.sessions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{c.engagedUsers.toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-300">
                        {c.spendUsd > 0 ? formatMoney(c.spendUsd) : '—'}
                      </td>
                      <td className={`px-4 py-3 font-bold ${textTitle}`}>{c.purchases} orders</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(c.revenueUsd)}</td>
                      <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                        {c.roas > 0 ? `${c.roas.toFixed(2)}x` : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-300">
                        {c.cpaUsd > 0 ? formatMoney(c.cpaUsd) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-200">{c.cvr}%</td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals Row */}
                <tfoot className={`border-t font-bold text-xs ${
                  isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-slate-700 bg-[#0a0d14] text-white'
                }`}>
                  <tr>
                    <td className="px-4 py-3 uppercase tracking-wider text-slate-400">TOTALS</td>
                    <td className="px-4 py-3">17,450</td>
                    <td className="px-4 py-3">11,970</td>
                    <td className="px-4 py-3">{formatMoney(metrics.spend)}</td>
                    <td className="px-4 py-3">{metrics.conversions} orders</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{formatMoney(metrics.revenue)}</td>
                    <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400">{metrics.roas.toFixed(2)}x</td>
                    <td className="px-4 py-3">{formatMoney(metrics.cpa)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">2.41%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 7. Live Ad-Level Performance & Creative Intelligence Leaderboard */}
          <div className={`rounded-xl border p-4.5 ${
            isLight ? 'border-indigo-200/80 bg-white shadow-sm' : 'border-indigo-500/30 bg-[#121620] shadow-xl'
          }`}>
            <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3 ${
              isLight ? 'border-slate-100' : 'border-[#1b2230]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${textTitle}`}>
                    Live Ad-Level Performance & Creative Intelligence (কোন Ads কেমন কাজ করছে)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Hook Rate (3s), Hold Rate (15s), Frequency, Spend, CPA, True ROAS এবং তাৎক্ষণিক Action Controller
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-indigo-500/15 px-3 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                Ad-Level Realtime Attribution
              </span>
            </div>

            {/* Ad List Table */}
            <div className="mt-3.5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${tableHeaderBg}`}>
                  <tr>
                    <th className="px-4 py-3">Ad Creative & Name</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Hook Rate (3s)</th>
                    <th className="px-4 py-3">Hold Rate (15s)</th>
                    <th className="px-4 py-3">Frequency & Fatigue</th>
                    <th className="px-4 py-3">Spend</th>
                    <th className="px-4 py-3">Purchases</th>
                    <th className="px-4 py-3">CPA</th>
                    <th className="px-4 py-3">True ROAS</th>
                    <th className="px-4 py-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {creatives.map((cr) => {
                    const isFatigued = cr.fatigueScore === 'HIGH_FATIGUE';
                    const isWinner = cr.isMvpWinner;

                    return (
                      <tr key={cr.id} className={`transition-colors ${rowHover}`}>
                        {/* Creative info with thumbnail */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={cr.thumbnailUrl}
                              alt={cr.adName}
                              className={`h-10 w-10 rounded-lg object-cover border shrink-0 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}
                            />
                            <div>
                              <div className={`font-bold flex items-center gap-1.5 ${textTitle}`}>
                                <span>{cr.adName}</span>
                                {isWinner && (
                                  <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
                                    MVP Winner
                                  </span>
                                )}
                                {isFatigued && (
                                  <span className="rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] font-bold px-1.5 py-0.5 border border-rose-500/30">
                                    Fatigued
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-xs">
                                {cr.headline}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Platform */}
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            cr.platform === 'META' 
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' 
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}>
                            {cr.platform}
                          </span>
                        </td>

                        {/* Hook Rate */}
                        <td className="px-4 py-3">
                          <span className={`font-bold ${
                            cr.hookRate >= 30 ? 'text-emerald-600 dark:text-emerald-400' : cr.hookRate > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                          }`}>
                            {cr.hookRate > 0 ? `${cr.hookRate}%` : 'Image'}
                          </span>
                        </td>

                        {/* Hold Rate */}
                        <td className="px-4 py-3">
                          <span className={`font-bold ${
                            cr.holdRate >= 35 ? 'text-emerald-600 dark:text-emerald-400' : cr.holdRate > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                          }`}>
                            {cr.holdRate > 0 ? `${cr.holdRate}%` : 'N/A'}
                          </span>
                        </td>

                        {/* Frequency & Fatigue */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold ${cr.frequency > 3.0 ? 'text-rose-600 dark:text-rose-400' : (isLight ? 'text-slate-700' : 'text-slate-200')}`}>
                              {cr.frequency.toFixed(2)}
                            </span>
                            {isFatigued ? (
                              <span className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-0.5 font-semibold">
                                <AlertTriangle className="h-3 w-3" /> Bleeding
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                <CheckCircle2 className="h-3 w-3" /> Healthy
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Spend */}
                        <td className={`px-4 py-3 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                          {formatMoney(cr.spend)}
                        </td>

                        {/* Purchases */}
                        <td className={`px-4 py-3 font-bold ${textTitle}`}>
                          {cr.conversions} orders
                        </td>

                        {/* CPA */}
                        <td className="px-4 py-3">
                          <span className={`font-bold ${cr.cpa > 10.0 ? 'text-rose-600 dark:text-rose-400' : (isLight ? 'text-slate-700' : 'text-slate-200')}`}>
                            {formatMoney(cr.cpa)}
                          </span>
                        </td>

                        {/* True ROAS */}
                        <td className="px-4 py-3">
                          <span className={`font-black text-sm ${isWinner ? 'text-emerald-600 dark:text-emerald-400' : (isLight ? 'text-slate-700' : 'text-slate-200')}`}>
                            {cr.roas.toFixed(2)}x
                          </span>
                        </td>

                        {/* Quick Action Button */}
                        <td className="px-4 py-3 text-right">
                          {isFatigued ? (
                            <button
                              onClick={() => onPauseCreative(cr.adId)}
                              className="rounded-lg bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            >
                              Pause Ad
                            </button>
                          ) : isWinner ? (
                            <button
                              onClick={() => alert(`উইনিং ক্রিয়েটিভ ${cr.adName} এর বাজেট +২০% স্কেলিং রিকোয়েস্ট তৈরি হয়েছে!`)}
                              className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            >
                              +20% Scale
                            </button>
                          ) : (
                            <button
                              onClick={() => alert(`Ad ${cr.adName} is currently active and monitoring.`)}
                              className={`rounded-lg border px-2.5 py-1 text-[11px] transition-all ${
                                isLight ? 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200' : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              Details
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: TRAFFIC & ACQUISITION (Full Dedicated Deep-Dive View)
         ========================================================================= */}
      {activeReportSubTab === 'TRAFFIC' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className={`p-4 rounded-xl border ${cardBg} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-amber-500" />
                <h3 className={`text-base font-black ${textTitle}`}>
                  Traffic & Acquisition Intelligence
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyze user acquisition, traffic channels, session engagement duration, and source/medium attribution.
              </p>
            </div>

            {/* Dimension Filter Switcher */}
            <div className={`flex items-center rounded-lg border p-1 text-xs font-semibold ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0a0d14] border-[#1e2638]'
            }`}>
              <button
                onClick={() => setTrafficDimension('SOURCE_MEDIUM')}
                className={`rounded px-3 py-1 transition-all ${
                  trafficDimension === 'SOURCE_MEDIUM' 
                    ? isLight ? 'bg-white text-slate-900 shadow-sm font-bold' : 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Session Source / Medium
              </button>
              <button
                onClick={() => setTrafficDimension('CHANNEL')}
                className={`rounded px-3 py-1 transition-all ${
                  trafficDimension === 'CHANNEL' 
                    ? isLight ? 'bg-white text-slate-900 shadow-sm font-bold' : 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Default Channel
              </button>
              <button
                onClick={() => setTrafficDimension('CAMPAIGN')}
                className={`rounded px-3 py-1 transition-all ${
                  trafficDimension === 'CAMPAIGN' 
                    ? isLight ? 'bg-white text-slate-900 shadow-sm font-bold' : 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Campaign UTM
              </button>
            </div>
          </div>

          {/* Traffic KPIs Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">TOTAL SESSIONS</div>
              <div className={`text-2xl font-black mt-2 ${textTitle}`}>17,450</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +14.2% vs previous period
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">ENGAGED SESSIONS</div>
              <div className={`text-2xl font-black mt-2 text-indigo-600 dark:text-indigo-400`}>12,630</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Engagement Rate: <strong className={textTitle}>72.38%</strong>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">AVG ENGAGEMENT TIME</div>
              <div className={`text-2xl font-black mt-2 text-cyan-600 dark:text-cyan-400`}>2m 48s</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Active user browsing time
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">EVENTS PER SESSION</div>
              <div className={`text-2xl font-black mt-2 text-amber-500`}>6.8</div>
              <div className="text-[11px] text-slate-400 mt-1">
                High interaction depth
              </div>
            </div>
          </div>

          {/* Detailed Traffic Source / Medium Table */}
          <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
            <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
              isLight ? 'border-slate-100' : 'border-[#1b2230]'
            }`}>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-500" />
                <h4 className={`text-sm font-bold ${textTitle}`}>
                  Traffic Source & Attribution Performance
                </h4>
              </div>

              <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${inputBg}`}>
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter source / medium..."
                  value={trafficSearch}
                  onChange={(e) => setTrafficSearch(e.target.value)}
                  className="bg-transparent placeholder-slate-400 focus:outline-none w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${tableHeaderBg}`}>
                  <tr>
                    <th className="px-4 py-3">Source / Medium</th>
                    <th className="px-4 py-3">Sessions</th>
                    <th className="px-4 py-3">Engaged Sessions</th>
                    <th className="px-4 py-3">Engagement Rate</th>
                    <th className="px-4 py-3">Avg Time</th>
                    <th className="px-4 py-3">Key Events (Purchases)</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">True ROAS</th>
                    <th className="px-4 py-3 text-right">CVR %</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {[
                    { source: 'facebook / cpc', sessions: 6120, engaged: 4420, rate: '72.2%', time: '2m 54s', purchases: 148, revUsd: 4210, roas: 4.35, cvr: '2.42%' },
                    { source: 'instagram / cpc', sessions: 2520, engaged: 1840, rate: '73.0%', time: '2m 42s', purchases: 62, revUsd: 1754, roas: 3.90, cvr: '2.46%' },
                    { source: 'google / cpc (PMax & Search)', sessions: 3420, engaged: 2590, rate: '75.7%', time: '3m 15s', purchases: 92, revUsd: 2814, roas: 3.80, cvr: '2.69%' },
                    { source: 'tiktok / cpc', sessions: 2150, engaged: 1420, rate: '66.0%', time: '1m 58s', purchases: 40, revUsd: 896, roas: 2.80, cvr: '1.86%' },
                    { source: 'google / organic (SEO)', sessions: 1820, engaged: 1390, rate: '76.4%', time: '3m 22s', purchases: 18, revUsd: 620, roas: 0, cvr: '0.99%' },
                    { source: 'direct / none (Brand)', sessions: 1420, engaged: 1110, rate: '78.2%', time: '3m 40s', purchases: 15, revUsd: 540, roas: 0, cvr: '1.05%' },
                  ]
                  .filter(row => row.source.toLowerCase().includes(trafficSearch.toLowerCase()))
                  .map((row, i) => (
                    <tr key={i} className={`transition-colors ${rowHover}`}>
                      <td className={`px-4 py-3 font-semibold font-mono ${textTitle}`}>
                        {row.source}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{row.sessions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{row.engaged.toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{row.rate}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{row.time}</td>
                      <td className={`px-4 py-3 font-bold ${textTitle}`}>{row.purchases} orders</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(row.revUsd)}</td>
                      <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">{row.roas > 0 ? `${row.roas.toFixed(2)}x` : 'Organic'}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-200">{row.cvr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Landing Pages & Device Tech Specs */}
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Top Landing Pages */}
            <div className={`p-4.5 rounded-xl border lg:col-span-7 ${cardBg}`}>
              <h4 className={`text-sm font-bold ${textTitle} mb-3 flex items-center justify-between`}>
                <span>Top Landing Pages by Conversions</span>
                <span className="text-xs text-slate-400 font-normal">Page Path + Query String</span>
              </h4>

              <div className="space-y-2">
                {[
                  { path: '/products/premium-smartwatch', sessions: 6240, purchases: 168, rate: '2.69%', revUsd: 4890 },
                  { path: '/', sessions: 4820, purchases: 94, rate: '1.95%', revUsd: 2640 },
                  { path: '/collection/winter-sale-apparel', sessions: 3120, purchases: 82, rate: '2.63%', revUsd: 2180 },
                  { path: '/checkout', sessions: 1480, purchases: 43, rate: '2.91%', revUsd: 1120 },
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${innerCard}`}>
                    <div>
                      <div className={`font-mono font-bold ${textTitle}`}>{item.path}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.sessions.toLocaleString()} entries • CVR: {item.rate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(item.revUsd)}</div>
                      <div className="text-[10px] text-slate-400">{item.purchases} purchases</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices & Browsers */}
            <div className={`p-4.5 rounded-xl border lg:col-span-5 ${cardBg} space-y-4`}>
              <h4 className={`text-sm font-bold ${textTitle}`}>Device & Platform Distribution</h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-blue-500" /> Mobile (Android & iOS)
                    </span>
                    <strong className={textTitle}>97.0% (16,926 sessions)</strong>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div className="bg-blue-500" style={{ width: '69%' }} title="Android 69%" />
                    <div className="bg-indigo-500" style={{ width: '28%' }} title="iOS 28%" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Android: 69.2%</span>
                    <span>iOS: 27.8%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5 text-emerald-500" /> Desktop
                    </span>
                    <strong className={textTitle}>3.0% (524 sessions)</strong>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '3%' }} />
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${innerCard}`}>
                <div className="font-bold text-slate-400 uppercase text-[10px]">IN-APP BROWSER BREAKDOWN</div>
                <div className="flex justify-between">
                  <span className={textMuted}>Facebook In-App Browser</span>
                  <span className={`font-bold ${textTitle}`}>54.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className={textMuted}>Instagram In-App Browser</span>
                  <span className={`font-bold ${textTitle}`}>22.6%</span>
                </div>
                <div className="flex justify-between">
                  <span className={textMuted}>Mobile Chrome & Safari</span>
                  <span className={`font-bold ${textTitle}`}>23.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: E-COMMERCE & MONETIZATION (Full Dedicated Funnel & Product Catalog)
         ========================================================================= */}
      {activeReportSubTab === 'ECOMMERCE' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className={`p-4 rounded-xl border ${cardBg} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                <h3 className={`text-base font-black ${textTitle}`}>
                  E-commerce & Monetization Intelligence
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full GA4 Enhanced E-commerce funnel, view-to-purchase velocity, and top revenue catalog items.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs font-bold border border-emerald-500/30">
                Server-Side Verified Orders: 387
              </span>
            </div>
          </div>

          {/* E-commerce KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">TOTAL ITEM REVENUE</div>
              <div className={`text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400`}>
                {formatMoney(metrics.revenue)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Total Orders: <strong className={textTitle}>{metrics.conversions}</strong>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">AVERAGE ORDER VALUE (AOV)</div>
              <div className={`text-2xl font-black mt-2 text-indigo-600 dark:text-indigo-400`}>
                {formatMoney(metrics.revenue / (metrics.conversions || 1))}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +৳340 vs last month
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">CART-TO-VIEW RATE</div>
              <div className={`text-2xl font-black mt-2 text-cyan-600 dark:text-cyan-400`}>
                24.0%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                3,410 cart additions
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">CHECKOUT CONVERSION</div>
              <div className={`text-2xl font-black mt-2 text-purple-600 dark:text-purple-400`}>
                31.2%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Completed purchases / Checkouts
              </div>
            </div>
          </div>

          {/* VISUAL E-COMMERCE PURCHASE FUNNEL (GA4 Full Journey) */}
          <div className={`p-5 rounded-xl border ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 mb-4 border-slate-100 dark:border-slate-800">
              <div>
                <h4 className={`text-sm font-bold ${textTitle}`}>
                  Full E-commerce Purchase Funnel Journey
                </h4>
                <p className="text-xs text-slate-400">
                  User progression and drop-off rate at each critical shopping step
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Overall Store CVR: 2.72%
              </span>
            </div>

            {/* 5 Funnel Stages */}
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                { step: '1. Item Views', event: 'view_item', users: hasLiveAttribution ? 14210 : 0, pctOfTop: hasLiveAttribution ? '100%' : '0%', dropOff: '—', color: 'from-blue-500 to-indigo-600' },
                { step: '2. Add to Cart', event: 'add_to_cart', users: hasLiveAttribution ? 3410 : 0, pctOfTop: hasLiveAttribution ? '24.0%' : '0%', dropOff: hasLiveAttribution ? '-76.0% Drop' : '—', color: 'from-indigo-500 to-cyan-500' },
                { step: '3. Begin Checkout', event: 'begin_checkout', users: hasLiveAttribution ? 1240 : 0, pctOfTop: hasLiveAttribution ? '8.7%' : '0%', dropOff: hasLiveAttribution ? '-63.6% Drop' : '—', color: 'from-cyan-500 to-teal-500' },
                { step: '4. Payment Info', event: 'add_payment_info', users: hasLiveAttribution ? 820 : 0, pctOfTop: hasLiveAttribution ? '5.8%' : '0%', dropOff: hasLiveAttribution ? '-33.8% Drop' : '—', color: 'from-teal-500 to-emerald-500' },
                { step: '5. Purchase Complete', event: 'purchase', users: metrics.conversions || 0, pctOfTop: hasLiveAttribution ? '2.7%' : '0%', dropOff: hasLiveAttribution ? '-52.8% Drop' : '—', color: 'from-emerald-500 to-green-600', isGoal: true },
              ].map((stage, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border flex flex-col justify-between ${innerCard}`}>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {stage.step}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                      {stage.event}
                    </div>
                    <div className={`text-xl font-black mt-2 ${textTitle}`}>
                      {stage.users.toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Funnel Share:</span>
                      <strong className={stage.isGoal ? 'text-emerald-500 font-black' : textTitle}>{stage.pctOfTop}</strong>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${stage.color}`} 
                        style={{ width: stage.users > 0 ? `${(stage.users / (hasLiveAttribution ? 14210 : 1)) * 100}%` : '0%' }} 
                      />
                    </div>
                    <div className="mt-1 text-[10px] text-right font-medium text-slate-400">
                      {stage.dropOff}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Products Catalog Table */}
          <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
            <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
              isLight ? 'border-slate-100' : 'border-[#1b2230]'
            }`}>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-500" />
                <h4 className={`text-sm font-bold ${textTitle}`}>
                  Top Performing Products & Item Catalog
                </h4>
              </div>

              <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${inputBg}`}>
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search product SKU / title..."
                  value={ecommerceSearch}
                  onChange={(e) => setEcommerceSearch(e.target.value)}
                  className="bg-transparent placeholder-slate-400 focus:outline-none w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${tableHeaderBg}`}>
                  <tr>
                    <th className="px-4 py-3">Product Name & Category</th>
                    <th className="px-4 py-3">Item Views</th>
                    <th className="px-4 py-3">Add to Cart</th>
                    <th className="px-4 py-3">Purchases</th>
                    <th className="px-4 py-3">Total Item Revenue</th>
                    <th className="px-4 py-3">Cart-to-Buy CVR</th>
                    <th className="px-4 py-3 text-right">Inventory & Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {[
                    { name: 'Ultra Smartwatch Series 9 Pro', sku: 'WATCH-S9-PRO', cat: 'Electronics', views: 4820, cart: 1240, purchases: 168, revUsd: 6300, cvr: '13.5%', stock: 'In Stock (42 left)' },
                    { name: 'Premium Heavyweight Cotton Hoodie (Black)', sku: 'HOODIE-BLK-M', cat: 'Apparel', views: 3450, cart: 890, purchases: 112, revUsd: 2800, cvr: '12.6%', stock: 'In Stock (88 left)' },
                    { name: 'Active Noise Cancelling Wireless Earbuds', sku: 'EAR-ANC-V2', cat: 'Audio', views: 2910, cart: 710, purchases: 65, revUsd: 2167, cvr: '9.2%', stock: 'Low Stock (14 left)' },
                    { name: 'Genuine Leather Minimalist Card Wallet', sku: 'WL-LTHR-01', cat: 'Accessories', views: 1840, cart: 340, purchases: 42, revUsd: 875, cvr: '12.4%', stock: 'In Stock (120 left)' },
                  ]
                  .filter(item => item.name.toLowerCase().includes(ecommerceSearch.toLowerCase()) || item.sku.toLowerCase().includes(ecommerceSearch.toLowerCase()))
                  .map((item, idx) => (
                    <tr key={idx} className={`transition-colors ${rowHover}`}>
                      <td className="px-4 py-3">
                        <div className={`font-bold ${textTitle}`}>{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          SKU: {item.sku} • {item.cat}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{item.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{item.cart.toLocaleString()}</td>
                      <td className={`px-4 py-3 font-bold ${textTitle}`}>{item.purchases} orders</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(item.revUsd)}</td>
                      <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">{item.cvr}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.stock.includes('Low') 
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {item.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: REALTIME STREAM (Full Dedicated Realtime Live Center)
         ========================================================================= */}
      {activeReportSubTab === 'REALTIME' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Realtime Live Header */}
          <div className={`p-5 rounded-xl border ${cardBg} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <Radio className="h-5 w-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-black ${textTitle}`}>
                    Realtime GA4 Server-Side Measurement Stream
                  </h3>
                  <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                    Connected (14ms Latency)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Live HTTP POST telemetry coming directly from Cloud Run Server Container via Measurement Protocol
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`rounded-xl border p-2.5 px-4 text-center ${innerCard}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400">ACTIVE USERS NOW</div>
                <div className="text-2xl font-black text-emerald-500">18</div>
              </div>
              <div className={`rounded-xl border p-2.5 px-4 text-center ${innerCard}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400">LAST 30 MIN USERS</div>
                <div className={`text-2xl font-black ${textTitle}`}>142</div>
              </div>
            </div>
          </div>

          {/* Realtime Grid: Minute Bar Chart + Live Event Stream */}
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Left: Minute by Minute Activity Chart (7 cols) */}
            <div className={`p-4.5 rounded-xl border lg:col-span-7 ${cardBg} space-y-4`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className={`text-sm font-bold ${textTitle}`}>Users Active per Minute (Last 30 Min)</h4>
                  <p className="text-[11px] text-slate-400">Continuous 60-second telemetry sampling</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500 animate-pulse">
                  ● Streaming Live
                </span>
              </div>

              {/* Minute Bars */}
              <div className="space-y-1">
                <div className={`h-36 w-full rounded-xl border p-3 flex items-end gap-1.5 ${innerCard}`}>
                  {[2, 3, 5, 4, 6, 8, 5, 7, 9, 12, 14, 11, 8, 10, 12, 15, 13, 9, 8, 11, 14, 16, 15, 12, 14, 15, 17, 14, 16, 18].map((val, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all ${
                        i === 29 
                          ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50' 
                          : 'bg-emerald-500/75 hover:bg-emerald-400'
                      }`}
                      style={{ height: `${(val / 20) * 100}%` }}
                      title={`Minute ${30 - i} ago: ${val} users`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
                  <span>30 minutes ago</span>
                  <span>15 minutes ago</span>
                  <span className="text-emerald-500 font-bold">Just Now (18 Users)</span>
                </div>
              </div>

              {/* Realtime Active Screens */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TOP PAGES ACTIVE RIGHT NOW
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    { page: '/checkout (Payment Step)', active: 5, action: 'Entering bKash OTP' },
                    { page: '/products/premium-smartwatch', active: 6, action: 'Viewing Product & Reviews' },
                    { page: '/cart', active: 4, action: 'Applying Coupon' },
                    { page: '/', active: 3, action: 'Browsing Homepage' },
                  ].map((p, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg border flex items-center justify-between ${innerCard}`}>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div>
                          <div className={`font-mono font-bold ${textTitle}`}>{p.page}</div>
                          <div className="text-[10px] text-slate-400">{p.action}</div>
                        </div>
                      </div>
                      <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-black border border-emerald-500/30">
                        {p.active} Users
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Event Stream Feed (5 cols) */}
            <div className={`p-4.5 rounded-xl border lg:col-span-5 ${cardBg} space-y-3`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <h4 className={`text-sm font-bold ${textTitle}`}>Live Event Stream Ticker</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Auto-Refreshed</span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {[
                  { event: 'purchase', time: '4s ago', detail: `৳4,850 • bKash • Dhaka`, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
                  { event: 'begin_checkout', time: '12s ago', detail: 'Smartwatch Series 9 • Chittagong', icon: ShoppingCart, color: 'text-cyan-500 bg-cyan-500/10' },
                  { event: 'add_to_cart', time: '25s ago', detail: 'Cotton Hoodie (M) • Facebook Ad', icon: ShoppingBag, color: 'text-indigo-500 bg-indigo-500/10' },
                  { event: 'view_item', time: '38s ago', detail: 'Wireless Earbuds • Google Ads', icon: Eye, color: 'text-amber-500 bg-amber-500/10' },
                  { event: 'page_view', time: '52s ago', detail: 'Landing Page • Android Mobile', icon: Globe, color: 'text-slate-400 bg-slate-500/10' },
                  { event: 'purchase', time: '1m ago', detail: `৳3,200 • COD • Sylhet`, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
                ].map((ev, i) => (
                  <div key={i} className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${innerCard}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${ev.color}`}>
                        <ev.icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className={`font-mono font-bold ${textTitle}`}>{ev.event}</div>
                        <div className="text-[10px] text-slate-400">{ev.detail}</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {ev.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Server Tagging Status Badge */}
              <div className={`p-3 rounded-lg border text-xs space-y-1 ${innerCard}`}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-indigo-400" /> sgtm.digitalmarketr.com
                  </span>
                  <span className="text-emerald-500 font-bold text-[10px]">Active</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Deduplication ID: <code className="text-cyan-400 font-mono">fbc.1.172802.ev91</code> | Match 100%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
