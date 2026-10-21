# System Policy P04: Playbook Policy
## Reusable Workflow Playbooks, Schema Governance & Versioning

**Status:** APPROVED (Phase 1 Deliverable)  
**Applies To:** Asset Repository (`assets/playbooks/`) & Workflow Engine  
**Standard:** Declarative Playbook Blueprint Standard

---

### 1. Purpose & Playbook Role
Playbooks provide declarative, version-controlled execution blueprints for Google, Meta, and TikTok marketing workflows. They define *what* sequence of tasks must be executed, *which* specialist agents are responsible, and *what* safety constraints apply.

### 2. Required Playbook Roster
The system must maintain verified playbooks across all four platform partitions:
1. **Account Setup & Baseline Configuration:** Tracking verification, currency setting, pixel pairing.
2. **Campaign Creation:**
   * **Google:** Search, Performance Max, Shopping, Display, Demand Gen.
   * **Meta:** Sales (Advantage+ Shopping), Leads, Traffic, Engagement.
   * **TikTok:** Website Conversions, Lead Generation, Video Views, Spark Ads.
3. **Campaign Audit:** Weekly health score, wasted spend detection, creative fatigue audit.
4. **Campaign Optimization:** Bid adjustments, negative keyword addition, budget scaling.
5. **Conversion Tracking:** GA4, GTM, Meta CAPI deduplication, TikTok Events API.
6. **Catalog & Merchant Center:** Feed sync, disapproved product remediation.
7. **Cross-Platform Budget Scaling:** Performance-based cross-channel reallocation.

### 3. Playbook Invariants & Constraints
* **Declarative Only:** Playbooks define workflow structures only. They contain NO runtime logic, executable scripts, or direct API tokens.
* **Deterministic Schema:** Every playbook must adhere to `assets/playbooks/schema.json` with defined `purpose`, `prerequisites`, `steps`, `requiredApprovals`, and `rollbackStrategy`.
* **Version Control:** All playbooks are stored in Git under `assets/playbooks/`. Runtime agents are forbidden from modifying playbook files on disk.
