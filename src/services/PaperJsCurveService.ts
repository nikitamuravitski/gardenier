import paper from 'paper'
import type { Position } from '@/components/Position'
import type { ICurveService, BezierSegment } from './CurveService'

/**
 * PaperJsCurveService - uses Paper.js for all curve operations
 * Industry-standard vector graphics library with robust algorithms
 */
export class PaperJsCurveService implements ICurveService {
  constructor() {
    // Initialize Paper.js in headless mode (no canvas)
    if (!paper.project) {
      paper.setup(new paper.Size(1, 1))
    }
  }

  /**
   * Extract Bézier segments from Paper.js smooth curve
   * Returns control points for native canvas/PixiJS bezierCurveTo rendering
   */
  getBezierSegments(waypoints: Position[]): BezierSegment[] {
    if (waypoints.length < 2) return []

    // Create smooth path
    const path = new paper.Path({
      segments: waypoints.map((wp) => new paper.Point(wp.x, wp.y)),
    })
    path.smooth({ type: 'catmull-rom' })

    // Extract Bézier segments with control points
    const segments: BezierSegment[] = []
    const pathSegments = path.segments

    for (let i = 0; i < pathSegments.length - 1; i++) {
      const current = pathSegments[i]
      const next = pathSegments[i + 1]

      segments.push({
        start: { x: current.point.x, y: current.point.y },
        cp1: {
          x: current.point.x + current.handleOut.x,
          y: current.point.y + current.handleOut.y,
        },
        cp2: {
          x: next.point.x + next.handleIn.x,
          y: next.point.y + next.handleIn.y,
        },
        end: { x: next.point.x, y: next.point.y },
      })
    }

    // Clean up
    path.remove()

    return segments
  }

  /**
   * Generate smooth Catmull-Rom curve using Paper.js
   */
  generateCurvePoints(waypoints: Position[], resolution: number = 50): Position[] {
    if (waypoints.length < 2) return [...waypoints]

    // Create path from waypoints
    const path = new paper.Path({
      segments: waypoints.map((wp) => new paper.Point(wp.x, wp.y)),
    })

    // Apply Catmull-Rom smoothing
    path.smooth({ type: 'catmull-rom' })

    // Sample points along the curve
    const points: Position[] = []
    const length = path.length
    const step = length / resolution

    for (let i = 0; i <= resolution; i++) {
      const offset = Math.min(i * step, length)
      const point = path.getPointAt(offset)
      if (point) {
        points.push({ x: point.x, y: point.y })
      }
    }

    // Clean up
    path.remove()

    return points
  }

  /**
   * Find exact intersections using Paper.js
   */
  findIntersections(waypointsA: Position[], waypointsB: Position[]): Position[] {
    if (waypointsA.length < 2 || waypointsB.length < 2) return []

    const pathA = this.createSmoothPath(waypointsA)
    const pathB = this.createSmoothPath(waypointsB)

    // Get intersections
    const intersections = pathA.getIntersections(pathB)

    // Convert to Position objects
    const result = intersections.map((intersection) => ({
      x: intersection.point.x,
      y: intersection.point.y,
    }))

    // Clean up
    pathA.remove()
    pathB.remove()

    return result
  }

  /**
   * Find closest point on curve to target position
   */
  closestPointOnCurve(
    waypoints: Position[],
    position: Position
  ): { point: Position; distance: number } | null {
    if (waypoints.length < 2) return null

    const path = this.createSmoothPath(waypoints)
    const target = new paper.Point(position.x, position.y)

    // Find closest point on path
    const closest = path.getNearestPoint(target)
    const distance = closest.getDistance(target)

    const result = {
      point: { x: closest.x, y: closest.y },
      distance,
    }

    // Clean up
    path.remove()

    return result
  }

  /**
   * Helper: Create smooth Paper.js path from waypoints
   */
  private createSmoothPath(waypoints: Position[]): paper.Path {
    const path = new paper.Path({
      segments: waypoints.map((wp) => new paper.Point(wp.x, wp.y)),
    })
    path.smooth({ type: 'catmull-rom' })
    return path
  }
}
