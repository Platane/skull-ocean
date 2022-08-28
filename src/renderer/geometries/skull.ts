import { vec3 } from "gl-matrix";
import { Face } from "./types";

export const createSkullGeometry = () => {
  const faces = createPyramidKernel()
    .map((face) => tesselateRec(face, 2))
    .flat()
    .map((face) => face.map((p) => vec3.clone(p)));

  return faces as Face[];
};

/**
 * create the primitive of a recursive sphere
 * some kind of double pyramid
 *
 * returns an array of oriented faces
 */
const createPyramidKernel = () => {
  const faces: Face[] = [];

  const n = 5;

  for (let i = n; i--; ) {
    const a = [
      Math.cos((i / n) * Math.PI * 2),
      0,
      Math.sin((i / n) * Math.PI * 2),
    ] as vec3;
    const b = [
      Math.cos(((i + 1) / n) * Math.PI * 2),
      0,
      Math.sin(((i + 1) / n) * Math.PI * 2),
    ] as vec3;

    faces.push(
      //
      [a, [0, 1, 0], b],
      [[0, -1, 0], a, b]
    );
  }

  return faces;
};

/**
 * tesselate face a face, assuming it's part of the unit sphere
 *
 * returns an array of oriented faces
 */
const tesselate = (face: Face) => {
  const m01 = vec3.lerp(vec3.create(), face[0], face[1], 0.5);
  const m12 = vec3.lerp(vec3.create(), face[1], face[2], 0.5);
  const m20 = vec3.lerp(vec3.create(), face[2], face[0], 0.5);

  vec3.normalize(m01, m01);
  vec3.normalize(m12, m12);
  vec3.normalize(m20, m20);

  return [
    [m01, m12, m20],
    [m01, face[1], m12],
    [m12, face[2], m20],
    [m20, face[0], m01],
  ] as Face[];
};

const tesselateRec = (face: Face, n = 0): Face[] => {
  if (n <= 0) return [face];
  return tesselate(face)
    .map((f) => tesselateRec(f, n - 1))
    .flat();
};
