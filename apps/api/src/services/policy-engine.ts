/**
 * Auto-approval rules engine for OTP requests.
 *
 * NOTE: The policy engine has been simplified for the OTP Relay pivot.
 * Complex policy rules have been replaced with simple auto-approval rules
 * based on trusted senders.
 */

import type { DbClient } from '../lib/db';

/**
 * Decision for an OTP request.
 */
type ApprovalDecision = 'auto_approve' | 'require_approval' | 'deny';

interface ApprovalRule {
  id: string;
  userId: string;
  name: string;
  senderPattern: string;
  source?: string;
  decision: ApprovalDecision;
  isActive: boolean;
}

interface OTPRequestInput {
  agentId: string;
  reason: string;
  expectedSender?: string;
  filter?: {
    sources?: string[];
    senderPattern?: string;
  };
}

interface ApprovalResult {
  rule?: ApprovalRule;
  decision: ApprovalDecision;
  reason?: string;
}

/**
 * Policy engine for evaluating OTP request auto-approval rules.
 */
export class PolicyEngine {
  constructor(private db: DbClient) {}

  /**
   * Evaluates an OTP request against auto-approval rules.
   * Returns the decision (auto_approve, require_approval, or deny).
   */
  async evaluate(
    userId: string,
    request: OTPRequestInput
  ): Promise<ApprovalResult> {
    // TODO: Implement auto-approval rules
    // For now, always require manual approval for security

    return {
      decision: 'require_approval',
      reason: 'Default: manual approval required for all OTP requests',
    };
  }

  /**
   * Checks if a sender matches a pattern.
   * Supports wildcards (*) for partial matching.
   */
  private matchesSenderPattern(sender: string, pattern: string): boolean {
    if (pattern === '*') {
      return true;
    }

    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/\*/g, '.*'); // Convert * to .*

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(sender);
  }
}

/**
 * Creates a new policy engine instance.
 */
export function createPolicyEngine(db: DbClient): PolicyEngine {
  return new PolicyEngine(db);
}
