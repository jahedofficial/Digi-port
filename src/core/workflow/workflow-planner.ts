import { ExecutionPlan } from '../interfaces/agent.interface';
import { IWorkflowPlanner, WorkflowDAG, WorkflowStep } from './types';

/**
 * Workflow Planner & DAG Builder
 * Translates execution plans into Directed Acyclic Graphs (DAGs), performs cycle detection,
 * and calculates topological execution layers for optimal parallel/sequential dispatch.
 */
export class WorkflowPlanner implements IWorkflowPlanner {
  /**
   * Build a WorkflowDAG from a validated ExecutionPlan
   */
  public buildWorkflowFromPlan(plan: ExecutionPlan): WorkflowDAG {
    const steps = new Map<string, WorkflowStep>();
    const adjacencyList = new Map<string, string[]>();

    // Sort tasks by their logical order
    const sortedTasks = [...plan.tasks].sort((a, b) => a.order - b.order);

    // Group tasks by order level
    const tasksByOrder = new Map<number, string[]>();

    for (const task of sortedTasks) {
      const stepId = `step_${task.id}`;
      if (!tasksByOrder.has(task.order)) {
        tasksByOrder.set(task.order, []);
      }
      tasksByOrder.get(task.order)!.push(stepId);
    }

    // Build steps with dependencies on previous order levels
    const orderLevels = Array.from(tasksByOrder.keys()).sort((a, b) => a - b);

    for (let i = 0; i < orderLevels.length; i++) {
      const currentLevel = orderLevels[i];
      const previousLevel = i > 0 ? orderLevels[i - 1] : undefined;
      const dependencies = previousLevel ? tasksByOrder.get(previousLevel)! : [];

      const stepIdsAtLevel = tasksByOrder.get(currentLevel)!;
      for (const stepId of stepIdsAtLevel) {
        const task = sortedTasks.find((t) => `step_${t.id}` === stepId)!;

        const step: WorkflowStep = {
          id: stepId,
          name: task.title,
          task,
          dependencies: [...dependencies],
          requiresApproval: task.requiresApproval || plan.requiresApproval,
          timeoutMs: 30000,
        };

        steps.set(stepId, step);
        if (!adjacencyList.has(stepId)) {
          adjacencyList.set(stepId, []);
        }

        // Add to predecessor adjacency lists
        for (const depId of dependencies) {
          if (!adjacencyList.has(depId)) {
            adjacencyList.set(depId, []);
          }
          adjacencyList.get(depId)!.push(stepId);
        }
      }
    }

    const dag: WorkflowDAG = {
      workflowId: `wf_${plan.id}_${Date.now()}`,
      steps,
      adjacencyList,
      executionLayers: [],
      totalSteps: steps.size,
    };

    const validation = this.validateDAG(dag);
    if (!validation.isValid) {
      throw new Error(`Invalid Workflow DAG: ${validation.errors.join('; ')}`);
    }

    dag.executionLayers = this.computeTopologicalLayers(dag);
    return dag;
  }

  /**
   * Validate DAG integrity: ensures all dependencies exist and no cycles exist
   */
  public validateDAG(dag: WorkflowDAG): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Dependency existence check
    for (const [stepId, step] of dag.steps) {
      for (const depId of step.dependencies) {
        if (!dag.steps.has(depId)) {
          errors.push(
            `Step [${stepId}] depends on non-existent step [${depId}]`
          );
        }
      }
    }

    // 2. Cycle detection via Depth-First Search (DFS)
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = dag.adjacencyList.get(node) ?? [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const stepId of dag.steps.keys()) {
      if (!visited.has(stepId)) {
        if (hasCycle(stepId)) {
          errors.push(`Cycle detected in workflow graph involving step [${stepId}]`);
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Compute Topological Execution Layers using Kahn's Algorithm
   * Steps in the same layer have all dependencies met and can be executed concurrently.
   */
  public computeTopologicalLayers(dag: WorkflowDAG): string[][] {
    const inDegree = new Map<string, number>();

    for (const [stepId, step] of dag.steps) {
      inDegree.set(stepId, step.dependencies.length);
    }

    const layers: string[][] = [];
    let currentQueue: string[] = [];

    // Initial layer: all steps with in-degree 0
    for (const [stepId, deg] of inDegree) {
      if (deg === 0) {
        currentQueue.push(stepId);
      }
    }

    let processedCount = 0;

    while (currentQueue.length > 0) {
      layers.push([...currentQueue]);
      processedCount += currentQueue.length;

      const nextQueue: string[] = [];

      for (const stepId of currentQueue) {
        const downstream = dag.adjacencyList.get(stepId) ?? [];
        for (const childId of downstream) {
          const currentDeg = inDegree.get(childId) ?? 1;
          const newDeg = currentDeg - 1;
          inDegree.set(childId, newDeg);

          if (newDeg === 0) {
            nextQueue.push(childId);
          }
        }
      }

      currentQueue = nextQueue;
    }

    if (processedCount !== dag.totalSteps) {
      throw new Error(
        `Topological layer computation failed: Processed ${processedCount} of ${dag.totalSteps} steps (cycle detected)`
      );
    }

    return layers;
  }
}
