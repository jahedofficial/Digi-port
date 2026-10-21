# Enterprise Specification & Execution Master Blueprint
## Universal Paid Media AI Operating System (Phases 0–17)
**Target Platforms:** Google Ads, Google Analytics 4, Google Tag Manager, Google Merchant Center, Google Search Console, Meta Ads, TikTok Ads  
**Deployment Environment:** Hostinger VPS, Ubuntu Linux, Docker, Docker Compose  
**Application Stack:** Node.js LTS, TypeScript, Next.js 16 (App Router) / NestJS Core, PostgreSQL, Redis, BullMQ  
**LLM & Agent Reasoning:** OpenClaw Gateway (v2026.7.1-2 / port 18789), OpenRouter (reasoning and decision-making only)  
**Platform Integration Layer:** Direct Platform Adapters to Official APIs (Google, Meta, TikTok)

---

## Phase 0 — Project Rules & Operational Invariants
We are building a production-grade Universal Paid Media AI Operating System that manages Google, Meta, and TikTok marketing across multiple clients and industries. Follow these rules throughout the entire project:

### Operational Rules
• **Never build everything at once.**  
• **Work strictly phase-by-phase.** Complete only the current phase.  
• **Never implement future phases.** Never skip or reorder phases unless explicitly instructed.  
• **Each phase must compile successfully before continuing.** Every public interface must compile.  
• **Never skip unit tests, build verification, or type checking.**  
• **Never modify previously approved architecture unless explicitly approved.**  
• **Never generate placeholder code, mock implementations, fake API responses, or temporary implementations.**  
• **Never leave TODO, FIXME, HACK, TEMP, or placeholder comments.**  
• **Every implementation must be production-ready.**  
• **Use only completed production implementations from previous phases.**  
• **Do not create temporary workarounds for missing future modules.** If a dependency belongs to a future phase, define only the required interface or contract when absolutely necessary.  
• **Follow SOLID, Clean Architecture, and Dependency Injection principles.** Keep modules loosely coupled and highly cohesive.  
• **Maintain backward compatibility for public interfaces unless explicitly approved.**  
• **Never store business data inside the LLM context.**  
• **Never bypass the CEO Agent execution flow.**  
• **Every phase must include:** Implementation, Unit Tests, Documentation, Build Verification, Type Check.  
• **Do not continue automatically.** Stop after each phase and wait for explicit approval.

---

### Platform Credentials (Environment Variables)
Every platform connection is configured only through environment variables:

| Platform | Environment Variable | Purpose | Required |
|---|---|---|:---:|
| **Meta** | `META_ACCESS_TOKEN` | Meta System User long-lived access token | Yes |
| **Meta** | `META_AD_ACCOUNT_ID` | Target Meta ad account ID | Yes |
| **Meta** | `META_PIXEL_ID` | Meta Pixel used for tracking and Conversions API (CAPI) | If tracking is used |
| **Google** | `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads API developer token | Yes |
| **Google** | `GOOGLE_ADS_CLIENT_ID` | OAuth client ID | Yes |
| **Google** | `GOOGLE_ADS_CLIENT_SECRET` | OAuth client secret | Yes |
| **Google** | `GOOGLE_ADS_REFRESH_TOKEN` | OAuth refresh token (scopes for Ads, GA4, GTM, Merchant Center, Search Console) | Yes |
| **Google** | `GOOGLE_ADS_CUSTOMER_ID` | Target Google Ads customer ID | Yes |
| **Google** | `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Manager (MCC) account ID | If MCC is used |
| **Google** | `GA4_PROPERTY_ID` | Target GA4 property ID | Yes |
| **Google** | `GTM_ACCOUNT_ID` | Target Tag Manager account ID | Yes |
| **Google** | `GTM_CONTAINER_ID` | Target Tag Manager container ID | Yes |
| **Google** | `GOOGLE_MERCHANT_ID` | Target Merchant Center account ID | If Shopping is used |
| **Google** | `GSC_SITE_URL` | Target Search Console property URL | Yes |
| **TikTok** | `TIKTOK_ACCESS_TOKEN` | TikTok Ads long-lived access token | Yes |
| **TikTok** | `TIKTOK_ADVERTISER_ID` | Target TikTok advertiser account ID | Yes |
| **TikTok** | `TIKTOK_APP_ID` | TikTok developer app ID | Yes |
| **TikTok** | `TIKTOK_APP_SECRET` | TikTok developer app secret | Yes |
| **TikTok** | `TIKTOK_PIXEL_ID` | TikTok Pixel used for tracking and Events API | If tracking is used |
| **OpenClaw** | `OPENCLAW_BASE_URL` | OpenClaw Autonomous Gateway URL (port 18789) | Yes |
| **OpenClaw** | `OPENCLAW_GATEWAY_TOKEN` | OpenClaw Gateway Bearer Secret Token | Yes |
| **Telegram** | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Telegram 24/7 Mobile Alerts & Copilot Channel | Yes |
| **App Core** | `JWT_SECRET`, `ENCRYPTION_SECRET` | AES-256 Key & User Authentication Security | Yes |

• Credentials are loaded once at startup by the Configuration Manager and validated before the application starts.  
• Credentials are never logged, never stored in Memory, and never placed in the LLM context.  
• Use the minimum permission scopes each platform allows. Phase 0 validation fails if a token is missing, expired, or lacks a required scope.  
• Supporting several clients requires per-client credentials in an approved secrets store (AES-256 encrypted database store).

---

### Supported Platforms
* **Google:** Google Ads, Google Analytics 4, Google Tag Manager, Google Merchant Center, Google Search Console, Gmail SMTP.
* **Meta:** Meta Ads (Facebook, Instagram), Meta Pixel, Conversions API (CAPI), Meta Catalog.
* **TikTok:** TikTok Ads, TikTok Pixel, TikTok Events API, TikTok Catalog.

### Architecture Principles
Modular, Enterprise-grade, SOLID, Dependency Injection, Clean Architecture, Event Driven, Multi-client, Multi-industry, Multi-platform, Business-first, Production Ready.

### Integration Rules
• All platform integrations (Google, Meta, TikTok) must go through the Platform Adapter layer, which connects directly to each official API using the approved credentials.  
• Only Platform Adapters may call Google, Meta, or TikTok APIs. No agent, engine, or other module may call them.  
• OpenRouter is used only for LLM reasoning and decision-making. It must never be a source of business data.  
• Platform Adapters are the single source of truth for all live marketing data across all platforms.  
• Every platform is accessed through a common Platform Adapter contract so that agents, playbooks, and templates stay platform-agnostic where possible and platform-specific only where required.  
• Cross-platform operations (budget allocation, attribution comparison, unified reporting) must use only validated data retrieved through Platform Adapters.  
• Never bypass these rules.

---

### Environment Validation (Pre-requisites)
Before proceeding past Phase 0, verify that the development environment is ready:
• OpenClaw is running (Gateway v2026.7.1-2, Port 18789).  
• Telegram is connected (@digiportai_bot, chat ID 6540687043).  
• OpenRouter is available (DeepSeek v4 Flash, Claude 3.5 Sonnet, GPT-4o fallbacks).  
• Platform credentials are present and valid.  
• Google Ads, GA4, Tag Manager, Merchant Center, Search Console, and Gmail connections are healthy.  
• Meta Ads connection is healthy (META_ACCESS_TOKEN valid, META_AD_ACCOUNT_ID accessible, Pixel, Conversions API access, Catalog access).  
• TikTok Ads connection is healthy (TIKTOK_ACCESS_TOKEN valid, TIKTOK_ADVERTISER_ID accessible, Pixel, Events API access, Catalog access).  
• All required environment variables are loaded successfully.  
*If any validation fails: stop immediately, report the issue, and do not start. If all validations pass: confirm readiness, stop, and wait for approval.*

---

## Phase 1 — Enterprise Architecture
**Objective:** Design the complete production-grade architecture. Do NOT implement any business logic.  
**Create under /docs/architecture/:** System Architecture, Component Diagram, Execution Flow, Folder Structure, Dependency Graph, Data Flow, System Lifecycle, Interface Contracts, Execution Contracts, Deployment Architecture, Security Architecture, Platform Adapter Architecture (Google, Meta, TikTok), Credential and Token Management Architecture, Cross-Platform Data Model.  
**Document under /docs/policies/:** CEO Agent Responsibilities, Specialist Agent Responsibilities (including platform specialists), Memory Policy, Playbook Policy, Industry Template Policy, Knowledge Base Policy, Scheduling Policy, Approval Workflow, Logging Policy, Error Handling Policy, Platform Rate Limit and Quota Policy, Multi-Client Isolation Policy.  
**Define Asset Repository Structure under /assets/:** industry-templates/, playbooks/, knowledge/, prompt-templates/, agent-capabilities/, report-templates/, report-scoring/, schedules/, workflows/. Inside knowledge/, playbooks/, and agent-capabilities/ use per-platform subfolders (google/, meta/, tiktok/, cross-platform/).  
**Deliverables:** Architecture documents (01–14), Mermaid diagrams, sequence diagrams, component diagrams, folder structure, asset repository structure, interface contracts, execution contracts.  
**Validation:** Architecture consistency, dependency flow, module boundaries, execution flow, asset organization, zero Maton references, and compliance with Phase 0 rules. No implementation. Stop after completion.

---

## Phase 2 — Project Skeleton
**Objective:** Build the complete production project skeleton. Do NOT implement any business logic.  
**Create:** Project Folder Structure, Modules, Interfaces, Shared Types, Base Classes, Dependency Injection, Configuration System, Environment Loader, Logging, Event Bus, Module Registration, Common Constants, Error Definitions, Validation Framework, Platform Adapter Interfaces (Google, Meta, TikTok), Credential Provider Interface (environment variables only), Shared Cross-Platform Types (Account, Campaign, AdGroup/AdSet, Ad, Audience, Budget, Conversion Event, Report Metric).  
**Validation:** Every module and public interface compiles. Dependency Injection resolves. Module registration succeeds. Structure matches the approved architecture.  
**Run:** Build, Type Check, Unit Tests. Resolve all errors and failures. Stop.

---

## Phase 3 — Core Runtime
**Objective:** Implement the runtime foundation. Do NOT implement any business logic.  
**Build:** Application Bootstrap, Module Loader, Configuration Manager, Dependency Injection Container, Logger, Event Bus.  
**Rules:** No CEO Agent, no business workflows, no platform operations, no workflow execution.  
**Validation:** Application starts, all modules load, DI resolves, Event Bus initializes. Run Build, Type Check, Unit Tests. Stop.

---

## Phase 4 — CEO Agent
**Objective:** Implement the production CEO Agent. The CEO Agent is responsible only for orchestration.  
**Responsibilities:** Understand user requests. Load approved system context. Identify the target platform(s) for each request (Google, Meta, TikTok, or cross-platform). Select industry templates. Select playbooks. Select specialist agent interfaces. Build and validate the execution plan. Manage approval workflow. Coordinate task execution.  
**Rules:** Never execute platform operations. Never call Google, Meta, or TikTok APIs directly. Never perform specialist tasks. Delegate all execution to Specialist Agents. Use only approved playbooks and workflows. Use OpenRouter only for reasoning. Interact only through approved interfaces and contracts.  
**Validation:** Public interfaces compile. CEO Agent responsibilities validated. Execution planning validates for single-platform and cross-platform requests. Build, type check, and unit tests pass. Stop.

---

## Phase 5 — Industry Templates
**Objective:** Create reusable industry templates for Google, Meta, and TikTok marketing workflows.  
**Implement:** Industry Template Loader, Industry Template Registry.  
**Create templates:** Ecommerce, Lead Generation, Healthcare, Education, B2B, SaaS, Real Estate, Local Services, Finance, Hospitality.  
**Each template must define:** Business Goals, Campaign Structure, Recommended Campaign Types, Budget Strategy, Bidding Strategy, Conversion Goals, Tracking Requirements, Asset Requirements, Naming Conventions, KPI Targets, Reporting Metrics, Best Practices, plus a Platform Mix section:
• Recommended platform role in the funnel (for example Google for demand capture, Meta for demand generation and retargeting, TikTok for discovery and creative testing).  
• Recommended budget split ranges across platforms.  
• Per-platform campaign types, objectives, and optimization events.  
• Per-platform creative requirements (formats, aspect ratios, durations).  
• Industry-specific advertising policy constraints per platform (for example Healthcare, Finance, and Real Estate special ad categories).  
**Rules:** Templates contain only predefined configurations and best practices. Use only official documentation from the approved source categories. Templates must be version-controlled. No API calls, no AI reasoning, no workflow execution.  
**Validation:** Every template loads and follows the same schema. Registry validates. Build, type check, unit tests pass.  
**Store under /assets/industry-templates/. Stop.**

---

## Phase 6 — Playbook System
**Objective:** Implement reusable workflow playbooks for Google, Meta, and TikTok operations.  
**Implement:** Playbook Loader, Playbook Registry, Workflow Selection (platform-aware).  
**Create playbooks:** Account Setup, Campaign Creation, Campaign Audit, Campaign Optimization, Conversion Tracking, Catalog and Merchant Center, Reporting, Scaling, Cross-Platform Budget Allocation, Creative Testing and Refresh.  
**Campaign Creation must support:**
• Google: Search, Performance Max, Shopping, Display, Demand Gen, Video.  
• Meta: Sales (Advantage+ Shopping), Leads (Instant Forms and website), Traffic, Engagement, Awareness, App Promotion, Catalog Sales.  
• TikTok: Traffic, Website Conversions, Lead Generation, Video Views, Reach, Catalog Sales (Video Shopping Ads), Spark Ads.  
**Conversion Tracking playbooks must cover:** GA4 events and conversions, Google Tag Manager (containers, tags, triggers, variables, server-side tagging), Google Ads conversions and Enhanced Conversions, Meta Pixel plus Conversions API with event deduplication, TikTok Pixel plus Events API with event deduplication, and consent and privacy handling.  
**Each playbook must define:** Purpose, Trigger Conditions, Prerequisites, Execution Steps, Specialist Agents, Required Approvals, Expected Outputs, Success Criteria, Failure Handling, Rollback Strategy, Target Platforms.  
**Rules:** Playbooks define execution workflows only. Version-controlled. No API calls, no AI reasoning, no workflow execution.  
**Validation:** Every playbook loads and follows the same schema. Registry validates. Build, type check, unit tests pass.  
**Store under /assets/playbooks/. Stop.**

---

## Phase 7 — Knowledge Base
**Objective:** Implement the production Knowledge Base for Google, Meta, and TikTok marketing.  
**Implement:** Knowledge Loader, Knowledge Registry, Prompt Context Builder, Prompt Template Loader.  
**Create knowledge modules:** Google Ads, Google Analytics 4, Google Tag Manager, Google Merchant Center, Google Search Console, Google Ads Policies, Meta Ads, Meta Pixel and Conversions API, Meta Advertising Policies, TikTok Ads, TikTok Pixel and Events API, TikTok Advertising Policies, Cross-Platform Attribution and Measurement, Industry Best Practices.  
**Create prompt templates:** Campaign Creation, Campaign Audit, CRO Audit, Tracking Audit, Optimization, Reporting, Creative Analysis, Cross-Platform Budget Review.  
**Each knowledge module must define:** Overview, Core Concepts, Features, Best Practices, Policies, Limitations, Common Issues, Troubleshooting Guide, References.  
**Rules:** Knowledge is static and version-controlled. Based only on official documentation from the approved source categories. Prompt templates must be reusable. No API calls, no LLM reasoning, no workflow execution.  
**Validation:** Every module and prompt template loads. Same schema. Registry validates. Build, type check, unit tests pass.  
**Store under /assets/knowledge/ and /assets/prompt-templates/. Stop.**

---

## Phase 8 — Memory System
**Objective:** Implement the production memory system for long-term business knowledge.  
**Implement:** Memory Manager, Memory Retrieval, Memory Update, Memory Ranking, Memory Validation.  
**Store:** Business Goals, User Preferences, Business Strategies, Approval Rules, Naming Conventions, Workflow Preferences, Platform Preferences per client (preferred platforms, budget split preferences, brand voice and creative guidelines).  
**Never store:** Performance Metrics, Google Ads / GA4 / GTM / Merchant Center data, Meta Ads data, TikTok Ads data, API Responses, Temporary Execution Data, Sensitive Credentials, Access Tokens, API Keys, Audience or customer personal data.  
**Rules:** Memory is only for long-term business context. Live data always comes from the Platform Adapters. Store only approved and validated information. Never overwrite memory without validation. Every update must be traceable. Memory must be isolated per client.  
**Validation:** Retrieval, update, and validation succeed. Ranking is deterministic. Build, type check, unit tests pass. Stop.

---

## Phase 9 — Specialist Agents
**Objective:** Implement reusable production Specialist Agents.  
**Implement:** Audit Agent, Campaign Agent, Tracking Agent, Optimization Agent, Reporting Agent, CRO Agent, Merchant and Catalog Agent, Creative Agent (creative analysis, testing plans, and asset requirement validation; it does not generate business decisions).  
Each agent operates through platform adapters, so one agent contract serves Google, Meta, and TikTok. Platform-specific behavior lives in the adapters and capability definitions.  
**Capability definitions must include:** Supported Platforms, Supported Campaign Types / Objectives (per platform), Supported Operations, Supported Services, Supported Asset Types, Supported Extensions / Ad Formats, Supported Bidding Strategies, Required Inputs, Expected Outputs, Required Approvals, Validation Rules, Failure Conditions, Recovery Strategy.  
**Responsibilities:** Execute assigned tasks. Follow approved playbooks and industry templates. Execute only approved workflows. Return structured execution results and status. Report failures to the CEO Agent.  
**Rules:** Never orchestrate other agents. Never make business decisions. Never bypass the CEO Agent. Never call Google, Meta, or TikTok APIs directly. All platform operations go through the Platform Adapters. Use OpenRouter only when reasoning is required. Never access another agent's internal state. Never modify Playbooks, Industry Templates, Knowledge Base, or Memory.  
**Validation:** Every agent compiles and follows its contract. Every capability definition validates. Structured results validate. Build, type check, unit tests pass.  
**Store under /assets/agent-capabilities/. Stop.**

---

## Phase 10 — Decision Engine
**Implement:** Decision Engine, Priority Engine, Confidence Scoring, Recommendation Ranking, Approval Detection, Conflict Resolution, Cross-Platform Budget Allocation Evaluation.  
**Responsibilities:** Evaluate execution results and options. Rank recommendations. Calculate confidence scores. Detect approval requirements. Resolve conflicts, including conflicts between platforms (for example overlapping audiences or competing budget requests). Return structured decision results.  
**Rules:** Never execute platform operations. Never make business changes directly. Never bypass the CEO Agent. Use only validated execution results and approved business rules. Every decision must be deterministic and explainable.  
**Validation:** Evaluation succeeds. Ranking and confidence scoring are deterministic. Approval detection and conflict resolution validate. Structured results validate. Build, type check, unit tests pass. Stop.

---

## Phase 11 — Risk Engine
**Implement:** Risk Assessment, Policy Validation (Google Ads, Meta, and TikTok advertising policies), Approval Rules, Budget Protection, Rollback Planning.  
**Responsibilities:** Assess execution risks. Validate policy compliance for each target platform. Detect approval requirements. Protect budgets per platform and in total. Generate rollback plans when required. Return structured risk assessment results.  
**Rules:** Evaluate risks before execution. Validate all approval policies. Prevent unsafe operations. Never execute platform operations. Never modify business rules. Never bypass the CEO Agent. Use only validated execution plans. Every assessment must be deterministic and explainable.  
**Validation:** Assessment succeeds. Policy, approval, and budget protection rules validate. Rollback plan is generated when required. Structured results validate. Build, type check, unit tests pass. Stop.

---

## Phase 12 — Reporting Engine
**Implement:** Report Builder, Report Template Engine, Markdown Generator, PDF Generator, DOCX Generator, Executive Summary Generator, Recommendation Generator, Report Scoring, Telegram Formatter, Email Formatter.  
**Support reports:** Google Ads Audit, Meta Ads Audit, TikTok Ads Audit, Campaign Performance (per platform), Cross-Platform Performance, CRO Audit, Tracking Audit (GA4, GTM, Pixels, CAPI, Events API), Merchant Center and Catalog Audit, Optimization Report, Executive Report.  
**Each template must define:** Executive Summary, Overall Score, Findings, Issues, Recommendations, Priority Matrix, Action Plan, Supporting Evidence, Appendix.  
**Rules:** Generate reports only from validated execution results and verified data. Never use assumed or fabricated data. Never execute platform operations or modify business data. Every report must be deterministic and reproducible. Use production-grade, widely adopted open-source libraries for PDF and DOCX; no minimal or temporary generators.  
**Validation:** Every report generates and follows its template schema. Scoring, executive summary, and recommendation generation validate. Build, type check, unit tests pass.  
**Store templates under /assets/report-templates/ and scoring definitions under /assets/report-scoring/. Stop.**

---

## Phase 13 — Workflow Engine
**Implement:** Workflow Planner, Task Scheduler, Execution Pipeline, Approval Pipeline, Retry Strategy (aware of per-platform rate limits), Recovery Strategy.  
**Responsibilities:** Build execution workflows. Schedule tasks. Execute approved workflows. Coordinate Specialist Agents across platforms. Track workflow state. Return structured results.  
**Rules:** Execute only approved workflows, playbooks, and templates, in the correct sequence. Never bypass the CEO Agent. Never call platform APIs directly. Delegate execution to Specialist Agents. Never make business decisions. Never execute tasks outside the approved plan.  
**Validation:** Planning, scheduling, execution pipeline, approval pipeline, and workflow state validate. Structured results validate. Build, type check, unit tests pass.  
**Store under /assets/workflows/. Stop.**

---

## Phase 14 — Scheduling
**Implement:** Heartbeat, Job Scheduler, Cron Scheduler, Event Trigger Manager, Schedule Registry.  
**Responsibilities:** Register scheduled jobs. Execute scheduled workflows (for example daily spend checks, weekly audits, monthly reports across all platforms). Trigger event-based workflows. Manage recurring schedules. Return status.  
**Rules:** Execute only approved workflows and jobs. Never execute platform operations directly. Trigger workflows only through the Workflow Engine. Support scheduled, recurring, and event-driven execution. Never bypass the CEO Agent.  
**Validation:** Heartbeat executes. Jobs register. Cron schedules, event triggers, and registry validate. Build, type check, unit tests pass.  
**Store under /assets/schedules/. Stop.**

---

## Phase 15 — Learning Engine
**Implement:** Strategy Learning, Playbook Improvement, Memory Feedback, Knowledge Improvement Recommendations, Cross-Platform Insight Recommendations.  
**Rules:** Learn only from approved executions and validated outcomes. Generate recommendations only. Never modify strategies, playbooks, memory, or the Knowledge Base automatically. All updates require manual approval. Never execute platform operations. Never bypass the CEO Agent.  
**Validation:** Recommendations generate and follow the approved contract. Build, type check, unit tests pass.  
**Store under /data/learning/. Stop.**

---

## Phase 16 — End-to-End Integration
**Integrate:** CEO Agent, Industry Templates, Playbooks, Knowledge Base, Memory, Specialist Agents, Decision Engine, Risk Engine, Reporting Engine, Workflow Engine, Scheduling, Learning Engine, and all platform adapters (Google, Meta, TikTok).  
**Run:** Unit, Integration, Workflow, End-to-End, Stress, and Concurrency Tests, including multi-client and multi-platform scenarios.  
**Validation:** All modules integrate. All workflows execute. All interface and execution contracts validate. No broken or circular dependencies. No failing tests. Build and type check pass. Resolve all errors. Stop.

---

## Phase 17 — Production Hardening
**Infrastructure:** Security, Performance Optimization, Rate Limiting (including per-platform quotas), Caching, Observability, Metrics, Distributed Tracing, Health Checks, Graceful Shutdown.  
**Docker and Infrastructure:** Multi-stage Build, Image Optimization, Compose Optimization, Container Health Checks, Restart Policies, Persistent Volume Validation, Network Configuration Validation.  
**Configuration:** Configuration, Environment, Secrets, and Startup Validation, Access Token Expiry Monitoring and Rotation Procedure (Meta, Google, TikTok).  
**Production Platform:** Reverse Proxy (Traefik), SSL/TLS Validation, Firewall Validation, Log Rotation, Backup Strategy.  
**Deployment:** CI/CD Pipeline, Deployment Documentation, Production Documentation.  
**Rules:** Never hardcode secrets. Validate all production configuration and environment variables before startup. Never expose secrets, API keys, access tokens, or credentials. Optimize only without changing approved business behavior. Preserve approved interfaces and contracts and backward compatibility.  
**Validation:** Security, performance, rate limiting, caching, health checks, graceful shutdown, Docker build, Compose, container health, reverse proxy, SSL/TLS, firewall, configuration, environment, secrets, and startup all pass. Connectivity passes for OpenRouter, each Platform Adapter's official API (Google, Meta, TikTok), PostgreSQL, Redis, and Telegram. Build, type check, unit and integration tests pass. No broken dependencies or critical issues remain.  
**Deliverables:** Production Hardening Report, Security Validation Report, Performance Validation Report, Docker Validation Report, Configuration Validation Report, Connectivity Validation Report, Deployment Documentation.  
**Stop.**

---

## Approved Official Documentation Sources
### Google Ads
1. https://support.google.com/google-ads/  
2. https://support.google.com/google-ads/topic/10286612 (Campaigns)  
3. https://support.google.com/google-ads/topic/10286614 (Bidding)  
4. https://support.google.com/google-ads/topic/3121763 (Conversions and Conversion Tracking)  
5. https://support.google.com/google-ads/topic/24937 (Performance Max)  
6. https://support.google.com/google-ads/topic/3121943 (Shopping Ads)  

### Google Analytics 4
7. https://support.google.com/analytics/  
8. https://support.google.com/analytics/topic/9303474 (Events and Conversions)  
9. https://support.google.com/analytics/topic/9303319 (Reports and Attribution)  

### Google Tag Manager
10. https://support.google.com/tagmanager/  
11. https://support.google.com/tagmanager/topic/15191151 (Google Tag / GA4 tagging setup)  

### Merchant Center, Search Console, General
12. https://support.google.com/merchants/  
13. https://support.google.com/webmasters/  
14. https://support.google.com/business/  
15. https://support.google.com/  

### Meta Ads
16. https://www.facebook.com/business/help (Meta Business Help Center)  
17. https://developers.facebook.com/docs/marketing-apis (Marketing API)  
18. https://developers.facebook.com/docs/marketing-api/conversions-api (Conversions API)  
19. https://transparency.meta.com/policies/ad-standards (Advertising Standards)  

### TikTok Ads
20. https://ads.tiktok.com/help (TikTok Ads Help Center)  
21. https://business-api.tiktok.com/portal/docs (TikTok API for Business)  
22. https://ads.tiktok.com/help/article/tiktok-advertising-policies (Advertising Policies)  
*Note: Verify each URL before the Knowledge Base phase, as official help-center paths change over time.*
