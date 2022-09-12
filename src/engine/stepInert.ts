import { quat } from "gl-matrix";
import { lerp } from "../math/utils";
import { positions, rotations, setQuat } from "./particlesBuffers";
import { nPhysic, nUnderneath, SIZE_PHYSIC } from "./constants";

const q = quat.create();

let t = 0;
export const stepInert = (dt: number) => {
  const lastT = t;
  t += dt;

  for (let i = nPhysic; i < nPhysic + nUnderneath; i++) {
    const rand1 = ((i * 733) % 17) / 17;
    const rand2 = ((i * 619) % 13) / 13;
    const rand3 = ((i * 157) % 7) / 7;

    const offset = rand1 * Math.PI * 2;
    const a = lerp(rand2, 2.8, 3.8);
    const A = lerp(rand3, 0.1, 0.2);

    const dy_last = Math.sin(a * lastT + offset) * A;
    const dy = Math.sin(a * t + offset) * A;

    positions[i * 3 + 1] += dy - dy_last;
  }
};

//
// initial positions
//
const WORLD_SIZE = SIZE_PHYSIC * 2;
const MIN_CELL_SIZE = 1.05;
const nPackedLayer = Math.ceil(WORLD_SIZE / MIN_CELL_SIZE) ** 2;

const ITEM_RADIUS = 0.36;

const cellSizes = [];
let n = nUnderneath;
while (n > 0) {
  const s = Math.min(n, nPackedLayer);
  cellSizes.push(Math.sqrt(WORLD_SIZE ** 2 / s));
  n -= s;
}

for (let i = nPhysic; i < nPhysic + nUnderneath; i++) {
  // set random rotation
  quat.fromEuler(
    q,
    //
    Math.random() * 360,
    Math.random() * 360,
    Math.random() * 360
  );
  setQuat(rotations, i, q);

  const j = i - nPhysic;
  const layer = Math.floor(j / nPackedLayer);
  const cellSize = cellSizes[layer];
  const w = Math.ceil(WORLD_SIZE / cellSize);

  const x = (j % nPackedLayer) % w;
  const y = Math.floor((j % nPackedLayer) / w);

  positions[i * 3 + 0] =
    (x + 0.5) * cellSize +
    ITEM_RADIUS +
    Math.random() * (cellSize - ITEM_RADIUS * 2) -
    WORLD_SIZE / 2;

  positions[i * 3 + 2] =
    (y + (x % 2 ? 0.5 : 0)) * cellSize +
    ITEM_RADIUS +
    Math.random() * (cellSize - ITEM_RADIUS * 2) -
    WORLD_SIZE / 2;

  positions[i * 3 + 1] = -(2.4 + layer * 1.5) + Math.random() * 0.6;
}

// shuffle
for (let i = nPhysic; i < nPhysic + nUnderneath; i++) {
  const j = nPhysic + Math.floor(Math.random() * nUnderneath);

  const tmp0 = positions[i * 3 + 0];
  const tmp1 = positions[i * 3 + 1];
  const tmp2 = positions[i * 3 + 2];

  positions[i * 3 + 0] = positions[j * 3 + 0];
  positions[i * 3 + 1] = positions[j * 3 + 1];
  positions[i * 3 + 2] = positions[j * 3 + 2];

  positions[j * 3 + 0] = tmp0;
  positions[j * 3 + 1] = tmp1;
  positions[j * 3 + 2] = tmp2;
}
