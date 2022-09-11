import { vec3 } from "gl-matrix";
import { Face } from "../geometries/types";

export const faceToVertices = (face: vec3[]) => {
  const vertices: number[] = [];
  for (let i = 1; i < face.length - 1; i++) {
    vertices.push(
      face[0][0],
      face[0][1],
      face[0][2],

      face[i + 0][0],
      face[i + 0][1],
      face[i + 0][2],

      face[i + 1][0],
      face[i + 1][1],
      face[i + 1][2]
    );
  }

  return vertices;
};
