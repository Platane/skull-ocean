import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { getAttributeLocation, getUniformLocation } from "../../utils/location";
import { worldMatrix } from "../../camera";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";

const program = createProgram(gl, codeVert, codeFrag);

const positionLocation = getAttributeLocation(gl, program, "aVertexPosition");

const worldMatrixLocation = getUniformLocation(gl, program, "uWorldMatrix");
const colorLocation = getUniformLocation(gl, program, "uColor");

const positions = new Float32Array([
  //
  0, 0, 0,
  //
  1, 0, 0,
  //
  0, 1, 0,

  //
  1, 1, 0,
  //
  0, 1, 0,
  //
  1, 0, 0,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const gIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(Array.from({ length: positions.length / 3 }, (_, i) => i)),
  gl.STATIC_DRAW
);

const colorF = new Float32Array([82 / 255, 72 / 255, 140 / 255]);

export const draw = () => {
  gl.useProgram(program);

  gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);
  gl.uniform3fv(colorLocation, colorF);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawElements(gl.TRIANGLES, positions.length / 3, gl.UNSIGNED_SHORT, 0);
};
