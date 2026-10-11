/**
 * Road placement configuration
 * All values are tunable - adjust based on playtesting
 */
export const ROAD_CONFIG = {
  // Width constraints (meters)
  MIN_WIDTH: 2,
  MAX_WIDTH: 10,
  DEFAULT_WIDTH: 4,

  // Width control point subdivision thresholds (TBD - needs playtesting)
  MIN_LENGTH_FOR_3_POINTS: 15, // Below this: 1 point
  MIN_LENGTH_FOR_5_POINTS: 30, // Above this: 5 points, between: 3 points

  // Snapping
  DEFAULT_SNAP_RADIUS: 5, // meters
  SNAP_ENABLED_BY_DEFAULT: true,

  // Rendering
  SPLINE_RESOLUTION: 20, // Points per segment
  LINE_CAP_STYLE: 'round' as const,
  ROAD_OUTLINE_WIDTH: 0.2, // meters

  // Control point interaction
  CONTROL_POINT_RADIUS: 0.5, // meters (visual size)
  CONTROL_POINT_HIT_RADIUS: 1.5, // meters (interaction area)

  // Validation
  MIN_SEGMENT_LENGTH: 1, // meters
  MAX_ROAD_ANGLE: Math.PI / 2, // 90 degrees max turn
} as const
