import { Application } from 'pixi.js'
import { World } from './ecs/World'
import type { System } from './ecs/System'
import { RenderSystem } from '@/systems/rendering/RenderSystem'
import { CameraSystem } from '@/systems/camera/CameraSystem'
import { InputSystem } from '@/systems/input/InputSystem'

/**
 * Main game class - coordinates all systems and the game loop
 */
export class Game {
  private app: Application
  private world: World
  private systems: System[] = []
  private lastTime = 0
  private running = false

  constructor() {
    // Create PixiJS application
    this.app = new Application()
    this.world = new World()
  }

  /**
   * Initialize the game
   */
  async init(): Promise<void> {
    // Initialize PixiJS
    await this.app.init({
      resizeTo: window,
      backgroundColor: 0x1a1a1a,
      antialias: true,
    })

    // Attach canvas to DOM
    const container = document.getElementById('game-canvas')
    if (container) {
      container.appendChild(this.app.canvas)
    }

    // Register systems (order matters!)
    this.registerSystem(new InputSystem(this.app.canvas))
    this.registerSystem(new CameraSystem())
    this.registerSystem(new RenderSystem(this.app.stage))

    // Initialize all systems
    for (const system of this.systems) {
      system.init?.(this.world)
    }
  }

  /**
   * Register a system
   */
  private registerSystem(system: System): void {
    this.systems.push(system)
  }

  /**
   * Start the game loop
   */
  async start(): Promise<void> {
    await this.init()
    this.running = true
    this.lastTime = performance.now()
    this.gameLoop()
  }

  /**
   * Main game loop
   */
  private gameLoop = (): void => {
    if (!this.running) return

    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastTime) / 1000 // Convert to seconds
    this.lastTime = currentTime

    // Update all systems
    for (const system of this.systems) {
      system.update?.(this.world, deltaTime)
    }

    // Continue loop
    requestAnimationFrame(this.gameLoop)
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.running = false
  }

  /**
   * Handle window resize
   */
  resize(): void {
    this.app.renderer.resize(window.innerWidth, window.innerHeight)
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stop()
    for (const system of this.systems) {
      system.destroy?()
    }
    this.app.destroy()
  }
}
