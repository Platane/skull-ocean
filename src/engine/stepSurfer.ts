import { quat, vec2, vec3 } from "gl-matrix";
import { Handler } from "../controls-type";
import {
  getRayFromScreen,
  getScreenX,
  getScreenY,
} from "../renderer/utils/raycast";
import { getVec3, positions as particlesPositions } from "./buffers";
import { ITEM_RADIUS, nPhysic } from "./constants";

export const lookAt = vec3.create();
const o = vec3.create();
const v = vec3.create();
const p = vec3.create();

export const onTap: Handler = () => {};
export const onMouseMove: Handler = (touches) => {
  const { pageX, pageY } = touches[0];

  getRayFromScreen(o, v, getScreenX(pageX), getScreenY(pageY));

  // project on the ground
  const y0 = position[1];
  const t = (y0 - o[1]) / v[1];
  vec3.scaleAndAdd(lookAt, o, v, t);
};

const velocity = vec3.create();
const acceleration = vec3.create();

export const position = vec3.create();
export const rotation = quat.create();
quat.identity(rotation);
position[1] = 2;

const probeDepth = (x: number, z: number) => {
  const r = 2;

  const closest = [];

  for (let i = 0; i < nPhysic; i++) {
    const d2Square =
      (particlesPositions[i * 3 + 0] - x) ** 2 +
      (particlesPositions[i * 3 + 2] - z) ** 2;

    if (d2Square < r ** r) closest.push(i);
  }

  if (closest.length === 0) return 0;

  const ys = closest.map((i) => particlesPositions[i * 3 + 1]).sort();

  return ys.slice(0, 2).reduce((sum, y, _, { length }) => sum + y / length, 0);

  const y0 =
    closest.reduce(
      (max, i) => Math.max(max, particlesPositions[i * 3 + 1]),
      -10
    ) + ITEM_RADIUS;

  return y0;

  const weights = closest.map(
    (i) =>
      1 /
      Math.hypot(
        ITEM_RADIUS,
        Math.hypot(
          particlesPositions[i * 3 + 0] - x,
          particlesPositions[i * 3 + 1] - y0,
          particlesPositions[i * 3 + 2] - z
        )
      )
  );

  return (
    closest.reduce(
      (sum, i, j) => sum + particlesPositions[i * 3 + 1] * weights[j],
      0
    ) /
      weights.reduce((sum, x) => sum + x) +
    ITEM_RADIUS
  );
};

export const stepSurfer = (dt: number) => {
  vec3.scaleAndAdd(velocity, velocity, acceleration, dt);
  vec3.scaleAndAdd(position, position, velocity, dt);

  position[1] = probeDepth(position[0], position[2]);

  vec3.sub(v, lookAt, position);
  v[1] = 0;
  vec3.normalize(v, v);

  const up = vec3.create();
  up[2] = 1;

  quat.identity(rotation);
  quat.rotationTo(rotation, up, v);
};
