# Theme

Visual styling - colors, typography, animations. Mini Metro/Mini Motorways aesthetic.

## Design Principles

- **Minimalist** - clean geometric shapes
- **Flat colors** - no gradients or textures
- **High contrast** - clear visual hierarchy
- **Vector aesthetic** - crisp at any zoom
- **Smooth animations** - easing functions

## Files

- `colors.ts` - Color palette (hex values)
- `typography.ts` - Font sizes, weights (future)
- `animations.ts` - Easing curves, timings

## Example

```typescript
// theme/colors.ts
export const COLORS = {
  background: 0x1a1a1a,
  mapSurface: 0x2a2a2a,
  roadDefault: 0xffffff,
  roadPreview: 0xffffff, // with alpha
  controlPoint: 0x4a9eff,
} as const
```

## Usage

```typescript
import { COLORS } from '@/theme/colors'

graphics.lineStyle(4, COLORS.roadDefault)
```
