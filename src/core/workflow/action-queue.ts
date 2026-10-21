import { IEventBus } from '../interfaces/event-bus.interface';
import { ActionItem, IActionQueue } from './types';

/**
 * Contract 7 Implementation: ActionQueue
 * Enterprise Human-in-the-Loop Approval Store for advertising mutations
 */
export class ActionQueue implements IActionQueue {
  private readonly items = new Map<string, ActionItem>();

  constructor(private readonly eventBus?: IEventBus) {}

  /**
   * Enqueue a proposed action requiring human or policy approval
   */
  public async enqueue(
    item: Omit<ActionItem, 'id' | 'status' | 'createdAt'>
  ): Promise<ActionItem> {
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const actionItem: ActionItem = {
      ...item,
      id,
      status: 'PENDING',
      createdAt: new Date(),
    };

    this.items.set(id, actionItem);

    if (this.eventBus) {
      await this.eventBus.publish('action_queue.enqueued', {
        id: actionItem.id,
        clientId: actionItem.clientId,
        type: actionItem.type,
        riskScore: actionItem.riskScore,
        createdAt: actionItem.createdAt,
      });
    }

    return actionItem;
  }

  /**
   * Approve a pending action item
   */
  public async approve(id: string, reviewerId: string): Promise<ActionItem> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`ActionItem [${id}] not found`);
    }

    if (item.status !== 'PENDING') {
      throw new Error(
        `Cannot approve ActionItem [${id}] with current status: ${item.status}`
      );
    }

    item.status = 'APPROVED';
    item.resolvedAt = new Date();
    item.reviewerId = reviewerId;

    if (this.eventBus) {
      await this.eventBus.publish('action_queue.approved', {
        id: item.id,
        clientId: item.clientId,
        reviewerId,
        resolvedAt: item.resolvedAt,
      });
    }

    return item;
  }

  /**
   * Reject a pending action item
   */
  public async reject(
    id: string,
    reviewerId: string,
    reason: string
  ): Promise<ActionItem> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`ActionItem [${id}] not found`);
    }

    if (item.status !== 'PENDING') {
      throw new Error(
        `Cannot reject ActionItem [${id}] with current status: ${item.status}`
      );
    }

    item.status = 'REJECTED';
    item.resolvedAt = new Date();
    item.reviewerId = reviewerId;
    item.rejectionReason = reason;

    if (this.eventBus) {
      await this.eventBus.publish('action_queue.rejected', {
        id: item.id,
        clientId: item.clientId,
        reviewerId,
        reason,
        resolvedAt: item.resolvedAt,
      });
    }

    return item;
  }

  /**
   * List all pending actions for a specific client
   */
  public async listPending(clientId: string): Promise<ActionItem[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.clientId === clientId && item.status === 'PENDING'
    );
  }

  /**
   * Get an action item by ID
   */
  public get(id: string): ActionItem | undefined {
    return this.items.get(id);
  }

  /**
   * List all action items regardless of client
   */
  public getAll(): ActionItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Clear all items (useful for testing)
   */
  public clear(): void {
    this.items.clear();
  }
}
