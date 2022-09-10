import { quat, vec3 } from "gl-matrix";

export const getVec3 = (out: vec3, arr: ArrayLike<number>, i: number) => {
  out[0] = arr[i * 3 + 0];
  out[1] = arr[i * 3 + 1];
  out[2] = arr[i * 3 + 2];
};
export const getQuat = (out: quat, arr: ArrayLike<number>, i: number) => {
  out[0] = arr[i * 4 + 0];
  out[1] = arr[i * 4 + 1];
  out[2] = arr[i * 4 + 2];
  out[3] = arr[i * 4 + 3];
};
const setV = (arr: Float32Array, i: number, v: vec3) => {
  arr[i * 3 + 0] = v[0];
  arr[i * 3 + 1] = v[1];
  arr[i * 3 + 2] = v[2];
};
const setQuat = (arr: Float32Array, i: number, q: quat) => {
  arr[i * 4 + 0] = q[0];
  arr[i * 4 + 1] = q[1];
  arr[i * 4 + 2] = q[2];
  arr[i * 4 + 3] = q[3];
};

//

export const nParticles = 1200;

export const positions = new Float32Array(nParticles * 3);
export const rotations = new Float32Array(nParticles * 4);

const s = 7;

for (let i = nParticles; i--; ) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * s * 4;
  positions[i * 3 + 1] = Math.random() * 1 + 1;
  positions[i * 3 + 2] = (Math.random() - 0.5) * s * 4;

  const r = quat.fromEuler(
    quat.create(),
    //
    Math.random() * 360,
    Math.random() * 360,
    Math.random() * 360
  );

  setQuat(rotations, i, r);
}

export const velocities = new Float32Array(nParticles * 3);
const velocitiesRot = new Float32Array(nParticles * 4);

const acceleration = new Float32Array(nParticles * 3);

const q = quat.create();

const p = vec3.create();
const u = vec3.create();
const v = vec3.create();
const w = vec3.create();
const a = vec3.create();
const a2 = vec3.create();

let tideX = 0;
let t = 0;

const ITEM_RADIUS = 0.5;

const collision_planes = [
  //
  { n: [0, 0, 1] as vec3, d: -s, p: vec3.create() },
  { n: [0, 0, -1] as vec3, d: -s, p: vec3.create() },
  { n: [1, 0, 0] as vec3, d: -s, p: vec3.create() },
  { n: [-1, 0, 0] as vec3, d: -s, p: vec3.create() },
];
for (const plane of collision_planes) {
  vec3.scaleAndAdd(plane.p, plane.p, plane.n, plane.d);
}

let generation = 1;

export const step = (dt: number) => {
  t += dt;
  generation = (generation + 1) % 1024;

  acceleration.fill(0);

  tideX = ((tideX + dt * 5 + s * 1.6) % (s * 2 * 1.6)) - s * 1.6;

  for (let i = 0; i < nParticles; i++) {
    getVec3(p, positions, i);

    // solid friction
    acceleration[i * 3 + 0] += (-velocities[i * 3 + 0] * 0.03) / dt;
    acceleration[i * 3 + 1] += (-velocities[i * 3 + 1] * 0.03) / dt;
    acceleration[i * 3 + 2] += (-velocities[i * 3 + 2] * 0.03) / dt;

    // getQuat(q, velocitiesRot, i);
    // quat.scale(q, q, 0.99);
    // setQuat(velocitiesRot, i, q);

    // gravity
    acceleration[i * 3 + 1] -= 6;

    // underwater
    if (p[1] < 0) {
      // buoyance
      acceleration[i * 3 + 1] += -p[1] * 30;

      // low tide
      const m = 4;
      const d = Math.min(m, Math.abs(tideX - p[0]));
      const f = ((d - m) / m) ** 2;

      acceleration[i * 3 + 1] -= f * 20;
    }

    // wall
    for (let k = collision_planes.length; k--; ) {
      const plane = collision_planes[k];
      vec3.sub(w, p, plane.p);
      const d = vec3.dot(w, plane.n) - plane.d - ITEM_RADIUS;
      if (d < 0) {
        const f = 40 * 1 * Math.min(d, 0.15) ** 2;

        acceleration[i * 3 + 0] += plane.n[0] * f;
        acceleration[i * 3 + 1] += plane.n[1] * f;
        acceleration[i * 3 + 2] += plane.n[2] * f;
      }
    }

    // push each other
    for (let j = 0; j < i; j++) {
      getVec3(u, positions, j);

      const dSquare = vec3.sqrDist(p, u);

      if (dSquare < (ITEM_RADIUS * 2) ** 2) {
        const d = Math.sqrt(dSquare);

        if (d > 0.0001) {
          vec3.sub(v, p, u);
          vec3.scale(v, v, 1 / d);
        } else {
          vec3.set(v, 0, 1, 0);
        }

        const f = 60 * Math.min(0.25, 1 / (1 - d / (ITEM_RADIUS * 2)));

        acceleration[i * 3 + 0] += v[0] * f;
        acceleration[i * 3 + 1] += v[1] * f;
        acceleration[i * 3 + 2] += v[2] * f;

        acceleration[j * 3 + 0] -= v[0] * f;
        acceleration[j * 3 + 1] -= v[1] * f;
        acceleration[j * 3 + 2] -= v[2] * f;

        // push up
        if (p[1] > u[1]) acceleration[i * 3 + 1] += 0.7 * f;
        else acceleration[j * 3 + 1] += 0.7 * f;
      }
    }
  }

  for (let i = nParticles; i--; ) {
    velocities[i * 3 + 0] += dt * acceleration[i * 3 + 0];
    velocities[i * 3 + 1] += dt * acceleration[i * 3 + 1];
    velocities[i * 3 + 2] += dt * acceleration[i * 3 + 2];

    positions[i * 3 + 0] += dt * velocities[i * 3 + 0];
    positions[i * 3 + 1] += dt * velocities[i * 3 + 1];
    positions[i * 3 + 2] += dt * velocities[i * 3 + 2];
  }
};
