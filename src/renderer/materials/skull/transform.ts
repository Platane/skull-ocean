import { mat3, mat4, quat, vec3 } from "gl-matrix";
import { gl } from "../../../canvas";
import {
  getQuat,
  getVec3,
  positions,
  rotations,
} from "../../../engine/particlesBuffers";
import { getColor } from "../../../engine/color";
import { nParticles } from "../../../engine/constants";
import { lookAtMatrix3 } from "../../camera";

export { nParticles } from "../../../engine/constants";

export const worldMatrixBuffer = gl.createBuffer();
export const normalTransformMatrixBuffer = gl.createBuffer();
export const colorBuffer = gl.createBuffer();

const colors = new Float32Array(4 * nParticles);
colors.fill(1);

const worldMatrix = new Float32Array(16 * nParticles);
const worldMatrices = Array.from(
  { length: nParticles },
  (_, i) => new Float32Array(worldMatrix.buffer, i * 16 * 4, 16)
);

const normalTransformMatrix = new Float32Array(16 * nParticles);
const normalTransformMatrices = Array.from({ length: nParticles }, (_, i) => {
  const m = new Float32Array(normalTransformMatrix.buffer, i * 16 * 4, 16);
  mat4.identity(m as any);
  return m;
});

const m3 = mat3.create();

// use gl.bufferData once, then use bufferSubData which is suppose to be faster
// ref: http://disq.us/p/2ep12df
gl.bindBuffer(gl.ARRAY_BUFFER, worldMatrixBuffer);
gl.bufferData(gl.ARRAY_BUFFER, worldMatrix, gl.DYNAMIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, normalTransformMatrixBuffer);
gl.bufferData(gl.ARRAY_BUFFER, normalTransformMatrix, gl.DYNAMIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, null);

const position = vec3.create();
const rotation = quat.create();
const color = [0, 0, 0] as [number, number, number];
export const updateTransform = () => {
  for (let i = nParticles; i--; ) {
    getVec3(position, positions, i);
    getQuat(rotation, rotations, i);
    getColor(color, i);

    // set the world matrix
    mat4.fromRotationTranslation(worldMatrices[i], rotation, position);

    // compute inv - transpose
    mat3.fromMat4(m3, worldMatrices[i]);
    mat3.multiply(m3, lookAtMatrix3, m3);
    mat3.invert(m3, m3);
    mat3.transpose(m3, m3);

    normalTransformMatrices[i][0] = m3[0];
    normalTransformMatrices[i][1] = m3[1];
    normalTransformMatrices[i][2] = m3[2];
    normalTransformMatrices[i][4] = m3[3];
    normalTransformMatrices[i][5] = m3[4];
    normalTransformMatrices[i][6] = m3[5];
    normalTransformMatrices[i][8] = m3[6];
    normalTransformMatrices[i][9] = m3[7];
    normalTransformMatrices[i][10] = m3[8];

    // set the color
    colors[i * 4 + 0] = color[0];
    colors[i * 4 + 1] = color[1];
    colors[i * 4 + 2] = color[2];
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, worldMatrixBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, worldMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalTransformMatrixBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, normalTransformMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, colors);
};
