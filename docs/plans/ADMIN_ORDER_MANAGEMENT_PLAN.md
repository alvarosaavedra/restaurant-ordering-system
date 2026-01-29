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

## Phase 0: Database Schema Changes

### 0.1 Add `deletedAt` Column
**File**: `src/lib/server/db/schema.ts`

Add to `order` table definition:
```typescript
deletedAt: integer('deleted_at', { mode: 'timestamp' })
```

**Migration**: Run `npm run db:push` to update database

**Rationale**: Nullable timestamp field that indicates when an order was soft-deleted. If null, the order is active.

### 0.2 Update Type Definitions
**File**: `src/lib/types/orders.ts`

Update order interfaces to include:
```typescript
deletedAt?: Date | null;
```

**Impact**: No breaking changes - field is optional and doesn't affect existing code.

---

## Phase 1: Server-Side Changes

### File: `src/routes/(app)/orders/[id]/+page.server.ts`

#### 1.1 Update Load Function
Add admin role check and return `isAdmin` flag:

```typescript
export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const isAdmin = locals.user.role === 'admin';

  // ... existing order fetching logic ...

  return {
    order: { ...orderRecord, items },
    isAdmin
  };
};
```

#### 1.2 Add Server Actions

**Action: `updateOrder`**
- Validates: id, customerName, deliveryDateTime, status (required), customerPhone, address, comment (optional)
- Checks order exists and is not deleted
- Updates order fields and `updatedAt` timestamp
- Logs with `adminLogger.info({ event: 'order_updated', orderId, userId, changes })`
- Returns: `{ success: true, message: 'Order updated successfully' }`

**Action: `updateOrderItems`**
- Input: array of `{ menuItemId, quantity, unitPrice }`
- Validates: at least one item required, all menu items exist and are available
- Checks order exists and is not deleted
- Transaction: delete existing items → insert new items → recalculate total → update order
- Updates `order.totalAmount` and `order.updatedAt`
- Logs with `adminLogger.info({ event: 'order_items_updated', orderId, userId, itemCount, totalAmount })`
- Returns: `{ success: true, message: 'Order items updated successfully' }`

**Action: `deleteOrder`**
- Validates: id (required)
- Checks order exists and is not already deleted
- Sets `deletedAt = new Date()` (soft delete)
- Preserves all order data and items
- Logs with `adminLogger.info({ event: 'order_deleted', orderId, userId, orderData })`
- Returns: `redirect(302, '/orders')`

---

## Phase 2: Query Updates (Filtering Soft-Deleted Orders)

### 2.1 Order List Query
**File**: `src/routes/(app)/orders/+page.server.ts`

Add filter to existing query:
```typescript
.where(isNull(order.deletedAt))
```

### 2.2 Kitchen View Query
**File**: `src/routes/(app)/kitchen/+page.server.ts`

Add filter to existing query:
```typescript
.where(isNull(order.deletedAt))
```

### 2.3 Delivery View Query
**File**: `src/routes/(app)/delivery/+page.server.ts`

Add filter to existing query:
```typescript
.where(isNull(order.deletedAt))
```

### 2.4 Order Status API
**File**: `src/routes/api/orders/[id]/status/+server.ts`

Add check before status update:
```typescript
const [orderRecord] = await db.select().from(order).where(eq(order.id, orderId));

if (!orderRecord) {
  return json({ error: 'Order not found' }, { status: 404 });
}

if (orderRecord.deletedAt) {
  return json({ error: 'Cannot update status of deleted order' }, { status: 400 });
}
```

---

## Phase 3: Client-Side UI Changes

### File: `src/routes/(app)/orders/[id]/+page.svelte`

#### 3.1 Add State Variables

```typescript
let showEditOrderModal: boolean = $state(false);
let showEditItemsModal: boolean = $state(false);
let showDeleteOrderModal: boolean = $state(false);

let orderFormData = $state({
  id: '',
  customerName: '',
  customerPhone: '',
  deliveryDateTime: '',
  address: '',
  comment: '',
  status: 'pending'
});

let itemsFormData = $state<{ menuItemId: string; name: string; quantity: number; unitPrice: number }[]>([]);
```

#### 3.2 Add Admin Controls to Header

Add after the back button, before the h1:
```svelte
{#if data.isAdmin}
  <div class="flex items-center gap-2 ml-auto">
    <Button variant="secondary" size="sm" onclick={openEditOrderModal}>
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Edit Order
    </Button>
    <Button variant="secondary" size="sm" onclick={openEditItemsModal}>
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      Edit Items
    </Button>
    <Button variant="danger" size="sm" onclick={openDeleteOrderModal}>
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Delete
    </Button>
  </div>
{/if}
```

#### 3.3 Edit Order Modal

```svelte
<Modal title="Edit Order" open={showEditOrderModal} onclose={closeAllModals}>
  <form method="POST" action="?/updateOrder" use:enhance={handleFormSuccess}>
    <input type="hidden" name="id" value={orderFormData.id} />
    <div class="space-y-4">
      <Input
        id="customerName"
        name="customerName"
        type="text"
        label="Customer Name"
        placeholder="Enter customer name"
        required
        bind:value={orderFormData.customerName}
      />
      <Input
        id="customerPhone"
        name="customerPhone"
        type="text"
        label="Customer Phone"
        placeholder="Enter phone number"
        bind:value={orderFormData.customerPhone}
      />
      <Input
        id="deliveryDateTime"
        name="deliveryDateTime"
        type="datetime-local"
        label="Delivery Date/Time"
        required
        bind:value={orderFormData.deliveryDateTime}
      />
      <Input
        id="address"
        name="address"
        type="text"
        label="Delivery Address"
        placeholder="Enter delivery address"
        bind:value={orderFormData.address}
      />
      <div>
        <label for="comment" class="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
        <textarea
          id="comment"
          name="comment"
          rows="3"
          class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px]"
          placeholder="Special instructions (optional)"
          bind:value={orderFormData.comment}
        ></textarea>
      </div>
      <Select
        id="status"
        name="status"
        options={[
          { value: 'pending', label: 'Pending' },
          { value: 'preparing', label: 'Preparing' },
          { value: 'ready', label: 'Ready' },
          { value: 'delivered', label: 'Delivered' }
        ]}
        placeholder="Select status"
        required
        bind:value={orderFormData.status}
      />
      <div class="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
        <Button type="submit">Update Order</Button>
      </div>
    </div>
  </form>
</Modal>
```

#### 3.4 Edit Items Modal

```svelte
<Modal title="Edit Order Items" open={showEditItemsModal} onclose={closeAllModals}>
  <form method="POST" action="?/updateOrderItems" use:enhance={handleFormSuccess}>
    <input type="hidden" name="id" value={order.id} />
    <input type="hidden" name="itemsJson" value={JSON.stringify(itemsFormData)} />

    <div class="space-y-4 max-h-[60vh] overflow-y-auto">
      <div class="space-y-2">
        {#each itemsFormData as item, index (index)}
          <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span class="flex-1 font-medium">{item.name}</span>
            <Input
              type="number"
              min="1"
              class="w-20"
              bind:value={itemsFormData[index].quantity}
            />
            <span class="text-sm text-gray-500">@ ${item.unitPrice.toFixed(2)}</span>
            <button
              type="button"
              onclick={() => removeItem(index)}
              class="p-1 text-red-600 hover:bg-red-50 rounded"
              aria-label="Remove item"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/each}
      </div>

      <Select
        options={data.menuItems.map(m => ({ value: m.id, label: m.name }))}
        placeholder="Add item..."
        onchange={(e) => addItem(e.target.value)}
      />

      <div class="pt-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <span class="font-medium">Total</span>
          <span class="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      <div class="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
        <Button type="submit">Update Items</Button>
      </div>
    </div>
  </form>
</Modal>
```

#### 3.5 Delete Order Modal

```svelte
<Modal title="Delete Order" open={showDeleteOrderModal} onclose={closeAllModals}>
  <form method="POST" action="?/deleteOrder" use:enhance={handleFormSuccess}>
    <input type="hidden" name="id" value={order.id} />
    <div class="space-y-4">
      <div class="p-4 bg-warning-50 border border-warning-200 rounded-lg">
        <div class="flex gap-3">
          <svg class="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="font-medium text-warning-800">This action will archive this order</p>
            <p class="text-sm text-warning-700 mt-1">The order will be hidden from all views but will remain in the database for audit purposes.</p>
          </div>
        </div>
      </div>

      <p class="text-gray-700">
        Are you sure you want to delete order <strong>#{order.id.slice(-6)}</strong> for <strong>{order.customerName}</strong>?
      </p>

      <div class="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
        <Button type="submit" variant="danger">Delete Order</Button>
      </div>
    </div>
  </form>
</Modal>
```

#### 3.6 Helper Functions

```typescript
function openEditOrderModal() {
  orderFormData = {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone || '',
    deliveryDateTime: new Date(order.deliveryDateTime).toISOString().slice(0, 16),
    address: order.address || '',
    comment: order.comment || '',
    status: order.status
  };
  showEditOrderModal = true;
}

function openEditItemsModal() {
  itemsFormData = order.items.map(item => ({
    menuItemId: item.menuItemId,
    name: item.menuItem?.name || 'Unknown Item',
    quantity: item.quantity,
    unitPrice: item.unitPrice
  }));
  showEditItemsModal = true;
}

function openDeleteOrderModal() {
  showDeleteOrderModal = true;
}

function removeItem(index: number) {
  itemsFormData.splice(index, 1);
}

function addItem(menuItemId: string) {
  const menuItem = data.menuItems.find(m => m.id === menuItemId);
  if (menuItem) {
    itemsFormData.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: 1,
      unitPrice: menuItem.price
    });
  }
}

function calculateTotal(): number {
  return itemsFormData.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
}

function closeAllModals() {
  showEditOrderModal = false;
  showEditItemsModal = false;
  showDeleteOrderModal = false;
}

function handleFormSuccess() {
  closeAllModals();
  invalidateAll();
}
```

#### 3.7 Success/Error Toasts

Add after existing modals:
```svelte
{#if form?.error}
  <div class="fixed top-4 right-4 max-w-sm p-4 bg-error-50 border border-error-200 rounded-xl shadow-lg" role="alert">
    <div class="flex items-center gap-3">
      <svg class="w-5 h-5 text-error-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm font-medium text-error-800">{form.error}</p>
    </div>
  </div>
{/if}

{#if form?.message}
  <div class="fixed top-4 right-4 max-w-sm p-4 bg-green-50 border border-green-200 rounded-xl shadow-lg" role="alert">
    <div class="flex items-center gap-3">
      <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <p class="text-sm font-medium text-green-800">{form.message}</p>
    </div>
  </div>
{/if}
```

#### 3.8 Import Updates

Add to existing imports:
```typescript
import { invalidateAll } from '$app/navigation';
import { enhance } from '$app/forms';
import type { ActionData } from './$types';
```

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
