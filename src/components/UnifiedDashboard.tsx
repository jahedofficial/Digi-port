'use client';

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  ShoppingBag, 
  Users, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  AlertTriangle,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { MetricSummary, CampaignData, CreativeData, BreakdownItem } from '@/types';
import { BREAKDOWN_DATA } from '@/lib/mock-data';

interface UnifiedDashboardProps {
  metrics: MetricSummary;
  campaigns: CampaignData[];
  creatives: CreativeData[];
  onSelectCampaign: (campaign: CampaignData) => void;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  metrics,
  campaigns,
  creatives,
  onSelectCampaign,
}) => {
  const topWinners = campaigns
    .filter((c) => c.status === 'ACTIVE' && c.roas >= 3.5)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 3);

  const underperformers = campaigns
    .filter((c) => c.cpa > 10.0 || (c.spend > 80 && c.conversions < 8))
    .slice(0, 2);

  // Dynamic platform spend distribution
  const metaSpend = campaigns.filter((c) => c.platform === 'META').reduce((acc, c) => acc + c.spend, 0);
  const googleSpend = campaigns.filter((c) => c.platform === 'GOOGLE').reduce((acc, c) => acc + c.spend, 0);
  const tiktokSpend = campaigns.filter((c) => c.platform === 'TIKTOK').reduce((acc, c) => acc + c.spend, 0);
  const totalCampaignSpend = metaSpend + googleSpend + tiktokSpend;

  const metaRoas = metaSpend > 0 ? (campaigns.filter((c) => c.platform === 'META').reduce((acc, c) => acc + (c.spend * c.roas), 0) / metaSpend) : 0;
  const googleRoas = googleSpend > 0 ? (campaigns.filter((c) => c.platform === 'GOOGLE').reduce((acc, c) => acc + (c.spend * c.roas), 0) / googleSpend) : 0;
  const tiktokRoas = tiktokSpend > 0 ? (campaigns.filter((c) => c.platform === 'TIKTOK').reduce((acc, c) => acc + (c.spend * c.roas), 0) / tiktokSpend) : 0;

  const platformShares = [
    { 
      name: 'Meta Ads', 
      spend: metaSpend, 
      share: totalCampaignSpend > 0 ? Math.round((metaSpend / totalCampaignSpend) * 100) : 0, 
      color: 'bg-blue-500', 
      roas: Number(metaRoas.toFixed(2)) 
    },
    { 
      name: 'Google Ads', 
      spend: googleSpend, 
      share: totalCampaignSpend > 0 ? Math.round((googleSpend / totalCampaignSpend) * 100) : 0, 
      color: 'bg-amber-500', 
      roas: Number(googleRoas.toFixed(2)) 
    },
    { 
      name: 'TikTok Ads', 
      spend: tiktokSpend, 
      share: totalCampaignSpend > 0 ? Math.round((tiktokSpend / totalCampaignSpend) * 100) : 0, 
      color: 'bg-rose-500', 
      roas: Number(tiktokRoas.toFixed(2)) 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Blended KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Blended Spend */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Ad Spend</span>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              ${metrics.spend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>{metrics.spend > 0 ? '+12.2% vs previous period' : 'No ad spend yet'}</span>
          </div>
        </div>

        {/* Blended ROAS */}
        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/40 p-4 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between text-indigo-300">
            <span className="text-xs font-semibold">Blended ROAS</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-indigo-300">
              {metrics.roas.toFixed(2)}x
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 rounded bg-emerald-500/20 px-1 py-0.5 border border-emerald-500/30">
              Target: 3.2x
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <span>{metrics.roas > 0 ? 'Live return on ad spend' : 'Waiting for live sales'}</span>
          </div>
        </div>

        {/* Blended CPA */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Blended CPA</span>
            <Target className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              ${metrics.cpa.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">
              Target: &lt;$8.50
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Cost per acquisition</span>
          </div>
        </div>

        {/* Total Orders / Conversions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Orders</span>
            <ShoppingBag className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {metrics.conversions.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">orders</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Attributed conversions</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-md col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-emerald-400">
              ${metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Gross Sales</span>
          </div>
        </div>
      </div>

      {/* Cross-Platform Spend & ROAS Distribution Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cross-Platform Budget Allocation & ROAS Share
            </h3>
            <p className="text-xs text-slate-300">
              {totalCampaignSpend > 0 
                ? `Meta (${platformShares[0].share}%), Google (${platformShares[1].share}%), TikTok (${platformShares[2].share}%)`
                : 'No campaigns active yet'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {platformShares.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
                <span className="text-slate-300">{p.name}:</span>
                <span className="font-bold text-white">${p.spend}</span>
                <span className="text-emerald-400 font-medium">({p.roas}x)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
          {totalCampaignSpend > 0 ? (
            <>
              <div className="bg-blue-500 transition-all" style={{ width: `${platformShares[0].share}%` }} title={`Meta ${platformShares[0].share}%`} />
              <div className="bg-amber-500 transition-all" style={{ width: `${platformShares[1].share}%` }} title={`Google ${platformShares[1].share}%`} />
              <div className="bg-rose-500 transition-all" style={{ width: `${platformShares[2].share}%` }} title={`TikTok ${platformShares[2].share}%`} />
            </>
          ) : (
            <div className="w-full bg-slate-800/80 text-center text-[10px] text-slate-500">0% Active Distribution</div>
          )}
        </div>
      </div>

      {/* Two Column: Top Winners vs Underperformers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Winners */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
                <Flame className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold text-white">Top Scaling Winners (MVP)</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              High ROAS & Scale Ready
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {topWinners.length > 0 ? (
              topWinners.map((camp) => (
                <div
                  key={camp.id}
                  onClick={() => onSelectCampaign(camp)}
                  className="group flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 hover:border-slate-700 hover:bg-slate-900/80 cursor-pointer transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        camp.platform === 'META' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {camp.platform}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {camp.name}
                      </h4>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Spend: ${camp.spend.toFixed(0)}</span>
                      <span>Conversions: {camp.conversions}</span>
                      <span>CPA: ${camp.cpa.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">
                      {camp.roas.toFixed(2)}x
                    </div>
                    <div className="text-[10px] text-slate-400">ROAS</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                কোনো হাই-পারফর্মিং ক্যাম্পেইন ডেটা নেই। অ্যাকাউন্ট কানেক্ট করুন।
              </div>
            )}
          </div>
        </div>

        {/* Underperformers & Budget Bleeds */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold text-white">Underperformers / Budget Bleed</h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Needs Action / Kill
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {underperformers.length > 0 ? (
              underperformers.map((camp) => (
                <div
                  key={camp.id}
                  className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-950/10 p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                        {camp.platform}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">
                        {camp.name}
                      </h4>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Spend: ${camp.spend.toFixed(0)}</span>
                      <span className="text-rose-400 font-semibold">CPA: ${camp.cpa.toFixed(2)}</span>
                      <span>Conversions: {camp.conversions}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-400">
                      {camp.roas.toFixed(2)}x ROAS
                    </div>
                    <span className="text-[10px] text-amber-400 font-medium">Zero/Low ROI</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                কোনো বাজেট লিক বা আন্ডারপারফর্মিং ক্যাম্পেইন নেই।
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Tables (Placement, Region, Device) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Cross-Platform Performance Breakdowns (F2)
        </h3>

        {BREAKDOWN_DATA.placement.length > 0 || BREAKDOWN_DATA.region.length > 0 ? (
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {/* Placement */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-indigo-300">Top Placements</h4>
              <div className="space-y-1.5">
                {BREAKDOWN_DATA.placement.map((item, idx) => (
                  <div key={idx} className="rounded bg-slate-950/60 p-2 text-xs">
                    <div className="flex justify-between font-medium text-slate-200">
                      <span>{item.dimension}</span>
                      <span className="text-emerald-400 font-bold">{item.roas}x ROAS</span>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                      <span>Spend: ${item.spend}</span>
                      <span>CPA: ${item.cpa}</span>
                      <span>{item.share}% share</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-indigo-300">Geographic Regions</h4>
              <div className="space-y-1.5">
                {BREAKDOWN_DATA.region.map((item, idx) => (
                  <div key={idx} className="rounded bg-slate-950/60 p-2 text-xs">
                    <div className="flex justify-between font-medium text-slate-200">
                      <span>{item.dimension}</span>
                      <span className="text-emerald-400 font-bold">{item.roas}x ROAS</span>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                      <span>Spend: ${item.spend}</span>
                      <span>Orders: {item.conversions}</span>
                      <span>CPA: ${item.cpa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-indigo-300">Device Types</h4>
              <div className="space-y-1.5">
                {BREAKDOWN_DATA.device.map((item, idx) => (
                  <div key={idx} className="rounded bg-slate-950/60 p-2 text-xs">
                    <div className="flex justify-between font-medium text-slate-200">
                      <span>{item.dimension}</span>
                      <span className={item.roas >= 3.0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {item.roas}x ROAS
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                      <span>Spend: ${item.spend}</span>
                      <span>CPA: ${item.cpa}</span>
                      <span>{item.share}% traffic</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            ক্যাম্পেইন সিঙ্ক হলে প্লেসমেন্ট, রিজিয়ন ও ডিভাইস ভিত্তিক পারফর্ম্যান্স ডেটা এখানে প্রদর্শিত হবে।
          </div>
        )}
      </div>
    </div>
  );
};
