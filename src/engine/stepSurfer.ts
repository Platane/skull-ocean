import { quat, vec3 } from "gl-matrix";
import { getVec3, positions } from "./buffers";
import { ITEM_RADIUS, nPhysic, SIZE_PHYSIC } from "./constants";

const velocity = vec3.create();
const acceleration = vec3.create();

export const position = vec3.create();
export const rotation = quat.create();
quat.identity(rotation);
position[1] = 2;

export const stepSurfer = (dt: number) => {
  vec3.scaleAndAdd(velocity, velocity, acceleration, dt);
  vec3.scaleAndAdd(position, position, velocity, dt);
};
