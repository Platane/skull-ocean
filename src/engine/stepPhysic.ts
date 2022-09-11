import { quat, vec3 } from "gl-matrix";
import { getVec3, positions } from "./buffers";
import { ITEM_RADIUS, nPhysic, SIZE_PHYSIC } from "./constants";

const velocities = new Float32Array(nPhysic * 3);
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

const shoreAN = vec3.create();
vec3.set(shoreAN, -0.4, 1, 0.2);
vec3.normalize(shoreAN, shoreAN);

const shoreBN = vec3.create();
vec3.set(shoreBN, -0.4, 1.2, -0.3);
vec3.normalize(shoreBN, shoreBN);

const shoreJunctionPoint = vec3.set(
  vec3.create(),
  SIZE_PHYSIC,
  0.4,
  SIZE_PHYSIC * 0.3
);

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
  // {
  //   n: vec3.set(vec3.create(), -1, 0, 0),
  //   d: 0,
  //   p: vec3.set(vec3.create(), SIZE_PHYSIC, 0, 0),
  // },
  {
    n: vec3.set(vec3.create(), 1, 0, 0),
    d: 0,
    p: vec3.set(vec3.create(), -SIZE_PHYSIC, 0, 0),
  },
  {
    n: shoreAN,
    d: 0,
    p: shoreJunctionPoint,
  },
  {
    n: shoreBN,
    d: 0,
    p: shoreJunctionPoint,
  },
];
for (const plane of collision_planes) {
  plane.d = -vec3.dot(plane.n, plane.p);
}

export const stepPhysic = (dt: number) => {
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

      const d = vec3.dot(p, plane.n) + plane.d - ITEM_RADIUS;

      if (d < 0) {
        const m = 0.16;
        const f = 20 * (Math.min(-d, m) / m) ** 2;

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
