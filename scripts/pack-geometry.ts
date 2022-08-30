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

  const { geometry } = scene.children[0] as THREE.Mesh;

  const positions = geometry.getAttribute("position")!;
  const indexes = geometry.getIndex()!;

  const vertices = Array.from(indexes.array).map(
    (i) =>
      new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i))
  );

  const c = geometry.boundingBox!.getCenter(new THREE.Vector3());
  const s = geometry.boundingBox!.getSize(new THREE.Vector3());

  const r = Math.max(s.x, s.y, s.z);
  const m = new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z);

  // scale in a 1x1x1 cube
  const uVertices = vertices.map((p) =>
    p
      .sub(c)
      .multiplyScalar(1 / r)
      .add(new THREE.Vector3(0.5, 0.5, 0.5))
  );

  const packed = new Uint16Array(
    uVertices
      .map((p) => p.toArray().map((x) => Math.floor(x * 255 * 255)))
      .flat()
  );

  fs.writeFileSync(path.join(__dirname, "../dist/skull-vertices.bin"), packed);
};
