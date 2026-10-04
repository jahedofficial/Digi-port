'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  Zap, 
  Code, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  Radio,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { TrackingCheckItem } from '@/types';

interface TrackingHealthViewProps {
  trackingChecks: TrackingCheckItem[];
  onReaudit: () => void;
  isAuditing: boolean;
  theme?: 'light' | 'dark';
}

export const TrackingHealthView: React.FC<TrackingHealthViewProps> = ({
  trackingChecks,
  onReaudit,
  isAuditing,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [isTestingConversion, setIsTestingConversion] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showIntegrationDocs, setShowIntegrationDocs] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'JS' | 'SHOPIFY' | 'CURL'>('JS');
  const [copied, setCopied] = useState(false);

  const handleTestConversion = async () => {
    setIsTestingConversion(true);
    setTestResult(null);

    try {
      const orderNumber = Math.floor(10000 + Math.random() * 90000);
      const res = await fetch('/api/track/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'Purchase',
          eventId: `ORDER-LIVETEST-${orderNumber}`,
          value: 2950,
          currency: 'BDT',
          userData: {
            email: 'customer.test@gmail.com',
            phone: '+8801712345678',
            fbp: 'fb.1.1689234.12345',
            fbc: 'fb.1.1689234.AbCdEf123',
            gclid: 'Cj0KCQj_test_conversion_gclid_123',
          },
          items: [
            { id: 'eid-lawn-01', name: 'Premium Lawn Eid 3-Piece', quantity: 1, item_price: 2950 },
          ],
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err?.message || 'Failed to send conversion' });
    } finally {
      setIsTestingConversion(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsSnippet = `// ⚡ ১. চেকআউটে অর্ডার সম্পন্ন হলে কল করুন
fetch('/api/track/conversion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'Purchase',
    eventId: orderId,       // ইউনিক অর্ডার আইডি (ডিডুপ্লিকেশনের জন্য আবশ্যক)
    value: totalAmount,     // যেমন: ২৯৫০
    currency: 'BDT',
    userData: {
      email: customerEmail,
      phone: customerPhone,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
      gclid: getUrlParam('gclid')
    },
    items: cartItems
  })
});`;

  const curlSnippet = `curl -X POST https://your-domain.com/api/track/conversion \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventName": "Purchase",
    "eventId": "ORDER-9812",
    "value": 2950,
    "currency": "BDT",
    "userData": {
      "email": "customer@gmail.com",
      "phone": "+8801812345678"
    }
  }'`;

  const shopifySnippet = `// Shopify Webhook: orders/paid
// Endpoint: https://your-domain.com/api/track/conversion
// স্বয়ংক্রিয়ভাবে Meta CAPI, Google Ads এবং TikTok Events API-তে ইভেন্ট চলে যাবে`;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className={`rounded-2xl border p-5 transition-all ${
        isLight 
          ? 'border-slate-200/90 bg-white shadow-xs' 
          : 'border-slate-800 bg-[#0f141f] shadow-sm'
      }`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shadow-xs ${
                isLight 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}>
                <Activity className="h-4 w-4" />
              </div>
              <h2 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Tracking & Pixel Health
              </h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live Server CAPI
              </span>
            </div>
            <p className={`mt-1 text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Meta Pixel, CAPI, Google Ads এবং TikTok ট্র্যাকিংয়ের লাইভ স্থিতি এবং ম্যাচ কোয়ালিটি নিরীক্ষণ।
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Test Button */}
            <button
              onClick={handleTestConversion}
              disabled={isTestingConversion}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Send a simulated conversion event"
            >
              <Zap className={`h-3.5 w-3.5 ${isTestingConversion ? 'animate-bounce' : ''}`} />
              <span>{isTestingConversion ? 'পাঠানো হচ্ছে...' : 'Send Test Event (৳২,৯৫০)'}</span>
            </button>

            {/* Re-Audit Button */}
            <button
              onClick={onReaudit}
              disabled={isAuditing}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all disabled:opacity-50 cursor-pointer active:scale-95 ${
                isLight 
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' 
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'রিফ্রেশ হচ্ছে...' : 'Audit Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Live Test Result Banner */}
        {testResult && (
          <div className={`mt-4 rounded-xl border p-3.5 text-xs animate-in fade-in duration-200 ${
            isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {testResult.message || 'টেস্ট কনভার্শন সফলভাবে সার্ভার থেকে পাঠানো হয়েছে!'}
              </span>
              <span className="font-mono text-[11px] opacity-70">
                ইভেন্ট আইডি: {testResult.eventId}
              </span>
            </div>

            {testResult.results && (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {testResult.results.map((r: any, idx: number) => (
                  <div key={idx} className={`rounded-lg p-2.5 border text-[11px] ${
                    isLight ? 'bg-white/90 border-emerald-200/60' : 'bg-[#0f141f] border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>{r.platform === 'META_CAPI' ? 'Meta CAPI' : r.platform === 'GOOGLE_ENHANCED' ? 'Google Enhanced' : 'TikTok Events API'}</span>
                      <span className="text-emerald-500 font-mono">EMQ {r.matchScoreEstimated}/10</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {r.deduplicated ? '✓ ব্রাউজার পিক্সেলের সাথে নিখুঁতভাবে ডিডুপ্লিকেট করা হয়েছে' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Integration Guide Accordion */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${
        isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-[#0f141f]'
      }`}>
        <button
          onClick={() => setShowIntegrationDocs(!showIntegrationDocs)}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center border ${
              isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
            }`}>
              <Code className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                ওয়েবসাইটে অটো ট্র্যাকিং ইন্টিগ্রেশন নির্দেশিকা (Code & Webhook Guide)
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Shopify, WooCommerce বা কাস্টম ওয়েবসাইটে কনভার্শন পাঠানোর কোড
              </p>
            </div>
          </div>
          {showIntegrationDocs ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {showIntegrationDocs && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveSnippetTab('JS')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSnippetTab === 'JS' 
                    ? 'bg-blue-600 text-white' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                JavaScript / Next.js
              </button>
              <button
                onClick={() => setActiveSnippetTab('SHOPIFY')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSnippetTab === 'SHOPIFY' 
                    ? 'bg-blue-600 text-white' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Shopify Webhook
              </button>
              <button
                onClick={() => setActiveSnippetTab('CURL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSnippetTab === 'CURL' 
                    ? 'bg-blue-600 text-white' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
            </div>

            {/* Snippet Display */}
            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {activeSnippetTab === 'JS' ? jsSnippet : activeSnippetTab === 'SHOPIFY' ? shopifySnippet : curlSnippet}
              </pre>
              <button
                onClick={() => copyToClipboard(activeSnippetTab === 'JS' ? jsSnippet : activeSnippetTab === 'SHOPIFY' ? shopifySnippet : curlSnippet)}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 flex items-center gap-1 cursor-pointer transition-all border border-slate-700"
              >
                <Copy className="h-3 w-3" />
                {copied ? 'কপি হয়েছে!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3 Health Overview Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {trackingChecks.map((item) => {
          const isGreen = item.status === 'GREEN';
          const isYellow = item.status === 'YELLOW';
          const isRed = item.status === 'RED';

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 transition-all duration-200 ${
                isLight 
                  ? 'border-slate-200/90 bg-white shadow-xs hover:shadow-md' 
                  : 'border-slate-800 bg-[#101625] shadow-sm hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b pb-3.5 border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    item.platform === 'META' ? (isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20') :
                    item.platform === 'GOOGLE' ? (isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20') :
                    (isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700')
                  }`}>
                    {item.platform === 'META' ? 'Meta Ads' : item.platform === 'GOOGLE' ? 'Google Ads' : 'TikTok Ads'}
                  </span>
                  <span className={`text-xs font-bold truncate max-w-[130px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {item.name}
                  </span>
                </div>

                {/* Health Badge */}
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                  isGreen
                    ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : isYellow
                    ? isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isGreen ? 'bg-emerald-500' : isYellow ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  {isGreen ? 'Healthy' : isYellow ? 'Needs Attention' : 'Critical Issue'}
                </span>
              </div>

              {/* Event Match Quality & Deduplication */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 text-center text-xs">
                <div className={`rounded-xl p-2.5 border ${
                  isLight ? 'bg-slate-50/80 border-slate-200/70' : 'bg-slate-900/60 border-slate-800/80'
                }`}>
                  <div className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Match Quality</div>
                  <div className={`text-base font-bold mt-0.5 ${
                    item.eventMatchQuality >= 8.0 
                      ? isLight ? 'text-emerald-600' : 'text-emerald-400'
                      : isLight ? 'text-amber-600' : 'text-amber-400'
                  }`}>
                    {item.eventMatchQuality} / 10
                  </div>
                </div>

                <div className={`rounded-xl p-2.5 border ${
                  isLight ? 'bg-slate-50/80 border-slate-200/70' : 'bg-slate-900/60 border-slate-800/80'
                }`}>
                  <div className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Deduplication</div>
                  <div className={`mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    {item.deduplicationActive ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Synced
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" /> Missing ID
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Events Tested List */}
              <div className="mt-4 space-y-1.5">
                <div className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Live Events
                </div>
                {item.eventsTested.map((ev, idx) => (
                  <div key={idx} className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                    isLight ? 'bg-slate-50 text-slate-800 border border-slate-200/60' : 'bg-slate-900/50 text-slate-200 border border-slate-800/60'
                  }`}>
                    <span className="font-mono text-[11px]">{ev.event}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{ev.firedCount.toLocaleString()} hits</span>
                      <span className={`font-semibold ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>{ev.matchRate}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Diagnostic Notes in Clean Language */}
              <div className={`mt-3.5 rounded-xl p-3 text-xs leading-relaxed border ${
                isLight ? 'bg-slate-50/70 text-slate-600 border-slate-200/70' : 'bg-slate-900/40 text-slate-400 border-slate-800/60'
              }`}>
                <p className="text-[11px] leading-relaxed">{item.notes}</p>
              </div>

              {/* Suggested Fix Checklist if not healthy */}
              {item.status !== 'GREEN' && (
                <div className={`mt-3 rounded-xl border p-3 text-xs ${
                  isLight ? 'border-amber-200 bg-amber-50/60 text-slate-800' : 'border-amber-800/40 bg-amber-950/20 text-slate-300'
                }`}>
                  <div className={`flex items-center gap-1.5 font-semibold text-[11px] mb-1 ${
                    isLight ? 'text-amber-800' : 'text-amber-400'
                  }`}>
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>সমাধানের পরামর্শ:</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{item.suggestedFix}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
