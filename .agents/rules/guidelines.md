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
