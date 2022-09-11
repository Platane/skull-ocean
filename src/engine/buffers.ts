import { quat, vec3 } from "gl-matrix";
import { nParticles } from "./constants";

export const getVec3 = (out: vec3, arr: ArrayLike<number>, i: number) => {
  out[0] = arr[i * 3 + 0];
  out[1] = arr[i * 3 + 1];
  out[2] = arr[i * 3 + 2];
};
export const getQuat = (out: quat, arr: ArrayLike<number>, i: number) => {
  out[0] = arr[i * 4 + 0];
  out[1] = arr[i * 4 + 1];
  out[2] = arr[i * 4 + 2];
  out[3] = arr[i * 4 + 3];
};
export const setV = (arr: Float32Array, i: number, v: vec3) => {
  arr[i * 3 + 0] = v[0];
  arr[i * 3 + 1] = v[1];
  arr[i * 3 + 2] = v[2];
};
export const setQuat = (arr: Float32Array, i: number, q: quat) => {
  arr[i * 4 + 0] = q[0];
  arr[i * 4 + 1] = q[1];
  arr[i * 4 + 2] = q[2];
  arr[i * 4 + 3] = q[3];
};

//

export const positions = new Float32Array(nParticles * 3);
export const rotations = new Float32Array(nParticles * 4);
