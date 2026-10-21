# Architecture Document 08: Interface Contracts
## The 9 Core System Interface Contracts

**Version:** 2.0.0  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Standard:** Strict In-Process TypeScript Interface Specifications

---

### Contract 1: `ICredentialManager`
Responsible for secure storage, retrieval, scope validation, and OAuth2 token refresh.

```typescript
export type PlatformType = 'GOOGLE' | 'META' | 'TIKTOK' | 'OPENCLAW' | 'OPENROUTER' | 'TELEGRAM';

export interface PlatformCredentials {
  platform: PlatformType;
  clientId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
  accountId?: string;
  extraMeta?: Record<string, string>;
}

export interface ICredentialManager {
  getCredentials(platform: PlatformType, clientId: string): Promise<PlatformCredentials>;
  refreshOAuthToken(platform: PlatformType, clientId: string): Promise<{ accessToken: string; expiresAt: Date }>;
  validateScopes(platform: PlatformType, clientId: string, requiredScopes: string[]): Promise<boolean>;
  setCredentials(platform: PlatformType, clientId: string, credentials: Partial<PlatformCredentials>): Promise<void>;
  revokeCredentials(platform: PlatformType, clientId: string): Promise<void>;
}
```

---

### Contract 2: `ICEOAgent`
Responsible for high-level user objective parsing, plan synthesis, and specialist task coordination.

```typescript
export interface ExecutionPlan {
  id: string;
  clientId: string;
  objective: string;
  targetPlatforms: PlatformType[];
  playbookId: string;
  templateId: string;
  tasks: ScheduledTask[];
  requiresApproval: boolean;
  estimatedBudget: number;
}

export interface ICEOAgent {
  parseObjective(prompt: string, clientContext: ClientContext): Promise<ExecutionPlan>;
  coordinateExecution(plan: ExecutionPlan): Promise<PlanExecutionSummary>;
  handleSpecialistFailure(taskId: string, error: ExecutionError): Promise<RecoveryAction>;
}
```

---

### Contract 3: `ISpecialistAgent`
Implemented by domain agents (CampaignAgent, AuditAgent, TrackingAgent, etc.).

```typescript
export interface SpecialistCapability {
  agentName: string;
  supportedPlatforms: PlatformType[];
  supportedOperations: string[];
  requiresApprovalByDefault: boolean;
}

export interface ISpecialistAgent {
  getCapabilities(): SpecialistCapability;
  validatePrerequisites(task: ScheduledTask, clientContext: ClientContext): Promise<ValidationResult>;
  executeTask(task: ScheduledTask, clientContext: ClientContext): Promise<SpecialistExecutionResult>;
}
```

---

### Contract 4: `IPlatformAdapter`
Implemented by `GoogleAdsAdapter`, `MetaGraphAdapter`, and `TikTokBusinessAdapter`.

```typescript
export interface IPlatformAdapter {
  platform: PlatformType;
  verifyConnection(clientId: string): Promise<{ active: boolean; message: string }>;
  fetchCampaigns(clientId: string): Promise<UnifiedCampaign[]>;
  createCampaign(clientId: string, campaign: UnifiedCampaignInput): Promise<UnifiedCampaign>;
  updateDailyBudget(clientId: string, campaignId: string, newBudget: number): Promise<boolean>;
  pauseCampaign(clientId: string, campaignId: string): Promise<boolean>;
  fetchMetrics(clientId: string, dateRange: DateRange): Promise<UnifiedMetricRecord[]>;
}
```

---

### Contract 5: `IRiskEngine`
Evaluates budget changes, ad policies, and safety thresholds.

```typescript
export interface RiskAssessment {
  riskScore: number; // 0 (Zero Risk) to 100 (Critical)
  requiresApproval: boolean;
  policyViolations: string[];
  budgetWarnings: string[];
  canAutoExecute: boolean;
  rollbackPlan?: RollbackAction[];
}

export interface IRiskEngine {
  assessRisk(proposedAction: ProposedAction, clientContext: ClientContext): Promise<RiskAssessment>;
  validateAdPolicy(creativeContent: CreativePayload, platform: PlatformType): Promise<PolicyValidationResult>;
}
```

---

### Contract 6: `IDecisionEngine`
Analyzes options, calculates confidence, and ranks recommendations.

```typescript
export interface DecisionEvaluation {
  selectedOption: string;
  confidenceScore: number; // 0.00 to 1.00
  rationale: string;
  alternativeOptions: Array<{ id: string; score: number; whyNot: string }>;
}

export interface IDecisionEngine {
  evaluateExecutionOptions(options: CandidateAction[], context: ClientContext): Promise<DecisionEvaluation>;
  resolveConflict(competingActions: ProposedAction[]): Promise<ResolvedActionPlan>;
}
```

---

### Contract 7: `IActionQueue`
The human-in-the-loop approval store.

```typescript
export interface ActionItem {
  id: string;
  clientId: string;
  type: 'CAMPAIGN_LAUNCH' | 'BUDGET_CHANGE' | 'PAUSE_AD' | 'TRACKING_UPDATE';
  proposedChange: Record<string, any>;
  riskScore: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface IActionQueue {
  enqueue(item: Omit<ActionItem, 'id' | 'status' | 'createdAt'>): Promise<ActionItem>;
  approve(id: string, reviewerId: string): Promise<ActionItem>;
  reject(id: string, reviewerId: string, reason: string): Promise<ActionItem>;
  listPending(clientId: string): Promise<ActionItem[]>;
}
```

---

### Contract 8: `IMemoryManager`
Manages client-specific long-term preferences, brand voice, and historical strategies.

```typescript
export interface ClientMemory {
  clientId: string;
  brandVoice: string;
  preferredPlatforms: PlatformType[];
  targetCpaThreshold: number;
  targetRoasFloor: number;
  approvedKeywords: string[];
  negativeKeywords: string[];
}

export interface IMemoryManager {
  getClientMemory(clientId: string): Promise<ClientMemory>;
  updateClientMemory(clientId: string, updates: Partial<ClientMemory>): Promise<ClientMemory>;
  extractContextForPrompt(clientId: string): Promise<string>;
}
```

---

### Contract 9: `IReportingEngine`
Generates formatted analytics outputs across multiple channels.

```typescript
export interface IReportingEngine {
  generatePerformanceSummary(metrics: UnifiedMetricRecord[]): Promise<ReportDocument>;
  exportPdf(report: ReportDocument): Promise<Buffer>;
  exportDocx(report: ReportDocument): Promise<Buffer>;
  formatTelegramAlert(title: string, metrics: Record<string, string | number>): string;
}
```
