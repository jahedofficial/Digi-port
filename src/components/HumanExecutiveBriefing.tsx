'use client';

import React from 'react';
import { 
  Sparkles, 
  Flame, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Coffee
} from 'lucide-react';
import { MetricSummary } from '@/types';

interface HumanExecutiveBriefingProps {
  metrics: MetricSummary;
  onNavigateToActions: () => void;
  onNavigateToCreatives: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const HumanExecutiveBriefing: React.FC<HumanExecutiveBriefingProps> = ({
  metrics,
  onNavigateToActions,
  onNavigateToCreatives,
  onAskCopilot,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900/95 via-indigo-950/30 to-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
      {/* Decorative subtle ambient lights */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Conversational Briefing */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Coffee className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              দৈনিক গ্রোথ ব্রিফিং • Daily Marketing Brief
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Healthy & Scaled
            </span>
          </div>

          <h2 className="text-lg font-bold text-white sm:text-xl">
            {metrics.spend > 0 
              ? 'শুভ সকাল, জাহেদ ভাই 👋 সবকিছু দারুণ গতিতে চলছে!' 
              : 'শুভ সকাল, জাহেদ ভাই 👋 কমান্ড সেন্টারে স্বাগতম!'}
          </h2>

          <p className="text-xs text-slate-300 sm:text-sm leading-relaxed">
            {metrics.spend > 0 ? (
              <>
                গত ৭ দিনে <strong className="text-white">${metrics.spend.toLocaleString()}</strong> খরচে মোট{' '}
                <strong className="text-emerald-400 font-bold">${metrics.revenue.toLocaleString()}</strong> রেভিনিউ এসেছে (গড় ROAS{' '}
                <strong className="text-indigo-300 font-bold">{metrics.roas.toFixed(2)}x</strong>)।
              </>
            ) : (
              'এখনও কোনো লাইভ প্ল্যাটফর্ম বা অ্যাড একাউন্ট কানেক্ট করা হয়নি। সাইডবার থেকে "Connect Accounts" বা প্ল্যাটফর্ম ট্যাবে গিয়ে একাউন্ট কানেক্ট করলে স্বয়ংক্রিয় লাইভ গ্রোথ ব্রিফিং প্রদর্শিত হবে।'
            )}
          </p>

          {/* Human Recommendation Pill */}
          {metrics.spend > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-1.5 text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>ক্রিয়েটিভ পারফর্ম্যান্স পর্যবেক্ষণ করা হচ্ছে।</span>
              </div>
              <button
                onClick={onNavigateToActions}
                className="flex items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>অ্যাকশন দেখুন</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Quick Human Shortcuts to AI Copilot */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 lg:w-80 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              AI Copilot কে জিজ্ঞেস করুন:
            </span>
            <span className="text-[10px] text-slate-500">1-Click</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => onAskCopilot('আজকের audit করো')}
              className="w-full text-left rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
            >
              <span>"আজকের সম্পূর্ণ অডিট করো"</span>
              <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>

            <button
              onClick={() => onAskCopilot('কোন creative fatigue হচ্ছে?')}
              className="w-full text-left rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
            >
              <span>"কোন ক্রিয়েটিভ ফ্যাটিগ হচ্ছে?"</span>
              <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>

            <button
              onClick={() => onAskCopilot('TikTok এর best ad এর মতো ৩টা নতুন idea দাও')}
              className="w-full text-left rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
            >
              <span>"৩টি ভাইরাল UGC আইডিয়া দাও"</span>
              <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
