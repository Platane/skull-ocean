import { quat, vec2, vec3 } from "gl-matrix";
import { Handler } from "../controls-type";
import {
  getRayFromScreen,
  getScreenX,
  getScreenY,
} from "../renderer/utils/raycast";
import { positions as particlesPositions } from "./buffers";
import { ITEM_RADIUS, nPhysic } from "./constants";

export const lookAt = vec3.create();
const o = vec3.create();
const v = vec3.create();

let acc = 0;
let accCoolDown = 0;
let accQ = false;

const doAcc = () => {
  accQ = false;
  acc = 1;
  accCoolDown = 0.2;
  console.log("acc");
};

export const onTap: Handler = () => {
  if (accCoolDown > 0) {
    accQ = true;
    return;
  } else doAcc();
};
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

  if (closest.length === 0) return 1.5;

  const ys = closest.map((i) => particlesPositions[i * 3 + 1]).sort();

  return (
    ys.slice(-2).reduce((sum, y, _, { length }) => sum + y / length, 0) +
    ITEM_RADIUS
  );
};

const up = vec3.create();
up[2] = 1;

export const stepSurfer = (dt: number) => {
  // rotate board
  vec3.sub(v, lookAt, position);
  v[1] = 0;
  vec3.normalize(v, v);

  quat.identity(rotation);
  quat.rotationTo(rotation, up, v);

  //
  //
  //
  acceleration.fill(0);

  // solid friction
  vec3.scaleAndAdd(acceleration, acceleration, velocity, -0.12 / dt);

  // tick acc
  accCoolDown = Math.max(0, accCoolDown - dt);
  if (accCoolDown === 0 && accQ) doAcc();

  vec3.scaleAndAdd(acceleration, acceleration, v, acc * 100);
  acc = acc * 0.85;

  // resolution
  vec3.scaleAndAdd(velocity, velocity, acceleration, dt);
  vec3.scaleAndAdd(position, position, velocity, dt);

  position[1] = probeDepth(position[0], position[2]);
};
