import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { worldMatrix } from "../../camera";
import { N, positionBuffer } from "./transform";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";

const program = createProgram(gl, codeVert, codeFrag);

//
// uniforms
//
const u_matrix = gl.getUniformLocation(program, "u_matrix");

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

gl.bindVertexArray(null);

export const draw = () => {
  gl.useProgram(program);

  gl.uniformMatrix4fv(u_matrix, false, worldMatrix);

  gl.bindVertexArray(vao);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  gl.drawArrays(gl.TRIANGLES, 0, N * 3);

  gl.bindVertexArray(null);
};
