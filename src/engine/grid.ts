/**
 * divide the world in cells
 * each cells contains a set, which is suppose to contains the indexes of particles in the set
 */

import { SIZE_PHYSIC } from "./constants";

const gridResolution = 1.2;
const gridOffsetX = -(SIZE_PHYSIC + 1);
const gridOffsetY = -(SIZE_PHYSIC + 1);
const gridOverlap = 0.6;
const gridN = Math.floor((SIZE_PHYSIC * 2) / gridResolution) + 2;

export const grid = Array.from({ length: gridN ** 2 }, () => new Set<number>());

const getCellIndex = (cellX: number, cellY: number) => cellX * gridN + cellY;

export const getCells = (out: number[], x: number, y: number) => {
  const cX = Math.floor((x - gridOffsetX) / gridResolution);
  const cY = Math.floor((y - gridOffsetY) / gridResolution);

  if (cX < 0 || cX >= gridN || cY < 0 || cY >= gridN) {
    out.length = 0;
    return;
  }

  out.length = 1;
  out[0] = getCellIndex(cX, cY);

  const xm = 1 - (x - cX * gridResolution) > gridOverlap && cX + 1 < gridN;
  const ym = 1 - (y - cY * gridResolution) > gridOverlap && cY + 1 < gridN;

  if (xm) out.push(getCellIndex(cX + 1, cY));
  if (ym) {
    out.push(getCellIndex(cX, cY + 1));
    if (xm) out.push(getCellIndex(cX + 1, cY + 1));
  }
};
