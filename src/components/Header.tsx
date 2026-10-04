'use client';

import React from 'react';
import { 
  Sparkles, 
  RotateCw, 
  ShieldCheck, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { PlatformConnectionInfo } from '@/types';

interface HeaderProps {
  connections: PlatformConnectionInfo[];
  dateRange: string;
  setDateRange: (range: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  connections,
  dateRange,
  setDateRange,
  onRefresh,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Workspace */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Ads Command Center
                </h1>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cyan-400 border border-cyan-500/30">
                  PRD v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Google + Meta + TikTok Unified Growth Engine
              </p>
            </div>
          </div>

          <div className="hidden h-6 w-px bg-slate-800 md:block" />

          {/* Active Business Account */}
          <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 md:flex">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-medium text-white">Sapphire BD & Fashion</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Owner Mode</span>
          </div>
        </div>

        {/* Center / Right status & controls */}
        <div className="flex items-center gap-3">
          {/* Platform Status Indicators */}
          <div className="hidden items-center gap-2 sm:flex">
            {connections.map((conn) => (
              <div
                key={conn.platform}
                className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/50 px-2.5 py-1 text-[11px]"
                title={`Last synced: ${conn.lastSynced}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    conn.status === 'CONNECTED'
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="font-medium text-slate-300">
                  {conn.platform === 'META' ? 'Meta' : conn.platform === 'GOOGLE' ? 'Google' : 'TikTok'}
                </span>
              </div>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Select date range"
              className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer"
            >
              <option value="last7d" className="bg-slate-900 text-white">গত ৭ দিন (Last 7 Days)</option>
              <option value="today" className="bg-slate-900 text-white">আজকে (Today)</option>
              <option value="yesterday" className="bg-slate-900 text-white">গতকাল (Yesterday)</option>
              <option value="last30d" className="bg-slate-900 text-white">গত ৩০ দিন (Last 30 Days)</option>
              <option value="thisMonth" className="bg-slate-900 text-white">চলতি মাস (This Month)</option>
            </select>
          </div>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-slate-700 hover:text-white disabled:opacity-50"
            title="Sync latest ad metrics from platforms"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'Sync'}</span>
          </button>

          {/* Safety Guardrail Pill */}
          <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Safety Guardrail:</span> Active
          </div>
        </div>
      </div>
    </header>
  );
};
