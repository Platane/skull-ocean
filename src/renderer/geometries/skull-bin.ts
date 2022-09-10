import { getFlatShadingNormals } from "../utils/flatShading";
import { inflate } from "./inflate";
import { bufferToFaces, facesToBuffer } from "./types";

// the mesh is composed of 3 sub-meshes :
//   the skull, the eye socket, and patches that cover the eye socket ( skull + patch is kind of a hull )
//
// inside the binary, vertices array are concatenated such as:
// <--- socket ---><--- skull ---><--- patch --->
const socketLength = 297;
const skullLength = 1017;
const patchLength = 117;

const getVertices = async () => {
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

  return vertices;
};

export const createOutlineGeometry = async () => {
  const allVertices = await getVertices();

  const hullVertices = new Float32Array(
    allVertices.buffer,
    socketLength * 4,
    skullLength + patchLength
  );

  const faces = bufferToFaces(hullVertices);

  const positions = new Float32Array(facesToBuffer(inflate(faces, 0.08)));

  return { positions };
};

export const createSkullGeometry = async () => {
  const allVertices = await getVertices();

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
