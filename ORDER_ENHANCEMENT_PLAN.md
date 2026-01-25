# Order Enhancement Implementation Plan

## Overview
Add delivery date/time, address, and comment fields to the restaurant ordering system.

## Progress Summary
**Phase 1 (Backend):** ✅ Complete
- [x] Database schema updated
- [x] Migration applied
- [x] API endpoints updated

**Phase 2 (Frontend):** ✅ Complete
- [x] Type definitions
- [x] UI components
- [x] Page updates
- [x] Testing

## Requirements (from user)
- **Delivery Date/Time**: Required field for all orders
- **Address**: Optional field with no validation
- **Comment**: Optional field for special instructions
- **Order Type**: No dine-in/takeout/delivery distinction (keep simple)

## Implementation Steps

### 1. Database Schema Migration ✅ COMPLETE
**File:** `src/lib/server/db/schema.ts`

Add to `order` table:
```typescript
deliveryDateTime: integer('delivery_date_time', { mode: 'timestamp' }).notNull(),
address: text('address'),
comment: text('comment'),
```

**Migration Command:**
```bash
npm run db:push
```

**Status:** Completed
- Schema updated with new fields
- Migration applied to database
- Existing orders populated with default delivery dates
- Type checking passes ✓

### 2. Type Updates ✅ COMPLETE
**File:** `src/lib/types/orders.ts`

Update `CreateOrderForm`:
```typescript
export type CreateOrderForm = {
    customerName: string;
    customerPhone?: string;
    deliveryDateTime: string;  // ISO datetime string
    address?: string;
    comment?: string;
    items: {
        menuItemId: string;
        quantity: number;
    }[];
};
```

**Status:** Completed
- Added deliveryDateTime field (required)
- Added address field (optional)
- Added comment field (optional)
- Removed unused User import
- Type checking passes ✓

### 3. UI Components ✅ COMPLETE

#### 3a. CustomerInfo Component ✅ COMPLETE
**File:** `src/lib/components/CustomerInfo.svelte`

Add form fields:
- Delivery Date/Time: `<input type="datetime-local">` (required)
- Address: `<textarea>` (optional)
- Comment: `<textarea>` (optional)

Update Props interface:
```typescript
interface Props {
    customerName: string;
    customerPhone: string;
    deliveryDateTime: string;
    address?: string;
    comment?: string;
    onUpdate: (data: Partial<CreateOrderForm>) => void;
    showErrors?: boolean;
}
```

**Status:** Completed
- Added deliveryDateTime field with datetime-local input (required)
- Added address field with textarea (optional)
- Added comment field with textarea (optional)
- Added validation for deliveryDateTime (required, must be future)
- Updated tests to include new fields

#### 3b. OrderCard Component ✅ COMPLETE
**File:** `src/lib/components/OrderCard.svelte`

Add display of new fields in order cards (compact format).

**Status:** Completed
- Added deliveryDateTime display in order card header section
- Added address display with icon (when available)
- Added comment display with icon (when available)
- Updated interface to include new fields
- Updated tests to include new fields

### 4. Page Updates ✅ COMPLETE

#### 4a. Order Creation Page ✅ COMPLETE
**File:** `src/routes/(app)/orders/new/+page.svelte`

Add state variables:
```typescript
let deliveryDateTime: string = $state('');
let address: string = $state('');
let comment: string = $state('');
```

Include in API request payload.

**Status:** Completed
- Added deliveryDateTime, address, comment state variables
- Updated CustomerInfo component props to include new fields
- Updated createOrder function to include new fields in API call
- Added validation for deliveryDateTime

#### 4b. Order History Page ✅ COMPLETE
**File:** `src/routes/(app)/orders/+page.svelte`

Display new fields in expanded order details.

**Status:** Completed
- Updated load function to include delivery fields in query
- Orders API already includes new fields

#### 4c. Order Detail Page ✅ COMPLETE
**File:** `src/routes/(app)/orders/[id]/+page.svelte`

Create "Delivery Information" section with all three fields.

**Status:** Completed
- Added new fields to Order interface
- Added "Delivery Information" card with deliveryDateTime, address, comment
- Only shows delivery section if any field has data
- Uses same formatting functions as order dates

#### 4d. Kitchen View ✅ COMPLETE
**File:** `src/routes/(app)/kitchen/+page.svelte`

Display delivery date/time and comment for prioritization.

**Status:** Completed
- Updated fetchOrders to map delivery fields from API response
- OrderCard component displays delivery info

#### 4e. Delivery View ✅ COMPLETE
**File:** `src/routes/(app)/delivery/+page.svelte`

Show address prominently, plus delivery date/time and comment.

**Status:** Completed
- Updated fetchOrders to map delivery fields from API response
- OrderCard component displays delivery info (address is prominent)

### 5. API Updates ✅ COMPLETE

#### 5a. Order Creation API ✅ COMPLETE
**File:** `src/routes/api/orders/+server.ts`

Update POST handler:
- Validate `deliveryDateTime` is present and valid
- Include all three fields in order insertion

**Status:** Completed
- Added deliveryDateTime validation (required, must be future date)
- Added address and comment to order insertion
- Updated GET handler to return new fields ✓

#### 5b. Order Retrieval APIs ✅ COMPLETE
Update all GET handlers to include new fields:
- `src/routes/api/orders/+server.ts` - ✓ Updated
- `src/routes/api/kitchen/orders/+server.ts` - ✓ Updated
- `src/routes/api/delivery/orders/+server.ts` - ✓ Updated

**Status:** Completed
- All GET handlers now return deliveryDateTime, address, and comment fields

### 6. Server Load Functions ✅ COMPLETE

Update all load functions to include new fields:
- `src/routes/(app)/orders/+page.server.ts` - ✓ Updated
- `src/routes/(app)/orders/[id]/+page.server.ts` - ✓ Updated

**Status:** Completed
- Both load functions now include deliveryDateTime, address, and comment in queries

## Files to Modify

### Core Files
1. `src/lib/server/db/schema.ts` - Database schema
2. `src/lib/types/orders.ts` - TypeScript types

### Components
3. `src/lib/components/CustomerInfo.svelte` - Order form
4. `src/lib/components/OrderCard.svelte` - Order display cards

### Pages
5. `src/routes/(app)/orders/new/+page.svelte` - Order creation
6. `src/routes/(app)/orders/+page.svelte` - Order history
7. `src/routes/(app)/orders/[id]/+page.svelte` - Order details
8. `src/routes/(app)/kitchen/+page.svelte` - Kitchen view
9. `src/routes/(app)/delivery/+page.svelte` - Delivery view

### Server Load Functions
10. `src/routes/(app)/orders/+page.server.ts`
11. `src/routes/(app)/orders/[id]/+page.server.ts`

### API Routes
12. `src/routes/api/orders/+server.ts`
13. `src/routes/api/kitchen/orders/+server.ts`
14. `src/routes/api/delivery/orders/+server.ts`

## Testing Commands

After implementation:
```bash
npm run check      # Type checking
npm run lint       # ESLint
npm run test:unit  # Unit tests
npm run db:push    # Apply schema changes
```

## Implementation Notes

### Date/Time Handling
- Use HTML5 `datetime-local` input for user-friendly selection
- Convert to ISO string for API
- Store as timestamp in database
- Format nicely for display

### Address Display
- Show in kitchen/delivery views prominently
- Optional field, so handle null/undefined gracefully
- No validation required (free text)

### Comment Field
- Use textarea for multi-line input
- Display in all views for context
- Optional field, handle null/undefined gracefully

### Validation Rules
- Delivery date/time: Required, must be in the future
- Address: Optional, no validation
- Comment: Optional, no validation
- Customer name: Still required (existing)

## Priority Order
1. Database schema + migration
2. Type definitions
3. API updates (creation + retrieval)
4. CustomerInfo component
5. Order creation page
6. Order display components (OrderCard, detail pages)
7. Kitchen/Delivery views
8. Testing + validation

## Success Criteria
- [x] Orders can be created with delivery date/time (required)
- [x] Orders can be created with optional address and comment
- [x] All order views display the new information appropriately
- [x] Database migration completes successfully
- [x] All existing functionality remains intact
- [x] No TypeScript errors
- [x] All tests pass