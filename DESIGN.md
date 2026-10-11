# Gardenier - Game Design Document

## Vision

Browser-based real-time strategy game inspired by Manor Lords. Medieval fictional setting prioritizing playability over historical accuracy. Top-down view with pausable real-time gameplay.

**Visual Style:** Mini Metro / Mini Motorways aesthetic - minimalist, geometric, clean lines, flat colors.

## MVP Scope: Road Placement System

**Goal:** Place roads on a flat map with dynamic width control.

### Core Features
- Multi-point road placement (click waypoints)
- Variable width along road length
- Snap to existing roads (toggleable)
- Collision detection (rules TBD)
- Real-time preview during placement
- Time controls (pause/1x/2x/4x) - future

## Architecture

### Tech Stack
- **Language:** TypeScript (required)
- **Rendering:** PixiJS (latest stable) - vector-style graphics
- **Architecture:** Entity Component System (ECS)
- **Build Tool:** Vite
- **Testing:** Vitest + Playwright + fast-check (property-based)
- **Specs:** Gherkin (BDD scenarios)

### Design Principles
1. **Modularity First** - Systems must not couple to each other
2. **Agentic-Friendly** - Clear boundaries, predictable patterns, AI-readable code
3. **ECS Pattern** - Components are pure data, systems contain logic, entities are IDs
4. **Test-Driven** - Gherkin specs, unit tests, fuzzing, simulation bots

### Module Structure

```
/src
  /core
    /ecs           # Generic ECS engine (entities, world, queries)
  /components      # Pure data (Position, RoadSegment, Width, etc.)
  /systems         # Logic operating on components
    /roads         # Road placement, validation, rendering
    /rendering     # PixiJS systems
    /input         # Mouse/keyboard handling
    /camera        # Pan, zoom, viewport
  /events          # Event bus and event types
  /queries         # Reusable component queries
  /config          # Game constants (tunable parameters)
  /utils           # Math, geometry, splines
  /theme           # Visual style (colors, line weights, animations)
/tests
  /unit            # Component/system unit tests
  /integration     # Multi-system tests
  /simulation      # AI bot playtests
  /gherkin         # Feature specifications
```

### Decoupling Strategy

**No direct entity-to-entity references:**
- Systems use **spatial queries** to find nearby entities
- Systems use **event bus** for notifications
- Systems use **tag components** for capabilities (e.g., `Connectable`)

**Example:**
```typescript
// ❌ BAD: Building imports Road
class Building {
  connectToRoad(road: Road) { }
}

// ✅ GOOD: System coordinates via queries
function RoadConnectionSystem(world: World) {
  const roads = world.query([Position, RoadSegment])
  const connectables = world.query([Position, Connectable])
  // Match them without direct coupling
}
```

## Visual Design

### Art Style: Mini Metro / Mini Motorways

**Core Principles:**
- **Minimalist geometry** - roads as clean lines, buildings as simple shapes
- **Flat colors** - solid fills, no gradients or textures
- **High contrast** - clear visual hierarchy
- **Vector aesthetic** - crisp at any zoom level
- **Smooth animations** - easing functions, fluid transitions
- **Abstract representation** - functional clarity over realism

**Visual Elements:**

**Roads:**
- Rendered as thick lines with rounded caps
- Solid color fill
- Subtle outline/border for depth
- Preview: dashed or semi-transparent
- Width visualized by line thickness

**Buildings (future):**
- Simple geometric shapes (rectangles, circles, polygons)
- Solid color fills
- Minimal decoration
- Icon-based identification

**Map:**
- Flat background color
- Optional subtle grid overlay (toggleable)
- No texture, pure color

**UI:**
- Clean sans-serif typography
- Minimal chrome
- Floating panels with subtle shadows
- Icon-based controls

### Color Palette (Inspired by Mini Metro)

```typescript
// theme/colors.ts
export const THEME = {
  background: '#1a1a1a',      // Dark background
  map: '#2a2a2a',             // Map surface

  // Roads
  roadDefault: '#ffffff',      // White roads
  roadPreview: '#ffffff80',    // Semi-transparent preview
  roadInvalid: '#ff4444',      // Red for invalid placement

  // Control points
  controlPoint: '#4a9eff',     // Blue handles
  controlPointHover: '#6ab0ff',

  // UI
  uiPrimary: '#ffffff',
  uiSecondary: '#888888',
  uiAccent: '#4a9eff',

  // Grid (optional)
  gridLines: '#333333',
}
```

### Rendering Approach

**PixiJS Graphics API:**
- Use `PIXI.Graphics` for roads (vector drawing)
- Render roads as `lineStyle()` + `lineTo()` paths
- Smooth curves via quadratic/bezier curves
- Scale line width based on zoom level for consistent visual weight

**Anti-aliasing:**
- Enable for smooth lines
- Crisp edges even at high zoom

**Animation:**
- Smooth camera easing
- Width control point dragging with spring physics
- Road placement confirmation animation

## Road System Design

### Road Placement Flow

1. **User clicks waypoint** on map
2. **Preview spline** renders from last point to mouse
3. **Width control points** appear along preview (evenly spaced)
4. **User clicks additional waypoints** (multi-point path)
5. **User adjusts width** by dragging control points perpendicular to road
6. **Double-click or Enter** confirms placement
7. **Road entity created** with all segments

### Road Data Model

```typescript
// Components
type Position = { x: number, y: number }  // meters

type RoadSegment = {
  waypoints: Position[]        // User-clicked points
  spline: BezierCurve[]        // Generated smooth path
  widthProfile: WidthPoint[]   // Width at each control point
}

type WidthPoint = {
  t: number              // Position along spline (0-1)
  width: number          // Width in meters (symmetric)
  position: Position     // World position of control point
}

type Snappable = {
  snapRadius: number     // Distance for auto-snap
  snapEnabled: boolean   // Toggle on/off
}

type Renderable = {
  color: number          // Hex color
  visible: boolean
  zIndex: number
}
```

### Width Control Mechanics

**Control Point Subdivision:**
- Length < X units → 1 control point (TBD threshold)
- Length X-Y units → 3 control points
- Length > Y units → 5 control points
- Points evenly spaced (CSS `justify-between`)

**Width Adjustment:**
- Click and drag control point **perpendicular** to road direction
- Drag distance from centerline = road width
- Symmetric expansion (both sides equal)
- Real-time preview updates
- Visual feedback: control point scales on hover

### Validation Rules (MVP)

- ✅ Free to build (no resource cost)
- ✅ Snap to existing roads (configurable radius)
- ✅ Collision detection framework (exact rules TBD)
- ❌ Terrain effects (future - flat map for now)
- ❌ Resource costs (future)

## Rendering & Camera

### World Coordinates
- **1 world unit = 1 meter** (standard gamedev convention)
- Buildings: ~5-10m
- Roads: ~3-5m wide
- Map: 100s of meters

### Viewport
- **Fullscreen responsive** canvas
- Maintains aspect ratio
- Adapts to window resize

### Camera Controls
- **Pan:** WASD keys OR hover near screen edges
- **Zoom:** Mouse wheel OR F (zoom in) / R (zoom out)
- **Initial view:** Center at (0, 0), viewing ~50x50m area
- **Smooth easing** on all camera movements (Mini Metro style)

## Testing Strategy

### 1. Gherkin Specifications
- Feature files in `/tests/gherkin/`
- AI generates tests from scenarios
- Clear acceptance criteria

**Example:**
```gherkin
Feature: Road Placement
  Scenario: Place simple road between two points
    Given an empty map
    When I click at position (10, 10)
    And I click at position (20, 20)
    And I confirm placement
    Then a road should exist connecting both points
```

### 2. Property-Based Testing (Fuzzing)
- Use `fast-check` library
- Generate random road placements
- Validate invariants (no NaN, valid splines, etc.)

### 3. Simulation Testing
- AI bots execute game actions
- Validate state transitions
- Performance testing under load

### 4. Visual Regression
- Playwright snapshots
- Detect rendering changes
- UI component testing

## Future Systems (Post-MVP)

### City Building
- Building placement
- Organic plot generation
- Road-based layout
- Geometric building shapes (circles, rectangles, hexagons)

### Economy
- Resource gathering (wood, stone, food)
- Production chains
- Storage systems
- Trade
- Abstract resource visualization (flowing particles, color pulses)

### Population
- Villager simulation
- Pathfinding
- Job assignment
- Family systems
- Visualized as moving dots/shapes along roads

### Combat
- Unit control
- Formations
- Tactical battles
- Abstract unit representation

### Terrain
- Height maps (color-coded elevation)
- Resource deposits (geometric markers)
- Water/obstacles (solid shapes)
- Seasonal changes (palette shifts)

## Git Workflow

**Hybrid approach:**
- Small changes → commit to main
- Large features → feature branches + PR
- AI agents follow same pattern

## References & Learning Resources

### Code Architecture
- [Kaetram](https://github.com/Kaetram/Kaetram-Open) - 2D HTML5 MMORPG
- [DOGE](https://github.com/heypoom/DOGE) - ECS + PixiJS + Matter.js
- [ecs-typescript-game](https://github.com/nisimjoseph/ecs-typescript-game) - Clean ECS patterns
- [Excalibur.js](https://github.com/excaliburjs/Excalibur) - Mature TypeScript 2D engine

### Visual Inspiration
- **Mini Metro** - minimalist transit network builder
- **Mini Motorways** - road network strategy
- Clean geometric design, flat colors, smooth animations

## Configuration Parameters (TBD)

These need playtesting to tune:

```typescript
// config/roads.ts
export const ROAD_CONFIG = {
  // Width control point thresholds
  MIN_LENGTH_FOR_3_POINTS: number,  // TBD
  MIN_LENGTH_FOR_5_POINTS: number,  // TBD

  // Snapping
  DEFAULT_SNAP_RADIUS: number,      // TBD (meters)

  // Width constraints
  MIN_ROAD_WIDTH: number,           // TBD (meters)
  MAX_ROAD_WIDTH: number,           // TBD (meters)
  DEFAULT_ROAD_WIDTH: number,       // TBD (meters)

  // Rendering
  SPLINE_RESOLUTION: number,        // Points per segment
  LINE_CAP_STYLE: 'round',          // Rounded road ends
  ROAD_OUTLINE_WIDTH: number,       // Border thickness

  // Input
  EDGE_SCROLL_MARGIN: number,       // Pixels from edge
  EDGE_SCROLL_SPEED: number,        // Units per second
  WASD_PAN_SPEED: number,           // Units per second
  ZOOM_SPEED: number,               // Scale per wheel tick
  MIN_ZOOM: number,                 // Max zoom out
  MAX_ZOOM: number,                 // Max zoom in

  // Animation
  CAMERA_EASING: number,            // 0-1, camera smoothing
  WIDTH_DRAG_DAMPING: number,       // Spring damping for control points
}
```

## Open Questions

1. Exact subdivision thresholds for width control points
2. Snap radius value
3. Collision detection rules
4. Default/min/max road widths
5. Spline interpolation method (Catmull-Rom, Bezier, etc.)
6. Control point drag sensitivity
7. Final color palette (Mini Metro inspired but unique)
8. Animation timing curves

These will be answered through iterative playtesting.

---

**Document Version:** 1.1
**Last Updated:** 2026-10-11
**Status:** Foundation phase - ready for scaffolding
