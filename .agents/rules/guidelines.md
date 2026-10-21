# Digital Marketr - Project Guidelines & AI Agent Rules

Rules and instructions that the AI assistant must always follow when working on the **Digital Marketr** codebase.

---

## 1. Stack & Architecture Standards
- **Framework**: Next.js 16 (App Router) + React 19.
- **Styling**: Tailwind CSS v4. Prioritize modern, clean, sleek dark-themed dashboards with subtle gradients and glassmorphism.
- **Database & ORM**: Prisma ORM (`prisma/schema.prisma`). Always handle query errors gracefully and never leak DB connection strings.
- **TypeScript**: Strict type safety. Avoid using `any`; define explicit interfaces or types in `src/types/` or co-located type definitions.

---

## 2. API & Security Guidelines
- **Environment Variables**: Sensitive secrets (Telegram tokens, OAuth keys, Database URLs) must reside exclusively in `.env.local`. Never commit secrets into source code or templates.
- **Route Handlers**: App Router API routes (`src/app/api/...`) should validate incoming payloads and return consistent JSON responses (`{ success: boolean, data?: ..., error?: string }`).

---

## 3. Communication & Assistance
- **Language**: Respond in Bengali or English as preferred by the user. Explain code clearly with concise summaries.
- **Automatic Execution**: Execute commands, file edits, and checks proactively to keep workflows fast and seamless.

---

## 4. Enterprise Agentic Architecture (Phases 1–17 Compliance)
All architectural extensions, agent capabilities, and workflows must comply with the 17-Phase Master Specification documented in [docs/architecture/ENTERPRISE_BLUEPRINT.md](file:///c:/Projects/Digital%20Marketr/docs/architecture/ENTERPRISE_BLUEPRINT.md):
- **CEO Agent Role:** Orchestration only. Delegates to Specialist Agents (Audit, Campaign, Tracking, Optimization, Reporting, CRO, Merchant, Creative). Never calls platform APIs directly.
- **Asset Repository:** Static knowledge, templates, and playbooks must reside under `/assets/` partitioned by platform (`google/`, `meta/`, `tiktok/`, `cross-platform/`).
- **Human-in-the-Loop Guardrail:** Modifying actions (campaign creation, budget change > ±20%, pause ad) require ActionQueue approval cards.
- **Multi-Client Isolation:** Memory, ad accounts, and conversations must remain strictly isolated per client workspace.

