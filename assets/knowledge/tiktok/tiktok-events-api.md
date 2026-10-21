# Knowledge Module: TikTok Ads & Events API Architecture
**Approved Source Category:** TikTok Official Documentation (`business-api.tiktok.com/portal/docs`)

## 1. Overview
TikTok Ads drives discovery, high-engagement viral video shopping, and creative testing through short-form vertical video (9:16).

## 2. Events API & Webhooks
- Server-to-server integration for tracking Purchase, AddToCart, and CompleteRegistration events.
- Deduplication via `event_id` and hashed phone (`phone_number`) / email (`email`).

## 3. Spark Ads & Organic Boosting
- Boosting organic TikTok posts using authorization codes without altering organic comments, likes, and creator handles.
- Optimal video duration: 15–30 seconds with punchy hook within the first 2 seconds.
