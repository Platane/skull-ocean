import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { getAttributeLocation, getUniformLocation } from "../../utils/location";
import { createSkullGeometry } from "../../geometries/skull";
import { getFlatShadingNormals } from "../../utils/flatShading";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";

const program = createProgram(gl, codeVert, codeFrag);

const colorLocation = getAttributeLocation(gl, program, "aVertexColor");
const normalLocation = getAttributeLocation(gl, program, "aVertexNormal");
const positionLocation = getAttributeLocation(gl, program, "aVertexPosition");

const worldMatrixLocation = getUniformLocation(gl, program, "uWorldMatrix");
const worldInstanceLocation = getUniformLocation(
  gl,
  program,
  "uInstancedMatrix"
);

const gIndexBuffer = gl.createBuffer();
const positionBuffer = gl.createBuffer();
const normalBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();
let n = 0;

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

  n = positions.length / 3;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);
  const gIndexes = new Uint16Array(n).map((_, i) => i);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gIndexes, gl.STATIC_DRAW);
};

export const draw = (worldMatrix: Float32Array, matrix: Float32Array) => {
  gl.useProgram(program);

  gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);
  gl.uniformMatrix4fv(worldInstanceLocation, false, matrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
};

// // //

const flat = (arr: ArrayLike<ArrayLike<number>>, acc: number[] = []) => {
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr[i].length; j++) acc.push(arr[i][j]);
  return acc;
};

{
  const vertices = createSkullGeometry().flat();
  const positions = new Float32Array(flat(vertices));
  const colors = new Float32Array(
    vertices.map(() => [240 / 255, 120 / 255, 0 / 255]).flat()
  );
  const indexes = new Uint16Array(positions.length / 3).map((_, i) => i);
  const normals = getFlatShadingNormals(indexes, positions);

  updateGeometry(colors, positions, normals);
}
