# Knowledge Module: Cross-Platform Attribution & Blended ROAS
**Approved Source Category:** Industry Standard Performance Marketing & MMM Frameworks

## 1. Overview
When running ads across Google, Meta, and TikTok simultaneously, each platform claims credit for conversions in their self-reporting dashboards.

## 2. Multi-Touch Attribution & Deduplication
- **Blended Marketing Efficiency Ratio (MER):** Total Store Revenue / Total Ad Spend across all platforms. Target MER >= 4.0x.
- **Platform Bias:**
  - Meta claims 7-day click + 1-day view attribution by default.
  - Google claims data-driven attribution (DDA) on Search/Shopping.
  - TikTok claims 7-day click + 1-day view.
- **Source of Truth:** Server-side GA4 purchase tracking with first-party cookie UTM tagging (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`).
