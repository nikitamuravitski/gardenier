# Requirements: Road Placement System (MVP)

## Overview

This document specifies the behavior of the road placement system for Gardenier. All scenarios follow Gherkin format for AI-driven test generation.

## Feature: Road Placement

**As a** player
**I want to** place roads on the map with variable width
**So that** I can build a transportation network for my settlement

### Background

```gherkin
Given an empty flat map
And the game is initialized with default settings
And the camera is positioned at (0, 0) with zoom level 1.0
```

---

## Scenarios

### Basic Placement

#### Scenario: Place a simple straight road

```gherkin
Given an empty map
When I click at world position (10, 10)
And I click at world position (30, 10)
And I press Enter to confirm
Then a road entity should exist
And the road should have exactly 2 waypoints
And the waypoints should be at positions (10, 10) and (30, 10)
And the road should have default width (4 meters)
```

#### Scenario: Place a multi-point road

```gherkin
Given an empty map
When I click at position (0, 0)
And I click at position (10, 0)
And I click at position (10, 10)
And I press Enter to confirm
Then a road entity should exist
And the road should have exactly 3 waypoints
And a smooth spline should connect all waypoints
```

#### Scenario: Cancel road placement

```gherkin
Given I have clicked 2 waypoints
And a road preview is visible
When I press Escape
Then the road preview should disappear
And no road entity should be created
And the placement mode should be reset
```

---

### Width Control

#### Scenario: Road subdivides into width control points based on length

```gherkin
Given I am placing a road
When I click waypoint A
And I click waypoint B that is 5 meters from A
Then the road should have 1 width control point

When I click waypoint C that is 20 meters from B
Then the segment B→C should have 3 width control points

When I click waypoint D that is 35 meters from C
Then the segment C→D should have 5 width control points
```

#### Scenario: Adjust road width by dragging control point

```gherkin
Given a road preview with a width control point at position (10, 0)
And the control point has default width (4 meters)
When I click and drag the control point perpendicular to the road
And I drag it 3 meters away from the centerline
Then the control point width should update to 6 meters
And the road rendering should update in real-time
And the width should be symmetric on both sides
```

#### Scenario: Width control points are evenly spaced

```gherkin
Given a road segment from (0, 0) to (30, 0)
And the segment has 5 width control points
Then the control points should be at t = [0, 0.25, 0.5, 0.75, 1.0] along the spline
And the spacing should match CSS "justify-content: space-between"
```

#### Scenario: Width constraints are enforced

```gherkin
Given a width control point
When I try to set width to 1 meter
Then the width should be clamped to MIN_WIDTH (2 meters)

When I try to set width to 15 meters
Then the width should be clamped to MAX_WIDTH (10 meters)
```

---

### Snapping Behavior

#### Scenario: Road snaps to nearby existing road when enabled

```gherkin
Given a road exists from (0, 0) to (20, 0)
And snap is enabled
And snap radius is 5 meters
When I click at position (20, 3)
Then the waypoint should snap to position (20, 0)
And a visual indicator should show the snap occurred
```

#### Scenario: Road does not snap when disabled

```gherkin
Given a road exists from (0, 0) to (20, 0)
And snap is disabled
When I click at position (20, 3)
Then the waypoint should be placed at exactly (20, 3)
And no snap indicator should appear
```

#### Scenario: Toggle snap with keyboard shortcut

```gherkin
Given snap is enabled
When I press the 'S' key
Then snap should be disabled
And a UI indicator should show snap is off

When I press the 'S' key again
Then snap should be enabled
And the UI indicator should show snap is on
```

#### Scenario: Snap only occurs within snap radius

```gherkin
Given a road exists at position (0, 0)
And snap radius is 5 meters
When I click at position (0, 4)
Then the waypoint should snap to (0, 0)

When I click at position (0, 6)
Then the waypoint should NOT snap
And should be placed at (0, 6)
```

---

### Visual Feedback

#### Scenario: Road preview renders while placing

```gherkin
Given I have placed one waypoint at (0, 0)
When I move my mouse to position (10, 10)
Then a preview road should render from (0, 0) to (10, 10)
And the preview should use semi-transparent white color (alpha 0.5)
And width control points should be visible on the preview
```

#### Scenario: Control points highlight on hover

```gherkin
Given a road preview with width control points
When I hover my mouse within 1.5 meters of a control point
Then the control point color should change to hover color (0x6ab0ff)
And the control point should scale up by 20%

When I move my mouse away
Then the control point should return to default color (0x4a9eff)
And the control point should return to default scale
```

#### Scenario: Invalid placement shows visual feedback

```gherkin
Given I am placing a road
When the placement is invalid due to collision
Then the preview road should render in red (0xff4444)
And the confirmation action should be disabled
```

---

### Spline Generation

#### Scenario: Smooth spline is generated from waypoints

```gherkin
Given waypoints at positions [(0, 0), (10, 5), (20, 0)]
When the spline is generated
Then the road should follow a smooth curve
And the spline should pass through all waypoints
And there should be no sharp corners
```

#### Scenario: Spline respects maximum curve angle

```gherkin
Given two waypoints with an angle > 90 degrees between them
When the spline is generated
Then the curve should be smoothed
And no segment should exceed MAX_ROAD_ANGLE (90 degrees)
```

---

### Validation Rules

#### Scenario: Minimum segment length is enforced

```gherkin
Given a waypoint at (0, 0)
When I try to place a waypoint at (0, 0.5)
And the distance is less than MIN_SEGMENT_LENGTH (1 meter)
Then the waypoint should not be accepted
And a validation error should be shown
```

#### Scenario: Roads cost nothing in MVP

```gherkin
Given I place a road of any length
Then no resources should be consumed
And no cost validation should occur
```

---

### Collision Detection

#### Scenario: Collision detection framework exists

```gherkin
Given the road placement system is initialized
Then a collision detection system should exist
And it should be able to query entities at a position
But collision rules are NOT enforced in MVP
```

**Note:** Exact collision rules are TBD. Framework is in place but inactive for MVP.

---

### Edge Cases

#### Scenario: Very short road (single point)

```gherkin
Given I click at position (5, 5)
When I immediately press Enter without adding more waypoints
Then no road should be created
And an error message should display "Road requires at least 2 waypoints"
```

#### Scenario: Extremely long road

```gherkin
Given I create a road with 50 waypoints
Then the road should be created successfully
And performance should remain acceptable (>30 FPS)
```

#### Scenario: Rapid clicking

```gherkin
Given I rapidly click 10 times per second
Then each click should register as a separate waypoint
And no clicks should be dropped
And preview should update smoothly
```

---

## Configuration Parameters

All tunable values are in `src/config/roads.ts`:

- `MIN_WIDTH`: 2 meters
- `MAX_WIDTH`: 10 meters
- `DEFAULT_WIDTH`: 4 meters
- `MIN_LENGTH_FOR_3_POINTS`: 15 meters
- `MIN_LENGTH_FOR_5_POINTS`: 30 meters
- `DEFAULT_SNAP_RADIUS`: 5 meters
- `SNAP_ENABLED_BY_DEFAULT`: true
- `MIN_SEGMENT_LENGTH`: 1 meter
- `MAX_ROAD_ANGLE`: π/2 (90 degrees)

---

## Out of Scope (Future)

The following are explicitly **NOT** in MVP:

- ❌ Resource costs for roads
- ❌ Terrain effects (hills, water)
- ❌ Road upgrades or types
- ❌ Building placement
- ❌ Traffic/pathfinding simulation
- ❌ Multi-player or networking
- ❌ Saving/loading roads

---

## Acceptance Criteria

**The MVP is complete when:**

1. All scenarios in this document pass automated tests
2. Property-based tests (fuzzing) pass for road generation
3. Visual regression tests show correct rendering
4. Performance remains >60 FPS with 50+ roads on screen
5. Camera controls work smoothly
6. User can place, preview, adjust width, and confirm roads
7. Snap toggling works
8. Road data persists in ECS world (no persistence layer needed yet)

---

## Notes for AI Agents

- Use this document to generate test cases
- Each scenario should map to at least one automated test
- Validate edge cases thoroughly
- When implementing, refer to `DESIGN.md` for architecture
- All coordinates are in **meters** (world units)
- Colors are hex values from `src/theme/colors.ts`
