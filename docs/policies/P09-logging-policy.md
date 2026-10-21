# System Policy P09: Logging Policy
## Structured Audit Logging, Zero-Leakage Masking & Telemetry

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** Core Runtime Logger, API Routes & Background Services  
**Standard:** Enterprise Security & Privacy Logging Standard

---

### 1. Purpose & Logging Standard
This policy mandates uniform, machine-readable JSON logging across all DigiPort services while enforcing strict redaction of sensitive credentials, API keys, and customer PII.

### 2. Log Structure Schema
Every log entry emitted by the system must include the following metadata:
```json
{
  "timestamp": "2026-10-21T09:45:00.123Z",
  "level": "INFO | WARN | ERROR | FATAL",
  "correlationId": "req_8921873192",
  "workspaceId": "ws_client_alpha",
  "component": "MetaPlatformAdapter | CEOAgent | ICredentialManager",
  "message": "Campaign metrics successfully synchronized",
  "metadata": {
    "platform": "META",
    "campaignCount": 4,
    "durationMs": 342
  }
}
```

### 3. Non-Negotiable Redaction Rules
* **API Key & Token Masking:** Any string matching token patterns (`sk-or-v1-...`, `EAAB...`, `ya29...`, `Bearer ...`) must be automatically masked before writing to log output (e.g. `sk-or-v1-••••••••`).
* **Zero PII Logging:** Customer emails, phone numbers, and physical addresses must NEVER be written to stdout, stderr, or log storage.
* **Database Connection String Sanitization:** Database passwords in connection URIs must be sanitized (`postgresql://postgres:*****@...`).

### 4. Retention & Archival
* **Operational Logs (INFO/WARN):** Retained in circular buffer for 30 days.
* **Audit Logs (ActionQueue Decisions):** Retained indefinitely in PostgreSQL for compliance, accountability, and non-repudiation.
