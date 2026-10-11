import { describe, it, expect } from 'vitest'
import { World } from '@/core/ecs/World'

describe('ECS World', () => {
  it('should create entities', () => {
    const world = new World()
    const entity = world.createEntity()
    expect(entity).toBeGreaterThan(0)
  })

  it('should add and retrieve components', () => {
    const world = new World()
    const entity = world.createEntity()

    const position = { x: 10, y: 20 }
    world.addComponent(entity, 'Position', position)

    const retrieved = world.getComponent(entity, 'Position')
    expect(retrieved).toEqual(position)
  })

  it('should query entities with components', () => {
    const world = new World()

    const e1 = world.createEntity()
    world.addComponent(e1, 'Position', { x: 0, y: 0 })

    const e2 = world.createEntity()
    world.addComponent(e2, 'Position', { x: 10, y: 10 })
    world.addComponent(e2, 'Velocity', { vx: 1, vy: 1 })

    const results = world.query(['Position', 'Velocity'])
    expect(results).toHaveLength(1)
    expect(results[0].entity).toBe(e2)
  })

  it('should destroy entities', () => {
    const world = new World()
    const entity = world.createEntity()
    world.addComponent(entity, 'Position', { x: 0, y: 0 })

    world.destroyEntity(entity)

    const retrieved = world.getComponent(entity, 'Position')
    expect(retrieved).toBeUndefined()
  })
})
