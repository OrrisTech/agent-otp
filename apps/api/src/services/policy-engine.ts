/**
 * Policy engine for evaluating permission requests against defined policies.
 */

import type { DbClient, PolicyRow } from '../lib/db';
import { getValue, deepMerge } from '../lib/utils';
import {
  POLICY_ACTION,
  type PolicyAction,
  type PolicyCondition,
} from '@orrisai/agent-otp-shared';

interface Policy {
  id: string;
  userId: string;
  agentId: string | null;
  name: string;
  priority: number;
  conditions: Record<string, PolicyCondition>;
  action: PolicyAction;
  scopeTemplate: Record<string, unknown> | null;
  isActive: boolean;
}

interface PermissionRequestInput {
  agentId: string;
  action: string;
  resource?: string;
  scope: Record<string, unknown>;
  context: Record<string, unknown>;
}

interface PolicyDecision {
  policy?: Policy;
  action: PolicyAction;
  scope?: Record<string, unknown>;
  reason?: string;
}

/**
 * Policy engine for evaluating permission requests.
 */
export class PolicyEngine {
  constructor(private db: DbClient) {}

  /**
   * Evaluates a permission request against applicable policies.
   * Returns the decision (auto_approve, require_approval, or deny).
   */
  async evaluate(
    userId: string,
    request: PermissionRequestInput
  ): Promise<PolicyDecision> {
    // Fetch active policies for this user, ordered by priority
    const { data: policiesData, error } = await this.db
      .from('policies')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Failed to fetch policies:', error);
      // Default to require_approval on error for safety
      return {
        action: POLICY_ACTION.REQUIRE_APPROVAL,
        reason: 'Failed to evaluate policies',
      };
    }

    const rawPolicies = policiesData as PolicyRow[] | null;
    const policies: Policy[] = (rawPolicies ?? []).map((p) => ({
      id: p.id,
      userId: p.user_id,
      agentId: p.agent_id,
      name: p.name,
      priority: p.priority,
      conditions: p.conditions as Record<string, PolicyCondition>,
      action: p.action as PolicyAction,
      scopeTemplate: p.scope_template,
      isActive: p.is_active,
    }));

    // Filter policies applicable to this agent
    const applicablePolicies = policies.filter(
      (p) => p.agentId === null || p.agentId === request.agentId
    );

    // Evaluate policies in priority order
    for (const policy of applicablePolicies) {
      if (this.matchesConditions(request, policy.conditions)) {
        // Merge scope with template if provided
        const finalScope = policy.scopeTemplate
          ? deepMerge(request.scope, policy.scopeTemplate)
          : request.scope;

        return {
          policy,
          action: policy.action,
          scope: finalScope,
          reason: `Matched policy: ${policy.name}`,
        };
      }
    }

    // No matching policy - default to require_approval for safety
    return {
      action: POLICY_ACTION.REQUIRE_APPROVAL,
      reason: 'No matching policy found, defaulting to manual approval',
    };
  }

  /**
   * Checks if a request matches all conditions of a policy.
   */
  private matchesConditions(
    request: PermissionRequestInput,
    conditions: Record<string, PolicyCondition>
  ): boolean {
    // Empty conditions means match all
    if (Object.keys(conditions).length === 0) {
      return true;
    }

    // Build a flat object with all request data for evaluation
    const requestData = this.flattenRequest(request);

    for (const [path, condition] of Object.entries(conditions)) {
      const value = getValue(requestData, path);
      if (!this.evaluateCondition(value, condition)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Flattens the request into a single object for condition evaluation.
   */
  private flattenRequest(request: PermissionRequestInput): Record<string, unknown> {
    return {
      action: request.action,
      resource: request.resource,
      agentId: request.agentId,
      scope: request.scope,
      context: request.context,
      // Spread scope and context at top level for easier access
      ...Object.fromEntries(
        Object.entries(request.scope).map(([k, v]) => [`scope.${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(request.context).map(([k, v]) => [`context.${k}`, v])
      ),
    };
  }

  /**
   * Evaluates a single condition against a value.
   */
  private evaluateCondition(
    value: unknown,
    condition: PolicyCondition
  ): boolean {
    // equals
    if (condition.equals !== undefined) {
      if (value !== condition.equals) return false;
    }

    // notEquals
    if (condition.notEquals !== undefined) {
      if (value === condition.notEquals) return false;
    }

    // lessThan
    if (condition.lessThan !== undefined) {
      if (typeof value !== 'number' || value >= condition.lessThan) return false;
    }

    // greaterThan
    if (condition.greaterThan !== undefined) {
      if (typeof value !== 'number' || value <= condition.greaterThan) return false;
    }

    // lessThanOrEqual
    if (condition.lessThanOrEqual !== undefined) {
      if (typeof value !== 'number' || value > condition.lessThanOrEqual) return false;
    }

    // greaterThanOrEqual
    if (condition.greaterThanOrEqual !== undefined) {
      if (typeof value !== 'number' || value < condition.greaterThanOrEqual)
        return false;
    }

    // startsWith
    if (condition.startsWith !== undefined) {
      if (typeof value !== 'string' || !value.startsWith(condition.startsWith))
        return false;
    }

    // endsWith
    if (condition.endsWith !== undefined) {
      if (typeof value !== 'string' || !value.endsWith(condition.endsWith))
        return false;
    }

    // contains
    if (condition.contains !== undefined) {
      if (typeof value !== 'string' || !value.includes(condition.contains))
        return false;
    }

    // matches (regex)
    if (condition.matches !== undefined) {
      if (typeof value !== 'string') return false;
      try {
        const regex = new RegExp(condition.matches);
        if (!regex.test(value)) return false;
      } catch {
        // Invalid regex, treat as no match
        return false;
      }
    }

    // in (array membership)
    if (condition.in !== undefined) {
      if (!condition.in.includes(value as string | number)) return false;
    }

    // notIn (array exclusion)
    if (condition.notIn !== undefined) {
      if (condition.notIn.includes(value as string | number)) return false;
    }

    // exists (check if value is defined)
    if (condition.exists !== undefined) {
      const valueExists = value !== undefined && value !== null;
      if (condition.exists !== valueExists) return false;
    }

    return true;
  }
}

/**
 * Creates a new policy engine instance.
 */
export function createPolicyEngine(db: DbClient): PolicyEngine {
  return new PolicyEngine(db);
}
