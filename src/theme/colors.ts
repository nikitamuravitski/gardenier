/**
 * Color palette inspired by Mini Metro / Mini Motorways
 * Minimalist, flat colors with high contrast
 */
export const COLORS = {
  // Background
  background: 0x1a1a1a,
  mapSurface: 0x2a2a2a,

  // Roads
  roadDefault: 0xffffff,
  roadPreview: 0xffffff, // Use with alpha 0.5
  roadInvalid: 0xff4444,
  roadOutline: 0x000000,

  // Control points
  controlPoint: 0x4a9eff,
  controlPointHover: 0x6ab0ff,
  controlPointActive: 0x8ac5ff,

  // UI
  uiPrimary: 0xffffff,
  uiSecondary: 0x888888,
  uiAccent: 0x4a9eff,
  uiBackground: 0x2a2a2a,

  // Grid (optional overlay)
  gridLines: 0x333333,

  // Future: Buildings, resources, etc.
  buildingDefault: 0xcccccc,
  resourceWood: 0x8b4513,
  resourceStone: 0x808080,
  resourceFood: 0xffa500,
} as const

/**
 * Alpha values for transparency
 */
export const ALPHA = {
  preview: 0.5,
  hover: 0.8,
  disabled: 0.3,
  gridOverlay: 0.1,
} as const
