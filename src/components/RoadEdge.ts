/**
 * RoadEdge - logical connection in road network graph
 * Represents a road segment connecting two nodes
 */
export type RoadEdge = {
  id: string // Unique edge identifier
  nodeA: string // Start node ID
  nodeB: string // End node ID
  visualSegmentId: number // Entity ID of visual RoadSegment
  width: number // Road width (meters)
  roadType?: string // Future: different road types
}
