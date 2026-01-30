import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Encryption',
  description: 'Learn how Agent OTP uses end-to-end encryption to protect verification codes with RSA-OAEP.',
};

export default function EncryptionPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>End-to-End Encryption</h1>

      <p className="lead text-xl text-muted-foreground">
        Agent OTP uses end-to-end encryption to ensure that only your agent can
        read verification codes. The relay service never sees plaintext OTPs.
      </p>

      <h2>How It Works</h2>

      <p>
        Agent OTP uses asymmetric encryption (RSA-OAEP) for secure OTP relay:
      </p>

      <ol>
        <li>
          <strong>Key Generation</strong> - Your agent generates an RSA key pair
          (public and private keys)
        </li>
        <li>
          <strong>Public Key Sharing</strong> - The public key is sent with each
          OTP request
        </li>
        <li>
          <strong>Encryption on Capture</strong> - When an OTP is captured, it&apos;s
          immediately encrypted using the public key
        </li>
        <li>
          <strong>Decryption by Agent</strong> - Only the agent with the private
          key can decrypt the OTP
        </li>
      </ol>

      <h2>Encryption Algorithm</h2>

      <p>Agent OTP uses the following cryptographic parameters:</p>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-semibold">Algorithm</td>
              <td className="py-2 px-4">RSA-OAEP</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-semibold">Key Size</td>
              <td className="py-2 px-4">2048 bits</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-semibold">Hash Function</td>
              <td className="py-2 px-4">SHA-256</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-semibold">Key Format</td>
              <td className="py-2 px-4">SPKI (public), PKCS8 (private)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Key Management</h2>

      <h3>Generating Keys</h3>

      <p>
        Use the SDK to generate a key pair. This should be done once when setting
        up your agent:
      </p>

      <pre className="language-typescript">
        <code>{`import {
  generateKeyPair,
  exportPublicKey,
  exportPrivateKey,
} from '@orrisai/agent-otp-sdk';

// Generate a new key pair
const { publicKey, privateKey } = await generateKeyPair();

// Export keys to base64 strings for storage
const publicKeyBase64 = await exportPublicKey(publicKey);
const privateKeyBase64 = await exportPrivateKey(privateKey);

// Store these securely
console.log('Public Key:', publicKeyBase64);   // Can be shared
console.log('Private Key:', privateKeyBase64); // Keep secret!`}</code>
      </pre>

      <h3>Storing Keys Securely</h3>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Critical:</strong> Your private key must be stored securely.
          Anyone with access to the private key can decrypt your OTPs.
        </p>
      </div>

      <p>Recommended storage options:</p>

      <ul>
        <li>
          <strong>Environment variables</strong> - Simple for single-agent deployments
        </li>
        <li>
          <strong>Secrets managers</strong> - AWS Secrets Manager, HashiCorp Vault,
          Google Secret Manager
        </li>
        <li>
          <strong>Hardware security modules</strong> - For high-security environments
        </li>
      </ul>

      <p>Never store private keys in:</p>

      <ul>
        <li>Source code repositories</li>
        <li>Configuration files committed to version control</li>
        <li>Client-side code or browser storage</li>
        <li>Logs or debug output</li>
      </ul>

      <h3>Loading Keys at Runtime</h3>

      <pre className="language-typescript">
        <code>{`import { importPrivateKey } from '@orrisai/agent-otp-sdk';

// Load from environment variable
const privateKey = await importPrivateKey(
  process.env.AGENT_PRIVATE_KEY!
);

// Use for consuming OTPs
const { code } = await client.consumeOTP(requestId, privateKey);`}</code>
      </pre>

      <h2>Key Rotation</h2>

      <p>
        While keys don&apos;t expire, you may want to rotate them periodically or
        if you suspect compromise:
      </p>

      <ol>
        <li>Generate a new key pair</li>
        <li>Update your secrets storage with the new private key</li>
        <li>Update the public key used in OTP requests</li>
        <li>Old requests will still use the old key until consumed</li>
      </ol>

      <h2>What Gets Encrypted</h2>

      <p>The following data is encrypted with your public key:</p>

      <ul>
        <li>The OTP code itself (e.g., &quot;123456&quot;)</li>
        <li>The full message content (optional, if requested)</li>
      </ul>

      <p>The following metadata is NOT encrypted (used for filtering/matching):</p>

      <ul>
        <li>Sender information (email address, phone number)</li>
        <li>Timestamp of receipt</li>
        <li>OTP source (SMS, email)</li>
      </ul>

      <h2>Security Guarantees</h2>

      <h3>What E2E Encryption Protects Against</h3>

      <ul>
        <li>
          <strong>Relay service compromise</strong> - Even if Agent OTP servers
          are breached, encrypted OTPs cannot be read
        </li>
        <li>
          <strong>Man-in-the-middle attacks</strong> - Intercepted encrypted payloads
          are useless without the private key
        </li>
        <li>
          <strong>Insider threats</strong> - Agent OTP staff cannot read your OTPs
        </li>
      </ul>

      <h3>What E2E Encryption Does NOT Protect Against</h3>

      <ul>
        <li>
          <strong>Private key compromise</strong> - If your private key is stolen,
          the attacker can decrypt your OTPs
        </li>
        <li>
          <strong>Agent compromise</strong> - If your agent is compromised after
          decryption, the OTP is exposed
        </li>
        <li>
          <strong>Capture source compromise</strong> - If your SMS/email is compromised
          before capture, OTPs may be intercepted there
        </li>
      </ul>

      <h2>Technical Details</h2>

      <h3>Encryption Process</h3>

      <pre className="language-typescript">
        <code>{`// Simplified view of the encryption process (server-side)

// 1. OTP is captured from source
const otpCode = '123456';

// 2. Convert to bytes
const encoder = new TextEncoder();
const data = encoder.encode(otpCode);

// 3. Encrypt with agent's public key
const encrypted = await crypto.subtle.encrypt(
  { name: 'RSA-OAEP' },
  agentPublicKey,
  data
);

// 4. Store encrypted payload (base64)
const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));`}</code>
      </pre>

      <h3>Decryption Process</h3>

      <pre className="language-typescript">
        <code>{`// Simplified view of the decryption process (SDK)

// 1. Fetch encrypted payload from server
const encryptedBase64 = response.encryptedPayload;

// 2. Decode from base64
const encryptedBytes = Uint8Array.from(
  atob(encryptedBase64),
  c => c.charCodeAt(0)
);

// 3. Decrypt with private key
const decrypted = await crypto.subtle.decrypt(
  { name: 'RSA-OAEP' },
  privateKey,
  encryptedBytes
);

// 4. Decode to string
const decoder = new TextDecoder();
const otpCode = decoder.decode(decrypted);`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/how-it-works" className="text-primary hover:underline">
            How Agent OTP Works
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/typescript" className="text-primary hover:underline">
            TypeScript SDK Reference
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/security" className="text-primary hover:underline">
            Security Best Practices
          </Link>
        </li>
      </ul>
    </article>
  );
}
