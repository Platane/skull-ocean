import { positions } from ".";
import { clamp, invLerp } from "../math/utils";
import { hslToRgb } from "../renderer/utils/color";

export const getColor = (out: [number, number, number], i: number) => {
  const y = positions[i * 3 + 1];
  const cy = clamp(invLerp(y, -1, 3), 0, 1);

  const h = 1.085 + ((i % 37) / 37) * 0.07;
  const s = 0.25 + (((i * 79) % 23) / 23) * 0.1;
  const l = 0.55 + cy * 0.4;

  hslToRgb(out, h, s, l);
};
