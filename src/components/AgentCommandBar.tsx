'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  Check, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { processAgentCommand, AgentResponse } from '@/lib/agent-runner';
import { CampaignData, CreativeData, ActionQueueItem } from '@/types';

interface AgentCommandBarProps {
  activeTab: string;
  activePlatform: string;
  campaigns: CampaignData[];
  creatives: CreativeData[];
  onActionCreated: (action: ActionQueueItem) => void;
  onActionApproved: (actionId: string) => void;
  onActionRejected: (actionId: string) => void;
}

export const AgentCommandBar: React.FC<AgentCommandBarProps> = ({
  activeTab,
  activePlatform,
  campaigns,
  creatives,
  onActionCreated,
  onActionApproved,
  onActionRejected,
}) => {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<{
    id: string;
    query: string;
    response: AgentResponse;
    timestamp: string;
    actionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }[]>([]);

  const samplePrompts = [
    'গত ৭ দিনের Meta report বানাও',
    'CPA $8 এর বেশি ad গুলো pause করো',
    'Dhaka City campaign এর budget ২০% বাড়াও',
    'কোন creative fatigue হচ্ছে?',
    'TikTok এর best ad এর মতো ৩টা নতুন idea দাও',
    'আজকের audit করো',
  ];

  const handleExecute = (cmdText?: string) => {
    const textToRun = cmdText || command;
    if (!textToRun.trim() || isProcessing) return;

    setIsProcessing(true);

    setTimeout(() => {
      const res = processAgentCommand(textToRun, {
        activePlatform,
        campaigns,
        creatives,
      });

      let currentActionStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;

      if (res.proposedAction) {
        currentActionStatus = 'PENDING';
        onActionCreated(res.proposedAction as ActionQueueItem);
      }

      setHistory((prev) => [
        {
          id: `msg-${Date.now()}`,
          query: textToRun,
          response: res,
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          actionStatus: currentActionStatus,
        },
        ...prev,
      ]);

      setCommand('');
      setIsProcessing(false);
    }, 600);
  };

  const handleApproveAction = (itemHistoryId: string, actionId?: string) => {
    if (actionId) {
      onActionApproved(actionId);
    }
    setHistory((prev) =>
      prev.map((item) =>
        item.id === itemHistoryId ? { ...item, actionStatus: 'APPROVED' } : item
      )
    );
  };

  const handleRejectAction = (itemHistoryId: string, actionId?: string) => {
    if (actionId) {
      onActionRejected(actionId);
    }
    setHistory((prev) =>
      prev.map((item) =>
        item.id === itemHistoryId ? { ...item, actionStatus: 'REJECTED' } : item
      )
    );
  };

  return (
    <div className="w-full">
      {/* Command Box Container */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 p-3 shadow-xl backdrop-blur-xl sm:p-4">
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Input row */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 flex-1 rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
              placeholder="In-App AI Agent কে কমান্ড দিন... (যেমন: 'CPA $8 এর বেশি ad গুলো pause করো')"
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none sm:text-sm"
            />
            {command && (
              <button
                onClick={() => setCommand('')}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => handleExecute()}
            disabled={!command.trim() || isProcessing}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>প্রসেস হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Command Run</span>
              </>
            )}
          </button>
        </div>

        {/* Prompt Chips */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs">
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 whitespace-nowrap pl-1">
            <Lightbulb className="h-3 w-3 text-amber-400" />
            কুইক কমান্ড:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleExecute(prompt)}
              className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Response Stream & History */}
      {history.length > 0 && (
        <div className="mt-4 space-y-3">
          {history.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-md"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">
                    Agent Action ({item.response.toolUsed})
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.response.toolType === 'WRITE' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.response.toolType === 'WRITE' ? 'Write Action (Needs Approval)' : 'Read Query (Executed)'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  কমান্ড: <span className="text-slate-300 italic">"{item.query}"</span> • {item.timestamp}
                </div>
              </div>

              {/* Message text */}
              <div className="mt-3 text-xs leading-relaxed text-slate-200 sm:text-sm whitespace-pre-line">
                {item.response.reply}
              </div>

              {/* Ideas Output if any */}
              {item.response.ideas && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {item.response.ideas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-3"
                    >
                      <h4 className="text-xs font-bold text-purple-300">{idea.title}</h4>
                      <p className="mt-1 text-[11px] font-medium text-slate-300">
                        <strong className="text-purple-400">Hook:</strong> {idea.hook}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        <strong className="text-slate-300">Script:</strong> {idea.scriptOutline}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-500">
                        🎬 {idea.visualNotes}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Report Summary Data if any */}
              {item.response.reportData && (
                <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">
                      {item.response.reportData.title}
                    </span>
                    <button
                      onClick={() => alert('PDF রিপোর্ট ডাউনলোড সফল হয়েছে!')}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      PDF/Excel Download
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {Object.entries(item.response.reportData.metrics).map(([key, val]) => (
                      <div key={key} className="rounded bg-slate-900 p-2 text-center">
                        <div className="text-[10px] text-slate-400">{key}</div>
                        <div className="text-xs font-bold text-white">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Card (Human-in-the-Loop) */}
              {item.response.requiresApproval && item.response.proposedAction && (
                <div className="mt-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-slate-900/50 p-3.5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">
                          Human-in-the-Loop Approval Required
                        </span>
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                          Guardrail Checked
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {item.response.proposedAction.entityName} •{' '}
                        <span className="text-slate-400 line-through">
                          {String(item.response.proposedAction.previousValue)}
                        </span>{' '}
                        <ArrowRight className="inline h-3 w-3 text-cyan-400" />{' '}
                        <span className="font-bold text-emerald-400">
                          {String(item.response.proposedAction.newValue)}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        কারণ: {item.response.proposedAction.reason}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {item.actionStatus === 'PENDING' ? (
                        <>
                          <button
                            onClick={() =>
                              handleApproveAction(item.id, item.response.proposedAction?.id)
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve & Execute
                          </button>
                          <button
                            onClick={() =>
                              handleRejectAction(item.id, item.response.proposedAction?.id)
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      ) : item.actionStatus === 'APPROVED' ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="h-4 w-4" />
                          Approved & Executed in Ads Manager!
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30">
                          <X className="h-4 w-4" />
                          Action Rejected by Owner
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
