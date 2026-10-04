'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Share2,
  Printer,
  Link2,
  FolderSync,
  Layers,
  BarChart2
} from 'lucide-react';
import { MetricSummary, CampaignData } from '@/types';

interface ReportsViewProps {
  theme?: 'light' | 'dark';
  metrics?: MetricSummary;
  campaigns?: CampaignData[];
  clientName?: string;
  currency?: string;
  onOpenHub?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  theme = 'light',
  metrics,
  campaigns = [],
  clientName = 'Primary Workspace',
  currency = 'USD',
  onOpenHub
}) => {
  const isLight = theme === 'light';
  const [reportLang, setReportLang] = useState<'BN' | 'EN'>('BN');
  const [reportRange, setReportRange] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');

  const hasData = Boolean(metrics && metrics.spend > 0 && campaigns && campaigns.length > 0);

  const formatMoney = (val: number) => {
    if (currency === 'BDT') {
      return `৳${Math.round(val).toLocaleString('en-US')}`;
    }
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Best performing campaigns (ROAS >= 2.5)
  const winningCampaigns = campaigns.filter(c => c.roas >= 2.5);
  // Fatigued or underperforming campaigns (spend > 0 and ROAS < 1.5)
  const underperformingCampaigns = campaigns.filter(c => c.spend > 0 && c.roas < 1.5);

  const handleDownload = () => {
    if (!hasData) {
      alert(
        reportLang === 'BN'
          ? 'রিপোর্ট তৈরি করার জন্য কোনো লাইভ ডেটা নেই। অনুগ্রহ করে প্রথমে অ্যাড অ্যাকাউন্ট কানেক্ট করুন।'
          : 'No live performance data available to generate report. Please connect ad accounts first.'
      );
      return;
    }
    alert(
      reportLang === 'BN'
        ? 'পিডিএফ রিপোর্ট প্রস্তুত হচ্ছে এবং ডাউনলোড শুরু হচ্ছে...'
        : 'Generating PDF executive report...'
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className={`rounded-2xl border p-5 transition-all ${
        isLight 
          ? 'border-slate-200/90 bg-white shadow-xs' 
          : 'border-slate-800 bg-[#0f141f] shadow-sm'
      }`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shadow-xs ${
                isLight 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}>
                <FileText className="h-4 w-4" />
              </div>
              <h2 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Executive Reports
              </h2>
            </div>
            <p className={`mt-1 text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {reportLang === 'BN'
                ? 'সাপ্তাহিক ও মাসিক ক্যাম্পেইন পারফর্ম্যান্সের রেডি-টু-শেয়ার সারসংক্ষেপ ও পিডিএফ এক্সপোর্ট।'
                : 'Ready-to-share executive campaign performance summaries and PDF exports.'}
            </p>
          </div>

          {/* Controls: Language, Period & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Language Switch */}
            <div className={`flex items-center rounded-xl border p-1 text-xs ${
              isLight ? 'border-slate-200 bg-slate-100/70' : 'border-slate-800 bg-slate-900/80'
            }`}>
              <button
                onClick={() => setReportLang('BN')}
                className={`rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
                  reportLang === 'BN' 
                    ? isLight ? 'bg-white text-slate-900 shadow-xs' : 'bg-slate-800 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setReportLang('EN')}
                className={`rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
                  reportLang === 'EN' 
                    ? isLight ? 'bg-white text-slate-900 shadow-xs' : 'bg-slate-800 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Range Select */}
            <select
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value as any)}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold focus:outline-none transition-all cursor-pointer ${
                isLight 
                  ? 'border-slate-200 bg-white text-slate-800 shadow-xs focus:border-blue-500' 
                  : 'border-slate-800 bg-slate-900 text-white focus:border-blue-500'
              }`}
            >
              <option value="DAILY">{reportLang === 'BN' ? 'দৈনিক রিপোর্ট (Daily)' : 'Daily Report'}</option>
              <option value="WEEKLY">{reportLang === 'BN' ? 'সাপ্তাহিক রিপোর্ট (Weekly)' : 'Weekly Report'}</option>
              <option value="MONTHLY">{reportLang === 'BN' ? 'মাসিক রিপোর্ট (Monthly)' : 'Monthly Report'}</option>
            </select>

            {/* Export button */}
            <button
              onClick={handleDownload}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                hasData
                  ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                  : isLight 
                    ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Preview Document */}
      <div className={`rounded-2xl border p-6 sm:p-8 transition-all ${
        isLight 
          ? 'bg-white border-slate-200/90 shadow-xs' 
          : 'bg-[#101625] border-slate-800 shadow-sm'
      }`}>
        {/* Report Header */}
        <div className="border-b pb-5 border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isLight ? 'text-blue-600' : 'text-blue-400'
              }`}>
                Executive Growth Report
              </span>
              <h3 className={`text-xl font-bold mt-1 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {reportLang === 'BN'
                  ? (reportRange === 'DAILY' ? 'দৈনিক পারফর্ম্যান্স সারাংশ' : reportRange === 'MONTHLY' ? 'মাসিক পারফর্ম্যান্স সারাংশ' : 'সাপ্তাহিক পারফর্ম্যান্স সারাংশ')
                  : (reportRange === 'DAILY' ? 'Daily Performance Executive Summary' : reportRange === 'MONTHLY' ? 'Monthly Performance Executive Summary' : 'Weekly Performance Executive Summary')}
              </h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {reportLang === 'BN' 
                  ? `ব্র্যান্ড: ${clientName} • কারেন্সি: ${currency} (${currency === 'BDT' ? '৳' : '$'})` 
                  : `Brand: ${clientName} • Currency: ${currency} (${currency === 'BDT' ? '৳' : '$'})`}
              </p>
            </div>

            <div className="text-right">
              <div className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border ${
                hasData
                  ? isLight 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs' 
                    : 'bg-emerald-950/30 text-emerald-400 border-emerald-800/60'
                  : isLight
                    ? 'bg-slate-50 text-slate-500 border-slate-200'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800'
              }`}>
                <CheckCircle2 className={`h-4 w-4 ${hasData ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>Blended ROAS: {metrics?.roas ? `${metrics.roas.toFixed(2)}x` : '0.00x'}</span>
              </div>
              <div className={`text-[11px] mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {hasData
                  ? (reportLang === 'BN' ? 'টার্গেট: ৩.২০x (লাইভ ট্র্যাকিং সক্রিয়)' : 'Target: 3.20x (Live tracking active)')
                  : (reportLang === 'BN' ? 'টার্গেট: — (ডেটা সংযোগ আবশ্যক)' : 'Target: — (Account connection required)')}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Core Metrics Grid */}
        <div className="mt-6">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {reportLang === 'BN' ? '১. মূল মেট্রিক্স ও রূপান্তর' : '1. Core Performance Snapshot'}
          </h4>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className={`rounded-xl p-4 border transition-all ${
              isLight ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-900/60 border-slate-800/80'
            }`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Spend</div>
              <div className={`text-xl font-bold mt-1 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {formatMoney(metrics?.spend || 0)}
              </div>
              <div className={`text-[11px] font-semibold mt-0.5 ${hasData ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {hasData ? '+0.0% Pacing' : (reportLang === 'BN' ? '০% পেসিং' : '0% pacing')}
              </div>
            </div>

            <div className={`rounded-xl p-4 border transition-all ${
              isLight ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-900/60 border-slate-800/80'
            }`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Revenue</div>
              <div className={`text-xl font-bold mt-1 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {formatMoney(metrics?.revenue || 0)}
              </div>
              <div className={`text-[11px] font-semibold mt-0.5 ${hasData ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {hasData ? '+0.0% vs পূর্ববর্তী' : (reportLang === 'BN' ? 'কোনো বিক্রয় নেই' : 'No sales recorded')}
              </div>
            </div>

            <div className={`rounded-xl p-4 border transition-all ${
              isLight ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-900/60 border-slate-800/80'
            }`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Conversions (Orders)</div>
              <div className={`text-xl font-bold mt-1 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {metrics?.conversions || 0} {reportLang === 'BN' ? 'অর্ডার' : 'Orders'}
              </div>
              <div className={`text-[11px] font-semibold mt-0.5 ${hasData ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                CPA: {formatMoney(metrics?.cpa || 0)}
              </div>
            </div>

            <div className={`rounded-xl p-4 border transition-all ${
              isLight ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-900/60 border-slate-800/80'
            }`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {reportLang === 'BN' ? 'গড় সিটিআর (CTR)' : 'Avg CTR'}
              </div>
              <div className={`text-xl font-bold mt-1 tracking-tight ${hasData ? (isLight ? 'text-blue-600' : 'text-blue-400') : (isLight ? 'text-slate-400' : 'text-slate-500')}`}>
                {metrics?.ctr ? `${metrics.ctr.toFixed(2)}%` : '0.00%'}
              </div>
              <div className={`text-[11px] font-semibold mt-0.5 ${hasData ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {hasData ? 'বেঞ্চমার্ক >১.৫%' : (reportLang === 'BN' ? 'অপেক্ষমান' : 'Pending live ads')}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Banner when no live ad data */}
        {!hasData ? (
          <div className={`mt-8 rounded-2xl border border-dashed p-8 text-center transition-all ${
            isLight ? 'border-slate-300 bg-slate-50/50' : 'border-slate-800 bg-slate-900/30'
          }`}>
            <div className={`mx-auto h-12 w-12 rounded-2xl flex items-center justify-center border shadow-xs ${
              isLight ? 'bg-white border-slate-200 text-blue-600' : 'bg-slate-800 border-slate-700 text-blue-400'
            }`}>
              <BarChart2 className="h-6 w-6" />
            </div>
            <h4 className={`text-base font-bold mt-3.5 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {reportLang === 'BN' ? 'কোনো সক্রিয় পারফর্ম্যান্স রিপোর্ট পাওয়া যায়নি' : 'No Active Campaign Report Found'}
            </h4>
            <p className={`text-xs max-w-md mx-auto mt-1.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {reportLang === 'BN'
                ? 'বর্তমানে কোনো অ্যাড অ্যাকাউন্ট কানেক্টেড নেই বা কোনো সক্রিয় বিজ্ঞাপন রান হচ্ছে না। Meta, Google বা TikTok অ্যাড অ্যাকাউন্ট কানেক্ট করলে স্বয়ংক্রিয়ভাবে লাইভ মেট্রিক্স, উইনিং ক্রিয়েটিভ এবং অপ্টিমাইজেশন সারসংক্ষেপ এখানে প্রদর্শিত হবে।'
                : 'No ad accounts connected or active campaigns running. Connect your Meta, Google, or TikTok ad accounts to generate automated reports with live metrics, key wins, and optimization action plans.'}
            </p>
            {onOpenHub && (
              <button
                onClick={onOpenHub}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>{reportLang === 'BN' ? 'অ্যাড প্ল্যাটফর্ম কানেক্ট করুন' : 'Connect Ad Platforms'}</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Section 2: What Worked (সফলতা) */}
            <div className={`mt-5 rounded-xl border p-4.5 transition-all ${
              isLight 
                ? 'border-slate-200/80 bg-slate-50/50' 
                : 'border-slate-800 bg-slate-900/40'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{reportLang === 'BN' ? '২. যা সফল হয়েছে (Key Highlights)' : '2. Key Wins'}</span>
              </div>
              <ul className={`mt-3 space-y-2 text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {winningCampaigns.length > 0 ? (
                  winningCampaigns.map((camp) => (
                    <li key={camp.id} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>
                        <strong>{camp.name}:</strong> {camp.roas.toFixed(2)}x ROAS অর্জন করেছে এবং মোট {camp.conversions}টি নিশ্চিত অর্ডার সম্পন্ন হয়েছে।
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>
                      {reportLang === 'BN' 
                        ? 'উচ্চ আরওএএস (ROAS ≥ ২.৫x) ক্যাম্পেইনের ডেটা এখনও পর্যাপ্ত নয়। বিজ্ঞাপন অপ্টিমাইজেশন চলমান।' 
                        : 'No high-performing campaigns (ROAS ≥ 2.5x) detected yet. Ongoing optimization in progress.'}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Section 3: What Didn't Work (অপচয় রোধ) */}
            <div className={`mt-4 rounded-xl border p-4.5 transition-all ${
              isLight 
                ? 'border-slate-200/80 bg-slate-50/50' 
                : 'border-slate-800 bg-slate-900/40'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{reportLang === 'BN' ? '৩. অপচয় ও ফ্যাটিগ (Areas to Optimize)' : '3. Bottlenecks & Wasted Spend'}</span>
              </div>
              <ul className={`mt-3 space-y-2 text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {underperformingCampaigns.length > 0 ? (
                  underperformingCampaigns.map((camp) => (
                    <li key={camp.id} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>
                        <strong>{camp.name}:</strong> খরচ {formatMoney(camp.spend)} কিন্তু ROAS মাত্র {camp.roas.toFixed(2)}x (বাজেট কমানো বা ক্রিয়েটিভ বদলানো দরকার)।
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>
                      {reportLang === 'BN'
                        ? 'কোনো অপচয় বা ফ্যাটিগ আক্রান্ত ক্যাম্পেইন শনাক্ত হয়নি। সমস্ত ক্যাম্পেইন নিরাপদ প্যারামিটারে চলছে।'
                        : 'No critical budget bleeds or creative fatigue detected across active campaigns.'}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Section 4: Next Steps (পরবর্তী পদক্ষেপ) */}
            <div className={`mt-4 rounded-xl border p-4.5 transition-all ${
              isLight 
                ? 'border-slate-200/80 bg-slate-50/50' 
                : 'border-slate-800 bg-slate-900/40'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>{reportLang === 'BN' ? '৪. পরবর্তী অ্যাকশন প্ল্যান (Next Steps)' : '4. Actionable Next Steps'}</span>
              </div>
              <ul className={`mt-3 space-y-2 text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 shrink-0">১.</span>
                  <span>
                    {reportLang === 'BN' 
                      ? 'অটোমেশন রুলস অডিট চালিয়ে কোনো নন-পারফর্মিং অ্যাড থাকলে অ্যাকশন সেন্টারে অনুমোদন দিন।' 
                      : 'Audit automated rules and execute pending queue actions in Action Center.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 shrink-0">২.</span>
                  <span>
                    {reportLang === 'BN'
                      ? 'সেরা পারফর্মিং ক্যাম্পেইনের দৈনিক বাজেট ২০% বৃদ্ধি করে স্কেল করুন।'
                      : 'Scale the highest ROAS campaigns with a safe 20% budget increase.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 shrink-0">৩.</span>
                  <span>
                    {reportLang === 'BN'
                      ? 'ক্রিয়েটিভ ল্যাবে নতুন হাই-হুক ভিডিও ও ইউজার জেনারেটেড কনটেন্ট (UGC) টেস্ট করুন।'
                      : 'Test new high-hook video creatives and UGC variations in Creative Lab.'}
                  </span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
