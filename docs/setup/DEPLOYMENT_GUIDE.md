# Production Deployment Guide - Vercel + Turso

Complete deployment strategy for the Restaurant Ordering System on **Vercel** with **Turso** database.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Why This Stack?](#why-this-stack)
- [Phase 1: Turso Database Setup](#phase-1-turso-database-setup)
- [Phase 2: Project Configuration](#phase-2-project-configuration)
- [Phase 3: Environment Setup](#phase-3-environment-setup)
- [Phase 4: Database Setup](#phase-4-database-setup)
- [Phase 5: Vercel Deployment](#phase-5-vercel-deployment)
- [Phase 6: CI/CD Pipeline](#phase-6-cicd-pipeline)
- [Phase 7: Monitoring & Maintenance](#phase-7-monitoring--maintenance)
- [Cost Summary](#cost-summary)
- [Security Checklist](#security-checklist)

---

## Project Overview

### Tech Stack

| Component | Technology | Version |
|-----------|-------------|---------|
| **Frontend/Backend** | SvelteKit | 2.49 |
| **Frontend Framework** | Svelte | 5.45 |
| **Runtime** | Node.js | 18+ |
| **Database (Dev)** | SQLite | Local file |
| **Database (Prod)** | Turso | Edge SQLite |
| **ORM** | Drizzle ORM | 0.45 |
| **Styling** | Tailwind CSS | v4 |
| **Adapter** | @sveltejs/adapter-auto | 7.0 |
| **Testing** | Vitest + Playwright | Latest |

### Deployment Platforms

| Environment | Platform | Database |
|-------------|-----------|----------|
| **Development** | Localhost | `file:local.db` |
| **Production** | Vercel (Edge) | Turso (Edge) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD - GitHub Actions               │
│  Push to main → Build & Test → Deploy to Vercel         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Vercel Infrastructure                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │           Vercel Edge Network                   │   │
│  │                                                    │   │
│  │  ┌──────────────────────────────────────────┐    │   │
│  │  │    SvelteKit Application               │    │   │
│  │  │    (Serverless Functions)              │    │   │
│  │  └──────────────────────────────────────────┘    │   │
│  │                    │                             │   │
│  │                    ▼                             │   │
│  │  ┌──────────────────────────────────────────┐    │   │
│  │  │    Turso Edge Database                 │    │   │
│  │  │    (Global Replicas)                   │    │   │
│  │  └──────────────────────────────────────────┘    │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                          │
│  ✅ Automatic HTTPS                                       │
│  ✅ Edge Caching                                          │
│  ✅ Automatic Scaling                                      │
│  ✅ Preview Deployments                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Turso Dashboard                         │
│  • Database Metrics                                        │
│  • Query Performance                                      │
│  • Backups (Automatic)                                    │
│  • Edge Locations                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Why This Stack?

### Vercel

| Feature | Benefit |
|---------|---------|
| **Edge Deployment** | Global CDN, low latency worldwide |
| **Automatic HTTPS** | SSL certificates handled automatically |
| **Zero Configuration** | Native SvelteKit support, no build settings needed |
| **Preview Deployments** | Automatic preview URLs for every PR |
| **Rollbacks** | One-click rollback to previous deployments |
| **Analytics** | Built-in usage analytics and performance monitoring |
| **Auto-Scaling** | Scales automatically with traffic |

### Turso

| Feature | Benefit |
|---------|---------|
| **Edge SQLite** | Same database engine as development, but deployed globally |
| **Automatic Scaling** | No manual scaling, grows with demand |
| **Edge Caching** | Read queries cached at edge locations |
| **No Infrastructure** | Zero server management required |
| **Built-in Backups** | Point-in-time recovery included |
| **Simple Pricing** | Generous free tier, predictable paid plans |
| **Developer Experience** | Same API as local SQLite |

### Perfect For

✅ **SvelteKit Applications** - Native support and optimization
✅ **Edge Computing** - Serverless functions + edge database
✅ **Real-time Apps** - Low latency globally
✅ **Startups** - Free tiers to get started, easy scaling
✅ **Teams** - Preview deployments for collaboration

---

## Phase 1: Turso Database Setup

### 1.1 Install Turso CLI

```bash
# Using Homebrew (macOS/Linux)
brew install tursodatabase/tap/turso

# Using npm
npm install -g turso

# Verify installation
turso --version
```

### 1.2 Create Turso Account

```bash
# Login to Turso
turso auth login

# Follow the browser-based authentication
```

### 1.3 Create a Turso Database

```bash
# Create a new database
turso db create restaurant-orders

# Note the database URL from the output
# Example: libsql://your-db-name-username.turso.io

# List your databases
turso db list
```

### 1.4 Create an Auth Token

```bash
# Create an authentication token for your database
turso db tokens create restaurant-orders

# Copy the token - you'll need this for production
# Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Note:** Treat the auth token like a password. Never commit it to git.

### 1.5 (Optional) Enable Edge Locations

```bash
# Enable edge locations for your database
turso db config set restaurant-orders --enable-edge

# View database configuration
turso db show restaurant-orders
```

### 1.6 Verify Turso Connection

```bash
# Test connection to your Turso database
turso db shell restaurant-orders

# In the shell, run:
.tables
# Should show no tables initially (we'll create them with Drizzle)

.quit
```

---

## Phase 2: Project Configuration

### 2.1 Verify Dependencies

**Required packages (already installed):**

```json
{
  "dependencies": {
    "@libsql/client": "^0.15.15",
    "drizzle-orm": "^0.45.1"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.8"
  }
}
```

### 2.2 Database Connection (Already Configured)

**File:** `src/lib/server/db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// @ts-expect-error - SvelteKit $env types are generated at build time
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Support both local SQLite and remote Turso databases
// For local dev: DATABASE_URL=file:local.db
// For Turso: DATABASE_URL=libsql://your-db.turso.io, TURSO_AUTH_TOKEN=your-token
const client = createClient({
	url: env.DATABASE_URL,
	authToken: env.TURSO_AUTH_TOKEN
});

export const db = drizzle(client, { schema });
```

**How it works:**
- Development: Uses `file:local.db` (no auth token needed)
- Production: Uses Turso URL with auth token
- Automatic detection based on environment variables

### 2.3 Drizzle Configuration (Already Configured)

**File:** `drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Support both local SQLite and remote Turso databases
const dbCredentials = process.env.TURSO_AUTH_TOKEN
	? {
			url: process.env.DATABASE_URL,
			authToken: process.env.TURSO_AUTH_TOKEN
		}
	: { url: process.env.DATABASE_URL };

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials,
	verbose: true,
	strict: true
});
```

**How it works:**
- Conditionally includes Turso auth token when present
- Works seamlessly with both local and production databases
- Drizzle CLI commands work in both environments

### 2.4 Environment Variables Template (Already Configured)

**File:** `.env.example`

```bash
# Database Configuration
# For local development: use file-based SQLite
DATABASE_URL=file:local.db

# For production (Turso): use remote Turso database
# DATABASE_URL=libsql://your-database-name.turso.io
# TURSO_AUTH_TOKEN=your-turso-auth-token

# Playwright Remote Server Configuration
# Set to run tests on remote Playwright Server instead of local browsers
# Format: ws://<host>:<port>/ (e.g., ws://localhost:3000/)
# Leave empty to use local browsers
PW_TEST_CONNECT_WS_ENDPOINT=
```

---

## Phase 3: Environment Setup

### 3.1 Local Development Environment

```bash
# Copy example env file
cp .env.example .env

# For local development, use the default:
# DATABASE_URL=file:local.db
# (No TURSO_AUTH_TOKEN needed for local)
```

**Verify local setup:**

```bash
# Run database migrations
npm run db:push

# Seed sample data (first time only)
npm run db:seed

# Start development server
npm run dev
```

### 3.2 Production Environment Variables

#### Option A: Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Set environment variables
vercel env add DATABASE_URL production
# Enter your Turso URL: libsql://your-db.turso.io

vercel env add TURSO_AUTH_TOKEN production
# Enter your Turso auth token

# 4. Verify environment variables
vercel env ls
```

#### Option B: Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add variables:
   - `DATABASE_URL`: `libsql://your-db.turso.io`
   - `TURSO_AUTH_TOKEN`: `your-turso-auth-token`
5. Select environment: **Production** (and optionally **Preview**)
6. Click **Save**

### 3.3 Preview Environment Variables (Optional)

To test your production database in preview deployments:

```bash
# Add variables for preview environment
vercel env add DATABASE_URL preview
vercel env add TURSO_AUTH_TOKEN preview
```

**Best Practice:** Create a separate Turso database for preview environments to avoid polluting production data.

---

## Phase 4: Database Setup

### 4.1 Set Up Production Database

```bash
# Set environment variables temporarily for production commands
export DATABASE_URL="libsql://your-db.turso.io"
export TURSO_AUTH_TOKEN="your-turso-auth-token"

# Verify connection
turso db shell restaurant-orders --command "SELECT 1 as test;"

# Run database migrations
npm run db:push

# Verify tables are created
turso db shell restaurant-orders --command ".tables"
```

Expected output:
```
user          session       category      menuItem
client        order         orderItem
```

### 4.2 Seed Initial Data (Optional)

```bash
# Seed initial data (users, menu items, etc.)
npm run db:seed

# Verify data
turso db shell restaurant-orders

sqlite> SELECT COUNT(*) FROM user;
sqlite> SELECT * FROM user;
sqlite> SELECT * FROM category;
sqlite> SELECT * FROM menuItem;
.quit
```

### 4.3 Migrate from Local to Turso (Optional)

If you have existing local data and want to migrate:

```bash
# Export local database to SQL
sqlite3 local.db .dump > local_dump.sql

# Import dump into Turso
turso db shell restaurant-orders < local_dump.sql

# Verify migration
turso db shell restaurant-orders --command "SELECT COUNT(*) FROM user;"
```

### 4.4 Verify Database Schema

```bash
# Connect to Turso database
turso db shell restaurant-orders

# Check table schemas
.schema user
.schema category
.schema menuItem
.schema client
.schema order
.schema orderItem

# Verify relationships
sqlite> PRAGMA foreign_keys;

.quit
```

---

## Phase 5: Vercel Deployment

### 5.1 Install Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Verify installation
vercel --version
```

### 5.2 Deploy to Vercel

#### Step 1: Login to Vercel

```bash
vercel login
```

Follow the browser-based authentication flow.

#### Step 2: Initialize Project

```bash
# Run Vercel in project root
vercel

# Follow the prompts:
# ? Set up and deploy "~/Work/orders"? [Y/n] Y
# ? Which scope do you want to deploy to? Your Account
# ? Link to existing project? [y/N] N
# ? What's your project's name? restaurant-orders
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N
# ? Want to modify these settings? [y/N] N
```

Vercel will detect:
- **Framework Preset**: SvelteKit
- **Build Command**: `npm run build`
- **Output Directory**: `.vercel/output`

#### Step 3: Set Environment Variables

```bash
# Add production environment variables
vercel env add DATABASE_URL production
# Enter: libsql://your-db.turso.io

vercel env add TURSO_AUTH_TOKEN production
# Enter: your-turso-auth-token

# Verify variables
vercel env ls
```

#### Step 4: Deploy to Production

```bash
# Deploy to production
vercel --prod

# Vercel will:
# 1. Build the application
# 2. Run tests (if configured)
# 3. Deploy to Vercel Edge Network
# 4. Provide production URL
```

Expected output:
```
> npm run build
> vite build

✅ Production: https://restaurant-orders.vercel.app [2s]
```

#### Step 5: Verify Deployment

```bash
# Test the production URL
curl https://restaurant-orders.vercel.app

# Or open in browser
open https://restaurant-orders.vercel.app
```

### 5.3 Custom Domain Configuration (Optional)

#### Step 1: Add Custom Domain

```bash
# Add custom domain
vercel domains add orders.radbug.dev
```

#### Step 2: Configure DNS

Go to your DNS registrar (where you purchased `radbug.dev`) and add an **A-record**:

| Type | Name/Host | Value/Points to | TTL |
|------|------------|-----------------|-----|
| A | orders | `76.76.21.21` | 3600 |

**Note:** `76.76.21.21` is Vercel's Anycast IP address.

#### Step 3: Verify DNS

```bash
# Wait for DNS propagation (usually 5-30 minutes)
# Then verify:
dig orders.radbug.dev

# OR
nslookup orders.radbug.dev
```

#### Step 4: SSL Certificate

Vercel automatically provisions SSL certificates for your custom domain. No manual configuration needed.

---

## Phase 6: CI/CD Pipeline

### 6.1 GitHub Actions Integration

Vercel provides automatic deployments on push to your Git repository. No additional GitHub Actions configuration is needed.

**Automatic Deployments:**

| Branch | Deployment Type | URL |
|---------|---------------|-----|
| `main` | Production | `https://restaurant-orders.vercel.app` |
| Any branch | Preview | `https://restaurant-orders-<branch>.vercel.app` |

### 6.2 (Optional) Custom GitHub Actions

If you want to add custom CI checks before Vercel deployment:

**File:** `.github/workflows/ci.yaml`

```yaml
name: CI

on:
  push:
    branches: [main, '**']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run linter
        run: bun run lint

      - name: Type check
        run: bun run check

      - name: Run unit tests
        run: bun run test:unit
```

### 6.3 Deployment Workflow

**How deployments work with Vercel:**

1. **Push to `main` branch**
   ```bash
   git add .
   git commit -m "Add new features"
   git push origin main
   ```
   → Vercel automatically builds and deploys to production

2. **Create Pull Request**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   ```
   → Vercel creates a preview URL for testing

3. **Merge Pull Request**
   → Vercel automatically deploys to production

### 6.4 Monitoring Deployments

**Vercel Dashboard:**

1. Go to [https://vercel.com](https://vercel.com)
2. Select your project
3. Navigate to **Deployments**
4. View:
   - Deployment history
   - Build logs
   - Deployment duration
   - Error logs

---

## Phase 7: Monitoring & Maintenance

### 7.1 Vercel Analytics

**Access Analytics:**

1. Go to [https://vercel.com](https://vercel.com)
2. Select your project
3. Navigate to **Analytics**
4. View:
   - Page views
   - Unique visitors
   - Web Vitals (LCP, FID, CLS)
   - Geographic distribution

### 7.2 Turso Dashboard

**Access Dashboard:**

1. Go to [https://dashboard.turso.io](https://dashboard.turso.io)
2. Select your database: `restaurant-orders`
3. View:
   - **Overview**: Database status and replicas
   - **Metrics**: Query count, rows read/written
   - **Insights**: Query performance, slow queries
   - **Backups**: Point-in-time recovery

### 7.3 Monitoring Commands

**Vercel CLI:**

```bash
# View deployment logs
vercel logs restaurant-orders --prod

# View recent deployments
vercel ls restaurant-orders

# Inspect deployment
vercel inspect restaurant-orders
```

**Turso CLI:**

```bash
# View database metrics
turso db metrics restaurant-orders

# View database information
turso db show restaurant-orders

# View recent queries
turso db logs restaurant-orders
```

### 7.4 Database Performance

**Optimize Queries:**

1. **Use Indexes** (already defined in `schema.ts`)
2. **Cache Frequently Accessed Data**
3. **Monitor Slow Queries** in Turso dashboard

**Example: Add caching to load functions**

```typescript
// src/routes/orders/+page.server.ts
import { db } from '$lib/server/db';
import { order, user } from '$lib/server/db/schema';

export async function load() {
  // Turso automatically caches this at edge locations
  const orders = await db
    .select()
    .from(order)
    .leftJoin(user, eq(order.employeeId, user.id))
    .orderBy(desc(order.createdAt));

  return { orders };
}
```

### 7.5 Automatic Backups

**Turso provides automatic backups:**

- **Point-in-Time Recovery**: Restore to any point in time
- **Automatic Backups**: No configuration needed
- **Export Capability**: Manual database exports

**Export Database:**

```bash
# Export database to SQL file
turso db shell restaurant-orders --command ".dump" > backup.sql

# Restore from backup (create new database)
turso db create restaurant-orders-backup
turso db shell restaurant-orders-backup < backup.sql
```

### 7.6 Health Checks

**Vercel provides built-in health checks.**

**Custom health endpoint:**

**File:** `src/routes/api/health/+server.ts` (Create if not exists)

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

**Test health endpoint:**

```bash
# Test production
curl https://restaurant-orders.vercel.app/api/health

# Test local
curl http://localhost:5173/api/health
```

---

## Cost Summary

**💡 Want to guarantee $0 cost?** See [**ZERO_COST_GUARANTEE.md**](ZERO_COST_GUARANTEE.md) for detailed analysis and monitoring strategies.

**Quick Summary:** Free tiers support up to 270,000 orders/month. Typical restaurants process 20-200 orders/day. **You will likely never pay anything.**

### Turso Pricing (January 2026)

| Plan | Rows Read | Rows Written | Storage | Cost |
|------|-----------|---------------|----------|------|
| **Free** | 10M reads/month | 2M writes/month | 8GB | $0 |
| **Scalable** | $0.20 per 1M reads | $0.10 per 1M writes | $0.20 per GB | Pay-as-you-go |

### Vercel Pricing (January 2026)

| Plan | Bandwidth | Build Minutes | Functions | Cost |
|------|-----------|---------------|-----------|------|
| **Hobby** | 100GB/month | 6,000 minutes | 100GB-hrs | $0 |
| **Pro** | 1TB/month | Unlimited | 1,000GB-hrs | $20/month |

### Estimated Monthly Costs for Restaurant Ordering System

**Low Traffic (< 100 orders/day):**
- Turso: Free tier covers
- Vercel: Hobby tier covers
- **Total: $0/month**

**Medium Traffic (100-1,000 orders/day):**
- Turso: Free tier covers
- Vercel: Hobby tier covers
- **Total: $0/month**

**High Traffic (> 1,000 orders/day):**
- Turso: $0 - $2 (if exceeding free reads)
- Vercel: $0 - $20 (if exceeding hobby limits)
- **Total: $0 - $22/month**

### Additional Costs

| Item | Cost | Notes |
|------|-------|-------|
| **Custom Domain** | $0 | Already owned (`radbug.dev`) |
| **DNS Configuration** | $0 | Included with domain registrar |
| **SSL Certificates** | $0 | Included with Vercel |
| **Email Service** | $0 - $10/month | Optional (for notifications) |
| **Monitoring Services** | $0 - $50/month | Optional (for advanced analytics) |

### Scalability

**As traffic grows, upgrade automatically:**

| Traffic Level | Turso | Vercel |
|--------------|--------|---------|
| < 1,000 orders/day | Free tier | Hobby (Free) |
| 1,000 - 10,000 orders/day | Free tier | Pro ($20/mo) |
| > 10,000 orders/day | Pay-as-you-go | Pro ($20/mo) |

---

## Security Checklist

### Infrastructure Security

- [ ] **Environment Variables**
  - [ ] `.env` files in `.gitignore`
  - [ ] No secrets committed to repository
  - [ ] Vercel environment variables configured
  - [ ] Turso auth token stored securely

- [ ] **Database Security**
  - [ ] Turso auth token rotated regularly
  - [ ] Database access restricted to production
  - [ ] Preview environment uses separate database (recommended)

### Application Security

- [ ] **Authentication**
  - [ ] Session cookies are HTTP-only and secure
  - [ ] CSRF protection enabled (SvelteKit built-in)
  - [ ] Password hashing implemented (Oslo.js crypto)

- [ ] **Input Validation**
  - [ ] All forms validated client-side
  - [ ] Server-side validation on all actions
  - [ ] SQL injection protection (Drizzle ORM)

- [ ] **HTTPS**
  - [ ] Automatic HTTPS enabled (Vercel)
  - [ ] HTTP to HTTPS redirect enabled
  - [ ] Strict Transport Security header

- [ ] **Dependencies**
  - [ ] Dependencies regularly updated
  - [ ] Security vulnerabilities monitored
  - [ ] `npm audit` run periodically

### Data Security

- [ ] **Backups**
  - [ ] Turso automatic backups enabled
  - [ ] Point-in-time recovery configured
  - [ ] Export scripts tested

- [ ] **Data Privacy**
  - [ ] Sensitive data not logged
  - [ ] Customer phone numbers handled securely
  - [ ] Passwords never stored in plain text

---

## Troubleshooting

### Deployment Issues

#### Problem: Build fails on Vercel

**Symptoms:** Vercel deployment shows build error

**Solutions:**

```bash
# Test build locally
npm run build

# Check build logs in Vercel Dashboard
# Project → Deployments → Select failed deployment → View logs

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Build dependencies not installed
```

#### Problem: Database connection error

**Symptoms:** "DATABASE_URL is not set" or "Authentication failed"

**Solutions:**

```bash
# Verify environment variables
vercel env ls

# Test database connection locally
export DATABASE_URL="libsql://your-db.turso.io"
export TURSO_AUTH_TOKEN="your-token"
turso db shell restaurant-orders --command "SELECT 1;"

# Update variables if incorrect
vercel env add DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production

# Redeploy
vercel --prod
```

### Performance Issues

#### Problem: Slow page loads

**Symptoms:** Pages take > 3 seconds to load

**Solutions:**

```bash
# Check Vercel Analytics for Web Vitals
# https://vercel.com → Your Project → Analytics

# Check Turso Query Performance
# https://dashboard.turso.io → Your Database → Insights

# Optimize images (use WebP format)
# Implement caching strategies
# Add database indexes
```

#### Problem: High database read count

**Symptoms:** Approaching Turso free tier limit

**Solutions:**

```bash
# Check usage in Turso Dashboard
turso db metrics restaurant-orders

# Implement caching in load functions
import { cache } from '$lib/utils/cache';

export async function load({ depends }) {
  depends('app:menu-items');
  return cache('menu-items', () => db.select().from(menuItem));
}

# Reduce unnecessary database queries
# Use edge caching where possible
```

### Runtime Issues

#### Problem: Application crashes on production

**Symptoms:** Vercel shows 500 errors

**Solutions:**

```bash
# View real-time logs
vercel logs restaurant-orders --prod --follow

# Check recent deployments
vercel ls restaurant-orders

# Rollback to previous deployment
vercel rollback <deployment-url>

# View error details in Vercel Dashboard
# Project → Deployments → Select deployment → Function Logs
```

#### Problem: Preview deployments failing

**Symptoms:** Preview URLs return errors

**Solutions:**

```bash
# Create separate database for preview environment
turso db create restaurant-orders-preview

# Set preview environment variables
vercel env add DATABASE_URL preview
# Enter: libsql://your-preview-db.turso.io

vercel env add TURSO_AUTH_TOKEN preview
# Enter: your-preview-auth-token

# Test preview deployment
git checkout -b test-preview
git push origin test-preview
# Visit preview URL in Vercel Dashboard
```

### DNS Issues

#### Problem: Custom domain not accessible

**Symptoms:** `orders.radbug.dev` returns NXDOMAIN or DNS error

**Solutions:**

```bash
# Check DNS propagation
dig orders.radbug.dev

# Wait for propagation (5-30 minutes)

# Verify DNS configuration
# - Type: A
# - Name: orders
# - Value: 76.76.21.21 (Vercel Anycast IP)

# Check Vercel Domain Status
# https://vercel.com → Your Project → Settings → Domains
```

---

## Additional Resources

### Documentation

- [SvelteKit Deployment Docs](https://kit.svelte.dev/docs/adapters)
- [Vercel Documentation](https://vercel.com/docs)
- [Turso Documentation](https://docs.turso.tech/)
- [libSQL Documentation](https://turso.tech/libsql)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

### Tools

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Turso Dashboard](https://dashboard.turso.io)
- [Turso CLI](https://docs.turso.tech/cli)
- [Drizzle Studio](https://orm.drizzle.team/docs/drizzle-studio)

### Community

- [Vercel Discord](https://vercel.com/discord)
- [Turso Discord](https://discord.gg/4BpTJHCsGm)
- [SvelteKit Discord](https://discord.gg/svelte)
- [GitHub Issues](https://github.com/tursodatabase/libsql/issues)

---

## Quick Start Checklist

### Pre-Deployment

- [ ] Turso account created
- [ ] Turso database created (`restaurant-orders`)
- [ ] Turso auth token generated
- [ ] Local environment tested (`npm run db:push && npm run dev`)
- [ ] Vercel CLI installed
- [ ] Vercel project initialized
- [ ] Environment variables configured

### Deployment

- [ ] Production database migrations run
- [ ] Initial data seeded (optional)
- [ ] Deployed to Vercel (`vercel --prod`)
- [ ] Production URL tested
- [ ] Custom domain configured (optional)
- [ ] DNS configured (if using custom domain)

### Post-Deployment

- [ ] Health check endpoint tested
- [ ] Vercel Analytics reviewed
- [ ] Turso Dashboard reviewed
- [ ] Test login with production users
- [ ] Test order creation workflow
- [ ] Monitor for errors (24 hours)

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Maintained By:** Restaurant Ordering System Development Team
