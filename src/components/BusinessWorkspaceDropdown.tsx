'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building, 
  ChevronDown, 
  Plus, 
  Check, 
  Sparkles, 
  ShoppingBag, 
  X, 
  ExternalLink,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ClientWorkspace } from '@/types';

interface BusinessWorkspaceDropdownProps {
  workspaces: ClientWorkspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onAddWorkspace: (newWs: ClientWorkspace) => void;
  onRemoveWorkspace?: (id: string) => void;
  theme: 'light' | 'dark';
}

export const BusinessWorkspaceDropdown: React.FC<BusinessWorkspaceDropdownProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onAddWorkspace,
  onRemoveWorkspace,
  theme,
}) => {
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states for new workspace modal
  const [newClientName, setNewClientName] = useState('');
  const [newCategory, setNewCategory] = useState('E-commerce & Retail');
  const [newCurrency, setNewCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [newMetaId, setNewMetaId] = useState('');
  const [newGoogleId, setNewGoogleId] = useState('');
  const [newTikTokId, setNewTikTokId] = useState('');
  const [newGa4Id, setNewGa4Id] = useState('');
  const [includeSampleData, setIncludeSampleData] = useState(false);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setIsOpen(false);
    // Reset inputs
    setNewClientName('');
    setNewMetaId('');
    setNewGoogleId('');
    setNewTikTokId('');
    setNewGa4Id('');
  };

  const menuBg = isLight 
    ? 'bg-white border-slate-200 shadow-xl text-slate-800' 
    : 'bg-[#121620] border-[#1b2230] shadow-2xl text-slate-200';

  return (
    <>
      {/* Dropdown Trigger Button */}
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
            isLight
              ? 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-200 text-blue-900 shadow-sm'
              : 'bg-[#151c2c] hover:bg-[#1b253b] border-blue-500/30 text-blue-200 shadow-sm'
          }`}
          title="Switch Active Business / Client Account"
        >
          <div className="h-5 w-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building className="h-3 w-3" />
          </div>
          <div className="flex flex-col text-left">
            <span className="hidden sm:inline text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400 leading-none">
              Client / Business:
            </span>
            <span className="text-xs font-bold truncate max-w-[90px] sm:max-w-[180px] leading-tight">
              {activeWs.clientName}
            </span>
          </div>
          <span className="hidden sm:inline rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1 py-0.2 text-[9px] font-bold">
            {activeWs.currency}
          </span>
          <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`absolute right-0 mt-1.5 w-72 max-w-[calc(100vw-2rem)] rounded-xl border p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100 ${menuBg}`}>
            <div className="px-2 py-1.5 border-b border-slate-100 dark:border-[#1b2230] flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Business / Client
              </span>
              <span className="text-[9px] font-semibold text-blue-500">
                {workspaces.length} Connected
              </span>
            </div>

            {/* List of Workspaces */}
            <div className="mt-1 space-y-1 max-h-64 overflow-y-auto">
              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspaceId;
                return (
                  <div
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? isLight
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200/80'
                          : 'bg-blue-600/20 text-blue-200 font-bold border border-blue-500/30'
                        : isLight
                          ? 'hover:bg-slate-100 text-slate-700'
                          : 'hover:bg-[#1a2233] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${isSelected ? 'bg-blue-500 shadow-[0_0_6px_#3b82f6]' : 'bg-slate-400'}`} />
                      <div className="truncate">
                        <div className="truncate font-semibold">{ws.clientName}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {ws.category} • {ws.currency}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      )}

                      {/* Remove Client Button */}
                      {onRemoveWorkspace && workspaces.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove client "${ws.clientName}"?`)) {
                              onRemoveWorkspace(ws.id);
                            }
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title={`Remove ${ws.clientName}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider and Action: Add New Client / Business */}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1b2230]">
              <button
                onClick={() => {
                  setIsAddModalOpen(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 text-xs font-bold justify-center transition-all shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add New Business / Client</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add New Business / Client Workspace */}
      {isAddModalOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className={`relative w-full max-w-lg my-auto rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#121620] border-[#1b2230] text-white'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3.5 border-slate-200 dark:border-[#1b2230]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Add New Business / Client Workspace</h3>
                  <p className="text-[10px] text-slate-400">Connect a dedicated ad workspace for your brand or agency client</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a2233] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateWorkspace} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Business / Client Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mensa Lifestyle BD, Urban Saree Dhaka"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0a0d14] border-[#1e2638] text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Industry / Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0a0d14] border-[#1e2638] text-white'
                    }`}
                  >
                    <option value="E-commerce & Retail">E-commerce & Retail</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Footwear & Sneakers">Footwear & Sneakers</option>
                    <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Default Currency
                  </label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as 'BDT' | 'USD')}
                    className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0a0d14] border-[#1e2638] text-white'
                    }`}
                  >
                    <option value="BDT">৳ BDT (Bangladeshi Taka)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                  </select>
                </div>
              </div>

              {/* Platform Account IDs */}
              <div className="rounded-xl border p-3 bg-slate-50/50 dark:bg-[#0a0d14]/50 border-slate-200 dark:border-[#1e2638] space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                  Platform Ad Account IDs (Optional - Can link later)
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Meta Ad Account ID</label>
                    <input
                      type="text"
                      placeholder="act_123456789"
                      value={newMetaId}
                      onChange={(e) => setNewMetaId(e.target.value)}
                      className={`w-full rounded-md border px-2.5 py-1 text-xs focus:outline-none ${
                        isLight ? 'bg-white border-slate-300' : 'bg-[#121620] border-[#1e2638]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Google Ads CID</label>
                    <input
                      type="text"
                      placeholder="123-456-7890"
                      value={newGoogleId}
                      onChange={(e) => setNewGoogleId(e.target.value)}
                      className={`w-full rounded-md border px-2.5 py-1 text-xs focus:outline-none ${
                        isLight ? 'bg-white border-slate-300' : 'bg-[#121620] border-[#1e2638]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">TikTok Advertiser ID</label>
                    <input
                      type="text"
                      placeholder="adv_692810491028"
                      value={newTikTokId}
                      onChange={(e) => setNewTikTokId(e.target.value)}
                      className={`w-full rounded-md border px-2.5 py-1 text-xs focus:outline-none ${
                        isLight ? 'bg-white border-slate-300' : 'bg-[#121620] border-[#1e2638]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">GA4 Property ID</label>
                    <input
                      type="text"
                      placeholder="G-XXXXXXXXXX"
                      value={newGa4Id}
                      onChange={(e) => setNewGa4Id(e.target.value)}
                      className={`w-full rounded-md border px-2.5 py-1 text-xs focus:outline-none ${
                        isLight ? 'bg-white border-slate-300' : 'bg-[#121620] border-[#1e2638]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Sample data toggle */}
              <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border p-2.5 transition-colors border-slate-200 dark:border-[#1e2638] bg-slate-50/50 dark:bg-[#0a0d14]/40">
                <input
                  type="checkbox"
                  checked={includeSampleData}
                  onChange={(e) => setIncludeSampleData(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 mt-0.5"
                />
                <div>
                  <div className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    ডেমো ক্যাম্পেইন ও মেট্রিক্স অন্তর্ভুক্ত করুন (Include demo template data)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    টিক না দিলে সম্পূর্ণ ফাঁকা/ক্লিন ওয়ার্কস্পেস তৈরি হবে, যা লাইভ API কানেকশনের জন্য উপযুক্ত।
                  </div>
                </div>
              </label>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#1b2230]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500 transition-all cursor-pointer"
                >
                  Create Client Workspace
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
