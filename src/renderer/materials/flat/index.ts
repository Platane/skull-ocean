import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";

const program = createProgram(gl, codeVert, codeFrag);

// look up where the vertex data needs to go.
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

// Create a buffer and put three 2d clip space points in it
var positionBuffer = gl.createBuffer();

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

var positions = [
  //
  0, 0,
  //
  0, 0.5,
  //
  0.7, 0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Create a vertex array object (attribute state)
var vao = gl.createVertexArray();

// and make it the one we're currently working with
gl.bindVertexArray(vao);

// Turn on the attribute
gl.enableVertexAttribArray(positionAttributeLocation);

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

export const draw = () => {
  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  //
  gl.bindVertexArray(null);
};
