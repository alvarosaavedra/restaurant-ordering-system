# Restaurant Ordering System - Implementation Plan

## Priority Overview

This plan addresses all missing features from the MVP, organized by criticality and dependencies.

### Priority Levels
- 🔴 **Critical** - Core functionality, must have for MVP
- 🟡 **High** - Important for user experience
- 🟢 **Medium** - Nice to have, polish phase

---

## Phase 1: Order History & Dashboard (🔴 Critical) ✅ COMPLETED

### Task 1.1: Order History Page (`/orders`)
**Priority:** 🔴 Critical  
**Estimated Time:** 2-3 hours  
**Dependencies:** None

#### Requirements:
- Display all orders with filtering and sorting
- Search by customer name
- Filter by status (pending, preparing, ready, delivered)
- Sort by date (newest/oldest)
- Show order details in expandable cards or modal
- Show order status badges
- Pagination if many orders

#### Implementation Steps:
1. Create `/routes/(app)/orders/+page.server.ts`
   - Fetch all orders with employee info
   - Support filtering query params
   - Support sorting query params
   - Add pagination logic

2. Update `/routes/(app)/orders/+page.svelte`
   - Add search input for customer name
   - Add status filter dropdown
   - Add sort dropdown (newest/oldest)
   - Display order cards with status badges
   - Add expandable details or modal for order items
   - Add loading states
   - Add empty state

3. Create `/routes/(app)/orders/[id]/+page.server.ts`
   - Fetch single order with all details
   - Include order items with menu items

4. Create `/routes/(app)/orders/[id]/+page.svelte`
   - Display full order details
   - Show customer info
   - Show all items with quantities
   - Show timestamps
   - Navigation back to history

### Task 1.2: Enhanced Dashboard (`/`)
**Priority:** 🟡 High  
**Estimated Time:** 1.5-2 hours  
**Dependencies:** None

#### Requirements:
- Quick order statistics (counts by status)
- Recent orders preview
- Role-based quick actions
- System status indicators

#### Implementation Steps:
1. Create `/routes/(app)/+page.server.ts`
   - Count orders by status
   - Fetch recent orders (last 5)
   - Fetch current user info

2. Update `/routes/(app)/+page.svelte`
   - Add statistics cards (pending, preparing, ready, delivered)
   - Add recent orders section
    - Enhance quick actions based on role
    - Improve visual design

#### Status: ✅ COMPLETED (Jan 19, 2026)
- Order history page with search, filter, sort, and pagination
- Order detail page with full information
- Enhanced dashboard with statistics cards
- Recent orders preview
- Role-based quick actions
- Fixed all Svelte 5 state reference warnings

---

## Phase 2: UX Improvements (🟡 High) ✅ COMPLETED

### Task 2.1: Toast Notification System
**Priority:** 🔴 Critical
**Estimated Time:** 1-2 hours
**Dependencies:** None

#### Requirements:
- Replace `alert()` calls with toast notifications
- Success, error, info, warning types
- Auto-dismiss after configurable time
- Stacked notifications
- Animation in/out

#### Implementation Steps:
1. Create `/lib/components/Toast.svelte`
    - Accept message and type props
    - Auto-dismiss logic
    - Animation transitions
    - Close button

2. Create `/lib/components/ToastContainer.svelte`
    - Manage multiple toasts
    - Handle positioning
    - Manage z-index layer

3. Create `/lib/stores/toast.ts`
    - Store for toast state
    - Actions: `success()`, `error()`, `info()`, `warning()`

4. Create `/lib/utils/toast.ts`
    - Helper functions for showing toasts
    - Export simple API

5. Update all pages to use toasts:
    - `/orders/new/+page.svelte` - Replace alert() on order creation
    - `/lib/components/OrderCard.svelte` - Replace alert() on status update

### Task 2.2: Loading States
**Priority:** 🟡 High
**Estimated Time:** 1 hour
**Dependencies:** None

#### Requirements:
- Skeleton loaders for lists
- Loading spinners for actions
- Disabled button states during loading
- Optimistic UI updates where appropriate

#### Implementation Steps:
1. Create `/lib/components/ui/Spinner.svelte`
    - Simple CSS spinner animation

2. Create `/lib/components/ui/Skeleton.svelte`
    - Skeleton card component
    - Skeleton text component

3. Update pages with loading states:
    - `/orders/new/+page.svelte` - Button loading on submit
    - `/orders/+page.svelte` - Skeleton while fetching
    - `/kitchen/+page.svelte` - Skeleton cards
    - `/delivery/+page.svelte` - Skeleton cards
    - `/lib/components/OrderCard.svelte` - Button loading on status update

### Task 2.3: Error Handling & Validation
**Priority:** 🔴 Critical
**Estimated Time:** 1.5 hours
**Dependencies:** Toast system

#### Requirements:
- Server-side error messages display
- Form validation with error states
- Graceful error fallbacks
- Error boundaries for component failures

#### Implementation Steps:
1. Update API endpoints to return structured errors:
    - `/api/orders/+server.ts` - Better error messages
    - `/api/orders/[id]/status/+server.ts` - Better error messages

2. Update form components:
    - `/lib/components/CustomerInfo.svelte` - Validation errors
    - `/lib/components/ui/Input.svelte` - Error state styles

3. Update pages to handle errors:
    - `/orders/new/+page.svelte` - Show error toasts
    - `/orders/+page.svelte` - Error state display

#### Status: ✅ COMPLETED (Jan 19, 2026)
- Toast notification system with success/error/info/warning types
- Auto-dismiss after configurable time
- Stacked notifications with animations
- ToastContainer added to app layout
- Spinner component with sm/md/lg sizes
- Skeleton components (default and circle variants)
- SkeletonCard component for order loading states
- Loading state on Create Order button with spinner
- Error prop and error state styles added to Input.svelte
- Validation errors in CustomerInfo.svelte (name required, phone format)
- All alert() calls replaced with toast notifications
- API endpoints with structured error messages
- Svelte 5 store pattern used for toast state

---

## Phase 3: Real-time Updates (🟡 High)

### Task 3.1: Auto-refresh Kitchen & Delivery Views
**Priority:** 🟡 High  
**Estimated Time:** 1-2 hours  
**Dependencies:** None

#### Requirements:
- Kitchen view auto-refresh every 30 seconds
- Delivery view auto-refresh every 30 seconds
- Manual refresh button
- Show last updated timestamp

#### Implementation Steps:
1. Update `/routes/(app)/kitchen/+page.svelte`
   - Add `setInterval` for auto-refresh
   - Add refresh button
   - Show last updated time
   - Clear interval on unmount

2. Update `/routes/(app)/delivery/+page.svelte`
   - Same as kitchen

3. Create `/lib/utils/refresh.ts`
   - Reusable auto-refresh hook

### Task 3.2: Optimistic UI Updates
**Priority:** 🟢 Medium  
**Estimated Time:** 1 hour  
**Dependencies:** Status update functionality

#### Requirements:
- Update UI immediately on action
- Revert on error
- Show loading state during server request

#### Implementation Steps:
1. Update `/lib/components/OrderCard.svelte`
   - Optimistic status update
   - Revert on error
   - Loading button state

2. Update `/routes/(app)/kitchen/+page.svelte`
   - Optimistic order removal

3. Update `/routes/(app)/delivery/+page.svelte`
   - Optimistic order removal

---

## Phase 4: Accessibility & Mobile (🟢 Medium)

### Task 4.1: Accessibility Improvements
**Priority:** 🟢 Medium  
**Estimated Time:** 2-3 hours  
**Dependencies:** None

#### Requirements:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels

#### Implementation Steps:
1. Audit all components for accessibility
2. Add ARIA labels where missing
3. Ensure keyboard navigation works
4. Test with screen reader
5. Add focus indicators
6. Color contrast check

### Task 4.2: Mobile Responsiveness
**Priority:** 🟡 High  
**Estimated Time:** 1.5-2 hours  
**Dependencies:** None

#### Requirements:
- Tablet-optimized layouts
- Touch-friendly buttons (min 44x44px)
- Responsive grid layouts
- Mobile navigation

#### Implementation Steps:
1. Test all pages on tablet/mobile
2. Adjust breakpoints and grid layouts
3. Increase button tap targets
4. Optimize touch interactions
5. Test on actual devices if possible

---

## Phase 5: Testing (🟡 High)

### Task 5.1: Component Unit Tests
**Priority:** 🟡 High  
**Estimated Time:** 3-4 hours  
**Dependencies:** None

#### Requirements:
- Test all UI components
- Test utility functions
- Test stores

#### Implementation Steps:
1. Create `/lib/components/ui/Button.svelte.spec.ts`
2. Create `/lib/components/ui/Input.svelte.spec.ts`
3. Create `/lib/components/ui/Card.svelte.spec.ts`
4. Create `/lib/components/OrderCard.svelte.spec.ts`
5. Create `/lib/components/MenuItem.svelte.spec.ts`
6. Create `/lib/components/CustomerInfo.svelte.spec.ts`
7. Create `/lib/components/StatusBadge.svelte.spec.ts`

### Task 5.2: E2E Tests
**Priority:** 🟡 High  
**Estimated Time:** 4-5 hours  
**Dependencies:** All features complete

#### Requirements:
- Complete user workflows
- Multi-role testing
- Error scenario testing

#### Implementation Steps:
1. Create `/e2e/auth.spec.ts`
   - Login flow
   - Logout flow
   - Route protection

2. Create `/e2e/order-taking.spec.ts`
   - Create order flow
   - Add items to cart
   - Submit order
   - Validation errors

3. Create `/e2e/kitchen.spec.ts`
   - View pending orders
   - Update to preparing
   - Update to ready

4. Create `/e2e/delivery.spec.ts`
   - View ready orders
   - Mark as delivered

5. Create `/e2e/order-history.spec.ts`
   - View all orders
   - Filter by status
   - Search orders
   - View order details

### Task 5.3: Run Linting & Type Checking
**Priority:** 🔴 Critical  
**Estimated Time:** 0.5 hours  
**Dependencies:** All code changes

#### Implementation Steps:
1. Run `npm run lint` - Fix all issues
2. Run `npm run check` - Fix all type errors
3. Fix all @ts-ignore comments in production code

---

## Phase 6: Performance & Polish (🟢 Medium)

### Task 6.1: Performance Optimization
**Priority:** 🟢 Medium  
**Estimated Time:** 1-2 hours  
**Dependencies:** All features complete

#### Requirements:
- Optimize bundle size
- Lazy load non-critical components
- Optimize images if any
- Reduce re-renders

#### Implementation Steps:
1. Run bundle analyzer
2. Code splitting where beneficial
3. Optimize database queries
4. Add caching headers

### Task 6.2: Visual Polish
**Priority:** 🟢 Medium  
**Estimated Time:** 1-2 hours  
**Dependencies:** All features complete

#### Requirements:
- Consistent spacing
- Smooth transitions
- Professional design
- Empty states
- Error states

#### Implementation Steps:
1. Add empty states to all pages
2. Improve error state displays
3. Add smooth page transitions
4. Check color consistency
5. Add subtle hover effects

---

## Implementation Order

### Sprint 1 (Core Functionality - Critical)
1. ✅ Task 2.1: Toast Notification System
2. ✅ Task 1.1: Order History Page
3. ✅ Task 1.2: Enhanced Dashboard
4. ✅ Task 2.3: Error Handling & Validation
5. ✅ Task 2.2: Loading States
6. ✅ Task 5.3: Run Linting & Type Checking

**Estimated Time:** 6-8 hours

### Sprint 2 (UX Improvements - High Priority)
- ⬜ Task 3.1: Auto-refresh Views
- ⬜ Task 3.2: Optimistic UI Updates
- ⬜ Task 4.2: Mobile Responsiveness

**Estimated Time:** 4-6 hours

### Sprint 3 (Testing - High Priority)
- ⬜ Task 5.1: Component Unit Tests
- ⬜ Task 5.2: E2E Tests

**Estimated Time:** 7-9 hours

### Sprint 4 (Polish - Medium Priority)
- ⬜ Task 4.1: Accessibility Improvements
- ⬜ Task 6.1: Performance Optimization
- ⬜ Task 6.2: Visual Polish

**Estimated Time:** 4-7 hours

---

## Total Estimated Time: 21-30 hours

---

## Success Criteria

### Must Have (Critical)
- ✅ Order history page with filtering, sorting, and search
- ✅ Enhanced dashboard with statistics
- ✅ Toast notification system replacing all alerts
- ✅ Proper error handling throughout
- ✅ Loading states for all async operations (components created)
- ✅ No lint or type errors

### Should Have (High Priority)
- ⬜ Auto-refresh for kitchen/delivery views
- ⬜ Mobile/tablet responsive design
- ⬜ Unit tests for components
- ⬜ E2E tests for critical workflows
- ⬜ Manual refresh buttons

### Nice to Have (Medium Priority)
- ⬜ WCAG 2.1 AA accessibility compliance
- ⬜ Performance optimization
- ⬜ Smooth animations and transitions
- ⬜ Comprehensive error states

---

## Notes

- All new components should use Svelte 5 runes
- Follow existing code style and conventions
- Run `npm run check` and `npm run lint` after each major change
- Test on different screen sizes
- Consider tablet use case (common for restaurant staff)
