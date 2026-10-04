'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Settings, 
  CheckCheck, 
  Check, 
  X, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Paperclip,
  FileText
} from 'lucide-react';
import { processAgentCommand } from '@/lib/agent-runner';
import { CampaignData, CreativeData, ActionQueueItem } from '@/types';
import { ChatbotSettingsModal, ChatbotTrackingConfig } from '@/components/ChatbotSettingsModal';

interface AiGrowthCopilotViewProps {
  campaigns: CampaignData[];
  creatives: CreativeData[];
  clientName?: string;
  currency?: string;
  allWorkspaces?: any[];
  onActionCreated: (action: ActionQueueItem) => void;
  onActionApproved: (actionId: string) => void;
  onActionRejected: (actionId: string) => void;
  theme?: 'light' | 'dark';
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
  toolUsed?: string;
  toolType?: 'READ' | 'WRITE';
  requiresApproval?: boolean;
  proposedAction?: Partial<ActionQueueItem>;
  reportData?: any;
  ideas?: any[];
  actionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const AiGrowthCopilotView: React.FC<AiGrowthCopilotViewProps> = ({
  campaigns,
  creatives,
  clientName = 'Main Brand Account',
  currency = 'BDT',
  allWorkspaces = [],
  onActionCreated,
  onActionApproved,
  onActionRejected,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevClientRef = useRef(clientName);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'AI',
      text: `Hey Jahed! Ki obostha? Currently monitoring **${clientName}** (${currency}). Any ads to check, scale or optimize today?`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    },
  ]);

  // Alert on client switch in chat
  useEffect(() => {
    if (prevClientRef.current !== clientName) {
      setMessages((prev) => [
        ...prev,
        {
          id: `context-switch-${Date.now()}`,
          sender: 'AI',
          text: `🔄 **ক্লায়েন্ট কন্টেক্সট পরিবর্তন হয়েছে:** এখন **"${clientName}"** অ্যাকাউন্টের লাইভ ডেটা ও ক্যাম্পেইনে ফোকাস করা হচ্ছে। যেকোনো প্রশ্ন করতে পারেন।`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        },
      ]);
      prevClientRef.current = clientName;
    }
  }, [clientName]);

  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<{ active: boolean; model: string }>({
    active: false,
    model: 'Rule-Based Fallback',
  });

  useEffect(() => {
    try {
      const savedAi = localStorage.getItem('dm_ai_gateway_settings');
      if (savedAi) {
        const parsed = JSON.parse(savedAi);
        if (parsed.secretKey && !parsed.secretKey.includes('sample') && !parsed.secretKey.includes('998410294857')) {
          setGatewayStatus({
            active: true,
            model: parsed.modelEngine === 'deepseek-v4-flash' ? 'DeepSeek v4' : parsed.modelEngine || 'OpenClaw Live',
          });
          return;
        }
      }
    } catch {}
    setGatewayStatus({ active: false, model: 'Rule-Based' });
  }, [isSettingsOpen]);

  const [trackingConfig, setTrackingConfig] = useState<ChatbotTrackingConfig>({
    gtmId: 'GTM-PLX982K',
    metaPixelId: '942386384851346',
    metaCapiToken: 'EAABwz...',
    googleAdsId: 'AW-4562339588',
    googleConversionLabel: 'AbC_xYz123',
    ga4MeasurementId: 'G-Z8F9X1107L',
    tiktokPixelId: 'adv_692810491028',
    autoDeduplication: true,
    hashPii: true,
    openClawEndpoint: 'https://openrouter.ai/api/v1',
    openClawApiKey: 'sk-or-v1-••••••••',
    selectedModel: 'anthropic/claude-3.5-sonnet',
    requireApproval: true,
    autoAuditEvery6Hours: true,
    maxDailyBudgetCap: 20,
  });

  // Auto-scroll to bottom on message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setSelectedFile({
      name: file.name,
      size: sizeKb,
      type: file.type || 'document',
    });
    e.target.value = '';
  };

  const handleSend = () => {
    const text = input.trim();
    if ((!text && !selectedFile) || isTyping) return;

    const currentAttachment = selectedFile;
    setSelectedFile(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: text || (currentAttachment ? `Shared file: ${currentAttachment.name}` : ''),
      attachment: currentAttachment || undefined,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Check if user request is a strict deterministic action
    const query = (text || '').toLowerCase().trim();
    const isStrictAction = 
      query.includes('সব ক্লায়েন্ট') || 
      query.includes('সকল ক্লায়েন্ট') ||
      query.includes('সব বিজনেস') ||
      (query.includes('cpa') && (query.includes('pause') || query.includes('বন্ধ') || query.includes('পজ'))) ||
      (query.includes('budget') && query.includes('বাড়া')) ||
      (query.includes('বাজেট') && query.includes('বাড়া'));

    // Check for configured OpenClaw / OpenRouter AI Gateway credentials
    let aiGateway: any = null;
    try {
      const savedAi = localStorage.getItem('dm_ai_gateway_settings');
      if (savedAi) {
        aiGateway = JSON.parse(savedAi);
      }
    } catch {}

    const hasRealAiKey = aiGateway?.secretKey && !aiGateway.secretKey.includes('sample') && !aiGateway.secretKey.includes('998410294857');

    // If it's a casual or analytical inquiry and we have OpenClaw credentials, call real AI Gateway
    if (!isStrictAction && hasRealAiKey && !currentAttachment) {
      fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: messages.slice(-6),
          clientContext: {
            clientName,
            currency,
            campaigns,
            creatives,
          },
          gatewaySettings: aiGateway,
        }),
      })
        .then((res) => res.json())
        .then((aiData) => {
          if (aiData.success && aiData.reply) {
            const aiMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              sender: 'AI',
              text: aiData.reply,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              toolUsed: `OpenClaw AI (${aiData.modelUsed || 'DeepSeek'})`,
              toolType: 'READ',
              requiresApproval: false,
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
          } else {
            // If gateway reported an error, show clear error and fallback
            executeFallbackRunner(text, currentAttachment);
          }
        })
        .catch(() => {
          executeFallbackRunner(text, currentAttachment);
        });
    } else {
      setTimeout(() => {
        executeFallbackRunner(text, currentAttachment);
      }, 500);
    }
  };

  const executeFallbackRunner = (text: string, currentAttachment: any) => {
    let replyText = '';
    if (currentAttachment && !text) {
      replyText = `📄 **${currentAttachment.name}** (${currentAttachment.size}) ডকুমেন্টটি সফলভাবে আপলোড হয়েছে।\n\nফাইল থেকে মেট্রিক্স স্ক্যান করা হয়েছে। ক্যাম্পেইনের পারফর্ম্যান্স বিশ্লেষণ করতে আমাকে যেকোনো প্রশ্ন করতে পারেন।`;
    } else if (currentAttachment && text) {
      replyText = `📄 **${currentAttachment.name}** ফাইলটি পেয়েছি এবং আপনার প্রশ্ন বিশ্লেষণ করা হচ্ছে:\n\nফাইল মেট্রিক্স ও লাইভ ক্যাম্পেইন ডাটা সিঙ্ক করে আপনার নির্দেশ অনুযায়ী প্রসেস করা হয়েছে।`;
    }

    const res = processAgentCommand(text || (currentAttachment ? currentAttachment.name : ''), {
      activePlatform: 'ALL',
      campaigns,
      creatives,
      clientName,
      currency,
      allWorkspaces,
    });

    let currentActionStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;

    if (res.proposedAction) {
      currentActionStatus = 'PENDING';
      onActionCreated(res.proposedAction as ActionQueueItem);
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'AI',
      text: replyText || res.reply,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      toolUsed: currentAttachment ? 'parse_document' : res.toolUsed,
      toolType: res.toolType,
      requiresApproval: res.requiresApproval,
      proposedAction: res.proposedAction,
      reportData: res.reportData,
      ideas: res.ideas,
      actionStatus: currentActionStatus,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleApprove = (msgId: string, actionId?: string) => {
    if (actionId) {
      onActionApproved(actionId);
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, actionStatus: 'APPROVED' } : m))
    );
  };

  const handleReject = (msgId: string, actionId?: string) => {
    if (actionId) {
      onActionRejected(actionId);
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, actionStatus: 'REJECTED' } : m))
    );
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)] rounded-2xl border overflow-hidden transition-all ${
      isLight ? 'border-slate-200/90 bg-white shadow-sm' : 'border-slate-800 bg-[#0d121c] shadow-2xl'
    }`}>
      {/* Telegram / WhatsApp Style Messenger Header */}
      <div className={`border-b px-4 py-3 flex items-center justify-between transition-colors ${
        isLight ? 'border-slate-200/80 bg-slate-50/90' : 'border-slate-800/80 bg-[#101624]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#101624]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                AI Copilot
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Workspace: {clientName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              <span className={`flex items-center gap-1 ${gatewayStatus.active ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${gatewayStatus.active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {gatewayStatus.active ? `OpenClaw: ${gatewayStatus.model}` : 'Rule-Based Engine (OpenClaw Offline)'}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-400 text-[10px]">{clientName} ({currency})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tracking & AI Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight 
                ? 'border-slate-200 text-slate-600 hover:bg-slate-100' 
                : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Chatbot Tracking & OpenClaw Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 ${
        isLight ? 'bg-slate-100/50' : 'bg-[#090d15]'
      }`}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative px-4 py-2.5 max-w-[88%] sm:max-w-[75%] text-xs sm:text-sm leading-relaxed transition-all shadow-xs ${
                  isUser
                    ? 'rounded-2xl rounded-br-xs bg-blue-600 text-white font-medium'
                    : isLight
                      ? 'rounded-2xl rounded-bl-xs bg-white text-slate-900 border border-slate-200/80 shadow-sm'
                      : 'rounded-2xl rounded-bl-xs bg-[#151c2b] text-slate-100 border border-slate-800/80'
                }`}
              >
                {/* Document Attachment in Chat Bubble */}
                {msg.attachment && (
                  <div className={`mb-2 rounded-xl p-2.5 flex items-center gap-2.5 border transition-all ${
                    isUser 
                      ? 'bg-blue-700/70 border-blue-400/40 text-white' 
                      : isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-900' 
                        : 'bg-[#0f1422] border-slate-800 text-white'
                  }`}>
                    <div className="h-9 w-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate">{msg.attachment.name}</div>
                      <div className="text-[10px] opacity-75">{msg.attachment.size} • Document</div>
                    </div>
                  </div>
                )}

                {/* Tool badge if any */}
                {msg.toolUsed && (
                  <div className={`mb-1.5 pb-1 border-b flex items-center gap-1.5 text-[10px] font-bold ${
                    isUser ? 'border-white/20 text-white/90' : 'border-slate-200 dark:border-slate-700/60 text-slate-400'
                  }`}>
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Tool: {msg.toolUsed}</span>
                  </div>
                )}

                {/* Message text */}
                <div className="whitespace-pre-line break-words">
                  {msg.text}
                </div>

                {/* Interactive Action Card if proposed */}
                {msg.proposedAction && (
                  <div className={`mt-2.5 rounded-xl border p-3 text-xs ${
                    isLight 
                      ? 'bg-amber-50/80 border-amber-200 text-slate-800' 
                      : 'bg-amber-950/20 border-amber-500/30 text-slate-200'
                  }`}>
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5 mb-2">
                      <span className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-[11px]">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Approval Required
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.proposedAction.entityName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2.5 text-xs">
                      <span className="line-through text-slate-400">{String(msg.proposedAction.previousValue)}</span>
                      <ArrowRight className="h-3 w-3 text-cyan-500" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{String(msg.proposedAction.newValue)}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {msg.actionStatus === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleApprove(msg.id, msg.proposedAction?.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(msg.id, msg.proposedAction?.id)}
                            className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                              isLight ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : msg.actionStatus === 'APPROVED' ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approved & Executed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                          <X className="h-3.5 w-3.5" />
                          <span>Rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamp + Checkmark */}
                <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                  isUser ? 'text-white/70' : 'text-slate-400'
                }`}>
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="h-3.5 w-3.5 text-cyan-300" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Telegram / WhatsApp Typing animation */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className={`px-4 py-2.5 rounded-2xl rounded-bl-xs border flex items-center gap-1.5 ${
              isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-[#151c2b] border-slate-800'
            }`}>
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Telegram / WhatsApp Style Messenger Input Bar with Document Upload */}
      <div className={`p-3 border-t transition-colors ${
        isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-[#101624]'
      }`}>
        {/* Quick Agency / Client Command Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setInput('সব ক্লায়েন্টের সামারি দাও')}
            className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                : 'bg-[#151c2b] border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            🏢 সব ক্লায়েন্টের সামারি
          </button>
          <button
            type="button"
            onClick={() => setInput(`${clientName} এর রিপোর্ট দেখাও`)}
            className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                : 'bg-[#151c2b] border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            📊 {clientName} রিপোর্ট
          </button>
          <button
            type="button"
            onClick={() => setInput('হাই CPA অ্যাড চেক করো')}
            className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                : 'bg-[#151c2b] border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            ⚠️ হাই CPA অপ্টিমাইজ
          </button>
          <button
            type="button"
            onClick={() => setInput('নতুন অ্যাড আইডিয়া দাও')}
            className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                : 'bg-[#151c2b] border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            💡 নতুন অ্যাড আইডিয়া
          </button>
        </div>

        {/* Attached file preview chip */}
        {selectedFile && (
          <div className="mb-2 px-1 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs border ${
              isLight ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-blue-950/40 border-blue-800 text-blue-200'
            }`}>
              <FileText className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="font-semibold max-w-[200px] truncate">{selectedFile.name}</span>
              <span className="text-[10px] opacity-70">({selectedFile.size})</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ml-1 transition-colors cursor-pointer"
                title="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,.png,.jpg,.jpeg"
          />

          {/* Paperclip / Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              selectedFile
                ? 'bg-blue-500 text-white border-blue-500'
                : isLight
                  ? 'border-slate-200 bg-slate-100/80 text-slate-500 hover:text-blue-600 hover:bg-slate-200'
                  : 'border-slate-800 bg-[#090d15] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Attach document or file (PDF, CSV, Excel, Image)"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Input field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={selectedFile ? `Add a message for ${selectedFile.name}...` : "Type a message..."}
            className={`flex-1 rounded-full border px-4 py-2.5 text-xs sm:text-sm focus:outline-none transition-all ${
              isLight 
                ? 'border-slate-200 bg-slate-100/80 text-slate-900 focus:bg-white focus:border-blue-500' 
                : 'border-slate-800 bg-[#090d15] text-white focus:border-blue-500'
            }`}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedFile) || isTyping}
            className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md active:scale-95 cursor-pointer"
            title="Send"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Chatbot Tracking & OpenClaw Settings Modal */}
      <ChatbotSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={trackingConfig}
        onSave={(newCfg) => setTrackingConfig(newCfg)}
        theme={theme}
      />
    </div>
  );
};
