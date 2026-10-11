# Tests

Comprehensive testing strategy: unit, integration, simulation, and specification tests.

## Test Types

### Unit Tests (`/unit`)
- Test individual components and systems in isolation
- Fast, deterministic
- Use Vitest

### Integration Tests (`/integration`)
- Test multiple systems working together
- Validate system interactions
- Use Vitest

### Simulation Tests (`/simulation`)
- AI bots play the game
- Validate game state over time
- Performance testing
- Use Playwright

### Gherkin Specs (`/gherkin`)
- Feature specifications in Gherkin format
- AI generates tests from scenarios
- Living documentation

## Property-Based Testing

Use `fast-check` library for fuzzing:
```typescript
import fc from 'fast-check'

test('road width is always positive', () => {
  fc.assert(
    fc.property(fc.float({ min: 0, max: 100 }), (width) => {
      const road = createRoad(width)
      return road.width > 0
    })
  )
})
```

## Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# UI
pnpm test:ui
```
