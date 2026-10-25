import type { Position } from '@/components/Position'

/**
 * Represents a cubic Bézier curve segment
 */
export interface BezierSegment {
  /** Starting point */
  start: Position
  /** First control point */
  cp1: Position
  /** Second control point */
  cp2: Position
  /** Ending point */
  end: Position
}

/**
 * CurveService interface - abstraction for curve generation and intersection
 * Allows swapping implementations (Paper.js, custom math, etc.) without changing game code
 */
export interface ICurveService {
  /**
   * Get Bézier curve segments from waypoints for native rendering
   * @param waypoints - Control points defining the curve
   * @returns Array of cubic Bézier segments with control points
   */
  getBezierSegments(waypoints: Position[]): BezierSegment[]

  /**
   * Generate smooth curve points from waypoints
   * @param waypoints - Control points defining the curve
   * @param resolution - Number of points to generate (higher = smoother)
   * @returns Array of interpolated curve points
   */
  generateCurvePoints(waypoints: Position[], resolution?: number): Position[]

  /**
   * Find intersection points between two curves
   * @param waypointsA - First curve waypoints
   * @param waypointsB - Second curve waypoints
   * @returns Array of exact intersection points
   */
  findIntersections(waypointsA: Position[], waypointsB: Position[]): Position[]

  /**
   * Find closest point on curve to given position
   * @param waypoints - Curve waypoints
   * @param position - Target position
   * @returns Closest point on curve and distance
   */
  closestPointOnCurve(
    waypoints: Position[],
    position: Position
  ): { point: Position; distance: number } | null
}
