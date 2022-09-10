import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { instancePointerMatrix4fv } from "../../utils/location";
import { nParticles, worldMatrixBuffer } from "../skull/transform";
import { createOutlineGeometry } from "../../geometries/skull-bin";

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
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.STATIC_DRAW);
const a_position = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

//
// matrix
//
gl.bindBuffer(gl.ARRAY_BUFFER, worldMatrixBuffer);
const a_matrix = gl.getAttribLocation(program, "a_matrix");
instancePointerMatrix4fv(gl, a_matrix);

//
gl.bindVertexArray(null);

//
//

let nVerticesInstance = 0;

export const draw = () => {
  gl.useProgram(program);

  gl.bindVertexArray(vao);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  gl.drawArraysInstanced(gl.TRIANGLES, 0, nVerticesInstance, nParticles);

  gl.bindVertexArray(null);
};

createOutlineGeometry().then(({ positions }) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  nVerticesInstance = positions.length / 3;
});
