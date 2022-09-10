import { vec3 } from "gl-matrix";

export type Face = [vec3, vec3, vec3];

export const bufferToFaces = (positions: ArrayLike<number>) =>
  Array.from(
    { length: positions.length / 9 },
    (_, i) =>
      [
        [positions[i * 9 + 0], positions[i * 9 + 1], positions[i * 9 + 2]],
        [positions[i * 9 + 3], positions[i * 9 + 4], positions[i * 9 + 5]],
        [positions[i * 9 + 6], positions[i * 9 + 7], positions[i * 9 + 8]],
      ] as Face
  );

export const facesToBuffer = (faces: Face[]) => flat(faces.flat());

export const flat = (arr: ArrayLike<ArrayLike<number>>, acc: number[] = []) => {
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr[i].length; j++) acc.push(arr[i][j]);
  return acc;
};
