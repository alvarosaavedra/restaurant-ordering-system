# UX/UI Visual Refresh Plan: "Warm Industrial Bakery"

## Context

### Original Request
The user wants to improve the visual design and navigation flow of the Restaurant Ordering System. This is a complete visual refresh to transform the current generic SaaS application into a warm, inviting, professional platform that reflects the artisanal nature of a restaurant business.

### Design Intent
**Aesthetic Direction:** "Warm Industrial Bakery" - Artisanal warmth meets digital efficiency. Think handcrafted quality with contemporary tech. Warm, tactile, inviting, with industrial touches.

### Current State Analysis

**Strengths:**
- Consistent spacing system with Tailwind
- Good accessibility foundation (ARIA labels, 44px touch targets, focus states)
- Glassmorphism effects for modern feel
- Card-based layouts with shadows and borders
- Responsive design with mobile-first approach
- Role-based UI with clear distinctions

**Weaknesses:**
- Generic color palette (blue/purple gradients lack food-app personality)
- Inter font is overused, lacks character for a restaurant brand
- Predictable layouts without surprise
- Limited depth in layered compositions
- Neutral dominance with too much gray
- Shadow inconsistency across elements
- Text gradients reduce readability
- Status badges have generic color choices

---

## Work Objectives

### Core Objective
Complete visual refresh of the Restaurant Ordering System with a warm, professional design that enhances user experience and reflects the artisanal nature of the restaurant business.

### Concrete Deliverables
- Updated Tailwind CSS configuration with new color palette and design tokens
- Google Fonts integration (DM Serif Display, Outfit, JetBrains Mono)
- Redesigned core components (Button, Input, Card, StatusBadge, Modal, MenuItemCard, OrderCard)
- New sidebar navigation structure with role-based menu items
- Responsive navigation patterns (sidebar, mobile bottom nav, collapsible drawer)
- Visual effects (grain overlay, warm glow, animations, custom scrollbar)
- Updated page designs (Dashboard, New Order, Order History, Kitchen, Delivery, Admin)

### Definition of Done
- [ ] All color contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] All components redesigned with new design system
- [ ] Sidebar navigation implemented with role-based menu items
- [ ] Mobile navigation (drawer + bottom nav) functional
- [ ] All pages updated with new design
- [ ] Animations and micro-interactions added
- [ ] Cross-browser testing passed (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility audit passed (keyboard navigation, screen readers)
- [ ] Performance metrics met (FCP < 1.5s, LCP < 2.5s, CLS < 0.1)

### Must Have
- New "Warm Industrial Bakery" color palette (terracotta, sage, warm neutrals)
- Sidebar navigation with role-based menu items
- Updated typography (DM Serif Display, Outfit, JetBrains Mono)
- Redesigned all core components with new design system
- Responsive navigation for mobile (drawer + bottom nav)
- WCAG AA accessibility compliance

### Must NOT Have (Guardrails)
- **NO blue/purple gradients** - These feel generic and unappetizing
- **NO Inter font** - Overused, lacks character
- **NO cool grays** - Only warm neutrals allowed
- **NO inconsistent shadows** - Standardize shadow scale
- **NO text gradients on body text** - Reduces readability
- **NO top navigation bar** - Sidebar navigation required
- **NO breaking existing functionality** - This is a visual refresh only

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES
- **User wants tests**: Tests-after (manual verification focus)
- **Framework**: Vitest (existing)

### QA Approach

Since this is primarily a visual redesign, the verification strategy focuses on manual testing:

**For Visual Changes:**
- [ ] Using playwright browser automation:
  - Navigate to each page (Dashboard, New Order, Orders, Kitchen, Delivery, Admin)
  - Verify color contrast with browser dev tools accessibility checker
  - Take screenshots for visual comparison
  - Verify responsive behavior at mobile (<640px), tablet (640-1024px), desktop (>1024px)
  - Test hover states, focus states, and click interactions
  - Save evidence to `.sisyphus/evidence/{task-id}-{page}.png`

**For Navigation Changes:**
- [ ] Manual verification:
  - Command: `npm run dev` (start dev server)
  - Test: Click each navigation item and verify page loads correctly
  - Test: Mobile drawer toggle and menu navigation
  - Test: Role-based menu visibility (login with different roles)
  - Test: Keyboard navigation (Tab through menu items)
  - Expected: All navigation works, role-based menus show correct items

**For Component Changes:**
- [ ] REPL verification:
  ```bash
  # Test component rendering
  npm run dev
  # Visit component storybook or pages using components
  # Verify all variants render correctly
  # Verify all states (default, hover, focus, disabled, error)
  ```

**For Performance:**
- [ ] Lighthouse audit:
  - Command: `npx lighthouse http://localhost:5173 --view`
  - Expected: Performance score > 90, Accessibility score > 95
  - Expected: FCP < 1.5s, LCP < 2.5s, CLS < 0.1

**Evidence Required:**
- [ ] Screenshots for each page (before/after comparison)
- [ ] Lighthouse audit reports
- [ ] Accessibility checker results
- [ ] Cross-browser test results
- [ ] Responsive design test screenshots at 3 breakpoints

---

## Task Flow

```
Phase 1 (Foundation) → Phase 2 (Core Components) → Phase 3 (Navigation)
                                                          ↓
                                           Phase 4 (Page Updates) → Phase 5 (Polish)
                                                                       ↓
                                                              Phase 6 (Testing)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 1.1, 1.2 | Independent config updates |
| B | 2.1, 2.2, 2.3 | Independent component redesigns |
| C | 3.1, 3.2, 3.3 | Sequential navigation implementation |
| D | 4.1, 4.2, 4.3 | Independent page updates |
| E | 5.1, 5.2 | Independent polish tasks |

| Task | Depends On | Reason |
|------|------------|--------|
| 3.1 | 2.1 | Sidebar navigation uses Button component |
| 4.1 | 3.1 | Dashboard uses new navigation |
| 4.2 | 3.1 | New Order page uses new navigation |

---

## TODOs

### Phase 1: Foundation (Day 1)

- [ ] 1.1. Update Tailwind configuration with new color palette

  **What to do:**
  - Update `tailwind.config.js` with bakery, sage, and neutral color scales
  - Add custom colors (bakery-50 to bakery-900, sage-50 to sage-900)
  - Add semantic colors (success, warning, error, info) with warm tones
  - Add custom font families (display, sans, mono)
  - Add custom spacing values (3: 12px, 12: 48px, 16: 64px)
  - Add custom border radius (sm: 6px, md: 10px, lg: 16px, xl: 24px)
  - Add custom box shadow (warm-glow: 0 4px 20px -4px rgba(182, 145, 102, 0.3))

  **Must NOT do:**
  - Add cool grays (only warm neutrals)
  - Add blue/purple colors
  - Break existing color tokens used in production

  **Parallelizable**: YES (with 1.2)

  **References**:
  - **Pattern References**: `tailwind.config.js` - Current Tailwind configuration structure
  - **API/Type References**: None
  - **Test References**: None
  - **Documentation References**: Tailwind CSS documentation (https://tailwindcss.com/docs/theme)
  - **External References**: Color contrast checker (https://webaim.org/resources/contrastchecker/)

  **WHY Each Reference Matters**:
  - `tailwind.config.js`: Shows current configuration structure to maintain while adding new colors
  - Tailwind docs: Reference for theme extension syntax
  - Contrast checker: Verify all color combinations meet WCAG AA standards

  **Acceptance Criteria**:
  - [ ] Tailwind config updated with 3 color scales (bakery, sage, neutral)
  - [ ] Custom font families added (display, sans, mono)
  - [ ] Custom spacing, border radius, and shadows added
  - [ ] `npm run dev` starts successfully
  - [ ] New color classes (e.g., `bg-bakery-500`) available in autocomplete

  **Commit**: YES
  - Message: `style(config): add warm industrial bakery color palette and design tokens`
  - Files: `tailwind.config.js`
  - Pre-commit: `npm run check` (type check)

- [ ] 1.2. Add Google Fonts and update base CSS

  **What to do:**
  - Add Google Fonts link to `src/app.html` (DM Serif Display, Outfit, JetBrains Mono)
  - Update `src/routes/layout.css` with base styles:
    - Import new fonts
    - Add CSS custom properties for colors
    - Add grain overlay utility class
    - Add scrollbar styling
    - Add button shine animation
    - Add slide-up animation keyframes
    - Add text selection styles
  - Add `-webkit-font-smoothing: antialiased` to body
  - Add `scroll-behavior: smooth` to html

  **Must NOT do:**
  - Remove existing Tailwind base styles
  - Break existing utility classes
  - Add excessive animations that impact performance

  **Parallelizable**: YES (with 1.1)

  **References**:
  - **Pattern References**: `src/app.html` - HTML template with head section
  - **Pattern References**: `src/routes/layout.css` - Base CSS file
  - **Documentation References**: Google Fonts documentation (https://fonts.google.com/)

  **WHY Each Reference Matters**:
  - `src/app.html`: Shows where to add Google Fonts link tag
  - `src/routes/layout.css`: Existing CSS structure to extend with new styles

  **Acceptance Criteria**:
  - [ ] Google Fonts link added to `src/app.html`
  - [ ] New font family classes available (`font-display`, `font-sans`, `font-mono`)
  - [ ] Grain overlay utility class defined
  - [ ] Custom scrollbar styling applied
  - [ ] Animation keyframes defined (slide-up)
  - [ ] `npm run dev` shows fonts loaded in browser
  - [ ] Lighthouse audit shows fonts loaded without blocking

  **Commit**: YES
  - Message: `style(assets): add Google Fonts and base CSS utilities`
  - Files: `src/app.html`, `src/routes/layout.css`
  - Pre-commit: `npm run lint` (lint check)

- [ ] 1.3. Update root layout with new fonts and base styles

  **What to do:**
  - Update `src/routes/+layout.svelte` to use new design system:
    - Apply new font family to html/body
    - Update gradient-bg class to use bakery colors
    - Update glass-effect class to use warm neutrals
    - Remove blue/purple gradient references
  - Ensure responsive meta tags are present
  - Verify ARIA landmarks are correct (nav, main, footer)

  **Must NOT do:**
  - Break existing layout structure
  - Remove accessibility features
  - Introduce layout shifts

  **Parallelizable**: NO (depends on 1.1, 1.2)

  **References**:
  - **Pattern References**: `src/routes/+layout.svelte` - Root layout component
  - **Pattern References**: `src/routes/(app)/+layout.svelte` - App layout with navigation

  **WHY Each Reference Matters**:
  - Root layout: Base HTML structure and styles for entire app
  - App layout: Navigation and main content area structure

  **Acceptance Criteria**:
  - [ ] New font family applied to body (Outfit)
  - [ ] Display font used for headings (DM Serif Display)
  - [ ] Blue/purple gradients removed
  - [ ] Bakery colors used for brand elements
  - [ ] No layout shifts
  - [ ] All pages load with correct fonts
  - [ ] Accessibility landmarks present

  **Commit**: YES
  - Message: `style(layout): apply new font system and remove blue gradients`
  - Files: `src/routes/+layout.svelte`
  - Pre-commit: `npm run check` (type check)

### Phase 2: Core Components (Day 2)

- [ ] 2.1. Redesign Button component with new design system

  **What to do:**
  - Update `src/lib/components/ui/Button.svelte`:
    - Add new variants (success, warning, ghost) alongside existing primary/secondary/danger
    - Update variant classes to use bakery colors:
      - primary: bakery-500 → bakery-600 on hover
      - secondary: neutral-100 background, neutral-700 text
      - success: success-500 → success-600
      - warning: warning-500 → warning-600
      - danger: error-500 → error-600
      - ghost: transparent background, bakery-700 text
    - Add hover effects: shadow-lg, -translate-y-1, warm-glow
    - Update focus states: ring-4 ring-bakery-200
    - Add loading state with spinner
    - Keep button-shine effect (update colors to bakery)
    - Ensure all variants have disabled states
    - Maintain min-h-[44px] for accessibility

  **Must NOT do:**
  - Remove existing functionality (variants, sizes, onclick)
  - Break accessibility (focus states, ARIA labels)
  - Remove button-shine effect (keep but update colors)

  **Parallelizable**: YES (with 2.2, 2.3)

  **References**:
  - **Pattern References**: `src/lib/components/ui/Button.svelte` - Current button implementation
  - **Pattern References**: Existing button usage in pages to ensure backward compatibility
  - **External References**: Tailwind CSS buttons guide (https://tailwindui.com/components/application-ui/buttons)

  **WHY Each Reference Matters**:
  - Current Button component: Understand existing API to maintain compatibility
  - Usage patterns: Ensure redesign works across all pages

  **Acceptance Criteria**:
  - [ ] All variants use bakery color palette
  - [ ] Hover effects include shadow and subtle lift
  - [ ] Focus states use warm ring colors
  - [ ] Loading state shows spinner
  - [ ] Disabled states use neutral colors
  - [ ] All existing button usages still work
  - [ ] Accessibility verified (keyboard focus, screen reader)
  - [ ] Visual regression: buttons look cohesive

  **Commit**: YES
  - Message: `style(button): redesign with bakery colors and warm hover effects`
  - Files: `src/lib/components/ui/Button.svelte`
  - Pre-commit: `npm run test:unit src/lib/components/ui/Button.svelte.spec.ts` (if exists)

- [ ] 2.2. Redesign Input component with new states

  **What to do:**
  - Update `src/lib/components/ui/Input.svelte`:
    - Update default state: neutral-200 border, neutral-500 text
    - Update focus state: ring-2 ring-bakery-500, border-bakery-500
    - Add error state: ring-2 ring-error-500, border-error-500
    - Add success state: ring-2 ring-success-500, border-success-500
    - Add disabled state: neutral-100 background, neutral-400 text
    - Update placeholder color to neutral-400
    - Keep min-h-[44px] for accessibility
    - Ensure smooth transitions on state changes
    - Add support for error message display

  **Must NOT do:**
  - Remove existing functionality (oninput, type, placeholder)
  - Break accessibility (labels, ARIA, keyboard)
  - Add excessive animations

  **Parallelizable**: YES (with 2.1, 2.3)

  **References**:
  - **Pattern References**: `src/lib/components/ui/Input.svelte` - Current input implementation
  - **Pattern References**: Input usage in `src/lib/components/CustomerInfo.svelte`
  - **External References**: Tailwind CSS form inputs (https://tailwindui.com/components/application-ui/forms/input-fields)

  **WHY Each Reference Matters**:
  - Current Input component: Understand existing API to maintain compatibility
  - Usage patterns: Ensure new states work with form validation

  **Acceptance Criteria**:
  - [ ] Default state uses neutral colors
  - [ ] Focus state uses bakery ring and border
  - [ ] Error state uses error colors
  - [ ] Success state uses success colors
  - [ ] Disabled state is clearly disabled
  - [ ] All existing input usages still work
  - [ ] Smooth transitions between states
  - [ ] Accessibility verified (labels, ARIA)

  **Commit**: YES
  - Message: `style(input): redesign states with warm color indicators`
  - Files: `src/lib/components/ui/Input.svelte`
  - Pre-commit: `npm run test:unit src/lib/components/ui/Input.svelte.spec.ts` (if exists)

- [ ] 2.3. Redesign Card component with new variants

  **What to do:**
  - Update `src/lib/components/ui/Card.svelte`:
    - Add variants: default, elevated, bordered, subtle
    - Default: white background, shadow-sm
    - Elevated: white background, shadow-md
    - Bordered: white background, border-neutral-200, no shadow
    - Subtle: neutral-50 background, no shadow
    - Add hover effect: shadow-md, -translate-y-1
    - Add active effect: shadow-sm, translate-y-0
    - Update border radius to rounded-lg (10px)
    - Ensure smooth transitions

  **Must NOT do:**
  - Remove existing functionality
  - Break card layouts
  - Add excessive shadows

  **Parallelizable**: YES (with 2.1, 2.2)

  **References**:
  - **Pattern References**: `src/lib/components/ui/Card.svelte` - Current card implementation
  - **Pattern References**: Card usage across all pages

  **WHY Each Reference Matters**:
  - Current Card component: Understand existing API to maintain compatibility
  - Usage patterns: Ensure variants work across all contexts

  **Acceptance Criteria**:
  - [ ] All variants defined with correct shadows
  - [ ] Hover effect adds lift
  - [ ] Active effect returns to neutral
  - [ ] Bordered variant has border but no shadow
  - [ ] Subtle variant uses neutral-50 background
  - [ ] All existing card usages still work
  - [ ] Visual consistency across app

  **Commit**: YES
  - Message: `style(card): add variants and refined shadow system`
  - Files: `src/lib/components/ui/Card.svelte`
  - Pre-commit: `npm run test:unit src/lib/components/ui/Card.svelte.spec.ts` (if exists)

- [ ] 2.4. Redesign StatusBadge component with warm status colors

  **What to do:**
  - Update `src/lib/components/StatusBadge.svelte`:
    - Update status colors to warm tones:
      - pending: warning-100 background, warning-700 text, warning-200 border
      - preparing: orange-100 background, orange-700 text, orange-200 border
      - ready: success-100 background, success-700 text, success-200 border
      - delivered: sage-100 background, sage-700 text, sage-200 border
    - Add pill shape (rounded-full)
    - Add subtle border for clarity
    - Ensure good contrast ratios (WCAG AA)

  **Must NOT do:**
  - Remove existing functionality
  - Use generic blue/green/red colors
  - Break accessibility

  **Parallelizable**: NO (depends on 2.1 for color availability)

  **References**:
  - **Pattern References**: `src/lib/components/StatusBadge.svelte` - Current badge implementation
  - **Pattern References**: Status badge usage in `src/routes/(app)/+page.svelte`

  **WHY Each Reference Matters**:
  - Current StatusBadge: Understand existing API to maintain compatibility
  - Usage patterns: Ensure new colors work in all contexts

  **Acceptance Criteria**:
  - [ ] All statuses use warm color palette
  - [ ] Contrast ratios meet WCAG AA
  - [ ] Pill shape applied
  - [ ] Subtle border added
  - [ ] All existing status usages still work
  - [ ] Visual hierarchy is clear

  **Commit**: YES
  - Message: `style(status-badge): update to warm status color palette`
  - Files: `src/lib/components/StatusBadge.svelte`
  - Pre-commit: `npm run test:unit src/lib/components/StatusBadge.svelte.spec.ts` (if exists)

### Phase 3: Navigation (Day 3)

- [ ] 3.1. Implement sidebar navigation component

  **What to do:**
  - Create `src/lib/components/Sidebar.svelte`:
    - Fixed sidebar width: 240px on desktop
    - Logo area at top with bakery gradient
    - Navigation items with icons and labels
    - Active state: bakery-100 background, bakery-700 text, left border indicator
    - Hover state: neutral-100 background
    - Role-based menu items (show/hide based on user.role)
    - Collapsible on mobile (drawer)
    - Smooth transitions for expand/collapse
    - Accessibility: nav landmark, ARIA attributes

  **Must NOT do:**
  - Remove existing navigation functionality
  - Break role-based access control
  - Remove keyboard navigation

  **Parallelizable**: NO (depends on 2.1 for button component)

  **References**:
  - **Pattern References**: `src/routes/(app)/+layout.svelte` - Current navigation structure
  - **Pattern References**: Role-based navigation logic in current layout
  - **External References**: Tailwind CSS sidebar examples (https://tailwindui.com/components/application-ui/navigation/sidebars)

  **WHY Each Reference Matters**:
  - Current layout: Understand role-based navigation logic
  - Role patterns: Ensure sidebar shows correct items per role

  **Acceptance Criteria**:
  - [ ] Sidebar component created with 240px width
  - [ ] Logo area uses bakery gradient
  - [ ] Navigation items have icons and labels
  - [ ] Active state uses bakery colors
  - [ ] Role-based menu items work correctly
  - [ ] Mobile drawer collapses/extends
  - [ ] Keyboard navigation works
  - [ ] ARIA landmarks and attributes present

  **Commit**: YES
  - Message: `feat(sidebar): implement role-based sidebar navigation`
  - Files: `src/lib/components/Sidebar.svelte`
  - Pre-commit: `npm run test:unit src/lib/components/Sidebar.svelte.spec.ts` (if exists)

- [ ] 3.2. Update app layout to use sidebar navigation

  **What to do:**
  - Update `src/routes/(app)/+layout.svelte`:
    - Replace top navigation bar with sidebar
    - Add collapsible header for mobile (64px height)
    - Update layout to: sidebar (240px) + main content area
    - Add hamburger menu button for mobile drawer
    - Keep user info in header (avatar, name, role, logout)
    - Update bakery colors in header
    - Ensure responsive behavior: sidebar on desktop, drawer on mobile

  **Must NOT do:**
  - Break existing page layouts
  - Remove authentication checks
  - Remove logout functionality

  **Parallelizable**: NO (depends on 3.1)

  **References**:
  - **Pattern References**: `src/routes/(app)/+layout.svelte` - Current app layout
  - **Pattern References**: User authentication check in layout

  **WHY Each Reference Matters**:
  - Current layout: Understand authentication and page structure
  - Auth pattern: Ensure authentication checks remain intact

  **Acceptance Criteria**:
  - [ ] Sidebar replaces top navigation
  - [ ] Layout is: sidebar (left) + main (right)
  - [ ] Mobile hamburger menu opens drawer
  - [ ] User info shows in header
  - [ ] Authentication checks still work
  - [ ] Logout functionality works
  - [ ] Responsive: sidebar (desktop), drawer (mobile)
  - [ ] All pages render correctly with new layout

  **Commit**: YES
  - Message: `refactor(layout): migrate to sidebar navigation`
  - Files: `src/routes/(app)/+layout.svelte`
  - Pre-commit: `npm run test:e2e e2e/auth.spec.ts` (verify auth still works)

- [ ] 3.3. Add mobile bottom navigation for quick actions

  **What to do:**
  - Create `src/lib/components/MobileBottomNav.svelte`:
    - Fixed at bottom of screen on mobile (< 640px)
    - 2-3 quick action buttons: Dashboard, New Order
    - Use bakery colors for active state
    - Hide on tablet and desktop
    - Smooth transitions
    - Accessibility: nav landmark, ARIA attributes

  **Must NOT do:**
  - Show on desktop or tablet
  - Add more than 3 quick actions
  - Break existing mobile experience

  **Parallelizable**: YES (with 3.2)

  **References**:
  - **Pattern References**: Mobile navigation patterns in current layout
  - **External References**: Tailwind CSS mobile nav examples (https://tailwindui.com/components/application-ui/navigation/bottom-navigations)

  **WHY Each Reference Matters**:
  - Current patterns: Understand mobile UX to improve, not break

  **Acceptance Criteria**:
  - [ ] Bottom nav component created
  - [ ] Shows only on mobile (< 640px)
  - [ ] Has Dashboard and New Order buttons
  - [ ] Active state uses bakery colors
  - [ ] Smooth transitions
  - [ ] ARIA attributes present
  - [ ] Keyboard navigation works

  **Commit**: YES
  - Message: `feat(mobile): add bottom navigation for quick actions`
  - Files: `src/lib/components/MobileBottomNav.svelte`, `src/routes/(app)/+layout.svelte`
  - Pre-commit: `npm run test:e2e e2e/mobile.spec.ts` (if exists)

### Phase 4: Page Updates (Day 4)

- [ ] 4.1. Update Dashboard page with new design

  **What to do:**
  - Update `src/routes/(app)/+page.svelte`:
    - Update stats cards to use new colors:
      - Total Orders: bakery-500 icon
      - Pending: warning-500 icon
      - Preparing: orange-500 icon
      - Ready: success-500 icon
      - Delivered: sage-500 icon
    - Update quick actions card with bakery colors
    - Update role information card to use gradient bakery-500
    - Update system status card to use neutral-50 background
    - Update recent orders with new card variants
    - Add slide-up animation to cards
    - Apply new font family (display for headings, sans for body)
    - Update spacing to use new scale (12px, 24px, 48px)
    - Remove text gradients, use solid colors

  **Must NOT do:**
  - Remove existing functionality (stats calculation, quick actions)
  - Break role-based quick actions
  - Remove recent orders

  **Parallelizable**: NO (depends on 3.1, 2.1, 2.3)

  **References**:
  - **Pattern References**: `src/routes/(app)/+page.svelte` - Current dashboard
  - **Pattern References**: Stats data structure from +layout.server.ts

  **WHY Each Reference Matters**:
  - Current dashboard: Understand data structure and functionality
  - Data patterns: Ensure redesign doesn't break data flow

  **Acceptance Criteria**:
  - [ ] Stats cards use new color scheme
  - [ ] Quick actions use bakery colors
  - [ ] Role card uses bakery gradient
  - [ ] Recent orders use new card variants
  - [ ] Slide-up animation applied
  - [ ] New font family applied
  - [ ] Text gradients removed
  - [ ] All functionality works
  - [ ] Accessibility verified

  **Commit**: YES
  - Message: `style(dashboard): apply new design system`
  - Files: `src/routes/(app)/+page.svelte`
  - Pre-commit: `npm run test:e2e e2e/dashboard.spec.ts` (if exists)

- [ ] 4.2. Update New Order page with new design

  **What to do:**
  - Update `src/routes/(app)/orders/new/+page.svelte`:
    - Update customer info form with new input states
    - Update menu items to use new card variants (elevated)
    - Update category headers to use display font
    - Update order summary card with new colors
    - Update cart items with new card styling
    - Update totals section to use bakery-700
    - Apply slide-up animation to menu items
    - Update quantity controls to use new button styles
    - Update clear/create order buttons with new variants
    - Remove text gradients, use solid colors
    - Ensure responsive behavior: sidebar (desktop), bottom nav (mobile)

  **Must NOT do:**
  - Remove existing functionality (add to cart, update quantity, create order)
  - Break form validation
  - Remove client search

  **Parallelizable**: NO (depends on 3.1, 2.1, 2.2, 2.3)

  **References**:
  - **Pattern References**: `src/routes/(app)/orders/new/+page.svelte` - Current new order page
  - **Pattern References**: `src/lib/components/MenuItem.svelte` - Menu item component
  - **Pattern References**: `src/lib/components/CustomerInfo.svelte` - Customer info form

  **WHY Each Reference Matters**:
  - Current page: Understand cart logic and form flow
  - Components: Ensure redesign aligns with component changes

  **Acceptance Criteria**:
  - [ ] Customer form uses new input states
  - [ ] Menu items use elevated card variant
  - [ ] Category headers use display font
  - [ ] Order summary uses bakery colors
  - [ ] Cart items use new card styling
  - [ ] Totals use bakery-700
  - [ ] Slide-up animation applied
  - [ ] All functionality works
  - [ ] Responsive behavior correct

  **Commit**: YES
  - Message: `style(new-order): apply new design system and animations`
  - Files: `src/routes/(app)/orders/new/+page.svelte`
  - Pre-commit: `npm run test:e2e e2e/new-order.spec.ts` (if exists)

- [ ] 4.3. Update Order History page with new design

  **What to do:**
  - Update `src/routes/(app)/orders/+page.svelte`:
    - Update search input with new input states
    - Update filter dropdowns to use new select styling
    - Update clear filters button with new button style
    - Update order cards with new variants
    - Update status badges to use new warm colors
    - Update expand/collapse animations
    - Update view details button with new style
    - Update pagination buttons with new style
    - Apply new font family
    - Remove text gradients
    - Update empty state with new design

  **Must NOT do:**
  - Remove existing functionality (search, filter, pagination, expand/collapse)
  - Break API calls
  - Remove sorting

  **Parallelizable**: NO (depends on 3.1, 2.1, 2.2, 2.4)

  **References**:
  - **Pattern References**: `src/routes/(app)/orders/+page.svelte` - Current order history
  - **Pattern References**: `src/lib/components/OrderCard.svelte` - Order card component

  **WHY Each Reference Matters**:
  - Current page: Understand filtering and pagination logic
  - Component patterns: Ensure redesign aligns with component changes

  **Acceptance Criteria**:
  - [ ] Search input uses new states
  - [ ] Filter dropdowns styled correctly
  - [ ] Order cards use new variants
  - [ ] Status badges use warm colors
  - [ ] Expand/collapse animations smooth
  - [ ] All functionality works
  - [ ] Responsive behavior correct

  **Commit**: YES
  - Message: `style(order-history): apply new design system and improved animations`
  - Files: `src/routes/(app)/orders/+page.svelte`
  - Pre-commit: `npm run test:e2e e2e/order-history.spec.ts` (if exists)

- [ ] 4.4. Update Kitchen and Delivery pages with new design

  **What to do:**
  - Update `src/routes/(app)/kitchen/+page.svelte`:
    - Update header with bakery colors
    - Update order cards with new variants
    - Update status buttons with new button styles
    - Update refresh button with new style
    - Update empty state with new design
    - Apply slide-up animation to cards

  - Update `src/routes/(app)/delivery/+page.svelte`:
    - Update header with bakery colors
    - Update order cards with new variants
    - Update status buttons with new button styles
    - Update refresh button with new style
    - Update empty state with new design
    - Apply slide-up animation to cards

  **Must NOT do:**
  - Remove existing functionality (status updates, auto-refresh)
  - Break real-time updates
  - Remove role-based access

  **Parallelizable**: YES (kitchen and delivery can be done together)

  **References**:
  - **Pattern References**: `src/routes/(app)/kitchen/+page.svelte` - Current kitchen page
  - **Pattern References**: `src/routes/(app)/delivery/+page.svelte` - Current delivery page
  - **Pattern References**: `src/lib/components/OrderCard.svelte` - Order card component

  **WHY Each Reference Matters**:
  - Current pages: Understand role-specific workflows and functionality
  - Component patterns: Ensure redesign aligns with component changes

  **Acceptance Criteria**:
  - [ ] Headers use bakery colors
  - [ ] Order cards use new variants
  - [ ] Status buttons use new styles
  - [ ] Slide-up animation applied
  - [ ] All functionality works
  - [ ] Auto-refresh still works
  - [ ] Responsive behavior correct

  **Commit**: YES
  - Message: `style(workflow): apply new design to kitchen and delivery pages`
  - Files: `src/routes/(app)/kitchen/+page.svelte`, `src/routes/(app)/delivery/+page.svelte`
  - Pre-commit: `npm run test:e2e e2e/kitchen.spec.ts e2e/delivery.spec.ts` (if exists)

### Phase 5: Polish (Day 5)

- [ ] 5.1. Add animations and micro-interactions

  **What to do:**
  - Add page load animation (slide-up with stagger) to all pages
  - Add hover animations to cards (lift, shadow increase)
  - Add focus animations to inputs (ring expansion)
  - Add click animations to buttons (scale down then up)
  - Add smooth page transitions
  - Add loading spinners with bakery colors
  - Add toast notification animations (slide in from right)
  - Add modal open/close animations (scale in/out)

  **Must NOT do:**
  - Add excessive animations that impact performance
  - Add animations that cause motion sickness
  - Break existing functionality

  **Parallelizable**: YES (can be done incrementally across pages)

  **References**:
  - **Pattern References**: Existing animations in `src/routes/layout.css`
  - **Documentation References**: Svelte transitions (https://svelte.dev/docs#run-time-svelte-transition)

  **WHY Each Reference Matters**:
  - Existing animations: Maintain consistent animation style
  - Svelte transitions: Use Svelte's built-in transition directives

  **Acceptance Criteria**:
  - [ ] Page load animation added (slide-up)
  - [ ] Staggered animations on lists
  - [ ] Hover animations on cards
  - [ ] Focus animations on inputs
  - [ ] Click animations on buttons
  - [ ] Smooth page transitions
  - [ ] Loading spinners styled
  - [ ] Toast animations added
  - [ ] Modal animations added
  - [ ] No performance impact (FCP < 1.5s)
  - [ ] Respect prefers-reduced-motion

  **Commit**: YES
  - Message: `feat(animations): add polished micro-interactions`
  - Files: Multiple files (animations across components and pages)
  - Pre-commit: `npm run lighthouse` (check performance)

- [ ] 5.2. Implement grain overlay and visual effects

  **What to do:**
  - Apply grain overlay to body (fixed position, pointer-events-none, z-9999)
  - Add warm glow shadows to primary elements
  - Add subtle gradients to hero sections (bakery-50 to sage-50)
  - Update empty states with new illustrations and colors
  - Add backdrop blur to modals and overlays
  - Ensure grain overlay doesn't impact performance

  **Must NOT do:**
  - Add grain overlay that blocks interactions
  - Add excessive visual noise
  - Break readability

  **Parallelizable**: YES (with 5.1)

  **References**:
  - **Pattern References**: Grain overlay utility in `src/routes/layout.css`
  - **Documentation References**: CSS noise filters (https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/blur)

  **WHY Each Reference Matters**:
  - Grain utility: Ensure grain overlay works as intended
  - Performance: Ensure visual effects don't slow down rendering

  **Acceptance Criteria**:
  - [ ] Grain overlay applied to body
  - [ ] Warm glow shadows on primary elements
  - [ ] Gradients on hero sections
  - [ ] Empty states updated
  - [ ] Backdrop blur on modals
  - [ ] No performance impact
  - [ ] Respect prefers-reduced-motion (no grain/blur)

  **Commit**: YES
  - Message: `style(effects): add grain overlay and warm glow shadows`
  - Files: `src/routes/layout.css`, multiple pages
  - Pre-commit: `npm run lighthouse` (check performance)

### Phase 6: Testing (Day 6)

- [ ] 6.1. Cross-browser and cross-device testing

  **What to do:**
  - Test in Chrome, Firefox, Safari, Edge
  - Test on mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
  - Test on iOS Safari and Chrome for Android
  - Verify color contrast across all browsers
  - Verify animations work smoothly
  - Verify fonts load correctly
  - Verify responsive behavior
  - Screenshot each browser/device combination
  - Log any inconsistencies or bugs

  **Must NOT do:**
  - Skip browser testing
  - Skip mobile testing
  - Ignore browser-specific bugs

  **Parallelizable**: NO (comprehensive testing requires full attention)

  **References**:
  - **Pattern References**: Browser compatibility requirements in project README
  - **Documentation References**: Browser testing checklist (https://web.dev/browser-support/)

  **WHY Each Reference Matters**:
  - Browser support: Ensure consistent experience across browsers
  - Device support: Ensure responsive design works on all devices

  **Acceptance Criteria**:
  - [ ] All browsers tested (Chrome, Firefox, Safari, Edge)
  - [ ] All devices tested (mobile, tablet, desktop)
  - [ ] iOS Safari tested
  - [ ] Chrome for Android tested
  - [ ] Color contrast verified
  - [ ] Animations smooth
  - [ ] Fonts load correctly
  - [ ] Responsive behavior works
  - [ ] Screenshots saved to `.sisyphus/evidence/`
  - [ ] All critical bugs fixed

  **Commit**: YES (bug fixes only if found)
  - Message: `fix(testing): resolve cross-browser and cross-device issues`
  - Files: Bug fix files (if any)
  - Pre-commit: `npm run test:unit npm run test:e2e`

- [ ] 6.2. Accessibility audit and fixes

  **What to do:**
  - Run Lighthouse accessibility audit
  - Test keyboard navigation (Tab, Enter, Space, Escape)
  - Test screen reader (NVDA, JAWS, VoiceOver)
  - Verify ARIA labels on all interactive elements
  - Verify focus states are visible
  - Verify color contrast ratios (WCAG AA)
  - Test with browser zoom (up to 200%)
  - Test with high contrast mode
  - Test with reduced motion preference
  - Fix any accessibility issues found

  **Must NOT do:**
  - Skip accessibility testing
  - Ignore WCAG violations
  - Remove functionality for accessibility

  **Parallelizable**: NO (comprehensive audit requires full attention)

  **References**:
  - **Pattern References**: Accessibility guidelines in AGENTS.md
  - **Documentation References**: WCAG 2.1 guidelines (https://www.w3.org/WAI/WCAG21/quickref/)

  **WHY Each Reference Matters**:
  - WCAG guidelines: Ensure compliance with accessibility standards
  - Current patterns: Maintain accessibility while updating design

  **Acceptance Criteria**:
  - [ ] Lighthouse accessibility score > 95
  - [ ] Keyboard navigation works
  - [ ] Screen reader test passed
  - [ ] All interactive elements have ARIA labels
  - [ ] Focus states visible
  - [ ] Color contrast ratios meet WCAG AA
  - [ ] Browser zoom works (up to 200%)
  - [ ] High contrast mode works
  - [ ] Reduced motion respected
  - [ ] All accessibility issues fixed
  - [ ] Accessibility report saved to `.sisyphus/evidence/`

  **Commit**: YES (bug fixes only if found)
  - Message: `fix(a11y): resolve accessibility audit findings`
  - Files: Bug fix files (if any)
  - Pre-commit: `npx lighthouse http://localhost:5173 --view`

- [ ] 6.3. Performance optimization and final polish

  **What to do:**
  - Run Lighthouse performance audit
  - Optimize images (compress, lazy load)
  - Minimize JavaScript bundle size
  - Optimize font loading (font-display: swap)
  - Reduce CLS (Cumulative Layout Shift)
  - Optimize animations (use transform/opacity)
  - Test loading performance on slow connections
  - Verify FCP < 1.5s, LCP < 2.5s, CLS < 0.1
  - Fix any performance issues found
  - Final code cleanup and comments

  **Must NOT do:**
  - Skip performance optimization
  - Add blocking resources
  - Remove functionality for performance

  **Parallelizable**: NO (performance work requires careful testing)

  **References**:
  - **Pattern References**: Performance metrics in project README
  - **Documentation References**: Web performance optimization (https://web.dev/fast/)

  **WHY Each Reference Matters**:
  - Performance goals: Ensure fast, responsive user experience
  - Best practices: Follow performance optimization guidelines

  **Acceptance Criteria**:
  - [ ] Lighthouse performance score > 90
  - [ ] Images optimized
  - [ ] JavaScript bundle minimized
  - [ ] Fonts optimized
  - [ ] CLS < 0.1
  - [ ] FCP < 1.5s
  - [ ] LCP < 2.5s
  - [ ] Slow connection test passed
  - [ ] All performance issues fixed
  - [ ] Code cleaned up and commented
  - [ ] Performance report saved to `.sisyphus/evidence/`

  **Commit**: YES (bug fixes only if found)
  - Message: `perf(optimize): resolve performance audit findings`
  - Files: Bug fix files (if any)
  - Pre-commit: `npx lighthouse http://localhost:5173 --view`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1.1 | `style(config): add warm industrial bakery color palette and design tokens` | tailwind.config.js | npm run dev |
| 1.2 | `style(assets): add Google Fonts and base CSS utilities` | src/app.html, src/routes/layout.css | npm run lint |
| 1.3 | `style(layout): apply new font system and remove blue gradients` | src/routes/+layout.svelte | npm run check |
| 2.1 | `style(button): redesign with bakery colors and warm hover effects` | src/lib/components/ui/Button.svelte | npm run test:unit |
| 2.2 | `style(input): redesign states with warm color indicators` | src/lib/components/ui/Input.svelte | npm run test:unit |
| 2.3 | `style(card): add variants and refined shadow system` | src/lib/components/ui/Card.svelte | npm run test:unit |
| 2.4 | `style(status-badge): update to warm status color palette` | src/lib/components/StatusBadge.svelte | npm run test:unit |
| 3.1 | `feat(sidebar): implement role-based sidebar navigation` | src/lib/components/Sidebar.svelte | npm run test:unit |
| 3.2 | `refactor(layout): migrate to sidebar navigation` | src/routes/(app)/+layout.svelte | npm run test:e2e e2e/auth.spec.ts |
| 3.3 | `feat(mobile): add bottom navigation for quick actions` | src/lib/components/MobileBottomNav.svelte, src/routes/(app)/+layout.svelte | npm run test:e2e e2e/mobile.spec.ts |
| 4.1 | `style(dashboard): apply new design system` | src/routes/(app)/+page.svelte | npm run test:e2e e2e/dashboard.spec.ts |
| 4.2 | `style(new-order): apply new design system and animations` | src/routes/(app)/orders/new/+page.svelte | npm run test:e2e e2e/new-order.spec.ts |
| 4.3 | `style(order-history): apply new design system and improved animations` | src/routes/(app)/orders/+page.svelte | npm run test:e2e e2e/order-history.spec.ts |
| 4.4 | `style(workflow): apply new design to kitchen and delivery pages` | src/routes/(app)/kitchen/+page.svelte, src/routes/(app)/delivery/+page.svelte | npm run test:e2e e2e/kitchen.spec.ts e2e/delivery.spec.ts |
| 5.1 | `feat(animations): add polished micro-interactions` | Multiple files | npm run lighthouse |
| 5.2 | `style(effects): add grain overlay and warm glow shadows` | src/routes/layout.css, multiple pages | npm run lighthouse |
| 6.1-6.3 | Bug fixes as needed | As needed | npm run test:unit npm run test:e2e npx lighthouse |

---

## Success Criteria

### Verification Commands
```bash
# Start development server
npm run dev

# Type checking
npm run check

# Linting
npm run lint

# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Lighthouse audit (performance and accessibility)
npx lighthouse http://localhost:5173 --view
```

### Final Checklist
- [ ] All color contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] All components redesigned with new design system
- [ ] Sidebar navigation implemented with role-based menu items
- [ ] Mobile navigation (drawer + bottom nav) functional
- [ ] All pages updated with new design
- [ ] Animations and micro-interactions added
- [ ] Cross-browser testing passed (Chrome, Firefox, Safari, Edge)
- [ ] Cross-device testing passed (mobile, tablet, desktop)
- [ ] Accessibility audit passed (keyboard navigation, screen readers, ARIA labels, focus states)
- [ ] Performance metrics met (FCP < 1.5s, LCP < 2.5s, CLS < 0.1, Performance > 90, Accessibility > 95)
- [ ] Lighthouse audit completed and saved to `.sisyphus/evidence/`
- [ ] Screenshots saved to `.sisyphus/evidence/` for all pages and browsers
- [ ] All bugs fixed
- [ ] Code cleaned up and commented
- [ ] Documentation updated (if needed)

---

## Appendix A: Color Palette Reference

### Primary Colors (Warm Earth Tones)
```css
--color-bakery-50: #faf6f3;  /* Very light cream */
--color-bakery-100: #f5ebe2; /* Light cream */
--color-bakery-200: #ebd9c4; /* Beige */
--color-bakery-300: #dbc3a6; /* Light tan */
--color-bakery-400: #c8a885; /* Medium tan */
--color-bakery-500: #b69166; /* Primary brand - terracotta */
--color-bakery-600: #a87b56; /* Dark terracotta */
--color-bakery-700: #8f6647; /* Deep terracotta */
--color-bakery-800: #74523d; /* Brown */
--color-bakery-900: #614332; /* Dark brown */
```

### Accent Colors
```css
--color-sage-50: #f4f7f4;    /* Very light sage */
--color-sage-100: #e5ebe6;   /* Light sage */
--color-sage-200: #cfd9cf;    /* Sage */
--color-sage-300: #b1c1b0;    /* Medium sage */
--color-sage-400: #96a896;    /* Dark sage */
--color-sage-500: #7b907b;    /* Secondary accent */
--color-sage-600: #657a65;    /* Dark accent */
--color-sage-700: #516451;    /* Deep accent */
--color-sage-800: #425042;    /* Very deep accent */
--color-sage-900: #374037;    /* Darkest accent */
```

### Semantic Colors
```css
/* Success - Warm Olive */
--color-success-500: #8faa56;
--color-success-600: #7a9147;
--color-success-700: #65783d;

/* Warning - Warm Amber */
--color-warning-500: #e8a83a;
--color-warning-600: #d4942d;
--color-warning-700: #c08020;

/* Error - Burnt Sienna */
--color-error-500: #c85a4f;
--color-error-600: #b3493f;
--color-error-700: #9e3a32;

/* Info - Steel Blue */
--color-info-500: #5c7c94;
--color-info-600: #4d6a7e;
--color-info-700: #3e5867;
```

### Neutral Colors (Warm Grays)
```css
--color-neutral-50: #faf9f7;  /* Very light warm gray */
--color-neutral-100: #f2f0ed; /* Light warm gray */
--color-neutral-200: #e3e0db; /* Warm gray */
--color-neutral-300: #cdc7be; /* Medium warm gray */
--color-neutral-400: #b5aca0; /* Dark warm gray */
--color-neutral-500: #9a8f80; /* Very dark warm gray */
--color-neutral-600: #827769; /* Nearly black warm */
--color-neutral-700: #6a6154; /* Off-black warm */
--color-neutral-800: #584f44; /* Black warm */
--color-neutral-900: #474038; /* Deepest warm */
```

---

## Appendix B: Typography Reference

### Font Families
```css
--font-display: 'DM Serif Display', 'Georgia', serif;
--font-body: 'Outfit', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display (H1) | 48px | 700 | 1.1 | Page titles, hero sections |
| H1 | 36px | 700 | 1.2 | Section headings |
| H2 | 28px | 600 | 1.25 | Card titles, subsections |
| H3 | 20px | 600 | 1.3 | List item headings |
| H4 | 16px | 600 | 1.4 | Form labels |
| Body Large | 16px | 400 | 1.5 | Important body text |
| Body | 14px | 400 | 1.5 | Standard body text |
| Small | 12px | 400 | 1.4 | Captions, secondary info |
| X-Small | 11px | 500 | 1.3 | Badges, tags |

---

## Appendix C: Spacing and Layout Reference

### Spacing Scale
```css
--space-1: 4px;   /* Micro elements, icons */
--space-2: 8px;   /* Small gaps, padding sm */
--space-3: 12px;  /* Moderate gaps */
--space-4: 16px;  /* Standard padding */
--space-6: 24px;  /* Section spacing */
--space-8: 32px;  /* Large sections */
--space-12: 48px; /* Extra large */
--space-16: 64px; /* Hero sections */
```

### Border Radius
```css
--radius-sm: 6px;   /* Small elements, inputs */
--radius-md: 10px;  /* Cards, buttons */
--radius-lg: 16px;  /* Large cards, modals */
--radius-xl: 24px;  /* Hero elements */
--radius-full: 9999px; /* Pills, avatars */
```

### Navigation Structure
```
Desktop (> 1024px):
┌─────────┬─────────────────────────────────────────┐
│ Header  │ Header (64px)                        │
│ (240px) │ Logo | Title | User | Settings | Logout │
├─────────┼─────────────────────────────────────────┤
│ Logo    │ Main Content Area                     │
│ ─────── │                                     │
│ Nav     │                                     │
│ Items   │                                     │
│ (role   │                                     │
│ based) │                                     │
└─────────┴─────────────────────────────────────────┘

Tablet (640-1024px):
┌───────────────────────────────────────────────────┐
│ Header (64px)                                 │
│ Logo | Title | Hamburger | User | Settings      │
├─────────┬─────────────────────────────────────────┤
│ Sidebar │ Main Content Area                     │
│ (240px, │                                     │
│ drawer) │                                     │
└─────────┴─────────────────────────────────────────┘

Mobile (< 640px):
┌───────────────────────────────────────────────────┐
│ Header (64px)                                 │
│ Logo | Title | Hamburger | Avatar              │
├───────────────────────────────────────────────────┤
│ Main Content Area                              │
│                                               │
│                                               │
├───────────────────────────────────────────────────┤
│ Bottom Nav (56px)                              │
│ Dashboard | New Order                          │
└───────────────────────────────────────────────────┘
```

---

**Plan Created:** January 25, 2026
**Estimated Duration:** 6 days
**Complexity:** High - Complete visual refresh with navigation redesign
**Risk Level:** Medium - Visual changes may require iteration based on user feedback
