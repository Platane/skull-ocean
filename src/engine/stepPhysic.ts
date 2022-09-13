import { quat, vec3 } from "gl-matrix";
import {
  getQuat,
  getVec3,
  positions,
  rotations,
  setQuat,
} from "./particlesBuffers";
import { ITEM_RADIUS, nPhysic, SIZE_PHYSIC } from "./constants";
import { getCells, updateItemInGrid } from "./grid";
import { forceLines } from "./stepWaves";

//
// tmp vars
//
const q = quat.create();
const rot = quat.create();
const vRot = quat.create();

const p = vec3.create();
const u = vec3.create();
const v = vec3.create();

const QUAT_ID = quat.identity(quat.create());

const velocities = new Float32Array(nPhysic * 3);
const velocitiesRot = new Float32Array(nPhysic * 4);
quat.identity(q);
for (let i = nPhysic; i--; ) setQuat(velocitiesRot, i, q);
for (let i = nPhysic; i--; ) {
  quat.identity(q);
  quat.rotateX(q, q, Math.random() * 0.1);
  quat.rotateY(q, q, Math.random() * 0.1);
  setQuat(velocitiesRot, i, q);
}

const acceleration = new Float32Array(nPhysic * 3);

export const collision_planes = [
  //
  {
    n: vec3.set(vec3.create(), 0, 0, 1),
    d: 0,
    p: vec3.set(vec3.create(), 0, 0, -SIZE_PHYSIC),
  },
  {
    n: vec3.set(vec3.create(), 0, 0, -1),
    d: 0,
    p: vec3.set(vec3.create(), 0, 0, SIZE_PHYSIC),
  },
  {
    n: vec3.set(vec3.create(), -1, 0, 0),
    d: 0,
    p: vec3.set(vec3.create(), SIZE_PHYSIC, 0, 0),
  },
  {
    n: vec3.set(vec3.create(), 1, 0, 0),
    d: 0,
    p: vec3.set(vec3.create(), -SIZE_PHYSIC, 0, 0),
  },
];
for (const plane of collision_planes) {
  plane.d = -vec3.dot(plane.n, plane.p);
}

const cells1: Set<number>[] = [];
const seen = new Set<number>();

const applyForce = (i: number, fv: vec3, s: number) => {
  acceleration[i * 3 + 0] += fv[0] * s;
  acceleration[i * 3 + 1] += fv[1] * s;
  acceleration[i * 3 + 2] += fv[2] * s;
};

let generation = 0;
export const stepPhysic = (dt: number) => {
  generation = (generation + 1) % 1024;
  const generationRand = (generation % 37) ** 2 + (generation % 19) * 7;

  // reset acc
  acceleration.fill(0);

  // loop over particles
  for (let i = 0; i < nPhysic; i++) {
    getVec3(p, positions, i);

    // solid friction
    acceleration[i * 3 + 0] += (-velocities[i * 3 + 0] * 0.03) / dt;
    acceleration[i * 3 + 1] += (-velocities[i * 3 + 1] * 0.03) / dt;
    acceleration[i * 3 + 2] += (-velocities[i * 3 + 2] * 0.03) / dt;

    // rotation velocity reduction
    getQuat(vRot, velocitiesRot, i);
    quat.slerp(vRot, vRot, QUAT_ID, 0.06);

    // randomly set the moment when the y velocity is high enough
    if (
      Math.abs(velocities[i * 3 + 1]) > 0.7 &&
      i % 47 == generationRand % 47
    ) {
      quat.rotateX(vRot, vRot, (Math.random() - 0.5) * 0.1);
      quat.rotateY(vRot, vRot, (Math.random() - 0.5) * 0.1);
    }

    setQuat(velocitiesRot, i, vRot);

    // gravity
    acceleration[i * 3 + 1] -= 6;

    // buoyance if "underwater"
    if (p[1] < 0) {
      acceleration[i * 3 + 1] += -p[1] * 30;
    }

    // waves
    for (let k = forceLines.length; k--; ) {
      const fl = forceLines[k];

      const dN = Math.abs(fl.n[0] * p[0] + fl.n[1] * p[2] - fl.dN);

      const dOrtho = Math.abs(-fl.n[1] * p[0] + fl.n[0] * p[2] - fl.dOrtho);

      const w = ((1 / Math.max(0.2, dN)) * 1) / Math.max(dOrtho - fl.l, 0.2);

      applyForce(i, fl.force, w);
    }

    // wall
    for (let k = collision_planes.length; k--; ) {
      const plane = collision_planes[k];

      const d = vec3.dot(p, plane.n) + plane.d - ITEM_RADIUS;

      if (d < 0) {
        const m = 0.16;
        const f = 20 * (Math.min(-d, m) / m) ** 2;

        applyForce(i, plane.n, f);
      }
    }

    // push each other

    // query the grid to get the closest entities

    seen.clear();
    getCells(cells1, p[0], p[2]);
    for (let k = cells1.length; k--; )
      for (const j of cells1[k] as any)
        if (j < i && !seen.has(j)) {
          getVec3(u, positions, j);

          seen.add(j);

          vec3.sub(v, p, u);

          const dSquare = vec3.length(v);

          if (dSquare < (ITEM_RADIUS * 2) ** 2) {
            const d = Math.sqrt(dSquare);

            if (d > 0.0001) {
              vec3.scale(v, v, 1 / d);
            } else {
              vec3.set(v, 0, 1, 0);
            }

            const f = 60 * Math.min(0.25, 1 / (1 - d / (ITEM_RADIUS * 2)));

            applyForce(i, v, f);
            applyForce(j, v, -f);

            // push up
            if (p[1] > u[1]) acceleration[i * 3 + 1] += 0.7 * f;
            else acceleration[j * 3 + 1] += 0.7 * f;
          }
        }
  }

  for (let i = nPhysic; i--; ) {
    const px = positions[i * 3 + 0];
    const py = positions[i * 3 + 2];

    // step the position
    velocities[i * 3 + 0] += dt * acceleration[i * 3 + 0];
    velocities[i * 3 + 1] += dt * acceleration[i * 3 + 1];
    velocities[i * 3 + 2] += dt * acceleration[i * 3 + 2];

    positions[i * 3 + 0] += dt * velocities[i * 3 + 0];
    positions[i * 3 + 1] += dt * velocities[i * 3 + 1];
    positions[i * 3 + 2] += dt * velocities[i * 3 + 2];

    // step the rotation
    getQuat(rot, rotations, i);
    getQuat(vRot, velocitiesRot, i);
    quat.multiply(rot, rot, vRot);
    setQuat(rotations, i, rot);

    // update grid
    updateItemInGrid(i, px, py, positions[i * 3 + 0], positions[i * 3 + 2]);
  }
};

//
// initial positions
//
const MIN_CELL_SIZE = 0.9;
const cellSizes = [];
const nPackedLayer = Math.floor((SIZE_PHYSIC * 2) ** 2 / MIN_CELL_SIZE ** 2);
let n = nPhysic;
while (n > 0) {
  const s = Math.min(n, nPackedLayer);
  cellSizes.push(Math.sqrt((SIZE_PHYSIC * 2) ** 2 / s));
  n -= s;
}

for (let i = nPhysic; i--; ) {
  // set random rotation
  quat.fromEuler(
    q,
    //
    Math.random() * 360,
    Math.random() * 360,
    Math.random() * 360
  );
  setQuat(rotations, i, q);

  const y = Math.floor(i / nPackedLayer);
  const cellSize = cellSizes[y];
  const w = Math.ceil((SIZE_PHYSIC * 2) / cellSize);
  const x = (i % nPackedLayer) % w;
  const z = Math.floor((i % nPackedLayer) / w);

  // uniformly spread
  positions[i * 3 + 0] = x * cellSize - SIZE_PHYSIC + ITEM_RADIUS;
  positions[i * 3 + 1] = y * cellSize + Math.random() * 0.8;
  positions[i * 3 + 2] = z * cellSize - SIZE_PHYSIC + ITEM_RADIUS;

  // push to the grid
  getCells(cells1, positions[i * 3 + 0], positions[i * 3 + 2]);
  for (let k = cells1.length; k--; ) cells1[k].add(i);
}
