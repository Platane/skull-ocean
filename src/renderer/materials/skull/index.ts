import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { getAttributeLocation, getUniformLocation } from "../../utils/location";
import { createSkullGeometry } from "../../geometries/skull-bin";
import { getFlatShadingNormals } from "../../utils/flatShading";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { mat4, vec3 } from "gl-matrix";

const program = createProgram(gl, codeVert, codeFrag);

// attributes
const normalLocation = getAttributeLocation(gl, program, "aVertexNormal");
const positionLocation = getAttributeLocation(gl, program, "aVertexPosition");

// instance varying attributes
const instanceMatrixLocation = getAttributeLocation(
  gl,
  program,
  "aInstancedMatrix"
);
// const colorLocation = getAttributeLocation(gl, program, "aVertexColor");

// uniform
const worldMatrixLocation = getUniformLocation(gl, program, "uWorldMatrix");

const gIndexBuffer = gl.createBuffer();
const positionBuffer = gl.createBuffer();
const normalBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();
const instanceMatrixBuffer = gl.createBuffer();
let n = 0;

const nInstances = 1000;
const instanceMatrix = new Float32Array(16 * nInstances);
const instanceMatrices = Array.from({ length: nInstances }, (_, i) => {
  const byteOffsetToMatrix = i * 16 * 4;
  const numFloatsForView = 16;
  return new Float32Array(
    instanceMatrix.buffer,
    byteOffsetToMatrix,
    numFloatsForView
  );
});
instanceMatrices.forEach((m, i) => {
  mat4.identity(m);

  const t = vec3.create();
  vec3.set(t, 0, 0, i * 1);
  mat4.translate(m, m, t);
  mat4.rotateX(m, m, Math.random() * Math.PI);
  mat4.rotateY(m, m, Math.random() * Math.PI);
  mat4.rotateZ(m, m, Math.random() * Math.PI);
});

export const updateGeometry = (
  colors: Float32Array,
  positions: Float32Array,
  normals: Float32Array
) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, instanceMatrixBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceMatrix);
  // gl.bufferData(gl.ARRAY_BUFFER, instanceMatrix, gl.DYNAMIC_DRAW);

  n = positions.length / 3;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);
  const gIndexes = new Uint16Array(n).map((_, i) => i);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gIndexes, gl.STATIC_DRAW);
};

export const draw = (worldMatrix: Float32Array, matrix: Float32Array) => {
  gl.useProgram(program);

  gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);

  gl.bindBuffer(gl.ARRAY_BUFFER, instanceMatrixBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, instanceMatrix, gl.DYNAMIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceMatrix);

  const bytesPerMatrix = 4 * 16;
  for (let i = 0; i < 4; ++i) {
    const loc = instanceMatrixLocation + i;
    gl.enableVertexAttribArray(loc);
    // note the stride and offset
    const offset = i * 16; // 4 floats per row, 4 bytes per float
    gl.vertexAttribPointer(
      loc, // location
      4, // size (num values to pull from buffer per iteration)
      gl.FLOAT, // type of data in buffer
      false, // normalize
      bytesPerMatrix, // stride, num bytes to advance to get to next set of values
      offset // offset in buffer
    );
    // this line says this attribute only changes for each 1 instance
    gl.vertexAttribDivisor(loc, 1);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  // gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
  gl.drawArraysInstanced(
    gl.TRIANGLES,
    0, // offset
    n, // num vertices per instance
    nInstances // num instances
  );
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
  const colors = new Float32Array(
    vertices.map(() => [240 / 255, 120 / 255, 0 / 255]).flat()
  );
  const indexes = new Uint16Array(positions.length / 3).map((_, i) => i);
  const normals = getFlatShadingNormals(indexes, positions);

  updateGeometry(colors, positions, normals);
})();
