/**
 * Camera controls configuration
 */
export const CAMERA_CONFIG = {
  // Initial view
  INITIAL_X: 0, // meters
  INITIAL_Y: 0, // meters
  INITIAL_ZOOM: 1, // 1 = 1 world unit = 1 screen pixel
  INITIAL_VIEW_SIZE: 50, // meters (visible area)

  // Zoom
  MIN_ZOOM: 0.1, // Max zoom out
  MAX_ZOOM: 5, // Max zoom in
  ZOOM_SPEED: 0.001, // Scale per wheel delta
  ZOOM_KEY_STEP: 1.2, // Multiplier per F/R keypress
  ZOOM_EASING: 0.1, // 0-1, lower = smoother

  // Pan (WASD)
  WASD_PAN_SPEED: 20, // meters per second
  WASD_PAN_ACCELERATION: 2, // Multiplier when holding key

  // Edge scrolling
  EDGE_SCROLL_MARGIN: 50, // pixels from screen edge
  EDGE_SCROLL_SPEED: 15, // meters per second
  EDGE_SCROLL_ENABLED: true,

  // Camera bounds (optional, null = no bounds)
  MIN_X: null as number | null,
  MAX_X: null as number | null,
  MIN_Y: null as number | null,
  MAX_Y: null as number | null,
} as const
