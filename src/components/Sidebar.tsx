'use client';

import React, { useState } from 'react';
import { 
  Megaphone, 
  TrendingUp, 
  BarChart2, 
  Sparkles, 
  Bot, 
  CheckSquare, 
  Activity, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  ChevronUp, 
  ChevronDown,
  Search,
  Video,
  Shield,
  LogOut,
  User,
  Key,
  X
} from 'lucide-react';
import { UserProfile } from '@/types';

export type MainNavId = 
  | 'ANALYTICS' 
  | 'META_ADS'
  | 'GOOGLE_ADS'
  | 'TIKTOK_ADS'
  | 'CONTENT_ANALYTICS' 
  | 'AI_COPILOT' 
  | 'APPROVALS' 
  | 'TRACKING' 
  | 'RULES' 
  | 'REPORTS';

interface SidebarProps {
  activeNav: MainNavId;
  onSelectNav: (id: MainNavId) => void;
  pendingActionsCount: number;
  trackingAlertsCount: number;
  onOpenHub?: () => void;
  theme?: 'light' | 'dark';
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  pendingActionsCount,
  trackingAlertsCount,
  onOpenHub,
  theme = 'light',
  currentUser,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const isLight = theme === 'light';
  const [isMarketingOpen, setIsMarketingOpen] = useState(true);
  const [isControlOpen, setIsControlOpen] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleNavClick = (id: MainNavId) => {
    onSelectNav(id);
    if (onCloseMobile) onCloseMobile();
  };

  const getNavClass = (id: MainNavId) => {
    const isActive = activeNav === id;
    if (isActive) {
      return isLight 
        ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200/90 shadow-xs' 
        : 'bg-slate-800 text-white font-semibold shadow-sm';
    }
    return isLight 
      ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' 
      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200';
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-30
        w-72 sm:w-64 shrink-0 border-r flex flex-col justify-between select-none h-screen overflow-hidden transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        ${isLight ? 'border-slate-200/90 bg-white text-slate-800' : 'border-[#1a1f2c] bg-[#0c1017] text-white'}
      `}>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand Header with Mobile Close Button */}
          <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-slate-100' : 'border-[#1a1f2c]'}`}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-black tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Digi Port
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    isLight 
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-200' 
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}>
                    ADMIN
                  </span>
                </div>
                <p className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  ADMIN PORTAL
                </p>
              </div>
            </div>

            {/* Mobile Drawer Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className={`p-1.5 rounded-lg border lg:hidden transition-colors ${
                isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-100' : 'border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
              title="Close Menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* MARKETING SECTION */}
          <div>
            <button
              onClick={() => setIsMarketingOpen(!isMarketingOpen)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold transition-colors ${
                isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Megaphone className={`h-4 w-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                <span>Marketing</span>
              </div>
              {isMarketingOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            {isMarketingOpen && (
              <div className="mt-1 space-y-1 pl-2">
                {/* 1. Analytics */}
                <button
                  onClick={() => onSelectNav('ANALYTICS')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('ANALYTICS')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="h-4 w-4 text-cyan-500" />
                    <span>Analytics</span>
                  </div>
                </button>

                {/* 2. Meta Ads */}
                <button
                  onClick={() => onSelectNav('META_ADS')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('META_ADS')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart2 className="h-4 w-4 text-blue-500" />
                    <span>Meta Ads</span>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                    isLight 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-[#252542] text-[#8e8ee8] border-[#3f3f72]'
                  }`}>
                    Ads
                  </span>
                </button>

                {/* 3. Google Ads */}
                <button
                  onClick={() => onSelectNav('GOOGLE_ADS')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('GOOGLE_ADS')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="h-4 w-4 text-amber-500" />
                    <span>Google Ads</span>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                    isLight 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-[#3b2a1a] text-[#f59e0b] border-[#6d461b]'
                  }`}>
                    Ads
                  </span>
                </button>

                {/* 4. TikTok Ads */}
                <button
                  onClick={() => onSelectNav('TIKTOK_ADS')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('TIKTOK_ADS')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Video className="h-4 w-4 text-rose-500" />
                    <span>TikTok Ads</span>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                    isLight 
                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                      : 'bg-[#3c1e2f] text-[#f472b6] border-[#6b254d]'
                  }`}>
                    Ads
                  </span>
                </button>

                {/* 5. Content Analytics */}
                <button
                  onClick={() => onSelectNav('CONTENT_ANALYTICS')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('CONTENT_ANALYTICS')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    <span>Content Analytics</span>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                    isLight 
                      ? 'bg-pink-50 text-pink-700 border-pink-200' 
                      : 'bg-[#3c1e2f] text-[#f472b6] border-[#6b254d]'
                  }`}>
                    Social
                  </span>
                </button>

                {/* 6. AI Growth Copilot */}
                <button
                  onClick={() => onSelectNav('AI_COPILOT')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('AI_COPILOT')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bot className="h-4 w-4 text-amber-500" />
                    <span>AI Growth Copilot</span>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                    isLight 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-[#3b2a1a] text-[#f59e0b] border-[#6d461b]'
                  }`}>
                    AI
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* CONTROL, APPROVALS & TRACKING HEALTH */}
          <div>
            <button
              onClick={() => setIsControlOpen(!isControlOpen)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold transition-colors ${
                isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Control & Health</span>
              </div>
              {isControlOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            {isControlOpen && (
              <div className="mt-1 space-y-1 pl-2">
                {/* Approvals */}
                <button
                  onClick={() => onSelectNav('APPROVALS')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('APPROVALS')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    <span>Approvals & Actions</span>
                  </div>
                  {pendingActionsCount > 0 && (
                    <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${
                      isLight 
                        ? 'bg-amber-100 text-amber-800 border-amber-300' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {pendingActionsCount}
                    </span>
                  )}
                </button>

                {/* Tracking Health */}
                <button
                  onClick={() => onSelectNav('TRACKING')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('TRACKING')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-4 w-4 text-cyan-500" />
                    <span>Pixel & sGTM Health</span>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${trackingAlertsCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                </button>

                {/* Rules */}
                <button
                  onClick={() => onSelectNav('RULES')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('RULES')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className={`h-4 w-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span>Optimization Rules</span>
                  </div>
                </button>

                {/* Reports */}
                <button
                  onClick={() => onSelectNav('REPORTS')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${getNavClass('REPORTS')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-sky-500" />
                    <span>Executive Reports</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: API & Account Settings + Profile Info */}
      <div className={`p-3 border-t space-y-2 transition-colors ${
        isLight ? 'border-slate-200 bg-slate-50/70' : 'border-[#1a1f2c] bg-[#0c1017]'
      }`}>
        {/* API & Account Settings Button */}
        <button
          onClick={onOpenHub}
          className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-all shadow-xs group ${
            isLight 
              ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700' 
              : 'border-slate-800 bg-[#121826] hover:bg-slate-800/90 hover:border-slate-700 text-slate-200'
          }`}
          title="OAuth 2.0 Platform Connections & Multi-Account Selection"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
            <span className="tracking-wide">API & Account Settings</span>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
        </button>

        {/* Bottom Profile Info with Direct Logout Button */}
        <div className="relative">
          <div
            className={`w-full flex items-center justify-between p-2 rounded-xl border transition-colors ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#10141e] border-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
              title="View Profile & Settings"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                {currentUser?.initials || 'JS'}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currentUser?.name || 'Jahed Shomaddar'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || 'jahedshomadan@gmail.com'}
                </div>
              </div>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className={`p-1.5 rounded-lg border transition-colors shrink-0 ml-1.5 ${
                  isLight 
                    ? 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50' 
                    : 'border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
                }`}
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* User Popover Menu */}
          {isProfileMenuOpen && (
            <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl border p-3 shadow-2xl backdrop-blur-md z-50 text-xs ${
              isLight 
                ? 'bg-white border-slate-200 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)]' 
                : 'bg-[#10141e] border-slate-700 text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            }`}>
              <div className="border-b pb-2.5 mb-2 border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs">{currentUser?.name || 'Jahed Shomaddar'}</div>
                <div className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'jahedshomadan@gmail.com'}</div>
                <div className="mt-1 inline-block rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 border border-indigo-500/30">
                  {currentUser?.role || 'SUPER_ADMIN'}
                </div>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onOpenHub) onOpenHub();
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-xs ${
                    isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 text-blue-500" />
                  <span>Platform Connections</span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Developed by Neexion Attribution */}
        <div className="pt-2 text-center border-t border-slate-200/50 dark:border-slate-800/50 mt-1">
          <a
            href="https://neexion.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-400 hover:text-indigo-500 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1 font-medium"
          >
            <span>Developed by</span>
            <span className="font-semibold underline">Neexion</span>
          </a>
        </div>
      </div>
    </aside>
  </>
  );
};
