export const lerp = (weight: number, a1: number, a2: number) =>
  (1 - weight) * a1 + weight * a2;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
