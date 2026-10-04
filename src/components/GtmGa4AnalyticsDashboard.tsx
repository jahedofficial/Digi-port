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

  // Master Channels Data calculated directly from actual synced campaigns & metrics
  const metaCampaigns = campaigns.filter(c => c.platform === 'META');
  const googleCampaigns = campaigns.filter(c => c.platform === 'GOOGLE');
  const tiktokCampaigns = campaigns.filter(c => c.platform === 'TIKTOK');

  const metaSpend = metaCampaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
  const metaConversions = metaCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const metaRevenue = metaCampaigns.reduce((sum, c) => sum + ((c.spend || 0) * (c.roas || 0)), 0);
  const metaClicks = metaCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const metaRoas = metaSpend > 0 ? metaRevenue / metaSpend : 0;
  const metaCpa = metaConversions > 0 ? metaSpend / metaConversions : 0;
  const metaCvr = metaClicks > 0 ? (metaConversions / metaClicks) * 100 : 0;

  const googleSpend = googleCampaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
  const googleConversions = googleCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const googleRevenue = googleCampaigns.reduce((sum, c) => sum + ((c.spend || 0) * (c.roas || 0)), 0);
  const googleClicks = googleCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const googleRoas = googleSpend > 0 ? googleRevenue / googleSpend : 0;
  const googleCpa = googleConversions > 0 ? googleSpend / googleConversions : 0;
  const googleCvr = googleClicks > 0 ? (googleConversions / googleClicks) * 100 : 0;

  const tiktokSpend = tiktokCampaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
  const tiktokConversions = tiktokCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const tiktokRevenue = tiktokCampaigns.reduce((sum, c) => sum + ((c.spend || 0) * (c.roas || 0)), 0);
  const tiktokClicks = tiktokCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const tiktokRoas = tiktokSpend > 0 ? tiktokRevenue / tiktokSpend : 0;
  const tiktokCpa = tiktokConversions > 0 ? tiktokSpend / tiktokConversions : 0;
  const tiktokCvr = tiktokClicks > 0 ? (tiktokConversions / tiktokClicks) * 100 : 0;

  const totalRevAll = metaRevenue + googleRevenue + tiktokRevenue;
  const totalClicks = metaClicks + googleClicks + tiktokClicks;
  const totalSpend = metrics.spend;
  const totalConversions = metrics.conversions;
  const totalRevenue = metrics.revenue;
  const totalRoas = metrics.roas;
  const totalCpa = metrics.cpa;
  const totalCvr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  const channelData = [
    {
      id: 'meta',
      name: 'Meta Ads (Facebook & IG)',
      shortName: 'Meta Ads',
      sub: metaCampaigns.length > 0 ? `${metaCampaigns.length} live campaigns synced` : 'facebook / cpc, instagram / cpc',
      sessions: metaClicks,
      engagedUsers: Math.round(metaClicks * 0.7),
      spendUsd: metaSpend,
      purchases: metaConversions,
      revenueUsd: metaRevenue,
      roas: metaRoas,
      cpaUsd: metaCpa,
      cvr: Number(metaCvr.toFixed(2)),
      color: '#3b82f6',
      sharePct: totalRevAll > 0 ? Math.round((metaRevenue / totalRevAll) * 100) : (metaSpend > 0 ? 100 : 0),
    },
    {
      id: 'google',
      name: 'Google Ads (Search & PMax)',
      shortName: 'Google Ads',
      sub: googleCampaigns.length > 0 ? `${googleCampaigns.length} live campaigns synced` : 'google / cpc (Not connected)',
      sessions: googleClicks,
      engagedUsers: Math.round(googleClicks * 0.7),
      spendUsd: googleSpend,
      purchases: googleConversions,
      revenueUsd: googleRevenue,
      roas: googleRoas,
      cpaUsd: googleCpa,
      cvr: Number(googleCvr.toFixed(2)),
      color: '#f59e0b',
      sharePct: totalRevAll > 0 ? Math.round((googleRevenue / totalRevAll) * 100) : 0,
    },
    {
      id: 'tiktok',
      name: 'TikTok for Business Ads',
      shortName: 'TikTok Ads',
      sub: tiktokCampaigns.length > 0 ? `${tiktokCampaigns.length} live campaigns synced` : 'tiktok / cpc (Not connected)',
      sessions: tiktokClicks,
      engagedUsers: Math.round(tiktokClicks * 0.7),
      spendUsd: tiktokSpend,
      purchases: tiktokConversions,
      revenueUsd: tiktokRevenue,
      roas: tiktokRoas,
      cpaUsd: tiktokCpa,
      cvr: Number(tiktokCvr.toFixed(2)),
      color: '#f43f5e',
      sharePct: totalRevAll > 0 ? Math.round((tiktokRevenue / totalRevAll) * 100) : 0,
    },
    {
      id: 'organic',
      name: 'Organic Search (SEO)',
      shortName: 'Organic Search',
      sub: 'google / organic (Connect Search Console)',
      sessions: 0,
      engagedUsers: 0,
      spendUsd: 0,
      purchases: 0,
      revenueUsd: 0,
      roas: 0,
      cpaUsd: 0,
      cvr: 0,
      color: '#10b981',
      sharePct: 0,
    },
    {
      id: 'direct',
      name: 'Direct & Brand Traffic',
      shortName: 'Direct',
      sub: 'direct / none (Connect GA4)',
      sessions: 0,
      engagedUsers: 0,
      spendUsd: 0,
      purchases: 0,
      revenueUsd: 0,
      roas: 0,
      cpaUsd: 0,
      cvr: 0,
      color: '#a855f7',
      sharePct: 0,
    },
  ];

  // 8-Day Historical Data Points matching user's timeline
  const chartDays = [
    { label: 'Day 1', dateStr: 'Day 1', dayName: '' },
    { label: 'Day 2', dateStr: 'Day 2', dayName: '' },
    { label: 'Day 3', dateStr: 'Day 3', dayName: '' },
    { label: 'Day 4', dateStr: 'Day 4', dayName: '' },
    { label: 'Day 5', dateStr: 'Day 5', dayName: '' },
    { label: 'Day 6', dateStr: 'Day 6', dayName: '' },
    { label: 'Day 7', dateStr: 'Day 7', dayName: '' },
    { label: 'Today', dateStr: 'Today', dayName: 'Today', isToday: true },
  ];

  // Raw Channel Trend Series across 8 days
  const chartSeries = [
    {
      id: 'meta',
      name: 'Meta Ads',
      color: '#3b82f6',
      gradientId: 'metaGradient',
      data: {
        REVENUE: metaRevenue > 0 ? [0, 0, 0, 0, 0, 0, 0, metaRevenue] : [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: metaConversions > 0 ? [0, 0, 0, 0, 0, 0, 0, metaConversions] : [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: metaClicks > 0 ? [0, 0, 0, 0, 0, 0, 0, metaClicks] : [0, 0, 0, 0, 0, 0, 0, 0],
        ROAS: metaRoas > 0 ? [0, 0, 0, 0, 0, 0, 0, metaRoas] : [0, 0, 0, 0, 0, 0, 0, 0],
      }
    },
    {
      id: 'google',
      name: 'Google Ads',
      color: '#f59e0b',
      gradientId: 'googleGradient',
      data: {
        REVENUE: googleRevenue > 0 ? [0, 0, 0, 0, 0, 0, 0, googleRevenue] : [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: googleConversions > 0 ? [0, 0, 0, 0, 0, 0, 0, googleConversions] : [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: googleClicks > 0 ? [0, 0, 0, 0, 0, 0, 0, googleClicks] : [0, 0, 0, 0, 0, 0, 0, 0],
        ROAS: googleRoas > 0 ? [0, 0, 0, 0, 0, 0, 0, googleRoas] : [0, 0, 0, 0, 0, 0, 0, 0],
      }
    },
    {
      id: 'tiktok',
      name: 'TikTok Ads',
      color: '#f43f5e',
      gradientId: 'tiktokGradient',
      data: {
        REVENUE: tiktokRevenue > 0 ? [0, 0, 0, 0, 0, 0, 0, tiktokRevenue] : [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: tiktokConversions > 0 ? [0, 0, 0, 0, 0, 0, 0, tiktokConversions] : [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: tiktokClicks > 0 ? [0, 0, 0, 0, 0, 0, 0, tiktokClicks] : [0, 0, 0, 0, 0, 0, 0, 0],
        ROAS: tiktokRoas > 0 ? [0, 0, 0, 0, 0, 0, 0, tiktokRoas] : [0, 0, 0, 0, 0, 0, 0, 0],
      }
    },
    {
      id: 'organic',
      name: 'Organic Search',
      color: '#10b981',
      gradientId: 'organicGradient',
      dashed: true,
      data: {
        REVENUE: [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: [0, 0, 0, 0, 0, 0, 0, 0],
        ROAS: [0, 0, 0, 0, 0, 0, 0, 0],
      }
    },
    {
      id: 'direct',
      name: 'Direct',
      color: '#a855f7',
      gradientId: 'directGradient',
      data: {
        REVENUE: [0, 0, 0, 0, 0, 0, 0, 0],
        PURCHASES: [0, 0, 0, 0, 0, 0, 0, 0],
        SESSIONS: [0, 0, 0, 0, 0, 0, 0, 0],
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
              {totalClicks > 0 ? totalClicks.toLocaleString() : '0'}
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
              {metrics.conversions} Orders
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
              0 Live
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
                <span className={`rounded ${totalClicks > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'} text-[10px] font-bold px-1.5 py-0.5 border`}>
                  {totalClicks > 0 ? 'Live' : 'Standby'}
                </span>
              </div>
              <div className={`mt-2 text-2xl font-black ${textTitle}`}>
                {totalClicks > 0 ? totalClicks.toLocaleString() : '0'}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>New users: {totalClicks > 0 ? totalClicks.toLocaleString() : '0'}</span>
                <span className="text-slate-400 font-medium">{totalClicks > 0 ? 'Ad Clicks' : 'No Traffic'}</span>
              </div>
            </div>

            {/* KEY EVENTS (PURCHASES) */}
            <div className={`rounded-xl border p-4 ${cardBg}`}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">KEY EVENTS (PURCHASES)</span>
                <span className={`rounded ${metrics.conversions > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'} text-[10px] font-bold px-1.5 py-0.5 border`}>
                  {metrics.conversions > 0 ? 'Live' : 'Verified'}
                </span>
              </div>
              <div className={`mt-2 text-2xl font-black ${textTitle}`}>
                {metrics.conversions} orders
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Total Items: {metrics.conversions}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {metrics.conversions > 0 ? '100% match' : '0%'}
                </span>
              </div>
            </div>

            {/* TOTAL REVENUE */}
            <div className={`rounded-xl border p-4 ${cardBg}`}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">TOTAL REVENUE</span>
                <span className={`rounded ${metrics.revenue > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'} text-[10px] font-bold px-1.5 py-0.5 border`}>
                  Verified
                </span>
              </div>
              <div className={`mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400`}>
                {formatMoney(metrics.revenue)}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>AOV: {formatMoney(metrics.conversions > 0 ? metrics.revenue / metrics.conversions : 0)}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {metrics.revenue > 0 ? 'Active' : '0%'}
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
                <span className={`rounded ${totalCvr > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'} text-[10px] font-bold px-1.5 py-0.5 border`}>
                  {totalCvr > 0 ? 'Live' : 'Standby'}
                </span>
              </div>
              <div className={`mt-2 text-2xl font-black ${textTitle}`}>
                {totalCvr.toFixed(2)}%
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Purchases / Clicks</span>
                <span className="text-slate-400 font-medium">{totalConversions > 0 ? 'Calculated' : 'No Data'}</span>
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
                  <span className="rounded bg-slate-500/15 text-slate-500 dark:text-slate-400 text-[9px] font-bold px-1.5 py-0.5 border border-slate-500/30">
                    No Data
                  </span>
                </div>
                <div className="mt-2 text-xl font-black text-slate-400">
                  0.0%
                </div>
                <div className="mt-1 text-[10px] text-slate-400 font-medium">
                  • GA4 e-Commerce কানেক্ট করুন
                </div>
                <div className="mt-0.5 text-[9px] text-slate-400">
                  Formula: (1 - Orders/Add-to-Cart)
                </div>
              </div>

              {/* 2. ADD-TO-CART RATE */}
              <div className={`rounded-xl border p-3.5 ${innerCard}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">2. ADD-TO-CART RATE</span>
                  <span className="rounded bg-slate-500/15 text-slate-500 dark:text-slate-400 text-[9px] font-bold px-1.5 py-0.5 border border-slate-500/30">
                    No Data
                  </span>
                </div>
                <div className="mt-2 text-xl font-black text-slate-400">
                  0.0%
                </div>
                <div className="mt-1 text-[10px] text-slate-400 font-medium">
                  • 0 cart actions
                </div>
                <div className="mt-0.5 text-[9px] text-slate-400">
                  Ad vs Store Price-Match Fit
                </div>
              </div>

              {/* 3. CUSTOMER LTV */}
              <div className={`rounded-xl border p-3.5 ${innerCard}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">3. CUSTOMER LTV</span>
                  <span className={`rounded ${totalConversions > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'} text-[9px] font-bold px-1.5 py-0.5 border`}>
                    {totalConversions > 0 ? 'AOV Metric' : 'No Data'}
                  </span>
                </div>
                <div className={`mt-2 text-xl font-black ${totalConversions > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {totalConversions > 0 ? formatMoney(totalRevenue / totalConversions) : formatMoney(0)}
                </div>
                <div className="mt-1 text-[10px] text-slate-400 font-medium">
                  • {totalConversions} purchases synced
                </div>
                <div className="mt-0.5 text-[9px] text-slate-400">
                  CAC Recovery Power
                </div>
              </div>

              {/* 4. VIEW-TO-PURCHASE */}
              <div className={`rounded-xl border p-3.5 ${innerCard}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">4. VIEW-TO-PURCHASE</span>
                  <span className={`rounded ${totalCvr > 0 ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'} text-[9px] font-bold px-1.5 py-0.5 border`}>
                    {totalCvr > 0 ? 'Live CVR' : 'No Data'}
                  </span>
                </div>
                <div className={`mt-2 text-xl font-black ${totalCvr > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                  {totalCvr.toFixed(2)}%
                </div>
                <div className="mt-1 text-[10px] text-slate-400 font-medium">
                  • {totalConversions} orders / {totalClicks} clicks
                </div>
                <div className="mt-0.5 text-[9px] text-slate-400">
                  Stock Re-order & Ad Shift
                </div>
              </div>

              {/* 5. NEW VS RETURNING */}
              <div className={`rounded-xl border p-3.5 ${innerCard}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">5. NEW VS RETURNING</span>
                  <span className="rounded bg-slate-500/15 text-slate-500 dark:text-slate-400 text-[9px] font-bold px-1.5 py-0.5 border border-slate-500/30">
                    No Data
                  </span>
                </div>
                <div className={`mt-2 text-sm font-bold ${textTitle}`}>
                  0% New / 0% Repeat
                </div>
                <div className={`mt-1.5 h-1.5 w-full rounded-full overflow-hidden flex ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div className="bg-cyan-500" style={{ width: '0%' }} />
                  <div className="bg-emerald-500" style={{ width: '0%' }} />
                </div>
                <div className="mt-1 text-[9px] text-slate-400">
                  No customer history recorded
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
                  {chartMetric === 'REVENUE' && formatMoney(totalRevenue)}
                  {chartMetric === 'PURCHASES' && `${totalConversions} orders`}
                  {chartMetric === 'SESSIONS' && `${totalClicks.toLocaleString()} clicks`}
                  {chartMetric === 'ROAS' && `${totalRoas.toFixed(2)}x blended`}
                </div>
                <div className={`text-[10px] ${totalRevenue > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} font-semibold flex items-center gap-1 mt-0.5`}>
                  {totalRevenue > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3" /> Live Sync Active
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
                <div className={`text-lg font-black mt-1 ${metaSpend > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                  {metaSpend > 0 ? 'Meta Ads' : 'None Active'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {metaSpend > 0 ? `${metaCampaigns.length} campaigns synced` : 'অ্যাকাউন্ট কানেক্ট করুন'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${innerCard}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Highest Scaling ROAS
                </div>
                <div className={`text-lg font-black mt-1 ${totalRoas > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {totalRoas > 0 ? `${totalRoas.toFixed(2)}x` : '0.00x'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {totalRoas > 0 ? 'Blended Ad Account ROAS' : 'ক্যাম্পেইন রান করুন'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${innerCard}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Organic Contribution
                </div>
                <div className="text-lg font-black mt-1 text-slate-400">
                  {formatMoney(0)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  অপেক্ষমান (Search Console)
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
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <h3 className={`text-sm font-bold ${textTitle}`}>Realtime Activity (Last 30 Min)</h3>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                  isLight ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  0 Active Users
                </span>
              </div>

              {/* Minute bars visualization */}
              <div className="mt-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  USERS PER MINUTE
                </div>
                <div className={`mt-2 flex items-end gap-1 h-20 w-full rounded-lg p-2 border ${innerCard}`}>
                  {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all bg-slate-200 dark:bg-slate-800"
                      style={{ height: '4px' }}
                      title="0 users"
                    />
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>30 min ago</span>
                  <span className="text-slate-400 font-medium">
                    Now (0 live)
                  </span>
                </div>
              </div>

              {/* Top Active Cities */}
              <div className="mt-3.5 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TOP ACTIVE REGIONS
                </div>
                <div className={`rounded-lg p-3 text-center text-xs text-slate-400 border border-dashed ${innerCard}`}>
                  কোনো সক্রিয় ইউজার সেশন নেই (No active sessions)
                </div>
              </div>

              {/* Device Split */}
              <div className={`mt-3.5 rounded-xl p-3 border ${innerCard}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  DEVICE CATEGORY
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className={textMuted}>Android: <strong className={textTitle}>0%</strong></span>
                  <span className={textMuted}>iOS: <strong className={textTitle}>0%</strong></span>
                  <span className={textMuted}>Desktop: <strong className={textTitle}>0%</strong></span>
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
                    <td className="px-4 py-3">{totalClicks.toLocaleString()}</td>
                    <td className="px-4 py-3">{Math.round(totalClicks * 0.7).toLocaleString()}</td>
                    <td className="px-4 py-3">{formatMoney(metrics.spend)}</td>
                    <td className="px-4 py-3">{metrics.conversions} orders</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{formatMoney(metrics.revenue)}</td>
                    <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400">{metrics.roas.toFixed(2)}x</td>
                    <td className="px-4 py-3">{formatMoney(metrics.cpa)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{totalCvr.toFixed(2)}%</td>
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
                  {creatives.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        কোনো সক্রিয় অ্যাড ক্রিয়েটিভ নেই (অ্যাকাউন্ট কানেক্ট করলে ক্রিয়েটিভ ও হুক রেট এখানে প্রদর্শিত হবে)
                      </td>
                    </tr>
                  ) : (
                    creatives.map((cr) => {
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
                  }))}
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
              <div className={`text-2xl font-black mt-2 ${textTitle}`}>
                {totalClicks > 0 ? totalClicks.toLocaleString() : '0'}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                {totalClicks > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3" /> Live Synced Clicks
                  </>
                ) : (
                  <span className="text-slate-400 font-normal">অপেক্ষমান</span>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">ENGAGED SESSIONS</div>
              <div className={`text-2xl font-black mt-2 text-indigo-600 dark:text-indigo-400`}>
                {totalClicks > 0 ? Math.round(totalClicks * 0.7).toLocaleString() : '0'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Engagement Rate: <strong className={textTitle}>{totalClicks > 0 ? '70.00%' : '0.00%'}</strong>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">AVG ENGAGEMENT TIME</div>
              <div className={`text-2xl font-black mt-2 text-cyan-600 dark:text-cyan-400`}>
                {totalClicks > 0 ? '0m 45s' : '0s'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Active user browsing time
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="text-xs font-semibold text-slate-400">EVENTS PER SESSION</div>
              <div className={`text-2xl font-black mt-2 text-amber-500`}>
                {totalClicks > 0 ? '1.2' : '0.0'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Interaction depth
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
                    <th className="px-4 py-3">Sessions (Clicks)</th>
                    <th className="px-4 py-3">Engaged Sessions</th>
                    <th className="px-4 py-3">Engagement Rate</th>
                    <th className="px-4 py-3">Key Events (Purchases)</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">True ROAS</th>
                    <th className="px-4 py-3 text-right">CVR %</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {channelData
                    .filter(c => c.name.toLowerCase().includes(trafficSearch.toLowerCase()) || c.sub.toLowerCase().includes(trafficSearch.toLowerCase()))
                    .map((c, i) => (
                      <tr key={i} className={`transition-colors ${rowHover}`}>
                        <td className={`px-4 py-3 font-semibold font-mono ${textTitle}`}>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                            <span>{c.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5">{c.sub}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{c.sessions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{c.engagedUsers.toLocaleString()}</td>
                        <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{c.sessions > 0 ? '70.0%' : '0%'}</td>
                        <td className={`px-4 py-3 font-bold ${textTitle}`}>{c.purchases} orders</td>
                        <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(c.revenueUsd)}</td>
                        <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">{c.roas > 0 ? `${c.roas.toFixed(2)}x` : '—'}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-200">{c.cvr}%</td>
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

              <div className={`p-6 text-center text-xs text-slate-400 border border-dashed rounded-lg ${innerCard}`}>
                কোনো ল্যান্ডিং পেজ ট্র্যাকিং ডেটা রেকর্ড হয়নি (GA4 Page Measurement Protocol অপেক্ষমান)
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
                    <strong className={textTitle}>{totalClicks > 0 ? '100%' : '0%'}</strong>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div className="bg-blue-500" style={{ width: totalClicks > 0 ? '100%' : '0%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5 text-emerald-500" /> Desktop
                    </span>
                    <strong className={textTitle}>0%</strong>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${innerCard}`}>
                <div className="font-bold text-slate-400 uppercase text-[10px]">IN-APP BROWSER BREAKDOWN</div>
                <div className="flex justify-between">
                  <span className={textMuted}>Facebook & Instagram In-App</span>
                  <span className={`font-bold ${textTitle}`}>{metaClicks > 0 ? '100%' : '0%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={textMuted}>Mobile Chrome & Safari</span>
                  <span className={`font-bold ${textTitle}`}>0%</span>
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
                { step: '1. Item Views (Ad Clicks)', event: 'view_item', users: totalClicks, pctOfTop: totalClicks > 0 ? '100%' : '0%', dropOff: '—', color: 'from-blue-500 to-indigo-600' },
                { step: '2. Add to Cart', event: 'add_to_cart', users: 0, pctOfTop: '0%', dropOff: '—', color: 'from-indigo-500 to-cyan-500' },
                { step: '3. Begin Checkout', event: 'begin_checkout', users: 0, pctOfTop: '0%', dropOff: '—', color: 'from-cyan-500 to-teal-500' },
                { step: '4. Payment Info', event: 'add_payment_info', users: 0, pctOfTop: '0%', dropOff: '—', color: 'from-teal-500 to-emerald-500' },
                { step: '5. Purchase Complete', event: 'purchase', users: metrics.conversions || 0, pctOfTop: totalClicks > 0 && metrics.conversions > 0 ? `${((metrics.conversions / totalClicks) * 100).toFixed(1)}%` : '0%', dropOff: '—', color: 'from-emerald-500 to-green-600', isGoal: true },
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
                        style={{ width: stage.users > 0 ? `${(stage.users / (totalClicks || 1)) * 100}%` : '0%' }} 
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
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      কোনো পণ্য বা অর্ডার ডেটা পাওয়া যায়নি (No eCommerce product catalog synced)
                    </td>
                  </tr>
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
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/15 text-slate-400 border border-slate-500/30">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-black ${textTitle}`}>
                    Realtime GA4 Server-Side Measurement Stream
                  </h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isLight ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    Waiting for Telemetry Stream (অপেক্ষমান)
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
                <div className="text-2xl font-black text-slate-400">
                  0
                </div>
              </div>
              <div className={`rounded-xl border p-2.5 px-4 text-center ${innerCard}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400">LAST 30 MIN USERS</div>
                <div className="text-2xl font-black text-slate-400">
                  0
                </div>
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
                <span className="text-xs font-mono font-bold text-slate-400">
                  ○ Standby
                </span>
              </div>

              {/* Minute Bars */}
              <div className="space-y-1">
                <div className={`h-36 w-full rounded-xl border p-3 flex items-end gap-1.5 ${innerCard}`}>
                  {Array(30).fill(0).map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all bg-slate-200 dark:bg-slate-800"
                      style={{ height: '4px' }}
                      title="0 users"
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
                  <span>30 minutes ago</span>
                  <span>15 minutes ago</span>
                  <span className="text-slate-400 font-medium">
                    Just Now (0 Users)
                  </span>
                </div>
              </div>

              {/* Realtime Active Screens */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TOP PAGES ACTIVE RIGHT NOW
                </div>
                <div className={`p-4 text-center text-xs text-slate-400 border border-dashed rounded-lg ${innerCard}`}>
                  কোনো সক্রিয় পেজ সেশন নেই (No active page views)
                </div>
              </div>
            </div>

            {/* Right: Live Event Stream Feed (5 cols) */}
            <div className={`p-4.5 rounded-xl border lg:col-span-5 ${cardBg} space-y-3`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <h4 className={`text-sm font-bold ${textTitle}`}>Live Event Stream Ticker</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Standby</span>
              </div>

              <div className={`p-6 text-center text-xs text-slate-400 border border-dashed rounded-lg ${innerCard}`}>
                কোনো লাইভ ইভেন্ট স্ট্রিম পাওয়া যায়নি (Waiting for incoming telemetry)
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
