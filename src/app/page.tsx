'use client';

import React, { useState } from 'react';
import { Sidebar, MainNavId } from '@/components/Sidebar';
import { GtmGa4AnalyticsDashboard } from '@/components/GtmGa4AnalyticsDashboard';
import { MetaAdsPerformanceDashboard } from '@/components/MetaAdsPerformanceDashboard';
import { GoogleAdsIntelligenceDashboard } from '@/components/GoogleAdsIntelligenceDashboard';
import { TikTokAdsIntelligenceDashboard } from '@/components/TikTokAdsIntelligenceDashboard';
import { CreativeAnalysisLab } from '@/components/CreativeAnalysisLab';
import { ActionsTab } from '@/components/ActionsTab';
import { TrackingHealthView } from '@/components/TrackingHealthView';
import { OptimizationEngineView } from '@/components/OptimizationEngineView';
import { ReportsView } from '@/components/ReportsView';
import { AiGrowthCopilotView } from '@/components/AiGrowthCopilotView';
import { PlatformConnectionHubModal } from '@/components/PlatformConnectionHubModal';
import { BusinessWorkspaceDropdown } from '@/components/BusinessWorkspaceDropdown';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { INITIAL_CLIENT_WORKSPACES } from '@/lib/workspace-presets';
import { ClientWorkspace } from '@/types';

import { 
  Sun, 
  Moon,
  Sparkles,
  LogOut,
  Menu
} from 'lucide-react';

import { 
  INITIAL_CONNECTIONS, 
  INITIAL_METRICS_OVERVIEW, 
  INITIAL_CAMPAIGNS, 
  INITIAL_CREATIVES, 
  INITIAL_ACTION_QUEUE, 
  INITIAL_TRACKING_CHECKS, 
  INITIAL_OPTIMIZATION_RULES 
} from '@/lib/mock-data';
import { CampaignData, ActionQueueItem, UserProfile } from '@/types';
import { AuthLoginView } from '@/components/AuthLoginView';
import { getStoredAuthUser, setStoredAuthUser } from '@/lib/auth-users';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeNav, setActiveNav] = useState<MainNavId>('ANALYTICS');
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Black and white mood toggle
  const [isConnectionHubOpen, setIsConnectionHubOpen] = useState(false);
  const [connectionHubPlatform, setConnectionHubPlatform] = useState<'META' | 'GOOGLE' | 'TIKTOK'>('META');

  // Multi-Client / Multi-Business Workspace Tabs State
  const [workspaces, setWorkspaces] = useState<ClientWorkspace[]>(INITIAL_CLIENT_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(INITIAL_CLIENT_WORKSPACES[0].id);

  // Load persisted authentication state from localStorage
  React.useEffect(() => {
    const savedUser = getStoredAuthUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setIsAuthLoaded(true);
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setStoredAuthUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStoredAuthUser(null);
  };


  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
  };

  const handleAddWorkspace = (newWs: ClientWorkspace) => {
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceId(newWs.id);
  };

  const handleCloseWorkspace = (id: string) => {
    if (workspaces.length <= 1) return;
    const remaining = workspaces.filter((w) => w.id !== id);
    setWorkspaces(remaining);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(remaining[0].id);
    }
  };

  // Check URL parameters for OAuth callbacks
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('open_hub') === 'true') {
        const plat = url.searchParams.get('connected_platform')?.toUpperCase() as 'META' | 'GOOGLE' | 'TIKTOK';
        if (plat) setConnectionHubPlatform(plat);
        setIsConnectionHubOpen(true);
      }
    }
  }, []);

  // Sync theme with document element for CSS dark mode support
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    }
  }, [theme]);

  // Application core data states
  const [metrics, setMetrics] = useState(INITIAL_METRICS_OVERVIEW);
  const [campaigns, setCampaigns] = useState<CampaignData[]>(INITIAL_CAMPAIGNS);
  const [creatives, setCreatives] = useState(INITIAL_CREATIVES);
  const [actions, setActions] = useState<ActionQueueItem[]>(INITIAL_ACTION_QUEUE);
  const [trackingChecks, setTrackingChecks] = useState(INITIAL_TRACKING_CHECKS);
  const [rules, setRules] = useState(INITIAL_OPTIMIZATION_RULES);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  const isLight = theme === 'light';

  // Action management
  const handleActionCreated = (newAction: ActionQueueItem) => {
    setActions((prev) => [newAction, ...prev]);
  };

  const handleApproveAction = (actionId: string) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id === actionId) {
          if (a.actionType === 'PAUSE_AD') {
            setCreatives((cr) =>
              cr.map((item) =>
                item.adId === a.entityId || item.id === a.entityId
                  ? { ...item, fatigueScore: 'HEALTHY' }
                  : item
              )
            );
          }
          if (a.actionType === 'CHANGE_BUDGET') {
            setCampaigns((camps) =>
              camps.map((camp) =>
                camp.id === a.entityId
                  ? { ...camp, dailyBudget: camp.dailyBudget * 1.2 }
                  : camp
              )
            );
          }
          return {
            ...a,
            status: 'EXECUTED',
            executedAt: 'এইমাত্র',
          };
        }
        return a;
      })
    );
  };

  const handleRejectAction = (actionId: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: 'REJECTED' } : a))
    );
  };

  const handleUndoAction = (actionId: string) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id === actionId) {
          if (a.actionType === 'CHANGE_BUDGET') {
            setCampaigns((camps) =>
              camps.map((camp) =>
                camp.id === a.entityId
                  ? { ...camp, dailyBudget: camp.dailyBudget / 1.2 }
                  : camp
              )
            );
          }
          return { ...a, status: 'UNDONE' };
        }
        return a;
      })
    );
  };

  const handleToggleCampaignStatus = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? { ...c, status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
          : c
      )
    );
  };

  const handleScaleBudget = (campaignId: string) => {
    const targetCamp = campaigns.find((c) => c.id === campaignId);
    if (!targetCamp) return;

    const newAction: ActionQueueItem = {
      id: `act-${Date.now()}`,
      actionType: 'CHANGE_BUDGET',
      platform: targetCamp.platform,
      entityType: 'CAMPAIGN',
      entityId: targetCamp.id,
      entityName: targetCamp.name,
      proposedBy: 'MANUAL',
      reason: `Manual scale (+20%) based on high ROAS (${targetCamp.roas.toFixed(2)}x).`,
      previousValue: `$${targetCamp.dailyBudget.toFixed(2)} / day`,
      newValue: `$${(targetCamp.dailyBudget * 1.2).toFixed(2)} / day (+20%)`,
      status: 'PENDING',
      createdAt: 'এখনই',
      safetyCheck: {
        passed: true,
        rule: 'Manual trigger within 20% limit',
      },
    };

    setActions((prev) => [newAction, ...prev]);
    setActiveNav('APPROVALS');
  };

  const handlePauseCreative = (adId: string) => {
    const targetCr = creatives.find((c) => c.adId === adId || c.id === adId);
    if (!targetCr) return;

    const newAction: ActionQueueItem = {
      id: `act-${Date.now()}`,
      actionType: 'PAUSE_AD',
      platform: targetCr.platform,
      entityType: 'AD',
      entityId: targetCr.adId,
      entityName: targetCr.adName,
      proposedBy: 'AGENT',
      reason: 'Fatigued Creative: Frequency > 4.0, CTR dropped heavily.',
      previousValue: 'ACTIVE',
      newValue: 'PAUSED',
      status: 'PENDING',
      createdAt: 'এখনই',
      safetyCheck: {
        passed: true,
        rule: 'Creative Fatigue Guardrail Passed',
      },
    };

    setActions((prev) => [newAction, ...prev]);
    setActiveNav('APPROVALS');
  };

  const handleReauditTracking = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setTrackingChecks((prev) =>
        prev.map((chk) => ({ ...chk, checkedAt: new Date() }))
      );
    }, 1000);
  };

  const handleRunAudit = () => {
    setIsRunningAudit(true);
    setTimeout(() => {
      setIsRunningAudit(false);
      setActiveNav('APPROVALS');
    }, 900);
  };

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const pendingActionsCount = actions.filter((a) => a.status === 'PENDING').length;
  const trackingAlertsCount = trackingChecks.filter((t) => t.status !== 'GREEN').length;


  // 1. Loading splash while reading saved session
  if (!isAuthLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#090d16] text-white'}`}>
        <div className="h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Email & OTP Authentication Screen if not logged in
  if (!currentUser) {
    return (
      <AuthLoginView
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={() => setTheme(isLight ? 'dark' : 'light')}
      />
    );
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#090d16] text-slate-100'
    } selection:bg-blue-500/20 selection:text-blue-600`}>
      {/* 1. Left Sidebar Navigation (Dedicated to Marketing & Ads) */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        pendingActionsCount={pendingActionsCount}
        trackingAlertsCount={trackingAlertsCount}
        theme={theme}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenHub={() => {
          setConnectionHubPlatform(activeNav === 'GOOGLE_ADS' ? 'GOOGLE' : activeNav === 'TIKTOK_ADS' ? 'TIKTOK' : 'META');
          setIsConnectionHubOpen(true);
        }}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header matching FAKEIT breadcrumb bar with Black and White mode toggle */}
        <header className={`sticky top-0 z-30 w-full border-b px-3 sm:px-6 py-2.5 flex items-center justify-between transition-colors ${
          isLight ? 'border-slate-200 bg-white/90 backdrop-blur-md' : 'border-[#1a1f2c] bg-[#0c1017]/90 backdrop-blur-md'
        }`}>
          {/* Left: Mobile Menu Hamburger & Active Section Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`p-1.5 rounded-lg border lg:hidden transition-colors ${
                isLight 
                  ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200' 
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className={`hidden md:inline-block text-xs font-bold uppercase tracking-wider truncate max-w-[200px] lg:max-w-none ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {activeNav === 'ANALYTICS' && 'GA4 Analytics & Attribution'}
              {activeNav === 'META_ADS' && 'Meta Ads Intelligence'}
              {activeNav === 'GOOGLE_ADS' && 'Google Ads Intelligence'}
              {activeNav === 'TIKTOK_ADS' && 'TikTok Ads Intelligence'}
              {activeNav === 'CONTENT_ANALYTICS' && 'Content Analytics'}
              {activeNav === 'AI_COPILOT' && 'AI Growth Copilot'}
              {activeNav === 'APPROVALS' && 'Approvals & Actions'}
              {activeNav === 'TRACKING' && 'Tracking Health & Pixel'}
              {activeNav === 'RULES' && 'Automation Rules'}
              {activeNav === 'REPORTS' && 'Executive Reports'}
            </h1>
          </div>

          {/* Right Controls: Business / Client Dropdown, Black/White Mode Switch, Notifications, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Business / Client Workspace Dropdown Selector (Moved to right side) */}
            <BusinessWorkspaceDropdown
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={handleSelectWorkspace}
              onAddWorkspace={handleAddWorkspace}
              onRemoveWorkspace={handleCloseWorkspace}
              theme={theme}
            />

            {/* Black and White Mood Toggle (Light / Dark Mode Switch) */}
            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isLight ? 'Switch to Black Mode (Dark)' : 'Switch to White Mode (Light)'}
            >
              {isLight ? <Moon className="h-3.5 w-3.5 text-slate-700" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
            </button>

            {/* Notifications */}
            <NotificationDropdown
              actions={actions}
              trackingChecks={trackingChecks}
              onApprove={handleApproveAction}
              onReject={handleRejectAction}
              onNavigateToApprovals={() => setActiveNav('APPROVALS')}
              onNavigateToTracking={() => setActiveNav('TRACKING')}
              theme={theme}
            />
          </div>
        </header>

        {/* Main Body Content */}
        <main className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
          {/* 1. Analytics (Google Analytics 4 — Single Source of Truth + Ad-Level Performance) */}
          {activeNav === 'ANALYTICS' && (
            <GtmGa4AnalyticsDashboard
              metrics={activeWorkspace.metrics.ALL}
              campaigns={activeWorkspace.campaigns}
              creatives={activeWorkspace.creatives}
              theme={theme}
              onToggleStatus={handleToggleCampaignStatus}
              onScaleBudget={handleScaleBudget}
              onPauseCreative={handlePauseCreative}
            />
          )}

          {/* 2. Meta Ads (Performance Engine) */}
          {activeNav === 'META_ADS' && (
            <MetaAdsPerformanceDashboard 
              theme={theme} 
              hasActiveData={Boolean(activeWorkspace.connectedAccounts.meta?.id)}
              accountName={activeWorkspace.connectedAccounts.meta?.name || `${activeWorkspace.clientName} (Not connected)`}
              accountId={activeWorkspace.connectedAccounts.meta?.id || ''}
              currency={activeWorkspace.currency}
              onNavigatePlatform={(platform) => {
                if (platform === 'META') setActiveNav('META_ADS');
                if (platform === 'GOOGLE') setActiveNav('GOOGLE_ADS');
                if (platform === 'TIKTOK') setActiveNav('TIKTOK_ADS');
                if (platform === 'AUDIT') setActiveNav('TRACKING');
              }}
              onOpenHub={() => {
                setConnectionHubPlatform('META');
                setIsConnectionHubOpen(true);
              }}
            />
          )}

          {/* 3. Google Ads (Search & Shopping Intelligence) */}
          {activeNav === 'GOOGLE_ADS' && (
            <GoogleAdsIntelligenceDashboard 
              theme={theme} 
              hasActiveData={Boolean(activeWorkspace.connectedAccounts.google?.id)}
              accountName={activeWorkspace.connectedAccounts.google?.name || `${activeWorkspace.clientName} Google Ads (Not connected)`}
              accountId={activeWorkspace.connectedAccounts.google?.id || ''}
              currency={activeWorkspace.currency}
              onOpenHub={() => {
                setConnectionHubPlatform('GOOGLE');
                setIsConnectionHubOpen(true);
              }}
            />
          )}

          {/* 4. TikTok Ads (Creative Performance Engine) */}
          {activeNav === 'TIKTOK_ADS' && (
            <TikTokAdsIntelligenceDashboard 
              theme={theme} 
              hasActiveData={Boolean(activeWorkspace.connectedAccounts.tiktok?.id)}
              accountName={activeWorkspace.connectedAccounts.tiktok?.name || `${activeWorkspace.clientName} TikTok Ads (Not connected)`}
              accountId={activeWorkspace.connectedAccounts.tiktok?.id || ''}
              onOpenHub={() => {
                setConnectionHubPlatform('TIKTOK');
                setIsConnectionHubOpen(true);
              }}
            />
          )}

          {/* 5. Content Analytics (Creative Lab with Hook & Hold Rate) */}
          {activeNav === 'CONTENT_ANALYTICS' && (
            <CreativeAnalysisLab
              creatives={creatives}
              onPauseCreative={handlePauseCreative}
              theme={theme}
            />
          )}

          {/* 6. AI Growth Copilot (Conversational Engine) */}
          {activeNav === 'AI_COPILOT' && (
            <AiGrowthCopilotView
              campaigns={campaigns}
              creatives={creatives}
              onActionCreated={handleActionCreated}
              onActionApproved={handleApproveAction}
              onActionRejected={handleRejectAction}
              theme={theme}
            />
          )}

          {/* 7. Approvals & Actions */}
          {activeNav === 'APPROVALS' && (
            <ActionsTab
              actions={actions}
              onApprove={handleApproveAction}
              onReject={handleRejectAction}
              onUndo={handleUndoAction}
              theme={theme}
            />
          )}

          {/* 8. Tracking Health */}
          {activeNav === 'TRACKING' && (
            <TrackingHealthView
              trackingChecks={trackingChecks}
              onReaudit={handleReauditTracking}
              isAuditing={isAuditing}
              theme={theme}
            />
          )}

          {/* 9. Optimization Rules */}
          {activeNav === 'RULES' && (
            <OptimizationEngineView
              rules={rules}
              onToggleRule={handleToggleRule}
              onRunAudit={handleRunAudit}
              isRunningAudit={isRunningAudit}
              theme={theme}
              onActionCreated={handleActionCreated}
            />
          )}

          {/* 10. Reports */}
          {activeNav === 'REPORTS' && (
            <ReportsView
              theme={theme}
              metrics={activeWorkspace.metrics.ALL}
              campaigns={activeWorkspace.campaigns}
              clientName={activeWorkspace.clientName}
              currency={activeWorkspace.currency}
              onOpenHub={() => {
                setConnectionHubPlatform('META');
                setIsConnectionHubOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Platform Connection & Multi-Account Selection Hub Modal */}
      <PlatformConnectionHubModal
        isOpen={isConnectionHubOpen}
        onClose={() => setIsConnectionHubOpen(false)}
        theme={theme}
        initialPlatform={connectionHubPlatform}
      />
    </div>
  );
}
