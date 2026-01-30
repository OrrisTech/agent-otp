import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Self-Hosting Guide',
  description: 'Deploy Agent OTP on your own infrastructure for maximum control and compliance.',
};

export default function SelfHostingPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Self-Hosting Guide</h1>

      <p className="lead text-xl text-muted-foreground">
        Deploy Agent OTP on your own infrastructure. Full control over your
        data, compliance with regulations, and air-gapped deployments.
      </p>

      <h2>Prerequisites</h2>

      <ul>
        <li>Docker and Docker Compose</li>
        <li>PostgreSQL 15+ (or use included container)</li>
        <li>Redis 7+ (or use included container)</li>
        <li>Domain with SSL certificate (for production)</li>
      </ul>

      <h2>Quick Start with Docker</h2>

      <pre className="language-bash">
        <code>{`# Clone the repository
git clone https://github.com/orristech/agent-otp.git
cd agent-otp

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Start all services
docker compose up -d

# Check status
docker compose ps`}</code>
      </pre>

      <h2>Environment Configuration</h2>

      <pre className="language-bash">
        <code>{`# .env file

# Database
DATABASE_URL=postgresql://postgres:password@db:5432/agent_otp
POSTGRES_PASSWORD=your-secure-password

# Redis
REDIS_URL=redis://redis:6379

# API Configuration
API_PORT=3000
API_SECRET_KEY=your-32-character-secret-key
JWT_SECRET=your-jwt-secret

# Dashboard
DASHBOARD_URL=https://otp.your-company.com
NEXT_PUBLIC_API_URL=https://api.otp.your-company.com

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-bot-token

# Email Notifications (optional)
SMTP_HOST=smtp.your-company.com
SMTP_PORT=587
SMTP_USER=notifications@your-company.com
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=notifications@your-company.com

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key`}</code>
      </pre>

      <h2>Docker Compose Configuration</h2>

      <pre className="language-yaml">
        <code>{`# docker-compose.yml
version: '3.8'

services:
  api:
    image: ghcr.io/orristech/agent-otp-api:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
      - API_SECRET_KEY=\${API_SECRET_KEY}
      - JWT_SECRET=\${JWT_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped

  dashboard:
    image: ghcr.io/orristech/agent-otp-dashboard:latest
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=\${API_URL}
    restart: unless-stopped

  telegram-bot:
    image: ghcr.io/orristech/agent-otp-telegram:latest
    environment:
      - API_URL=http://api:3000
      - TELEGRAM_BOT_TOKEN=\${TELEGRAM_BOT_TOKEN}
    depends_on:
      - api
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=agent_otp
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:`}</code>
      </pre>

      <h2>Database Setup</h2>

      <p>
        Run migrations after starting the database:
      </p>

      <pre className="language-bash">
        <code>{`# Apply database migrations
docker compose exec api bun run db:migrate

# Seed initial data (optional)
docker compose exec api bun run db:seed`}</code>
      </pre>

      <h2>Kubernetes Deployment</h2>

      <p>
        For production Kubernetes deployments:
      </p>

      <pre className="language-bash">
        <code>{`# Add the Helm repository
helm repo add agent-otp https://charts.agentotp.com
helm repo update

# Create namespace
kubectl create namespace agent-otp

# Create secrets
kubectl create secret generic agent-otp-secrets \\
  --namespace agent-otp \\
  --from-literal=database-url='postgresql://...' \\
  --from-literal=redis-url='redis://...' \\
  --from-literal=api-secret='...'

# Install with Helm
helm install agent-otp agent-otp/agent-otp \\
  --namespace agent-otp \\
  --values values.yaml`}</code>
      </pre>

      <h3>Helm Values Example</h3>

      <pre className="language-yaml">
        <code>{`# values.yaml
api:
  replicas: 3
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"

dashboard:
  replicas: 2
  ingress:
    enabled: true
    host: otp.your-company.com
    tls: true

postgresql:
  enabled: false  # Use external database

redis:
  enabled: true
  cluster:
    enabled: true

ingress:
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod`}</code>
      </pre>

      <h2>SSL/TLS Configuration</h2>

      <h3>With Let&apos;s Encrypt (Caddy)</h3>

      <pre className="language-text">
        <code>{`# Caddyfile
api.otp.your-company.com {
  reverse_proxy api:3000
}

otp.your-company.com {
  reverse_proxy dashboard:3000
}`}</code>
      </pre>

      <h3>With nginx</h3>

      <pre className="language-nginx">
        <code>{`server {
    listen 443 ssl http2;
    server_name api.otp.your-company.com;

    ssl_certificate /etc/letsencrypt/live/api.otp.your-company.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.otp.your-company.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`}</code>
      </pre>

      <h2>High Availability</h2>

      <p>
        For production deployments requiring high availability:
      </p>

      <ul>
        <li>
          <strong>API</strong> - Deploy 3+ instances behind a load balancer
        </li>
        <li>
          <strong>PostgreSQL</strong> - Use a managed service or replica set
        </li>
        <li>
          <strong>Redis</strong> - Use Redis Cluster or Sentinel
        </li>
        <li>
          <strong>Telegram Bot</strong> - Single instance with failover
        </li>
      </ul>

      <h2>Backup and Recovery</h2>

      <pre className="language-bash">
        <code>{`# Backup database
docker compose exec db pg_dump -U postgres agent_otp > backup.sql

# Restore database
docker compose exec -T db psql -U postgres agent_otp < backup.sql

# Backup Redis
docker compose exec redis redis-cli BGSAVE

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T db pg_dump -U postgres agent_otp | gzip > "backup_\${DATE}.sql.gz"
aws s3 cp "backup_\${DATE}.sql.gz" s3://your-backup-bucket/`}</code>
      </pre>

      <h2>Monitoring</h2>

      <p>
        The API exposes Prometheus metrics:
      </p>

      <pre className="language-bash">
        <code>{`# Metrics endpoint
curl http://localhost:3000/metrics

# Example metrics
agent_otp_permissions_total{status="approved"} 1234
agent_otp_permissions_total{status="denied"} 56
agent_otp_token_usage_total 1180
agent_otp_api_latency_seconds{quantile="0.99"} 0.045`}</code>
      </pre>

      <h3>Grafana Dashboard</h3>

      <p>
        Import the official Grafana dashboard:
      </p>

      <pre className="language-bash">
        <code>{`# Dashboard ID: 12345
# Or import from: https://grafana.com/grafana/dashboards/12345`}</code>
      </pre>

      <h2>Security Hardening</h2>

      <ul>
        <li>
          <strong>Network isolation</strong> - Put database and Redis on private
          network
        </li>
        <li>
          <strong>Secrets management</strong> - Use Vault, AWS Secrets Manager,
          or similar
        </li>
        <li>
          <strong>Audit logging</strong> - Forward logs to SIEM system
        </li>
        <li>
          <strong>Encryption at rest</strong> - Enable database encryption
        </li>
        <li>
          <strong>Rate limiting</strong> - Configure per-IP rate limits
        </li>
      </ul>

      <h2>Updating</h2>

      <pre className="language-bash">
        <code>{`# Pull latest images
docker compose pull

# Restart services with zero downtime
docker compose up -d --no-deps api
docker compose up -d --no-deps dashboard

# Run any new migrations
docker compose exec api bun run db:migrate`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/configuration" className="text-primary hover:underline">
            Configuration Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/security" className="text-primary hover:underline">
            Security Best Practices
          </Link>
        </li>
        <li>
          <Link href="/docs/api/authentication" className="text-primary hover:underline">
            API Authentication
          </Link>
        </li>
      </ul>
    </article>
  );
}
