# Knowledge Module: Meta Ads Architecture & Conversions API (CAPI)
**Approved Source Category:** Meta Official Documentation (`developers.facebook.com/docs/marketing-apis`)

## 1. Overview
Meta Ads (Facebook & Instagram) is the primary engine for demand generation, creative storytelling, and social commerce.

## 2. Conversions API (CAPI) & Redundancy
- Browser Pixel + Server CAPI dual-tagging architecture.
- **Deduplication Key:** `event_id` must be identical on both the browser `fbq('track')` and the server Graph API POST payload.
- **Event Match Quality (EMQ):** Achieved by transmitting hashed customer parameters (`em`, `ph`, `fn`, `ln`, `fbp`, `fbc`). Target EMQ >= 8.0/10.

## 3. Campaign Structure & Advantage+
- **Advantage+ Shopping Campaigns (ASC):** Consolidates cold audience prospecting and existing customer retention into a single automated machine-learning campaign.
- **Creative Diversification:** Maintain at least 3 distinct creative angles per ad set (Problem/Solution, Lifestyle, Testimonial).
