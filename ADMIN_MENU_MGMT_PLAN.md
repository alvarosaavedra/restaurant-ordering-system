# Admin Menu Management - Implementation Plan

## Overview
Add a full-featured admin interface for managing menu items and categories, accessible only to users with the `admin` role. Uses SvelteKit server actions and load functions (no separate API endpoints).

## Progress
- **Phase 1**: Admin Menu Management Page (Backend) ✅ COMPLETE
- **Phase 2**: Admin Menu Management Page (Frontend) ⏳ TODO
- **Phase 3**: UI Components ⏳ TODO
- **Phase 4**: Type Definitions ⏳ TODO
- **Phase 5**: Navigation Update ⏳ TODO

---

## Implementation Phases

### Phase 1: Admin Menu Management Page (Backend) ✅

**File: `/src/routes/(app)/admin/menu/+page.server.ts`** - **COMPLETE**

#### Load Function
- Fetch all menu items with category details
- Fetch all categories
- Admin role validation (return 403 if not admin)

#### Server Actions
1. **addMenuItem** - Create new menu item
   - Validate: name, category_id, price (required)
   - Optional: description, is_available
   - Return success/error

2. **updateMenuItem** - Update existing menu item
   - Accept menu item ID and updated fields
   - Validate all inputs
   - Return success/error

3. **deleteMenuItem** - Delete menu item
   - Accept menu item ID
   - Delete from database
   - Return success/error

4. **addCategory** - Create new category
   - Validate: name (required)
   - Auto-calculate display_order (max + 1)
   - Return success/error

5. **updateCategory** - Update category
   - Accept category ID and updated fields
   - Return success/error

6. **deleteCategory** - Delete category
   - Accept category ID
   - Check for associated menu items (prevent deletion if exists)
   - Return success/error

---

### Phase 2: Admin Menu Management Page (Frontend)

**File: `/src/routes/(app)/admin/menu/+page.svelte`**

#### Layout Structure
- Header with "Menu Management" title
- Tab navigation: "Menu Items" (default) | "Categories"
- Add new item/category buttons

#### Menu Items Tab
- Grid/list of menu items showing:
  - Name, description, price, category, availability status
  - Edit button (opens modal/form)
  - Delete button (with confirmation)
- Search/filter functionality
- "Add Menu Item" modal with form:
  - Name (text input, required)
  - Description (textarea, optional)
  - Price (number input, required)
  - Category (dropdown, required)
  - Available (toggle, default true)

#### Categories Tab
- List of categories showing:
  - Name, display order, item count
  - Edit button
  - Delete button (with warning if has items)
- "Add Category" modal with form:
  - Name (text input, required)
  - Display Order (number input, auto-populated)

#### State Management
- `currentTab`: 'menu-items' | 'categories'
- `showAddModal`: boolean
- `showEditModal`: boolean
- `showDeleteConfirm`: boolean
- `selectedItem/Category`: object for edit/delete
- `formData`: form state for add/edit

---

### Phase 3: UI Components

#### 3.1 Select Component
**File: `/src/lib/components/ui/Select.svelte`**

Props:
- `id` (string)
- `name` (string)
- `value` (bindable)
- `options` (array of {value, label})
- `placeholder` (string)
- `required` (boolean)
- `disabled` (boolean)
- `error` (string)
- `onchange` (function)

Features:
- Dropdown styling matches existing Input/Button
- Error state display
- Accessibility (aria attributes)

---

#### 3.2 MenuItemCard Component
**File: `/src/lib/components/MenuItemCard.svelte`**

Props:
- `item` (MenuItemWithCategory)
- `onEdit` (function)
- `onDelete` (function)

Display:
- Item name (bold)
- Description (truncated)
- Price (formatted)
- Category badge
- Availability indicator (green dot for available, red for unavailable)
- Edit/Delete action buttons

---

#### 3.3 CategoryCard Component
**File: `/src/lib/components/CategoryCard.svelte`**

Props:
- `category` (Category with item count)
- `onEdit` (function)
- `onDelete` (function)

Display:
- Category name
- Display order
- Item count badge
- Edit/Delete action buttons

---

#### 3.4 Modal Component (if needed)
**File: `/src/lib/components/Modal.svelte`**

Props:
- `open` (boolean)
- `title` (string)
- `onClose` (function)
- `children` (snippet)

Features:
- Backdrop blur
- Centered card
- Close button (X in corner)
- Click outside to close

---

### Phase 4: Type Definitions

**Update: `/src/lib/types/orders.ts`**

Add new types:
```typescript
export type MenuItemForm = {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isAvailable?: boolean;
};

export type CategoryForm = {
  name: string;
  displayOrder?: number;
};

export type AdminTab = 'menu-items' | 'categories';
```

---

### Phase 5: Navigation Update

**Update: `/src/routes/(app)/+layout.svelte`**

Add admin navigation link (lines ~155, after Delivery):
```svelte
<!-- Admin -->
{#if user.role === 'admin'}
  <a
    href="/admin/menu"
    class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] {
      isActive('/admin/menu')
        ? 'bg-primary-100 text-primary-700 shadow-sm'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }"
    role="menuitem"
    aria-current={isActive('/admin/menu') ? 'page' : undefined}
  >
    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    Admin
  </a>
{/if}
```

---

## File Structure Summary

```
src/
├── routes/
│   ├── (app)/
│   │   ├── +layout.svelte (UPDATE: add admin nav link)
│   │   └── admin/
│   │       └── menu/
│   │           ├── +page.svelte (NEW: admin UI)
│   │           └── +page.server.ts (✅ COMPLETE: load + actions)
│   └── api/ (NO admin routes needed!)
├── lib/
│   ├── components/
│   │   ├── ui/
│   │   │   └── Select.svelte (NEW)
│   │   ├── MenuItemCard.svelte (NEW)
│   │   ├── CategoryCard.svelte (NEW)
│   │   └── Modal.svelte (NEW, optional)
│   └── types/
│       └── orders.ts (UPDATE: add form types)
```

---

## Implementation Order

1. **Type definitions** - Add form types to `orders.ts`
2. **Select component** - Create dropdown for category selection
3. **Server page** - Create `+page.server.ts` with load and actions ✅
4. **Card components** - Create MenuItemCard and CategoryCard
5. **Main page** - Create `+page.svelte` with tabs, modals, and forms
6. **Navigation** - Update `+layout.svelte` to add admin link
7. **Testing** - Run linter, typecheck, and manual testing

---

## Server Actions Pattern

### Load Function
```typescript
export const load = async ({ locals }) => {
  if (locals.user?.role !== 'admin') {
    error(403, 'Unauthorized');
  }

  const menuItems = await db.select().from(menuItem)...
  const categories = await db.select().from(category)...

  return { menuItems, categories };
};
```

### Actions
```typescript
export const actions = {
  addMenuItem: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const price = formData.get('price');
    // ... validation and insertion
    return { success: true };
  }
};
```

### Usage in Component
```svelte
<script lang="ts">
  let { data, form } = $props();

  let showAddModal = $state(false);
  let formData = $state({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    isAvailable: true
  });
</script>

<button onclick={() => showAddModal = true}>Add Menu Item</button>

{#if showAddModal}
  <Modal title="Add Menu Item" onClose={() => showAddModal = false}>
    <form method="POST" action="?/addMenuItem">
      <Input name="name" bind:value={formData.name} required />
      <Select name="categoryId" options={data.categories} required />
      <!-- ... -->
    </form>
  </Modal>
{/if}

{#if form?.success}
  <Toast message="Menu item added!" />
{/if}
```

---

## Security Considerations

✅ Role-based access control (admin only) in load function
✅ Input validation on server side
✅ SQL injection prevention (Drizzle ORM)
✅ CSRF protection (built into server actions)
✅ Proper error messages (don't leak sensitive info)
✅ Prevent deletion of categories with items

---

## Testing Checklist

- [ ] Admin can access `/admin/menu`
- [x] Non-admin users get 403 error (implemented in load function)
- [ ] Can add menu item with valid data
- [ ] Validation errors show for invalid data
- [ ] Can edit existing menu item
- [ ] Can delete menu item with confirmation
- [ ] Can add category
- [ ] Can edit category
- [ ] Cannot delete category with menu items
- [ ] Menu items update immediately in Order page
- [ ] Run `npm run lint` - no errors
- [x] Run `npm run check` - no type errors (passed)

---

## Notes

- Uses SvelteKit server actions (no separate API routes)
- Leverages SSR for initial data load
- Follows existing code patterns (runes, $state, $props, $derived)
- Reuses existing UI components (Button, Card, Input)
- Consistent styling with Tailwind CSS v4
