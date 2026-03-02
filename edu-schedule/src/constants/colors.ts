// Lighter, more vibrant preset colors
export const PRESET_COLORS = [
  '#ff6b6b', // coral red
  '#ffa94d', // bright orange
  '#ffd43b', // bright yellow
  '#69db7c', // bright green
  '#38d9a9', // bright teal
  '#4dabf7', // bright blue
  '#b197fc', // light violet
  '#f783ac', // light pink
  '#ff8787', // salmon
  '#ffc078', // peach
] as const;

export type PresetColor = typeof PRESET_COLORS[number];

export const DEFAULT_COLOR = PRESET_COLORS[4]; // bright teal
