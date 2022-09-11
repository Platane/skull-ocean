import { quat, vec2, vec3 } from "gl-matrix";
import { Handler } from "../controls-type";
import {
  getRayFromScreen,
  getScreenX,
  getScreenY,
} from "../renderer/utils/raycast";

export const lookAt = vec3.create();
const o = vec3.create();
const v = vec3.create();

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

export const stepSurfer = (dt: number) => {
  vec3.scaleAndAdd(velocity, velocity, acceleration, dt);
  vec3.scaleAndAdd(position, position, velocity, dt);

  vec3.sub(v, lookAt, position);
  v[1] = 0;
  vec3.normalize(v, v);

  const up = vec3.create();
  up[2] = 1;

  quat.identity(rotation);
  quat.rotationTo(rotation, up, v);
};
