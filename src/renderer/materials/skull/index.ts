import { createProgram } from "../../utils/program";
import { gl } from "../../../canvas";
import { getAttributeLocation, getUniformLocation } from "../../utils/location";
import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { vec3 } from "gl-matrix";

const program = createProgram(gl, codeVert, codeFrag);

const colorLocation = getAttributeLocation(gl, program, "aVertexColor");
const normalLocation = getAttributeLocation(gl, program, "aVertexNormal");
const positionLocation = getAttributeLocation(gl, program, "aVertexPosition");

const timeLocation = getUniformLocation(gl, program, "uTime");
const worldMatrixLocation = getUniformLocation(gl, program, "uWorldMatrix");

const s = Date.now();

const gIndexBuffer = gl.createBuffer();
export const gIndexes = new Uint16Array(100 * 1000).map((_, i) => i);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gIndexes, gl.STATIC_DRAW);

const positionBuffer = gl.createBuffer();
const normalBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();
let n = 0;

export const updateGeometry = (
  colors: Float32Array,
  positions: Float32Array,
  normals: Float32Array
) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.DYNAMIC_DRAW);

  n = positions.length / 3;

  if (process.env.NODE_ENV !== "production") {
    // console.log("nfaces:", n / 3);
    if (n > gIndexes.length) throw new Error("index buffer too short");
  }
};

export const draw = (worldMatrix: Float32Array) => {
  gl.useProgram(program);

  gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);

  gl.uniform1f(timeLocation, (Date.now() - s) / 1000);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
};

// // //

const kernel = [
  //
  [1, 0, 1],
  [0, 1, 0],
  [-1, 0, 1],
];

const kernels = [];

for (let i = 4; i--; ) {
  kernels.push([
    [Math.cos((i / 4) * Math.PI * 2), 0, Math.sin((i / 4) * Math.PI * 2)],
    [0, 1, 0],
    [
      Math.cos(((i + 1) / 4) * Math.PI * 2),
      0,
      Math.sin(((i + 1) / 4) * Math.PI * 2),
    ],
  ]);
}

kernel.forEach((p) => vec3.normalize(p, p));

type Face = [vec3, vec3, vec3];

const tesselate = (face: Face) => {
  const m01 = vec3.lerp([], face[0], face[1], 0.5);
  const m12 = vec3.lerp([], face[1], face[2], 0.5);
  const m20 = vec3.lerp([], face[2], face[0], 0.5);

  vec3.normalize(m01, m01);
  vec3.normalize(m12, m12);
  vec3.normalize(m20, m20);

  return [
    [m01, m12, m20],
    [m01, face[1], m12],
    [m12, face[2], m20],
    [m20, face[0], m01],
  ] as Face[];
};

const tesselateRec = (face: Face, n = 0): Face[] => {
  if (n <= 0) return [face];
  return tesselate(face)
    .map((f) => tesselateRec(f, n - 1))
    .flat();
};

const vertices = kernels.map((face) => tesselateRec(face, 4).flat()).flat();

updateGeometry(
  new Float32Array(vertices.map(() => [240 / 255, 120 / 255, 0 / 255]).flat()),
  new Float32Array(vertices.map((p) => p).flat()),
  new Float32Array(
    vertices.map((p) => vec3.normalize(p as vec3, p as vec3) as any).flat()
  )
);
