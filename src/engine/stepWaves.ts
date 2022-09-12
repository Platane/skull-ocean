import { vec2, vec3 } from "gl-matrix";
import { lerp } from "three/src/math/MathUtils";
import { SIZE_PHYSIC } from "./constants";

type Wave = {
  p: vec2;
  v: vec2;
  lines: ForceLine[];
};

type ForceLine = {
  n: vec2;

  dN: number;
  dOrtho: number;

  l: number;

  h: number;

  force: vec3;
};
export const forceLines = [] as ForceLine[];

const waves = [] as Wave[];

const ZERO = vec2.create();

const spawnWave = () => {
  const n = vec2.create();
  n[1] = 1;
  vec2.rotate(n, n, ZERO, (Math.random() - 0.5) * Math.PI * 0);

  const speed = 4;
  const v = vec2.create();
  vec2.scaleAndAdd(v, v, n, speed);

  const p = vec2.create();
  p[0] = (Math.random() - 0.5) * SIZE_PHYSIC * 2;
  p[1] = -SIZE_PHYSIC;

  const l = lerp(3, 7, Math.random());

  const downLine = {
    n,
    l,
    h: -0.5,
    dN: vec2.dot(n, p),
    dOrtho: -n[1] * p[0] + n[0] * p[1],
    force: vec3.set(vec3.create(), 0, -2, 0),
  };
  const lines = [downLine];

  waves.push({ p, v, lines });
  forceLines.push(...lines);
};

spawnWave();

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
    force: vec3.set(vec3.create(), 0, -lerp(0.5, 0.8, Math.random()), 0),
  };
});

forceLines.push(...swells);

export const stepWaves = (dt: number) => {
  // move wave
  for (const wave of waves) {
    vec2.scaleAndAdd(wave.p, wave.p, wave.v, dt);
    for (const line of wave.lines) {
      line.dN = vec2.dot(line.n, wave.p);
    }
  }

  for (const swell of swells) {
    swell.dN += 4 * dt;
    if (swell.dN > SIZE_PHYSIC * 1.15) swell.dN -= SIZE_PHYSIC * 1.15 * 2;
  }
};
