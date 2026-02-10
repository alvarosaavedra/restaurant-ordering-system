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

  Scenario: Accessing protected routes while logged out redirects to login
    Given I am not logged in
    When I navigate to "/orders/new"
    Then I should be redirected to "/login"

  @smoke
  Scenario: Session persists after page refresh
    Given I am logged in as an order taker
    When I refresh the page
    Then I should still be logged in as an order taker
