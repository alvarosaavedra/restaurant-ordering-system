Feature: User Authentication
  As a restaurant staff member
  I want to securely access the ordering system
  So that I can perform my role-specific duties

  Business Context:
  Different roles have different access needs:
  - Order takers create and manage customer orders
  - Kitchen staff view and update order preparation status
  - Delivery staff manage order delivery
  - Admins oversee all operations

  @smoke @critical
  Scenario Outline: Staff members access their role-specific dashboard after login
    Given <role> Ryan has an account with password "securePass123"
    When Ryan logs in with "<email>" and "securePass123"
    Then Ryan should be taken to the <destination>
    And Ryan should see his assigned tasks

    Examples:
      | role         | email                    | destination          |
      | order taker  | ryan.order@restaurant.com | order creation page  |
      | kitchen      | ryan.kitchen@restaurant.com | kitchen view        |
      | delivery     | ryan.delivery@restaurant.com | delivery view      |
      | admin        | ryan.admin@restaurant.com | admin dashboard     |

  Scenario: Invalid credentials prevent system access
    Given a user has an account
    When they attempt to log in with incorrect credentials
    Then they should see an authentication error
    And they should remain on the login page

  Scenario: Missing credentials trigger validation
    Given a user is on the login page
    When they submit the login form without credentials
    Then they should see validation messages for required fields

  Scenario: Staff members can securely log out
    Given Ryan is logged in as an order taker
    When Ryan logs out
    Then Ryan should be returned to the login page
    And Ryan's session should be terminated

  Scenario: Unauthenticated users are redirected to login
    Given a user is not logged in
    When they attempt to access a protected page
    Then they should be redirected to the login page

  @smoke
  Scenario: Sessions persist during normal use
    Given Ryan is logged in as an order taker
    When Ryan continues working without logging out
    Then Ryan should remain authenticated throughout the session
