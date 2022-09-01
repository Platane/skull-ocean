import { mat4, vec3 } from "gl-matrix";
import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import {
  getAttributeLocation,
  instancePointerMatrix4fv,
  instancePointerVec4fv,
} from "../../utils/location";
import { createSkullGeometry } from "../../geometries/skull";
import { getFlatShadingNormals } from "../../utils/flatShading";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { nParticles } from "../../../particles";
import {
  colorBuffer,
  normalTransformMatrixBuffer,
  worldMatrixBuffer,
} from "./transform";

const program = createProgram(gl, codeVert, codeFrag);

// attributes
const normalLocation = getAttributeLocation(gl, program, "aVertexNormal");
const positionLocation = getAttributeLocation(gl, program, "aVertexPosition");

// instance varying attributes
const worldMatrixLocation = getAttributeLocation(gl, program, "aWorldMatrix");
const colorLocation = getAttributeLocation(gl, program, "aColor");
const normalTransformMatrixLocation = getAttributeLocation(
  gl,
  program,
  "aNormalTransformMatrix"
);

const positionBuffer = gl.createBuffer();
const normalBuffer = gl.createBuffer();
let nVerticesInstance = 0;

export const updateGeometry = (
  positions: Float32Array,
  normals: Float32Array
) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.DYNAMIC_DRAW);

  nVerticesInstance = positions.length / 3;
};

export const draw = () => {
  gl.useProgram(program);

  //
  // instance varying attribute
  //

  gl.bindBuffer(gl.ARRAY_BUFFER, worldMatrixBuffer);
  instancePointerMatrix4fv(gl, worldMatrixLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalTransformMatrixBuffer);
  instancePointerMatrix4fv(gl, normalTransformMatrixLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  instancePointerVec4fv(gl, colorLocation);

  //
  // attributes
  //

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  //
  // draw
  //
  gl.drawArraysInstanced(gl.TRIANGLES, 0, nVerticesInstance, nParticles);
};

// // //

const flat = (arr: ArrayLike<ArrayLike<number>>, acc: number[] = []) => {
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr[i].length; j++) acc.push(arr[i][j]);
  return acc;
};

(async () => {
  const vertices = (await createSkullGeometry()).flat();
  const positions = new Float32Array(flat(vertices));

  const indexes = new Uint16Array(positions.length / 3).map((_, i) => i);
  const normals = getFlatShadingNormals(indexes, positions);

  updateGeometry(positions, normals);
})();
