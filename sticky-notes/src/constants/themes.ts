export const THEMES = {
  TRIANGLES: 'triangles',
  BUBBLES: 'bubbles',
  HEARTS: 'hearts'
} as const;

export type ThemeType = typeof THEMES[keyof typeof THEMES];
