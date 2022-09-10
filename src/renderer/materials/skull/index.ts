import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { instancePointerMatrix4fv } from "../../utils/location";
import {
  colorBuffer,
  normalTransformMatrixBuffer,
  worldMatrixBuffer,
} from "./transform";
import { createSkullGeometry } from "../../geometries/skull-bin";
import { nParticles } from "../../../particles";

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
// normal
//
var normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.STATIC_DRAW);
const a_normal = gl.getAttribLocation(program, "a_normal");
gl.enableVertexAttribArray(a_normal);
gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);

//
// color
//
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
const a_color = gl.getAttribLocation(program, "a_color");
gl.enableVertexAttribArray(a_color);
gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, 0, 0);
gl.vertexAttribDivisor(a_color, 1);

//
// matrix
//
gl.bindBuffer(gl.ARRAY_BUFFER, worldMatrixBuffer);
const a_matrix = gl.getAttribLocation(program, "a_matrix");
instancePointerMatrix4fv(gl, a_matrix);

//
// normalMatrix
//
gl.bindBuffer(gl.ARRAY_BUFFER, normalTransformMatrixBuffer);
const a_normalMatrix = gl.getAttribLocation(program, "a_normalMatrix");
instancePointerMatrix4fv(gl, a_normalMatrix);

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

createSkullGeometry().then(({ positions, normals }) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.DYNAMIC_DRAW);

  nVerticesInstance = positions.length / 3;
});
