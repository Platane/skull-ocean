import { mat4, vec3, mat3 } from "gl-matrix";
import { canvas } from "../canvas";
import { clamp } from "../math/utils";
import { Handler } from "../controls-type";
import { mat4FromMat3 } from "../math/mat4";
import { updateGeometry as updateHorizonGeometry } from "./materials/horizon/transform";

const maxZoom = 10;
const minZoom = 0;

// initialize static perspective matrix
export const perspectiveMatrix = new Float32Array(4 * 4);
const fovX = Math.PI / 3;
const near = 0.005;
const far = 2000;
let aspect = window.innerWidth / window.innerHeight;
mat4.perspective(perspectiveMatrix, fovX, aspect, near, far);

// camera primitive
let phi = 1.2;
let theta = 1;
let zoom = Math.floor((maxZoom + minZoom) / 2);
const rotationSpeed = 4;
export const lookAtPoint: vec3 = [0, 0, 0];
export const eye: vec3 = [0, 0, 1];

const UP: vec3 = [0, 1, 0];

// lookAtMatrix, build from the camera
export const lookAtMatrix = mat4.create();
export const lookAtMatrix3 = mat3.create();

// combination or perspective and lookAt matrices
export const worldMatrix = mat4.create();

// to apply to normal
export const normalTransformMatrix3 = mat3.create();
export const normalTransformMatrix4 = mat4.create();

const update = () => {
  const radius = 12 + zoom * zoom * 0.18;

  const sinPhiRadius = Math.sin(phi) * radius;
  eye[0] = sinPhiRadius * Math.sin(theta);
  eye[1] = Math.cos(phi) * radius;
  eye[2] = sinPhiRadius * Math.cos(theta);
  mat4.lookAt(lookAtMatrix, eye, lookAtPoint, UP);

  mat4.multiply(worldMatrix, perspectiveMatrix, lookAtMatrix);

  mat3.fromMat4(lookAtMatrix3, lookAtMatrix);

  mat3.normalFromMat4(normalTransformMatrix3, lookAtMatrix);

  mat4FromMat3(normalTransformMatrix4, normalTransformMatrix3);

  updateHorizonGeometry(eye, lookAtPoint);
};

update();

let zoom0 = 0;
let l0: number | null = null;

let px: number | null = null;
let py: number | null = null;

type H = (touches: { pageX: number; pageY: number }[]) => void;

const rotateStart: H = ([{ pageX: x, pageY: y }]) => {
  px = x;
  py = y;
};
const rotateMove: H = ([{ pageX: x, pageY: y }]) => {
  if (px !== null) {
    const dx = x - px!;
    const dy = y - py!;

    theta -= (dx / window.innerHeight) * rotationSpeed;
    phi -= (dy / window.innerHeight) * rotationSpeed;

    // theta = clamp(theta, Math.PI * 0.01, Math.PI * 0.99);
    phi = clamp(phi, Math.PI * 0.14, Math.PI * 0.45);

    document.getElementsByTagName("div")[0].style.opacity =
      "" + clamp(phi * 4 - 3.4, 0, 1);

    px = x;
    py = y;

    update();
  }
};
const rotateEnd = () => {
  px = null;
};

const scaleStart: H = ([
  { pageX: ax, pageY: ay },
  { pageX: bx, pageY: by },
]) => {
  zoom0 = zoom;
  l0 = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
};
const scaleMove: H = (a) => {
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

window.addEventListener(
  "resize",
  () => {
    aspect = window.innerWidth / window.innerHeight;
    mat4.perspective(perspectiveMatrix, fovX, aspect, near, far);

    update();
  },
  { passive: true }
);
