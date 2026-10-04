'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Play, 
  Check, 
  ShieldCheck, 
  Zap, 
  AlertTriangle,
  RotateCw,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  History,
  Settings2,
  X,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Package,
  Layers,
  Activity,
  Flame,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';
import { 
  OptimizationRuleItem, 
  AutomationMode, 
  RuleRiskLevel, 
  RuleCategory, 
  RuleScope,
  RuleHistoryItem,
  Platform,
  ActionQueueItem
} from '@/types';

interface OptimizationEngineViewProps {
  rules: OptimizationRuleItem[];
  onToggleRule: (ruleId: string) => void;
  onRunAudit: () => void;
  isRunningAudit: boolean;
  theme?: 'light' | 'dark';
  onActionCreated?: (action: ActionQueueItem) => void;
}

export const OptimizationEngineView: React.FC<OptimizationEngineViewProps> = ({
  rules: initialRules,
  onToggleRule,
  onRunAudit,
  isRunningAudit,
  theme = 'light',
  onActionCreated,
}) => {
  const isLight = theme === 'light';

  // Local state for interactive features
  const [rulesList, setRulesList] = useState<OptimizationRuleItem[]>(initialRules);
  
  React.useEffect(() => {
    setRulesList(initialRules || []);
  }, [initialRules]);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Category tabs scroll & drag state
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [isDraggingTabs, setIsDraggingTabs] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragScrollLeft, setDragScrollLeft] = useState<number>(0);

  const checkTabsScroll = React.useCallback(() => {
    const el = tabsContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 6);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
    }
  }, []);

  React.useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    checkTabsScroll();

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY * 1.5, behavior: 'auto' });
        checkTabsScroll();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', checkTabsScroll);
    window.addEventListener('resize', checkTabsScroll);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', checkTabsScroll);
      window.removeEventListener('resize', checkTabsScroll);
    };
  }, [checkTabsScroll]);

  const scrollTabs = (dir: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const offset = dir === 'left' ? -260 : 260;
    el.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkTabsScroll, 250);
  };

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setIsDraggingTabs(true);
    setDragStartX(e.pageX - el.offsetLeft);
    setDragScrollLeft(el.scrollLeft);
  };

  const handleTabsMouseLeaveOrUp = () => {
    setIsDraggingTabs(false);
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTabs) return;
    e.preventDefault();
    const el = tabsContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    el.scrollLeft = dragScrollLeft - walk;
    checkTabsScroll();
  };

  // Modals state
  const [selectedRuleForLogs, setSelectedRuleForLogs] = useState<OptimizationRuleItem | null>(null);
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [isGuardrailsOpen, setIsGuardrailsOpen] = useState(false);
  const [runningRuleId, setRunningRuleId] = useState<string | null>(null);

  // Guardrails settings state
  const [guardrails, setGuardrails] = useState({
    maxDailyBudgetIncreasePct: 30,
    maxActionsPerDay: 10,
    maxCampaignBudget: 20000,
    conflictPolicy: 'HUMAN_APPROVAL_REQUIRED',
    requireApprovalForHighRisk: true,
  });

  // Rule Builder Form state
  const [newRule, setNewRule] = useState({
    title: '',
    platform: 'ALL' as Platform | 'ALL',
    category: 'BUDGET' as RuleCategory,
    scope: 'CAMPAIGN' as RuleScope,
    metric: 'ROAS',
    operator: '>=',
    value: '1.5x Target',
    duration: '3 consecutive days',
    action: 'Increase Daily Budget',
    actionValue: '+20%',
    maxLimit: 'Max +20%/day (Cap: ৳10,000)',
    mode: 'RECOMMEND' as AutomationMode,
    cooldown: '24 hours',
    riskLevel: 'MEDIUM' as RuleRiskLevel,
    minDataRequirement: 'Purchases >= 5',
    description: '',
  });

  // Filter logic
  const filteredRules = rulesList.filter((rule) => {
    if (selectedCategory !== 'ALL' && rule.category !== selectedCategory) return false;
    if (selectedPlatform !== 'ALL' && rule.platform !== selectedPlatform && rule.platform !== 'ALL') return false;
    if (selectedMode !== 'ALL' && rule.mode !== selectedMode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rule.title.toLowerCase().includes(q);
      const matchDesc = rule.description.toLowerCase().includes(q);
      const matchCond = rule.condition.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCond) return false;
    }
    return true;
  });

  // Handler for toggle
  const handleToggle = (id: string) => {
    setRulesList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    );
    onToggleRule(id);
  };

  // Handler for simulating rule execution
  const handleRunSingleRule = (rule: OptimizationRuleItem) => {
    setRunningRuleId(rule.id);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' });

      const newLog: RuleHistoryItem = {
        id: `hist-${Date.now()}`,
        ruleId: rule.id,
        ruleName: rule.title,
        timestamp: `${dateStr}, ${timeStr}`,
        conditionMet: rule.condition,
        metricSnapshot: {
          'Evaluation Status': 'Trigger Condition Met',
          'Current Metric': rule.minDataRequirement || 'Verified',
          'Lookback Window': rule.cooldown || '24h',
        },
        decision: `Rule triggered ${rule.actionSuggested}`,
        actionTaken: rule.mode === 'AUTONOMOUS' ? 'Auto-Executed & Clamped by Guardrails' : 'Queued for Human Approval in Actions Tab',
        executedBy: rule.mode === 'AUTONOMOUS' ? 'AI Automation' : 'Rule Engine',
        status: rule.mode === 'AUTONOMOUS' ? 'VERIFIED' : 'PENDING_APPROVAL',
        risk: rule.riskLevel || 'MEDIUM',
      };

      setRulesList((prev) =>
        prev.map((r) => {
          if (r.id === rule.id) {
            return {
              ...r,
              triggerCount: r.triggerCount + 1,
              lastTriggered: `আজ ${timeStr}`,
              history: [newLog, ...(r.history || [])],
            };
          }
          return r;
        })
      );

      // If in RECOMMEND mode, dispatch to human approval queue
      if (rule.mode === 'RECOMMEND' && onActionCreated) {
        const actionItem: ActionQueueItem = {
          id: `act-rule-${Date.now()}`,
          actionType: rule.scope === 'AD' ? 'PAUSE_AD' : 'CHANGE_BUDGET',
          platform: rule.platform === 'ALL' ? 'META' : rule.platform,
          entityType: rule.scope === 'KEYWORD' ? 'KEYWORD' : rule.scope === 'ADSET' ? 'ADSET' : rule.scope === 'AD' ? 'AD' : 'CAMPAIGN',
          entityId: `ent-${rule.id}`,
          entityName: `${rule.platform} | ${rule.title}`,
          proposedBy: 'RULE',
          reason: `Rules Engine Triggered: ${rule.condition}`,
          previousValue: 'ACTIVE / Baseline',
          newValue: rule.actionSuggested,
          status: 'PENDING',
          createdAt: 'এখনই',
          safetyCheck: {
            passed: true,
            rule: `Guardrail Passed: ${rule.maxLimit || 'Standard Cooldown Passed'}`,
          },
        };
        onActionCreated(actionItem);
      }

      setRunningRuleId(null);
    }, 700);
  };

  // Handler to create new rule
  const handleSaveNewRule = () => {
    if (!newRule.title.trim()) return;

    const created: OptimizationRuleItem = {
      id: `rule-custom-${Date.now()}`,
      title: newRule.title,
      platform: newRule.platform,
      category: newRule.category,
      scope: newRule.scope,
      description: newRule.description || `IF ${newRule.metric} ${newRule.operator} ${newRule.value} (${newRule.duration}) THEN ${newRule.action} (${newRule.actionValue})`,
      condition: `${newRule.metric} ${newRule.operator} ${newRule.value} over ${newRule.duration}`,
      actionSuggested: `${newRule.action} ${newRule.actionValue}`,
      mode: newRule.mode,
      riskLevel: newRule.riskLevel,
      cooldown: newRule.cooldown,
      minDataRequirement: newRule.minDataRequirement,
      maxLimit: newRule.maxLimit,
      triggerCount: 0,
      isEnabled: true,
      lastTriggered: 'এইমাত্র তৈরি',
      history: [],
    };

    setRulesList([created, ...rulesList]);
    setIsCreateRuleOpen(false);
    setNewRule({
      title: '',
      platform: 'ALL',
      category: 'BUDGET',
      scope: 'CAMPAIGN',
      metric: 'ROAS',
      operator: '>=',
      value: '1.5x Target',
      duration: '3 consecutive days',
      action: 'Increase Daily Budget',
      actionValue: '+20%',
      maxLimit: 'Max +20%/day (Cap: ৳10,000)',
      mode: 'RECOMMEND',
      cooldown: '24 hours',
      riskLevel: 'MEDIUM',
      minDataRequirement: 'Purchases >= 5',
      description: '',
    });
  };

  // Category Tabs metadata
  const categories = [
    { id: 'ALL', label: 'সব রুলস', count: rulesList.length },
    { id: 'BUDGET', label: '💰 Budget Rules', count: rulesList.filter(r => r.category === 'BUDGET').length },
    { id: 'PERFORMANCE', label: '⚡ Performance', count: rulesList.filter(r => r.category === 'PERFORMANCE').length },
    { id: 'CREATIVE', label: '🎨 Creative', count: rulesList.filter(r => r.category === 'CREATIVE').length },
    { id: 'FUNNEL', label: '🛒 Funnel & Checkout', count: rulesList.filter(r => r.category === 'FUNNEL').length },
    { id: 'TRACKING', label: '📡 Tracking & CAPI', count: rulesList.filter(r => r.category === 'TRACKING').length },
    { id: 'INVENTORY', label: '📦 Stock & Inventory', count: rulesList.filter(r => r.category === 'INVENTORY').length },
    { id: 'AUDIENCE', label: '👥 Audience Saturation', count: rulesList.filter(r => r.category === 'AUDIENCE').length },
    { id: 'GOOGLE', label: '🔍 Google Ads', count: rulesList.filter(r => r.category === 'GOOGLE').length },
    { id: 'TIKTOK', label: '🎵 TikTok Ads', count: rulesList.filter(r => r.category === 'TIKTOK').length },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Status & Audit Action */}
      <div className={`rounded-xl border p-4 transition-all ${
        isLight 
          ? 'border-indigo-200/90 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/80 shadow-sm' 
          : 'border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/70 to-slate-950/60 shadow-md'
      }`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl border shadow-xs ${
                isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}>
                <Sliders className="h-4 w-4" />
              </div>
              <h2 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Rules & Automation
              </h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Protection
              </span>
            </div>
            <p className={`mt-1 text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              বাজেট অপচয় রোধ, উইনার অ্যাড স্কেলিং ও স্বয়ংক্রিয় গার্ডরেইল পরিচালনা।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsGuardrailsOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                isLight 
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' 
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings2 className="h-3.5 w-3.5 text-blue-500" />
              <span>Guardrails</span>
            </button>

            <button
              onClick={() => setIsCreateRuleOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isLight 
                  ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50' 
                  : 'border-slate-800 bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Rule</span>
            </button>

            <button
              onClick={onRunAudit}
              disabled={isRunningAudit}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`h-3.5 w-3.5 ${isRunningAudit ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{isRunningAudit ? 'অডিট চলছে...' : 'Run All Rules'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PRD Section 26: Automation Overview & Performance Impact Dashboard */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={`rounded-2xl border p-4 transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-[#101625] border-slate-800'
        }`}>
          <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Total Spend Saved
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
            ৳৪৯,৬৫০
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            বাজেট অপচয় রোধ
          </div>
        </div>

        <div className={`rounded-2xl border p-4 transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-[#101625] border-slate-800'
        }`}>
          <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Winning Ads Scaled
          </div>
          <div className={`text-xl font-bold mt-1 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            ২৩টি অ্যাড
          </div>
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
            ROAS &gt; ৩.৫x স্কেলিং
          </div>
        </div>

        <div className={`rounded-2xl border p-4 transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-[#101625] border-slate-800'
        }`}>
          <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Active Rules
          </div>
          <div className={`text-xl font-bold mt-1 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {rulesList.filter(r => r.isEnabled).length}টি রুলস
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            ২৪ ঘণ্টা লাইভ সুরক্ষা
          </div>
        </div>

        <div className={`rounded-2xl border p-4 transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-[#101625] border-slate-800'
        }`}>
          <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Pending Approval
          </div>
          <div className="text-xl font-bold text-amber-500 mt-1 tracking-tight">
            ৫টি অ্যাকশন
          </div>
          <div className="text-[11px] font-semibold text-amber-600 mt-0.5">
            Action Center-এ দেখুন
          </div>
        </div>
      </div>

      {/* 3. Category Tabs & Search Bar */}
      <div className="space-y-2.5">
        {/* Category Header with Scroll Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              ক্যাটাগরি ফিল্টার ({categories.length}টি)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800'
            }`}>
              {selectedCategory === 'ALL' ? 'সব রুলস' : categories.find(c => c.id === selectedCategory)?.label}
            </span>
          </div>

          {/* Sleek Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              disabled={!canScrollLeft}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                !canScrollLeft
                  ? 'opacity-30 cursor-not-allowed border-transparent'
                  : isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title="বামে স্ক্রোল করুন"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              disabled={!canScrollRight}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                !canScrollRight
                  ? 'opacity-30 cursor-not-allowed border-transparent'
                  : isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title="ডানে স্ক্রোল করুন"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Pills List with Arrow buttons, Wheel & Drag */}
        <div className="relative flex items-center group">
          {/* Scrollable Pills List */}
          <div
            ref={tabsContainerRef}
            onMouseDown={handleTabsMouseDown}
            onMouseLeave={handleTabsMouseLeaveOrUp}
            onMouseUp={handleTabsMouseLeaveOrUp}
            onMouseMove={handleTabsMouseMove}
            className="flex items-center gap-2 overflow-x-auto py-1 px-1 scroll-smooth select-none cursor-grab active:cursor-grabbing w-full no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={(e) => {
                  setSelectedCategory(cat.id);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition-all text-xs flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                    : isLight
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                      : 'bg-[#121620] border border-[#1b2230] text-slate-300 hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  selectedCategory === cat.id
                    ? 'bg-white/25 text-white'
                    : isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-300'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters Row: Platform, Mode, Search Input */}
        <div className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${
          isLight ? 'bg-white border-slate-200/90' : 'bg-[#121620] border-[#1b2230]'
        }`}>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Platform filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className={`rounded-lg border px-2.5 py-1.5 font-semibold focus:outline-none ${
                isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-slate-700 bg-slate-900 text-white'
              }`}
            >
              <option value="ALL">সব প্ল্যাটফর্ম (All)</option>
              <option value="META">Meta Ads</option>
              <option value="GOOGLE">Google Ads</option>
              <option value="TIKTOK">TikTok Ads</option>
            </select>

            {/* Mode filter */}
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className={`rounded-lg border px-2.5 py-1.5 font-semibold focus:outline-none ${
                isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-slate-700 bg-slate-900 text-white'
              }`}
            >
              <option value="ALL">সব মোড (All Modes)</option>
              <option value="MONITOR">Mode 1 — Monitor (Detect only)</option>
              <option value="RECOMMEND">Mode 2 — Recommend (Approval)</option>
              <option value="AUTONOMOUS">Mode 3 — Autonomous (Auto action)</option>
            </select>
          </div>

          {/* Search bar */}
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs w-full sm:w-64 ${
            isLight ? 'border-slate-200 bg-slate-50 text-slate-800' : 'border-slate-700 bg-[#0a0d14] text-white'
          }`}>
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="রুলস খুঁজুন (যেমন: CPA, ROAS, Fatigue)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full focus:outline-none placeholder-slate-400 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. PRD Section 27: Rules List Cards */}
      <div className="space-y-3">
        {filteredRules.length === 0 ? (
          <div className={`rounded-xl border p-12 text-center ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#121620] border-[#1b2230]'
          }`}>
            <Sliders className="h-8 w-8 mx-auto text-slate-400" />
            <h4 className={`text-sm font-bold mt-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              কোনো রুলস পাওয়া যায়নি
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              অন্য কোনো ক্যাটাগরি ফিল্টার নির্বাচন করুন অথবা নতুন রুল তৈরি করুন।
            </p>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const isRunningThis = runningRuleId === rule.id;

            return (
              <div
                key={rule.id}
                className={`rounded-xl border p-4.5 transition-all ${
                  rule.isEnabled
                    ? isLight
                      ? 'border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm'
                      : 'border-[#1b2230] bg-[#121620] shadow-sm hover:border-slate-700'
                    : isLight
                      ? 'border-slate-200/60 bg-slate-50/70 opacity-60'
                      : 'border-[#1b2230]/40 bg-[#0a0d14]/40 opacity-60'
                }`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 flex-1">
                    {/* Header tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Platform Tag */}
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        rule.platform === 'META' ? (isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20') :
                        rule.platform === 'GOOGLE' ? (isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20') :
                        rule.platform === 'TIKTOK' ? (isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-200 border-slate-700') :
                        (isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700')
                      }`}>
                        {rule.platform === 'META' ? 'Meta Ads' : rule.platform === 'GOOGLE' ? 'Google Ads' : rule.platform === 'TIKTOK' ? 'TikTok Ads' : 'All Platforms'}
                      </span>

                      {/* Rule Name */}
                      <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {rule.title}
                      </h3>

                      {/* Action Type Badge */}
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                        rule.mode === 'AUTONOMOUS'
                          ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}>
                        {rule.mode === 'AUTONOMOUS' ? 'স্বয়ংক্রিয় একশন' : 'সুপারিশ (Approval Required)'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {rule.description}
                    </p>

                    {/* Simple Human Logic Pill */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                      <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] border ${
                        isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-900/80 text-slate-300 border-slate-800'
                      }`}>
                        <Sparkles className="h-3 w-3 text-blue-500 shrink-0" />
                        <span><strong>নিয়ম:</strong> {rule.condition} ➔ {rule.actionSuggested}</span>
                      </div>

                      <div className={`flex items-center gap-2 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span>ট্রিগার: <strong className="font-semibold text-slate-700 dark:text-slate-200">{rule.triggerCount} বার</strong></span>
                        {rule.lastTriggered && (
                          <>
                            <span>•</span>
                            <span>সর্বশেষ: <strong className="font-semibold text-slate-700 dark:text-slate-200">{rule.lastTriggered}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar: Run single rule, View Logs, Toggle */}
                  <div className="flex items-center gap-2 lg:self-center shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => handleRunSingleRule(rule)}
                      disabled={isRunningThis || !rule.isEnabled}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 ${
                        isLight ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                      title="Test/Evaluate this rule now"
                    >
                      <Play className={`h-3 w-3 ${isRunningThis ? 'animate-spin text-amber-500' : 'text-emerald-500'}`} />
                      <span>{isRunningThis ? 'পরীক্ষা...' : 'Run Now'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedRuleForLogs(rule)}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                        isLight ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <History className="h-3 w-3 text-indigo-500" />
                      <span>Logs ({rule.history?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => handleToggle(rule.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                        rule.isEnabled
                          ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : isLight ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {rule.isEnabled ? 'Active Rule' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. PRD Section 7: Rule Builder Modal (Create New Rule) */}
      {isCreateRuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl transition-all my-8 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#121620] border-[#1b2230] text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                  <Sliders className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold">Create New Automation Rule (PRD Builder)</h3>
              </div>
              <button 
                onClick={() => setIsCreateRuleOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Rule Name</label>
                <input
                  type="text"
                  placeholder="যেমন: High ROAS Scaling, Zero Conv Pause"
                  value={newRule.title}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                    isLight ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500' : 'border-slate-700 bg-slate-900 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Platform</label>
                  <select
                    value={newRule.platform}
                    onChange={(e) => setNewRule({ ...newRule, platform: e.target.value as any })}
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 font-semibold focus:outline-none ${
                      isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-slate-700 bg-slate-900 text-white'
                    }`}
                  >
                    <option value="ALL">All Platforms</option>
                    <option value="META">Meta Ads</option>
                    <option value="GOOGLE">Google Ads</option>
                    <option value="TIKTOK">TikTok Ads</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Scope</label>
                  <select
                    value={newRule.scope}
                    onChange={(e) => setNewRule({ ...newRule, scope: e.target.value as any })}
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 font-semibold focus:outline-none ${
                      isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-slate-700 bg-slate-900 text-white'
                    }`}
                  >
                    <option value="CAMPAIGN">Campaign</option>
                    <option value="ADSET">Ad Set</option>
                    <option value="AD">Individual Ad</option>
                    <option value="KEYWORD">Keyword</option>
                    <option value="FUNNEL">Funnel Step</option>
                    <option value="INVENTORY">Inventory / Product</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Category</label>
                  <select
                    value={newRule.category}
                    onChange={(e) => setNewRule({ ...newRule, category: e.target.value as any })}
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 font-semibold focus:outline-none ${
                      isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-slate-700 bg-slate-900 text-white'
                    }`}
                  >
                    <option value="BUDGET">Budget</option>
                    <option value="PERFORMANCE">Performance</option>
                    <option value="CREATIVE">Creative</option>
                    <option value="FUNNEL">Funnel</option>
                    <option value="TRACKING">Tracking</option>
                    <option value="INVENTORY">Inventory</option>
                    <option value="AUDIENCE">Audience</option>
                    <option value="GOOGLE">Google</option>
                    <option value="TIKTOK">TikTok</option>
                  </select>
                </div>
              </div>

              {/* IF Section */}
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                <div className="font-bold text-cyan-600 dark:text-cyan-400 mb-2">IF Condition:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Metric</span>
                    <input
                      type="text"
                      value={newRule.metric}
                      onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
                      placeholder="ROAS, CPA, Spend"
                      className={`mt-0.5 w-full rounded border px-2 py-1 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Operator</span>
                    <select
                      value={newRule.operator}
                      onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                      className={`mt-0.5 w-full rounded border px-2 py-1 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-700'}`}
                    >
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value="==">==</option>
                      <option value="drops >">drops &gt;</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Value</span>
                    <input
                      type="text"
                      value={newRule.value}
                      onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                      placeholder="1.5x Target"
                      className={`mt-0.5 w-full rounded border px-2 py-1 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Duration</span>
                    <input
                      type="text"
                      value={newRule.duration}
                      onChange={(e) => setNewRule({ ...newRule, duration: e.target.value })}
                      placeholder="3 consecutive days"
                      className={`mt-0.5 w-full rounded border px-2 py-1 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                </div>
              </div>

              {/* THEN Section */}
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
                <div className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">THEN Action:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Action</span>
                    <input
                      type="text"
                      value={newRule.action}
                      onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                      placeholder="Increase Daily Budget, Pause Ad"
                      className={`mt-0.5 w-full rounded border px-2 py-1 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Value / Adjustment</span>
                    <input
                      type="text"
                      value={newRule.actionValue}
                      onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                      placeholder="+20%, -15%"
                      className={`mt-0.5 w-full rounded border px-2 py-1 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Max Limit / Cap</span>
                    <input
                      type="text"
                      value={newRule.maxLimit}
                      onChange={(e) => setNewRule({ ...newRule, maxLimit: e.target.value })}
                      placeholder="Cap: ৳10,000/day"
                      className={`mt-0.5 w-full rounded border px-2 py-1 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Automation Mode, Cooldown & Risk Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Automation Mode</label>
                  <select
                    value={newRule.mode}
                    onChange={(e) => setNewRule({ ...newRule, mode: e.target.value as any })}
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 font-semibold focus:outline-none ${
                      isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-slate-700 bg-slate-900 text-white'
                    }`}
                  >
                    <option value="MONITOR">Mode 1 — Monitor (Alert only)</option>
                    <option value="RECOMMEND">Mode 2 — Recommend (Human approval)</option>
                    <option value="AUTONOMOUS">Mode 3 — Autonomous (Auto action)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Cooldown</label>
                  <select
                    value={newRule.cooldown}
                    onChange={(e) => setNewRule({ ...newRule, cooldown: e.target.value })}
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 font-semibold focus:outline-none ${
                      isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-slate-700 bg-slate-900 text-white'
                    }`}
                  >
                    <option value="6 hours">6 hours</option>
                    <option value="12 hours">12 hours</option>
                    <option value="24 hours">24 hours</option>
                    <option value="48 hours">48 hours</option>
                    <option value="7 days">7 days</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Risk Level</label>
                  <select
                    value={newRule.riskLevel}
                    onChange={(e) => setNewRule({ ...newRule, riskLevel: e.target.value as any })}
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 font-semibold focus:outline-none ${
                      isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-slate-700 bg-slate-900 text-white'
                    }`}
                  >
                    <option value="LOW">Low (Reports & Suggestions)</option>
                    <option value="MEDIUM">Medium (Budget ±10-20%)</option>
                    <option value="HIGH">High (Pause Ad/Campaign)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Minimum Data Requirement</label>
                <input
                  type="text"
                  placeholder="যেমন: Purchases >= 5, Spend > 1.5x Target CPA"
                  value={newRule.minDataRequirement}
                  onChange={(e) => setNewRule({ ...newRule, minDataRequirement: e.target.value })}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                    isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-slate-700 bg-slate-900 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsCreateRuleOpen(false)}
                className={`rounded-lg px-4 py-2 font-semibold text-xs ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewRule}
                disabled={!newRule.title.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-xs text-white hover:bg-indigo-500 shadow-md transition-all disabled:opacity-50"
              >
                Save & Enable Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PRD Section 28 & 29: Rule Execution History & Audit Log Modal */}
      {selectedRuleForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl transition-all my-8 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#121620] border-[#1b2230] text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-bold">{selectedRuleForLogs.title} — Audit Logs</h3>
                  <span className="text-[10px] text-slate-400">Execution History & State Snapshots</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRuleForLogs(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
              {(!selectedRuleForLogs.history || selectedRuleForLogs.history.length === 0) ? (
                <div className="p-8 text-center text-slate-400 border rounded-xl border-dashed border-slate-200 dark:border-slate-800">
                  এই রুলের অধীনে এখনো কোনো ট্রিগার বা অডিট হিস্টোরি তৈরি হয়নি।
                </div>
              ) : (
                selectedRuleForLogs.history.map((log) => (
                  <div key={log.id} className={`p-4 rounded-xl border transition-all ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0d14] border-[#1b212f]'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                          log.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {log.status === 'VERIFIED' ? '✓ Verified Execution' : '⏳ Pending Human Approval'}
                        </span>
                        <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">By: {log.executedBy}</span>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">Condition Met:</span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">{log.conditionMet}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">Decision:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{log.decision}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">Action:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{log.actionTaken}</span>
                      </div>
                      {log.previousValue && log.newValue && (
                        <div className="flex items-center gap-2 text-xs pt-1">
                          <span className="line-through text-slate-400">{String(log.previousValue)}</span>
                          <ArrowRight className="h-3 w-3 text-cyan-500" />
                          <span className="font-bold text-emerald-600">{String(log.newValue)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRuleForLogs(null)}
                className={`rounded-lg px-4 py-1.5 font-bold text-xs ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                Close Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRD Section 23: Global Automation Guardrails Settings Modal */}
      {isGuardrailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all my-8 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#121620] border-[#1b2230] text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h3 className="text-sm font-bold">Automation Safety Guardrails (PRD Sec 23)</h3>
              </div>
              <button 
                onClick={() => setIsGuardrailsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-500 text-xs">
                যেকোনো রুল এক্সিকিউট হওয়ার আগে এই গ্লোবাল গার্ডরেইল সীমা স্বয়ংক্রিয়ভাবে যাচাই করা হয় যাতে অনিচ্ছাকৃত বাজেট স্পাইক রোধ পায়।
              </p>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Budget Increase Per Day (%)
                </label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={guardrails.maxDailyBudgetIncreasePct}
                    onChange={(e) => setGuardrails({ ...guardrails, maxDailyBudgetIncreasePct: Number(e.target.value) })}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="font-black text-indigo-600 text-sm w-12 text-right">
                    +{guardrails.maxDailyBudgetIncreasePct}%
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Number of Auto Actions Per Day
                </label>
                <input
                  type="number"
                  value={guardrails.maxActionsPerDay}
                  onChange={(e) => setGuardrails({ ...guardrails, maxActionsPerDay: Number(e.target.value) })}
                  className={`mt-1 w-full rounded-lg border px-3 py-1.5 text-xs ${
                    isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Single Campaign Budget Cap (BDT ৳)
                </label>
                <input
                  type="number"
                  value={guardrails.maxCampaignBudget}
                  onChange={(e) => setGuardrails({ ...guardrails, maxCampaignBudget: Number(e.target.value) })}
                  className={`mt-1 w-full rounded-lg border px-3 py-1.5 text-xs ${
                    isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900'
                  }`}
                />
              </div>

              {/* Conflict Resolution Policy */}
              <div className={`p-3 rounded-xl border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'}`}>
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Conflict Resolution Engine (PRD Sec 20)</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  যদি একই ক্যাম্পেইনে একাধিক বিরোধী রুল (যেমন: স্কেলিং ও বাজেট হ্রাস) ট্রিগার করে, তবে কোনো স্বয়ংক্রিয় অ্যাকশন নেওয়া হবে না এবং স্বয়ংক্রিয়ভাবে হিউম্যান অনুমোদনের জন্য অ্যাকশন ট্যাবে পাঠানো হবে।
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsGuardrailsOpen(false)}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-xs text-white hover:bg-indigo-500 shadow-md transition-all"
              >
                Save Guardrail Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
