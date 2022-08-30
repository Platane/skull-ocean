import { vec3 } from "gl-matrix";
import { Face } from "./types";

export const createSkullGeometry = async () => {
  const buffer = await fetch("skull-vertices.bin").then((res) =>
    res.arrayBuffer()
  );

  const packed = new Uint16Array(buffer);

  const vertices = new Float32Array(
    Array.from(
      { length: packed.length },
      (_, i) => packed[i] / (256 * 256) - 0.5
    )
  );

  return Array.from(
    { length: vertices.length / 9 },
    (_, i) =>
      [
        [vertices[i * 9 + 0], vertices[i * 9 + 1], vertices[i * 9 + 2]],
        [vertices[i * 9 + 3], vertices[i * 9 + 4], vertices[i * 9 + 5]],
        [vertices[i * 9 + 6], vertices[i * 9 + 7], vertices[i * 9 + 8]],
      ] as Face
  );
};
