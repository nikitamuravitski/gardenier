import { Graphics } from 'pixi.js'
import type { System } from '@/core/ecs/System'
import type { World } from '@/core/ecs/World'
import type { RoadGraph } from '@/core/RoadGraph'
import type { Position } from '@/components/Position'
import type { RoadSegment } from '@/components/RoadSegment'
import type { Renderable } from '@/components/Renderable'
import type { ICurveService } from '@/services/CurveService'
import { ROAD_CONFIG } from '@/config/roads'

/**
 * RoadPlacementSystem - handles interactive road placement
 *
 * Flow:
 * 1. Click to add waypoint
 * 2. Preview line follows cursor
 * 3. Click more waypoints (multi-point path)
 * 4. Enter or double-click confirms → creates road entity
 * 5. Escape cancels
 */
export class RoadPlacementSystem implements System {
  private active = false
  private waypoints: Position[] = []
  private autoWaypoints: Position[] = [] // Temporary waypoints at intersections
  private previewGraphics: Graphics
  private mousePos: Position = { x: 0, y: 0 }
  private canvas: HTMLCanvasElement
  private lastClickTime = 0
  private readonly DOUBLE_CLICK_MS = 300
  private world: World | null = null
  private roadGraph: RoadGraph
  private curveService: ICurveService
  private snapEnabled: boolean = ROAD_CONFIG.SNAP_ENABLED_BY_DEFAULT
  private snapPoint: Position | null = null
  private snapType: 'intersection' | 'curve' | null = null
  // Convert meters to pixels (rough: 1 meter = 10 pixels for MVP)
  private readonly SNAP_RADIUS_PX = ROAD_CONFIG.DEFAULT_SNAP_RADIUS * 10

  constructor(
    canvas: HTMLCanvasElement,
    stage: any,
    roadGraph: RoadGraph,
    curveService: ICurveService
  ) {
    this.canvas = canvas
    this.roadGraph = roadGraph
    this.curveService = curveService
    this.previewGraphics = new Graphics()
    this.previewGraphics.alpha = 0.7
    stage.addChild(this.previewGraphics)
  }

  init(_world: World): void {
    // Setup event listeners
    this.canvas.addEventListener('click', this.handleClick)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)

    // Start in placement mode
    this.active = true
    console.log('RoadPlacementSystem initialized - click to place waypoints')
  }

  update(world: World, _deltaTime: number): void {
    if (!this.active) return

    // Redraw preview
    this.drawPreview()

    // Store world reference for confirmation
    this.world = world
  }

  destroy(): void {
    this.canvas.removeEventListener('click', this.handleClick)
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    this.previewGraphics.destroy()
  }

  private handleClick = (e: MouseEvent): void => {
    if (!this.active) return

    const now = Date.now()
    const isDoubleClick = now - this.lastClickTime < this.DOUBLE_CLICK_MS
    this.lastClickTime = now

    if (isDoubleClick && this.waypoints.length >= 2) {
      // Double-click confirms placement
      this.confirmPlacement()
      return
    }

    // Get click position (potentially snapped)
    let pos = { x: e.clientX, y: e.clientY }

    // Try to snap if enabled
    if (this.snapEnabled && this.world) {
      const snapResult = this.findSnapPoint(pos)
      if (snapResult.point) {
        pos = snapResult.point
        console.log(`Snapped to ${snapResult.type} at`, pos)
      }
    }

    this.waypoints.push(pos)
    console.log(`Waypoint ${this.waypoints.length} placed at`, pos)

    // Clear auto-waypoints when user places a waypoint
    this.autoWaypoints = []
  }

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.active) return
    this.mousePos = { x: e.clientX, y: e.clientY }

    // Update snap preview
    if (this.snapEnabled && this.world) {
      const snapResult = this.findSnapPoint(this.mousePos)
      this.snapPoint = snapResult.point
      this.snapType = snapResult.type
      // Update auto-waypoints (intersections along preview path)
      this.updateAutoWaypoints()
    } else {
      this.snapPoint = null
      this.snapType = null
      this.autoWaypoints = []
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.active) return

    if (e.key === 'Enter' && this.waypoints.length >= 2) {
      this.confirmPlacement()
    } else if (e.key === 'Escape') {
      this.cancelPlacement()
    } else if (e.key === 'Shift') {
      // Hold Shift to disable all snapping (free placement mode)
      this.snapEnabled = false
      console.log('Snap disabled (free placement)')
    }
  }

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (!this.active) return

    if (e.key === 'Shift') {
      // Release Shift to re-enable snapping
      this.snapEnabled = true
      console.log('Snap enabled')
    }
  }

  private drawPreview(): void {
    this.previewGraphics.clear()

    // Draw snap point preview with color based on type
    if (this.snapPoint) {
      const snapColor = this.snapType === 'intersection' ? 0xffff00 : 0x44ff44 // Yellow for intersection, green for curve
      this.previewGraphics.circle(this.snapPoint.x, this.snapPoint.y, 8)
      this.previewGraphics.stroke({ width: 2, color: snapColor })
    }

    if (this.waypoints.length === 0) return

    // Draw placed waypoints as solid dots
    for (const wp of this.waypoints) {
      this.previewGraphics.circle(wp.x, wp.y, 4)
      this.previewGraphics.fill({ color: 0x4a9eff })
    }

    // Draw auto-waypoints as hollow dots
    for (const awp of this.autoWaypoints) {
      this.previewGraphics.circle(awp.x, awp.y, 6)
      this.previewGraphics.stroke({ width: 2, color: 0xffaa00 }) // Orange outline
    }

    // Draw smooth curve between waypoints + auto-waypoints + cursor (or snap point)
    if (this.waypoints.length >= 1) {
      const endPoint = this.snapPoint || this.mousePos
      // Merge user waypoints, auto-waypoints, and end point
      const previewPoints = [...this.waypoints, ...this.autoWaypoints, endPoint]
      const bezierSegments = this.curveService.getBezierSegments(previewPoints)

      if (bezierSegments.length > 0) {
        this.previewGraphics.moveTo(bezierSegments[0].start.x, bezierSegments[0].start.y)

        for (const segment of bezierSegments) {
          this.previewGraphics.bezierCurveTo(
            segment.cp1.x,
            segment.cp1.y,
            segment.cp2.x,
            segment.cp2.y,
            segment.end.x,
            segment.end.y
          )
        }

        this.previewGraphics.stroke({ width: 8, color: 0xffffff, cap: 'round' })

        // Preview intersection points (orange dots) using CurveService
        if (this.world && previewPoints.length >= 2) {
          const roads = this.world.query<{ RoadSegment: RoadSegment }>(['RoadSegment'])

          // Check intersections with existing roads
          for (const { components } of roads) {
            const existingWaypoints = components.RoadSegment.waypoints
            if (existingWaypoints.length < 2) continue

            // Find exact intersections using service
            const crossings = this.curveService.findIntersections(previewPoints, existingWaypoints)

            // Draw intersection preview dots
            for (const crossing of crossings) {
              this.previewGraphics.circle(crossing.x, crossing.y, 6)
              this.previewGraphics.fill({ color: 0xff8800 }) // Orange
            }
          }

          // Check self-intersections (road crossing itself)
          if (previewPoints.length >= 4) {
            const selfCrossings = this.curveService.findIntersections(previewPoints, previewPoints)

            // Filter out waypoint false positives
            const validSelfCrossings = selfCrossings.filter((crossing) => {
              return !previewPoints.some(
                (wp) => Math.abs(wp.x - crossing.x) < 1 && Math.abs(wp.y - crossing.y) < 1
              )
            })

            // Draw self-intersection preview dots (different color - red)
            for (const crossing of validSelfCrossings) {
              this.previewGraphics.circle(crossing.x, crossing.y, 6)
              this.previewGraphics.fill({ color: 0xff0000 }) // Red
            }
          }
        }
      }
    }
  }

  private confirmPlacement(): void {
    console.log('Road confirmed with waypoints:', this.waypoints)

    if (this.world) {
      // Create visual road entity (NEVER modified after creation)
      const visualEntity = this.createRoadEntity(this.world, this.waypoints)

      // Create logical graph structure
      this.createGraphStructure(visualEntity, this.waypoints)

      // Debug print graph state
      this.roadGraph.debugPrint()
    }

    this.resetPlacement()
  }

  private cancelPlacement(): void {
    console.log('Road placement cancelled')
    this.autoWaypoints = []
    this.resetPlacement()
  }

  private resetPlacement(): void {
    this.waypoints = []
    this.autoWaypoints = []
    this.previewGraphics.clear()
    console.log('Ready for new road - click to place waypoints')
  }

  /**
   * Update auto-waypoints: detect intersections along preview path
   * Automatically inserts intersection nodes as temporary waypoints
   */
  private updateAutoWaypoints(): void {
    this.autoWaypoints = []

    if (!this.world || this.waypoints.length === 0) return

    const lastWaypoint = this.waypoints[this.waypoints.length - 1]
    const endPoint = this.snapPoint || this.mousePos

    // Get preview path (from last waypoint to cursor)
    const previewPath = [lastWaypoint, endPoint]

    // Get all intersection nodes
    const allNodes = this.roadGraph.getAllNodes()
    const intersectionNodes = allNodes.filter((node) => node.type === 'intersection')

    // Find intersections within snap radius of preview path
    const candidateIntersections: Array<{ position: Position; distance: number }> = []

    for (const node of intersectionNodes) {
      // Skip if intersection is at the last waypoint (avoid duplicates)
      const distFromLastWaypoint = Math.sqrt(
        (node.position.x - lastWaypoint.x) ** 2 + (node.position.y - lastWaypoint.y) ** 2
      )
      if (distFromLastWaypoint < 5) continue // Same tolerance as findNodeAt

      // Check if intersection is close to the preview curve
      const result = this.curveService.closestPointOnCurve(previewPath, node.position)

      if (result && result.distance <= this.SNAP_RADIUS_PX) {
        candidateIntersections.push({ position: node.position, distance: distFromLastWaypoint })
      }
    }

    // Sort by distance from last waypoint (closest first)
    candidateIntersections.sort((a, b) => a.distance - b.distance)

    // Add them as auto-waypoints
    this.autoWaypoints = candidateIntersections.map((c) => c.position)

    if (this.autoWaypoints.length > 0) {
      console.log(`Auto-detected ${this.autoWaypoints.length} intersection(s) along preview path`)
    }
  }

  /**
   * Find snap point near given position
   * Prioritizes intersection nodes, then falls back to curve points
   * Returns point and type ('intersection' or 'curve')
   */
  private findSnapPoint(pos: Position): { point: Position | null; type: 'intersection' | 'curve' | null } {
    if (!this.world) return { point: null, type: null }

    let closestIntersection: Position | null = null
    let minIntersectionDist = Infinity

    // Check intersection nodes first
    const allNodes = this.roadGraph.getAllNodes()
    const intersectionNodes = allNodes.filter((node) => node.type === 'intersection')

    for (const node of intersectionNodes) {
      const dist = Math.sqrt((pos.x - node.position.x) ** 2 + (pos.y - node.position.y) ** 2)
      if (dist < minIntersectionDist) {
        minIntersectionDist = dist
        closestIntersection = node.position
      }
    }

    // If intersection is within snap radius, prioritize it
    if (closestIntersection && minIntersectionDist <= this.SNAP_RADIUS_PX) {
      return { point: closestIntersection, type: 'intersection' }
    }

    // Fall back to curve snapping
    const roads = this.world.query<{ RoadSegment: RoadSegment }>(['RoadSegment'])

    let closestCurvePoint: Position | null = null
    let minCurveDist = Infinity

    // Check each road
    for (const { components } of roads) {
      const waypoints = components.RoadSegment.waypoints
      if (waypoints.length < 2) continue

      // Find closest point using service
      const result = this.curveService.closestPointOnCurve(waypoints, pos)
      if (result && result.distance < minCurveDist) {
        minCurveDist = result.distance
        closestCurvePoint = result.point
      }
    }

    // Also check current road being placed (snap to self)
    if (this.waypoints.length >= 2) {
      const result = this.curveService.closestPointOnCurve(this.waypoints, pos)
      if (result && result.distance < minCurveDist) {
        minCurveDist = result.distance
        closestCurvePoint = result.point
      }
    }

    // Check if within snap radius
    if (closestCurvePoint && minCurveDist <= this.SNAP_RADIUS_PX) {
      return { point: closestCurvePoint, type: 'curve' }
    }

    return { point: null, type: null }
  }

  /**
   * Create graph structure for new road
   * Creates nodes, edges, and detects/processes intersections
   */
  private createGraphStructure(visualEntity: number, waypoints: Position[]): void {
    const startPos = waypoints[0]
    const endPos = waypoints[waypoints.length - 1]

    // Create or reuse endpoint nodes
    let startNodeId = this.roadGraph.findNodeAt(startPos, 5)
    if (!startNodeId) {
      startNodeId = this.roadGraph.createNode(startPos, 'endpoint')
    }

    let endNodeId = this.roadGraph.findNodeAt(endPos, 5)
    if (!endNodeId) {
      endNodeId = this.roadGraph.createNode(endPos, 'endpoint')
    }

    // Create edge for this road
    const edgeId = this.roadGraph.createEdge(startNodeId, endNodeId, visualEntity, 5)
    console.log(`Created edge ${edgeId} from ${startNodeId} to ${endNodeId}`)

    // Detect intersections with existing edges
    this.detectAndProcessIntersections(edgeId, waypoints, visualEntity)
  }

  /**
   * Detect intersections between new edge and all existing edges
   * Uses Paper.js for exact curve intersection (no polyline approximation)
   */
  private detectAndProcessIntersections(
    newEdgeId: string,
    newWaypoints: Position[],
    newVisualEntity: number
  ): void {
    const startTotal = performance.now()
    const allEdges = this.roadGraph.getAllEdges()
    let totalIntersectionTime = 0
    let intersectionCount = 0

    for (const existingEdge of allEdges) {
      // // Skip comparing edge to itself
      // if (existingEdge.id === newEdgeId) continue

      // Get existing road's visual waypoints
      const existingSegment = this.world?.getComponent<RoadSegment>(
        existingEdge.visualSegmentId,
        'RoadSegment'
      )
      if (!existingSegment || existingSegment.waypoints.length < 2) continue

      // Benchmark intersection detection
      const startIntersection = performance.now()
      const intersections = this.curveService.findIntersections(
        newWaypoints,
        existingSegment.waypoints
      )
      const intersectionTime = performance.now() - startIntersection
      totalIntersectionTime += intersectionTime

      if (intersections.length > 0) {
        console.log(`Found ${intersections.length} intersection(s) in ${intersectionTime.toFixed(2)}ms`)
      }

      // Process all intersections for this edge pair
      if (intersections.length > 0) {
        console.log(`  Processing ${intersections.length} intersection(s)...`)

        // Process each intersection
        for (const intersectionPoint of intersections) {
          // Skip false positives: intersections at waypoints (not real crossings)
          const isWaypoint = newWaypoints.some(
            (wp) => Math.abs(wp.x - intersectionPoint.x) < 1 && Math.abs(wp.y - intersectionPoint.y) < 1
          ) || existingSegment.waypoints.some(
            (wp) => Math.abs(wp.x - intersectionPoint.x) < 1 && Math.abs(wp.y - intersectionPoint.y) < 1
          )

          if (isWaypoint) {
            console.log(`  Skipping waypoint false positive at (${intersectionPoint.x.toFixed(2)}, ${intersectionPoint.y.toFixed(2)})`)
            continue
          }

          intersectionCount++
          console.log(`  Intersection #${intersectionCount} at (${intersectionPoint.x.toFixed(2)}, ${intersectionPoint.y.toFixed(2)})`)

          // Check if intersection node already exists at this point
          let intersectionNodeId = this.roadGraph.findNodeAt(intersectionPoint, 5)

          if (!intersectionNodeId) {
            // Create new intersection node
            intersectionNodeId = this.roadGraph.createNode(intersectionPoint, 'intersection')
            console.log(`    Created intersection node ${intersectionNodeId}`)
          } else {
            console.log(`    Reusing existing node ${intersectionNodeId}`)
          }

          // Find which edge currently contains the intersection
          // (may have changed due to previous splits)
          const existingEdgeContainingIntersection = this.findEdgeContainingPoint(
            existingEdge.visualSegmentId,
            intersectionPoint
          )

          const newEdgeContainingIntersection = this.findEdgeContainingPoint(
            newVisualEntity,
            intersectionPoint
          )

          // Split edges only if intersection is NOT at an edge endpoint
          if (existingEdgeContainingIntersection && !this.isEdgeEndpoint(existingEdgeContainingIntersection, intersectionPoint)) {
            this.roadGraph.splitEdge(
              existingEdgeContainingIntersection,
              intersectionPoint,
              existingEdge.visualSegmentId,
              existingEdge.visualSegmentId,
              intersectionNodeId
            )
          }

          if (newEdgeContainingIntersection && !this.isEdgeEndpoint(newEdgeContainingIntersection, intersectionPoint)) {
            this.roadGraph.splitEdge(
              newEdgeContainingIntersection,
              intersectionPoint,
              newVisualEntity,
              newVisualEntity,
              intersectionNodeId
            )
          }
        }
      }
    }

    const totalTime = performance.now() - startTotal
    if (intersectionCount > 0) {
      console.log(`⏱️ Intersection detection: ${totalIntersectionTime.toFixed(2)}ms total, ${(totalIntersectionTime / intersectionCount).toFixed(2)}ms avg per intersection`)
      console.log(`⏱️ Total processing time: ${totalTime.toFixed(2)}ms (checked ${allEdges.length} existing edges)`)
    }
  }

  /**
   * Find which edge (by ID) contains a given point on a visual segment
   * Used after splitting to locate which new edge an intersection belongs to
   */
  private findEdgeContainingPoint(visualSegmentId: number, point: Position): string | null {
    const allEdges = this.roadGraph.getAllEdges()

    // Find all edges that reference this visual segment
    const candidateEdges = allEdges.filter((edge) => edge.visualSegmentId === visualSegmentId)

    if (candidateEdges.length === 0) return null
    if (candidateEdges.length === 1) return candidateEdges[0].id

    // Multiple edges share this visual segment (it's been split)
    // Find which edge's node endpoints contain this point
    let bestMatch: { id: string; error: number } | null = null

    for (const edge of candidateEdges) {
      const nodeA = this.roadGraph.getNode(edge.nodeA)
      const nodeB = this.roadGraph.getNode(edge.nodeB)

      if (!nodeA || !nodeB) continue

      // Check if point is between nodeA and nodeB using distance triangle
      const distToA = Math.sqrt((point.x - nodeA.position.x) ** 2 + (point.y - nodeA.position.y) ** 2)
      const distToB = Math.sqrt((point.x - nodeB.position.x) ** 2 + (point.y - nodeB.position.y) ** 2)
      const segmentLength = Math.sqrt(
        (nodeB.position.x - nodeA.position.x) ** 2 + (nodeB.position.y - nodeA.position.y) ** 2
      )

      // If point is on the segment, distToA + distToB ≈ segmentLength
      const error = Math.abs(distToA + distToB - segmentLength)

      // Track best match (smallest error)
      if (!bestMatch || error < bestMatch.error) {
        bestMatch = { id: edge.id, error }
      }
    }

    // Accept match if error is reasonable (within 20px tolerance for curves)
    if (bestMatch && bestMatch.error < 20) {
      return bestMatch.id
    }

    // No clear match - return first edge as fallback
    console.warn(`⚠️ Could not determine edge containing point, using fallback`)
    return candidateEdges[0].id
  }

  /**
   * Check if a point is at one of an edge's endpoints
   * Used to prevent splitting an edge at its own endpoint (creates self-loops)
   */
  private isEdgeEndpoint(edgeId: string, point: Position): boolean {
    const edge = this.roadGraph.getAllEdges().find((e) => e.id === edgeId)
    if (!edge) return false

    const nodeA = this.roadGraph.getNode(edge.nodeA)
    const nodeB = this.roadGraph.getNode(edge.nodeB)

    if (!nodeA || !nodeB) return false

    const distToA = Math.sqrt((point.x - nodeA.position.x) ** 2 + (point.y - nodeA.position.y) ** 2)
    const distToB = Math.sqrt((point.x - nodeB.position.x) ** 2 + (point.y - nodeB.position.y) ** 2)

    // Check if point is very close to either endpoint (within 5 units)
    return distToA < 5 || distToB < 5
  }

  /**
   * Create visual road entity
   * Returns entity ID
   */
  private createRoadEntity(world: World, waypoints: Position[]): number {
    const entity = world.createEntity()

    const roadSegment: RoadSegment = {
      waypoints: [...waypoints],
      width: 5, // Default 5 meters
    }

    const renderable: Renderable = {
      color: 0xffffff,
      visible: true,
      zIndex: 0,
      alpha: 1,
    }

    world.addComponent(entity, 'RoadSegment', roadSegment)
    world.addComponent(entity, 'Renderable', renderable)

    console.log(`Visual road entity ${entity} created`)
    return entity
  }
}
