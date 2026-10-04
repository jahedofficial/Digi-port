'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Building, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Layers, 
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { ClientWorkspace } from '@/types';

interface ClientWorkspaceTabsBarProps {
  workspaces: ClientWorkspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onAddWorkspace: (newWs: ClientWorkspace) => void;
  onCloseWorkspace: (id: string) => void;
  onOpenHubForActive: () => void;
  theme: 'light' | 'dark';
}

export const ClientWorkspaceTabsBar: React.FC<ClientWorkspaceTabsBarProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onAddWorkspace,
  onCloseWorkspace,
  onOpenHubForActive,
  theme,
}) => {
  const isLight = theme === 'light';
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for new client workspace
  const [newClientName, setNewClientName] = useState('');
  const [newCategory, setNewCategory] = useState('E-commerce & Retail');
  const [newCurrency, setNewCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [newMetaId, setNewMetaId] = useState('');
  const [newGoogleId, setNewGoogleId] = useState('');
  const [newTikTokId, setNewTikTokId] = useState('');
  const [newGa4Id, setNewGa4Id] = useState('');
  const [includeSampleData, setIncludeSampleData] = useState(true);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newId = `ws-client-${Date.now()}`;
    const newWs: ClientWorkspace = {
      id: newId,
      name: newClientName.trim(),
      clientName: newClientName.trim(),
      category: newCategory,
      currency: newCurrency,
      colorTag: ['purple', 'emerald', 'blue', 'amber', 'rose'][workspaces.length % 5],
      connectedAccounts: {
        meta: newMetaId.trim()
          ? { id: newMetaId.trim(), name: `${newClientName} Meta Ads`, status: 'CONNECTED' }
          : undefined,
        google: newGoogleId.trim()
          ? { id: newGoogleId.trim(), name: `${newClientName} Google Ads`, status: 'CONNECTED' }
          : undefined,
        tiktok: newTikTokId.trim()
          ? { id: newTikTokId.trim(), name: `${newClientName} TikTok Ads`, status: 'CONNECTED' }
          : undefined,
        ga4PropertyId: newGa4Id.trim() || undefined,
      },
      metrics: includeSampleData ? activeWs.metrics : {
        ALL: { spend: 0, revenue: 0, conversions: 0, cpa: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0 },
        META: { spend: 0, revenue: 0, conversions: 0, cpa: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0 },
        GOOGLE: { spend: 0, revenue: 0, conversions: 0, cpa: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0 },
        TIKTOK: { spend: 0, revenue: 0, conversions: 0, cpa: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0 },
      },
      campaigns: includeSampleData ? activeWs.campaigns.map((c, i) => ({
        ...c,
        id: `camp-new-${i}-${Date.now()}`,
        name: `${newClientName.replace(/\s+/g, '_')}_${c.name.split('_').slice(1).join('_') || 'Campaign'}`,
      })) : [],
      creatives: includeSampleData ? activeWs.creatives.map((cr, i) => ({
        ...cr,
        id: `cr-new-${i}-${Date.now()}`,
        adId: `ad-new-${i}-${Date.now()}`,
        adName: `${newClientName}_${cr.adName}`,
      })) : [],
    };

    onAddWorkspace(newWs);
    setIsAddModalOpen(false);
    // Reset inputs
    setNewClientName('');
    setNewMetaId('');
    setNewGoogleId('');
    setNewTikTokId('');
    setNewGa4Id('');
  };

  const barBg = isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-[#090d14] border-[#1b2230]';
  const tabActiveBg = isLight 
    ? 'bg-white text-slate-900 border-slate-200/90 shadow-sm' 
    : 'bg-[#121620] text-white border-[#1b2230] shadow-sm';
  const tabInactiveBg = isLight
    ? 'bg-transparent text-slate-600 hover:bg-white/60 hover:text-slate-900 border-transparent'
    : 'bg-transparent text-slate-400 hover:bg-[#121620]/60 hover:text-white border-transparent';

  return (
    <>
      {/* Workspace Tabs Container */}
      <div className={`w-full border-b px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto ${barBg}`}>
        {/* Left: Tab Items */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Building className="h-3 w-3 text-blue-500" />
            <span className="hidden md:inline">Business Tabs:</span>
          </span>

          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            const hasMeta = !!ws.connectedAccounts.meta;
            const hasGoogle = !!ws.connectedAccounts.google;
            const hasTikTok = !!ws.connectedAccounts.tiktok;

            return (
              <div
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  isActive ? tabActiveBg : tabInactiveBg
                }`}
              >
                {/* Status Dot / Icon */}
                <div className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${
                    ws.colorTag === 'blue' ? 'bg-blue-500' :
                    ws.colorTag === 'pink' ? 'bg-pink-500' :
                    ws.colorTag === 'amber' ? 'bg-amber-500' :
                    ws.colorTag === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'
                  }`} />
                  <span className="truncate max-w-[130px] sm:max-w-[170px]">{ws.name}</span>
                </div>

                {/* Platform Dots Pill */}
                <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                  {hasMeta && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Meta Ads Connected" />}
                  {hasGoogle && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Google Ads Connected" />}
                  {hasTikTok && <span className="h-1.5 w-1.5 rounded-full bg-pink-500" title="TikTok Ads Connected" />}
                </div>

                {/* Currency Badge */}
                <span className={`text-[9px] font-bold px-1 rounded ${
                  isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                }`}>
                  {ws.currency}
                </span>

                {/* Close Tab button (if not pinned & more than 1 tab) */}
                {!ws.isPinned && workspaces.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseWorkspace(ws.id);
                    }}
                    className="h-4 w-4 rounded flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-all"
                    title={`Close ${ws.name} Tab`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* "+ New Tab" Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isLight 
                ? 'bg-white hover:bg-blue-50 hover:text-blue-600 border-slate-300 text-slate-700 shadow-xs' 
                : 'bg-[#121620] hover:bg-blue-950/40 hover:text-blue-400 border-[#1b2230] text-slate-300'
            }`}
            title="Open new business or client tab"
          >
            <Plus className="h-3.5 w-3.5 text-blue-500" />
            <span>+ New Tab</span>
          </button>
        </div>

        {/* Right Info: Active Workspace details & Fast Switch */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Client: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{activeWs.clientName}</strong></span>
            <span>•</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              {activeWs.connectedAccounts.meta?.id || 'No Meta'}
            </span>
          </div>

          <button
            onClick={onOpenHubForActive}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-all ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-blue-600' 
                : 'bg-[#121620] hover:bg-[#1a202c] border-[#1b2230] text-blue-400'
            }`}
            title="Configure platform IDs for this client"
          >
            <span>Connect IDs</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {/* Modal: Add New Client / Business Workspace */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f1422] border-[#1e2638] text-slate-100'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-600/15 text-blue-600 flex items-center justify-center">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Add New Business / Client Workspace</h3>
                  <p className="text-xs text-slate-400">
                    Open a dedicated tab with isolated accounts, campaigns & analytics
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 rounded-lg border flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Client or Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mensa Lifestyle Client or Dhaka Tech Store"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0a0d14] border-[#1e2638] text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Industry / Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0a0d14] border-[#1e2638] text-white'
                    }`}
                  >
                    <option value="E-commerce & Retail">E-commerce & Retail</option>
                    <option value="Clothing & Fashion">Clothing & Fashion</option>
                    <option value="Footwear & Sneakers">Footwear & Sneakers</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Real Estate & Services">Real Estate & Services</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Default Currency</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as 'BDT' | 'USD')}
                    className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0a0d14] border-[#1e2638] text-white'
                    }`}
                  >
                    <option value="BDT">৳ BDT (Bangladesh Taka)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                  </select>
                </div>
              </div>

              {/* Connected Platform IDs Section */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0d14] border-[#1e2638]'
              }`}>
                <div className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                  Connect Client Ad Account IDs (Optional / Can add later):
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-16 font-semibold text-blue-600">Meta ID:</span>
                    <input
                      type="text"
                      placeholder="e.g. act_771920491823"
                      value={newMetaId}
                      onChange={(e) => setNewMetaId(e.target.value)}
                      className={`flex-1 rounded-md border px-2.5 py-1 text-xs focus:outline-none ${
                        isLight ? 'bg-white border-slate-300' : 'bg-[#121620] border-[#1e2638] text-white'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-16 font-semibold text-amber-500">Google ID:</span>
                    <input
                      type="text"
                      placeholder="e.g. 551-882-9912"
                      value={newGoogleId}
                      onChange={(e) => setNewGoogleId(e.target.value)}
                      className={`flex-1 rounded-md border px-2.5 py-1 text-xs focus:outline-none ${
                        isLight ? 'bg-white border-slate-300' : 'bg-[#121620] border-[#1e2638] text-white'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-16 font-semibold text-pink-500">TikTok ID:</span>
                    <input
                      type="text"
                      placeholder="e.g. adv_9928104819"
                      value={newTikTokId}
                      onChange={(e) => setNewTikTokId(e.target.value)}
                      className={`flex-1 rounded-md border px-2.5 py-1 text-xs focus:outline-none ${
                        isLight ? 'bg-white border-slate-300' : 'bg-[#121620] border-[#1e2638] text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Sample Data Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includeSampleData}
                  onChange={(e) => setIncludeSampleData(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-500 dark:text-slate-400">
                  Pre-populate with sample campaigns & creatives (ready to inspect immediately)
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-lg font-semibold border ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
                >
                  Create & Open Workspace Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
