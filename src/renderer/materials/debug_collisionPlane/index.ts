import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { worldMatrix } from "../../camera";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { collision_planes } from "../../../engine/stepPhysic";
import { vec3 } from "gl-matrix";
import { Face, facesToBuffer } from "../../geometries/types";
import { hslToRgb } from "../../utils/color";

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
var positionBuffer = gl.createBuffer();

const faces: Face[] = [];
{
  const u = vec3.create();
  const v = vec3.create();

  for (const plane of collision_planes) {
    vec3.set(u, 0, 0, 1);

    if (Math.abs(vec3.dot(plane.n, u)) > 0.8) vec3.set(u, 1, 0, 0);

    vec3.cross(v, u, plane.n);
    vec3.cross(u, v, plane.n);

    const l = 5;

    const c1 = vec3.create();
    const c2 = vec3.create();
    const c3 = vec3.create();
    const c4 = vec3.create();

    vec3.copy(c1, plane.p);
    vec3.scaleAndAdd(c1, c1, u, l);
    vec3.scaleAndAdd(c1, c1, v, l);

    vec3.copy(c2, plane.p);
    vec3.scaleAndAdd(c2, c2, u, -l);
    vec3.scaleAndAdd(c2, c2, v, l);

    vec3.copy(c3, plane.p);
    vec3.scaleAndAdd(c3, c3, u, -l);
    vec3.scaleAndAdd(c3, c3, v, -l);

    vec3.copy(c4, plane.p);
    vec3.scaleAndAdd(c4, c4, u, l);
    vec3.scaleAndAdd(c4, c4, v, -l);

    faces.push([c1, c2, c3], [c1, c4, c3]);
  }
}

const positions = facesToBuffer(faces);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
const a_position = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

//
// color
//
const colors = Array.from({ length: faces.length / 2 }, () => {
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

export const draw = () => {
  gl.useProgram(program);

  gl.bindVertexArray(vao);

  gl.uniformMatrix4fv(u_matrix, false, worldMatrix);

  gl.disable(gl.CULL_FACE);

  // gl.depthMask(false);

  gl.drawArrays(gl.TRIANGLES, 0, positions.length);

  // gl.depthMask(true);

  gl.bindVertexArray(null);
};
