import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { getAttributeLocation, getUniformLocation } from "../../utils/location";
import { createSkullGeometry } from "../../geometries/skull";
import { inflate } from "../../geometries/inflate";
import { worldMatrix } from "../../camera";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";

const program = createProgram(gl, codeVert, codeFrag);

const positionLocation = getAttributeLocation(gl, program, "aVertexPosition");

const worldMatrixLocation = getUniformLocation(gl, program, "uWorldMatrix");
const colorLocation = getUniformLocation(gl, program, "uColor");

const gIndexBuffer = gl.createBuffer();
const positionBuffer = gl.createBuffer();
let n = 0;
let colorF = new Float32Array();

export const updateGeometry = (
  positions: Float32Array,
  color: Float32Array
) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  colorF = color;
  gl.uniform1fv(colorLocation, colorF);

  n = positions.length / 3;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);
  const gIndexes = new Uint16Array(n).map((_, i) => i);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gIndexes, gl.STATIC_DRAW);
};

export const draw = () => {
  gl.useProgram(program);

  gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);
  gl.uniform3fv(colorLocation, colorF);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);

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
  const vertices = inflate(createSkullGeometry(), 0.04).flat();
  const positions = new Float32Array(flat(vertices));
  const color = new Float32Array([82 / 255, 72 / 255, 40 / 255]);

  updateGeometry(positions, color);
}
