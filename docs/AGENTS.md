# Testing Approach & Limitations

**Date:** January 29, 2026

## Phase 1 - UI Components: Complete ✅

**Completed Components & Tests:**
- Button.svelte: 28 tests
- Card.svelte: 5 tests
- Input.svelte: 5 tests
- Select.svelte: 6 tests
- Skeleton.svelte: 4 tests
- SkeletonCard.svelte: 3 tests
- Spinner.svelte: 6 tests

**Total Tests:** 57 tests
**Time Spent:** ~2.5 hours
**Test Status:** 100% passing

## Testing Approach

### Test Files Created
1. `src/lib/components/ui/Button.svelte.test.ts` - 28 tests
2. `src/lib/components/ui/Card.svelte.test.ts` - 5 tests
3. `src/lib/components/ui/Input.svelte.test.ts` - 5 tests
4. `src/lib/components/ui/Select.svelte.test.ts` - 6 tests
5. `src/lib/components/ui/Skeleton.svelte.test.ts` - 4 tests
6. `src/lib/components/ui/SkeletonCard.svelte.test.ts` - 3 tests
7. `src/lib/components/ui/Spinner.svelte.test.ts` - 6 tests

### Testing Framework
- **Vitest** (v4.0.17) - Test runner
- **@testing-library/svelte** - Svelte component testing library
- **@testing-library/jest-dom** - Custom matchers (toBeInTheDocument, toHaveClass, etc.)
- **@vitest/browser-playwright** - Browser testing provider with Chromium
- **vitest-browser-svelte** - Svelte 5 specific testing

### Test Organization
- Co-located test files: Each component test file is next to its component
- File naming: `ComponentName.svelte.test.ts`

### Key Patterns Used

```typescript
describe('Component', () => {
  beforeEach(() => {
    testingLibraryCleanup();
  });

  it('test description', async () => {
    const { getByRole } = render(Component, { prop: value });
    const element = getByRole('element');
    expect(element).toBeInTheDocument();
  });
});
```

## Known Limitations

### 1. Svelte 5 Snippet Rendering
**Issue:** When testing components that use `{@render children()}` snippets, the text content is not rendered as direct text in the DOM. Testing Library matchers like `getByText()` fail to find the text.

**Workaround:** Use alternative queries:
- Query by role: `getByRole('button')`
- Use container-based queries: `container.querySelector()`
- Use ID selectors: `container.querySelector('#element-id')`
- Check className or other attributes instead of text content

**Example:**
```typescript
// This doesn't work:
expect(getByText('Button Text')).toBeInTheDocument();

// Use this instead:
expect(getByRole('button')).toBeInTheDocument();
expect(button.className).toContain('bg-primary-500');
```

### 2. Component Cleanup Required
**Issue:** Browser tests create persistent DOM elements. Running multiple tests without cleanup causes multiple elements to exist, causing query failures with "Found multiple elements" or "Unable to find an element".

**Solution:**
- Always call `cleanup()` in `beforeEach()` hook
- This ensures each test starts with a clean DOM state
- Critical for `@testing-library/svelte` in browser environment

```typescript
describe('Component', () => {
  beforeEach(() => {
    testingLibraryCleanup();
  });
});
```

### 3. Svelte 5 Component Props
**Issue:** Props that use snippets (`children: import('svelte').Snippet`) cannot be easily tested with standard assertions.

**Workaround:**
- Test component with required props (variant, size, disabled, etc.)
- Test user interactions (click, input, change events)
- Test accessibility attributes (aria-label, aria-describedby, role)
- Avoid testing exact text content from snippets where possible
- Use container queries for complex component structures

### 4. Testing Library Matchers
**Issue:** Some jest-dom matchers may not work perfectly with Svelte 5 in browser environment, particularly those expecting DOM nodes vs. component wrappers.

**Workaround:**
- Use `toBeInTheDocument()` - works reliably
- Use `toHaveClass()` - check if class exists on element (may need `.className` property)
- Use `toHaveAttribute()` - check for specific attributes
- Use `toBeDisabled()` / `toBeChecked()` - for disabled states
- Avoid exact string matching on className property

```typescript
// Instead of this (may not work with classList):
expect(button.className).toBe('bg-primary-500 hover:bg-primary-600');

// Use this:
expect(button).toHaveClass('bg-primary-500', 'hover:bg-primary-600');
```

### 5. DOM Query Methods
**Note:** `@testing-library/svelte` in browser environment may not support all query methods (like `getAllByRole`, `queryAllByText`).

**Solution:**
- Use supported query methods (`getByRole`, `getByText`, `container.querySelector`)
- Use `getAllByRole()` only when necessary and verify length
- Prefer single element queries over "AllBy" queries to avoid ambiguity

### 6. Mocking External Dependencies
**Approach:** Partial mocking strategy used as planned

**What's Mocked:**
- `window.fetch` - For network requests
- `goto` from `$app/navigation` - For page navigation
- `toast.success/error/info/warning` - For toast notifications
- SvelteKit stores - Via `vi.mock()`

**What's Not Mocked:**
- Real browser APIs (DOM manipulation, events)
- Real timers (except where needed for debouncing)

**Mock Functions Created:**
- `mockFetch(response, ok)` - Mock successful API response
- `mockFetchError(message, status)` - Mock failed API response
- `mockNavigation()` - Returns mock goto function
- `mockToast()` - Returns mocked toast objects

### 7. Test Coverage
**Coverage:** All UI component variants tested
- All states (default, disabled, loading, error, success)
- All sizes (sm, md, lg)
- All colors (bakery, neutral, success, warning, error)
- User interactions (click, input, change)
- Accessibility (roles, ARIA labels, keyboard navigation)

## Recommendations

### For Future Phases
1. **Simple Feature Components:** These components have fewer dependencies (StatusBadge, Modal, Toast, ToastContainer)
2. **Complex Feature Components:** Start with components that don't depend heavily on server actions (MenuItemCard, Sidebar)
3. **Layout Components:** Test these last as they control page rendering
4. **Page Components:** These will have the most complex tests requiring careful mocking (forms, API calls, routing)

### Lessons Learned
1. **Browser Testing Setup:** Configuring Vitest with Playwright browser support requires specific configuration
2. **Svelte 5 Compatibility:** Snippet rendering has limitations requiring alternative testing approaches
3. **Component Testing Pattern:** Use container-based queries for components with slots, className checks for styling
4. **Mocking Strategy:** Partial mocking of external dependencies works well for unit testing
5. **Test Coverage:** 57 tests achieved with 100% pass rate demonstrates solid testing approach

## Conclusion

Phase 1 is complete with all 57 UI component tests passing. The testing infrastructure is robust and ready for the remaining phases. The patterns established here (proper cleanup, container queries, attribute checks) will be used throughout the rest of the testing implementation.
