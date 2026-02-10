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

  @smoke
  Scenario: Remove item from cart
    Given I navigate to "/orders/new"
    And I enter "John Doe" in the "Customer Name" field
    And I add "Fresh Bread" to the cart
    And I add "Coffee" to the cart
    When I remove "Fresh Bread" from the cart
    Then the cart should contain 1 items
    And the order total should be $3.50
