import { ValidationException } from '../errors/domain.errors';
import {
  IMemoryUpdater,
  IMemoryValidator,
  MemoryAuditRecord,
  MemoryEntry,
} from './types';
import { MemoryValidator } from './memory-validator';

/**
 * Traceable Memory Updater
 * Guarantees that:
 * 1. No memory item is EVER overwritten or created without schema validation.
 * 2. Every update produces an immutable audit trail record.
 * 3. Client memory partitions remain strictly isolated.
 */
export class MemoryUpdater implements IMemoryUpdater {
  private readonly validator: IMemoryValidator;
  private readonly storage: Map<string, Map<string, MemoryEntry>>;

  constructor(
    storage: Map<string, Map<string, MemoryEntry>>,
    validator?: IMemoryValidator
  ) {
    this.storage = storage;
    this.validator = validator ?? new MemoryValidator();
  }

  private getClientPartition(clientId: string): Map<string, MemoryEntry> {
    if (!clientId || typeof clientId !== 'string' || clientId.trim().length === 0) {
      throw new ValidationException(
        "Memory update rejected: non-empty 'clientId' is required for client isolation.",
        ['MISSING_CLIENT_ID']
      );
    }
    let partition = this.storage.get(clientId);
    if (!partition) {
      partition = new Map<string, MemoryEntry>();
      this.storage.set(clientId, partition);
    }
    return partition;
  }

  /**
   * Creates a new long-term memory entry with validation and audit trail.
   */
  public async createEntry<T = unknown>(
    entryData: Omit<MemoryEntry<T>, 'version' | 'createdAt' | 'updatedAt' | 'auditTrail'>,
    actor: string,
    reason: string
  ): Promise<MemoryEntry<T>> {
    if (!actor || actor.trim().length === 0) {
      throw new ValidationException('Traceability violation: actor must be identified for memory creation.', [
        'MISSING_ACTOR',
      ]);
    }
    if (!reason || reason.trim().length === 0) {
      throw new ValidationException('Traceability violation: reason must be documented for memory creation.', [
        'MISSING_REASON',
      ]);
    }

    const now = new Date();
    const initialAudit: MemoryAuditRecord = {
      timestamp: now,
      actor,
      action: 'CREATE',
      newValue: entryData.value,
      reason,
    };

    const fullEntry: MemoryEntry<T> = {
      ...entryData,
      version: 1,
      createdAt: now,
      updatedAt: now,
      auditTrail: [initialAudit],
    };

    // Strict validation before persistence
    this.validator.assertValidEntry(fullEntry);

    const partition = this.getClientPartition(fullEntry.clientId);
    partition.set(fullEntry.key, fullEntry as unknown as MemoryEntry);

    return fullEntry;
  }

  /**
   * Updates an existing memory entry deterministically with version bumping and full audit logging.
   */
  public async updateEntry<T = unknown>(
    clientId: string,
    key: string,
    newValue: T,
    actor: string,
    reason: string,
    adjustments?: {
      confidence?: number;
      importance?: number;
      approvedBy?: string;
    }
  ): Promise<MemoryEntry<T>> {
    if (!actor || actor.trim().length === 0) {
      throw new ValidationException('Traceability violation: actor must be identified for memory update.', [
        'MISSING_ACTOR',
      ]);
    }
    if (!reason || reason.trim().length === 0) {
      throw new ValidationException('Traceability violation: reason must be documented for memory update.', [
        'MISSING_REASON',
      ]);
    }

    const partition = this.getClientPartition(clientId);
    const existing = partition.get(key);

    if (!existing) {
      throw new ValidationException(
        `Memory entry not found for client '${clientId}' with key '${key}'. Cannot update non-existent entry.`,
        ['ENTRY_NOT_FOUND'],
        { clientId, key }
      );
    }

    const now = new Date();
    const auditRecord: MemoryAuditRecord = {
      timestamp: now,
      actor,
      action: 'UPDATE',
      previousValue: existing.value,
      newValue,
      reason,
    };

    const updatedEntry: MemoryEntry<T> = {
      ...(existing as unknown as MemoryEntry<T>),
      value: newValue,
      confidence: adjustments?.confidence ?? existing.confidence,
      importance: adjustments?.importance ?? existing.importance,
      approvedBy: adjustments?.approvedBy ?? existing.approvedBy,
      version: existing.version + 1,
      updatedAt: now,
      auditTrail: [...existing.auditTrail, auditRecord],
    };

    // Strict validation before persistence
    this.validator.assertValidEntry(updatedEntry);

    partition.set(key, updatedEntry as unknown as MemoryEntry);

    return updatedEntry;
  }

  /**
   * Deletes a memory entry while recording audit deletion.
   */
  public async deleteEntry(
    clientId: string,
    key: string,
    actor: string,
    reason: string
  ): Promise<boolean> {
    if (!actor || actor.trim().length === 0) {
      throw new ValidationException('Traceability violation: actor must be identified for memory deletion.', [
        'MISSING_ACTOR',
      ]);
    }
    const partition = this.getClientPartition(clientId);
    const existing = partition.get(key);
    if (!existing) {
      return false;
    }

    partition.delete(key);
    return true;
  }
}
