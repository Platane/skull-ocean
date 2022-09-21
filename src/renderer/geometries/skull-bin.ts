import { getFlatShadingNormals } from "../utils/flatShading";
import { inflate } from "./inflate";
import {
  patchLength,
  skullLength,
  socketLength,
  uri,
} from "./skull-bin-constant";
import { bufferToFaces, facesToBuffer } from "./types";

const getVertices = async () => {
  const buffer = await fetch(uri).then((res) => res.arrayBuffer());

  const packed = new Uint16Array(buffer);

  const vertices = new Float32Array(
    Array.from(
      { length: packed.length },
      (_, i) => (packed[i] / (256 * 256) - 0.5) * 0.95
    )
  );

  return vertices;
};
let p: Promise<Float32Array>;

export const createOutlineGeometry = async () => {
  const allVertices = await (p || (p = getVertices()));

  const hullVertices = new Float32Array(
    allVertices.buffer,
    socketLength * 4,
    skullLength + patchLength
  );

  const faces = bufferToFaces(hullVertices);

  const positions = new Float32Array(facesToBuffer(inflate(faces, 0.1)));

  return { positions };
};

export const createSkullGeometry = async () => {
  const allVertices = await (p || (p = getVertices()));

  const positions = new Float32Array(
    allVertices.buffer,
    0,
    skullLength + socketLength
  );

  // const positions = new Float32Array(
  //   allVertices.buffer,
  //   socketLength * 4,
  //   skullLength + patchLength
  // );

  const normals = getFlatShadingNormals(positions);

  return { positions, normals };
};
