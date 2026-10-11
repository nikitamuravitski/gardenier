/**
 * Entity is a unique identifier (just a number)
 */
export type Entity = number

/**
 * Component constructor type
 */
export type ComponentConstructor<T = any> = new (...args: any[]) => T

/**
 * Component data (any object)
 */
export type Component = Record<string, any>

/**
 * Query result - entity with its components
 */
export type QueryResult<T extends Component = Component> = {
  entity: Entity
  components: T
}
