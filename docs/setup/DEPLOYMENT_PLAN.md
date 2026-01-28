# DigitalOcean Deployment & CI/CD Plan

Complete deployment strategy for the Restaurant Ordering System on DigitalOcean with CI/CD automation.

**Domain Configuration:** `orders.radbug.dev`

## Table of Contents

- [Project Analysis](#project-analysis)
- [Deployment Strategy](#deployment-strategy)
- [Architecture Overview](#architecture-overview)
- [Phase 1: Infrastructure Setup](#phase-1-infrastructure-setup)
- [Phase 2: Project Configuration](#phase-2-project-configuration)
- [Phase 3: CI/CD Pipeline](#phase-3-cicd-pipeline)
- [Phase 4: SSL Setup](#phase-4-ssl-certificate-setup)
- [Phase 5: Backup Strategy](#phase-5-backup-strategy)
- [Phase 6: Production Deployment](#phase-6-production-deployment)
- [Phase 7: Monitoring](#phase-7-monitoring-and-maintenance)
- [Cost Summary](#cost-summary)
- [Security Checklist](#security-checklist)

---

## Project Analysis

### Tech Stack
- **Frontend/Backend**: SvelteKit 5.45, Svelte 5, Vite 7.2
- **Database**: SQLite via @libsql/client (supports both file and remote SQLite)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Current Adapter**: `@sveltejs/adapter-auto`
- **Testing**: Vitest (unit) + Playwright (E2E)

### Environment Requirements
- `DATABASE_URL` - SQLite file path or remote database URL
- No other secrets currently required

### Key Considerations
- SQLite requires **persistent storage** (not available on App Platform)
- Current adapter (adapter-auto) needs to be replaced with Bun adapter for optimal SQLite performance
- Application needs reverse proxy + SSL for production
- Automated backups are essential for production data

---

## Deployment Strategy

### Primary Recommendation: DigitalOcean Droplet with Persistent Volume

**Why Droplet over App Platform:**

| Feature | App Platform | Droplet (Recommended) |
|----------|--------------|------------------------|
| **Persistent Storage** | ❌ Data lost on redeploy | ✅ Volumes available |
| **SQLite Support** | ❌ Not suitable | ✅ Excellent with Bun |
| **Setup Complexity** | Low | Moderate |
| **Server Maintenance** | Managed | Manual |
| **Auto-Scaling** | ✅ Yes | ❌ Manual |
| **SSL** | ✅ Automatic | Manual (Certbot) |
| **Cost** | $5/month+ | ~$5.40/month |
| **Control** | Limited | Full control |

**Critical Finding:** DigitalOcean App Platform does NOT support persistent filesystem storage. Data in host instance's local filesystem is permanently lost after deployments and other container replacements.

**Recommended Stack:**
- **Droplet**: Ubuntu 24.04 with 1GB RAM ($4/month)
- **Runtime**: Bun (faster than Node, excellent SQLite support)
- **Adapter**: `svelte-adapter-bun`
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy + SSL)
- **Storage**: DigitalOcean Volume for persistent SQLite (10GB)
- **Backup**: DigitalOcean automated backups + custom script to Spaces
- **CI/CD**: GitHub Actions with rsync deployment

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD - GitHub Actions                    │
│  Push to main → Build & Test → Deploy via SSH/rsync         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              DigitalOcean Infrastructure                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Ubuntu Droplet                           │   │
│  │                                                       │   │
│  │  ┌──────────────┐  ┌──────────────────────────┐    │   │
│  │  │   Nginx      │  │     PM2                 │    │   │
│  │  │   + SSL      │  │  ┌────────────────────┐  │    │   │
│  │  │  (Port 80/   │◄─┼──│  SvelteKit App    │  │    │   │
│  │  │   443)       │  │  │  (Bun Runtime)    │  │    │   │
│  │  └──────────────┘  │  └────────────────────┘  │    │   │
│  │                    │           │                │    │   │
│  │                    │           ▼                │    │   │
│  │                    │  ┌────────────────────┐  │    │   │
│  │                    │  │  SQLite Database   │  │    │   │
│  │                    │  └────────────────────┘  │    │   │
│  │                    │           │                │    │   │
│  │                    │           ▼                │    │   │
│  │                    │  ┌────────────────────┐  │    │   │
│  │                    │  │  DigitalOcean     │  │    │   │
│  │                    │  │  Volume (10GB)    │  │    │   │
│  │                    │  │  Persistent Storage│  │    │   │
│  │                    │  └────────────────────┘  │    │   │
│  │                    └──────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Backup System                               │
│  Cron Job (Daily @ 2AM) → Backup Script → Copy to Backup    │
│                                          → Upload to Spaces  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Infrastructure Setup

### 1.1 DigitalOcean Resources

**Resources to Create:**

| Resource | Specs | Monthly Cost |
|----------|-------|--------------|
| **Droplet** | Ubuntu 24.04, 1GB RAM, 1 vCPU, 25GB SSD | $4.00 |
| **Volume** | 10GB SSD storage (persistent) | $1.00 |
| **Backups** | Daily automated backups (4-6 hour retention) | ~$0.40 |
| **Total** | | **~$5.40/month** |

**Setup via DigitalOcean CLI (doctl):**

```bash
# Install doctl (if not already installed)
curl -sL https://github.com/digitalocean/doctl/releases/latest/download/doctl-linux-amd64.tar.gz | tar xz
sudo mv doctl /usr/local/bin/

# Authenticate
doctl auth init

# Create droplet
doctl compute droplet create restaurant-orders \
  --region nyc1 \
  --size s-1vcpu-1gb \
  --image ubuntu-24-04-x64 \
  --ssh-keys <your-ssh-key-fingerprint> \
  --enable-monitoring \
  --enable-backups

# Note the droplet ID from output
DROPLET_ID=<droplet-id-from-output>

# Create volume for SQLite storage
doctl compute volume create sqlite-data \
  --size 10gb \
  --region nyc1 \
  --description "Restaurant Orders SQLite Database"

# Attach volume to droplet
doctl compute volume-action attach sqlite-data --droplet-id $DROPLET_ID

# Get droplet IP
doctl compute droplet get $DROPLET_ID --format PublicIPv4
```

**Alternative: Use DigitalOcean Control Panel**

1. Create Droplet:
   - Navigate to "Droplets" → "Create Droplet"
   - Choose: Ubuntu 24.04 LTS, Basic, $4/month (1GB RAM, 1 vCPU)
   - Add your SSH key
   - Enable backups
   - Choose region (e.g., NYC1, SFO2, etc.)
   - Create droplet

2. Create Volume:
   - Navigate to "Volumes" → "Create Volume"
   - Size: 10GB
   - Region: Same as droplet
   - Attach to: restaurant-orders droplet

3. Note droplet IP address

### 1.2 Server Initial Setup

SSH into your new droplet and perform initial setup:

```bash
# SSH into droplet
ssh root@<droplet-ip>

# Update system packages
apt update && apt upgrade -y

# Set timezone (optional)
timedatectl set-timezone America/New_York

# Install essential tools
apt install -y curl wget git ufw fail2ban

# Install Bun runtime (faster than Node.js, excellent SQLite support)
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify Bun installation
bun --version

# Install PM2 globally (process manager)
bun install -g pm2

# Install Nginx (reverse proxy)
apt install nginx -y

# Setup volume for persistent SQLite storage
mkfs.ext4 /dev/disk/by-id/scsi-0DO_Volume_sqlite-data
mkdir -p /mnt/sqlite-data
mount /dev/disk/by-id/scsi-0DO_Volume_sqlite-data /mnt/sqlite-data

# Set permissions for web server
chown -R www-data:www-data /mnt/sqlite-data

# Configure auto-mount on reboot
echo '/dev/disk/by-id/scsi-0DO_Volume_sqlite-data /mnt/sqlite-data ext4 defaults,nofail 0 0' >> /etc/fstab

# Verify mount
mount | grep sqlite-data

# Create application directory
mkdir -p /var/www/restaurant-orders/logs
chown -R www-data:www-data /var/www/restaurant-orders

# Configure firewall (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Verify firewall
ufw status
```

### 1.3 SSH Key Generation (for CI/CD)

Generate SSH key for GitHub Actions deployment:

```bash
# On your local machine (not the server)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Add public key to server's authorized_keys
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@<droplet-ip>

# Test SSH connection
ssh -i ~/.ssh/github_actions_deploy root@<droplet-ip> "echo 'SSH connection successful'"
```

**Add secrets to GitHub:**
1. Copy private key: `cat ~/.ssh/github_actions_deploy`
2. Navigate to repository → Settings → Secrets and variables → Actions
3. Add secrets:
   - `SSH_PRIVATE_KEY`: (paste private key)
   - `DROPLET_IP`: (droplet IP address)
   - `SSH_HOST_KEY`: (run `ssh-keyscan <droplet-ip>` and paste output)

---

## Phase 2: Project Configuration

### 2.1 Update Adapter for Bun Runtime

**Install Bun adapter:**

```bash
npm install -D svelte-adapter-bun
```

**Update `svelte.config.js`:**

```javascript
import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // adapter-bun for Bun runtime on DigitalOcean Droplet
    adapter: adapter()
  }
};

export default config;
```

### 2.2 Update Database Configuration

**Note**: Using `@libsql/client` for both development and production. It supports both `file://` URLs (for local development and production volume) and avoids build issues.

**Update `src/lib/server/db/index.ts`:**

```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// @ts-expect-error - SvelteKit $env types are generated at build time
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = createClient({ url: env.DATABASE_URL });

export const db = drizzle(client, { schema });
```

### 2.3 Environment Configuration

**Create `.env.production` (not committed to git):**

```bash
# Database configuration
DATABASE_URL=/mnt/sqlite-data/database.db

# Application settings
NODE_ENV=production
PORT=3000

# CORS origin
ORIGIN=https://orders.radbug.dev
```

**Update `.gitignore` to ensure sensitive files aren't committed:**

```gitignore
# ... existing .gitignore ...

# Environment files
.env
.env.production
.env.local

# Database files
*.db
*.db-shm
*.db-wal

# Logs
logs/
*.log
```

### 2.4 Update Build Scripts

**Modify `package.json` scripts:**

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview --host",
    "start": "bun build/index.js",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun db/seed/seed-simple.mjs",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint .",
    "test:unit": "vitest",
    "test": "npm run test:unit -- --run && npm run test:e2e",
    "test:e2e": "playwright test"
  }
}
```

**Note:** Added `--host` flag to preview script for production accessibility.

### 2.5 Create PM2 Ecosystem File

PM2 will manage the application process, ensure it stays running, and enable zero-downtime restarts.

**Create `ecosystem.config.js` in project root:**

```javascript
module.exports = {
  apps: [{
    name: 'restaurant-orders',
    script: './build/index.js',
    interpreter: '/root/.bun/bin/bun',
    cwd: '/var/www/restaurant-orders',

    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: '/mnt/sqlite-data/database.db',
      ORIGIN: 'https://orders.radbug.dev'
    },

    // Log configuration
    error_file: '/var/www/restaurant-orders/logs/error.log',
    out_file: '/var/www/restaurant-orders/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Process management
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',

    // Cluster mode (optional, for multiple cores)
    // instances: 'max',
    // exec_mode: 'cluster',

    // Watch for changes (disable in production)
    watch: false
  }]
};
```

### 2.6 Create Nginx Configuration

Nginx will act as a reverse proxy, handling SSL termination and forwarding requests to the SvelteKit application.

**Create `/etc/nginx/sites-available/restaurant-orders`:**

```nginx
# Upstream configuration
upstream sveltekit_backend {
  server 127.0.0.1:3000;
  keepalive 64;
}

# HTTP server (redirect to HTTPS)
  server {
    listen 80;
    listen [::]:80;
    server_name orders.radbug.dev;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
  }

  # HTTPS server
  server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name orders.radbug.dev;

    # SSL certificate paths (will be created by Certbot)
    ssl_certificate /etc/letsencrypt/live/orders.radbug.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/orders.radbug.dev/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Client upload size (adjust as needed)
  client_max_body_size 10M;

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

  # Proxy configuration
  location / {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
    proxy_pass http://sveltekit_backend;
    proxy_http_version 1.1;

    # WebSocket support
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    # Disable buffering for real-time updates
    proxy_buffering off;
    proxy_cache_bypass $http_upgrade;
  }

  # Optional: Health check endpoint
  location /health {
    access_log off;
    proxy_pass http://sveltekit_backend;
  }
}
```

**Enable the site:**

```bash
# Remove default site
rm /etc/nginx/sites-enabled/default

# Enable restaurant-orders site
ln -s /etc/nginx/sites-available/restaurant-orders /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# If test passes, restart Nginx
systemctl restart nginx
```

---

## Phase 3: CI/CD Pipeline (GitHub Actions)

### 3.1 GitHub Secrets Required

Add these secrets to your GitHub repository:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DROPLET_IP` | Droplet IP address | `123.45.67.89` |
| `SSH_PRIVATE_KEY` | SSH private key for GitHub Actions | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `SSH_HOST_KEY` | Known hosts fingerprint for the droplet | `123.45.67.89 ecdsa-sha2-nistp256 ...` |

**How to get SSH_HOST_KEY:**

```bash
# On your local machine
ssh-keyscan -H <droplet-ip>
```

Copy the output and add it as the `SSH_HOST_KEY` secret.

### 3.2 Create GitHub Actions Workflow

**Create `.github/workflows/deploy.yaml`:**

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [main]
  workflow_dispatch:  # Allow manual trigger

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # ============================================
      # 1. Checkout code
      # ============================================
      - name: Checkout code
        uses: actions/checkout@v4

      # ============================================
      # 2. Setup Bun runtime
      # ============================================
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      # ============================================
      # 3. Install dependencies
      # ============================================
      - name: Install dependencies
        run: bun install --frozen-lockfile

      # ============================================
      # 4. Code quality checks
      # ============================================
      - name: Run linter
        run: bun run lint

      - name: Type check
        run: bun run check

      # ============================================
      # 5. Run tests
      # ============================================
      - name: Run unit tests
        run: bun run test:unit

      # Note: E2E tests can be run here if you have a staging environment
      # - name: Run E2E tests
      #   run: bun run test:e2e

      # ============================================
      # 6. Build application
      # ============================================
      - name: Build application
        run: bun run build
        env:
          DATABASE_URL: file:build-test.db  # Use temporary DB for build

      # ============================================
      # 7. Setup SSH connection
      # ============================================
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          echo "${{ secrets.SSH_HOST_KEY }}" >> ~/.ssh/known_hosts

      # ============================================
      # 8. Deploy to server
      # ============================================
      - name: Deploy to server
        uses: burnett01/rsync-deployments@6.0.0
        with:
          switches: -avzr --delete \
            --exclude='node_modules' \
            --exclude='.env*' \
            --exclude='*.db' \
            --exclude='.git' \
            --exclude='build' \
            --exclude='.svelte-kit' \
            --exclude='logs'
          path: ./
          remote_path: /var/www/restaurant-orders
          remote_host: ${{ secrets.DROPLET_IP }}
          remote_user: root
          remote_key: ${{ secrets.SSH_PRIVATE_KEY }}

      # ============================================
      # 9. Install production dependencies
      # ============================================
      - name: Install dependencies on server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/restaurant-orders
            bun install --production --frozen-lockfile

      # ============================================
      # 10. Seed database if not exists
      # ============================================
      - name: Seed database if not exists
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            if [ ! -f /mnt/sqlite-data/database.db ]; then
              cd /var/www/restaurant-orders
              echo "Seeding initial database..."
              bun run db:seed
              echo "Database seeded successfully!"
            else
              echo "Database already exists, skipping seed."
            fi

      # ============================================
      # 11. Build on server
      # ============================================
      - name: Build application on server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/restaurant-orders
            bun run build

      # ============================================
      # 12. Restart PM2
      # ============================================
      - name: Restart PM2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/restaurant-orders
            pm2 restart ecosystem.config.js --update-env

      # ============================================
      # 13. Health check
      # ============================================
      - name: Health check
        run: |
          sleep 10
          curl -f http://${{ secrets.DROPLET_IP }}/health || exit 1
```

### 3.3 Create Health Check Endpoint

**Create `src/routes/api/health/+server.ts`:**

```typescript
import { db } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  try {
    // Test database connection
    await db.execute('SELECT 1');

    return json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
};
```

---

## Phase 4: SSL Certificate Setup

### 4.1 Install Certbot

Certbot will automatically obtain and renew SSL certificates from Let's Encrypt.

```bash
# Install Certbot and Nginx plugin
apt install certbot python3-certbot-nginx -y

# Stop Nginx temporarily (if running)
systemctl stop nginx
```

### 4.2 Obtain SSL Certificate

```bash
# Obtain SSL certificate
certbot --nginx -d orders.radbug.dev

# You will be prompted to:
# 1. Enter your email address
# 2. Agree to Terms of Service
# 3. Choose whether to share email
# 4. Choose redirect option (select option 2 to redirect HTTP to HTTPS)

# Certbot will automatically:
# - Obtain certificate
# - Configure Nginx with SSL settings
# - Set up automatic HTTP to HTTPS redirect
# - Configure auto-renewal
```

### 4.3 Verify Auto-Renewal

```bash
# Test auto-renewal
certbot renew --dry-run

# If successful, you should see:
# "Congratulations, all simulated renewals succeeded."
```

### 4.4 Check Certificate Status

```bash
# List certificates
certbot certificates

# View certificate details
certbot certificates --cert-name orders.radbug.dev
```

### 4.5 Manual Renewal (if needed)

```bash
# Manually renew certificates
certbot renew

# Restart Nginx after renewal
systemctl restart nginx
```

---

## Phase 5: Backup Strategy

### 5.1 Automated DigitalOcean Backups

**Enable via DigitalOcean Control Panel:**

1. Navigate to your droplet
2. Click "Backups" tab
3. Click "Enable Backups"
4. Choose backup schedule:
   - Every 4 hours (most frequent)
   - Every 6 hours
   - Every 12 hours
5. Choose retention period:
   - 3 days (cheapest)
   - 7 days
   - 14 days
   - 1 month
6. Save settings

**Cost:** ~$0.40/month (usage-based pricing)

### 5.2 Custom Backup Script

This script creates daily backups and uploads to DigitalOcean Spaces (optional).

**Create `/var/www/restaurant-orders/backup-sqlite.sh`:**

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/mnt/sqlite-data/backups"
DB_PATH="/mnt/sqlite-data/database.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.db"
RETENTION_DAYS=7
SPACES_BUCKET="your-bucket-name"  # Optional: for DigitalOcean Spaces backup

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Starting backup at $(date)"
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✓ Backup created: $BACKUP_FILE"

  # Get file size
  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "  File size: $FILE_SIZE"
else
  echo "✗ Backup failed!"
  exit 1
fi

# Clean up old backups (keep last RETENTION_DAYS days)
echo "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "db_backup_*.db" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "  Deleted $DELETED old backup(s)"

# Optional: Upload to DigitalOcean Spaces (S3-compatible)
# Requires s3cmd to be installed and configured
if [ -n "$SPACES_BUCKET" ]; then
  echo "Uploading backup to DigitalOcean Spaces..."
  if command -v s3cmd &> /dev/null; then
    s3cmd put "$BACKUP_FILE" s3://$SPACES_BUCKET/backups/
    if [ $? -eq 0 ]; then
      echo "✓ Uploaded to Spaces"
    else
      echo "✗ Failed to upload to Spaces"
    fi
  else
    echo "⚠ s3cmd not found, skipping Spaces upload"
  fi
fi

# Backup summary
echo ""
echo "=== Backup Summary ==="
echo "  Timestamp: $(date)"
echo "  Backup file: $BACKUP_FILE"
echo "  Total backups: $(ls -1 "$BACKUP_DIR"/db_backup_*.db 2>/dev/null | wc -l)"
echo "====================="
```

**Make script executable:**

```bash
chmod +x /var/www/restaurant-orders/backup-sqlite.sh
```

### 5.3 Setup Cron Job

Automate backups with cron:

```bash
# Edit crontab
crontab -e

# Add these lines:
# Daily backup at 2:00 AM
0 2 * * * /var/www/restaurant-orders/backup-sqlite.sh >> /var/www/restaurant-orders/logs/backup.log 2>&1

# Weekly database vacuum (optimization) on Sundays at 3:00 AM
0 3 * * 0 sqlite3 /mnt/sqlite-data/database.db "VACUUM;" >> /var/www/restaurant-orders/logs/maintenance.log 2>&1
```

### 5.4 Optional: DigitalOcean Spaces Backup

**Install s3cmd for Spaces integration:**

```bash
apt install s3cmd -y

# Configure s3cmd (run as root)
s3cmd --configure

# Enter:
# - Access Key (from DigitalOcean API)
# - Secret Key (from DigitalOcean API)
# - Default region (e.g., nyc3)
# - S3 endpoint: https://nyc3.digitaloceanspaces.com
# - DNS-style bucket names: yes
# - Use HTTPS: yes
```

**Create Spaces bucket:**

```bash
# Via DigitalOcean control panel:
# Navigate to "Spaces" → "Create Space"
# Name: your-bucket-name
# Region: Choose same as droplet (or nearest)

# Or via doctl:
doctl compute storage create your-bucket-name --region nyc3
```

---

## Phase 6: Production Deployment

### 6.1 Initial Manual Deployment

**Step 1: Clone repository**

```bash
# SSH into server
ssh root@<droplet-ip>

# Clone repository
cd /var/www
git clone <your-repository-url> restaurant-orders
cd restaurant-orders

# Verify repository
git status
```

**Step 2: Install dependencies**

```bash
# Install production dependencies
bun install --production --frozen-lockfile

# Verify installation
bun --version
```

**Step 3: Create environment file**

```bash
# Create .env.production
cat > .env.production << 'EOF'
DATABASE_URL=/mnt/sqlite-data/database.db
NODE_ENV=production
PORT=3000
ORIGIN=https://orders.radbug.dev
EOF

# Set secure permissions
chmod 600 .env.production
```

**Step 4: Build application**

```bash
# Build for production
bun run build

# Verify build output
ls -la build/
```

**Step 5: Seed database (first time only)**

```bash
# Run database migrations
bun run db:push

# Seed initial data
bun run db:seed

# Verify database
ls -la /mnt/sqlite-data/
```

**Step 6: Start with PM2**

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs restaurant-orders

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions output by the command
```

**Step 7: Configure Nginx**

Update `/etc/nginx/sites-available/restaurant-orders` with your actual domain:

```bash
nano /etc/nginx/sites-available/restaurant-orders
```

The configuration already uses `orders.radbug.dev`. No changes needed.

**Step 8: Test and Restart Nginx**

```bash
# Test Nginx configuration
nginx -t

# If test passes, restart Nginx
systemctl restart nginx

# Verify Nginx is running
systemctl status nginx
```

**Step 9: Configure SSL**

```bash
# Obtain SSL certificate
certbot --nginx -d orders.radbug.dev

# Follow the prompts (choose redirect option 2)
```

### 6.2 Deploy via CI/CD

After initial setup, all subsequent deployments happen automatically via GitHub Actions:

```bash
# On your local machine
git add .
git commit -m "Deploy new features"
git push origin main
```

GitHub Actions will automatically:
1. Run linter
2. Run type checker
3. Run unit tests
4. Build application
5. Deploy to server via rsync
6. Restart PM2 process
7. Perform health check

**Monitor deployment:**

```bash
# Check GitHub Actions tab in your repository
# View workflow runs and their status
```

### 6.3 Manual Deployment (fallback)

If CI/CD fails or you need to deploy manually:

```bash
# SSH into server
ssh root@<droplet-ip>

# Navigate to app directory
cd /var/www/restaurant-orders

# Pull latest changes
git pull origin main

# Install dependencies
bun install --production --frozen-lockfile

# Build application
bun run build

# Restart PM2
pm2 restart restaurant-orders

# Check logs
pm2 logs restaurant-orders --lines 50
```

---

## Phase 7: Monitoring and Maintenance

### 7.1 PM2 Monitoring

**Real-time monitoring:**

```bash
# Interactive monitoring dashboard
pm2 monit

# View process list
pm2 list

# View detailed info
pm2 show restaurant-orders

# View logs in real-time
pm2 logs restaurant-orders --lines 100
```

**PM2 commands reference:**

```bash
# Start/Stop/Restart
pm2 start ecosystem.config.js
pm2 stop restaurant-orders
pm2 restart restaurant-orders
pm2 delete restaurant-orders

# Logs
pm2 logs [app-name]
pm2 logs --lines 100
pm2 logs --err  # Error logs only
pm2 flush  # Clear logs

# Process management
pm2 reload restaurant-orders  # Zero-downtime reload
pm2 reset restaurant-orders  # Reset counters
pm2 update  # Update PM2

# System
pm2 startup  # Generate startup script
pm2 save  # Save process list
pm2 resurrect  # Restore process list
```

### 7.2 Nginx Monitoring

**View access logs:**

```bash
# Real-time access log
tail -f /var/log/nginx/access.log

# Filter specific status codes
tail -f /var/log/nginx/access.log | grep " 500 "
tail -f /var/log/nginx/access.log | grep "POST"

# View top IP addresses
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

**View error logs:**

```bash
# Real-time error log
tail -f /var/log/nginx/error.log

# View recent errors
tail -n 50 /var/log/nginx/error.log
```

**Nginx status and reload:**

```bash
# Check Nginx status
systemctl status nginx

# Test configuration
nginx -t

# Reload configuration (graceful)
nginx -s reload

# Restart Nginx
systemctl restart nginx
```

### 7.3 Application Logs

**View application logs:**

```bash
# Tail output log
tail -f /var/www/restaurant-orders/logs/out.log

# Tail error log
tail -f /var/www/restaurant-orders/logs/error.log

# View last 100 lines
tail -n 100 /var/www/restaurant-orders/logs/error.log

# Search logs
grep "ERROR" /var/www/restaurant-orders/logs/error.log
grep "database" /var/www/restaurant-orders/logs/out.log
```

### 7.4 System Resource Monitoring

**System resources:**

```bash
# View system load
uptime

# View memory usage
free -h

# View disk usage
df -h

# View disk usage for volume
df -h /mnt/sqlite-data

# View process list
top
# or
htop  # if installed
```

**Monitor SQLite database:**

```bash
# Database file size
ls -lh /mnt/sqlite-data/database.db

# Database integrity check
sqlite3 /mnt/sqlite-data/database.db "PRAGMA integrity_check;"

# Database vacuum (optimization)
sqlite3 /mnt/sqlite-data/database.db "VACUUM;"

# Analyze database
sqlite3 /mnt/sqlite-data/database.db "ANALYZE;"
```

### 7.5 Health Checks

**Automated health monitoring:**

```bash
# Simple health check
curl http://localhost:3000/health

# Check HTTP status code
curl -I http://localhost:3000/health

# JSON output
curl -s http://localhost:3000/health | jq

# Continuous monitoring (watch mode)
watch -n 5 'curl -s http://localhost:3000/health | jq'
```

**Create monitoring script:**

Create `/var/www/restaurant-orders/monitor.sh`:

```bash
#!/bin/bash

# Health check endpoint
HEALTH_URL="http://localhost:3000/health"
ALERT_EMAIL="your-email@example.com"

# Check health endpoint
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $STATUS -ne 200 ]; then
  # Application is unhealthy
  echo "$(date): Application unhealthy (HTTP $STATUS)" >> /var/www/restaurant-orders/logs/monitor.log

  # Restart PM2
  pm2 restart restaurant-orders

  # Send email alert (configure mail command first)
  # echo "Application restarted due to unhealthy status" | mail -s "Alert: Restaurant Orders" $ALERT_EMAIL
else
  echo "$(date): Application healthy" >> /var/www/restaurant-orders/logs/monitor.log
fi
```

**Add to crontab for periodic checks:**

```bash
# Check every 5 minutes
*/5 * * * * /var/www/restaurant-orders/monitor.sh
```

### 7.6 Log Rotation

Prevent logs from consuming disk space:

**Create logrotate config:**

Create `/etc/logrotate.d/restaurant-orders`:

```
/var/www/restaurant-orders/logs/*.log {
  daily
  missingok
  rotate 14
  compress
  delaycompress
  notifempty
  create 0644 www-data www-data
  sharedscripts
  postrotate
    pm2 reload restaurant-orders
  endscript
}
```

**Test logrotate:**

```bash
# Test configuration
logrotate -d /etc/logrotate.d/restaurant-orders

# Force rotation
logrotate -f /etc/logrotate.d/restaurant-orders
```

---

## Cost Summary

### Monthly Breakdown

| Resource | Specification | Monthly Cost | Notes |
|-----------|---------------|--------------|-------|
| **Droplet** | 1 vCPU, 1GB RAM, 25GB SSD | $4.00 | Basic plan, sufficient for startup |
| **Volume** | 10GB persistent storage | $1.00 | For SQLite database |
| **Backups** | Daily automated backups | ~$0.40 | 4-6 hour retention |
| **Bandwidth** | First 1TB/month included | $0.00 | Restaurant orders won't exceed this |
| **Total** | | **~$5.40/month** | |

### Additional Optional Costs

| Service | Usage | Cost |
|----------|---------|------|
| Domain Name | `radbug.dev` already owned | $0 |
| DNS Configuration | A-record for `orders.radbug.dev` | Free (included with domain) |
| DigitalOcean Spaces | For off-site backups | $0.005/GB/month |
| Email Service | Transactional emails | Free tier usually sufficient |
| Monitoring Services | Advanced monitoring | Optional |

### Scalability Options

As traffic grows, you can scale up:

| Plan | vCPU | RAM | SSD | Cost |
|------|-------|-----|-----|------|
| Basic | 1 | 1GB | 25GB | $4 |
| Basic | 1 | 2GB | 50GB | $6 |
| Basic | 2 | 2GB | 60GB | $12 |
| General Purpose | 2 | 4GB | 80GB | $24 |
| General Purpose | 4 | 8GB | 160GB | $48 |

---

## Security Checklist

### Infrastructure Security

- [ ] **SSH Configuration**
  - [ ] SSH key-based authentication enabled
  - [ ] Password authentication disabled (`PasswordAuthentication no` in `/etc/ssh/sshd_config`)
  - [ ] Root login disabled (use sudo with regular user)
  - [ ] Non-standard SSH port (optional, but requires firewall update)

- [ ] **Firewall (UFW)**
  - [ ] Only necessary ports open (80, 443, SSH)
  - [ ] UFW enabled and active
  - [ ] Regular audit of open ports

- [ ] **Fail2Ban**
  - [ ] Fail2Ban installed and configured
  - [ ] Ban threshold set appropriately
  - [ ] Monitoring ban attempts

### Application Security

- [ ] **Environment Variables**
  - [ ] `.env` files in `.gitignore`
  - [ ] No secrets committed to repository
  - [ ] GitHub secrets properly configured
  - [ ] `.env.production` has secure permissions (600)

- [ ] **SSL/TLS**
  - [ ] SSL certificate installed
  - [ ] HTTP to HTTPS redirect enabled
  - [ ] Auto-renewal configured and tested
  - [ ] Strong cipher suites configured

- [ ] **Nginx Security**
  - [ ] Security headers configured
  - [ ] Rate limiting enabled (optional)
  - [ ] DDoS protection considered
  - [ ] Regular configuration review

- [ ] **Application**
  - [ ] Input validation on all forms
  - [ ] SQL injection protection (Drizzle ORM provides this)
  - [ ] XSS protection (Svelte provides built-in protection)
  - [ ] CSRF protection (SvelteKit built-in)
  - [ ] Session cookies are HTTP-only and secure

### Data Security

- [ ] **Database**
  - [ ] Database file on persistent volume
  - [ ] Proper file permissions (644 for DB, 755 for directory)
  - [ ] Regular backups configured
  - [ ] Backup restoration tested

- [ ] **Backups**
  - [ ] Automated daily backups enabled
  - [ ] Retention policy defined
  - [ ] Off-site backup (Spaces) configured
  - [ ] Backup encryption (optional but recommended)

### Monitoring and Logging

- [ ] **Monitoring**
  - [ ] PM2 monitoring configured
  - [ ] Health checks in place
  - [ ] Alert system configured
  - [ ] Resource usage monitoring

- [ ] **Logging**
  - [ ] Application logs configured
  - [ ] Nginx access/error logs enabled
  - [ ] Log rotation configured
  - [ ] Sensitive data not in logs

### Maintenance

- [ ] **Updates**
  - [ ] System updates scheduled (weekly/monthly)
  - [ ] Dependency updates monitored
  - [ ] Security patches applied promptly
  - [ ] Update testing in staging environment

- [ ] **Disaster Recovery**
  - [ ] Disaster recovery plan documented
  - [ ] Backup restoration procedures tested
  - [ ] Rollback procedures documented
  - [ ] Contact information for emergencies

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Application won't start

**Symptoms:** PM2 shows app as "errored" or "stopped"

**Solutions:**

```bash
# Check PM2 logs
pm2 logs restaurant-orders --lines 100

# Check if port is already in use
lsof -i :3000

# Check database permissions
ls -la /mnt/sqlite-data/database.db
# Should be rw-r--r-- (644)

# Try manual start to see errors
cd /var/www/restaurant-orders
bun build/index.js
```

#### Database connection errors

**Symptoms:** "DATABASE_URL is not set" or connection refused

**Solutions:**

```bash
# Check environment variables
pm2 env restaurant-orders

# Check if database file exists
ls -la /mnt/sqlite-data/database.db

# Check volume mount
mount | grep sqlite-data

# Check database permissions
chmod 644 /mnt/sqlite-data/database.db

# Remount volume if necessary
umount /mnt/sqlite-data
mount /dev/disk/by-id/scsi-0DO_Volume_sqlite-data /mnt/sqlite-data
```

#### Nginx 502 Bad Gateway

**Symptoms:** Browser shows 502 error

**Solutions:**

```bash
# Check if application is running
pm2 status

# Check if application is listening on correct port
netstat -tlnp | grep :3000

# Check Nginx error logs
tail -n 50 /var/log/nginx/error.log

# Test application directly
curl http://localhost:3000

# Restart Nginx
systemctl restart nginx
```

#### SSL certificate errors

**Symptoms:** Browser shows "Not secure" or certificate errors

**Solutions:**

```bash
# Check certificate status
certbot certificates

# Test renewal
certbot renew --dry-run

# Manually renew
certbot renew

# Check Nginx SSL configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### Out of disk space

**Symptoms:** Application crashes, database writes fail

**Solutions:**

```bash
# Check disk usage
df -h

# Clean up logs older than 30 days
find /var/www/restaurant-orders/logs -name "*.log" -mtime +30 -delete

# Check database size
ls -lh /mnt/sqlite-data/database.db

# Vacuum database
sqlite3 /mnt/sqlite-data/database.db "VACUUM;"

# Clean old backups
find /mnt/sqlite-data/backups -name "*.db" -mtime +30 -delete
```

#### Deployment failures

**Symptoms:** GitHub Actions workflow fails

**Solutions:**

```bash
# Check workflow logs in GitHub Actions tab
# Common issues:
# - SSH key authentication failure: verify secrets
# - Build failures: run `npm run build` locally
# - Test failures: run `npm run test:unit` locally

# Manual deployment as fallback
ssh root@<droplet-ip>
cd /var/www/restaurant-orders
git pull origin main
bun install --production
bun run build
pm2 restart restaurant-orders
```

---

## Additional Resources

### Documentation

- [SvelteKit Deployment Docs](https://kit.svelte.dev/docs/adapters)
- [Bun Runtime Documentation](https://bun.sh/docs)
- [DigitalOcean Droplet Docs](https://docs.digitalocean.com/products/droplets/)
- [DigitalOcean Volumes Docs](https://docs.digitalocean.com/products/volumes/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Tools

- [DigitalOcean Control Panel](https://cloud.digitalocean.com/)
- [doctl CLI](https://docs.digitalocean.com/reference/doctl/)
- [Certbot](https://certbot.eff.org/)
- [DigitalOcean Spaces](https://docs.digitalocean.com/products/spaces/)

### Community and Support

- [SvelteKit Discord](https://discord.gg/svelte)
- [DigitalOcean Community](https://www.digitalocean.com/community/)
- [GitHub Issues](https://github.com/sveltejs/kit/issues)

---

## DNS Configuration Required

Before deploying, configure DNS for your domain:

1. **Access your DNS registrar** (where you purchased `radbug.dev`)
2. **Add an A-record:**
   - Type: A
   - Name/Host: `orders`
   - Value/Points to: `<your-droplet-ip-address>`
   - TTL: 3600 (or default)

3. **Wait for DNS propagation** (usually 5-30 minutes)

4. **Verify DNS resolution:**
   ```bash
   dig orders.radbug.dev
   # OR
   nslookup orders.radbug.dev
   ```

After DNS is configured, proceed with the deployment steps below.

---

## Next Steps

This deployment plan provides a complete roadmap for deploying your Restaurant Ordering System to DigitalOcean with CI/CD automation using the domain `orders.radbug.dev`.

**To proceed with implementation:**

1. Create DigitalOcean resources (droplet, volume)
2. Perform initial server setup (Phase 1)
3. Update project configuration (Phase 2)
4. Set up GitHub Actions workflow (Phase 3)
5. Configure SSL certificates (Phase 4)
6. Implement backup strategy (Phase 5)
7. Perform initial deployment (Phase 6)
8. Set up monitoring (Phase 7)

**Optional enhancements:**
- Set up staging environment for testing
- Implement automated E2E testing in CI/CD
- Add monitoring dashboard (Grafana/Prometheus)
- Implement CDN for static assets
- Add load balancing for high availability
- Set up multi-region deployment

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Maintained By:** Restaurant Ordering System Development Team
