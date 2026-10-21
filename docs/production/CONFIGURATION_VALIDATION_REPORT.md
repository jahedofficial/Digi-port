# Configuration & Environment Validation Report

**System:** DigiPort Universal Paid Media OS  
**Module:** `StartupValidatorService`  
**Reference Document:** Architecture Document 14 (`docs/architecture/14-credential-token-management.md`)  
**Status:** ✅ Validated  

---

## 1. The 14 Platform Environment Variables Contract

The `StartupValidatorService` audits and verifies all 14 canonical platform environment variables before boot:

| Platform | Variable Name | Required | Format Rule |
|---|---|:---:|---|
| **Google** | `GOOGLE_ADS_DEVELOPER_TOKEN` | Yes | Non-empty developer token |
| **Google** | `GOOGLE_ADS_CLIENT_ID` | Yes | OAuth2 client ID (`*.apps.googleusercontent.com`) |
| **Google** | `GOOGLE_ADS_CLIENT_SECRET` | Yes | OAuth2 client secret |
| **Google** | `GOOGLE_ADS_REFRESH_TOKEN` | Yes | Long-term offline refresh token |
| **Google** | `GOOGLE_ADS_CUSTOMER_ID` | Yes | 10-digit numeric ID (dashes stripped) |
| **Google** | `GOOGLE_ADS_LOGIN_CUSTOMER_ID`| Optional | MCC Manager account ID |
| **Google** | `GA4_PROPERTY_ID` | Yes | Google Analytics 4 Property ID |
| **Google** | `GTM_ACCOUNT_ID` | Yes | Google Tag Manager Account ID |
| **Google** | `GTM_CONTAINER_ID` | Yes | GTM container ID (e.g. `GTM-XXXXXX`) |
| **Meta** | `META_ACCESS_TOKEN` | Yes | Long-lived System User Token (Graph API v20.0) |
| **Meta** | `META_AD_ACCOUNT_ID` | Yes | Format `act_<digits>` or numeric ID |
| **Meta** | `META_PIXEL_ID` | Yes | Meta Pixel ID for Conversions API (CAPI) |
| **TikTok** | `TIKTOK_ACCESS_TOKEN` | Yes | Advertiser API Access Token |
| **TikTok** | `TIKTOK_ADVERTISER_ID` | Yes | Numeric string advertiser account ID |

---

## 2. Core Secrets Entropy & Database Configuration

- **`ENCRYPTION_SECRET`:** Must have $\ge 32$ characters (256-bit entropy). Weak secrets fail startup with `ERR_WEAK_ENCRYPTION_KEY`.
- **`JWT_SECRET`:** Must have $\ge 16$ characters.
- **`DATABASE_URL`:** Must be a valid PostgreSQL connection URI (`postgresql://...`).
- **`REDIS_URL`:** Must be a valid Redis connection URI (`redis://...`).

---

## 3. Zero Credential Exposure Guarantee

All reports, logs, and diagnostic dumps produced by `StartupValidatorService` mask sensitive credentials, displaying only the last 4 characters (e.g. `***4821`), preventing secret exposure in CI/CD logs or console outputs.
