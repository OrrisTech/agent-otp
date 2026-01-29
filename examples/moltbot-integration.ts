/**
 * Example: Integrating Agent OTP with Moltbot/Claude Code
 *
 * This example shows how to create a skill that uses OTP protection
 * for sensitive operations like sending emails.
 */

import { AgentOTPClient, PermissionDeniedError, TimeoutError } from '@orrisai/agent-otp-sdk';

// Initialize the OTP client with your API key
const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_KEY!,
  baseUrl: process.env.AGENT_OTP_URL, // Optional: for self-hosted
});

/**
 * Example: Protected email sending skill
 */
export const sendEmailSkill = {
  name: 'send_email',
  description: 'Send an email with OTP protection',

  async execute(params: {
    to: string;
    subject: string;
    body: string;
    attachments?: string[];
  }) {
    console.log(`Requesting permission to send email to ${params.to}...`);

    try {
      // Request permission with context
      const permission = await otp.requestPermission({
        action: 'gmail.send',
        resource: `email:${params.to}`,
        scope: {
          max_emails: 1,
          has_attachments: (params.attachments?.length ?? 0) > 0,
        },
        context: {
          reason: `Send email: "${params.subject}"`,
          recipient: params.to,
          subject_preview: params.subject.substring(0, 50),
        },
        waitForApproval: true,
        timeout: 120000, // 2 minutes to approve
        onPendingApproval: (info) => {
          console.log('\n=================================');
          console.log('APPROVAL REQUIRED');
          console.log(`Approve at: ${info.approvalUrl}`);
          console.log(`Expires: ${info.expiresAt}`);
          console.log('=================================\n');
        },
      });

      console.log(`Permission granted! Token: ${permission.token?.substring(0, 10)}...`);

      // Actually send the email (your email sending logic here)
      const result = await actualEmailSender({
        to: params.to,
        subject: params.subject,
        body: params.body,
        attachments: params.attachments,
        // Pass the OTP token if your email service accepts it
        otpToken: permission.token,
      });

      // Mark token as used
      await otp.useToken(permission.id, permission.token!, {
        actionDetails: {
          recipient: params.to,
          subject: params.subject,
          sent_at: new Date().toISOString(),
        },
      });

      return result;
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        console.log(`Permission denied: ${error.reason}`);
        throw new Error(`Cannot send email: Permission denied - ${error.reason}`);
      }
      if (error instanceof TimeoutError) {
        console.log('Permission request timed out waiting for approval');
        throw new Error('Email not sent: Approval timed out');
      }
      throw error;
    }
  },
};

/**
 * Example: Protected file deletion skill
 */
export const deleteFileSkill = {
  name: 'delete_file',
  description: 'Delete a file with OTP protection',

  async execute(params: { path: string; reason: string }) {
    // Use executeWithPermission for simpler one-shot operations
    return await otp.executeWithPermission(
      {
        action: 'file.delete',
        resource: `file:${params.path}`,
        scope: {
          permanent: true,
        },
        context: {
          reason: params.reason,
          file_path: params.path,
        },
        waitForApproval: true,
        timeout: 60000,
      },
      async (token, scope) => {
        console.log('Permission granted, deleting file...');

        // Your actual file deletion logic
        // await fs.unlink(params.path);

        return { deleted: true, path: params.path };
      }
    );
  },
};

/**
 * Example: Bank transfer skill (always requires approval)
 */
export const bankTransferSkill = {
  name: 'bank_transfer',
  description: 'Initiate a bank transfer with OTP protection',

  async execute(params: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    currency: string;
    memo?: string;
  }) {
    return await otp.executeWithPermission(
      {
        action: 'bank.transfer',
        resource: `account:${params.fromAccount}`,
        scope: {
          max_amount: params.amount,
          currency: params.currency,
          destination: params.toAccount,
        },
        context: {
          reason: params.memo ?? 'Transfer requested by agent',
          from_account: params.fromAccount,
          to_account: params.toAccount,
          amount: `${params.amount} ${params.currency}`,
        },
        waitForApproval: true,
        timeout: 300000, // 5 minutes for financial operations
      },
      async (token, scope) => {
        console.log('Transfer approved, initiating...');

        // Your actual bank transfer logic
        const transferId = await initiateTransfer({
          from: params.fromAccount,
          to: params.toAccount,
          amount: params.amount,
          currency: params.currency,
          otpToken: token,
        });

        return {
          success: true,
          transferId,
          amount: params.amount,
          currency: params.currency,
        };
      }
    );
  },
};

/**
 * Example: Auto-approved operation (based on policy)
 */
export const readFileSkill = {
  name: 'read_file',
  description: 'Read a file (may be auto-approved based on policy)',

  async execute(params: { path: string }) {
    const permission = await otp.requestPermission({
      action: 'file.read',
      resource: `file:${params.path}`,
      scope: {
        size_limit: 1024 * 1024, // 1MB
      },
      context: {
        file_path: params.path,
      },
      // Don't wait for approval - we expect auto-approve for small files
      waitForApproval: false,
    });

    if (permission.status === 'approved' && permission.token) {
      // Read file
      // const content = await fs.readFile(params.path, 'utf-8');

      await otp.useToken(permission.id, permission.token);
      return { content: '...file content...' };
    }

    if (permission.status === 'pending') {
      // Could show approval URL to user or wait
      return {
        pending: true,
        approvalUrl: permission.approvalUrl,
        message: 'Please approve this file read operation',
      };
    }

    throw new Error(`File read not permitted: ${permission.reason}`);
  },
};

// Placeholder functions for actual implementations
async function actualEmailSender(params: {
  to: string;
  subject: string;
  body: string;
  attachments?: string[];
  otpToken?: string;
}) {
  // Your actual email sending implementation
  console.log(`Would send email to ${params.to}`);
  return { messageId: 'msg_123', sent: true };
}

async function initiateTransfer(params: {
  from: string;
  to: string;
  amount: number;
  currency: string;
  otpToken: string;
}) {
  // Your actual bank transfer implementation
  console.log(`Would transfer ${params.amount} ${params.currency}`);
  return 'transfer_123';
}

// Export for use in Moltbot/agent frameworks
export default {
  sendEmailSkill,
  deleteFileSkill,
  bankTransferSkill,
  readFileSkill,
};
