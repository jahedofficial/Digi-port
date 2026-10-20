'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Send,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Truck,
  ExternalLink,
  Search,
  Filter,
  Check,
  Edit3,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export type ChannelType = 'ALL' | 'MESSENGER' | 'INSTAGRAM' | 'WHATSAPP' | 'TIKTOK';
export type ConversationFilter = 'ALL' | 'AI_HANDLING' | 'NEEDS_HUMAN' | 'ORDER_READY' | 'RESOLVED';
export type AiMode = 'DRAFT' | 'HYBRID' | 'AUTO';

export interface ChatMessage {
  id: string;
  sender: 'CUSTOMER' | 'AI' | 'AGENT';
  text: string;
  timestamp: string;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  voiceTranscript?: string;
  aiConfidence?: number;
  aiSourceCited?: string;
  requiresHandoff?: boolean;
  isDraft?: boolean;
}

export interface ConversationItem {
  id: string;
  customerName: string;
  customerPhone?: string;
  avatarUrl?: string;
  channel: 'MESSENGER' | 'INSTAGRAM' | 'WHATSAPP' | 'TIKTOK';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'AI_HANDLING' | 'NEEDS_HUMAN' | 'ORDER_READY' | 'RESOLVED';
  aiMode: AiMode;
  language: 'Bangla' | 'Banglish' | 'English';
  suggestedDraft?: string;
  draftConfidence?: number;
  draftSource?: string;
  orderData?: {
    productName: string;
    variant: string;
    price: number;
    deliveryFee: number;
    address: string;
    phone: string;
    paymentMethod: 'COD' | 'BKASH';
  };
  messages: ChatMessage[];
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-1',
    customerName: 'Tanvir Ahmed',
    customerPhone: '01712-345678',
    channel: 'MESSENGER',
    lastMessage: 'Vai black color ta ki available ache? Size L lagbe.',
    lastMessageTime: '২ মিনিট আগে',
    unreadCount: 1,
    status: 'AI_HANDLING',
    aiMode: 'HYBRID',
    language: 'Banglish',
    suggestedDraft: 'জি তানভীর ভাই! আমাদের Premium Cotton Polo এর Black কালার L সাইজ এভেইলেবল আছে। প্রাইস ৳৭৫০ টাকা। ডেলিভারির জন্য আপনার নাম, ঠিকানা ও ফোন নাম্বার পাঠালে আমরা আজই কনফার্ম করে দেবো।',
    draftConfidence: 94,
    draftSource: 'Product Catalog #POLO-BLK-L (Stock: 18 pcs)',
    orderData: {
      productName: 'Premium Cotton Polo - Black (L)',
      variant: 'L / Black',
      price: 750,
      deliveryFee: 70,
      address: 'House 14, Road 5, Dhanmondi, Dhaka',
      phone: '01712-345678',
      paymentMethod: 'COD'
    },
    messages: [
      {
        id: 'm1',
        sender: 'CUSTOMER',
        text: 'Assalamu Alaikum, apnader polo sharter price koto?',
        timestamp: '10:14 AM'
      },
      {
        id: 'm2',
        sender: 'AI',
        text: 'ওয়ালাইকুম আসসালাম! আমাদের Premium Cotton Polo ৳৭৫০ টাকা। সাইজ M, L, XL, XXL এভেইলেবল আছে। আপনি কোন সাইজ ও কালার দেখতে চাচ্ছেন?',
        timestamp: '10:14 AM',
        aiConfidence: 98,
        aiSourceCited: 'Product Catalog #POLO-01'
      },
      {
        id: 'm3',
        sender: 'CUSTOMER',
        text: 'Vai black color ta ki available ache? Size L lagbe.',
        timestamp: '10:15 AM'
      }
    ]
  },
  {
    id: 'conv-2',
    customerName: 'Nusrat Jahan',
    customerPhone: '01890-112233',
    channel: 'WHATSAPP',
    lastMessage: 'Customer Voice Note (0:14s) - Speech-to-Text transcribed',
    lastMessageTime: '৫ মিনিট আগে',
    unreadCount: 1,
    status: 'NEEDS_HUMAN',
    aiMode: 'DRAFT',
    language: 'Bangla',
    suggestedDraft: 'আপু আপনার পার্সেলটি গতকাল Steadfast কুরিয়ারে দেওয়া হয়েছে। ট্র্যাকিং আইডি: ST-884920। আজ বিকেলের মধ্যে ডেলিভারি রাইডার আপনার সাথে যোগাযোগ করবে।',
    draftConfidence: 89,
    draftSource: 'Steadfast Consignment #ST-884920 (Status: In Transit)',
    orderData: {
      productName: 'Silk Party Abaya - Navy',
      variant: 'Size 54',
      price: 2450,
      deliveryFee: 130,
      address: 'Nasirabad Housing, Chattogram',
      phone: '01890-112233',
      paymentMethod: 'BKASH'
    },
    messages: [
      {
        id: 'm20',
        sender: 'CUSTOMER',
        text: 'Ami 2 din age order korsilam kintu tracking number paini.',
        timestamp: '10:02 AM'
      },
      {
        id: 'm21',
        sender: 'CUSTOMER',
        text: '[Voice Note Audio 0:14s]',
        isVoiceNote: true,
        voiceDuration: '0:14',
        voiceTranscript: 'ভাইয়া আমার পার্সেলটা কি আজকে চিটাগংয়ে পৌঁছাবে? ডেলিভারি ম্যানের কোনো নাম্বার কি দেওয়া যাবে?',
        timestamp: '10:05 AM'
      }
    ]
  },
  {
    id: 'conv-3',
    customerName: 'Ariful Islam (Chaldal user)',
    customerPhone: '01911-889900',
    channel: 'INSTAGRAM',
    lastMessage: 'Dhaka baire delivery charge koto ar advance koto dite hobe?',
    lastMessageTime: '১২ মিনিট আগে',
    unreadCount: 0,
    status: 'AI_HANDLING',
    aiMode: 'AUTO',
    language: 'Banglish',
    suggestedDraft: 'ঢাকার বাইরে ডেলিভারি চার্জ মাত্র ৳১৩০ টাকা। ক্যাশ অন ডেলিভারিতে সম্পূর্ণ টাকা ডেলিভারি নেওয়ার সময় দিতে পারবেন, কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই!',
    draftConfidence: 96,
    draftSource: 'Delivery & Policy Guide #BD-OUTSIDE-DHAKA',
    messages: [
      {
        id: 'm31',
        sender: 'CUSTOMER',
        text: 'Dhaka baire delivery charge koto ar advance koto dite hobe?',
        timestamp: '9:58 AM'
      },
      {
        id: 'm32',
        sender: 'AI',
        text: 'ঢাকার বাইরে ডেলিভারি চার্জ মাত্র ৳১৩০ টাকা। ক্যাশ অন ডেলিভারিতে সম্পূর্ণ টাকা ডেলিভারি নেওয়ার সময় দিতে পারবেন, কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই!',
        timestamp: '9:58 AM',
        aiConfidence: 96,
        aiSourceCited: 'Delivery Policy (Auto-Sent)'
      }
    ]
  },
  {
    id: 'conv-4',
    customerName: 'Mehedi Hasan',
    customerPhone: '01622-445566',
    channel: 'TIKTOK',
    lastMessage: 'Order confirmed! Name: Mehedi Hasan, Uttara Sector 11',
    lastMessageTime: '২৫ মিনিট আগে',
    unreadCount: 0,
    status: 'ORDER_READY',
    aiMode: 'HYBRID',
    language: 'English',
    suggestedDraft: 'Thank you Mehedi! Your order is recorded. Total: ৳1,200 (COD). Dispatching via Pathao Courier today.',
    draftConfidence: 98,
    draftSource: 'Order Capture Engine',
    orderData: {
      productName: 'Sneaker Pro Edition - White',
      variant: 'Size 42',
      price: 1130,
      deliveryFee: 70,
      address: 'Road 18, Sector 11, Uttara, Dhaka',
      phone: '01622-445566',
      paymentMethod: 'COD'
    },
    messages: [
      {
        id: 'm41',
        sender: 'CUSTOMER',
        text: 'Bro, I want to take the White Sneaker size 42. Address: Road 18, Sector 11, Uttara, Dhaka. Phone: 01622-445566.',
        timestamp: '9:30 AM'
      },
      {
        id: 'm42',
        sender: 'AGENT',
        text: 'অর্ডারটি কনফার্ম করা হয়েছে! ট্র্যাকিং লিঙ্ক মেসেজে দিয়ে দিচ্ছি। ধন্যবাদ!',
        timestamp: '9:32 AM'
      }
    ]
  }
];

interface UnifiedInboxViewProps {
  theme?: 'light' | 'dark';
}

export const UnifiedInboxView: React.FC<UnifiedInboxViewProps> = ({ theme = 'light' }) => {
  const isLight = theme === 'light';

  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('ALL');
  const [selectedFilter, setSelectedFilter] = useState<ConversationFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Chat State
  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const [replyInput, setReplyInput] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [orderConfirmedToast, setOrderConfirmedToast] = useState(false);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (selectedChannel !== 'ALL' && c.channel !== selectedChannel) return false;
    if (selectedFilter !== 'ALL' && c.status !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        (c.customerPhone && c.customerPhone.includes(q)) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendDraft = (draftText: string) => {
    if (!draftText.trim()) return;

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'AGENT',
      text: draftText,
      timestamp: 'এখনই'
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: draftText,
            lastMessageTime: 'এখনই',
            unreadCount: 0,
            status: 'RESOLVED',
            suggestedDraft: undefined,
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      })
    );

    setReplyInput('');
  };

  const handleManualSend = () => {
    if (!replyInput.trim()) return;
    handleSendDraft(replyInput);
  };

  const handleHandoffToHuman = () => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return { ...c, status: 'NEEDS_HUMAN' };
        }
        return c;
      })
    );
  };

  const handleConfirmOrder = () => {
    setOrderConfirmedToast(true);
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return { ...c, status: 'ORDER_READY' };
        }
        return c;
      })
    );
    setTimeout(() => setOrderConfirmedToast(false), 4000);
  };

  const getChannelBadge = (ch: ConversationItem['channel']) => {
    switch (ch) {
      case 'MESSENGER':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-200">Messenger</span>;
      case 'INSTAGRAM':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-500/10 text-pink-600 border border-pink-200">Instagram</span>;
      case 'WHATSAPP':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">WhatsApp</span>;
      case 'TIKTOK':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/10 text-slate-800 dark:text-slate-200 border border-slate-300">TikTok</span>;
    }
  };

  const getStatusBadge = (st: ConversationItem['status']) => {
    switch (st) {
      case 'AI_HANDLING':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-300/40">
            <Bot className="h-3 w-3" /> AI Handling
          </span>
        );
      case 'NEEDS_HUMAN':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-300/40">
            <AlertCircle className="h-3 w-3" /> Needs Human
          </span>
        );
      case 'ORDER_READY':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-300/40">
            <ShoppingBag className="h-3 w-3" /> Order Confirmed
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 border border-slate-300/40">
            <Check className="h-3 w-3" /> Resolved
          </span>
        );
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-70px)] select-none ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0d14] text-white'}`}>
      {/* Top Banner / Operational Metric Summary */}
      <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0f141f] border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight">
                F-Commerce Unified Inbox & AI Copilot
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-600 border border-cyan-300/30">
                LIVE v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Facebook Messenger • Instagram DM • WhatsApp Cloud • TikTok Shop
            </p>
          </div>
        </div>

        {/* Live Copilot KPIs */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <Clock className="h-4 w-4 text-cyan-500" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-3">Avg Response Time</span>
              <span className="font-bold text-cyan-500">42 seconds</span>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <Bot className="h-4 w-4 text-emerald-500" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-3">AI Auto Resolution</span>
              <span className="font-bold text-emerald-500">68.4%</span>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <ShoppingBag className="h-4 w-4 text-purple-500" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-3">Orders Captured Today</span>
              <span className="font-bold text-purple-500">৳24,500 (14)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Work Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===================== COLUMN 1: Conversation List ===================== */}
        <div className={`w-80 sm:w-96 border-r flex flex-col shrink-0 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0d121c] border-slate-800'
        }`}>
          {/* Channel selector pill tabs */}
          <div className="p-3 border-b space-y-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {(['ALL', 'MESSENGER', 'WHATSAPP', 'INSTAGRAM', 'TIKTOK'] as ChannelType[]).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                    selectedChannel === ch
                      ? 'bg-indigo-600 text-white'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ch === 'ALL' ? 'All Channels' : ch.charAt(0) + ch.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer, phone, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-slate-400 font-semibold">Filter:</span>
              {(['ALL', 'AI_HANDLING', 'NEEDS_HUMAN', 'ORDER_READY'] as ConversationFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                    selectedFilter === f
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No conversations match your filter.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3 cursor-pointer transition-all ${
                      isSelected
                        ? isLight
                          ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                          : 'bg-indigo-950/40 border-l-4 border-indigo-500'
                        : isLight
                        ? 'hover:bg-slate-50'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-xs shrink-0 text-white">
                          {conv.customerName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs truncate">{conv.customerName}</span>
                            {getChannelBadge(conv.channel)}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {conv.customerPhone || 'Anonymous User'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {conv.lastMessage}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div>{getStatusBadge(conv.status)}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {conv.language}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="h-4 w-4 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===================== COLUMN 2: Active Chat Feed & Copilot Draft ===================== */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Active Chat Header */}
          <div className={`p-3.5 border-b flex items-center justify-between gap-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0f141f] border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                {activeConv.customerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-sm">{activeConv.customerName}</h2>
                  {getChannelBadge(activeConv.channel)}
                  {getStatusBadge(activeConv.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Phone className="h-3 w-3" />
                  <span>{activeConv.customerPhone || 'No phone attached'}</span>
                  <span>•</span>
                  <span>Detected Language: <b className="text-indigo-400">{activeConv.language}</b></span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleHandoffToHuman}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeConv.status === 'NEEDS_HUMAN'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-300'
                    : isLight
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    : 'border-slate-700 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Handoff to Human</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Scroll */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeConv.messages.map((msg) => {
              const isCust = msg.sender === 'CUSTOMER';
              const isAi = msg.sender === 'AI';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCust ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {isCust ? activeConv.customerName : isAi ? 'AI Copilot' : 'Agent'}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    {msg.aiConfidence && (
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded">
                        {msg.aiConfidence}% match
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-xs ${
                      isCust
                        ? isLight
                          ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                          : 'bg-[#151b28] border border-slate-700 text-white rounded-tl-xs'
                        : isAi
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-xs'
                        : 'bg-indigo-600 text-white rounded-tr-xs'
                    }`}
                  >
                    {/* Voice Note Audio Player Simulation */}
                    {msg.isVoiceNote ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                            className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            {isPlayingVoice ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>Customer Audio ({msg.voiceDuration})</span>
                              <span>{isPlayingVoice ? '0:07 / 0:14' : 'Ready'}</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-indigo-500 rounded-full transition-all duration-300 ${
                                  isPlayingVoice ? 'w-1/2' : 'w-0'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* STT Transcript */}
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200">
                          <div className="flex items-center gap-1 font-bold text-indigo-500 mb-0.5 text-[10px]">
                            <Sparkles className="h-3 w-3" /> Voice-to-Text Transcript (Bangla STT):
                          </div>
                          "{msg.voiceTranscript}"
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    )}

                    {msg.aiSourceCited && (
                      <div className="mt-2 pt-2 border-t border-white/20 text-[10px] text-indigo-100 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Grounded Source: {msg.aiSourceCited}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Copilot Smart Draft Card */}
          {activeConv.suggestedDraft && (
            <div className={`mx-4 mb-2 p-3.5 rounded-xl border transition-all ${
              isLight
                ? 'bg-indigo-50/90 border-indigo-200 shadow-sm'
                : 'bg-indigo-950/50 border-indigo-800/60 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                    AI Copilot Suggested Draft
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 border border-emerald-300/30">
                    {activeConv.draftConfidence}% Confidence
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Language: {activeConv.language}
                </span>
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900 leading-relaxed font-sans">
                {activeConv.suggestedDraft}
              </p>

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-500" /> Grounded: {activeConv.draftSource}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setReplyInput(activeConv.suggestedDraft || '')}
                    className="px-2.5 py-1 rounded-lg border text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center gap-1"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleSendDraft(activeConv.suggestedDraft || '')}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="h-3 w-3" /> Approve & Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message Input Box */}
          <div className={`p-3 border-t flex items-center gap-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0f141f] border-slate-800'
          }`}>
            <input
              type="text"
              placeholder={`Reply to ${activeConv.customerName} in Bangla, Banglish, or English...`}
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSend()}
              className={`flex-1 px-3.5 py-2 rounded-xl text-xs border outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
              }`}
            />
            <button
              onClick={handleManualSend}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* ===================== COLUMN 3: Customer Profile & Order Capture ===================== */}
        <div className={`w-80 border-l p-4 overflow-y-auto space-y-4 shrink-0 hidden lg:block ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0d121c] border-slate-800'
        }`}>
          {/* Section: Customer Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-black tracking-wider uppercase text-slate-400">
              Customer Details
            </h3>

            <div className={`p-3 rounded-xl border space-y-2 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-500" />
                <span className="font-bold">{activeConv.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{activeConv.customerPhone || '01712-XXXXXX'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{activeConv.orderData?.address || 'Dhaka, Bangladesh'}</span>
              </div>
            </div>
          </div>

          {/* Section: Conversational Order Capture */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-purple-500" /> Order Capture
              </h3>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Auto-Extracted
              </span>
            </div>

            {activeConv.orderData ? (
              <div className={`p-3.5 rounded-xl border space-y-3 text-xs ${
                isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-purple-950/20 border-purple-800/40'
              }`}>
                <div>
                  <span className="text-[10px] text-slate-400 block">Product</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {activeConv.orderData.productName}
                  </p>
                  <span className="text-[10px] text-purple-600 font-semibold">
                    {activeConv.orderData.variant}
                  </span>
                </div>

                <div className="pt-2 border-t border-purple-200/40 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Price</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ৳{activeConv.orderData.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Charge</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ৳{activeConv.orderData.deliveryFee}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-purple-200/40">
                    <span>Total Due</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      ৳{activeConv.orderData.price + activeConv.orderData.deliveryFee}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-200/40 space-y-1 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Truck className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Courier: <b>Steadfast / Pathao COD</b></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Method: <b>Cash on Delivery</b></span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmOrder}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm & Send to Courier</span>
                </button>
              </div>
            ) : (
              <div className="p-4 border rounded-xl text-center text-xs text-slate-400">
                No active order details in this chat.
              </div>
            )}

            {orderConfirmedToast && (
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-400 text-emerald-600 text-[11px] font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="h-4 w-4" /> Order confirmed! Steadfast parcel booked.
              </div>
            )}
          </div>

          {/* Section: Grounded Knowledge Quick Look */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" /> Quick Knowledge
            </h3>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>Inside Dhaka Delivery</span>
                <b className="text-indigo-500">৳70 (24-48h)</b>
              </div>
              <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>Outside Dhaka Delivery</span>
                <b className="text-indigo-500">৳130 (48-72h)</b>
              </div>
              <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>bKash Merchant</span>
                <b className="text-pink-500 font-mono">01700-000000</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
