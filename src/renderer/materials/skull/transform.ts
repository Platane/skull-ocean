import { mat4, vec3 } from "gl-matrix";
import { gl } from "../../../canvas";
import { nParticles, particlesMatrices } from "../../../particles";
import { lookAtMatrix, perspectiveMatrix } from "../../camera";

export const worldMatrixBuffer = gl.createBuffer();
export const normalTransformMatrixBuffer = gl.createBuffer();

const worldMatrix = new Float32Array(16 * nParticles);
const worldMatrices = Array.from(
  { length: nParticles },
  (_, i) => new Float32Array(worldMatrix.buffer, i * 16 * 4, 16)
);

const normalTransformMatrix = new Float32Array(16 * nParticles);
const normalTransformMatrices = Array.from(
  { length: nParticles },
  (_, i) => new Float32Array(normalTransformMatrix.buffer, i * 16 * 4, 16)
);

const transformMatrix = mat4.create();

export const updateTransform = () => {
  for (let i = nParticles; i--; ) {
    // set the world matrix
    mat4.multiply(transformMatrix, lookAtMatrix, particlesMatrices[i]);
    mat4.multiply(worldMatrices[i], perspectiveMatrix, transformMatrix);

    // set the normal transform matrix
    mat4.invert(transformMatrix, normalTransformMatrices[i]);
    mat4.transpose(normalTransformMatrices[i], normalTransformMatrices[i]);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, worldMatrixBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, worldMatrix, gl.DYNAMIC_DRAW);
  // gl.bufferSubData(gl.ARRAY_BUFFER, 0, worldMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalTransformMatrixBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normalTransformMatrix, gl.DYNAMIC_DRAW);
  // gl.bufferSubData(gl.ARRAY_BUFFER, 0, normalMatrix);
};
