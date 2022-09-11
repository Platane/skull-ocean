import { quat, vec3 } from "gl-matrix";
import { lerp } from "../math/utils";

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

const nPhysic = 800;
const nUnderneath = 2400;
const nAround = 2000;

export const nParticles = nPhysic + nUnderneath + nAround;

export const positions = new Float32Array(nParticles * 3);
export const rotations = new Float32Array(nParticles * 4);

export const SIZE_PHYSIC = 10;
export const WORLD_RADIUS = 40;

export const velocities = new Float32Array(nPhysic * 3);
const velocitiesRot = new Float32Array(nPhysic * 4);

const acceleration = new Float32Array(nPhysic * 3);

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
  { n: [0, 0, 1] as vec3, d: -SIZE_PHYSIC / 2, p: vec3.create() },
  { n: [0, 0, -1] as vec3, d: -SIZE_PHYSIC / 2, p: vec3.create() },
  { n: [1, 0, 0] as vec3, d: -SIZE_PHYSIC / 2, p: vec3.create() },
  { n: [-1, 0, 0] as vec3, d: -SIZE_PHYSIC / 2, p: vec3.create() },
];
for (const plane of collision_planes) {
  vec3.scaleAndAdd(plane.p, plane.p, plane.n, plane.d);
}

// initial positions
{
  // set random rotation
  for (let i = nParticles; i--; ) {
    quat.fromEuler(
      q,
      //
      Math.random() * 360,
      Math.random() * 360,
      Math.random() * 360
    );

    setQuat(rotations, i, q);
  }

  // uniformly spread the dynamic ones
  for (let i = nPhysic; i--; ) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * SIZE_PHYSIC * 2;
    positions[i * 3 + 1] = Math.random() * 1 + 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SIZE_PHYSIC * 2;
  }

  const velocities = new Float32Array(Math.max(nUnderneath, nAround) * 3);
  const tidyLayer = (iMin: number, iMax: number, yDamp = 1) => {
    velocities.fill(0);

    for (let i = 0; i < iMax - iMin; i++) {
      getVec3(p, positions, i + iMin);

      // push each other
      for (let j = 0; j < i; j++) {
        getVec3(u, positions, j + iMin);

        const dSquare = vec3.sqrDist(p, u);

        if (dSquare < (ITEM_RADIUS * 2) ** 2) {
          const d = Math.sqrt(dSquare);

          if (d > 0.0001) {
            vec3.sub(v, p, u);
            v[1] *= yDamp;
            vec3.normalize(v, v);
          } else {
            vec3.set(v, 1, 0, 0);
          }

          const f = 1 - d;

          velocities[i * 3 + 0] += v[0] * f;
          velocities[i * 3 + 1] += v[1] * f;
          velocities[i * 3 + 2] += v[2] * f;

          velocities[j * 3 + 0] -= v[0] * f;
          velocities[j * 3 + 1] -= v[1] * f;
          velocities[j * 3 + 2] -= v[2] * f;
        }
      }
    }

    for (let i = iMin; i < iMax; i++) {
      positions[(i + iMin) * 3 + 0] += 1.2 * velocities[i * 3 + 0];
      positions[(i + iMin) * 3 + 1] += 1.2 * velocities[i * 3 + 1];
      positions[(i + iMin) * 3 + 2] += 1.2 * velocities[i * 3 + 2];
    }
  };

  // layer of background underneath everything
  for (let i = nPhysic; i < nPhysic + nUnderneath; i++) {
    const r = WORLD_RADIUS * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;

    positions[i * 3 + 0] = Math.sin(theta) * r;
    positions[i * 3 + 1] = -2.8 + Math.random() * 0.8;
    positions[i * 3 + 2] = Math.cos(theta) * r;
  }
  for (let k = 10; k--; ) tidyLayer(nPhysic, nPhysic + nUnderneath, 0.01);

  // layer of inert skulls around the dynamics
  for (
    let i = nPhysic + nUnderneath;
    i < nPhysic + nUnderneath + nAround;
    i++
  ) {
    let x = 0;
    let y = 0;

    while (
      -SIZE_PHYSIC < x &&
      x < SIZE_PHYSIC &&
      -SIZE_PHYSIC < y &&
      y < SIZE_PHYSIC
    ) {
      const r =
        WORLD_RADIUS *
        Math.sqrt(lerp(Math.random(), (SIZE_PHYSIC / WORLD_RADIUS) ** 2, 1));
      const theta = Math.random() * 2 * Math.PI;

      x = Math.sin(theta) * r;
      y = Math.cos(theta) * r;
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = Math.random() * 0.9 + 0.3;
    positions[i * 3 + 2] = y;
  }

  for (let k = 30; k--; )
    tidyLayer(nPhysic + nUnderneath, nPhysic + nUnderneath + nAround, 0.5);
}

let generation = 1;

let inertT = 0;
export const stepInert = (dt: number) => {
  const lastT = inertT;
  inertT += dt;

  for (
    let i = nPhysic + nUnderneath;
    i < nPhysic + nUnderneath + nAround;
    i++
  ) {
    const offset = ((i % 103) / 103) * Math.PI * 2;
    const a = lerp(((i * 17) % 29) / 29, 3, 3);

    const A = 0.2;
    const dy_last = Math.sin(a * lastT + offset) * A;
    const dy = Math.sin(a * inertT + offset) * A;

    positions[i * 3 + 1] += dy - dy_last;
  }
};

export const stepPhysic = (dt: number) => {
  t += dt;
  generation = (generation + 1) % 1024;

  acceleration.fill(0);

  tideX =
    ((tideX + dt * 5 + SIZE_PHYSIC * 1.6) % (SIZE_PHYSIC * 2 * 1.6)) -
    SIZE_PHYSIC * 1.6;

  for (let i = 0; i < nPhysic; i++) {
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

  for (let i = nPhysic; i--; ) {
    velocities[i * 3 + 0] += dt * acceleration[i * 3 + 0];
    velocities[i * 3 + 1] += dt * acceleration[i * 3 + 1];
    velocities[i * 3 + 2] += dt * acceleration[i * 3 + 2];

    positions[i * 3 + 0] += dt * velocities[i * 3 + 0];
    positions[i * 3 + 1] += dt * velocities[i * 3 + 1];
    positions[i * 3 + 2] += dt * velocities[i * 3 + 2];
  }
};
