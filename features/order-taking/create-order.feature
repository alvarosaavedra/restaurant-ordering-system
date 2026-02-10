Feature: Order Creation
  As an order taker
  I want to quickly create accurate customer orders
  So that kitchen can prepare food correctly and on time

  Business Context:
  Fast and accurate order entry is critical for restaurant operations.
  Orders must capture customer details, item selections, and customizations.
  The system should guide order takers and prevent errors.

  Background:
    Given Ryan is logged in as an order taker
    And the restaurant serves:
      | item          | base price |
      | Fresh Bread   | $5.00      |
      | Coffee        | $3.50      |
      | Turkey Club   | $12.00     |
      | Orange Juice  | $4.00      |

  @smoke @critical
  Scenario: Order taker creates a complete order for pickup
    Given Ryan is creating a new order
    When Ryan enters customer details for John Doe
      | phone   | 555-1234     |
      | address | 123 Main St  |
    And Ryan adds to the order:
      | item        | quantity |
      | Fresh Bread | 2        |
      | Coffee      | 1        |
    Then the order total should be $13.50
    When Ryan submits the order
    Then the order should be created with status "pending"
    And John Doe should receive order confirmation

  Scenario: Returning customer details auto-populate
    Given Sarah Smith is an existing customer
      | phone   | 555-5678    |
      | address | 456 Oak Ave |
    When Ryan searches for "Sarah Smith"
    And Ryan selects Sarah from the results
    Then Sarah's details should populate the order form

  Scenario: Orders support item variations
    Given Turkey Club sandwiches offer bread options:
      | option      | price adjustment |
      | White Bread | $0.00            |
      | Wheat Bread | $0.50            |
    When Ryan creates an order for Mike
    And Ryan adds a Turkey Club with Wheat Bread
    Then the item price should reflect the $0.50 upgrade
    And the order total should be $12.50

  Scenario: Orders support add-on modifiers
    Given Coffee offers customization options:
      | option        | additional price |
      | Extra Shot    | $1.00            |
      | Whipped Cream | $0.50            |
    When Ryan creates an order for Lisa
    And Ryan adds a Coffee with Extra Shot and Whipped Cream
    Then the order total should be $5.00

  Scenario: System validates required customer information
    Given Ryan is creating a new order
    When Ryan attempts to submit without a customer name
    Then Ryan should see a validation error for the customer name
    When Ryan adds the customer name and attempts to submit without a phone
    Then Ryan should see a validation error for the phone number

  Scenario: Order taker can clear and restart an order
    Given Ryan has started an order with items in the cart
    When Ryan clears the order
    Then the cart should be empty
    And the order total should be $0.00

  @smoke
  Scenario: Order taker can remove items from an order
    Given Ryan is creating an order with:
      | item        | quantity |
      | Fresh Bread | 2        |
      | Coffee      | 1        |
    When Ryan removes Fresh Bread from the order
    Then the cart should contain only Coffee
    And the order total should be $3.50

  Scenario: Orders support quantity adjustments
    Given Ryan is creating an order for a family
    When Ryan adds 3 Turkey Club sandwiches
    And Ryan increases the quantity to 5
    Then the order should show 5 Turkey Clubs
    And the total should be $60.00
