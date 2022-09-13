import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { worldMatrix } from "../../camera";
import { vec3 } from "gl-matrix";
import { Face, facesToBuffer } from "../../geometries/types";
import { hslToRgb } from "../../utils/color";
import { forceLines } from "../../../engine/stepWaves";

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
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.DYNAMIC_DRAW);
const a_position = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

//
// color
//
const colors = Array.from({ length: 100 }, () => {
  const c = [0, 0, 0] as [number, number, number];
  hslToRgb(c, Math.random(), 0.9, 0.7);
  return Array.from({ length: 6 }, () => c);
}).flat(2);
var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
const a_color = gl.getAttribLocation(program, "a_color");
gl.enableVertexAttribArray(a_color);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);

gl.bindVertexArray(null);

//
//

let nVertices = 0;
const update = () => {
  const faces: Face[] = [];

  const u = vec3.create();
  const v = vec3.create();
  const o = vec3.create();

  for (const fl of forceLines) {
    u[0] = fl.n[0];
    u[2] = fl.n[1];

    v[0] = -fl.n[1];
    v[2] = fl.n[0];

    vec3.zero(o);
    o[1] = fl.h;
    vec3.scaleAndAdd(o, o, u, fl.dN);
    vec3.scaleAndAdd(o, o, v, fl.dOrtho);

    const c1 = vec3.create();
    const c2 = vec3.create();
    const c3 = vec3.create();
    const c4 = vec3.create();

    const l = 0.15;

    vec3.copy(c1, o);
    vec3.scaleAndAdd(c1, c1, u, l);
    vec3.scaleAndAdd(c1, c1, v, fl.l);

    vec3.copy(c2, o);
    vec3.scaleAndAdd(c2, c2, u, -l);
    vec3.scaleAndAdd(c2, c2, v, fl.l);

    vec3.copy(c3, o);
    vec3.scaleAndAdd(c3, c3, u, -l);
    vec3.scaleAndAdd(c3, c3, v, -fl.l);

    vec3.copy(c4, o);
    vec3.scaleAndAdd(c4, c4, u, l);
    vec3.scaleAndAdd(c4, c4, v, -fl.l);

    faces.push([c1, c2, c3], [c1, c4, c3]);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(facesToBuffer(faces)),
    gl.STATIC_DRAW
  );

  nVertices = forceLines.length * 6;
};

export const draw = () => {
  update();

  gl.useProgram(program);

  gl.bindVertexArray(vao);

  gl.uniformMatrix4fv(u_matrix, false, worldMatrix);

  gl.disable(gl.CULL_FACE);

  gl.drawArrays(gl.TRIANGLES, 0, nVertices);

  gl.bindVertexArray(null);
};
