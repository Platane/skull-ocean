import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import * as fs from "fs";
import * as path from "path";
import { MathUtils } from "three";

// monkey patch
class E {}
(global as any).ProgressEvent = E;

export const packGeometry = async () => {
  const filename = path.join(__dirname, "../src/assets/skull.glb");
  const glb = fs.readFileSync(filename);
  const blob = new Blob([glb]);
  const url = URL.createObjectURL(blob);

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);

  const { scene } = gltf;

  const { geometry: geometrySkull } = scene.children[0] as THREE.Mesh;
  const { geometry: geometrySocket } = scene.children[1] as THREE.Mesh;
  const { geometry: geometryPatch } = scene.children[2] as THREE.Mesh;

  const boundingBox = new THREE.Box3()
    .union(geometrySkull.boundingBox!)
    .union(geometrySocket.boundingBox!)
    .union(geometryPatch.boundingBox!);

  const c = boundingBox.getCenter(new THREE.Vector3());
  const s = boundingBox.getSize(new THREE.Vector3());

  const r = Math.max(s.x, s.y, s.z);

  const getPositionVectors = (geo: THREE.BufferGeometry) => {
    const positions = geo.getAttribute("position")!;
    const indexes = geo.getIndex()!;

    return Array.from(indexes.array).map(
      (i) =>
        new THREE.Vector3(
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        )
    );
  };

  const packVertices = (vertices: THREE.Vector3[]) => {
    // scale in a 1x1x1 cube
    const uVertices = vertices.map((p) =>
      p
        .sub(c)
        .multiplyScalar(1 / r)
        .add(new THREE.Vector3(0.5, 0.5, 0.5))
    );

    const packed = uVertices
      .map((p) => p.toArray().map((x) => Math.floor(x * 255 * 255)))
      .flat();

    return packed;
  };

  const packs = [geometrySocket, geometrySkull, geometryPatch]
    .map(getPositionVectors)
    .map(packVertices);

  // flip the faces of the patch somehow
  for (let i = 0; i < packs[2].length; i += 9) {
    const tmp0 = packs[2][i + 0 + 0];
    const tmp1 = packs[2][i + 0 + 1];
    const tmp2 = packs[2][i + 0 + 2];

    packs[2][i + 0 + 0] = packs[2][i + 3 + 0];
    packs[2][i + 0 + 1] = packs[2][i + 3 + 1];
    packs[2][i + 0 + 2] = packs[2][i + 3 + 2];

    packs[2][i + 3 + 0] = tmp0;
    packs[2][i + 3 + 1] = tmp1;
    packs[2][i + 3 + 2] = tmp2;
  }

  const packed = new Uint16Array(packs.flat());

  console.log(`
// the mesh is composed of 3 sub-meshes : 
//   the skull, the eye socket, and patches that cover the eye socket ( skull + patch is kind of a hull )
// 
// inside the binary, vertices array are concatenated such as:
// <--- socket ---><--- skull ---><--- patch --->
const socketLength=${packs[0].length};
const skullLength=${packs[1].length};
const patchLength=${packs[2].length};
  
  `);

  fs.writeFileSync(path.join(__dirname, "../dist/skull-vertices.bin"), packed);
};
