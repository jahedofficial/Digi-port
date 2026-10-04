'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Play, 
  Pause, 
  ArrowUpRight, 
  Search, 
  Sparkles,
  ExternalLink,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { CampaignData, MetricSummary } from '@/types';

interface PlatformDashboardProps {
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  campaigns: CampaignData[];
  metrics: MetricSummary;
  onToggleStatus: (campaignId: string) => void;
  onScaleBudget: (campaignId: string) => void;
}

export const PlatformDashboard: React.FC<PlatformDashboardProps> = ({
  platform,
  campaigns,
  metrics,
  onToggleStatus,
  onScaleBudget,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const platformTitle = 
    platform === 'META' ? 'Meta Ads Manager (Facebook & Instagram)' :
    platform === 'GOOGLE' ? 'Google Ads (Search, Performance Max & Display)' :
    'TikTok Ads For Business (Spark & In-Feed)';

  const platformBadge = 
    platform === 'META' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
    platform === 'GOOGLE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
    'bg-rose-500/20 text-rose-400 border-rose-500/30';

  const filteredCampaigns = campaigns.filter(
    (c) => c.platform === platform && c.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white">
            <Layers className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{platformTitle}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${platformBadge}`}>
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Real-Time Ad Performance, Pacing & Bid Management
            </p>
          </div>
        </div>

        {/* Quick filter */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="ক্যাম্পেইন খুঁজুন..."
            className="w-40 bg-transparent text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Platform Spend</div>
          <div className="mt-1 text-xl font-bold text-white">${metrics.spend.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Revenue</div>
          <div className="mt-1 text-xl font-bold text-white">${metrics.revenue.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5">
          <div className="text-[11px] font-medium text-indigo-300">Platform ROAS</div>
          <div className="mt-1 text-xl font-black text-indigo-400">{metrics.roas.toFixed(2)}x</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Avg CPA</div>
          <div className="mt-1 text-xl font-bold text-white">${metrics.cpa.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Conversions</div>
          <div className="mt-1 text-xl font-bold text-white">{metrics.conversions}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Avg CTR</div>
          <div className="mt-1 text-xl font-bold text-white">{metrics.ctr.toFixed(2)}%</div>
        </div>
      </div>

      {/* Google Ads Specific Quality Metrics if on Google */}
      {platform === 'GOOGLE' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Sparkles className="h-4 w-4" />
              <span>Google Ads Search Term Negative Mining</span>
            </div>
            <p className="mt-1 text-slate-300">
              Agent স্বয়ংক্রিয়ভাবে সার্চ টার্ম স্ক্যান করছে। $১০+ খরচ কিন্তু ০ কনভার্সন হওয়া সার্চ কোয়েরি নেগেটিভ কিওয়ার্ডে পাঠানোর প্রস্তাবিত।
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <TrendingUp className="h-4 w-4" />
              <span>Lost Impression Share (Budget & Rank)</span>
            </div>
            <p className="mt-1 text-slate-300">
              ব্র্যান্ড ক্যাম্পেইনে মাত্র ৮.২% ইম্প্রেশন শেয়ার ড্রপ হয়েছে। জেনেরিক সার্চে বাজেট শেষ হয়ে যাওয়ায় ২৮% সুযোগ নষ্ট হচ্ছে।
            </p>
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="border-b border-slate-800 px-4 py-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Campaign Performance & Action Controller ({filteredCampaigns.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Campaign Name</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Spend</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">CPA</th>
                <th className="px-4 py-3">ROAS</th>
                <th className="px-4 py-3">CTR</th>
                {platform === 'GOOGLE' && <th className="px-4 py-3">Lost IS / QS</th>}
                <th className="px-4 py-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCampaigns.map((camp) => {
                const isHighPerformer = camp.roas >= 3.5;
                const isBleed = camp.cpa > 12.0 || (camp.spend > 70 && camp.conversions < 6);

                return (
                  <tr key={camp.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Status toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleStatus(camp.id)}
                        className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold transition-all ${
                          camp.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Click to Toggle Active / Paused"
                      >
                        {camp.status === 'ACTIVE' ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ACTIVE
                          </>
                        ) : (
                          <>
                            <Pause className="h-2.5 w-2.5" />
                            PAUSED
                          </>
                        )}
                      </button>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{camp.name}</span>
                        {isHighPerformer && (
                          <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                            WINNER
                          </span>
                        )}
                        {isBleed && (
                          <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[9px] font-bold text-rose-400 border border-rose-500/30">
                            HIGH CPA
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{camp.objective} • {camp.budgetType}</div>
                    </td>

                    {/* Daily Budget */}
                    <td className="px-4 py-3 font-medium text-slate-300">
                      ${camp.dailyBudget.toFixed(2)}/d
                    </td>

                    {/* Spend */}
                    <td className="px-4 py-3 font-medium text-slate-200">
                      ${camp.spend.toFixed(2)}
                    </td>

                    {/* Conversions */}
                    <td className="px-4 py-3 font-bold text-white">
                      {camp.conversions}
                    </td>

                    {/* CPA */}
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${camp.cpa > 10.0 ? 'text-rose-400' : 'text-slate-200'}`}>
                        ${camp.cpa.toFixed(2)}
                      </span>
                    </td>

                    {/* ROAS */}
                    <td className="px-4 py-3">
                      <span className={`font-black ${isHighPerformer ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {camp.roas.toFixed(2)}x
                      </span>
                    </td>

                    {/* CTR */}
                    <td className="px-4 py-3 text-slate-300">
                      {camp.ctr.toFixed(2)}%
                    </td>

                    {/* Google Lost IS */}
                    {platform === 'GOOGLE' && (
                      <td className="px-4 py-3 text-slate-400">
                        {camp.lostImpressionShare ? `${camp.lostImpressionShare}% lost` : 'N/A'} • QS: {camp.qualityScore || 8}/10
                      </td>
                    )}

                    {/* Quick action buttons */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isHighPerformer && (
                          <button
                            onClick={() => onScaleBudget(camp.id)}
                            className="flex items-center gap-1 rounded bg-indigo-600/30 px-2 py-1 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all"
                            title="Scale budget +20%"
                          >
                            <ArrowUpRight className="h-3 w-3" />
                            +20% Scale
                          </button>
                        )}
                        <button
                          onClick={() => onToggleStatus(camp.id)}
                          className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          {camp.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
