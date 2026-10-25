import type { Position } from './Position'

/**
 * RoadNode - logical node in road network graph
 * Represents intersections, endpoints, or connection points
 */
export type RoadNode = {
  id: string // Unique node identifier
  position: Position // World coordinates
  type: 'endpoint' | 'intersection' | 'junction'
  connectedEdges: string[] // Edge IDs connected to this node
}
