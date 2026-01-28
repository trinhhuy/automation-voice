Feature: Login

  Scenario: User can login successfully
    When I access SSO callback with code "123"
    Then I should see dashboard
