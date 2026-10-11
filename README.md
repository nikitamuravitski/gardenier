# Gardenier

Browser-based medieval strategy game with minimalist aesthetic inspired by Mini Metro/Mini Motorways.

## Features (Planned)

- **Road placement** with dynamic width control
- **Real-time strategy** with pause/speed controls
- **City building** mechanics
- **Economy simulation**
- **ECS architecture** for modularity and extensibility

## Tech Stack

- **TypeScript** - Type-safe development
- **PixiJS** - High-performance 2D rendering
- **Vite** - Fast build tooling
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **fast-check** - Property-based testing

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Build for production
pnpm build

# Type check
pnpm type-check
```

## Architecture

See [DESIGN.md](./DESIGN.md) for detailed architecture and design decisions.

### Module Structure

- `/src/core` - ECS engine and game loop
- `/src/components` - Pure data components
- `/src/systems` - Game logic systems
- `/src/events` - Event bus and event types
- `/src/utils` - Utility functions
- `/src/theme` - Visual styling
- `/tests` - Test suites

## Current Status

**Phase:** Foundation scaffolding
**MVP Goal:** Road placement system on flat map

## License

MIT
