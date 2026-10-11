# Events

Event bus for decoupled communication between systems.

## Purpose

Systems communicate via events instead of direct calls, preventing coupling.

## Event Types

```typescript
type GameEvent =
  | { type: 'road_placed', entity: Entity, position: Position }
  | { type: 'road_removed', entity: Entity }
  | { type: 'building_placed', entity: Entity }
  // ... more events
```

## Usage

```typescript
// Emit event
events.emit('road_placed', { entity, position })

// Listen to event
events.on('road_placed', (data) => {
  // React to road placement
})
```

## Design Rules

- **Type-safe** - use discriminated unions
- **Immutable payloads** - don't modify event data
- **Synchronous** - events are processed immediately (for now)
