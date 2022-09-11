import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { normalTransformMatrix, worldMatrix } from "../../camera";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { getFlatShadingNormals } from "../../utils/flatShading";

// geometry

const positions: number[] = [
  //
  [8, 0.14, 3], // junction
  [17, 1.5, 6],
  [16, 1.6, -3],

  // first strip left

  //
  [8, 0.14, 3],
  [4, 0.12, 10],
  [17, 1.5, 6],
  //
  [4, 0.12, 10],
  [18, 1.4, 20],
  [17, 1.5, 6],
  //
  [18, 1.4, 20],
  [4, 0.12, 10],
  [3, 0.1, 25],
  //
  [18, 1.4, 20],
  [3, 0.1, 25],
  [3, 0.12, 32],
  //
  [20, 1.2, 42],
  [18, 1.4, 20],
  [3, 0.12, 32],
  //
  [20, 1.2, 42],
  [3, 0.12, 32],
  [3, -1, 50],

  // first strip right

  //
  [8, 0.14, 3],
  [16, 1.6, -3],
  [2.5, 0.08, -10],
  //
  [21, 1.5, -17],
  [2.5, 0.08, -10],
  [16, 1.6, -3],
  //
  [21, 1.5, -17],
  [2.3, 0.1, -25],
  [2.5, 0.08, -10],
  //
  [2.3, 0.1, -25],
  [21, 1.5, -17],
  [19, 0.7, -47],
  //
  [2, -1, -52],
  [2.3, 0.1, -25],
  [19, 0.7, -47],
].flat();

const colors = Array.from({ length: positions.length / 3 })
  .map(() => [0.4, 0.3, 0.5])
  .flat();

//

const program = createProgram(gl, codeVert, codeFrag);

//
// uniforms
//
const u_matrix = gl.getUniformLocation(program, "u_matrix");
const u_normalMatrix = gl.getUniformLocation(program, "u_normalMatrix");

//
// attributes
//

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

//
// position
//
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
const a_position = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

//
// position
//
const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  getFlatShadingNormals(positions),
  gl.STATIC_DRAW
);
const a_normal = gl.getAttribLocation(program, "a_normal");
gl.enableVertexAttribArray(a_normal);
gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);

//
// color
//
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
const a_color = gl.getAttribLocation(program, "a_color");
gl.enableVertexAttribArray(a_color);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);

gl.bindVertexArray(null);

//
//

export const draw = () => {
  gl.useProgram(program);

  gl.bindVertexArray(vao);

  gl.uniformMatrix4fv(u_matrix, false, worldMatrix);
  gl.uniformMatrix4fv(u_normalMatrix, false, normalTransformMatrix);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  gl.drawArrays(gl.TRIANGLES, 0, positions.length);

  gl.bindVertexArray(null);
};
