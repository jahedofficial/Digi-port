'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Check, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export interface ChatbotTrackingConfig {
  gtmId?: string;
  metaPixelId?: string;
  metaCapiToken?: string;
  googleAdsId?: string;
  googleConversionLabel?: string;
  ga4MeasurementId?: string;
  tiktokPixelId?: string;
  autoDeduplication?: boolean;
  hashPii?: boolean;
  openClawEndpoint?: string;
  openClawApiKey?: string;
  selectedModel?: string;
  requireApproval?: boolean;
  autoAuditEvery6Hours?: boolean;
  maxDailyBudgetCap?: number;
  telegramBotToken?: string;
  telegramChatId?: string;
  enableTelegramAlerts?: boolean;
  whatsappNumber?: string;
  enableWhatsappAlerts?: boolean;
  alertOnHighSpend?: boolean;
  alertOnRoasDrop?: boolean;
  alertDailySummary?: boolean;
}

interface ChatbotSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ChatbotTrackingConfig;
  onSave: (newConfig: ChatbotTrackingConfig) => void;
  theme?: 'light' | 'dark';
}

const STORAGE_KEY = 'dm_offline_alerts_config';

export const ChatbotSettingsModal: React.FC<ChatbotSettingsModalProps> = ({
  isOpen,
  onClose,
  config: initialConfig,
  onSave,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [form, setForm] = useState<ChatbotTrackingConfig>(initialConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showTelegramHelp, setShowTelegramHelp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setForm((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to load alert config from localStorage', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ChatbotTrackingConfig, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      } catch (e) {
        console.error('Failed to save alert config to localStorage', e);
      }
    }
    onSave(form);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleTestTelegram = async () => {
    const token = form.telegramBotToken?.trim();
    const chat = form.telegramChatId?.trim();

    if (!token && !process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN) {
      setTelegramStatus({
        type: 'error',
        message: 'Bot Token প্রদান করুন',
      });
      return;
    }

    if (!chat && !process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID) {
      setTelegramStatus({
        type: 'error',
        message: 'Chat ID প্রদান করুন',
      });
      return;
    }

    setIsTestingTelegram(true);
    setTelegramStatus(null);

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Digital Marketr AI Alert',
          message: 'Hello Jahed! Mobile alerts are working properly.',
          metrics: {
            'Spend Today': '৳14,200',
            'Orders': '42 orders',
            'Blended ROAS': '4.85x',
          },
          botToken: token,
          chatId: chat,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTelegramStatus({
          type: 'success',
          message: 'টেস্ট মেসেজ পাঠানো হয়েছে!',
        });
      } else {
        setTelegramStatus({
          type: 'error',
          message: data.error || 'টোকেন অথবা চ্যাট আইডি সঠিক নয়',
        });
      }
    } catch {
      setTelegramStatus({
        type: 'error',
        message: 'সংযোগ ব্যর্থ হয়েছে',
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-md rounded-2xl border shadow-xl overflow-hidden flex flex-col transition-all animate-in zoom-in-95 duration-150 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#101625] border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight">
              Mobile Alerts
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              অফলাইনে থাকলেও আপনার ফোনে ক্যাম্পেইনের জরুরি আপডেট পান।
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer -mr-1 -mt-1 ${
              isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-2 space-y-5 text-xs">
          {/* Telegram Card */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isLight ? 'bg-slate-50/60 border-slate-200/80' : 'bg-slate-900/40 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <div className="h-6 w-6 rounded-full bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <Send className="h-3.5 w-3.5 ml-0.5" />
                </div>
                <span>Telegram</span>
              </div>

              <button
                type="button"
                onClick={() => setShowTelegramHelp(!showTelegramHelp)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="h-3 w-3" />
                <span>কীভাবে পাবেন?</span>
              </button>
            </div>

            {showTelegramHelp && (
              <div className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                isLight ? 'bg-blue-50/70 border-blue-200/60 text-blue-950' : 'bg-blue-950/30 border-blue-900 text-blue-200'
              }`}>
                ১. Telegram-এ <strong>@BotFather</strong>-এ গিয়ে <code>/newbot</code> লিখে Bot Token নিন।<br />
                ২. আপনার বটের চ্যাটে <code>/start</code> দিয়ে Chat ID এখানে বসিয়ে দিন।
              </div>
            )}

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Bot Token
                </label>
                <input
                  type="text"
                  placeholder="7123456789:AAHq_xyz..."
                  value={form.telegramBotToken || ''}
                  onChange={(e) => handleChange('telegramBotToken', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:outline-none focus:border-blue-500 transition-all ${
                    isLight ? 'border-slate-200 bg-white text-slate-900' : 'border-slate-700 bg-[#0c1017] text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Chat ID
                </label>
                <input
                  type="text"
                  placeholder="123456789"
                  value={form.telegramChatId || ''}
                  onChange={(e) => handleChange('telegramChatId', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:outline-none focus:border-blue-500 transition-all ${
                    isLight ? 'border-slate-200 bg-white text-slate-900' : 'border-slate-700 bg-[#0c1017] text-white'
                  }`}
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={isTestingTelegram}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
                  isLight 
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700' 
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isTestingTelegram ? 'পাঠানো হচ্ছে...' : 'Send Test Alert'}
              </button>

              {telegramStatus && (
                <span className={`text-[11px] font-medium flex items-center gap-1 ${
                  telegramStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  {telegramStatus.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {telegramStatus.message}
                </span>
              )}
            </div>
          </div>

          {/* WhatsApp Card */}
          <div className={`rounded-xl border p-4 space-y-2.5 ${
            isLight ? 'bg-slate-50/60 border-slate-200/80' : 'bg-slate-900/40 border-slate-800/80'
          }`}>
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Smartphone className="h-3.5 w-3.5" />
              </div>
              <span>WhatsApp</span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                WhatsApp নাম্বার
              </label>
              <input
                type="text"
                placeholder="+8801812345678"
                value={form.whatsappNumber || ''}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:outline-none focus:border-emerald-500 transition-all ${
                  isLight ? 'border-slate-200 bg-white text-slate-900' : 'border-slate-700 bg-[#0c1017] text-white'
                }`}
              />
            </div>
          </div>

          {/* Alert Preferences */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.alertOnRoasDrop !== false}
                onChange={(e) => handleChange('alertOnRoasDrop', e.target.checked)}
                className="rounded accent-blue-600 h-3.5 w-3.5"
              />
              <span>হঠাৎ খরচ বৃদ্ধি বা ROAS ড্রপ হলে সতর্কবার্তা</span>
            </label>

            <label className="flex items-center gap-2.5 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.alertDailySummary !== false}
                onChange={(e) => handleChange('alertDailySummary', e.target.checked)}
                className="rounded accent-blue-600 h-3.5 w-3.5"
              />
              <span>প্রতিদিন রাত ১০টায় বিক্রয় ও খরচের সামারি</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-2">
          <button
            onClick={onClose}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            {saveSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>সংরক্ষিত!</span>
              </>
            ) : (
              <span>সেটিংস সেভ করুন</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
