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

export const getCells = (out: Set<number>[], x: number, y: number) => {
  const cX = Math.floor((x - gridOffsetX) / gridResolution);
  const cY = Math.floor((y - gridOffsetY) / gridResolution);

  out.pop();
  out.pop();
  out.pop();
  out.pop();

  if (cX < 0 || cX >= gridN || cY < 0 || cY >= gridN) return;

  out.push(grid[getCellIndex(cX, cY)]);

  const xm = 1 - (x - cX * gridResolution) > gridOverlap && cX + 1 < gridN;
  const ym = 1 - (y - cY * gridResolution) > gridOverlap && cY + 1 < gridN;

  if (xm) out.push(grid[getCellIndex(cX + 1, cY)]);
  if (ym) {
    out.push(grid[getCellIndex(cX, cY + 1)]);
    if (xm) out.push(grid[getCellIndex(cX + 1, cY + 1)]);
  }
};

const cells1 = [] as Set<number>[];
const cells2 = [] as Set<number>[];

export const updateItemInGrid = (
  i: number,
  previousX: number,
  previousY: number,
  newX: number,
  newY: number
) => {
  getCells(cells1, previousX, previousY);
  getCells(cells2, newX, newY);
  if (
    cells1[0] !== cells2[0] ||
    cells1[1] !== cells2[1] ||
    cells1[2] !== cells2[2]
  ) {
    for (let k = cells1.length; k--; ) cells1[k].delete(i);
    for (let k = cells2.length; k--; ) cells2[k].add(i);
  }
};
