/**
 * Renderable component - visual properties
 */
export type Renderable = {
  color: number // Hex color value
  visible: boolean
  zIndex: number // Render order
  alpha?: number // Opacity 0-1
}
