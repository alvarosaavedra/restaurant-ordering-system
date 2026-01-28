# Zero Cost Guarantee - Deployment Limits

Guide to ensure your Vercel + Turso deployment stays completely **FREE**.

## Table of Contents

- [Free Tier Limits](#free-tier-limits)
- [Restaurant Traffic Analysis](#restaurant-traffic-analysis)
- [Zero Cost Strategy](#zero-cost-strategy)
- [Monitoring & Alerts](#monitoring--alerts)
- [Cost Reduction Techniques](#cost-reduction-techniques)
- [What If We Exceed Free Tier?](#what-if-we-exceed-free-tier)

---

## Free Tier Limits

### Vercel Hobby (Free)

| Resource | Monthly Limit | What It Means |
|-----------|---------------|----------------|
| **Bandwidth** | 100 GB | Total data transferred to users |
| **Build Minutes** | 6,000 | Time spent building your app |
| **Serverless Functions** | 100 GB-hours | Function execution time |
| **Requests** | Unlimited | No limit on HTTP requests |
| **SSL Certificates** | Unlimited | Free HTTPS |
| **Preview Deployments** | Unlimited | Unlimited preview URLs |

### Turso Free Tier

| Resource | Monthly Limit | What It Means |
|-----------|---------------|----------------|
| **Read Operations** | 10,000,000 (10M) | Number of database reads |
| **Write Operations** | 2,000,000 (2M) | Number of database writes |
| **Storage** | 8 GB | Database file size |
| **Edge Locations** | Unlimited | Global database replicas |
| **Backups** | Automatic | Point-in-time recovery |
| **Connections** | Unlimited | No connection limit |

---

## Restaurant Traffic Analysis

### Typical Restaurant Order Operations

**Per Order:**

| Operation | Database Actions | Count |
|-----------|-----------------|--------|
| Create Order | Write | 1 (order) + 1-5 (items) = 2-6 writes |
| View Menu | Read | 1-2 reads |
| Kitchen View Updates | Write | 1 write per status change |
| Delivery View Updates | Write | 1 write per status change |
| View Order History | Read | 1-10 reads |
| Client Lookup | Read | 1 read |

**Average per order:** 3-8 writes, 5-15 reads

### Daily Traffic Scenarios

#### Scenario 1: Low Traffic Restaurant (20 orders/day)

**Daily:**
- Orders: 20
- Database Writes: 20 × 5 = 100
- Database Reads: 20 × 10 = 200
- Bandwidth: 20 visits × 200KB = 4MB

**Monthly (30 days):**
- Orders: 600
- Database Writes: 3,000 (0.15% of 2M limit)
- Database Reads: 6,000 (0.06% of 10M limit)
- Bandwidth: 120MB (0.12% of 100GB limit)
- **Total Cost: $0** ✅

#### Scenario 2: Medium Traffic Restaurant (100 orders/day)

**Daily:**
- Orders: 100
- Database Writes: 100 × 5 = 500
- Database Reads: 100 × 10 = 1,000
- Bandwidth: 100 visits × 200KB = 20MB

**Monthly (30 days):**
- Orders: 3,000
- Database Writes: 15,000 (0.75% of 2M limit)
- Database Reads: 30,000 (0.3% of 10M limit)
- Bandwidth: 600MB (0.6% of 100GB limit)
- **Total Cost: $0** ✅

#### Scenario 3: High Traffic Restaurant (500 orders/day)

**Daily:**
- Orders: 500
- Database Writes: 500 × 5 = 2,500
- Database Reads: 500 × 10 = 5,000
- Bandwidth: 500 visits × 200KB = 100MB

**Monthly (30 days):**
- Orders: 15,000
- Database Writes: 75,000 (3.75% of 2M limit)
- Database Reads: 150,000 (1.5% of 10M limit)
- Bandwidth: 3GB (3% of 100GB limit)
- **Total Cost: $0** ✅

### Break-Even Points

When do you start paying?

| Metric | Free Limit | Approx. Usage Before Paying |
|---------|------------|---------------------------|
| **Turso Reads** | 10M | ~650,000 orders/month |
| **Turso Writes** | 2M | ~270,000 orders/month |
| **Turso Storage** | 8GB | ~50,000+ orders with full history |
| **Vercel Bandwidth** | 100GB | ~50,000+ visits/month |
| **Vercel Functions** | 100GB-hours | Very high traffic |

**Conclusion:** You would need **over 200,000 orders/month** before exceeding free tiers.

---

## Zero Cost Strategy

### 1. Stay Within Free Limits

**Maximum Safe Usage:**

| Resource | Safe Limit (90% of free) | To Stay Free |
|----------|-------------------------|--------------|
| Turso Reads | 9,000,000/month | ~600,000 orders/month |
| Turso Writes | 1,800,000/month | ~240,000 orders/month |
| Vercel Bandwidth | 90 GB/month | ~45,000 visits/month |

**Your restaurant likely processes:** 20-200 orders/day → **Always free!**

### 2. Implement Usage Monitoring

Set up alerts to monitor usage:

#### Vercel Usage Alerts

1. Go to [https://vercel.com](https://vercel.com)
2. Select your project
3. Navigate to **Settings** → **Billing**
4. Set up alerts:
   - Bandwidth > 80GB
   - Build minutes > 5,000

#### Turso Usage Alerts

```bash
# Check usage regularly
turso db metrics restaurant-orders

# Add to cron job (daily check)
0 0 * * * /usr/local/bin/turso db metrics restaurant-orders >> /var/log/turso-usage.log
```

### 3. Implement Budget Limits

#### Vercel Project Settings

```bash
# Set hard limits in Vercel
vercel project set restaurant-orders --limit-bandwidth 90GB
vercel project set restaurant-orders --limit-builds 5000
```

#### Turso Usage Limit (Application Level)

Create usage tracking in your app:

**File:** `src/lib/server/usage-monitor.ts`

```typescript
interface UsageStats {
  reads: number;
  writes: number;
  lastReset: string;
}

const STORAGE_KEY = 'db_usage_stats';

export function trackRead() {
  const stats = getStats();
  stats.reads++;
  saveStats(stats);

  // Alert if approaching limit
  if (stats.reads > 9_000_000) {
    console.warn('⚠️ Approaching Turso read limit!');
  }
}

export function trackWrite() {
  const stats = getStats();
  stats.writes++;
  saveStats(stats);

  // Alert if approaching limit
  if (stats.writes > 1_800_000) {
    console.warn('⚠️ Approaching Turso write limit!');
  }
}

function getStats(): UsageStats {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      reads: 0,
      writes: 0,
      lastReset: new Date().toISOString()
    };
  }

  const stats = JSON.parse(stored);
  const lastReset = new Date(stats.lastReset);
  const now = new Date();

  // Reset at start of month
  if (lastReset.getMonth() !== now.getMonth()) {
    return {
      reads: 0,
      writes: 0,
      lastReset: now.toISOString()
    };
  }

  return stats;
}

function saveStats(stats: UsageStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function getUsagePercentage() {
  const stats = getStats();
  const readPercent = (stats.reads / 10_000_000) * 100;
  const writePercent = (stats.writes / 2_000_000) * 100;
  return Math.max(readPercent, writePercent);
}
```

### 4. Add Usage Dashboard

Create an admin page to monitor usage:

**File:** `src/routes/(app)/admin/usage/+page.server.ts`

```typescript
import { db } from '$lib/server/db';
import { trackRead } from '$lib/server/usage-monitor';

export async function load() {
  // Count current usage from Turso metrics
  const tursoMetrics = await turso.getMetrics('restaurant-orders');

  // Or estimate from database
  const orderCount = await db.select().from(order);
  const orderItemCount = await db.select().from(orderItem);

  return {
    orders: orderCount.length,
    orderItems: orderItemCount.length,
    estimatedReads: orderCount.length * 15,
    estimatedWrites: orderCount.length * 5,
    tursoMetrics
  };
}
```

### 5. Implement Caching

Reduce database reads with caching:

```typescript
// SvelteKit cache with 1 hour TTL
export async function load({ depends }) {
  depends('app:menu-items');

  // Cache menu items for 1 hour
  return cache('menu-items', async () => {
    return db.select().from(menuItem);
  }, 3600);
}
```

### 6. Optimize Database Queries

Minimize unnecessary reads:

```typescript
// ❌ BAD: Multiple queries
const orders = await db.select().from(order);
const items = await db.select().from(orderItem);
const users = await db.select().from(user);

// ✅ GOOD: Single query with joins
const ordersWithDetails = await db
  .select()
  .from(order)
  .leftJoin(orderItem, eq(order.id, orderItem.orderId))
  .leftJoin(user, eq(order.employeeId, user.id));
```

---

## Monitoring & Alerts

### Daily Usage Check Script

**File:** `scripts/check-usage.sh`

```bash
#!/bin/bash

# Check Turso usage
echo "=== Turso Usage ==="
turso db metrics restaurant-orders

# Check Vercel usage
echo ""
echo "=== Vercel Usage ==="
vercel project ls
echo "Visit: https://vercel.com/dashboard for detailed usage"

# Calculate percentages
# Add logic to alert if > 80%
```

Make it executable:
```bash
chmod +x scripts/check-usage.sh

# Add to crontab for daily check
0 9 * * * /path/to/scripts/check-usage.sh
```

### Vercel Analytics

1. Go to [https://vercel.com](https://vercel.com)
2. Select your project
3. Navigate to **Analytics**
4. Monitor:
   - Page views
   - Unique visitors
   - Bandwidth usage
   - Function execution time

### Turso Dashboard

1. Go to [https://dashboard.turso.io](https://dashboard.turso.io)
2. Select your database
3. Monitor:
   - Rows read/written
   - Storage used
   - Query performance
   - Slow queries

---

## Cost Reduction Techniques

### 1. Edge Caching

Vercel automatically caches static assets at the edge. Leverage this:

```typescript
// Cache static pages at Vercel edge
export const prerender = true;
export const config = {
  isr: {
    expiration: 3600 // 1 hour
  }
};
```

### 2. Database Connection Pooling

Reuse database connections:

```typescript
// Already optimized with @libsql/client
// No additional action needed
```

### 3. Pagination

Don't fetch all records at once:

```typescript
// ❌ BAD: Fetch all orders
const allOrders = await db.select().from(order);

// ✅ GOOD: Paginated
const orders = await db
  .select()
  .from(order)
  .limit(50)
  .offset(page * 50);
```

### 4. Lazy Loading

Load data only when needed:

```typescript
// Load orders, fetch items on demand
export async function load() {
  const orders = await db.select().from(order);
  return { orders };
}

// Load order items when user clicks an order
export const actions = {
  async loadItems({ request }) {
    const formData = await request.formData();
    const orderId = formData.get('orderId');
    const items = await db.select().from(orderItem)
      .where(eq(orderItem.orderId, orderId as string));
    return { items };
  }
};
```

### 5. Debounce Real-Time Updates

Don't update database on every keystroke:

```typescript
let timeout: NodeJS.Timeout;

export function trackStatusChange(status: string) {
  clearTimeout(timeout);

  // Debounce: wait 1 second before saving
  timeout = setTimeout(async () => {
    await db.update(order)
      .set({ status })
      .where(eq(order.id, orderId));
  }, 1000);
}
```

---

## What If We Exceed Free Tier?

### Turso Pricing

| Resource | Cost | How Much Usage |
|----------|-------|----------------|
| Additional Reads | $0.20 per 1M | 5M more = $1.00 |
| Additional Writes | $0.10 per 1M | 1M more = $0.10 |
| Additional Storage | $0.20 per GB | 5GB more = $1.00 |

**Example:** You have 20,000 orders in a month (way above average):
- Reads: ~300,000 (3% of free)
- Writes: ~100,000 (5% of free)
- **Still: $0** ✅

### Vercel Pricing

| Resource | Cost | How Much Usage |
|----------|-------|----------------|
| Pro Plan | $20/month | Unlimited everything |
| No per-use pricing | N/A | Pay flat rate |

**Vercel doesn't charge per use beyond free tier - you either stay on free or upgrade to Pro.**

### When to Upgrade?

**Upgrade to Vercel Pro ($20/month) if:**
- You want custom SSL certificates
- You need more than 6,000 build minutes
- You want advanced analytics
- You need team collaboration features

**Upgrade to Turso Paid if:**
- You exceed 10M reads/month (would need 650,000+ orders/month)
- You exceed 2M writes/month (would need 270,000+ orders/month)
- You need more than 8GB storage

### Safety Margins

**Stay 20% below limits:**

| Resource | Free Limit | Safe Usage (80%) |
|----------|------------|------------------|
| Turso Reads | 10M | 8M (520,000 orders/month) |
| Turso Writes | 2M | 1.6M (320,000 orders/month) |
| Vercel Bandwidth | 100GB | 80GB (40,000 visits/month) |

**This gives you plenty of buffer!**

---

## Zero Cost Guarantee Checklist

### Pre-Deployment

- [ ] Understand free tier limits
- [ ] Estimate your monthly order volume
- [ ] Set up usage monitoring
- [ ] Configure alert thresholds
- [ ] Implement caching strategies
- [ ] Optimize database queries

### Ongoing Monitoring

- [ ] Check Turso dashboard weekly
- [ ] Check Vercel analytics weekly
- [ ] Review usage monthly
- [ ] Adjust alerts if needed

### Cost Control Measures

- [ ] Implement usage dashboard for admins
- [ ] Add caching to frequently accessed data
- [ ] Optimize queries to reduce reads/writes
- [ ] Monitor slow queries in Turso dashboard
- [ ] Set up budget alerts in Vercel

---

## Real-World Examples

### Example 1: Small Bakery

**Orders per day:** 20
**Orders per month:** 600
**Estimated usage:**
- Turso reads: 6,000 (0.06% of free)
- Turso writes: 3,000 (0.15% of free)
- Vercel bandwidth: 120MB (0.12% of free)
- **Monthly cost: $0** ✅

### Example 2: Medium Restaurant

**Orders per day:** 100
**Orders per month:** 3,000
**Estimated usage:**
- Turso reads: 30,000 (0.3% of free)
- Turso writes: 15,000 (0.75% of free)
- Vercel bandwidth: 600MB (0.6% of free)
- **Monthly cost: $0** ✅

### Example 3: Busy Restaurant

**Orders per day:** 500
**Orders per month:** 15,000
**Estimated usage:**
- Turso reads: 150,000 (1.5% of free)
- Turso writes: 75,000 (3.75% of free)
- Vercel bandwidth: 3GB (3% of free)
- **Monthly cost: $0** ✅

---

## Conclusion

**Yes, you can guarantee $0 cost!**

### For Your Restaurant Ordering System:

- You process **20-200 orders/day** (typical restaurant)
- Free tiers support **up to 270,000 orders/month**
- You're using **< 0.5% of free limits**

**You will likely NEVER pay anything.**

### To Ensure $0 Cost:

1. ✅ Stay under 200,000 orders/month (very safe margin)
2. ✅ Monitor usage weekly
3. ✅ Set up alerts at 80% of free limits
4. ✅ Implement caching to reduce database reads
5. ✅ Optimize queries to reduce unnecessary reads/writes

### If You Do Exceed Limits:

You'd need **over 200,000 orders/month** - that's:
- **6,667 orders per day**
- **278 orders per hour**
- **4.6 orders per minute**

**At that point, you're successful enough to afford paid plans!**

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Maintained By:** Restaurant Ordering System Development Team
