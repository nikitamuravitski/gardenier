# Components

Pure data structures with no logic. Components are attached to entities.

## Design Rules

- **Data only** - no methods, no logic
- **Plain objects** - serializable
- **No entity references** - use entity IDs if needed
- **Small and focused** - one concern per component

## Component Categories

### Spatial
- `Position` - x, y coordinates in world space (meters)
- `Rotation` - angle in radians

### Rendering
- `Renderable` - color, visibility, z-index
- `Sprite` - texture reference (future)

### Roads
- `RoadSegment` - waypoints, spline, width profile
- `WidthPoint` - control points for road width

### Interaction
- `Snappable` - snap behavior configuration
- `Selectable` - can be selected by user (future)
- `Draggable` - can be dragged by user (future)

## Example

```typescript
export type Position = {
  x: number  // meters
  y: number  // meters
}
```
