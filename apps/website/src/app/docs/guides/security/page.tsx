import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Security Best Practices',
  description: 'Security guidelines and best practices for using Agent OTP in production environments.',
};

export default function SecurityPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Security Best Practices</h1>

      <p className="lead text-xl text-muted-foreground">
        Follow these security guidelines to protect your agents, tokens, and
        sensitive operations.
      </p>

      <h2>API Key Security</h2>

      <h3>Storage</h3>

      <ul>
        <li>
          <strong>Never commit API keys to source control</strong> - Use
          environment variables or secrets managers
        </li>
        <li>
          <strong>Use secrets management services</strong> - AWS Secrets Manager,
          HashiCorp Vault, or similar
        </li>
        <li>
          <strong>Rotate keys regularly</strong> - Implement a 90-day rotation
          policy
        </li>
        <li>
          <strong>Use separate keys per environment</strong> - Different keys for
          dev, staging, and production
        </li>
      </ul>

      <pre className="language-typescript">
        <code>{`// ❌ Bad: Hardcoded API key
const client = new AgentOTPClient({
  apiKey: 'ak_live_xxxx',
});

// ✅ Good: Environment variable
const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
});

// ✅ Better: Secrets manager
import { SecretsManager } from 'aws-sdk';
const secrets = new SecretsManager();
const { SecretString } = await secrets.getSecretValue({
  SecretId: 'agent-otp/api-key',
}).promise();
const client = new AgentOTPClient({
  apiKey: JSON.parse(SecretString!).apiKey,
});`}</code>
      </pre>

      <h3>Key Rotation</h3>

      <pre className="language-typescript">
        <code>{`// Support multiple keys during rotation
const apiKey = process.env.AGENT_OTP_API_KEY_NEW
  || process.env.AGENT_OTP_API_KEY;

// After deploying with new key, remove old key from environment
// and revoke it in the dashboard`}</code>
      </pre>

      <h2>Token Security</h2>

      <h3>Token Handling</h3>

      <ul>
        <li>
          <strong>Use tokens immediately</strong> - Don&apos;t store them for
          later use
        </li>
        <li>
          <strong>Never log tokens</strong> - They are sensitive credentials
        </li>
        <li>
          <strong>Set short TTLs</strong> - Use the minimum TTL needed
        </li>
        <li>
          <strong>Verify before critical operations</strong> - Call{' '}
          <code>verifyToken</code> before high-risk actions
        </li>
      </ul>

      <pre className="language-typescript">
        <code>{`// ❌ Bad: Logging tokens
console.log('Token:', permission.token);

// ✅ Good: Log permission ID only
console.log('Permission ID:', permission.id);

// ❌ Bad: Storing tokens
await cache.set('user_token', permission.token);

// ✅ Good: Use immediately
if (permission.status === 'approved') {
  await performAction(permission.token);
  await otp.useToken(permission.id, permission.token);
}`}</code>
      </pre>

      <h2>Scope Design</h2>

      <h3>Principle of Least Privilege</h3>

      <p>
        Request only the minimum scope needed:
      </p>

      <pre className="language-typescript">
        <code>{`// ❌ Bad: Overly broad scope
const permission = await otp.requestPermission({
  action: 'email.send',
  scope: {
    max_emails: 100,
    allowed_recipients: ['*'],
  },
});

// ✅ Good: Minimal scope
const permission = await otp.requestPermission({
  action: 'email.send',
  scope: {
    max_emails: 1,
    allowed_recipients: [specificRecipient],
    subject_pattern: '^Invoice #\\\\d+$',
  },
});`}</code>
      </pre>

      <h3>Scope Validation</h3>

      <p>
        Always validate that the granted scope meets your needs:
      </p>

      <pre className="language-typescript">
        <code>{`const permission = await otp.requestPermission({
  action: 'file.write',
  scope: { max_size: 10485760 }, // Request 10MB
});

// Check granted scope
if (permission.scope.max_size < requiredSize) {
  throw new Error('Insufficient scope granted');
}`}</code>
      </pre>

      <h2>Context for Audit Trail</h2>

      <p>
        Always provide meaningful context for audit purposes:
      </p>

      <pre className="language-typescript">
        <code>{`const permission = await otp.requestPermission({
  action: 'payment.transfer',
  scope: { max_amount: 100 },
  context: {
    // Who triggered this?
    triggered_by: 'user_request',
    user_id: userId,

    // What is it for?
    reason: 'Monthly subscription payment',
    invoice_id: invoiceId,

    // When did this happen?
    timestamp: new Date().toISOString(),

    // Where did it come from?
    source_ip: requestIp,
    user_agent: userAgent,
  },
});`}</code>
      </pre>

      <h2>Error Handling</h2>

      <h3>Secure Error Messages</h3>

      <pre className="language-typescript">
        <code>{`try {
  const permission = await otp.requestPermission({...});
} catch (error) {
  // ❌ Bad: Exposing internal details
  console.error('Full error:', error);
  return res.status(500).json({ error: error.message });

  // ✅ Good: Log internally, return generic message
  logger.error('OTP request failed', {
    code: error.code,
    permissionId: error.permissionId,
    // Don't log tokens or sensitive data
  });

  return res.status(500).json({
    error: 'Operation failed. Please try again.',
  });
}`}</code>
      </pre>

      <h2>Network Security</h2>

      <h3>TLS/SSL</h3>

      <ul>
        <li>
          <strong>Always use HTTPS</strong> - The SDK enforces HTTPS by default
        </li>
        <li>
          <strong>Verify certificates</strong> - Don&apos;t disable certificate
          validation
        </li>
        <li>
          <strong>Use TLS 1.2 or higher</strong> - Older protocols are disabled
        </li>
      </ul>

      <h3>Firewall Rules</h3>

      <pre className="language-bash">
        <code>{`# Allow outbound to Agent OTP API
iptables -A OUTPUT -p tcp -d api.agentotp.com --dport 443 -j ACCEPT

# For self-hosted: restrict API access to known IPs
iptables -A INPUT -p tcp --dport 3000 -s 10.0.0.0/8 -j ACCEPT
iptables -A INPUT -p tcp --dport 3000 -j DROP`}</code>
      </pre>

      <h2>Monitoring and Alerting</h2>

      <h3>Key Metrics to Monitor</h3>

      <ul>
        <li>
          <strong>Denial rate</strong> - Sudden increase may indicate attack
        </li>
        <li>
          <strong>Request volume</strong> - Unusual spikes need investigation
        </li>
        <li>
          <strong>Token usage patterns</strong> - Unused tokens may indicate
          issues
        </li>
        <li>
          <strong>Failed authentications</strong> - May indicate compromised keys
        </li>
      </ul>

      <pre className="language-typescript">
        <code>{`// Set up alerts
const metrics = await otp.getMetrics({ period: '1h' });

if (metrics.denialRate > 0.5) {
  alert('High denial rate detected', {
    rate: metrics.denialRate,
    threshold: 0.5,
  });
}

if (metrics.unusedTokenRate > 0.3) {
  alert('High unused token rate', {
    rate: metrics.unusedTokenRate,
  });
}`}</code>
      </pre>

      <h2>Compliance</h2>

      <h3>Audit Log Retention</h3>

      <p>
        Configure retention based on your compliance requirements:
      </p>

      <ul>
        <li>
          <strong>SOC 2</strong> - 1 year minimum
        </li>
        <li>
          <strong>HIPAA</strong> - 6 years
        </li>
        <li>
          <strong>GDPR</strong> - As long as necessary, with deletion capability
        </li>
      </ul>

      <h3>Data Residency</h3>

      <p>
        For data residency requirements, use self-hosting or specify region:
      </p>

      <pre className="language-typescript">
        <code>{`// Use region-specific endpoint
const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
  baseUrl: 'https://api.eu.agentotp.com', // EU region
});`}</code>
      </pre>

      <h2>Security Checklist</h2>

      <div className="not-prose my-4 rounded-lg border border-border p-4">
        <h4 className="font-semibold mb-2">Pre-Production Checklist</h4>
        <ul className="space-y-1 text-sm">
          <li>☐ API keys stored in secrets manager</li>
          <li>☐ Environment-specific keys configured</li>
          <li>☐ Key rotation policy documented</li>
          <li>☐ Policies reviewed and tested</li>
          <li>☐ Explicit denies for dangerous operations</li>
          <li>☐ Scope templates minimize permissions</li>
          <li>☐ Error handling doesn&apos;t leak sensitive info</li>
          <li>☐ Audit logging configured</li>
          <li>☐ Monitoring and alerting set up</li>
          <li>☐ TLS/SSL verified</li>
          <li>☐ Firewall rules configured</li>
          <li>☐ Compliance requirements documented</li>
        </ul>
      </div>

      <h2>Reporting Security Issues</h2>

      <p>
        If you discover a security vulnerability in Agent OTP:
      </p>

      <ul>
        <li>
          <strong>Email:</strong>{' '}
          <a href="mailto:security@agentotp.com">security@agentotp.com</a>
        </li>
        <li>
          <strong>PGP Key:</strong> Available at{' '}
          <a href="https://agentotp.com/.well-known/security.txt">
            security.txt
          </a>
        </li>
        <li>
          Please do not disclose publicly until we&apos;ve had time to address
          the issue
        </li>
      </ul>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/api/authentication" className="text-primary hover:underline">
            API Authentication
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/policies" className="text-primary hover:underline">
            Policy Best Practices
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/self-hosting" className="text-primary hover:underline">
            Self-Hosting Guide
          </Link>
        </li>
      </ul>
    </article>
  );
}
