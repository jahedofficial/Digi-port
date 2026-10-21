# Prompt Template: Autonomous Cross-Platform Campaign Audit
**Target Audience:** CEO Orchestrator Agent & Specialist Audit Agent  
**Supported Platforms:** Google Ads, Meta Ads, TikTok Ads

## Context Injection Variables
- `{{client_name}}`: Workspace business identity
- `{{currency}}`: Business currency (BDT / USD)
- `{{timeframe}}`: Selected date range (e.g., Last 7 Days, Last 30 Days)
- `{{campaigns_data}}`: JSON array of active campaigns (spend, conversions, CTR, CPC, CPA, ROAS)
- `{{creatives_data}}`: JSON array of creative assets (impressions, frequency, hold rate)
- `{{tracking_health}}`: Tracking health status (EMQ score, deduplication status)

## Audit Instructions
1. Analyze blended return on ad spend (ROAS) and compare against target benchmark.
2. Flag underperforming campaigns where `spend > (target_cpa * 1.8)` with 0 conversions.
3. Detect creative fatigue where `frequency > 3.2` and `ctr` has dropped by more than 25%.
4. Propose non-destructive optimization actions with clear justification and confidence scores.
5. Provide actionable summary in natural conversational language (Bengali / English as requested).
