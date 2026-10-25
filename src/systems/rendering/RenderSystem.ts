import { Container, Graphics } from 'pixi.js'
import type { System } from '@/core/ecs/System'
import type { World } from '@/core/ecs/World'
import type { RoadSegment } from '@/components/RoadSegment'
import type { Renderable } from '@/components/Renderable'
import type { ICurveService } from '@/services/CurveService'

/**
 * RenderSystem - renders all entities to the screen
 */
export class RenderSystem implements System {
  private stage: Container
  private curveService: ICurveService
  private roadGraphics = new Map<number, Graphics>() // entity -> Graphics

  constructor(stage: Container, curveService: ICurveService) {
    this.stage = stage
    this.curveService = curveService
  }

  init(_world: World): void {
    console.log('RenderSystem initialized')
  }

  update(world: World, _deltaTime: number): void {
    // Query road entities
    const roads = world.query<{ RoadSegment: RoadSegment; Renderable: Renderable }>([
      'RoadSegment',
      'Renderable',
    ])

    // Track which entities we've rendered this frame
    const activeEntities = new Set<number>()

    for (const { entity, components } of roads) {
      activeEntities.add(entity)
      const { RoadSegment: road, Renderable: style } = components

      if (!style.visible) continue

      // Get or create graphics for this entity
      let graphics = this.roadGraphics.get(entity)
      if (!graphics) {
        graphics = new Graphics()
        this.roadGraphics.set(entity, graphics)
        this.stage.addChild(graphics)
      }

      // Redraw road with smooth curves using CurveService
      graphics.clear()
      graphics.alpha = style.alpha ?? 1

      if (road.waypoints.length >= 2) {
        // Get native Bézier curve segments from Paper.js
        const bezierSegments = this.curveService.getBezierSegments(road.waypoints)

        if (bezierSegments.length > 0) {
          // Start at first point
          graphics.moveTo(bezierSegments[0].start.x, bezierSegments[0].start.y)

          // Draw each segment as native cubic Bézier curve
          for (const segment of bezierSegments) {
            graphics.bezierCurveTo(
              segment.cp1.x,
              segment.cp1.y,
              segment.cp2.x,
              segment.cp2.y,
              segment.end.x,
              segment.end.y
            )
          }

          graphics.stroke({ width: road.width, color: style.color, cap: 'round' })
        }
      }
    }

    // Cleanup graphics for destroyed entities
    for (const [entity, graphics] of this.roadGraphics.entries()) {
      if (!activeEntities.has(entity)) {
        this.stage.removeChild(graphics)
        graphics.destroy()
        this.roadGraphics.delete(entity)
      }
    }
  }

  destroy(): void {
    for (const graphics of this.roadGraphics.values()) {
      this.stage.removeChild(graphics)
      graphics.destroy()
    }
    this.roadGraphics.clear()
  }
}
