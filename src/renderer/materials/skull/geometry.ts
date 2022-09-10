import { createSkullGeometry } from "../../geometries/skull-bin";
import { getFlatShadingNormals } from "../../utils/flatShading";

const flat = (arr: ArrayLike<ArrayLike<number>>, acc: number[] = []) => {
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr[i].length; j++) acc.push(arr[i][j]);
  return acc;
};

export const geometryPromise = Promise.resolve()

  .then(createSkullGeometry)
  .then((faces) => {
    const positions = new Float32Array(flat(faces.flat()));
    const normals = getFlatShadingNormals(positions);

    return { positions, normals, faces };
  });
