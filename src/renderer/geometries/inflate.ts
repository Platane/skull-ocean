import { vec3 } from "gl-matrix";
import { Face } from "./types";

/**
 * return the center of the bounding box
 */
const getCenter = (faces: Face[]) => {
  const min = vec3.create();
  const max = vec3.create();
  vec3.set(min, 9999, 9999, 9999);
  vec3.set(max, -9999, -9999, -9999);

  for (const face of faces)
    for (const v of face) {
      vec3.min(min, min, v);
      vec3.max(max, max, v);
    }

  return vec3.lerp(min, min, max, 0.5);
};

/**
 * return the inflated geometry
 * also flip the face
 */
export const inflate = (faces: Face[], margin: number) => {
  const c = getCenter(faces);

  return faces.map(
    (face) =>
      face
        .map((p) => {
          const v = vec3.create();
          vec3.sub(v, p, c);
          vec3.normalize(v, v);
          vec3.scaleAndAdd(v, p, v, margin);
          return v;
        })
        .reverse() as Face
  );
};
