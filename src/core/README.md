# Core

Game engine core - ECS implementation and main game loop.

## Responsibilities

- Entity management (create, destroy, query)
- Component storage and lookup
- System scheduling and execution
- Game loop (update, render)
- World state management

## Key Files

- `Game.ts` - Main game class, coordinates all systems
- `ecs/World.ts` - Entity-Component-System world container
- `ecs/Entity.ts` - Entity ID management
- `ecs/System.ts` - Base system interface

## Design Principles

- **Pure ECS**: Entities are IDs, components are data, systems are logic
- **No coupling**: Systems don't import each other
- **Generic**: Reusable across different game types
