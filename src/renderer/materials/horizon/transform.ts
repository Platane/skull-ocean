import { gl } from "../../../canvas";
import { vec3 } from "gl-matrix";
import { WORLD_RADIUS } from "../../../engine";

export const N = 10;

//
// position
//
const positions = new Float32Array(N * 3 * 3);
export const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

export const updateGeometry = (eye: vec3, lookAtPoint: vec3) => {
  const d = Math.hypot(lookAtPoint[0], lookAtPoint[2]);

  const ySwell = 2;
  const y0 = -4;

  let HORIZON_RADIUS = 999;

  if (eye[1] > ySwell + 0.1) {
    const r = (eye[1] - ySwell) / (eye[1] - y0);
    HORIZON_RADIUS = (WORLD_RADIUS - d) / r + d;
    // HORIZON_RADIUS = WORLD_RADIUS / r;
  }

  for (let i = N; i--; ) {
    const a0 = (Math.PI * 2 * i) / (N - 1);
    const a1 = (Math.PI * 2 * (i + 1)) / (N - 1);

    positions[i * 9 + 0 * 3 + 0] = 0;
    positions[i * 9 + 0 * 3 + 1] = y0;
    positions[i * 9 + 0 * 3 + 2] = 0;

    positions[i * 9 + 1 * 3 + 0] = Math.sin(a0) * HORIZON_RADIUS;
    positions[i * 9 + 1 * 3 + 1] = y0;
    positions[i * 9 + 1 * 3 + 2] = Math.cos(a0) * HORIZON_RADIUS;

    positions[i * 9 + 2 * 3 + 0] = Math.sin(a1) * HORIZON_RADIUS;
    positions[i * 9 + 2 * 3 + 1] = y0;
    positions[i * 9 + 2 * 3 + 2] = Math.cos(a1) * HORIZON_RADIUS;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
};
