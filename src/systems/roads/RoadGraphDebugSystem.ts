import { Graphics } from 'pixi.js'
import type { System } from '@/core/ecs/System'
import type { World } from '@/core/ecs/World'
import type { RoadGraph } from '@/core/RoadGraph'

/**
 * RoadGraphDebugSystem - visualizes graph nodes for debugging
 * Shows intersection nodes, endpoints, and edge connections
 */
export class RoadGraphDebugSystem implements System {
  private roadGraph: RoadGraph
  private debugGraphics: Graphics
  private enabled = true // Toggle with 'G' key

  constructor(stage: any, roadGraph: RoadGraph) {
    this.roadGraph = roadGraph
    this.debugGraphics = new Graphics()
    this.debugGraphics.zIndex = 100 // Draw on top
    stage.addChild(this.debugGraphics)
  }

  init(_world: World): void {
    // Setup keyboard toggle
    window.addEventListener('keydown', (e) => {
      if (e.key === 'g' || e.key === 'G') {
        this.enabled = !this.enabled
        console.log(`Graph debug visualization ${this.enabled ? 'enabled' : 'disabled'}`)
        if (!this.enabled) {
          this.debugGraphics.clear()
        }
      }
    })

    console.log('RoadGraphDebugSystem initialized - press G to toggle visualization')
  }

  update(_world: World, _deltaTime: number): void {
    if (!this.enabled) return

    this.debugGraphics.clear()

    // Draw all nodes
    const nodes = this.roadGraph.getAllNodes()
    for (const node of nodes) {
      const color = node.type === 'intersection' ? 0xff0000 : 0x00ff00
      const radius = node.type === 'intersection' ? 8 : 6

      // Draw node circle
      this.debugGraphics.circle(node.position.x, node.position.y, radius)
      this.debugGraphics.fill({ color, alpha: 0.8 })

      // Draw node outline
      this.debugGraphics.circle(node.position.x, node.position.y, radius + 2)
      this.debugGraphics.stroke({ width: 2, color: 0xffffff, alpha: 0.5 })
    }
  }

  destroy(): void {
    this.debugGraphics.destroy()
  }
}
