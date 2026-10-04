'use client';

import React from 'react';
import { 
  BarChart3, 
  Layers, 
  Video, 
  CheckSquare, 
  Activity, 
  Sliders, 
  FileText,
  Search,
  Flame
} from 'lucide-react';

export type TabKey = 
  | 'UNIFIED' 
  | 'META' 
  | 'GOOGLE' 
  | 'TIKTOK' 
  | 'CREATIVES' 
  | 'ACTIONS' 
  | 'TRACKING' 
  | 'RULES' 
  | 'REPORTS';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  pendingActionsCount: number;
  trackingAlertsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingActionsCount,
  trackingAlertsCount,
}) => {
  const tabs = [
    {
      id: 'UNIFIED' as TabKey,
      label: 'Unified Overview',
      bnLabel: 'সার্বিক সারসংক্ষেপ',
      icon: BarChart3,
      badge: null,
      color: 'text-indigo-400',
    },
    {
      id: 'META' as TabKey,
      label: 'Meta Ads',
      bnLabel: 'মেটা অ্যাডস',
      icon: Layers,
      badge: null,
      color: 'text-blue-400',
    },
    {
      id: 'GOOGLE' as TabKey,
      label: 'Google Ads',
      bnLabel: 'গুগল অ্যাডস',
      icon: Search,
      badge: null,
      color: 'text-amber-400',
    },
    {
      id: 'TIKTOK' as TabKey,
      label: 'TikTok Ads',
      bnLabel: 'টিকটক অ্যাডস',
      icon: Flame,
      badge: null,
      color: 'text-rose-400',
    },
    {
      id: 'CREATIVES' as TabKey,
      label: 'Creative Lab',
      bnLabel: 'ক্রিয়েটিভ ল্যাব',
      icon: Video,
      badge: 'Hook & Fatigue',
      color: 'text-purple-400',
    },
    {
      id: 'ACTIONS' as TabKey,
      label: 'Actions & Approvals',
      bnLabel: 'অ্যাকশন ও অনুমোদন',
      icon: CheckSquare,
      badge: pendingActionsCount > 0 ? `${pendingActionsCount} Pending` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      color: 'text-emerald-400',
    },
    {
      id: 'TRACKING' as TabKey,
      label: 'Tracking Health',
      bnLabel: 'ট্র্যাকিং অডিট',
      icon: Activity,
      badge: trackingAlertsCount > 0 ? '1 Alert' : 'Healthy',
      badgeColor: trackingAlertsCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      color: 'text-cyan-400',
    },
    {
      id: 'RULES' as TabKey,
      label: 'Optimization Rules',
      bnLabel: 'অটো রুলস',
      icon: Sliders,
      badge: null,
      color: 'text-slate-400',
    },
    {
      id: 'REPORTS' as TabKey,
      label: 'Reports & Exports',
      bnLabel: 'রিপোর্ট ও এক্সপোর্ট',
      icon: FileText,
      badge: null,
      color: 'text-sky-400',
    },
  ];

  return (
    <div className="w-full border-b border-slate-800 bg-slate-950/40">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700/60'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? tab.color : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    tab.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
