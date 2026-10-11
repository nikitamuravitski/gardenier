# Systems

Game logic that operates on entities with specific components. Systems have no state - they query the world and modify components.

## Design Rules

- **Stateless** - all state lives in components
- **Query-based** - find entities via component queries
- **No coupling** - don't import other systems
- **Single responsibility** - one concern per system

## Communication Methods

1. **Component queries** - find entities with specific components
2. **Events** - emit/listen to game events (via event bus)
3. **Spatial queries** - find entities in area (future)

## System Categories

### Core Loop
- Update systems (run every frame)
- Render systems (draw to screen)

### Input
- Mouse/keyboard handling
- UI interaction

### Simulation
- Roads, buildings, economy, population (future)

## Example

```typescript
export class RoadPlacementSystem {
  update(world: World, events: EventBus): void {
    // Query entities
    const roads = world.query([Position, RoadSegment])

    // Process logic
    // ...

    // Emit events
    events.emit('road_placed', { entity })
  }
}
```
