import type { Position } from './Position'

/**
 * RoadSegment component - defines a road path
 * Simplified MVP version - just waypoints
 */
export type RoadSegment = {
  waypoints: Position[] // User-clicked points
  width: number // Fixed width for MVP (meters)
}
