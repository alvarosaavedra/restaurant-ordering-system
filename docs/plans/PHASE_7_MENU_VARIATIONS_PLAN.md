# Phase 7: Menu Item Variations & Modifiers - Implementation Plan

**Status:** 🟡 In Progress  
**Started:** Feb 8, 2026  
**Estimated Duration:** 15-20 hours  
**Priority:** 🔴 Critical

---

## Overview

This phase implements a comprehensive menu customization system supporting:
- **Variations**: Mutually exclusive choices (e.g., Meat vs Chicken, cooked to preference)
- **Modifiers**: Optional add-ons that can be applied to multiple menu items (e.g., Extra Wasabi, Extra Cheese)
- **Modifier Groups**: Categories with constraints (e.g., "Choose up to 3 toppings")

---

## Database Schema

### New Tables

```typescript
// 1. variation_group - Groups for mutually exclusive choices
{
  id: string (PK)
  menuItemId: string (FK → menu_item.id)
  name: string (e.g., "Protein Choice", "Cooking Preference")
  displayOrder: integer
  isRequired: boolean
  minSelections: integer (default: 1)
  maxSelections: integer (default: 1)
}

// 2. variation - Individual options within a group
{
  id: string (PK)
  groupId: string (FK → variation_group.id)
  name: string (e.g., "Chicken", "Beef", "Rare", "Medium")
  priceAdjustment: real (can be positive, negative, or zero)
  isDefault: boolean
  displayOrder: integer
}

// 3. modifier_group - Reusable modifier categories
{
  id: string (PK)
  name: string (e.g., "Extra Toppings", "Sauces")
  displayOrder: integer
  minSelections: integer (default: 0)
  maxSelections: integer (default: null = unlimited)
}

// 4. modifier - Individual modifiers
{
  id: string (PK)
  groupId: string (FK → modifier_group.id)
  name: string (e.g., "Extra Wasabi", "Extra Cheese")
  price: real
  isAvailable: boolean
  displayOrder: integer
}

// 5. menu_item_modifier_group - Links modifier groups to menu items
{
  menuItemId: string (FK → menu_item.id)
  modifierGroupId: string (FK → modifier_group.id)
  isRequired: boolean
  minSelections: integer
  maxSelections: integer
}

// 6. order_item_variation - Stores selected variations per order
{
  id: string (PK)
  orderItemId: string (FK → order_item.id)
  variationGroupId: string (FK → variation_group.id)
  variationId: string (FK → variation.id)
}

// 7. order_item_modifier - Stores selected modifiers per order
{
  id: string (PK)
  orderItemId: string (FK → order_item.id)
  modifierId: string (FK → modifier.id)
  quantity: integer
  priceAtOrder: real (snapshot of price when ordered)
}
```

### Indexes
- `variation_group.menu_item_id` - Fast lookup of item variations
- `variation.group_id` - Fast lookup of group variations
- `modifier.group_id` - Fast lookup of group modifiers
- `menu_item_modifier_group.menu_item_id` - Fast lookup of item modifiers
- `order_item_variation.order_item_id` - Fast lookup of item variations
- `order_item_modifier.order_item_id` - Fast lookup of item modifiers

---

## Implementation Tasks

### ✅ Task 7.1: Database Migration (1.5 hours)
**Status:** ✅ Completed
**Completed:** Feb 8, 2026

- [x] Create all 7 new tables in `schema.ts`
  - `variation_group` - Groups for mutually exclusive choices
  - `variation` - Individual options within groups
  - `modifier_group` - Reusable modifier categories
  - `modifier` - Individual add-ons
  - `menu_item_modifier_group` - Links modifiers to menu items
  - `order_item_variation` - Stores selected variations per order
  - `order_item_modifier` - Stores selected modifiers per order
- [x] Add foreign key constraints with proper `onDelete` rules (cascade where appropriate)
- [x] Generate migration with `npm run db:generate`
  - Migration file: `drizzle/0004_lazy_the_hunter.sql`
- [x] Apply migration with `npm run db:push`
  - Database recreated with all new tables
- [x] Update type exports in schema.ts
  - Added all Insert* and Select types for new tables
- [x] Update types in `$lib/types/orders.ts`
  - Added extended types for variations and modifiers
  - Updated CartItem and CreateOrderForm types

**Files:**
- `src/lib/server/db/schema.ts`
- `src/lib/types/orders.ts`

---

### ⬜ Task 7.2: Admin - Variation Management (3 hours)
**Status:** ⬜ Not Started

**New UI Components:**
- [ ] `VariationGroupEditor.svelte` - CRUD for variation groups
- [ ] `VariationEditor.svelte` - CRUD for individual variations
- [ ] `VariationSelector.svelte` - Preview component

**Updates to Admin Menu Page:**
- [ ] Add "Variations" tab to menu management
- [ ] Update edit modal for menu items to include variation configuration
- [ ] Add drag-and-drop reordering for variations
- [ ] Show visual indicator for items with variations
- [ ] Display variation count in menu item cards

**Server Actions:**
- [ ] `addVariationGroup` - Create new variation group
- [ ] `updateVariationGroup` - Update group settings
- [ ] `deleteVariationGroup` - Delete group and all variations
- [ ] `addVariation` - Add variation to group
- [ ] `updateVariation` - Update variation details
- [ ] `deleteVariation` - Remove variation
- [ ] Validation: ensure one default per group, validate price adjustments

**Files:**
- `src/lib/components/admin/VariationGroupEditor.svelte`
- `src/lib/components/admin/VariationEditor.svelte`
- `src/lib/components/admin/VariationSelector.svelte`
- `src/routes/(app)/admin/menu/+page.svelte`
- `src/routes/(app)/admin/menu/+page.server.ts`

---

### ⬜ Task 7.3: Admin - Modifier Management (3 hours)
**Status:** ⬜ Not Started

**New UI Components:**
- [ ] `ModifierGroupEditor.svelte` - CRUD for modifier groups
- [ ] `ModifierEditor.svelte` - CRUD for modifiers
- [ ] `ModifierAssignment.svelte` - Link modifiers to menu items

**New Route:**
- [ ] `/admin/modifiers/+page.svelte` - Global modifier management
- [ ] `/admin/modifiers/+page.server.ts` - Server actions

**Features:**
- [ ] Create reusable modifier groups
- [ ] Add/remove modifiers within groups
- [ ] Assign modifier groups to menu items
- [ ] Configure min/max selections per assignment
- [ ] Set required vs optional for each assignment
- [ ] Drag-and-drop reordering

**Server Actions:**
- [ ] `addModifierGroup`, `updateModifierGroup`, `deleteModifierGroup`
- [ ] `addModifier`, `updateModifier`, `deleteModifier`
- [ ] `assignModifierGroup`, `updateAssignment`, `removeModifierGroup`

**Files:**
- `src/lib/components/admin/ModifierGroupEditor.svelte`
- `src/lib/components/admin/ModifierEditor.svelte`
- `src/lib/components/admin/ModifierAssignment.svelte`
- `src/routes/(app)/admin/modifiers/+page.svelte`
- `src/routes/(app)/admin/modifiers/+page.server.ts`

---

### ⬜ Task 7.4: Order Taking - Variation & Modifier Selection (4 hours)
**Status:** ⬜ Not Started

**New Components:**
- [ ] `ItemCustomizationModal.svelte` - Main modal for customization
- [ ] `VariationSelector.svelte` - Radio buttons/dropdowns for variations
- [ ] `ModifierSelector.svelte` - Checkboxes with quantity controls
- [ ] `CustomizationSummary.svelte` - Display selected options

**Cart Store Updates:**
- [ ] Extend `CartItem` interface with variations and modifiers
- [ ] Add methods: `addItemWithCustomization`, `updateCustomization`
- [ ] Calculate dynamic pricing with all adjustments
- [ ] Support editing customization in cart

**Updates to Order Taking Page:**
- [ ] Detect when menu item has variations/modifiers
- [ ] Open customization modal instead of direct add
- [ ] Pre-select default variations
- [ ] Show customization summary in cart
- [ ] Display price breakdown showing adjustments
- [ ] Allow editing customization from cart

**Files:**
- `src/lib/components/ItemCustomizationModal.svelte`
- `src/lib/components/VariationSelector.svelte`
- `src/lib/components/ModifierSelector.svelte`
- `src/lib/components/CustomizationSummary.svelte`
- `src/lib/stores/cart.ts`
- `src/routes/(app)/orders/new/+page.svelte`

---

### ⬜ Task 7.5: Order API Updates (2 hours)
**Status:** ⬜ Not Started

**Update Create Order Endpoint:**
- [ ] Extend request body to accept variations and modifiers
- [ ] Validate required variations are selected
- [ ] Calculate correct total with all adjustments
- [ ] Save to `order_item_variation` table
- [ ] Save to `order_item_modifier` table
- [ ] Store `priceAtOrder` snapshot for modifiers

**Update Order Loading:**
- [ ] Include variations when fetching order items
- [ ] Include modifiers when fetching order items
- [ ] Eager load all customization data in single query

**Update Order Types:**
- [ ] Extend `OrderWithItems` to include variations and modifiers
- [ ] Update `CreateOrderForm` type

**Files:**
- `src/routes/api/orders/+server.ts`
- `src/lib/types/orders.ts`

---

### ⬜ Task 7.6: Kitchen & Delivery View Updates (2 hours)
**Status:** ⬜ Not Started

**Order Display Updates:**
- [ ] Show variations inline with item name
  - Format: "Item Name - Variation 1, Variation 2"
- [ ] Show modifiers as indented bullet list
  - Format: "• Modifier Name x{quantity} (+${price})"
- [ ] Calculate and display adjusted item price
- [ ] Preserve formatting for printing

**Components to Update:**
- [ ] `OrderCard.svelte` - Display customizations
- [ ] `OrderDetail.svelte` - Full customization view

**Pages to Update:**
- [ ] `/routes/(app)/kitchen/+page.svelte`
- [ ] `/routes/(app)/delivery/+page.svelte`
- [ ] `/routes/(app)/orders/[id]/+page.svelte`

---

### ⬜ Task 7.7: Reports & Analytics (1.5 hours)
**Status:** ⬜ Not Started

**Update Menu Reports:**
- [ ] Include variation popularity in sales reports
- [ ] Track modifier attachment rates
- [ ] Show revenue breakdown: base items vs variations vs modifiers
- [ ] Most popular variation combinations

**Files:**
- `src/lib/server/reports/menu-reports.ts`
- `src/routes/(app)/admin/reports/menu/+page.svelte`

---

### ⬜ Task 7.8: Testing (2 hours)
**Status:** ⬜ Not Started

**Unit Tests:**
- [ ] Price calculation with variations and modifiers
- [ ] Cart store customization methods
- [ ] Variation selection validation
- [ ] Modifier quantity limits

**E2E Tests:**
- [ ] Full order flow with variations
- [ ] Modifier selection and quantity adjustment
- [ ] Kitchen view display verification
- [ ] Admin CRUD operations for variations
- [ ] Admin CRUD operations for modifiers
- [ ] Historical order preservation

**Files:**
- `src/lib/stores/cart.spec.ts`
- `e2e/variations.spec.ts`
- `e2e/modifiers.spec.ts`

---

## User Experience Flow

### Admin Setup Flow
1. Navigate to Menu Management
2. Select menu item (e.g., "Teriyaki Bowl" - $12)
3. Click "Manage Variations" tab
4. Add Variation Group: "Protein"
   - Add "Chicken" (default, +$0)
   - Add "Beef" (+$2)
   - Add "Tofu" (-$1)
5. Navigate to Modifiers Management
6. Create Modifier Group: "Extras"
   - Add "Extra Wasabi" ($0.50)
   - Add "Extra Rice" ($1.00)
7. Assign "Extras" to Teriyaki Bowl
   - Set max selections: 3
   - Set as optional

### Order Taking Flow
1. Staff clicks "Teriyaki Bowl"
2. **Customization Modal Opens:**
   ```
   ┌─────────────────────────────────────┐
   │ Customize Teriyaki Bowl      $12.00 │
   ├─────────────────────────────────────┤
   │ Protein (Required)                  │
   │ ○ Chicken (default)                 │
   │ ● Beef (+$2.00)                     │
   │ ○ Tofu (-$1.00)                     │
   │                                     │
   │ Extras (Choose up to 3)             │
   │ ☑ Extra Wasabi (+$0.50)  [+][2][-]  │
   │ ☐ Extra Rice (+$1.00)               │
   │                                     │
   │ Total: $14.00                       │
   │ [Cancel]              [Add to Order]│
   └─────────────────────────────────────┘
   ```
3. Staff selects Beef + 2x Extra Wasabi
4. Added to cart with full customization

### Kitchen View Display
```
Order #1234 - 2:30 PM
─────────────────────────────
Teriyaki Bowl
  • Beef (+$2.00)
  • Extra Wasabi x2 (+$1.00)
  $14.00

2x Sushi Roll
  $16.00
─────────────────────────────
Total: $30.00
```

---

## Pricing Strategy

### Calculation Formula
```
Item Total = Base Price
           + Sum of selected variation priceAdjustments
           + Sum of (modifier price × quantity)
```

### Examples

**Example 1: Teriyaki Bowl**
- Base: $12.00
- Beef (+$2.00)
- 2x Extra Wasabi (2 × $0.50 = $1.00)
- **Total: $15.00**

**Example 2: Burger with Discount**
- Base: $10.00
- Tofu Patty (-$2.00)
- Extra Cheese ($1.00)
- **Total: $9.00**

### Historical Accuracy
- Store `priceAtOrder` for each modifier in order
- Protects against price changes after order is placed
- Allows accurate revenue reporting

---

## Technical Considerations

### Performance
- Eager load variations/modifiers with menu items
- Use indexes on all foreign keys
- Cache modifier groups (rarely change)
- Debounce quantity updates in UI

### Data Integrity
- Cascading deletes for variations when menu item deleted
- Prevent deletion of modifiers assigned to active orders
- Validation at database and application level
- Soft delete for modifiers to preserve order history

### Accessibility
- Full keyboard navigation for variation selection
- ARIA labels for modifier quantities
- Screen reader announcements for price changes
- Focus management in modal

### Mobile Optimization
- Touch-friendly radio buttons and checkboxes
- Swipe gestures for quantity adjustment
- Collapsible sections for long modifier lists
- Bottom sheet instead of modal on mobile

---

## Success Criteria

### Must Have
- [ ] Variation groups support single and multiple selections
- [ ] Modifiers are reusable across menu items
- [ ] Modifier groups support min/max constraints
- [ ] Order total correctly calculates all adjustments
- [ ] Kitchen view displays customizations clearly
- [ ] Admin can configure without code changes
- [ ] Historical orders preserve original selections and prices
- [ ] All existing orders continue to work

### Should Have
- [ ] Default variation pre-selection
- [ ] Real-time price updates in UI
- [ ] Popular combinations quick-select
- [ ] Modifier categories/groups in UI
- [ ] Bulk assignment of modifiers to items

### Nice to Have
- [ ] AI-powered variation suggestions
- [ ] Conditional variations (show only if X selected)
- [ ] Time-based variations (lunch vs dinner options)
- [ ] Inventory tracking for modifiers

---

## Progress Tracking

| Task | Status | Started | Completed | Notes |
|------|--------|---------|-----------|-------|
| 7.1 Database Migration | ✅ | Feb 8, 2026 | Feb 8, 2026 | All 7 tables created, migration applied |
| 7.2 Admin - Variation Management | ⬜ | - | - | |
| 7.3 Admin - Modifier Management | ⬜ | - | - | |
| 7.4 Order Taking - Selection | ⬜ | - | - | |
| 7.5 Order API Updates | ⬜ | - | - | |
| 7.6 Kitchen & Delivery Views | ⬜ | - | - | |
| 7.7 Reports & Analytics | ⬜ | - | - | |
| 7.8 Testing | ⬜ | - | - | |

**Overall Progress:** 1/8 tasks (12.5%)

---

## Related Documents

- `AGENTS.md` - Development guidelines
- `docs/plans/ADMIN_MENU_MGMT_PLAN.md` - Menu management overview
- `docs/plans/ORDER_ENHANCEMENT_PLAN.md` - Order system enhancements
- `docs/DIAGRAMS.md` - System architecture diagrams

---

## Notes

- All new components should use Svelte 5 runes syntax
- Follow existing code style and conventions
- Run `npm run check` and `npm run lint` after each task
- Test on different screen sizes (tablet is primary use case)
- Consider that kitchen staff may be wearing gloves - large touch targets
