# Admin Order Management - Implementation Plan

## Overview
Add admin controls to the order detail page (`/orders/[id]`) allowing admins to edit all order fields (including full item management) and soft-delete orders.

## Scope & Requirements

### Editable Fields (All)
- **Customer**: name, phone
- **Delivery**: date/time, address, comment
- **Status**: pending/preparing/ready/delivered
- **Items**: full CRUD (add, remove, edit quantities, change menu items)

### Restrictions
None - admins can modify orders in any status

### UI Placement
Admin controls at the top of the page (near the header/back button)

### Soft Delete
- Orders are marked with `deletedAt` timestamp instead of being removed
- Orders with `deletedAt` are hidden from normal views (order history, kitchen, delivery)
- Orders remain in database for audit and potential future restoration

---

## Phase 0: Database Schema Changes ✅ COMPLETED

### 0.1 Add `deletedAt` Column ✅ COMPLETED
**File**: `src/lib/server/db/schema.ts`

**Status**: Column added to schema, database updated

**Changes**: Added `deletedAt: integer('deleted_at', { mode: 'timestamp' })` to order table

**Migration**: `npm run db:push` completed successfully

### 0.2 Update Type Definitions ✅ COMPLETED
**File**: `src/lib/types/orders.ts`

**Status**: Updated `OrderWithItems` and `OrderWithEmployee` interfaces

**Changes**: Added `deletedAt?: Date | null;` to both interfaces

**Impact**: No breaking changes - field is optional and doesn't affect existing code.

---

## Phase 1: Server-Side Changes ✅ COMPLETED

### File: `src/routes/(app)/orders/[id]/+page.server.ts`

**Status**: All server-side changes implemented

**Changes Made**:
- Updated load function to include admin role check and return `isAdmin` flag
- Added `menuItems` data to load function for edit items modal
- Added `deletedAt` field to order data query
- Implemented `updateOrder` action with full validation and logging
- Implemented `updateOrderItems` action with transaction support and logging
- Implemented `deleteOrder` action with soft delete and redirect
- All actions include admin role enforcement

---

## Phase 2: Query Updates (Filtering Soft-Deleted Orders) ✅ COMPLETED

### 2.1 Order List Query ✅ COMPLETED
**File**: `src/routes/(app)/orders/+page.server.ts`

**Changes**: Added `isNull(order.deletedAt)` to conditions array in order list query and totalCount query

### 2.2 Kitchen View Query ✅ COMPLETED
**File**: `src/routes/(app)/kitchen/+page.server.ts`

**Changes**: Added `isNull(order.deletedAt)` filter with `and()` to kitchen orders query

### 2.3 Delivery View Query ✅ COMPLETED
**File**: `src/routes/(app)/delivery/+page.server.ts`

**Changes**: Added `isNull(order.deletedAt)` filter with `and()` to delivery orders query

### 2.4 Order Status API ✅ COMPLETED
**File**: `src/routes/api/orders/[id]/status/+server.ts`

**Changes**: Added order existence check and `deletedAt` validation before status update

---

## Phase 3: Client-Side UI Changes ✅ COMPLETED

**File**: `src/routes/(app)/orders/[id]/+page.svelte`

**Status**: All UI components and functionality implemented

**Changes Made**:
- Added admin controls (Edit Order, Edit Items, Delete buttons) to header
- Created Edit Order modal with all basic order fields
- Created Edit Items modal with add/remove functionality and total calculation
- Created Delete Order modal with confirmation and warning message
- Added success/error toast notifications for feedback
- Implemented helper functions: openEditOrderModal, openEditItemsModal, openDeleteOrderModal, removeItem, addItem, calculateTotal, closeAllModals, handleFormSuccess
- Updated imports to include invalidateAll, enhance, and ActionData
- All modals use existing components (Modal, Button, Input, Select)

---

## Phase 4: Testing Strategy

### 4.1 Unit Tests

**Test File**: `src/routes/(app)/orders/[id]/+page.server.spec.ts`

Test cases:
- `updateOrder`: Valid data, missing required fields, invalid order ID, deleted order, invalid status
- `updateOrderItems`: Valid items array, empty items, invalid menuItemId, deleted order, total calculation
- `deleteOrder`: Valid order ID, invalid order ID, already deleted order
- Admin role enforcement in all actions

**Test File**: `src/routes/(app)/orders/+page.server.spec.ts`

Test cases:
- Soft-deleted orders don't appear in list
- Active orders appear in list

**Test File**: `src/routes/api/orders/[id]/status/+server.spec.ts`

Test cases:
- Status update rejected for soft-deleted orders
- Status update works for active orders

### 4.2 E2E Tests

**Test File**: `e2e/admin-order-management.spec.ts`

Test cases:
- Full edit order workflow (basic fields)
- Full edit items workflow (add, remove, edit quantities)
- Soft delete workflow
- Deleted orders don't appear in order history
- Deleted orders don't appear in kitchen view
- Deleted orders don't appear in delivery view
- Non-admin users cannot see admin controls
- Success/error toast messages display correctly

---

## Files Summary

### Files to Modify
| File | Lines Changed | Description |
|------|---------------|-------------|
| `src/lib/server/db/schema.ts` | +1 | Add `deletedAt` field |
| `src/lib/types/orders.ts` | +1 | Update order types |
| `src/routes/(app)/orders/[id]/+page.server.ts` | +150 | Add admin check, server actions |
| `src/routes/(app)/orders/[id]/+page.svelte` | +300 | Add admin UI, modals, forms |
| `src/routes/(app)/orders/+page.server.ts` | +1 | Add filter for deleted orders |
| `src/routes/(app)/kitchen/+page.server.ts` | +1 | Add filter for deleted orders |
| `src/routes/(app)/delivery/+page.server.ts` | +1 | Add filter for deleted orders |
| `src/routes/api/orders/[id]/status/+server.ts` | +10 | Add check for deleted orders |

### New Files to Create
None - reusing existing components (Modal, Button, Input, Select)

### Test Files to Create
| File | Purpose |
|------|---------|
| `src/routes/(app)/orders/[id]/+page.server.spec.ts` | Unit tests for server actions |
| `e2e/admin-order-management.spec.ts` | E2E tests for admin workflows |

---

## Key Design Decisions

1. **Separate Modals**: Basic fields and items edited separately to avoid overwhelming forms
2. **Full Item Replacement**: Items deleted and re-inserted for simplicity (atomic transaction ensures consistency)
3. **Soft Delete**: Orders archived with `deletedAt` timestamp, preserving all data
4. **Filtering Everywhere**: Soft-deleted orders hidden from all normal views
5. **No Restore Yet**: Basic soft delete implementation, restoration can be added later
6. **Redirect After Delete**: User returns to order list after successful deletion
7. **Status Updates Blocked**: Cannot change status of soft-deleted orders
8. **Toast Notifications**: Reuse existing pattern from menu admin for consistency

---

## Edge Cases & Considerations

| Case | Handling |
|------|----------|
| Menu item price changed since order creation | Use current prices (admin can manually adjust `unitPrice` if needed) |
| Menu item unavailable | Allow editing (admin override) |
| Menu item deleted from database | Display as "Unknown Item", prevent editing that specific item |
| Concurrent admin edits | Last write wins (standard admin panel behavior) |
| Deleted order URL accessed directly | Order still visible via ID (useful for audit) |
| Empty items array | Validation error: at least one item required |
| Invalid date format | Validation error: must be valid date |
| Negative quantities | Validation error: must be positive integer |

---

## Future Enhancements (Out of Scope)

1. **Restore Orders**: Ability to restore soft-deleted orders
2. **Deleted Orders View**: Admin page to view and manage deleted orders
3. **Permanent Delete**: Option to permanently delete soft-deleted orders after X days
4. **Audit Log**: Detailed change history (who changed what and when)
5. **Reason for Deletion**: Optional field to capture why an order was deleted
6. **Bulk Actions**: Delete/restore multiple orders at once
7. **Order Versioning**: Track all changes to an order over time
8. **Export Deleted Orders**: CSV/PDF export for audit reports

---

## Estimated Effort

| Phase | Time |
|-------|------|
| Phase 0: Database Schema | 0.5 hours |
| Phase 1: Server Actions | 2-3 hours |
| Phase 2: Query Updates | 1 hour |
| Phase 3: Client UI | 4-5 hours |
| Phase 4: Testing | 2-3 hours |

**Total**: ~8-13 hours

---

## Prerequisites

1. Admin user with `admin` role exists in database
2. Database backup recommended before schema changes
3. Run `npm run db:push` after schema modification
4. Run `npm run check` and `npm run lint` after implementation
5. Run `npm run test` before committing changes

---

## Success Criteria

- [ ] Admins can edit all basic order fields
- [ ] Admins can add/remove/edit order items
- [ ] Admins can soft-delete orders
- [ ] Soft-deleted orders hidden from all normal views
- [ ] Soft-deleted orders still viewable by direct ID
- [ ] All server actions properly logged with `adminLogger`
- [ ] All validations implemented (required fields, data types)
- [ ] Success/error messages display correctly
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] No type errors (`npm run check`)
- [ ] No lint errors (`npm run lint`)

## Progress Tracking

- [x] Phase 0: Database Schema Changes (COMPLETED)
- [x] Phase 1: Server-Side Changes (COMPLETED)
- [x] Phase 2: Query Updates (Filtering Soft-Deleted Orders) (COMPLETED)
- [x] Phase 3: Client-Side UI Changes (COMPLETED)
- [ ] Phase 4: Testing Strategy

---

## Dependencies

- Existing: Modal, Button, Input, Select, StatusBadge components
- Existing: adminLogger from `$lib/server/logger`
- Existing: Drizzle ORM with SQLite
- No new external dependencies required

---

## Rollback Plan

If issues arise after deployment:
1. Revert database schema (remove `deletedAt` column)
2. Revert all query filters (remove `isNull(order.deletedAt)`)
3. Revert server-side code changes
4. Revert client-side UI changes
5. Restore from backup if needed
