import type { Entity, Component } from './types'

/**
 * World contains all entities and their components
 * Entities are just IDs, components are stored in Maps
 */
export class World {
  private nextEntityId = 1
  private entities = new Set<Entity>()
  private components = new Map<string, Map<Entity, Component>>()

  /**
   * Create a new entity (returns ID)
   */
  createEntity(): Entity {
    const entity = this.nextEntityId++
    this.entities.add(entity)
    return entity
  }

  /**
   * Destroy an entity and all its components
   */
  destroyEntity(entity: Entity): void {
    this.entities.delete(entity)
    for (const componentMap of this.components.values()) {
      componentMap.delete(entity)
    }
  }

  /**
   * Add a component to an entity
   */
  addComponent<T extends Component>(
    entity: Entity,
    componentName: string,
    component: T
  ): void {
    if (!this.components.has(componentName)) {
      this.components.set(componentName, new Map())
    }
    this.components.get(componentName)!.set(entity, component)
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entity: Entity, componentName: string): void {
    this.components.get(componentName)?.delete(entity)
  }

  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(
    entity: Entity,
    componentName: string
  ): T | undefined {
    return this.components.get(componentName)?.get(entity) as T | undefined
  }

  /**
   * Check if entity has a component
   */
  hasComponent(entity: Entity, componentName: string): boolean {
    return this.components.get(componentName)?.has(entity) ?? false
  }

  /**
   * Query entities that have ALL specified components
   * Returns array of [entity, components] tuples
   */
  query<T extends Record<string, Component>>(
    componentNames: string[]
  ): Array<{ entity: Entity; components: T }> {
    const results: Array<{ entity: Entity; components: T }> = []

    for (const entity of this.entities) {
      const components: any = {}
      let hasAll = true

      for (const name of componentNames) {
        const component = this.getComponent(entity, name)
        if (!component) {
          hasAll = false
          break
        }
        components[name] = component
      }

      if (hasAll) {
        results.push({ entity, components })
      }
    }

    return results
  }

  /**
   * Get all entities (for debugging)
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities)
  }

  /**
   * Clear all entities and components
   */
  clear(): void {
    this.entities.clear()
    this.components.clear()
    this.nextEntityId = 1
  }
}
