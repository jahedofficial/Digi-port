# Architecture Document 04: Folder Structure
## Enterprise Codebase Directory Tree, Adapter Internals & Module Hierarchy

**Version:** 2.0.0  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Standard:** Complete Project File & Folder Organization

---

### 1. Master System Folder Tree

```text
c:\Projects\Digital Marketr\
├── .agents/
│   └── rules/
│       └── guidelines.md                     # Agent Pair-Programming & System Rules
├── assets/                                   # Static Asset & Configuration Repository (22 directories)
│   ├── agent-capabilities/                   # Platform-aware specialist capabilities
│   │   ├── cross-platform/
│   │   │   └── audit-agent.json
│   │   ├── google/
│   │   │   └── campaign-agent.json
│   │   ├── meta/
│   │   │   └── campaign-agent.json
│   │   └── tiktok/
│   │       └── campaign-agent.json
│   ├── industry-templates/                   # 10 Reusable vertical marketing templates
│   │   └── ecommerce.json
│   ├── knowledge/                            # Static versioned platform reference manuals
│   │   ├── cross-platform/
│   │   │   └── attribution-modeling.md
│   │   ├── google/
│   │   │   └── google-ads-core.md
│   │   ├── meta/
│   │   │   └── meta-ads-capi.md
│   │   └── tiktok/
│   │       └── tiktok-events-api.md
│   ├── playbooks/                            # Execution playbooks per platform
│   │   ├── cross-platform/
│   │   ├── google/
│   │   ├── meta/
│   │   │   └── advantage-plus-sales.json
│   │   └── tiktok/
│   ├── prompt-templates/                     # Reusable deterministic prompt skeletons
│   │   ├── cross-platform/
│   │   │   └── campaign-audit.md
│   │   ├── google/
│   │   ├── meta/
│   │   └── tiktok/
│   ├── report-scoring/                       # Audit scoring algorithms and weights
│   │   └── scoring-engine.json
│   ├── report-templates/                     # PDF/DOCX/HTML Markdown report generators
│   ├── schedules/                            # Cron schedules and event-trigger definitions
│   │   └── heartbeat-cron.json
│   └── workflows/                            # DAG workflow execution schemas
│       └── ad-launch-workflow.json
├── data/                                     # Isolated Persistent Storage
│   └── system_settings.enc.json             # AES-256 fallback encrypted credential store
├── docs/                                     # System Documentation & Specifications
│   ├── architecture/                         # 14 Architecture Documents
│   │   ├── 01-system-architecture.md
│   │   ├── 02-component-diagram.md
│   │   ├── 03-execution-flow.md
│   │   ├── 04-folder-structure.md
│   │   ├── 05-dependency-graph.md
│   │   ├── 06-data-flow.md
│   │   ├── 07-system-lifecycle.md
│   │   ├── 08-interface-contracts.md
│   │   ├── 09-execution-contracts.md
│   │   ├── 10-deployment-architecture.md
│   │   ├── 11-security-architecture.md
│   │   ├── 12-platform-adapter-architecture.md
│   │   ├── 13-cross-platform-data-model.md
│   │   ├── 14-credential-token-management.md
│   │   ├── ENTERPRISE_BLUEPRINT.md
│   │   └── SYSTEM_ARCHITECTURE.md
│   └── policies/                             # 12 System Operational Policies
│       ├── P01-ceo-agent-policy.md
│       ├── P02-specialist-agent-policy.md
│       ├── P03-memory-policy.md
│       ├── P04-playbook-policy.md
│       ├── P05-industry-template-policy.md
│       ├── P06-knowledge-base-policy.md
│       ├── P07-scheduling-policy.md
│       ├── P08-approval-workflow-policy.md
│       ├── P09-logging-policy.md
│       ├── P10-error-handling-policy.md
│       ├── P11-rate-limit-quota-policy.md
│       └── P12-multi-client-isolation-policy.md
├── prisma/
│   └── schema.prisma                         # Relational Data Model (Campaigns, Actions, Logs)
├── scripts/
│   ├── fix-postgres-password.bat
│   └── setup-openclaw.sh                     # Docker Setup & OpenRouter Integration
├── src/
│   ├── app/                                  # Next.js 16 App Router
│   │   ├── api/                              # Backend Route Handlers
│   │   │   ├── ai/chat/                      # OpenClaw / OpenRouter Completion Gateway
│   │   │   ├── platforms/                    # Direct Platform Test & Verification
│   │   │   │   ├── ai/test/
│   │   │   │   ├── google/
│   │   │   │   ├── meta/
│   │   │   │   └── tiktok/
│   │   │   ├── settings/                     # Credential & System Settings
│   │   │   ├── telegram/                     # Telegram Bot Webhooks & Sender
│   │   │   └── track/                        # CAPI & Pixel Ingestion Engine
│   │   ├── globals.css                       # Tailwind CSS v4 Styles
│   │   ├── layout.tsx                        # Global App Layout & Themes
│   │   └── page.tsx                          # Dashboard Master View
│   ├── components/                           # Modern React 19 Client Components
│   │   ├── AdsPerformanceEngineDashboard.tsx # Multi-Channel Metrics Dashboard
│   │   ├── AiGrowthCopilotView.tsx           # Copilot Chat & Interactive Controls
│   │   ├── ChatbotSettingsModal.tsx          # Fast Chatbot Config Modal
│   │   ├── PlatformConnectionHubModal.tsx    # 5-Tab Official OAuth & Direct Credentials Hub
│   │   └── TikTokAdsIntelligenceDashboard.tsx# TikTok Deep Analytics View
│   ├── lib/                                  # Core Runtime Services & Business Engines
│   │   ├── agent-runner.ts                   # Deterministic Specialist Execution Logic
│   │   ├── credential-manager.ts             # Direct Token Resolution & OAuth Refresh
│   │   ├── encryption.ts                     # AES-256-GCM Token Encryption Vault
│   │   ├── prisma.ts                         # Prisma Client Singleton
│   │   ├── settings-db.ts                    # Dual DB/Encrypted Store Service
│   │   └── telegram-service.ts               # Telegram Bot Alert Dispatcher
│   └── types/                                # Strict TypeScript Interface Definitions
│       ├── adapters.ts                       # Platform Adapter & Entity Interfaces
│       ├── credentials.ts                    # Credential Contract & Scopes
│       └── marketing.ts                      # Normalized Campaign & Conversion Models
├── .env.example                              # Specification of 22 Direct API Variables
├── .env.local                                # Active Local Secrets (Ignored in Git)
├── package.json
└── tsconfig.json
```

---

### 2. Platform Adapter Internals (`src/lib/adapters/`)

Each platform adapter implements a strict structural layout:
```text
src/lib/adapters/
├── google/
│   ├── GoogleAdsAdapter.ts          # Google Ads API v17 Client
│   ├── GoogleGa4Adapter.ts           # GA4 Measurement Protocol Client
│   ├── GoogleGtmAdapter.ts           # GTM Container API Client
│   ├── google-query-builder.ts       # GAQL (Google Ads Query Language) Generator
│   └── types.ts                      # Platform-specific Google Types
├── meta/
│   ├── MetaGraphAdapter.ts           # Meta Graph API v20.0 Client
│   ├── MetaCapiAdapter.ts            # Conversions API Direct HTTP Dispatcher
│   ├── meta-rate-limiter.ts          # Meta App Usage Header (X-Business-Use-Case) Watchdog
│   └── types.ts                      # Platform-specific Meta Types
└── tiktok/
    ├── TikTokBusinessAdapter.ts      # TikTok Open API v1.3 Client
    ├── TikTokEventsAdapter.ts        # TikTok Events API Dispatcher
    └── types.ts                      # Platform-specific TikTok Types
```
