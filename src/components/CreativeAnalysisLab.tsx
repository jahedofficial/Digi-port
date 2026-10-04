'use client';

import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  PlayCircle, 
  TrendingDown, 
  TrendingUp, 
  Layers, 
  Lightbulb, 
  FileText,
  BadgeAlert
} from 'lucide-react';
import { CreativeData } from '@/types';

interface CreativeAnalysisLabProps {
  creatives: CreativeData[];
  onPauseCreative: (adId: string) => void;
  theme?: 'light' | 'dark';
}

export const CreativeAnalysisLab: React.FC<CreativeAnalysisLabProps> = ({
  creatives,
  onPauseCreative,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [selectedCreative, setSelectedCreative] = useState<CreativeData | null>(creatives[0] || null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'WINNERS' | 'FATIGUED' | 'LOW_DATA'>('ALL');

  const filteredCreatives = creatives.filter((cr) => {
    if (activeFilter === 'WINNERS') return cr.isMvpWinner;
    if (activeFilter === 'FATIGUED') return cr.fatigueScore === 'HIGH_FATIGUE';
    if (activeFilter === 'LOW_DATA') return cr.lowDataWarning;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
        isLight 
          ? 'border-purple-200/90 bg-gradient-to-r from-purple-50 via-white to-indigo-50/70 shadow-sm' 
          : 'border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900/70 to-indigo-950/30 shadow-md'
      }`}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                isLight ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}>
                <Video className="h-4 w-4" />
              </div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Creative & Content Analysis Lab (F3)
              </h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                isLight 
                  ? 'bg-purple-100 text-purple-700 border-purple-200' 
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}>
                Claude Vision Tagged
              </span>
            </div>
            <p className={`mt-1 text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Hook Rate (3s/Imp), Hold Rate (15s/3s), Creative Fatigue Score, এবং AI ট্যাগিং ইঞ্জিন
            </p>
          </div>

          {/* Quick Filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                activeFilter === 'ALL' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : isLight ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              সব ক্রিয়েটিভ ({creatives.length})
            </button>
            <button
              onClick={() => setActiveFilter('WINNERS')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                activeFilter === 'WINNERS' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : isLight ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              MVP Winners
            </button>
            <button
              onClick={() => setActiveFilter('FATIGUED')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                activeFilter === 'FATIGUED' 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : isLight ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              High Fatigue
            </button>
            <button
              onClick={() => setActiveFilter('LOW_DATA')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                activeFilter === 'LOW_DATA' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : isLight ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              কম Data লেবেল
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Creative List + Selected Deep Dive Inspector */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column: Cards list */}
        <div className="space-y-3 lg:col-span-7">
          {filteredCreatives.length === 0 ? (
            <div className={`rounded-xl border p-12 text-center text-xs ${
              isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-800 bg-slate-900/50 text-slate-500'
            }`}>
              <Video className="mx-auto h-8 w-8 text-slate-400 mb-2 opacity-40" />
              <p className="font-semibold text-slate-300">কোনো ক্রিয়েটিভ পাওয়া যায়নি</p>
              <p className="mt-1 text-[11px] text-slate-500">আপনার মেটা বা টিকটক অ্যাড অ্যাকাউন্ট কানেক্ট করলে ভিডিও ও ইমেজ ক্রিয়েটিভ সিঙ্ক হবে।</p>
            </div>
          ) : (
            filteredCreatives.map((cr) => {
              const isSelected = selectedCreative?.id === cr.id;
            return (
              <div
                key={cr.id}
                onClick={() => setSelectedCreative(cr)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? isLight
                      ? 'border-purple-500 bg-purple-50/30 shadow-md shadow-purple-500/10'
                      : 'border-purple-500 bg-slate-900/90 shadow-lg shadow-purple-500/10'
                    : isLight
                      ? 'border-slate-200/90 bg-white hover:border-slate-300 shadow-sm'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className={`relative h-28 w-24 shrink-0 overflow-hidden rounded-lg ${
                    isLight ? 'bg-slate-100' : 'bg-slate-800'
                  }`}>
                    <img
                      src={cr.thumbnailUrl}
                      alt={cr.adName}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">
                      {cr.mediaType}
                    </div>
                  </div>

                  {/* Creative Core Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          cr.platform === 'META' 
                            ? isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          {cr.platform}
                        </span>
                        <h3 className={`truncate text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {cr.adName}
                        </h3>
                      </div>

                      {/* Status Badges */}
                      {cr.isMvpWinner && (
                        <span className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold border ${
                          isLight 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          <Flame className="h-3 w-3 text-amber-500" /> MVP Winner
                        </span>
                      )}
                      {cr.fatigueScore === 'HIGH_FATIGUE' && (
                        <span className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold border ${
                          isLight 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          <AlertTriangle className="h-3 w-3" /> HIGH FATIGUE
                        </span>
                      )}
                      {cr.lowDataWarning && (
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                          isLight 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          Data কম (Winner ঘোষণা নেই)
                        </span>
                      )}
                    </div>

                    <p className={`mt-1 line-clamp-1 text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      "{cr.headline}"
                    </p>

                    {/* Hook & Hold rate metrics row */}
                    <div className={`mt-2.5 grid grid-cols-4 gap-2 rounded-lg p-2 text-center text-xs ${
                      isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-slate-950/60'
                    }`}>
                      <div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Hook Rate (3s)</div>
                        <div className={`font-bold ${cr.hookRate >= 30 ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : cr.hookRate > 0 ? (isLight ? 'text-amber-600' : 'text-amber-400') : 'text-slate-400'}`}>
                          {cr.hookRate > 0 ? `${cr.hookRate}%` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Hold Rate (15s)</div>
                        <div className={`font-bold ${cr.holdRate >= 35 ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : cr.holdRate > 0 ? (isLight ? 'text-amber-600' : 'text-amber-400') : 'text-slate-400'}`}>
                          {cr.holdRate > 0 ? `${cr.holdRate}%` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Frequency</div>
                        <div className={`font-bold ${cr.frequency > 3.0 ? (isLight ? 'text-rose-600' : 'text-rose-400') : (isLight ? 'text-slate-800' : 'text-slate-200')}`}>
                          {cr.frequency.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ROAS</div>
                        <div className={`font-black ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                          {cr.roas.toFixed(2)}x
                        </div>
                      </div>
                    </div>

                    {/* Spend & CPA */}
                    <div className={`mt-2 flex items-center justify-between text-[11px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <span>খরচ: ${cr.spend.toFixed(2)} • CPA: ${cr.cpa.toFixed(2)}</span>
                      <span className="font-semibold">{cr.conversions} Orders</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Right column: Claude Vision AI Inspector */}
        <div className="lg:col-span-5">
          {selectedCreative ? (
            <div className={`sticky top-20 rounded-xl border p-5 backdrop-blur-md shadow-xl transition-all ${
              isLight ? 'bg-white border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-slate-800' : 'bg-slate-900/80 border-slate-800 text-white'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                isLight ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-purple-700' : 'text-purple-300'
                  }`}>
                    Claude Vision AI Deep Inspector
                  </h3>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {selectedCreative.adName}
                </span>
              </div>

              {/* Media Preview */}
              <div className={`mt-4 overflow-hidden rounded-lg border ${
                isLight ? 'border-slate-200 bg-slate-100' : 'border-slate-800 bg-slate-950'
              }`}>
                <img
                  src={selectedCreative.thumbnailUrl}
                  alt={selectedCreative.headline}
                  className="h-48 w-full object-cover"
                />
              </div>

              {/* Fatigue Breakdown / Guardrail Analysis */}
              <div className={`mt-4 space-y-2 rounded-lg p-3.5 border ${
                isLight ? 'bg-slate-50 border-slate-200/90' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Creative Fatigue Index
                  </span>
                  <span className={`text-xs font-bold ${
                    selectedCreative.fatigueScore === 'HIGH_FATIGUE' ? 'text-rose-500' : 'text-emerald-500'
                  }`}>
                    {selectedCreative.fatigueScore}
                  </span>
                </div>
                <div className={`text-[11px] space-y-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <div>• ফ্রিকোয়েন্সি: <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedCreative.frequency}</span> (টার্গেট: &lt;২.৫)</div>
                  <div>• CTR পারফর্ম্যান্স: <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedCreative.ctr}%</span></div>
                  <div>• ৩-সেকেন্ড হুক রেট: <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedCreative.hookRate}%</span> (টার্গেট: &gt;২৫%)</div>
                </div>

                {selectedCreative.fatigueScore === 'HIGH_FATIGUE' && (
                  <button
                    onClick={() => onPauseCreative(selectedCreative.adId)}
                    className="mt-2 w-full rounded-lg bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all"
                  >
                    Pause This Fatigued Ad
                  </button>
                )}
              </div>

              {/* AI Tagging Details */}
              <div className="mt-4 space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  AI Tagging Attributes
                </h4>

                <div className="space-y-2 text-xs">
                  <div className={`rounded p-2.5 ${isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-slate-950/50'}`}>
                    <span className={`font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Format Tag:</span>
                    <p className={`font-semibold mt-0.5 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                      {selectedCreative.aiTags.format}
                    </p>
                  </div>

                  <div className={`rounded p-2.5 ${isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-slate-950/50'}`}>
                    <span className={`font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Hook Type (প্রথম ৩ সেকেন্ড):</span>
                    <p className={`font-semibold mt-0.5 ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                      {selectedCreative.aiTags.hookType}
                    </p>
                  </div>

                  <div className={`rounded p-2.5 ${isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-slate-950/50'}`}>
                    <span className={`font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>প্রথম ৩ সেকেন্ডে কী আছে:</span>
                    <p className={`mt-0.5 leading-relaxed text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {selectedCreative.aiTags.first3SecondsDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={`rounded p-2.5 ${isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-slate-950/50'}`}>
                      <span className={`font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Offer Tag:</span>
                      <p className={`font-semibold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {selectedCreative.aiTags.offer}
                      </p>
                    </div>
                    <div className={`rounded p-2.5 ${isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-slate-950/50'}`}>
                      <span className={`font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>CTA Button:</span>
                      <p className={`font-semibold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {selectedCreative.callToAction}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ad Copy Analysis */}
              <div className={`mt-4 rounded-lg p-3 text-xs ${isLight ? 'bg-slate-50 border border-slate-200/80' : 'bg-slate-950/50'}`}>
                <span className={`font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Primary Text / Copy:</span>
                <p className={`mt-1 leading-relaxed text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {selectedCreative.bodyCopy}
                </p>
              </div>
            </div>
          ) : (
            <div className={`rounded-xl border p-8 text-center text-xs ${
              isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-800 bg-slate-900/50 text-slate-500'
            }`}>
              বাম পাশ থেকে যেকোনো ক্রিয়েটিভ নির্বাচন করুন বিস্তারিত দেখার জন্য
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
