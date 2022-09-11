import { vec3 } from "gl-matrix";
import { getVec3 } from "../../engine/buffers";

const A = vec3.create();
const B = vec3.create();
const C = vec3.create();

const mAB = vec3.create();
const mBC = vec3.create();
const mCA = vec3.create();

export const tesselate = (positions: ArrayLike<number>) => {
  const newPositions = [] as number[];

  for (let i = 0; i < positions.length / 9; i++) {
    getVec3(A, positions, i * 9 + 0);
    getVec3(B, positions, i * 9 + 1);
    getVec3(C, positions, i * 9 + 2);
  }
};
