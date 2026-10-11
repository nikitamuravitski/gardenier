Feature: Road Placement
  As a player
  I want to place roads on the map
  So that I can build a network for my settlement

  Background:
    Given an empty map
    And the game is initialized

  Scenario: Place a simple road between two points
    When I click at position (10, 10)
    And I click at position (20, 20)
    And I confirm the road placement
    Then a road should exist
    And the road should connect point (10, 10) to point (20, 20)

  Scenario: Cancel road placement
    When I click at position (10, 10)
    And I click at position (20, 20)
    And I cancel the road placement
    Then no road should be created

  Scenario: Place multi-point road
    When I click at position (0, 0)
    And I click at position (10, 0)
    And I click at position (10, 10)
    And I confirm the road placement
    Then a road should exist with 3 waypoints

  Scenario: Adjust road width while placing
    When I start placing a road at (0, 0)
    And I add a waypoint at (20, 0)
    And I drag the width control point perpendicular by 3 meters
    And I confirm the road placement
    Then the road width should be 6 meters at that point

  Scenario: Roads snap to existing roads
    Given a road exists from (0, 0) to (10, 0)
    And snap is enabled
    When I click at position (10, 1)
    Then the placement should snap to position (10, 0)

  Scenario: Disable road snapping
    Given a road exists from (0, 0) to (10, 0)
    And snap is disabled
    When I click at position (10, 1)
    Then the placement should be at position (10, 1)

  Scenario: Road preview while placing
    When I click at position (0, 0)
    And I move the mouse to position (10, 10)
    Then a preview road should be visible from (0, 0) to (10, 10)

  Scenario: Invalid road placement
    When I click at position (0, 0)
    And I click at an invalid position
    Then the road preview should show as invalid
    And I should not be able to confirm placement
