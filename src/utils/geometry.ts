import type { Position } from '@/components/Position'

/**
 * Calculate distance between two points
 */
export function distance(p1: Position, p2: Position): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Find closest point from a list
 * @returns {point, distance} or null if list is empty
 */
export function findClosest(
  target: Position,
  points: Position[]
): { point: Position; distance: number } | null {
  if (points.length === 0) return null

  let closest = points[0]
  let minDist = distance(target, closest)

  for (let i = 1; i < points.length; i++) {
    const dist = distance(target, points[i])
    if (dist < minDist) {
      minDist = dist
      closest = points[i]
    }
  }

  return { point: closest, distance: minDist }
}

/**
 * Find closest point on a polyline (array of connected points)
 * Returns the point on the line and its distance from target
 */
export function closestPointOnPolyline(
  target: Position,
  polyline: Position[]
): { point: Position; distance: number } | null {
  if (polyline.length < 2) return null

  let closestPoint = polyline[0]
  let minDistance = distance(target, closestPoint)

  // Check each line segment
  for (let i = 0; i < polyline.length - 1; i++) {
    const p1 = polyline[i]
    const p2 = polyline[i + 1]

    const closest = closestPointOnSegment(target, p1, p2)
    const dist = distance(target, closest)

    if (dist < minDistance) {
      minDistance = dist
      closestPoint = closest
    }
  }

  return { point: closestPoint, distance: minDistance }
}

/**
 * Find closest point on a line segment
 */
function closestPointOnSegment(p: Position, a: Position, b: Position): Position {
  const dx = b.x - a.x
  const dy = b.y - a.y

  // Handle degenerate case (zero-length segment)
  if (dx === 0 && dy === 0) return a

  // Calculate parameter t (0-1 along segment)
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy))
  )

  return {
    x: a.x + t * dx,
    y: a.y + t * dy,
  }
}

/**
 * Find intersection point between two line segments
 * Returns intersection point or null if lines don't intersect
 */
export function lineSegmentIntersection(
  a1: Position,
  a2: Position,
  b1: Position,
  b2: Position
): Position | null {
  const dx1 = a2.x - a1.x
  const dy1 = a2.y - a1.y
  const dx2 = b2.x - b1.x
  const dy2 = b2.y - b1.y

  const denominator = dx1 * dy2 - dy1 * dx2

  // Lines are parallel or coincident
  if (Math.abs(denominator) < 1e-10) return null

  const dx3 = a1.x - b1.x
  const dy3 = a1.y - b1.y

  const t = (dx3 * dy2 - dy3 * dx2) / denominator
  const u = (dx3 * dy1 - dy3 * dx1) / denominator

  // Check if intersection is within both segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: a1.x + t * dx1,
      y: a1.y + t * dy1,
    }
  }

  return null
}

/**
 * Find all intersection points between two polylines
 * Returns array of {point, indexA, indexB} where indexes indicate which segments intersect
 */
export function polylineIntersections(
  polylineA: Position[],
  polylineB: Position[]
): Array<{ point: Position; segmentIndexA: number; segmentIndexB: number }> {
  const intersections: Array<{
    point: Position
    segmentIndexA: number
    segmentIndexB: number
  }> = []

  // Check each segment pair
  for (let i = 0; i < polylineA.length - 1; i++) {
    for (let j = 0; j < polylineB.length - 1; j++) {
      const intersection = lineSegmentIntersection(
        polylineA[i],
        polylineA[i + 1],
        polylineB[j],
        polylineB[j + 1]
      )

      if (intersection) {
        intersections.push({
          point: intersection,
          segmentIndexA: i,
          segmentIndexB: j,
        })
      }
    }
  }

  return intersections
}
