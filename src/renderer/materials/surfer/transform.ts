import { mat3, mat4, quat, vec3 } from "gl-matrix";
import { gl } from "../../../canvas";
import { setVec3 } from "../../../engine/buffers";
import { position, rotation } from "../../../engine/stepSurfer";
import { lookAtMatrix, perspectiveMatrix } from "../../camera";
import { getFlatShadingNormals } from "../../utils/flatShading";

export { nParticles } from "../../../engine/constants";

export const positionBuffer = gl.createBuffer();
export const normalBuffer = gl.createBuffer();
export const colorBuffer = gl.createBuffer();

const geometry_positions = [
  //
  [0, 0, 1.5],
  [0.6, 0, 0.5],
  [-0.6, 0, 0.5],

  [-0.6, 0, 0.5],
  [0.6, 0, 0.5],
  [0.4, 0, -1.5],

  [-0.6, 0, 0.5],
  [0.4, 0, -1.5],
  [-0.4, 0, -1.5],
] as vec3[];

export const nVertices = geometry_positions.length * 3;

const nx = getFlatShadingNormals(geometry_positions.flat() as any);
const geometry_normals = Array.from(
  { length: geometry_positions.length },
  (_, i) => [nx[i * 3 + 0], nx[i * 3 + 1], nx[i * 3 + 2]] as vec3
);

const colors = new Float32Array(
  Array.from({ length: 100 }, () => [0.2, 0.78, 0.85]).flat()
);

const transformMatrix = mat4.create();
const worldMatrix = mat4.create();
const normalTransformMatrix3 = mat3.create();
const P = vec3.create();

const positions = new Float32Array(geometry_positions.length * 3);
const normals = new Float32Array(geometry_positions.length * 3);

// use gl.bufferData once, then use bufferSubData which is suppose to be faster
// ref: http://disq.us/p/2ep12df
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, null);

export const updateTransform = () => {
  mat4.fromRotationTranslation(transformMatrix, rotation, position);
  mat4.multiply(transformMatrix, lookAtMatrix, transformMatrix);

  mat4.multiply(worldMatrix, perspectiveMatrix, transformMatrix);

  mat3.normalFromMat4(normalTransformMatrix3, transformMatrix);

  for (let i = 0; i < geometry_positions.length; i++) {
    vec3.transformMat4(P, geometry_positions[i], worldMatrix);
    setVec3(positions, i, P);

    vec3.transformMat3(P, geometry_normals[i], normalTransformMatrix3);
    setVec3(normals, i, P);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, normals);
};
