# BDD Transition Plan - Restaurant Ordering System

## Overview

This document outlines the complete plan for transitioning the Restaurant Ordering System from traditional E2E testing to Behavior-Driven Development (BDD) using Cucumber.js.

**Status:** Planning Phase  
**Created:** 2026-02-09  
**Branch:** `feature/bdd-transition-plan`

---

## Goals

1. Remove all existing Playwright E2E tests
2. Implement Cucumber.js for BDD
3. Document current system behavior as use cases
4. Establish "start with use case" development workflow
5. Enable parallel test execution with mocked database

---

## Configuration Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **BDD Tool** | Cucumber.js with TypeScript | Industry standard, excellent TypeScript support, extensive ecosystem |
| **Test Level** | UI-level | Tests user workflows through the actual interface |
| **Database** | Mock database | Fast, isolated, no SQLite dependencies, perfect for parallel execution |
| **Parallel Execution** | Yes (4 workers) | Fast feedback in CI/CD |
| **CI/CD** | Every PR | Immediate feedback on changes |
| **Review Process** | Product owner reviews `.feature` files | Ensures business requirements are correctly captured |
| **Directory Structure** | `/features/` convention | Standard Cucumber layout |

---

## Phase 1: Setup & E2E Removal (Days 1-2)

### Actions

1. **Remove E2E Infrastructure**
   - Delete entire `/e2e/` directory
   - Remove `playwright.config.ts`
   - Update `package.json` dependencies
   - Update CI/CD workflows

2. **Install Dependencies**
   ```bash
   npm install --save-dev @cucumber/cucumber @cucumber/pretty-formatter ts-node
   ```

3. **Create Configuration**
   - `cucumber.json` - Cucumber configuration
   - `features/support/world.ts` - Custom World for test context
   - `features/support/hooks.ts` - Before/After hooks
   - `features/support/mock-database.ts` - In-memory mock database

4. **Directory Structure**
   ```
   /features/
   ├── authentication/
   │   └── login.feature
   ├── order-taking/
   │   ├── create-order.feature
   │   ├── add-items.feature
   │   ├── variations.feature
   │   ├── modifiers.feature
   │   └── discounts.feature
   ├── kitchen/
   │   └── kitchen-view.feature
   ├── delivery/
   │   └── delivery-view.feature
   ├── admin/
   │   ├── menu-management.feature
   │   ├── client-management.feature
   │   ├── variations-modifiers.feature
   │   └── reports.feature
   ├── step_definitions/
   │   ├── auth.steps.ts
   │   ├── navigation.steps.ts
   │   ├── order.steps.ts
   │   ├── menu.steps.ts
   │   ├── database.steps.ts
   │   └── ui.steps.ts
   └── support/
       ├── world.ts
       ├── hooks.ts
       └── mock-database.ts
   ```

---

## Phase 2: Mock Database Implementation (Days 3-4)

### Design

Create an in-memory mock database that mimics Drizzle ORM interface:

```typescript
// features/support/mock-database.ts
interface MockDatabase {
  users: Map<string, User>;
  categories: Map<string, Category>;
  menuItems: Map<string, MenuItem>;
  clients: Map<string, Client>;
  orders: Map<string, Order>;
  orderItems: Map<string, OrderItem>;
  orderItemVariations: Map<string, OrderItemVariation>;
  orderItemModifiers: Map<string, OrderItemModifier>;
  variationGroups: Map<string, VariationGroup>;
  variations: Map<string, Variation>;
  modifierGroups: Map<string, ModifierGroup>;
  modifiers: Map<string, Modifier>;
  sessions: Map<string, Session>;
  
  // Helper methods
  reset(): void;
  seed(scenario: string): void;
  createId(): string;
}
```

### Data Isolation Strategy

- Each test scenario gets unique UUIDs (includes worker index)
- Separate data stores per worker process via `worldParameters`
- Automatic cleanup after each scenario
- Thread-safe operations for parallel execution

---

## Phase 3: Core Step Definitions (Days 5-8)

### Step Definition Libraries

#### 1. Navigation Steps
```typescript
Given('I am on the {string} page', async (pageName: string) => {
  // Navigate to page and verify
});

When('I navigate to {string}', async (path: string) => {
  // Navigate to path
});

When('I click on {string}', async (text: string) => {
  // Find and click element
});
```

#### 2. Authentication Steps
```typescript
Given('I am logged in as {string}', async (role: string) => {
  // Create user and set session
});

Given('I am not logged in', async () => {
  // Ensure no session exists
});

When('I log in with email {string} and password {string}', async (email: string, password: string) => {
  // Fill form and submit
});

Then('I should be redirected to {string}', async (path: string) => {
  // Verify current URL
});
```

#### 3. Database/Given Steps
```typescript
Given('the menu has {string} priced at ${float}', async (name: string, price: number) => {
  // Create menu item in mock database
});

Given('a client exists with name {string} and phone {string}', async (name: string, phone: string) => {
  // Create client in mock database
});

Given('an order exists with status {string}', async (status: string) => {
  // Create order in mock database
});

Given('the menu has the following items:', async (dataTable: DataTable) => {
  // Create multiple items from table
});
```

#### 4. Order Steps
```typescript
When('I add {string} to the cart', async (itemName: string) => {
  // Find item and add to cart
});

When('I add {string} with variation {string}', async (itemName: string, variation: string) => {
  // Add item with variation
});

When('I add {string} with modifier {string}', async (itemName: string, modifier: string) => {
  // Add item with modifier
});

Then('the cart should contain {int} items', async (count: number) => {
  // Verify cart count
});

Then('the order total should be ${float}', async (amount: number) => {
  // Verify total amount
});
```

#### 5. UI Interaction Steps
```typescript
When('I enter {string} in the {string} field', async (value: string, label: string) => {
  // Find field by label and enter value
});

When('I select {string} from the {string} dropdown', async (option: string, label: string) => {
  // Select option from dropdown
});

When('I check the {string} checkbox', async (label: string) => {
  // Check checkbox
});

When('I search for client {string}', async (searchTerm: string) => {
  // Enter search term
});
```

#### 6. Verification Steps
```typescript
Then('I should see {string}', async (text: string) => {
  // Verify text is visible
});

Then('I should not see {string}', async (text: string) => {
  // Verify text is not visible
});

Then('the {string} field should contain {string}', async (label: string, value: string) => {
  // Verify field value
});

Then('the order should have status {string}', async (status: string) => {
  // Verify order status
});
```

---

## Phase 4: Feature File Migration (Weeks 2-5)

### Use Case Inventory

#### Module 1: Authentication (5 scenarios)
- [ ] Successful login redirects by role
- [ ] Invalid credentials show error
- [ ] Session persistence
- [ ] Access protected routes
- [ ] Logout clears session

#### Module 2: Order Taking (20 scenarios)
- [ ] Create order with customer details
- [ ] Add single item to order
- [ ] Add multiple items to order
- [ ] Add item with variation
- [ ] Add item with modifier
- [ ] Add item with both variation and modifier
- [ ] Update item quantity
- [ ] Remove item from order
- [ ] Apply fixed item discount
- [ ] Apply percentage item discount
- [ ] Apply fixed order discount
- [ ] Apply percentage order discount
- [ ] Search and select existing client
- [ ] Add new client during order
- [ ] View order summary
- [ ] Submit order successfully
- [ ] Clear cart
- [ ] Handle unavailable items
- [ ] Mobile order taking flow
- [ ] Order validation errors

#### Module 3: Kitchen View (6 scenarios)
- [ ] View pending orders
- [ ] View orders being prepared
- [ ] Start preparing order
- [ ] Mark order as ready
- [ ] View order details with customizations
- [ ] Filter orders by status

#### Module 4: Delivery View (4 scenarios)
- [ ] View ready for delivery orders
- [ ] Mark order as delivered
- [ ] View delivery details
- [ ] Filter by delivery status

#### Module 5: Admin - Client Management (6 scenarios)
- [ ] View all clients
- [ ] Search clients
- [ ] Add new client
- [ ] Edit client details
- [ ] Delete client (no orders)
- [ ] View client order history

#### Module 6: Admin - Menu Management (12 scenarios)
- [ ] Create new category
- [ ] Edit category
- [ ] Delete category with items (blocked)
- [ ] Create menu item
- [ ] Edit menu item
- [ ] Delete menu item
- [ ] Toggle item availability
- [ ] Reorder categories
- [ ] Reorder menu items
- [ ] Upload item image
- [ ] View public menu share
- [ ] Manage menu share settings

#### Module 7: Variations & Modifiers (14 scenarios)
- [ ] Create variation group
- [ ] Edit variation group
- [ ] Delete variation group
- [ ] Create variation option
- [ ] Edit variation option
- [ ] Delete variation option
- [ ] Create modifier group
- [ ] Edit modifier group
- [ ] Delete modifier group
- [ ] Create modifier option with pricing
- [ ] Edit modifier option
- [ ] Delete modifier option
- [ ] Assign modifier group to menu item
- [ ] Configure min/max selections

#### Module 8: Admin - Reports (8 scenarios)
- [ ] Generate sales report by date range
- [ ] Generate employee performance report
- [ ] Generate client activity report
- [ ] Generate menu popularity report
- [ ] Export report to CSV
- [ ] View report charts
- [ ] Filter reports by criteria
- [ ] Compare date ranges

#### Module 9: Discounts (6 scenarios)
- [ ] Apply fixed amount item discount
- [ ] Apply percentage item discount
- [ ] Apply fixed amount order discount
- [ ] Apply percentage order discount
- [ ] View discount breakdown
- [ ] Validate discount limits

#### Module 10: Mobile/Responsive (4 scenarios)
- [ ] Navigate using mobile sidebar
- [ ] Use bottom navigation
- [ ] View mobile discount sheet
- [ ] Responsive order cards

**Total: 85 use cases**

### Migration Schedule

| Week | Focus | Scenarios Target |
|------|-------|-----------------|
| Week 2 | Authentication + Core Order Taking | 25 |
| Week 3 | Kitchen + Delivery + Admin Clients | 41 |
| Week 4 | Variations + Modifiers + Menu | 67 |
| Week 5 | Discounts + Reports + Mobile | 85 |

---

## Phase 5: CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/bdd-tests.yml
name: BDD Tests

on:
  pull_request:
    branches: [main, master]

jobs:
  bdd:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run BDD tests
        run: npm run test:bdd
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: cucumber-report
          path: cucumber-report.html
```

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:bdd": "cucumber-js --format @cucumber/pretty-formatter",
    "test:bdd:parallel": "cucumber-js --parallel 4",
    "test:bdd:debug": "cucumber-js --tags @wip",
    "test:bdd:smoke": "cucumber-js --tags @smoke",
    "test:bdd:report": "cucumber-js --format html:cucumber-report.html"
  }
}
```

---

## Phase 6: Development Workflow

### "Start with Use Case" Protocol

#### 1. Feature Request → Use Case (Before Coding)

```
┌─────────────────────────────────────────┐
│  CREATE FEATURE FILE                    │
│  • Write scenarios with Gherkin         │
│  • Tag all with @wip                    │
│  • Focus on business value              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  PRODUCT OWNER REVIEW                   │
│  • Review business logic                │
│  • Approve scenarios                    │
│  • Suggest edge cases                   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  OPEN PULL REQUEST                      │
│  • Feature files only                   │
│  • Await PO approval                    │
└─────────────────────────────────────────┘
```

#### 2. Implementation (During Development)

```
┌─────────────────────────────────────────┐
│  SETUP STEP DEFINITIONS                 │
│  • Define new steps if needed           │
│  • Reuse existing steps                 │
│  • Implement step logic                 │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  IMPLEMENT FEATURE                      │
│  • Run @wip scenarios continuously      │
│  • Make one scenario pass at a time     │
│  • Refactor as needed                   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  UPDATE PULL REQUEST                    │
│  • Add implementation code              │
│  • Remove @wip tags                     │
│  • All scenarios passing                │
└─────────────────────────────────────────┘
```

#### 3. Review & Merge

```
┌─────────────────────────────────────────┐
│  CODE REVIEW                            │
│  • Technical implementation             │
│  • Step definition quality              │
│  • Test coverage                        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  CI/CD CHECKS                           │
│  • All BDD tests pass                   │
│  • No @wip tags remaining               │
│  • Build successful                     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  MERGE TO MAIN                          │
│  • Squash and merge                     │
│  • Delete feature branch                │
└─────────────────────────────────────────┘
```

### Tags Strategy

| Tag | Usage |
|-----|-------|
| `@wip` | Work in progress - not ready for CI |
| `@smoke` | Critical path tests - run first |
| `@critical` | Must pass for deployment |
| `@regression` | Full test suite |
| `@mobile` | Mobile-specific scenarios |
| `@desktop` | Desktop-specific scenarios |
| `@slow` | Long-running tests |
| `@flaky` | Known unstable tests (should fix) |

---

## Sample Feature Files

### Example 1: Authentication

```gherkin
Feature: User Authentication
  As a user
  I want to log in with my credentials
  So that I can access the ordering system

  @smoke @critical
  Scenario Outline: Successful login redirects based on user role
    Given I am on the login page
    And a user exists with email "<email>", password "password123", and role "<role>"
    When I enter "<email>" in the "Email" field
    And I enter "password123" in the "Password" field
    And I click the "Log In" button
    Then I should be redirected to "<redirect_path>"
    And I should see "<expected_text>"

    Examples:
      | email                    | role         | redirect_path  | expected_text  |
      | order_taker@test.com     | order_taker  | /orders/new    | Create Order   |
      | kitchen@test.com         | kitchen      | /kitchen       | Kitchen        |
      | delivery@test.com        | delivery     | /delivery      | Delivery       |
      | admin@test.com           | admin        | /              | Dashboard      |

  Scenario: Invalid credentials show error message
    Given I am on the login page
    When I enter "invalid@test.com" in the "Email" field
    And I enter "wrongpassword" in the "Password" field
    And I click the "Log In" button
    Then I should see "Invalid email or password"
    And I should be on the "/login" page

  Scenario: Empty fields show validation errors
    Given I am on the login page
    When I click the "Log In" button
    Then I should see "Email is required"
    And I should see "Password is required"

  Scenario: Logout clears session
    Given I am logged in as an order taker
    When I click on "Logout"
    Then I should be redirected to "/login"
    And I should see the login form
```

### Example 2: Order Creation

```gherkin
Feature: Order Creation
  As an order taker
  I want to create orders for customers
  So that kitchen can prepare the food

  Background:
    Given I am logged in as an order taker
    And the menu has the following items:
      | name          | price |
      | Fresh Bread   | 5.00  |
      | Coffee        | 3.50  |
      | Turkey Club   | 12.00 |
      | Orange Juice  | 4.00  |

  @smoke @critical
  Scenario: Create a basic order with customer details
    When I navigate to "/orders/new"
    And I enter "John Doe" in the "Customer Name" field
    And I enter "555-1234" in the "Phone" field
    And I enter "123 Main St" in the "Address" field
    And I add "Fresh Bread" to the cart
    And I add "Coffee" to the cart
    Then the cart should contain 2 items
    And the order total should be $8.50
    When I click the "Submit Order" button
    Then I should see "Order created successfully"
    And the order should have status "pending"

  Scenario: Create order with existing client
    Given a client exists with name "Jane Smith", phone "555-5678", and address "456 Oak Ave"
    When I navigate to "/orders/new"
    And I search for client "Jane Smith"
    And I select "Jane Smith" from the search results
    Then the "Customer Name" field should contain "Jane Smith"
    And the "Phone" field should contain "555-5678"
    And the "Address" field should contain "456 Oak Ave"

  Scenario: Order with item variations
    Given the menu item "Turkey Club" has the variation group "Bread Type" with options:
      | option      | price_adjustment |
      | White Bread | 0.00             |
      | Wheat Bread | 0.50             |
    When I navigate to "/orders/new"
    And I enter "Bob Wilson" in the "Customer Name" field
    And I add "Turkey Club" with variation "Wheat Bread"
    Then the order total should be $12.50

  Scenario: Order with modifiers
    Given the menu item "Coffee" has the modifier group "Add-ons" with options:
      | option         | price |
      | Extra Shot     | 1.00  |
      | Whipped Cream  | 0.50  |
    When I navigate to "/orders/new"
    And I enter "Alice Brown" in the "Customer Name" field
    And I add "Coffee" with modifier "Extra Shot"
    And I add "Coffee" with modifier "Whipped Cream"
    Then the order total should be $5.00

  Scenario: Validation - Customer name is required
    When I navigate to "/orders/new"
    And I enter "555-1234" in the "Phone" field
    And I click the "Submit Order" button
    Then I should see "Customer name is required"

  Scenario: Validation - Phone is required
    When I navigate to "/orders/new"
    And I enter "John Doe" in the "Customer Name" field
    And I click the "Submit Order" button
    Then I should see "Phone number is required"

  Scenario: Clear cart
    Given I navigate to "/orders/new"
    And I enter "John Doe" in the "Customer Name" field
    And I add "Fresh Bread" to the cart
    And I add "Coffee" to the cart
    When I click the "Clear Cart" button
    Then the cart should contain 0 items
    And the order total should be $0.00
```

### Example 3: Kitchen View

```gherkin
Feature: Kitchen Order Management
  As a kitchen staff member
  I want to view and manage orders
  So that I can prepare food efficiently

  Background:
    Given I am logged in as kitchen staff
    And the following orders exist:
      | customer    | status     | items                      |
      | John Doe    | pending    | Fresh Bread, Coffee        |
      | Jane Smith  | preparing  | Turkey Club                |
      | Bob Wilson  | ready      | Orange Juice, Fresh Bread  |

  Scenario: View orders by status
    When I navigate to "/kitchen"
    Then I should see "John Doe" in the pending orders section
    And I should see "Jane Smith" in the preparing orders section
    And I should see "Bob Wilson" in the ready orders section

  Scenario: Start preparing an order
    Given I am on the "/kitchen" page
    When I click on "Start Preparing" for order "John Doe"
    Then the order "John Doe" should move to the preparing section
    And the order status should be "preparing"

  Scenario: Mark order as ready
    Given I am on the "/kitchen" page
    When I click on "Mark Ready" for order "Jane Smith"
    Then the order "Jane Smith" should move to the ready section
    And the order status should be "ready"

  Scenario: View order details with customizations
    Given an order exists for "Alice Brown" with:
      | item         | variation    | modifiers              |
      | Turkey Club  | Wheat Bread  | Extra Cheese, Bacon    |
    When I navigate to "/kitchen"
    And I click on the order for "Alice Brown"
    Then I should see "Turkey Club - Wheat Bread"
    And I should see "Extra Cheese"
    And I should see "Bacon"
```

---

## Success Metrics

### Completion Criteria

- [ ] All 85 use cases documented in Gherkin format
- [ ] 100% feature coverage with at least one scenario per major flow
- [ ] All scenarios passing in CI/CD pipeline
- [ ] Parallel execution working with 4 workers
- [ ] CI runs complete in under 5 minutes
- [ ] No `@wip` tags in main branch
- [ ] Product owner has reviewed and approved all feature files
- [ ] Team trained on BDD workflow
- [ ] Documentation updated with BDD guidelines

### Quality Metrics

| Metric | Target |
|--------|--------|
| Test execution time | < 5 minutes |
| Scenario pass rate | 100% |
| Step reusability | > 70% |
| Feature file readability | PO can understand without explanation |
| Time to write new use case | < 30 minutes |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Mock database doesn't match real behavior | Regular integration testing with real database |
| Parallel test data conflicts | Unique IDs per worker, isolated data stores |
| Step definitions become unmaintainable | Regular refactoring, shared step library |
| PO unavailable for review | Async review process, clear documentation |
| Team resistance to BDD | Training sessions, pair programming |
| Long migration timeline | Prioritize critical paths, incremental delivery |

---

## Next Steps

### Immediate (This Week)

1. [ ] Create worktree for implementation
2. [ ] Remove E2E tests
3. [ ] Install Cucumber dependencies
4. [ ] Create configuration files
5. [ ] Implement mock database
6. [ ] Create first feature file (authentication)
7. [ ] Implement core step definitions

### Week 2

8. [ ] Complete authentication scenarios
9. [ ] Create order-taking feature files
10. [ ] Implement order step definitions
11. [ ] Set up CI/CD pipeline

### Week 3-5

12. [ ] Continue feature migration per schedule
13. [ ] Weekly PO review sessions
14. [ ] Refactor and improve step definitions

### Week 6

15. [ ] Finalize all scenarios
16. [ ] Team training
17. [ ] Documentation
18. [ ] Merge to main

---

## Appendix A: Testing Stack

| Component | Technology |
|-----------|-----------|
| BDD Framework | Cucumber.js |
| Language | TypeScript |
| UI Automation | Playwright (keep as dev dependency) |
| Assertions | Built-in assertions + expect library |
| Mock Database | In-memory JavaScript Maps |
| Parallel Execution | Cucumber.js native parallel mode |
| Reporting | Cucumber HTML + Pretty formatter |
| CI/CD | GitHub Actions |

## Appendix B: File Naming Conventions

| File Type | Convention | Example |
|-----------|-----------|---------|
| Feature files | `kebab-case.feature` | `create-order.feature` |
| Step definitions | `module.steps.ts` | `order.steps.ts` |
| Support files | `descriptive-name.ts` | `mock-database.ts` |
| Page objects | `page-name.page.ts` | `login.page.ts` |

## Appendix C: Code Review Checklist

### Feature Files
- [ ] Scenarios focus on business value
- [ ] Steps are readable by non-technical stakeholders
- [ ] Data tables are used appropriately
- [ ] Tags are applied correctly
- [ ] No implementation details in scenarios
- [ ] Background is used for common setup

### Step Definitions
- [ ] Steps are reusable across features
- [ ] No logic duplication
- [ ] Proper error messages
- [ ] TypeScript types are correct
- [ ] Async/await used properly
- [ ] No hard-coded values

### Implementation
- [ ] All scenarios pass
- [ ] No `@wip` tags
- [ ] Code follows project conventions
- [ ] No test code in production code
- [ ] Mock database properly reflects real behavior

---

## Notes

- This plan assumes 1-2 developers working on BDD migration
- Adjust timeline based on actual capacity
- Weekly check-ins recommended to track progress
- Product owner involvement is critical for success
- Consider BDD training if team is new to the approach

---

**Document Owner:** Development Team  
**Last Updated:** 2026-02-09  
**Review Schedule:** Weekly during migration
