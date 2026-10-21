# System Policy P05: Industry Template Policy
## 10 Vertical Industry Templates & Platform Mix Governance

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** Asset Repository (`assets/industry-templates/`) & Plan Synthesizer  
**Standard:** Enterprise Vertical Marketing Standard

---

### 1. Purpose & Industry Template Scope
Industry templates provide pre-validated best practices, budget split heuristics, and creative constraints for 10 core vertical sectors:
1. **Ecommerce (Retail / D2C):** Funnel emphasis on Meta Advantage+ Shopping and Google Shopping/PMax.
2. **Lead Generation:** Google Search demand capture combined with Meta Instant Forms and TikTok Lead Gen.
3. **Healthcare & Wellness:** Strict compliance with Meta Health Advertising policies and Google Healthcare certifications.
4. **Education:** Cohort and semester-based admissions marketing playbooks.
5. **B2B & Enterprise:** High-intent Google Search and LinkedIn retargeting frameworks.
6. **SaaS & Software:** Free-trial and product-led growth (PLG) conversion pipelines.
7. **Real Estate:** Mandatory Special Ad Category (Housing) constraints across Meta and Google.
8. **Local Services:** Geofenced Google Local Campaigns and Meta Radius targeting.
9. **Finance & Banking:** Special Ad Category (Credit) adherence, strict disclosure disclosures.
10. **Hospitality & Travel:** Seasonal booking windows and dynamic catalog retargeting.

### 2. Mandatory Template Schema Requirements
Every industry template stored under `assets/industry-templates/` must declare:
* **Business Goals & KPI Benchmarks:** Expected CTR, CPA ranges, ROAS floors.
* **Platform Mix Section:**
  * Funnel role allocation (e.g. Google for high-intent search, Meta for discovery/retargeting, TikTok for creative virality).
  * Recommended budget split ranges (e.g. 50% Meta, 35% Google, 15% TikTok).
  * Recommended campaign objectives and bid strategies per platform.
* **Creative Requirements:** Aspect ratios (9:16, 1:1, 16:9), maximum video lengths, headline constraints.
* **Policy Guardrails:** Industry-specific advertising prohibitions and disclosure requirements.

### 3. Immutability & Safety
Templates must be strictly static JSON/YAML documents. Runtime agents cannot alter industry templates without code review and Git commit approval.
