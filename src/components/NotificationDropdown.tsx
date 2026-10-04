'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  CheckCheck, 
  CheckSquare, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ActionQueueItem, TrackingCheckItem } from '@/types';

interface NotificationDropdownProps {
  actions: ActionQueueItem[];
  trackingChecks: TrackingCheckItem[];
  onApprove: (actionId: string) => void;
  onReject: (actionId: string) => void;
  onNavigateToApprovals: () => void;
  onNavigateToTracking: () => void;
  theme?: 'light' | 'dark';
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  actions,
  trackingChecks,
  onApprove,
  onReject,
  onNavigateToApprovals,
  onNavigateToTracking,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPROVALS' | 'ALERTS'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pendingActions = actions.filter((a) => a.status === 'PENDING');
  const trackingAlerts = trackingChecks.filter((t) => t.status !== 'GREEN');
  const totalCount = pendingActions.length + trackingAlerts.length;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleApproveAll = () => {
    pendingActions.forEach((action) => {
      onApprove(action.id);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications and Pending Approvals"
        aria-expanded={isOpen}
        title={`Notifications (${totalCount} pending)`}
        className={`h-7 w-7 rounded-lg border flex items-center justify-center relative transition-all cursor-pointer ${
          isOpen
            ? isLight
              ? 'bg-slate-200 border-slate-300 text-slate-900 shadow-inner'
              : 'bg-slate-800 border-slate-700 text-white shadow-inner'
            : isLight
            ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
        }`}
      >
        <Bell className={`h-3.5 w-3.5 transition-transform ${totalCount > 0 ? 'text-amber-500' : ''}`} />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 text-[9px] font-bold text-black flex items-center justify-center shadow-xs animate-pulse">
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div 
          className={`absolute right-0 top-9 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isLight
              ? 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-900'
              : 'bg-[#0c1017]/95 backdrop-blur-xl border-slate-800 text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
          }`}
        >
          {/* Header */}
          <div className={`p-3.5 border-b flex items-center justify-between ${
            isLight ? 'border-slate-100 bg-slate-50/70' : 'border-slate-800/80 bg-slate-900/50'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center border ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
              }`}>
                <Bell className="h-3 w-3" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">নোটিফিকেশন ও অ্যাকশন</h3>
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {totalCount > 0 ? `${totalCount}টি আইটেমে মনোযোগ প্রয়োজন` : 'কোনো পেন্ডিং নোটিফিকেশন নেই'}
                </p>
              </div>
            </div>

            {pendingActions.length > 1 && (
              <button
                onClick={handleApproveAll}
                className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                title="Approve all pending items"
              >
                <CheckCheck className="h-3 w-3" />
                সব অনুমোদন করুন
              </button>
            )}
          </div>

          {/* Sub-Tabs */}
          <div className={`flex border-b px-2 py-1.5 gap-1 text-[11px] font-semibold ${
            isLight ? 'border-slate-100 bg-white' : 'border-slate-800 bg-[#090d16]'
          }`}>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? isLight
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-slate-800 text-white'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              সব ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('APPROVALS')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'APPROVALS'
                  ? isLight
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              অনুমোদন ({pendingActions.length})
            </button>
            <button
              onClick={() => setActiveTab('ALERTS')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'ALERTS'
                  ? isLight
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ট্র্যাকিং সতর্কবার্তা ({trackingAlerts.length})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {totalCount === 0 ? (
              <div className="p-6 text-center">
                <div className={`mx-auto h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                  isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">সব আপডেট ক্লিয়ার!</h4>
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  বর্তমানে অনুমোদনের অপেক্ষায় কোনো অ্যাকশন নেই এবং ট্র্যাকিং স্বাস্থ্য স্বাভাবিক রয়েছে।
                </p>
              </div>
            ) : (
              <>
                {/* 1. Pending Approvals */}
                {(activeTab === 'ALL' || activeTab === 'APPROVALS') &&
                  pendingActions.map((action) => (
                    <div
                      key={action.id}
                      className={`p-3 transition-colors ${
                        isLight ? 'hover:bg-amber-50/50' : 'hover:bg-amber-950/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            action.platform === 'META'
                              ? isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : action.platform === 'GOOGLE'
                              ? isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}>
                            {action.platform}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {action.actionType}
                          </span>
                          <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                            • {action.createdAt}
                          </span>
                        </div>

                        {/* Quick Approve / Reject Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove(action.id);
                            }}
                            className="h-6 px-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            title="Approve immediately"
                          >
                            <Check className="h-3 w-3" />
                            অনুমোদন
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReject(action.id);
                            }}
                            className={`h-6 w-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                              isLight
                                ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-rose-600'
                                : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-rose-400'
                            }`}
                            title="Reject"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Entity Name & Value Transition */}
                      <div 
                        onClick={() => {
                          onNavigateToApprovals();
                          setIsOpen(false);
                        }}
                        className="cursor-pointer group"
                      >
                        <p className={`text-xs font-semibold leading-tight group-hover:text-blue-500 transition-colors ${
                          isLight ? 'text-slate-800' : 'text-slate-200'
                        }`}>
                          {action.entityName}
                        </p>
                        
                        <div className="flex items-center gap-1.5 text-[11px] mt-1 font-mono">
                          <span className={`line-through ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                            {String(action.previousValue)}
                          </span>
                          <ArrowRight className="h-2.5 w-2.5 text-cyan-500 shrink-0" />
                          <span className={`font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                            {String(action.newValue)}
                          </span>
                        </div>

                        <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {action.reason}
                        </p>
                      </div>
                    </div>
                  ))}

                {/* 2. Tracking Alerts */}
                {(activeTab === 'ALL' || activeTab === 'ALERTS') &&
                  trackingAlerts.map((check) => (
                    <div
                      key={check.id}
                      onClick={() => {
                        onNavigateToTracking();
                        setIsOpen(false);
                      }}
                      className={`p-3 transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-rose-50/50' : 'hover:bg-rose-950/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className={`text-[10px] font-bold ${
                            isLight ? 'text-slate-800' : 'text-slate-200'
                          }`}>
                            {check.name}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          check.status === 'RED'
                            ? isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {check.status === 'RED' ? 'মারাত্মক সমস্যা' : 'সতর্কতা'}
                        </span>
                      </div>

                      <p className={`text-[11px] leading-relaxed ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {check.notes}
                      </p>

                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          EMQ: {check.eventMatchQuality}/10
                        </span>
                        <span className="text-blue-500 font-semibold flex items-center gap-0.5 hover:underline">
                          সমাধান দেখুন <ChevronRight className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className={`p-2.5 border-t flex items-center justify-between text-xs font-semibold ${
            isLight ? 'border-slate-100 bg-slate-50/80' : 'border-slate-800/80 bg-slate-900/60'
          }`}>
            <button
              onClick={() => {
                onNavigateToApprovals();
                setIsOpen(false);
              }}
              className="w-full py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer text-xs"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              সব অ্যাপ্রুভাল ও অডিট লগ দেখুন (Approvals Tab)
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
