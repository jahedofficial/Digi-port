'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  RotateCcw, 
  Check, 
  X, 
  ShieldCheck, 
  Clock, 
  User, 
  Bot, 
  ArrowRight,
  TrendingUp,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ActionQueueItem, ActionType, Platform } from '@/types';

interface ActionsTabProps {
  actions: ActionQueueItem[];
  onApprove: (actionId: string) => void;
  onReject: (actionId: string) => void;
  onUndo: (actionId: string) => void;
  theme?: 'light' | 'dark';
}

export const ActionsTab: React.FC<ActionsTabProps> = ({
  actions,
  onApprove,
  onReject,
  onUndo,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [activeSubTab, setActiveSubTab] = useState<'PENDING' | 'EXECUTED' | 'ALL'>('PENDING');

  const pendingActions = actions.filter((a) => a.status === 'PENDING');
  const executedActions = actions.filter((a) => a.status === 'EXECUTED');

  const displayedActions = 
    activeSubTab === 'PENDING' ? pendingActions :
    activeSubTab === 'EXECUTED' ? executedActions :
    actions;

  const getActionMeta = (type: ActionType) => {
    switch (type) {
      case 'PAUSE_AD':
        return {
          label: 'Pause Ineffective Ad',
          bengaliLabel: 'অপ্রয়োজনীয় অ্যাড পজ',
          icon: PauseCircle,
          color: 'rose',
        };
      case 'CHANGE_BUDGET':
        return {
          label: 'Scale Daily Budget',
          bengaliLabel: 'বাজেট স্কেলিং',
          icon: TrendingUp,
          color: 'emerald',
        };
      case 'ADD_NEGATIVE_KEYWORD':
        return {
          label: 'Block Wasteful Keyword',
          bengaliLabel: 'নেগেটিভ কীওয়ার্ড ফিল্টার',
          icon: ShieldAlert,
          color: 'amber',
        };
      case 'ENABLE_AD':
        return {
          label: 'Resume Winning Ad',
          bengaliLabel: 'উইনার অ্যাড চালু',
          icon: PlayCircle,
          color: 'blue',
        };
      default:
        return {
          label: 'Optimize Settings',
          bengaliLabel: 'সেটিংস অপ্টিমাইজেশন',
          icon: SlidersHorizontal,
          color: 'slate',
        };
    }
  };

  const getPlatformBadge = (platform: Platform) => {
    switch (platform) {
      case 'META':
        return {
          name: 'Meta Ads',
          style: isLight 
            ? 'bg-blue-50 text-blue-700 border-blue-200' 
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          dot: 'bg-blue-500',
        };
      case 'GOOGLE':
        return {
          name: 'Google Ads',
          style: isLight 
            ? 'bg-amber-50 text-amber-700 border-amber-200' 
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
        };
      case 'TIKTOK':
        return {
          name: 'TikTok Ads',
          style: isLight 
            ? 'bg-slate-100 text-slate-800 border-slate-300' 
            : 'bg-slate-800 text-slate-200 border-slate-700',
          dot: 'bg-pink-500',
        };
      default:
        return {
          name: 'All Platforms',
          style: isLight 
            ? 'bg-slate-100 text-slate-700 border-slate-200' 
            : 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Filter Controls */}
      <div className={`rounded-2xl border p-5 transition-all ${
        isLight 
          ? 'border-slate-200/90 bg-white shadow-xs' 
          : 'border-slate-800 bg-[#0f141f] shadow-sm'
      }`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shadow-xs ${
                isLight 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}>
                <CheckSquare className="h-4 w-4" />
              </div>
              <h2 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Action Center
              </h2>
              {pendingActions.length > 0 && (
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  isLight 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {pendingActions.length} Pending
                </span>
              )}
            </div>
            <p className={`mt-1 text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              আপনার ক্যাম্পেইনের অপচয় কমাতে ও পারফর্ম্যান্স বাড়াতে AI-এর সুপারিশসমূহ। আপনি অনুমোদন করলেই পরিবর্তন কার্যকর হবে।
            </p>
          </div>

          {/* Segmented Filter Control */}
          <div className={`flex items-center gap-1 rounded-xl border p-1 text-xs shrink-0 self-start md:self-center ${
            isLight ? 'border-slate-200 bg-slate-100/70' : 'border-slate-800 bg-slate-900/80'
          }`}>
            <button
              onClick={() => setActiveSubTab('PENDING')}
              className={`rounded-lg px-3.5 py-1.5 font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'PENDING'
                  ? isLight 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' 
                    : 'bg-[#182030] text-white shadow-xs border border-slate-700/80'
                  : isLight 
                    ? 'text-slate-600 hover:text-slate-900' 
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Pending Review</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'PENDING'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {pendingActions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('EXECUTED')}
              className={`rounded-lg px-3.5 py-1.5 font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'EXECUTED'
                  ? isLight 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' 
                    : 'bg-[#182030] text-white shadow-xs border border-slate-700/80'
                  : isLight 
                    ? 'text-slate-600 hover:text-slate-900' 
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Applied History</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'EXECUTED'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {executedActions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('ALL')}
              className={`rounded-lg px-3.5 py-1.5 font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'ALL'
                  ? isLight 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' 
                    : 'bg-[#182030] text-white shadow-xs border border-slate-700/80'
                  : isLight 
                    ? 'text-slate-600 hover:text-slate-900' 
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>All</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'ALL'
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {actions.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {displayedActions.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center transition-all ${
            isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-[#0f141f]'
          }`}>
            <div className={`mx-auto h-12 w-12 rounded-2xl flex items-center justify-center border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className={`mt-4 text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              কোনো অ্যাকশন বাকি নেই
            </h3>
            <p className={`mt-1 text-xs max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              {activeSubTab === 'PENDING'
                ? 'বর্তমানে অনুমোদনের অপেক্ষায় কোনো অ্যাকশন নেই। আপনার ক্যাম্পেইনগুলো মসৃণভাবে চলছে।'
                : 'এই ফিল্টারে কোনো হিস্টোরি পাওয়া যায়নি।'}
            </p>
          </div>
        ) : (
          displayedActions.map((action) => {
            const isPending = action.status === 'PENDING';
            const isExecuted = action.status === 'EXECUTED';
            const isUndone = action.status === 'UNDONE';
            const meta = getActionMeta(action.actionType);
            const platformBadge = getPlatformBadge(action.platform);
            const ActionIcon = meta.icon;

            return (
              <div
                key={action.id}
                className={`rounded-2xl border p-5 transition-all duration-200 ${
                  isPending
                    ? isLight
                      ? 'border-slate-200/90 bg-white shadow-xs hover:shadow-md hover:border-slate-300'
                      : 'border-slate-800 bg-[#101625] shadow-sm hover:shadow-md hover:border-slate-700'
                    : isExecuted
                    ? isLight
                      ? 'border-slate-200/80 bg-slate-50/60'
                      : 'border-slate-800/80 bg-[#0c1017]'
                    : isLight
                      ? 'border-slate-200/60 bg-slate-50/40 opacity-70'
                      : 'border-slate-800/50 bg-slate-950/40 opacity-70'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3 flex-1">
                    {/* Top Row: Platform & Action Meta */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Platform */}
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${platformBadge.style}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${platformBadge.dot}`} />
                        {platformBadge.name}
                      </span>

                      {/* Action Type */}
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        meta.color === 'rose'
                          ? isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : meta.color === 'emerald'
                          ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : meta.color === 'amber'
                          ? isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        <ActionIcon className="h-3.5 w-3.5" />
                        <span>{meta.label}</span>
                      </span>

                      {/* Proposer Info */}
                      <div className={`flex items-center gap-1.5 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {action.proposedBy === 'AGENT' ? (
                          <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                            <Sparkles className="h-3 w-3" /> AI প্রস্তাবিত
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium">
                            <User className="h-3 w-3" /> অ্যাডমিন
                          </span>
                        )}
                        <span className="opacity-50">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 opacity-70" /> {action.createdAt}
                        </span>
                      </div>
                    </div>

                    {/* Target Entity Title */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-base font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {action.entityName}
                      </h3>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                        isLight 
                          ? 'bg-slate-100 text-slate-600 border-slate-200' 
                          : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}>
                        {action.entityType === 'AD' ? 'Ad Creative' :
                         action.entityType === 'CAMPAIGN' ? 'Campaign (CBO)' :
                         action.entityType === 'KEYWORD' ? 'Search Keyword' : action.entityType}
                      </span>
                    </div>

                    {/* Transition Before / After Display */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium">পরিবর্তন:</span>
                      <span className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border ${
                        isLight ? 'bg-slate-100/80 border-slate-200 text-slate-500 line-through' : 'bg-slate-900 border-slate-800 text-slate-400 line-through'
                      }`}>
                        {String(action.previousValue)}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border ${
                        meta.color === 'rose'
                          ? isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                          : isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      }`}>
                        {String(action.newValue)}
                      </span>
                    </div>

                    {/* Reason in Simple, Friendly Bengali */}
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      isLight ? 'bg-slate-50/80 border-slate-200/80 text-slate-700' : 'bg-slate-900/50 border-slate-800 text-slate-300'
                    }`}>
                      <p className="font-normal">
                        {action.reason}
                      </p>
                    </div>

                    {/* Safety Reassurance Note */}
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>{action.safetyCheck.rule}</span>
                    </div>
                  </div>

                  {/* Actions / Buttons */}
                  <div className="flex items-center gap-2.5 lg:self-center shrink-0 pt-2 lg:pt-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => onApprove(action.id)}
                          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Check className="h-4 w-4 stroke-[2.5]" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onReject(action.id)}
                          className={`h-10 px-3.5 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                            isLight 
                              ? 'border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-700' 
                              : 'border-slate-800 bg-slate-900 hover:bg-rose-950/20 hover:border-rose-800 hover:text-rose-400 text-slate-300'
                          }`}
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : isExecuted ? (
                      <div className="flex items-center gap-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                          isLight 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          কার্যকর হয়েছে
                        </span>
                        <button
                          onClick={() => onUndo(action.id)}
                          className={`h-8 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                            isLight 
                              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100' 
                              : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          title="Undo this change"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Undo
                        </button>
                      </div>
                    ) : isUndone ? (
                      <span className={`rounded-xl px-3 py-1.5 text-xs font-semibold border ${
                        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        বাতিল (Undone)
                      </span>
                    ) : (
                      <span className={`rounded-xl px-3 py-1.5 text-xs font-semibold border ${
                        isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        বাতিল করা হয়েছে
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
