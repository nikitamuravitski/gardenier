import type { World } from './World'

/**
 * System interface - all systems must implement this
 * Systems contain logic that operates on entities with specific components
 */
export interface System {
  /**
   * Initialize system (called once)
   */
  init?(world: World): void

  /**
   * Update system (called every frame)
   * @param world - ECS world
   * @param deltaTime - time since last frame in seconds
   */
  update?(world: World, deltaTime: number): void

  /**
   * Cleanup system (called on destruction)
   */
  destroy?(): void
}
