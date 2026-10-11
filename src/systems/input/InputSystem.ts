import type { System } from '@/core/ecs/System'
import type { World } from '@/core/ecs/World'

/**
 * InputSystem - handles mouse and keyboard input
 */
export class InputSystem implements System {
  private canvas: HTMLCanvasElement
  private keys = new Set<string>()
  private mousePosition = { x: 0, y: 0 }
  private mouseDown = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  init(world: World): void {
    // Setup event listeners
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('mousedown', this.handleMouseDown)
    this.canvas.addEventListener('mouseup', this.handleMouseUp)
    this.canvas.addEventListener('wheel', this.handleWheel)

    console.log('InputSystem initialized')
  }

  update(world: World, deltaTime: number): void {
    // Input state is available for other systems to query
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas.removeEventListener('mousedown', this.handleMouseDown)
    this.canvas.removeEventListener('mouseup', this.handleMouseUp)
    this.canvas.removeEventListener('wheel', this.handleWheel)
  }

  // Event handlers
  private handleKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key.toLowerCase())
  }

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase())
  }

  private handleMouseMove = (e: MouseEvent): void => {
    this.mousePosition = { x: e.clientX, y: e.clientY }
  }

  private handleMouseDown = (e: MouseEvent): void => {
    this.mouseDown = true
  }

  private handleMouseUp = (e: MouseEvent): void => {
    this.mouseDown = false
  }

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault()
    // TODO: Emit zoom event
  }

  // Query methods for other systems
  isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase())
  }

  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition }
  }

  isMouseDown(): boolean {
    return this.mouseDown
  }
}
