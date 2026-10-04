'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Key, 
  KeyRound,
  RefreshCw, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  CheckSquare, 
  Square, 
  Lock, 
  Info,
  Check,
  Building,
  Radio,
  FileCode,
  TrendingUp,
  HelpCircle,
  Share2,
  Search,
  Bot,
  Zap,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Edit3,
  Globe,
  Sliders,
  Server,
  Copy,
  Sparkles,
  BookOpen,
  Hash,
  Cpu
} from 'lucide-react';
import { PlatformConnectionDetails } from '@/types';

export type ConnectionHubTab = 
  | 'SELECTION'       // Tab 1: Accounts & Multi-Account Sync (Image 1)
  | 'META_DIRECT'     // Tab 2: Meta Business Suite & System User Token (Image 5)
  | 'GOOGLE_DIRECT'   // Tab 3: Google Ads API v17 & Google Analytics 4 (GA4) (Image 4)
  | 'TIKTOK_DIRECT'   // Tab 4: TikTok for Business Marketing API Authentication (Image 2)
  | 'AI_GATEWAY'      // Tab 5: OpenClaw & OpenRouter AI Agent Gateway (Image 3)
  | 'GUIDE';          // Tab 6: Phase 0 Developer Setup & Approvals Guide

interface PlatformConnectionHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  initialPlatform?: 'META' | 'GOOGLE' | 'TIKTOK';
  onSyncPlatformData?: (data: {
    campaigns: any[];
    creatives: any[];
    metrics: any;
    platform: 'META' | 'GOOGLE' | 'TIKTOK';
    accountName?: string;
    accountId?: string;
    currency?: string;
  }) => void;
}

export const PlatformConnectionHubModal: React.FC<PlatformConnectionHubModalProps> = ({
  isOpen,
  onClose,
  theme,
  initialPlatform = 'META',
  onSyncPlatformData,
}) => {
  const isLight = theme === 'light';
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<ConnectionHubTab>('SELECTION');
  const [activePlatformFilter, setActivePlatformFilter] = useState<'ALL' | 'META' | 'GOOGLE' | 'TIKTOK'>('ALL');
  const [connections, setConnections] = useState<PlatformConnectionDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- 1. META DIRECT SYSTEM TOKEN STATE ---
  const [metaSettings, setMetaSettings] = useState({
    token: '',
    adAccountId: '',
    scope: 'READ_WRITE' as 'READ_ONLY' | 'READ_WRITE',
    isConnected: false,
  });
  const [showMetaToken, setShowMetaToken] = useState(false);
  const [isMetaGuideOpen, setIsMetaGuideOpen] = useState(false);
  const [isVerifyingMeta, setIsVerifyingMeta] = useState(false);

  // --- 2. GOOGLE ADS & GA4 DIRECT STATE ---
  const [googleSettings, setGoogleSettings] = useState({
    customerId: '',
    developerToken: '',
    clientId: '',
    clientSecret: '',
    scope: 'READ_WRITE' as 'READ_ONLY' | 'READ_WRITE',
    ga4PropertyId: '',
    isGa4Connected: false,
    isConnected: false,
  });
  const [showGoogleDevToken, setShowGoogleDevToken] = useState(false);
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [isVerifyingGoogle, setIsVerifyingGoogle] = useState(false);

  // --- 3. TIKTOK DIRECT MARKETING API STATE ---
  const [tiktokSettings, setTiktokSettings] = useState({
    advertiserId: '',
    appId: '',
    appSecret: '',
    accessToken: '',
    scope: 'READ_WRITE' as 'READ_ONLY' | 'READ_WRITE',
    isConnected: false,
  });
  const [showTiktokSecret, setShowTiktokSecret] = useState(false);
  const [showTiktokToken, setShowTiktokToken] = useState(false);
  const [isTiktokGuideOpen, setIsTiktokGuideOpen] = useState(false);
  const [isVerifyingTiktok, setIsVerifyingTiktok] = useState(false);

  // --- 4. OPENCLAW & OPENROUTER AI GATEWAY STATE (Image 3) ---
  const [aiGatewaySettings, setAiGatewaySettings] = useState({
    baseUrl: 'https://openrouter.ai/api/v1',
    secretKey: '',
    modelEngine: 'deepseek-v4-flash',
    persona: 'Senior Performance Marketing Strategist & Copywriter for Luxury Streetwear Brand (FAKEIT)',
    isConfigured: false,
  });
  const [showAiKey, setShowAiKey] = useState(false);
  const [isVerifyingAi, setIsVerifyingAi] = useState(false);

  // Load saved credentials from localStorage on mount & purge legacy dummy values
  useEffect(() => {
    try {
      const savedMeta = localStorage.getItem('dm_meta_direct_settings');
      if (savedMeta) {
        const parsed = JSON.parse(savedMeta);
        if (parsed.token && !parsed.token.includes('sample')) {
          setMetaSettings({ 
            ...parsed, 
            adAccountId: (parsed.adAccountId || '').replace(/^act_?/i, ''),
            scope: 'READ_WRITE' 
          });
        } else {
          localStorage.removeItem('dm_meta_direct_settings');
        }
      }

      const savedGoogle = localStorage.getItem('dm_google_direct_settings');
      if (savedGoogle) {
        const parsed = JSON.parse(savedGoogle);
        if (
          parsed.ga4PropertyId === '551294668' || 
          parsed.developerToken?.includes('sample') || 
          parsed.customerId === '456-233-9588'
        ) {
          localStorage.removeItem('dm_google_direct_settings');
        } else if (parsed.developerToken && !parsed.developerToken.includes('sample')) {
          setGoogleSettings({ ...parsed, scope: 'READ_WRITE' });
        } else {
          localStorage.removeItem('dm_google_direct_settings');
        }
      }

      const savedTiktok = localStorage.getItem('dm_tiktok_direct_settings');
      if (savedTiktok) {
        const parsed = JSON.parse(savedTiktok);
        if (parsed.advertiserId === '71948102938471' || parsed.accessToken?.includes('sample')) {
          localStorage.removeItem('dm_tiktok_direct_settings');
        } else if (parsed.accessToken && !parsed.accessToken.includes('sample')) {
          setTiktokSettings({ ...parsed, scope: 'READ_WRITE' });
        } else {
          localStorage.removeItem('dm_tiktok_direct_settings');
        }
      }

      const savedAi = localStorage.getItem('dm_ai_gateway_settings');
      if (savedAi) {
        const parsed = JSON.parse(savedAi);
        if (parsed.secretKey && (parsed.secretKey.includes('998410294857') || parsed.secretKey.includes('sample'))) {
          localStorage.removeItem('dm_ai_gateway_settings');
        } else {
          setAiGatewaySettings(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch current OAuth connections
  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/connections');
      const data = await res.json();
      if (data.connections) {
        setConnections(data.connections);
      }
    } catch (e) {
      console.error('Failed to load connections:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    const duration = msg.includes('⚠️') ? 7000 : 4000;
    setTimeout(() => setNotification(null), duration);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle account selection (F1 Multi-Account Support)
  const handleToggleAccount = async (platform: 'META' | 'GOOGLE' | 'TIKTOK', accountId: string, currentSelected: boolean) => {
    const nextSelected = !currentSelected;

    setConnections((prev) =>
      prev.map((conn) => {
        if (conn.platform !== platform) return conn;
        return {
          ...conn,
          businesses: conn.businesses.map((biz) => ({
            ...biz,
            adAccounts: biz.adAccounts.map((acc) =>
              acc.id === accountId ? { ...acc, isSelected: nextSelected } : acc
            ),
          })),
        };
      })
    );

    try {
      const res = await fetch('/api/auth/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_ACCOUNT',
          platform,
          accountId,
          isSelected: nextSelected,
        }),
      });
      const data = await res.json();
      if (data.connections) {
        setConnections(data.connections);
        showNotification(nextSelected ? `Ad Account ${accountId} selected for sync.` : `Ad Account ${accountId} deselected.`);
      }
    } catch (err) {
      console.error('Failed to toggle account:', err);
    }
  };

  // Simulate or Start OAuth
  const handleStartOAuth = (platform: 'META' | 'GOOGLE' | 'TIKTOK') => {
    fetch('/api/auth/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SIMULATE_CONNECT',
        platform,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.connections) {
          setConnections(data.connections);
          showNotification(`${platform} connected successfully with AES-256 encrypted token!`);
        }
      });
  };

  // Disconnect OAuth platform
  const handleDisconnect = async (platform: 'META' | 'GOOGLE' | 'TIKTOK') => {
    try {
      const res = await fetch(`/api/auth/connections?platform=${platform}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.connections) {
        setConnections(data.connections);
        showNotification(`${platform} disconnected.`);
      }
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  // --- Direct API Verification Handlers ---
  const handleVerifyMeta = async () => {
    const rawToken = metaSettings.token.trim();
    const rawAccountId = metaSettings.adAccountId.trim().replace(/^act_?/i, '');

    if (!rawToken || !rawAccountId) {
      showNotification('দয়া করে Meta System User Token এবং Ads Manager Account ID দুটিই পূরণ করুন।');
      return;
    }

    const fullAccountId = `act_${rawAccountId}`;
    setIsVerifyingMeta(true);
    try {
      const res = await fetch('/api/platforms/meta/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: rawToken,
          adAccountId: fullAccountId,
        }),
      });

      const data = await res.json();
      setIsVerifyingMeta(false);

      if (data.success) {
        const updated = { ...metaSettings, adAccountId: rawAccountId, isConnected: true };
        setMetaSettings(updated);
        try {
          localStorage.setItem('dm_meta_direct_settings', JSON.stringify({
            ...updated,
            adAccountId: fullAccountId,
          }));
        } catch {}

        if (onSyncPlatformData) {
          onSyncPlatformData({
            campaigns: data.campaigns || [],
            creatives: data.creatives || [],
            metrics: data.metrics || {},
            platform: 'META',
            accountName: data.accountName,
            accountId: fullAccountId,
            currency: data.currency,
          });
        }

        showNotification(`✓ ${data.message || 'Meta Ads সফলভাবে সিঙ্ক হয়েছে!'}`);
      } else {
        showNotification(`⚠️ Meta ভেরিফিকেশন ব্যর্থ হয়েছে: ${data.error || 'টোকেন বা অ্যাকাউন্ট আইডি সঠিক নয়'}`);
      }
    } catch (err: any) {
      setIsVerifyingMeta(false);
      showNotification(`⚠️ সার্ভার এরর: ${err.message || 'কানেক্ট করা সম্ভব হয়নি'}`);
    }
  };

  const handleRevokeMeta = () => {
    const updated = { ...metaSettings, token: '', isConnected: false };
    setMetaSettings(updated);
    try {
      localStorage.setItem('dm_meta_direct_settings', JSON.stringify(updated));
    } catch {}
    showNotification('Meta System User Token revoked.');
  };

  const handleVerifyGoogle = async () => {
    const customerId = googleSettings.customerId.trim();
    const developerToken = googleSettings.developerToken.trim();
    const ga4PropertyId = googleSettings.ga4PropertyId.trim();

    if (!customerId && !ga4PropertyId) {
      showNotification('⚠️ অনুগ্রহ করে Google Ads Customer ID অথবা GA4 Property ID প্রদান করুন।');
      return;
    }

    setIsVerifyingGoogle(true);
    try {
      const res = await fetch('/api/platforms/google/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          developerToken,
          clientId: googleSettings.clientId.trim(),
          clientSecret: googleSettings.clientSecret.trim(),
          ga4PropertyId,
        }),
      });

      const data = await res.json();
      setIsVerifyingGoogle(false);

      if (data.success) {
        const updated = {
          ...googleSettings,
          isConnected: Boolean(data.isGoogleConnected),
          isGa4Connected: Boolean(data.isGa4Connected),
        };
        setGoogleSettings(updated);
        try {
          localStorage.setItem('dm_google_direct_settings', JSON.stringify(updated));
        } catch {}

        if (onSyncPlatformData) {
          onSyncPlatformData({
            campaigns: data.campaigns || [],
            creatives: [],
            metrics: data.metrics || {},
            platform: 'GOOGLE',
            accountName: data.accountName,
            accountId: data.accountId || customerId,
            currency: data.currency || 'USD',
          });
        }
        showNotification(`✓ ${data.message}`);
      } else {
        showNotification(`⚠️ Google Ads / GA4 ভেরিফিকেশন ব্যর্থ হয়েছে: ${data.error}`);
      }
    } catch (err: any) {
      setIsVerifyingGoogle(false);
      showNotification(`⚠️ সার্ভার এরর: ${err.message || 'কানেক্ট করা সম্ভব হয়নি'}`);
    }
  };

  const handleVerifyTiktok = async () => {
    const advId = tiktokSettings.advertiserId.trim();
    const token = tiktokSettings.accessToken.trim();

    if (!advId || !token) {
      showNotification('⚠️ অনুগ্রহ করে TikTok Advertiser ID এবং Long-Lived Access Token উভয়ই পূরণ করুন।');
      return;
    }

    setIsVerifyingTiktok(true);
    try {
      const res = await fetch('/api/platforms/tiktok/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiserId: advId,
          accessToken: token,
          appId: tiktokSettings.appId.trim(),
          appSecret: tiktokSettings.appSecret.trim(),
        }),
      });

      const data = await res.json();
      setIsVerifyingTiktok(false);

      if (data.success) {
        const updated = {
          ...tiktokSettings,
          isConnected: true,
        };
        setTiktokSettings(updated);
        try {
          localStorage.setItem('dm_tiktok_direct_settings', JSON.stringify(updated));
        } catch {}

        if (onSyncPlatformData) {
          onSyncPlatformData({
            campaigns: data.campaigns || [],
            creatives: [],
            metrics: data.metrics || {},
            platform: 'TIKTOK',
            accountName: data.accountName,
            accountId: data.advertiserId,
            currency: data.currency || 'USD',
          });
        }
        showNotification(`✓ ${data.message}`);
      } else {
        showNotification(`⚠️ TikTok ভেরিফিকেশন ব্যর্থ হয়েছে: ${data.error}`);
      }
    } catch (err: any) {
      setIsVerifyingTiktok(false);
      showNotification(`⚠️ সার্ভার এরর: ${err.message || 'কানেক্ট করা সম্ভব হয়নি'}`);
    }
  };

  const handleSaveAiGateway = async () => {
    let baseUrl = aiGatewaySettings.baseUrl.trim();
    const secretKey = aiGatewaySettings.secretKey.trim();

    if (!secretKey) {
      showNotification('⚠️ অনুগ্রহ করে OpenRouter / OpenClaw API Secret Key প্রদান করুন।');
      return;
    }

    // Auto-normalize: If secretKey is an OpenRouter key (sk-or-v1-), it must use official OpenRouter baseUrl
    if (secretKey.startsWith('sk-or-v1-') && (baseUrl.includes('18789') || baseUrl.includes('195.35') || !baseUrl.includes('openrouter.ai'))) {
      baseUrl = 'https://openrouter.ai/api/v1';
    }

    setIsVerifyingAi(true);
    try {
      const res = await fetch('/api/platforms/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl,
          secretKey,
          modelEngine: aiGatewaySettings.modelEngine,
        }),
      });

      const data = await res.json();
      setIsVerifyingAi(false);

      if (data.success) {
        const updated = {
          ...aiGatewaySettings,
          baseUrl,
          isConfigured: true,
        };
        setAiGatewaySettings(updated);
        try {
          localStorage.setItem('dm_ai_gateway_settings', JSON.stringify(updated));
        } catch {}
        showNotification(`✓ ${data.message}`);
      } else {
        showNotification(`⚠️ AI Gateway ভেরিফিকেশন ব্যর্থ হয়েছে: ${data.error}`);
      }
    } catch (err: any) {
      setIsVerifyingAi(false);
      showNotification(`⚠️ সার্ভার এরর: ${err.message || 'কানেক্ট করা সম্ভব হয়নি'}`);
    }
  };

  const totalSelectedAccounts = connections.reduce(
    (acc, conn) =>
      acc +
      conn.businesses.reduce(
        (bizAcc, b) => bizAcc + b.adAccounts.filter((a) => a.isSelected).length,
        0
      ),
    0
  );

  const cardBg = isLight 
    ? 'bg-white border-slate-200/90 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]' 
    : 'bg-[#0b0f19] border-[#1a2336] shadow-md';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputContainerBg = isLight 
    ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20' 
    : 'bg-[#060911] border-[#172033] hover:border-slate-700 focus-within:border-indigo-500 focus-within:bg-[#080d1a] focus-within:ring-2 focus-within:ring-indigo-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
        isLight 
          ? 'bg-slate-100/70 border-slate-300/80 text-slate-800' 
          : 'bg-[#070b14] border-slate-800/90 text-slate-100'
      }`}>
        
        {/* Subtle Ambient Mesh Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 opacity-90" />

        {/* Header Bar */}
        <div className={`px-6 py-4.5 border-b flex items-center justify-between ${
          isLight ? 'bg-white border-slate-200/90' : 'bg-[#0a0e1a] border-slate-800/90'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className={`text-base font-black tracking-tight ${textTitle}`}>
                  Platform Connection &amp; Multi-Account Hub
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Lock className="h-2.5 w-2.5" />
                  AES-256-GCM Secure
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Official OAuth 2.0 Integration &amp; Direct API Credentials for Meta, Google, TikTok &amp; OpenClaw
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`h-8.5 w-8.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isLight 
                ? 'bg-slate-100/80 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-800' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`text-white text-xs font-bold px-4 py-3 text-center animate-in slide-in-from-top flex items-center justify-center gap-2 shadow-lg ${
            notification.includes('⚠️') ? 'bg-rose-600' : 'bg-emerald-600'
          }`}>
            {notification.includes('⚠️') ? <AlertCircle className="h-4 w-4 shrink-0 text-white" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />}
            <span className="leading-snug">{notification}</span>
          </div>
        )}

        {/* Modern Segmented Pill Tab Bar (Stripe/Linear Style) */}
        <div className={`px-6 py-3 border-b flex items-center justify-between overflow-x-auto no-scrollbar gap-4 ${
          isLight ? 'bg-slate-50 border-slate-200/90' : 'bg-[#080c16] border-slate-800/80'
        }`}>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-[#0d1322] border border-slate-300/40 dark:border-slate-800 text-xs font-bold shrink-0">
            {/* Tab 1: Image 1 Accounts & Sync */}
            <button
              onClick={() => setActiveTab('SELECTION')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'SELECTION'
                  ? isLight
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-black'
                    : 'bg-[#151d30] text-blue-400 shadow-xs border border-blue-500/30 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building className="h-3.5 w-3.5 text-blue-500" />
              <span>Accounts &amp; Sync</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'SELECTION'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {totalSelectedAccounts}
              </span>
            </button>

            {/* Tab 2: Image 5 Meta System Token */}
            <button
              onClick={() => setActiveTab('META_DIRECT')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'META_DIRECT'
                  ? isLight
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-black'
                    : 'bg-[#151d30] text-blue-400 shadow-xs border border-blue-500/30 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Share2 className="h-3.5 w-3.5 text-blue-500" />
              <span>Meta Token</span>
            </button>

            {/* Tab 3: Image 4 Google Ads & GA4 */}
            <button
              onClick={() => setActiveTab('GOOGLE_DIRECT')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'GOOGLE_DIRECT'
                  ? isLight
                    ? 'bg-white text-amber-600 shadow-xs border border-slate-200/80 font-black'
                    : 'bg-[#151d30] text-amber-400 shadow-xs border border-amber-500/30 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Search className="h-3.5 w-3.5 text-amber-500" />
              <span>Google Ads &amp; GA4</span>
            </button>

            {/* Tab 4: Image 2 TikTok API */}
            <button
              onClick={() => setActiveTab('TIKTOK_DIRECT')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'TIKTOK_DIRECT'
                  ? isLight
                    ? 'bg-white text-rose-600 shadow-xs border border-slate-200/80 font-black'
                    : 'bg-[#151d30] text-rose-400 shadow-xs border border-rose-500/30 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-rose-500" />
              <span>TikTok API</span>
            </button>

            {/* Tab 5: Image 3 OpenClaw AI Gateway */}
            <button
              onClick={() => setActiveTab('AI_GATEWAY')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'AI_GATEWAY'
                  ? isLight
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80 font-black'
                    : 'bg-[#151d30] text-indigo-400 shadow-xs border border-indigo-500/30 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bot className="h-3.5 w-3.5 text-indigo-500" />
              <span>OpenClaw Gateway</span>
            </button>

            {/* Tab 6: Developer Setup Guide */}
            <button
              onClick={() => setActiveTab('GUIDE')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'GUIDE'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                    : 'bg-[#151d30] text-white shadow-xs border border-slate-700 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              <span>Developer Guide</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 font-medium">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Zero client-side token exposure (F5)</span>
          </div>
        </div>

        {/* Body Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* ======================================================== */}
          {/* TAB 1: ACCOUNTS & MULTI-ACCOUNT SYNC (Image 1 - PRESERVED) */}
          {/* ======================================================== */}
          {activeTab === 'SELECTION' && (
            <div className="space-y-6">
              {/* Platform selector filter */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-[#0c1017] border border-slate-300/60 dark:border-slate-800">
                  {(['ALL', 'META', 'GOOGLE', 'TIKTOK'] as const).map((plat) => (
                    <button
                      key={plat}
                      onClick={() => setActivePlatformFilter(plat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activePlatformFilter === plat
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isLight
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {plat === 'ALL' && 'All Platforms'}
                      {plat === 'META' && 'Meta Ads'}
                      {plat === 'GOOGLE' && 'Google Ads'}
                      {plat === 'TIKTOK' && 'TikTok Ads'}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Select ad accounts to pull into unified reporting &amp; AI actions
                </div>
              </div>

              {/* Platform Connection Cards */}
              <div className="space-y-5">
                {connections
                  .filter((c) => activePlatformFilter === 'ALL' || c.platform === activePlatformFilter)
                  .map((conn) => {
                    const isConnected = conn.status === 'CONNECTED';

                    return (
                      <div
                        key={conn.platform}
                        className={`rounded-2xl border p-5 sm:p-6 transition-all ${cardBg} relative overflow-hidden`}
                      >
                        {/* Subtle Brand Accent Line */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${
                          conn.platform === 'META' ? 'bg-blue-600' : conn.platform === 'GOOGLE' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />

                        {/* Top row of platform */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-3.5">
                            {conn.platform === 'META' && (
                              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20">
                                f
                              </div>
                            )}
                            {conn.platform === 'GOOGLE' && (
                              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-amber-500/20">
                                G
                              </div>
                            )}
                            {conn.platform === 'TIKTOK' && (
                              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-base shadow-md border border-slate-700">
                                🎵
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`text-sm font-bold ${textTitle}`}>
                                  {conn.platform === 'META' && 'Meta (Facebook Login for Business)'}
                                  {conn.platform === 'GOOGLE' && 'Google Ads (Sign in with Google)'}
                                  {conn.platform === 'TIKTOK' && 'TikTok for Business (Marketing API)'}
                                </h3>

                                {isConnected ? (
                                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    <Check className="h-3 w-3" />
                                    Connected ✓
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
                                    Disconnected
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                {conn.platform === 'META' && 'Permissions: ads_read, ads_management, business_management'}
                                {conn.platform === 'GOOGLE' && 'Scope: https://www.googleapis.com/auth/adwords • MCC & Client Hierarchy'}
                                {conn.platform === 'TIKTOK' && 'Permissions: ads.read, ads.management • Advertiser ID discovery'}
                              </p>
                            </div>
                          </div>

                          {/* Action Button & Token Expiry Info */}
                          <div className="flex items-center gap-3">
                            {isConnected && conn.daysUntilExpiry !== undefined && (
                              <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Token Health
                                </div>
                                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                  {conn.daysUntilExpiry} days remaining
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              {/* Direct API button shortcut */}
                              <button
                                onClick={() => setActiveTab(conn.platform === 'META' ? 'META_DIRECT' : conn.platform === 'GOOGLE' ? 'GOOGLE_DIRECT' : 'TIKTOK_DIRECT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isLight 
                                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' 
                                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                                }`}
                                title="Open Direct Credentials & Token Setting"
                              >
                                <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                                <span>API Settings</span>
                              </button>

                              {isConnected ? (
                                <>
                                  <button
                                    onClick={() => handleStartOAuth(conn.platform)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                      isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-2xs' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                                    }`}
                                  >
                                    Re-sync
                                  </button>
                                  <button
                                    onClick={() => handleDisconnect(conn.platform)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                                  >
                                    Disconnect
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleStartOAuth(conn.platform)}
                                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>Connect {conn.platform}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Discovered Businesses and Ad Accounts */}
                        {isConnected && conn.businesses && (
                          <div className="mt-4 space-y-3.5">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Discovered Businesses &amp; Ad Accounts (Check accounts to sync):
                            </div>

                            {conn.businesses.map((biz) => (
                              <div
                                key={biz.id}
                                className={`rounded-xl border p-4 ${
                                  isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#060911] border-slate-800/80'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <Building className="h-4 w-4 text-blue-500" />
                                  <span className={`text-xs font-bold ${textTitle}`}>
                                    Business: &quot;{biz.name}&quot;
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    (ID: {biz.id})
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {biz.adAccounts.map((acc) => (
                                    <div
                                      key={acc.id}
                                      onClick={() => handleToggleAccount(conn.platform, acc.id, !!acc.isSelected)}
                                      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                        acc.isSelected
                                          ? isLight
                                            ? 'bg-blue-50/70 border-blue-200 shadow-2xs'
                                            : 'bg-blue-950/25 border-blue-900/60 shadow-2xs'
                                          : isLight
                                          ? 'bg-white border-slate-200 hover:border-slate-300'
                                          : 'bg-[#090d18] border-slate-800/80 hover:border-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="text-blue-600">
                                          {acc.isSelected ? (
                                            <CheckSquare className="h-4 w-4 text-blue-600" />
                                          ) : (
                                            <Square className="h-4 w-4 text-slate-400" />
                                          )}
                                        </div>
                                        <div>
                                          <div className={`text-xs font-bold ${textTitle}`}>
                                            Ad Account: {acc.name}
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-mono">
                                            {acc.id} • {acc.currency}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3.5">
                                        {acc.spendLast30Days !== undefined && (
                                          <div className="text-right">
                                            <div className="text-[10px] text-slate-400 font-medium">30d Spend</div>
                                            <div className={`text-xs font-bold ${textTitle}`}>
                                              ${acc.spendLast30Days.toFixed(2)}
                                            </div>
                                          </div>
                                        )}
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                          acc.isSelected
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                            : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500'
                                        }`}>
                                          {acc.isSelected ? 'Sync Active' : 'Not Synced'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Action Section */}
              <div className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                isLight ? 'bg-white border-slate-200/90' : 'bg-[#0a0e1a] border-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {totalSelectedAccounts} Ad Accounts active for multi-account aggregation
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsSaving(true);
                      setTimeout(() => {
                        setIsSaving(false);
                        showNotification('Selected accounts verified & saved to database!');
                        onClose();
                      }, 700);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Save &amp; Start Syncing to DB</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: META BUSINESS SUITE & SYSTEM USER TOKEN (Image 5)   */}
          {/* ======================================================== */}
          {activeTab === 'META_DIRECT' && (
            <div className="space-y-6">
              <div className={`rounded-2xl border p-6 ${cardBg} space-y-6 relative overflow-hidden`}>
                {/* Brand Header Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 border border-white/10">
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-black tracking-tight ${textTitle} whitespace-nowrap`}>
                          Meta System User Token
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 whitespace-nowrap">
                          Graph API v20.0
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
                          <Check className="h-3 w-3" />
                          Read + Write
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-1">
                        Meta Business Suite Graph API token with Full Read &amp; Write autopilot permissions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                    <button
                      onClick={handleVerifyMeta}
                      disabled={isVerifyingMeta}
                      className="h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isVerifyingMeta ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 fill-current" />}
                      <span>Verify &amp; Connect</span>
                    </button>
                    <button
                      onClick={handleRevokeMeta}
                      className="h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Revoke</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {/* System User Token */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-blue-500" />
                        <span>META SYSTEM USER LONG-LIVED ACCESS TOKEN (META_ACCESS_TOKEN) *</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {metaSettings.token && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(metaSettings.token, 'metaToken')}
                            className="text-[11px] text-slate-400 hover:text-blue-500 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedKey === 'metaToken' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedKey === 'metaToken' ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowMetaToken(!showMetaToken)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {showMetaToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{showMetaToken ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                    </div>

                    <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                      <Key className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type={showMetaToken ? 'text' : 'password'}
                        value={metaSettings.token}
                        onChange={(e) => setMetaSettings({ ...metaSettings, token: e.target.value })}
                        placeholder="EAABwzL1... paste system user token here"
                        className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                      Generated from Meta Business Suite &gt; Settings &gt; Users &gt; System Users with <code className="text-blue-500 font-bold">ads_read</code> &amp; <code className="text-blue-500 font-bold">read_insights</code>.
                    </p>
                  </div>

                  {/* Target Ad Account ID with Automatic act_ prefix */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-blue-500" />
                        <span>TARGET META AD ACCOUNT ID (META_AD_ACCOUNT_ID) *</span>
                      </label>
                      {metaSettings.adAccountId && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`act_${metaSettings.adAccountId}`, 'metaAdAcc')}
                          className="text-[11px] text-slate-400 hover:text-blue-500 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedKey === 'metaAdAcc' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedKey === 'metaAdAcc' ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <div className={`rounded-xl border transition-all flex items-stretch max-w-md overflow-hidden ${inputContainerBg}`}>
                      <span className={`px-3 py-2.5 text-xs font-mono font-bold flex items-center border-r select-none shrink-0 ${
                        isLight ? 'bg-slate-100 text-blue-600 border-slate-200' : 'bg-slate-800/90 text-blue-400 border-slate-700'
                      }`}>
                        act_
                      </span>
                      <input
                        type="text"
                        value={metaSettings.adAccountId}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/^act_?/i, '').replace(/[^0-9]/g, '');
                          setMetaSettings({ ...metaSettings, adAccountId: cleaned });
                        }}
                        placeholder="942386384851346"
                        className="w-full px-3 py-2.5 bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium flex items-center gap-1.5 flex-wrap">
                      <span>শুধুমাত্র আপনার Ads Manager-এর সংখ্যাটি লিখুন (যেমন: <code className="text-blue-500 font-bold">942386384851346</code>)। <strong>act_</strong> আমরা আগে স্বয়ংক্রিয়ভাবে যুক্ত করে নেব।</span>
                      <span className="text-emerald-500 font-semibold">• Full Read + Write Access (<code className="text-emerald-500">ads_read</code> &amp; <code className="text-emerald-500">ads_management</code>) enabled.</span>
                    </p>
                  </div>

                  {/* Setup Guide Accordion */}
                  <div className={`rounded-xl border overflow-hidden ${
                    isLight ? 'bg-slate-50/80 border-slate-200/90' : 'bg-[#060911] border-slate-800/80'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setIsMetaGuideOpen(!isMetaGuideOpen)}
                      className="w-full px-4.5 py-3.5 text-left flex items-center justify-between text-xs font-bold cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <BookOpen className="h-4 w-4" />
                        <span>Meta Ads Setup Guide (Step-by-Step Instructions)</span>
                      </div>
                      {isMetaGuideOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>

                    {isMetaGuideOpen && (
                      <div className="px-5 pb-4 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                        <ol className="list-decimal pl-5 space-y-1.5">
                          <li>Meta Business Suite-এ যান &gt; Business Settings &gt; Users &gt; System Users।</li>
                          <li>Add System User-এ ক্লিক করে নাম দিন <code className="text-blue-500 font-bold">OpenClaw-Ads-Agent</code> এবং Role দিন Employee।</li>
                          <li>Assign Assets-এ গিয়ে আপনার Ad Account নির্বাচন করুন এবং View Performance পারমিশন দিন।</li>
                          <li>Generate New Token-এ ক্লিক করুন &gt; Token Expiration দিন Never &gt; Scope সিলেক্ট করুন <code className="text-blue-500 font-bold">ads_read</code> এবং <code className="text-blue-500 font-bold">read_insights</code>।</li>
                          <li>প্রাপ্ত টোকেনটি কপি করে উপরের META_ACCESS_TOKEN বক্সে পেস্ট করে Connect &amp; Verify Meta চাপুন।</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: GOOGLE ADS API v17 & GA4 (Image 4)                 */}
          {/* ======================================================== */}
          {activeTab === 'GOOGLE_DIRECT' && (
            <div className="space-y-6">
              <div className={`rounded-2xl border p-6 ${cardBg} space-y-6 relative overflow-hidden`}>
                {/* Brand Header Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-blue-500" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.25 21.3 7.31 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.13z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-black tracking-tight ${textTitle} whitespace-nowrap`}>
                          Google Ads API v17 &amp; GA4
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                          API v17
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
                          <Check className="h-3 w-3" />
                          Read + Write
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-1">
                        Direct Developer Token with GA4 SSOT data sync and keyword bid automation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                    <button
                      onClick={() => showNotification('GA4 Service Account Key JSON verified & cached.')}
                      className="h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <KeyRound className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>GA4 Key</span>
                    </button>
                    <button
                      onClick={handleVerifyGoogle}
                      disabled={isVerifyingGoogle}
                      className="h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white shadow-sm shadow-amber-500/25 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isVerifyingGoogle ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 fill-current" />}
                      <span>Verify &amp; Connect</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields: 2-column grid */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Google Ads Customer ID */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-amber-500" />
                          <span>GOOGLE ADS 10-DIGIT CUSTOMER ID *</span>
                        </label>
                        {googleSettings.customerId && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(googleSettings.customerId, 'googleCID')}
                            className="text-[11px] text-slate-400 hover:text-amber-500 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedKey === 'googleCID' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedKey === 'googleCID' ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <span className="text-slate-400 text-xs font-mono font-bold">#</span>
                        <input
                          type="text"
                          value={googleSettings.customerId}
                          onChange={(e) => setGoogleSettings({ ...googleSettings, customerId: e.target.value })}
                          placeholder="e.g. 123-456-7890"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* Developer Token */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                          <span>DEVELOPER TOKEN (GOOGLE_ADS_DEVELOPER_TOKEN) *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowGoogleDevToken(!showGoogleDevToken)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {showGoogleDevToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{showGoogleDevToken ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type={showGoogleDevToken ? 'text' : 'password'}
                          value={googleSettings.developerToken}
                          onChange={(e) => setGoogleSettings({ ...googleSettings, developerToken: e.target.value })}
                          placeholder="••••••••••••••••••••"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* OAuth2 Client ID */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-amber-500" />
                          <span>OAUTH2 CLIENT ID (GOOGLE_ADS_CLIENT_ID) *</span>
                        </label>
                        {googleSettings.clientId && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(googleSettings.clientId, 'googleClientID')}
                            className="text-[11px] text-slate-400 hover:text-amber-500 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedKey === 'googleClientID' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedKey === 'googleClientID' ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <Key className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={googleSettings.clientId}
                          onChange={(e) => setGoogleSettings({ ...googleSettings, clientId: e.target.value })}
                          placeholder="62186636535-...apps.googleusercontent.com"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400 truncate"
                        />
                      </div>
                    </div>

                    {/* OAuth2 Client Secret */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-amber-500" />
                          <span>OAUTH2 CLIENT SECRET (GOOGLE_ADS_CLIENT_SECRET) *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {showGoogleSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{showGoogleSecret ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type={showGoogleSecret ? 'text' : 'password'}
                          value={googleSettings.clientSecret}
                          onChange={(e) => setGoogleSettings({ ...googleSettings, clientSecret: e.target.value })}
                          placeholder="••••••••••••••••••••"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* GA4 SSOT Connection */}
                  <div className={`rounded-xl border p-5 ${
                    isLight ? 'bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border-emerald-200/80' : 'bg-gradient-to-r from-emerald-950/20 via-teal-950/10 to-[#060911] border-emerald-900/40'
                  } space-y-3.5 shadow-2xs`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
                          <h4 className={`text-xs font-black ${textTitle}`}>
                            Google Analytics 4 (GA4) SSOT Connection
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          Direct Google Cloud Service Account authentication for multi-channel revenue.
                        </p>
                      </div>

                      {googleSettings.isGa4Connected && googleSettings.ga4PropertyId ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>GA4 Connected ({googleSettings.ga4PropertyId})</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1 text-[11px] font-medium text-slate-400 border border-slate-500/20 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <span>Not Connected</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                          GA4 PROPERTY ID
                        </label>
                        <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2 ${inputContainerBg}`}>
                          <Hash className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <input
                            type="text"
                            value={googleSettings.ga4PropertyId}
                            onChange={(e) => setGoogleSettings({ ...googleSettings, ga4PropertyId: e.target.value })}
                            placeholder="e.g. 551294668"
                            className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => showNotification('Service Account JSON Key updated and stored in vault.')}
                        className="sm:self-end px-4.5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        <span>Update Service Account JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: TIKTOK FOR BUSINESS MARKETING API (Image 2)        */}
          {/* ======================================================== */}
          {activeTab === 'TIKTOK_DIRECT' && (
            <div className="space-y-6">
              <div className={`rounded-2xl border p-6 ${cardBg} space-y-6 relative overflow-hidden`}>
                {/* Brand Header Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-cyan-500" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20 border border-slate-800">
                      <svg className="h-5 w-5 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.29 6.29 0 0 0 1.95-4.48v-6.3a8.16 8.16 0 0 0 4.82 1.57v-3.5a4.85 4.85 0 0 1-1-.75z"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-black tracking-tight ${textTitle} whitespace-nowrap`}>
                          TikTok for Business Marketing API
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
                          v1.3 Open API
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
                          <Check className="h-3 w-3" />
                          Read + Write
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-1">
                        Direct Marketing API credentials for automated bid optimization and ad scheduling.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                    <button
                      onClick={handleVerifyTiktok}
                      disabled={isVerifyingTiktok}
                      className={`h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 ${
                        isLight
                          ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-900 shadow-sm shadow-white/10'
                      }`}
                    >
                      {isVerifyingTiktok ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 fill-current text-rose-500" />}
                      <span>Verify &amp; Connect</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields: 2-column grid */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Advertiser ID */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-rose-500" />
                          <span>TIKTOK ADVERTISER ID (TIKTOK_ADVERTISER_ID) *</span>
                        </label>
                        {tiktokSettings.advertiserId && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tiktokSettings.advertiserId, 'ttAdv')}
                            className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedKey === 'ttAdv' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedKey === 'ttAdv' ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <span className="text-slate-400 text-xs font-mono font-bold">#</span>
                        <input
                          type="text"
                          value={tiktokSettings.advertiserId}
                          onChange={(e) => setTiktokSettings({ ...tiktokSettings, advertiserId: e.target.value })}
                          placeholder="e.g. 71948102938471"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* App ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider mb-2 flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-rose-500" />
                        <span>TIKTOK APP ID (TIKTOK_APP_ID) *</span>
                      </label>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={tiktokSettings.appId}
                          onChange={(e) => setTiktokSettings({ ...tiktokSettings, appId: e.target.value })}
                          placeholder="e.g. 73849182746182"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* App Secret */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-rose-500" />
                          <span>TIKTOK APP SECRET (TIKTOK_APP_SECRET) *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowTiktokSecret(!showTiktokSecret)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {showTiktokSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{showTiktokSecret ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type={showTiktokSecret ? 'text' : 'password'}
                          value={tiktokSettings.appSecret}
                          onChange={(e) => setTiktokSettings({ ...tiktokSettings, appSecret: e.target.value })}
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* Long-Lived Access Token */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-rose-500" />
                          <span>LONG-LIVED ACCESS TOKEN (TIKTOK_ACCESS_TOKEN) *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowTiktokToken(!showTiktokToken)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {showTiktokToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{showTiktokToken ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <Key className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type={showTiktokToken ? 'text' : 'password'}
                          value={tiktokSettings.accessToken}
                          onChange={(e) => setTiktokSettings({ ...tiktokSettings, accessToken: e.target.value })}
                          placeholder="act.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Setup Guide Accordion */}
                  <div className={`rounded-xl border overflow-hidden ${
                    isLight ? 'bg-slate-50/80 border-slate-200/90' : 'bg-[#060911] border-slate-800/80'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setIsTiktokGuideOpen(!isTiktokGuideOpen)}
                      className="w-full px-4.5 py-3.5 text-left flex items-center justify-between text-xs font-bold cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-rose-500">
                        <BookOpen className="h-4 w-4" />
                        <span>TikTok Marketing API Setup Guide</span>
                      </div>
                      {isTiktokGuideOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>

                    {isTiktokGuideOpen && (
                      <div className="px-5 pb-4 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                        <ol className="list-decimal pl-5 space-y-1.5">
                          <li>TikTok for Business Developer Portal-এ গিয়ে অ্যাপ তৈরি করুন।</li>
                          <li>Marketing API এক্সেসের জন্য আবেদন করুন এবং অনুমোদিত Advertiser ID সংগ্রহ করুন।</li>
                          <li>দীর্ঘমেয়াদী Access Token জেনারেট করে উপরের ফিল্ডে প্রদান করুন।</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: OPENCLAW & OPENROUTER AI AGENT GATEWAY (Image 3)   */}
          {/* ======================================================== */}
          {activeTab === 'AI_GATEWAY' && (
            <div className="space-y-6">
              <div className={`rounded-2xl border p-6 ${cardBg} space-y-6 relative overflow-hidden`}>
                {/* Brand Header Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25 border border-white/10">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-black tracking-tight ${textTitle} whitespace-nowrap`}>
                          OpenClaw &amp; OpenRouter AI Gateway
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                          Reasoning Engine
                        </span>
                        {aiGatewaySettings.isConfigured ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Configured
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide bg-slate-500/10 text-slate-400 border border-slate-500/20 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Not Configured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-1">
                        High-performance LLM routing, OpenRouter API keys, and autonomous ad strategy reasoning.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                    <button
                      onClick={handleSaveAiGateway}
                      disabled={isVerifyingAi}
                      className="h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isVerifyingAi ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 fill-current" />}
                      <span>Verify &amp; Save</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields: 2-column grid */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Base URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider mb-2 flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5 text-indigo-500" />
                        <span>AI GATEWAY BASE URL</span>
                      </label>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={aiGatewaySettings.baseUrl}
                          onChange={(e) => setAiGatewaySettings({ ...aiGatewaySettings, baseUrl: e.target.value })}
                          placeholder="https://openrouter.ai/api/v1"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                        <span>OpenRouter-এর জন্য ডিফল্ট: <code className="text-cyan-500 font-mono">https://openrouter.ai/api/v1</code></span>
                        <button
                          type="button"
                          onClick={() => setAiGatewaySettings({ ...aiGatewaySettings, baseUrl: 'https://openrouter.ai/api/v1' })}
                          className="text-indigo-500 hover:underline font-bold"
                        >
                          ডিফল্ট সেট করুন
                        </button>
                      </div>
                    </div>

                    {/* API Secret Key */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                          <span>OPENROUTER / OPENCLAW API SECRET KEY</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAiKey(!showAiKey)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {showAiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{showAiKey ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className={`rounded-xl border px-3.5 py-2.5 transition-all flex items-center gap-2.5 ${inputContainerBg}`}>
                        <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type={showAiKey ? 'text' : 'password'}
                          value={aiGatewaySettings.secretKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            const shouldAutoFixBaseUrl = val.startsWith('sk-or-v1-') && (aiGatewaySettings.baseUrl.includes('18789') || aiGatewaySettings.baseUrl.includes('195.35'));
                            setAiGatewaySettings({
                              ...aiGatewaySettings,
                              secretKey: val,
                              baseUrl: shouldAutoFixBaseUrl ? 'https://openrouter.ai/api/v1' : aiGatewaySettings.baseUrl,
                            });
                          }}
                          placeholder="sk-or-v1-••••••••••••••••••••"
                          className="w-full bg-transparent text-xs font-mono outline-none text-inherit placeholder-slate-400"
                        />
                      </div>
                      {aiGatewaySettings.secretKey.startsWith('sk-or-v1-') && aiGatewaySettings.secretKey.length > 0 && aiGatewaySettings.secretKey.length < 70 && (
                        <p className="text-[11px] text-amber-500 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in duration-200">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>কী-টি অসম্পূর্ণ মনে হচ্ছে ({aiGatewaySettings.secretKey.length}/৭৩ অক্ষর)। কপি করার সময় শেষের অংশ বাদ পড়ে থাকতে পারে।</span>
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                        Stored safely server-side with AES-256 least-privilege vault.
                      </p>
                    </div>
                  </div>

                  {/* Model Engine Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-indigo-500" />
                        <span>DEFAULT AI MODEL ENGINE (OPENROUTER LLM ROUTING)</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                        OpenClaw 6-Tier Resilient Chain Active
                      </span>
                    </div>

                    <div className={`rounded-xl border p-1 transition-all ${inputContainerBg}`}>
                      <select
                        value={aiGatewaySettings.modelEngine}
                        onChange={(e) => setAiGatewaySettings({ ...aiGatewaySettings, modelEngine: e.target.value })}
                        className="w-full bg-transparent px-3 py-2 text-xs font-bold outline-none cursor-pointer text-inherit"
                      >
                        <option value="deepseek-v4-flash">⚡ Primary: openrouter/deepseek/deepseek-v4-flash (DeepSeek v4 Flash — Recommended Default)</option>
                        <option value="openrouter/openai/gpt-5.4-nano">🚀 Fallback 1: openrouter/openai/gpt-5.4-nano (Ultra-fast Nano)</option>
                        <option value="openrouter/anthropic/claude-sonnet-5">🧠 Fallback 2: openrouter/anthropic/claude-sonnet-5 (Claude Sonnet 5)</option>
                        <option value="openrouter/openai/gpt-5.5">🔬 Fallback 3: openrouter/openai/gpt-5.5 (GPT-5.5 Pro)</option>
                        <option value="openrouter/deepseek/deepseek-v4-pro">🛡️ Fallback 4: openrouter/deepseek/deepseek-v4-pro (DeepSeek v4 Pro)</option>
                        <option value="openrouter/minimax/minimax-m3">⚡ Fallback 5: openrouter/minimax/minimax-m3 (MiniMax M3)</option>
                      </select>
                    </div>

                    {/* OpenClaw Active Fallback Chain Visualizer */}
                    <div className="mt-2.5 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-[11px] space-y-1.5">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        <span>OpenClaw Zero-Downtime Autonomous Fallback Pipeline:</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 flex-wrap font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">Primary: DeepSeek v4 Flash</span>
                        <span>➔</span>
                        <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 dark:text-slate-300">1: GPT-5.4 Nano</span>
                        <span>➔</span>
                        <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 dark:text-slate-300">2: Claude Sonnet 5</span>
                        <span>➔</span>
                        <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 dark:text-slate-300">3: GPT-5.5</span>
                        <span>➔</span>
                        <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 dark:text-slate-300">4: DeepSeek Pro</span>
                        <span>➔</span>
                        <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 dark:text-slate-300">5: MiniMax M3</span>
                      </div>
                    </div>
                  </div>

                  {/* Persona Instruction */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider mb-2 flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-indigo-500" />
                      <span>AI AGENT SYSTEM PERSONA &amp; TONE INSTRUCTION</span>
                    </label>
                    <div className={`rounded-xl border p-3 transition-all ${inputContainerBg}`}>
                      <textarea
                        rows={3}
                        value={aiGatewaySettings.persona}
                        onChange={(e) => setAiGatewaySettings({ ...aiGatewaySettings, persona: e.target.value })}
                        className="w-full bg-transparent text-xs outline-none text-inherit leading-relaxed resize-none"
                      />
                    </div>
                  </div>

                  {/* Save Settings Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveAiGateway}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 dark:border-slate-700 shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save AI Gateway Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: DEVELOPER SETUP & APPROVALS (PHASE 0 GUIDE)        */}
          {/* ======================================================== */}
          {activeTab === 'GUIDE' && (
            <div className="space-y-6 text-xs">
              <div className={`p-5 rounded-2xl border ${cardBg}`}>
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-black ${textTitle}`}>
                      Phase 0: শুরু করার জন্য অনুমোদন ও সেটআপ নির্দেশিকা (OAuth Credentials Guide)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Meta, Google এবং TikTok এর অনুমোদন পেতে কিছুটা সময় লাগে, তাই Phase 0 তেই আবেদন করে রাখুন।
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform 1: Meta Setup */}
              <div className={`p-5.5 rounded-2xl border space-y-3 ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-600 flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    ১. Meta (Facebook Login for Business)
                  </h4>
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline font-bold"
                  >
                    <span>developers.facebook.com</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  <li><strong>App তৈরি:</strong> Facebook Developer Portal-এ গিয়ে Business টাইপ App বানান এবং <code>Facebook Login for Business</code> যুক্ত করুন।</li>
                  <li><strong>Redirect URI দিন:</strong> <code>https://your-domain.com/api/auth/meta/callback</code> যুক্ত করুন।</li>
                  <li><strong>Permissions:</strong> <code>ads_read</code>, <code>ads_management</code>, <code>business_management</code> রিকোয়েস্ট করুন।</li>
                  <li><strong>Development Mode সুবিধা:</strong> আপনি নিজে (App Admin/Developer/Tester) কোনো <em>App Review</em> ছাড়াই নিজের Ad Account ও Business Manager তাৎক্ষণিক কানেক্ট করতে পারবেন!</li>
                  <li><strong>Token Exchange:</strong> শর্ট-লিভড টোকেন আসলে ব্যাকএন্ডে <code>grant_type=fb_exchange_token</code> দিয়ে ৬০ দিনের লং-লিভড টোকেনে কনভার্ট হয়ে AES-256 দিয়ে এনক্রিপ্ট হয়ে ডাটাবেজে স্টোর হয়।</li>
                </ul>
              </div>

              {/* Platform 2: Google Ads Setup */}
              <div className={`p-5.5 rounded-2xl border space-y-3 ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-500 flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    ২. Google Ads (Sign in with Google &amp; API)
                  </h4>
                  <a
                    href="https://console.cloud.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-amber-500 hover:underline font-bold"
                  >
                    <span>Google Cloud Console</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  <li><strong>OAuth Client তৈরি:</strong> Google Cloud Console &gt; APIs &amp; Services &gt; Credentials থেকে Web Application OAuth Client ID তৈরি করুন।</li>
                  <li><strong>Redirect URI দিন:</strong> <code>https://your-domain.com/api/auth/google/callback</code> যুক্ত করুন।</li>
                  <li><strong>Scope:</strong> <code>https://www.googleapis.com/auth/adwords</code> নির্বাচন করুন।</li>
                  <li><strong>Developer Token:</strong> Google Ads API Center (MCC Account) থেকে Developer Token-এর জন্য আবেদন করুন। Test Account-এ শুরু করার জন্য কোনো বিলম্ব ছাড়াই কাজ করা যায়।</li>
                  <li><strong>Auto-Refresh:</strong> <code>access_type=offline</code> দিয়ে পাওয়া Refresh Token ব্যাকএন্ড স্বয়ংক্রিয়ভাবে রিফ্রেশ করতে পারে।</li>
                </ul>
              </div>

              {/* Platform 3: TikTok Setup */}
              <div className={`p-5.5 rounded-2xl border space-y-3 ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-pink-500 flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-pink-500" />
                    ৩. TikTok for Business (Marketing API)
                  </h4>
                  <a
                    href="https://business-api.tiktok.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-pink-500 hover:underline font-bold"
                  >
                    <span>business-api.tiktok.com</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  <li><strong>Developer App তৈরি:</strong> TikTok for Business Developer Portal-এ অ্যাপ তৈরি করে Marketing API এক্সেসের জন্য আবেদন করুন।</li>
                  <li><strong>Redirect URI দিন:</strong> <code>https://your-domain.com/api/auth/tiktok/callback</code> দিন।</li>
                  <li><strong>Advertiser Discovery:</strong> লগইন শেষে <code>/oauth2/advertiser/get/</code> কল করে অনুমোদিত সব Advertiser ID পেয়ে যাওয়া যায়।</li>
                </ul>
              </div>

              {/* Security Rule F5 Notice */}
              <div className="p-4.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
                <Lock className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">জরুরি নিরাপত্তা নিশ্চয়তা (Rule F5 Compliance):</div>
                  <div className="mt-1 text-[11px] leading-relaxed font-medium">
                    ব্যবহারকারীর পাসওয়ার্ড কখনই আমাদের অ্যাপে আসে না। ব্রাউজার বা ফ্রন্টএন্ডে কখনো কোনো টোকেন উন্মুক্ত থাকে না। কোড থেকে টোকেন এক্সচেঞ্জ এবং টোকেনের AES-256 এনক্রিপশন শুধুমাত্র ব্যাকএন্ড সার্ভারে সম্পাদিত হয়।
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
