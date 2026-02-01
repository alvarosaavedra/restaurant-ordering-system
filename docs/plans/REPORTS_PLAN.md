# Reports Feature Implementation Plan

## Overview

This document outlines the implementation plan for a comprehensive reporting system for the Restaurant Ordering System.

**Location:** `/admin/reports/*`  
**Access:** Admin-only  
**Status:** In Progress  
**Created:** 2026-02-01  
**Updated:** 2026-02-01

## Progress

### ✅ Completed Phases

#### Phase 1: Foundation (COMPLETED)
- **Status:** ✅ Done  
- **Commit:** `85ef39a`  
- **Changes:**
  - Reports navigation added to admin layout
  - DateRangePicker component with comprehensive tests
  - Reports dashboard at `/admin/reports`
  - Placeholder pages for all 5 report categories
  - All code passes lint and type checks

#### Phase 2: Sales Reports (IN PROGRESS)
- **Status:** 🚧 In Progress  
- **Changes:**
  - Sales reports query functions with tests (TDD)
  - Revenue aggregation by date
  - Discount tracking and calculations
  - Server-side data loading
  - Real-time sales dashboard with summary cards
  - Database schema updated with discount columns

---

## Requirements

### Report Types
- **Sales/Revenue Reports**: Daily/weekly/monthly sales, revenue trends, discount impact
- **Order Statistics**: Orders by status, order volume, average order value, completion times
- **Menu Performance**: Best/worst selling items, category performance, revenue by item
- **Client Reports**: Top customers, order frequency, customer lifetime value
- **Employee Performance**: Orders taken by employee, productivity metrics

### Time Periods
- Daily view (day-by-day breakdown)
- Weekly view (week-by-week breakdown)
- Monthly view (month-by-month breakdown)
- Custom date range (user-defined periods)

### Access Control
- Admin users only
- Secure data access with role verification

---

## Data Models & Queries

### Sales/Revenue Reports

**Key Metrics:**
- Total revenue by period
- Average order value
- Revenue trends (comparisons)
- Discount impact
- Net revenue after discounts

**Database Queries:**

```typescript
// Revenue summary by date
const revenueByDate = await db
  .select({
    date: sql<string>`DATE(${order.createdAt})`,
    grossRevenue: sum(order.totalAmount),
    totalDiscounts: sum(order.discountAmount),
    netRevenue: sql<number>`SUM(${order.totalAmount} - COALESCE(${order.discountAmount}, 0))`,
    orderCount: count(),
    avgOrderValue: sql<number>`AVG(${order.totalAmount})`
  })
  .from(order)
  .where(and(
    isNull(order.deletedAt),
    gte(order.createdAt, startDate),
    lte(order.createdAt, endDate)
  ))
  .groupBy(sql`DATE(${order.createdAt})`)
  .orderBy(order.createdAt);

// Revenue comparison (previous period)
```

### Order Statistics

**Key Metrics:**
- Orders by status over time
- Peak order times/hours
- Order volume trends
- Completion time (pending → delivered)

**Database Queries:**

```typescript
// Orders by status over time
const ordersByStatus = await db
  .select({
    date: sql<string>`DATE(${order.createdAt})`,
    status: order.status,
    count: count()
  })
  .from(order)
  .where(and(
    isNull(order.deletedAt),
    gte(order.createdAt, startDate),
    lte(order.createdAt, endDate)
  ))
  .groupBy(sql`DATE(${order.createdAt})`, order.status);

// Average completion time per order
```

### Menu Performance Reports

**Key Metrics:**
- Top selling items by quantity
- Revenue by menu item
- Category performance
- Items rarely ordered (bottom performers)

**Database Queries:**

```typescript
// Top selling items
const topItems = await db
  .select({
    itemId: menuItem.id,
    itemName: menuItem.name,
    categoryName: category.name,
    totalSold: sum(orderItem.quantity),
    totalRevenue: sql<number>`SUM(${orderItem.quantity} * ${orderItem.unitPrice})`,
    orderCount: count(sql`DISTINCT ${orderItem.orderId}`)
  })
  .from(orderItem)
  .innerJoin(menuItem, eq(orderItem.menuItemId, menuItem.id))
  .innerJoin(category, eq(menuItem.categoryId, category.id))
  .innerJoin(order, eq(orderItem.orderId, order.id))
  .where(and(
    isNull(order.deletedAt),
    gte(order.createdAt, startDate),
    lte(order.createdAt, endDate)
  ))
  .groupBy(menuItem.id, category.name)
  .orderBy(sql`SUM(${orderItem.quantity}) DESC`);

// Category performance summary
```

### Client Reports

**Key Metrics:**
- Top customers by revenue
- Customer order frequency
- New vs returning customers
- Customer lifetime value (CLV)

**Database Queries:**

```typescript
// Top customers by spending
const topCustomers = await db
  .select({
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    orderCount: count(),
    totalSpent: sum(order.totalAmount),
    avgOrderValue: avg(order.totalAmount),
    firstOrder: min(order.createdAt),
    lastOrder: max(order.createdAt)
  })
  .from(order)
  .where(and(
    isNull(order.deletedAt),
    gte(order.createdAt, startDate),
    lte(order.createdAt, endDate)
  ))
  .groupBy(order.customerPhone, order.customerName)
  .orderBy(sql`SUM(${order.totalAmount}) DESC`)
  .limit(100);

// Customer retention metrics
```

### Employee Performance

**Key Metrics:**
- Orders taken per employee
- Revenue generated per employee
- Average order value by employee

**Database Queries:**

```typescript
// Employee performance metrics
const employeePerformance = await db
  .select({
    employeeId: user.id,
    employeeName: user.name,
    ordersTaken: count(order.id),
    totalRevenue: sum(order.totalAmount),
    avgOrderValue: avg(order.totalAmount),
    uniqueCustomers: count(sql`DISTINCT ${order.customerPhone}`)
  })
  .from(order)
  .innerJoin(user, eq(order.employeeId, user.id))
  .where(and(
    isNull(order.deletedAt),
    gte(order.createdAt, startDate),
    lte(order.createdAt, endDate)
  ))
  .groupBy(user.id, user.name)
  .orderBy(sql`SUM(${order.totalAmount}) DESC`);
```

---

## Route Structure

```
src/routes/(app)/admin/reports/
├── +page.svelte              # Reports dashboard (overview)
├── +page.server.ts           # Load report summaries
├── sales/
│   ├── +page.svelte          # Sales/Revenue reports
│   └── +page.server.ts       # Sales data queries
├── orders/
│   ├── +page.svelte          # Order statistics
│   └── +page.server.ts       # Order stats queries
├── menu/
│   ├── +page.svelte          # Menu performance
│   └── +page.server.ts       # Menu analytics queries
├── clients/
│   ├── +page.svelte          # Client reports
│   └── +page.server.ts       # Client analytics queries
└── employees/
    ├── +page.svelte          # Employee performance
    └── +page.server.ts       # Employee metrics queries
```

---

## UI Components

### New Components to Create

1. **DateRangePicker.svelte** - Select daily/weekly/monthly/custom date ranges
2. **ReportChart.svelte** - Chart wrapper for data visualization
3. **ReportSummaryCard.svelte** - Key metrics display cards
4. **ExportButton.svelte** - CSV/JSON export functionality
5. **ReportTable.svelte** - Sortable data tables with pagination

### Reuse Existing Components
- Card.svelte - For metric displays
- Button.svelte - For actions
- Select.svelte - For time period selection
- Input.svelte - For date inputs

### Chart Types Needed
- Line charts (trends over time)
- Bar charts (comparisons between categories)
- Pie/Doughnut charts (status distribution, category breakdown)
- Data tables with sorting and pagination

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create `/admin/reports` routes and navigation
- [ ] Add reports link to admin sidebar
- [ ] Build `DateRangePicker` component with presets
- [ ] Implement base report layout with tabs navigation
- [ ] Create report dashboard overview page

### Phase 2: Sales Reports (Week 1-2)
- [ ] Revenue summary queries (daily/weekly/monthly)
- [ ] Sales trend visualization with line chart
- [ ] Discount impact reporting
- [ ] Export to CSV functionality

### Phase 3: Order Statistics (Week 2)
- [ ] Orders by status breakdown
- [ ] Order volume trends chart
- [ ] Peak hours analysis
- [ ] Completion time metrics

### Phase 4: Menu Performance (Week 3)
- [ ] Top selling items table
- [ ] Category performance breakdown
- [ ] Revenue by item analysis
- [ ] Low performers identification

### Phase 5: Client & Employee Reports (Week 3-4)
- [ ] Top customers ranking
- [ ] Customer lifetime value calculation
- [ ] Employee performance metrics
- [ ] Employee comparison charts

### Phase 6: Polish & Optimization (Week 4)
- [ ] Add charts to all report pages
- [ ] Implement CSV export for all reports
- [ ] Add date range caching for performance
- [ ] Responsive mobile views
- [ ] Add database indexes for query performance

---

## Technical Considerations

### Libraries
- **Charts**: Recharts (if available in project) or Chart.js
- **CSV Export**: Native JavaScript (no additional deps)
- **Date handling**: Native Date or existing date-fns

### Database Performance
- Add indexes on frequently queried columns:
  - `orders.created_at` (for date range queries)
  - `orders.status` (for status filtering)
  - `orders.employee_id` (for employee reports)
  - `order_items.menu_item_id` (for menu performance)

### Caching Strategy
- Cache report data for same-day queries
- Invalidate cache when new orders are created
- Store cached data in memory or Redis

### Security
- Verify admin role on all report routes
- Mask sensitive customer data in exports (phone numbers)
- Rate limit report generation to prevent abuse

### Responsive Design
- Charts should be responsive and resize on mobile
- Tables should scroll horizontally on small screens
- Date picker should work well on mobile devices

---

## Navigation Integration

Add to admin sidebar navigation in `src/routes/(app)/admin/+layout.svelte`:

```typescript
const adminNavItems = [
  { label: 'Menu', href: '/admin/menu', icon: Utensils },
  { label: 'Clients', href: '/admin/clients', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
];
```

---

## Acceptance Criteria

- [ ] All 5 report types are accessible from admin panel
- [ ] Date range picker works for all time periods
- [ ] Charts display correctly and are responsive
- [ ] Data exports to CSV format
- [ ] Pages load within 3 seconds for 1 month of data
- [ ] Only admin users can access reports
- [ ] Mobile responsive design
- [ ] All database queries use soft-delete filtering

---

## Notes

- This plan was created on 2026-02-01
- Based on existing database schema with orders, order_items, menu_items, users, and clients tables
- Follows existing SvelteKit 5 patterns with runes
- Uses existing UI component library (Card, Button, Input, Select)
- Admin-only access aligned with existing admin routes pattern
