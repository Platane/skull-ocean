import { vec2, vec3 } from "gl-matrix";
import { lerp } from "three/src/math/MathUtils";
import { SIZE_PHYSIC } from "./constants";

type ForceLine = {
  n: vec2;

  dN: number;
  dOrtho: number;

  l: number;

  h: number;

  force: vec3;
};
export const forceLines = [] as (ForceLine & {
  velocity: number;
  age: number;
  lifeSpan: number;
})[];

const ZERO = vec2.create();

const N = SIZE_PHYSIC * 1.15;
const swells = Array.from({ length: 3 }).map((_, i, { length }) => {
  const k = i / length;

  const n = vec2.create();
  n[1] = 1;
  vec2.rotate(n, n, ZERO, (Math.random() - 0.5) * Math.PI * 0.1);

  return {
    n,
    l: SIZE_PHYSIC * 1.5,
    dN: k * N * 2 - N,
    h: 3,
    dOrtho: 0,
    velocity: 4,
    force: vec3.set(vec3.create(), 0, -lerp(0.5, 0.8, Math.random()) * 0, 0),
  };
});

forceLines.push(...(swells as any));

export const stepWaves = (dt: number) => {
  for (let i = forceLines.length; i--; ) {
    const forceLine = forceLines[i];

    forceLine.dN += forceLine.velocity * dt;
  }

  for (const swell of swells) {
    if (swell.dN > SIZE_PHYSIC * 1.15) swell.dN -= SIZE_PHYSIC * 1.15 * 2;
  }
};
