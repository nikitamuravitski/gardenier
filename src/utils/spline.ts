import type { Position } from '@/components/Position'

/**
 * Generate smooth curve points using Catmull-Rom spline
 * Passes through all control points naturally
 *
 * @param controlPoints - Waypoints to interpolate
 * @param segments - Points per segment (higher = smoother)
 * @returns Array of interpolated positions
 */
export function catmullRomSpline(
  controlPoints: Position[],
  segments: number = 20
): Position[] {
  if (controlPoints.length < 2) return [...controlPoints]
  if (controlPoints.length === 2) {
    // Straight line for 2 points
    return linearInterpolate(controlPoints[0], controlPoints[1], segments)
  }

  const result: Position[] = []

  // Extend endpoints for smooth start/end
  const points = [
    controlPoints[0], // Duplicate first point
    ...controlPoints,
    controlPoints[controlPoints.length - 1], // Duplicate last point
  ]

  // Interpolate between each pair of control points
  for (let i = 1; i < points.length - 2; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2]

    for (let t = 0; t < segments; t++) {
      const u = t / segments
      const point = catmullRomPoint(p0, p1, p2, p3, u)
      result.push(point)
    }
  }

  // Add final point
  result.push(controlPoints[controlPoints.length - 1])

  return result
}

/**
 * Calculate single point on Catmull-Rom curve
 */
function catmullRomPoint(
  p0: Position,
  p1: Position,
  p2: Position,
  p3: Position,
  t: number
): Position {
  const t2 = t * t
  const t3 = t2 * t

  const x =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3)

  const y =
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)

  return { x, y }
}

/**
 * Linear interpolation between two points
 */
function linearInterpolate(p1: Position, p2: Position, segments: number): Position[] {
  const result: Position[] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    result.push({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    })
  }

  return result
}
