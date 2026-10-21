# System Policy P06: Knowledge Base Policy
## Official Platform Knowledge Governance & Source Grounding

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** Asset Repository (`assets/knowledge/`) & Prompt Context Builder  
**Standard:** Zero-Hallucination Official Documentation Grounding

---

### 1. Purpose & Knowledge Standard
The Knowledge Base provides static, authoritative platform rules, feature constraints, troubleshooting procedures, and ad policy requirements for Google Ads, Meta Ads, and TikTok Ads.

### 2. Approved Official Documentation Sources
All knowledge modules under `assets/knowledge/` must cite and align strictly with approved platform documentation:
1. **Google Ads:** Google Ads Help Center (`support.google.com/google-ads`) & Google Ads API Developer Documentation (`developers.google.com/google-ads/api`).
2. **Google Analytics 4 & Tag Manager:** GA4 Support (`support.google.com/analytics`) & GTM Developer Guides (`developers.google.com/tag-platform/tag-manager`).
3. **Google Merchant Center & Search Console:** Merchant Support (`support.google.com/merchants`) & Search Central (`developers.google.com/search`).
4. **Meta Marketing API & Policies:** Meta Business Help Center (`facebook.com/business/help`), Marketing API Documentation (`developers.facebook.com/docs/marketing-apis`), Meta Advertising Standards (`transparency.meta.com/policies/ad-standards`).
5. **TikTok Ads & Policies:** TikTok Ads Help Center (`ads.tiktok.com/help`), TikTok Business API Portal (`business-api.tiktok.com/portal/docs`), TikTok Advertising Policies (`ads.tiktok.com/help/article/tiktok-advertising-policies`).

### 3. Knowledge Invariants
* **Static & Versioned:** Knowledge files are committed to Git as Markdown documents under `assets/knowledge/{google|meta|tiktok|cross-platform}/`.
* **Zero Fabrication:** Agents must never infer platform limits or policies that contradict official documentation.
* **No Dynamic Execution:** Knowledge files contain reference guidance only; they never execute API requests or store dynamic credentials.
