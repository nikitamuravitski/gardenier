# Road Snapping Features

## 1. Priority Snapping to Intersection Points

### Behavior
- **Intersection nodes prioritized** over curve points when both are within snap radius
- **Visual distinction**:
  - Yellow ring = snapping to intersection
  - Green ring = snapping to curve
- **Free placement**: Hold Shift to disable ALL snapping (intersection + curve)

### Implementation
- Modified `findSnapPoint()` to check intersection nodes first
- Returns `{point, type}` where type is `'intersection'` or `'curve'`
- Queries `roadGraph.getAllNodes()` and filters for `type === 'intersection'`
- Falls back to curve snapping if no intersections within radius

### File: `/src/systems/roads/RoadPlacementSystem.ts`
- Line 35: Added `snapType` state
- Lines 247-313: Rewritten `findSnapPoint()` method
- Lines 133-143, 145-152: Added keydown/keyup handlers for Shift hold (disables all snapping)

---

## 2. Auto-Waypoints at Intersections (While Dragging)

### Behavior
- **Real-time detection**: As cursor moves, preview path checked for nearby intersections
- **Automatic insertion**: Intersections within snap radius auto-added as temporary waypoints
- **Visual feedback**: Orange hollow circles show auto-waypoints
- **Preview routing**: Curve automatically routes through detected intersections
- **Cleanup**: Auto-waypoints cleared when user clicks or cancels

### How It Works
1. Each mouse move, `updateAutoWaypoints()` runs
2. Checks path from last user waypoint to cursor position
3. Finds intersection nodes within snap radius of preview curve
4. Sorts by distance from last waypoint (maintains order)
5. Renders preview as: `[...userWaypoints, ...autoWaypoints, cursor]`

### Implementation Details
- **Algorithm**: Uses `curveService.closestPointOnCurve()` to measure distance from each intersection to preview path
- **Snap radius**: Same as curve snapping (50px / 5 meters)
- **Performance**: Only checks intersection nodes (not all curve points)
- **Ordering**: Intersections sorted by distance from last waypoint to ensure correct path

### File: `/src/systems/roads/RoadPlacementSystem.ts`
- Line 24: Added `autoWaypoints: Position[]` state
- Lines 108-121: Updated `handleMouseMove()` to call `updateAutoWaypoints()`
- Lines 134-176: Updated `drawPreview()` to render auto-waypoints
- Lines 243-281: New `updateAutoWaypoints()` method

---

## Visual Indicators

| Element | Appearance | Meaning |
|---------|------------|---------|
| **Yellow ring** | 8px radius, yellow outline | Snapping to intersection node |
| **Green ring** | 8px radius, green outline | Snapping to curve point |
| **Orange hollow circle** | 6px radius, orange outline | Auto-waypoint at intersection |
| **Blue solid dot** | 4px radius, blue fill | User-placed waypoint |
| **Orange intersection preview** | 6px radius, orange fill | Intersection after road is placed |

---

## Controls

| Key | Action |
|-----|--------|
| **Click** | Place waypoint (snaps if enabled) |
| **Double-click** | Confirm placement (requires ≥2 waypoints) |
| **Enter** | Confirm placement (requires ≥2 waypoints) |
| **Escape** | Cancel placement |
| **Shift (hold)** | Disable ALL snapping while held (free placement mode) |

---

## Edge Cases Handled

1. **Multiple intersections**: All detected, ordered by distance
2. **Intersection at cursor**: Won't duplicate (snap preview takes precedence)
3. **No waypoints yet**: Auto-detection skipped (nothing to route from)
4. **Shift hold**: Disables ALL snapping (intersection + curve) and auto-waypoints while held
5. **Placement/cancel**: Auto-waypoints cleared on confirm or cancel

---

## Technical Notes

- Auto-waypoints are **ephemeral**: never saved to graph, only for preview
- Detection is **per-frame**: recalculated every mouse move
- Curve service ensures **smooth routing** through auto-waypoints
- Intersection priority is **hard**: intersections always beat curves when both are in range
