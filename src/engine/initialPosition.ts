import { quat, vec3 } from "gl-matrix";
import { lerp } from "../math/utils";
import { getVec3, positions, rotations, setQuat } from "./buffers";
import {
  ITEM_RADIUS,
  nAround,
  nParticles,
  nPhysic,
  nUnderneath,
  SIZE_PHYSIC,
  WORLD_RADIUS,
} from "./constants";
import { collision_planes } from "./stepPhysic";

// initial positions
{
  const shores = collision_planes.slice(-2);
  const discardShore = (x: number, y: number, z: number) => {
    if (
      -SIZE_PHYSIC < x &&
      x < SIZE_PHYSIC &&
      -SIZE_PHYSIC < z &&
      z < SIZE_PHYSIC
    ) {
      return shores.some(
        (plane) => plane.n[0] * -x + plane.n[2] * -z > plane.d
      );
    }

    if (z < 0) return x > 1;
    else return x > 4;
  };

  const q = quat.create();

  const p = vec3.create();
  const u = vec3.create();
  const v = vec3.create();

  const velocities = new Float32Array(Math.max(nUnderneath, nAround) * 3);

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

  positions[0 * 3 + 2] = -11;

  //
  // TODO
  // improve that, it's too long to execute
  //
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
    let x = 999;
    let y = 0;
    const h = -2.8 + Math.random() * 0.8;

    while (discardShore(x, h, y)) {
      const r = WORLD_RADIUS * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;

      x = Math.sin(theta) * r;
      y = Math.cos(theta) * r;
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = h;
    positions[i * 3 + 2] = y;
  }
  // for (let k = 2; k--; ) tidyLayer(nPhysic, nPhysic + nUnderneath, 0.1);

  // layer of inert skulls around the dynamics
  for (
    let i = nPhysic + nUnderneath;
    i < nPhysic + nUnderneath + nAround;
    i++
  ) {
    let x = 0;
    let y = 0;
    const h = Math.random() * 0.9 + 0.3;

    while (
      (-SIZE_PHYSIC < x &&
        x < SIZE_PHYSIC &&
        -SIZE_PHYSIC < y &&
        y < SIZE_PHYSIC) ||
      discardShore(x, h, y)
    ) {
      const r =
        WORLD_RADIUS *
        Math.sqrt(lerp(Math.random(), (SIZE_PHYSIC / WORLD_RADIUS) ** 2, 1));
      const theta = Math.random() * 2 * Math.PI;

      x = Math.sin(theta) * r;
      y = Math.cos(theta) * r;
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = h;
    positions[i * 3 + 2] = y;
  }

  for (let k = 3; k--; )
    tidyLayer(nPhysic + nUnderneath, nPhysic + nUnderneath + nAround, 0.5);
}
