import { vec3 } from "gl-matrix";
import { Face } from "./types";

export const createSkullGeometry = async () => {
  const buffer = await fetch("skull-vertices.bin").then((res) =>
    res.arrayBuffer()
  );

  const packed = new Uint16Array(buffer);

  const vertices = new Float32Array(
    Array.from({ length: packed.length }, (_, i) => packed[i] / (256 * 256))
  );

  return vertices;
};
