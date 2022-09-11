import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import {
  colorBuffer,
  normalBuffer,
  nVertices,
  positionBuffer,
} from "./transform";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";

const program = createProgram(gl, codeVert, codeFrag);

//
// attributes
//

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

//
// position
//

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const a_position = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

//
// position
//

gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
const a_normal = gl.getAttribLocation(program, "a_normal");
gl.enableVertexAttribArray(a_normal);
gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);

//
// color
//

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
const a_color = gl.getAttribLocation(program, "a_color");
gl.enableVertexAttribArray(a_color);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);

//

gl.bindVertexArray(null);

//
//

export const draw = () => {
  gl.useProgram(program);

  gl.bindVertexArray(vao);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  gl.drawArrays(gl.TRIANGLES, 0, nVertices);

  gl.bindVertexArray(null);
};
