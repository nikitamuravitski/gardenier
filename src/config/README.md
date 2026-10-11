# Config

Game configuration constants. All tunable parameters in one place.

## Purpose

- Centralized configuration
- Easy tweaking without code changes
- Clear documentation of game parameters
- Property-based testing uses these for ranges

## Configuration Files

- `roads.ts` - Road placement parameters
- `camera.ts` - Camera controls (pan, zoom speeds)
- `rendering.ts` - Visual style parameters
- `input.ts` - Input sensitivity and controls

## Example

```typescript
// config/roads.ts
export const ROAD_CONFIG = {
  MIN_WIDTH: 2,  // meters
  MAX_WIDTH: 10, // meters
  DEFAULT_WIDTH: 4, // meters
  SNAP_RADIUS: 5, // meters
  // ... more params
} as const
```

## Design Rules

- **Use `as const`** for type inference
- **Document units** in comments (meters, seconds, pixels)
- **Group related params** in objects
- **Export individual configs** (not one giant object)
