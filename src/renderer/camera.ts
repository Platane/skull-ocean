import { mat4, vec3, mat3 } from "gl-matrix";
import { canvas } from "../canvas";
import { clamp } from "../math/utils";
import { Handler } from "../controls-type";

const maxZoom = 10;
const minZoom = 0;

// initialize static perspective matrix
export const perspectiveMatrix = new Float32Array(4 * 4);
const fovX = Math.PI / 3;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.005;
const far = 20;
mat4.perspective(perspectiveMatrix, fovX, aspect, near, far);

// camera primitive
let phi = 1.2;
let theta = 1;
let zoom = Math.floor((maxZoom + minZoom) / 2);
const rotationSpeed = 3;
export const lookAtPoint: vec3 = [0, 0, 0];
export const eye: vec3 = [0, 0, 1];

export const UP: vec3 = [0, 1, 0];

// lookAtMatrix, build from the camera
export const lookAtMatrix = new Float32Array(4 * 4);

// combination or perspective and lookAt matrices
export const worldMatrix = new Float32Array(4 * 4);

// inverse of the 3x3 lookAt matrix
// used for bill boarding
export const lookAtMatrix3Inv = new Float32Array(3 * 3);

const update = () => {
  const radius = 2 + 0.8 + zoom * 0.09;

  const sinPhiRadius = Math.sin(phi) * radius;
  eye[0] = sinPhiRadius * Math.sin(theta);
  eye[1] = Math.cos(phi) * radius;
  eye[2] = sinPhiRadius * Math.cos(theta);
  mat4.lookAt(lookAtMatrix, eye, lookAtPoint, UP);

  mat4.multiply(worldMatrix, perspectiveMatrix, lookAtMatrix);

  mat3.fromMat4(lookAtMatrix3Inv, lookAtMatrix);
  mat3.invert(lookAtMatrix3Inv, lookAtMatrix3Inv);
};

update();

let zoom0 = 0;
let l0: number | null = null;

let px: number | null = null;
let py: number | null = null;

const rotateStart: Handler = ([{ pageX: x, pageY: y }]) => {
  px = x;
  py = y;
};
const rotateMove: Handler = ([{ pageX: x, pageY: y }]) => {
  if (px !== null) {
    const dx = x - px!;
    const dy = y - py!;

    theta -= (dx / window.innerHeight) * rotationSpeed;
    phi -= (dy / window.innerHeight) * rotationSpeed;

    phi = clamp(phi, Math.PI / 5, (2.2 * Math.PI) / 5);

    px = x;
    py = y;

    update();
  }
};
const rotateEnd = () => {
  px = null;
};

const scaleStart: Handler = ([
  { pageX: ax, pageY: ay },
  { pageX: bx, pageY: by },
]) => {
  zoom0 = zoom;
  l0 = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
};
const scaleMove: Handler = (a) => {
  if (l0 !== null) {
    const [{ pageX: ax, pageY: ay }, { pageX: bx, pageY: by }] = a;

    const l = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);

    zoom = clamp((zoom0 / l) * l0, minZoom, maxZoom);

    update();
  }
};
const scaleEnd = () => {
  l0 = null;
};

export const onTouchStart: Handler = (touches) => {
  if (touches.length === 1) {
    scaleEnd();
    rotateStart(touches);
  } else if (touches.length > 1) {
    rotateEnd();
    scaleStart(touches);
  }
};
export const onTouchMove: Handler = (touches) => {
  scaleMove(touches);
  rotateMove(touches);
};
export const onTouchEnd: Handler = (touches) => {
  scaleEnd();
  rotateEnd();

  onTouchStart(touches);
};

canvas.addEventListener(
  "wheel",
  (event) => {
    zoom = clamp(zoom + (event.deltaY < 0 ? -1 : 1), minZoom, maxZoom);

    update();
  },
  { passive: true }
);
