import { vec2, vec3 } from "gl-matrix";
import { lerp } from "three/src/math/MathUtils";
import { SIZE_PHYSIC } from "./constants";
import { Handler, Touches } from "../controls-type";
import { clamp } from "../math/utils";
import {
  getRayFromScreen,
  getScreenX,
  getScreenY,
  projectOnGround,
} from "../renderer/utils/raycast";

type ForceLine = {
  n: vec2;

  dN: number;
  dOrtho: number;

  l: number;
  lMax?: number;
  lV?: number;

  h: number;

  force: vec3;
};
export const forceLines = [] as (ForceLine & {
  velocity: number;
  age: number;
  lifeSpan: number;
})[];

const ZERO = vec2.create();
export const cursor = vec3.create();

//
// swell init
//

const N = SIZE_PHYSIC * 1.6;
const swells = Array.from({ length: 2 }).map((_, i, { length }) => {
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
    force: vec3.set(vec3.create(), 0, -lerp(0.5, 0.6, Math.random()), 0),
  };
});
forceLines.push(...(swells as any));

//
// step
//

export const stepWaves = (dt: number) => {
  for (let i = forceLines.length; i--; ) {
    const forceLine = forceLines[i];

    forceLine.dN += forceLine.velocity * dt;

    if (forceLine.lV)
      forceLine.l = Math.min(
        forceLine.l + forceLine.lV * dt,
        forceLine.lMax ?? Infinity
      );

    if (forceLine !== tmpLine && Math.abs(forceLine.dN) > SIZE_PHYSIC * 1.5)
      forceLines.splice(i, 1);
  }

  for (const swell of swells) {
    if (swell.dN > SIZE_PHYSIC * 1.15) swell.dN -= SIZE_PHYSIC * 1.15 * 2;
  }

  if (drag) {
    const startT = Date.now() / 1000;
    const start = drag[0];
    let i = 0;
    for (; i < drag.length - 1 && drag[i].t - startT < SWIPE_DURATION; i++);
    const end = drag[i];

    //

    const dt = startT - end.t;
    const l = Math.hypot(start.x - end.x, start.y - end.y);

    if (l < 0.001) {
      tmpLine.n[0] = 0;
      tmpLine.n[1] = 0;
      tmpLine.dN = 99999;
      tmpLine.dOrtho = 99999;
      tmpLine.force[1] = 0;
    } else {
      const v = l / dt;

      const n = tmpLine.n;

      const velocity = Math.sqrt(v) * 1.3;

      n[0] = -(end.x - start.x) / l;
      n[1] = -(end.y - start.y) / l;
      tmpLine.dN = n[0] * start.x + n[1] * start.y;
      tmpLine.dOrtho = -n[1] * start.x + n[0] * start.y;
      tmpLine.l = 1 + Math.sqrt(v);
      tmpLine.force[1] = -2;
      tmpLine.velocity = velocity;
    }
  }
};

const tmpLine = {
  n: vec2.create(),
  l: 0,
  dN: 1,
  dOrtho: 1,
  h: 1,
  velocity: 0,
  force: vec3.set(vec3.create(), 0, 0, 0),
  age: 0,
  lifeSpan: Infinity,
};
forceLines.push(tmpLine);

let drag = null as { x: number; y: number; t: number }[] | null;
const SWIPE_DURATION = 0.2;

export const onTouchStart_wave: Handler = (touches) => {
  drag = [];
  onTouchMove_wave(touches);
};

let lastTouches: Touches;
export const onTouchMove_wave: Handler = (touches) => {
  lastTouches = touches;

  let x = 0;
  let y = 0;
  for (const { pageX, pageY } of touches) {
    x += pageX;
    y += pageY;
  }
  x /= touches.length;
  y /= touches.length;

  projectOnGround(cursor, getScreenX(x), getScreenY(y), 1);

  if (!drag) return;

  drag.unshift({ t: Date.now() / 1000, x: cursor[0], y: cursor[2] });
  while (drag[0].t - drag[drag.length - 1].t > SWIPE_DURATION) drag.pop();
};

export const onTouchEnd_wave: Handler = () => {
  if (drag) {
    if (tmpLine.velocity > 3) {
      const force = vec3.create();
      vec3.set(force, tmpLine.n[0] * 0.1, 1, tmpLine.n[1] * 0.1);
      vec3.scale(
        force,
        force,
        -(0.5 + 1 - clamp(tmpLine.velocity, 0, 5) / 5) * 2
      );

      const newLine = {
        ...tmpLine,
        n: vec2.copy(vec2.create(), tmpLine.n),
        force,
        l: tmpLine.l * 1.2,
      };
      forceLines.push(newLine);
    }

    tmpLine.n[0] = 0;
    tmpLine.n[1] = 0;
    tmpLine.dN = 99999;
    tmpLine.dOrtho = 99999;
    tmpLine.force[1] = 0;

    drag = null;
  }
};

//
//
//

const o = vec3.create();
const v = vec3.create();
const origin = vec2.create();
let lastWaveT = 0;
export const onTap_wave: Handler = () => {
  if (lastWaveT + 3 > Date.now() / 1000) return;
  lastWaveT = Date.now() / 1000;

  const [{ pageX, pageY }] = lastTouches;
  getRayFromScreen(o, v, getScreenX(pageX), getScreenY(pageY));

  const y0 = 1;
  const t = (y0 - o[1]) / v[1];
  vec3.scaleAndAdd(cursor, o, v, t);

  const n = vec2.create();
  n[0] = -v[0];
  n[1] = -v[2];
  vec2.normalize(n, n);

  origin[0] = cursor[0];
  origin[1] = cursor[2];

  const a = [
    //
    (+SIZE_PHYSIC - origin[0]) / n[0],
    (+SIZE_PHYSIC - origin[1]) / n[1],

    (-SIZE_PHYSIC - origin[1]) / n[1],
    (-SIZE_PHYSIC - origin[0]) / n[0],
  ];
  const min = Math.max(...a.filter((x) => x < 0));

  vec2.scaleAndAdd(origin, origin, n, min);

  const l = 0.5;
  const lMax = 4 + Math.random() * 6;
  const lV = 1.3 + Math.random() * 0.5;
  const velocity = 5;

  {
    const line = {
      n,
      l,
      lMax,
      lV,
      velocity,
      dN: n[0] * origin[0] + n[1] * origin[1],
      dOrtho: -n[1] * origin[0] + n[0] * origin[1],
      h: 1,
      force: vec3.create(),
      age: 0,
      lifeSpan: Infinity,
    };

    line.force[1] = -1.2 + Math.random() * 0.2;

    forceLines.push(line);
  }

  {
    const line = {
      n,
      l: l + 1,
      lMax: lMax + 2,
      lV,
      velocity,
      dN: n[0] * origin[0] + n[1] * origin[1] - 3.5,
      dOrtho: -n[1] * origin[0] + n[0] * origin[1],
      h: 1,
      force: vec3.create(),
      age: 0,
      lifeSpan: Infinity,
    };

    line.force[0] = n[0] * 0.2;
    line.force[1] = 0.8;
    line.force[2] = n[1] * 0.2;

    forceLines.push(line);
  }
};
