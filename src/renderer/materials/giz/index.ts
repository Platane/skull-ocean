import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { getAttributeLocation } from "../../utils/location";
import { mat4, vec3 } from "gl-matrix";
import { worldMatrix } from "../../camera";

const program = createProgram(gl, codeVert, codeFrag);

var positionAttributeLocation = getAttributeLocation(gl, program, "a_position");

var positionBuffer = gl.createBuffer();

const positions = [
  //
  [0.8, 0.9, 0.0],
  //
  [0, 0.9, 0.0],
  //
  [0.8, 0.3, 0.0],

  [0.0, 1.0, 0.0],
  //
  [0.0, 0.0, 1.0],
  //
  [0.0, 0.0, 0.0],
];

// Create a vertex array object (attribute state)
var vao = gl.createVertexArray();

// and make it the one we're currently working with
gl.bindVertexArray(vao);

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Turn on the attribute
gl.enableVertexAttribArray(positionAttributeLocation);

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

export const draw = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(
      positions
        .map((v) => {
          const out: number[] = [];
          vec3.transformMat4(out as any, v as any, worldMatrix);
          return out;
        })
        .flat()
    ),
    gl.STATIC_DRAW
  );

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, positions.length);

  //
  gl.bindVertexArray(null);
};
