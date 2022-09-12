import { clamp, invLerp } from "../math/utils";
import { hslToRgb } from "../renderer/utils/color";
import { positions } from "./particlesBuffers";

export const getColor = (out: [number, number, number], i: number) => {
  const y = positions[i * 3 + 1];
  const cy = clamp(invLerp(y, -1, 2.2), 0, 1);

  const h = 1.088 + ((i % 37) / 37) * 0.05;
  const s = 0.25 + (((i * 79) % 23) / 23) * 0.1;
  const l = 0.4 + cy * 0.55;

  hslToRgb(out, h, s, l);
};
