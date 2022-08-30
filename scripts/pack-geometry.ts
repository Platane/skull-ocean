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

  const vertices = Array.from(indexes.array).map((i) => [
    positions.getX(i),
    positions.getY(i),
    positions.getZ(i),
  ]);

  // scale in a 1x1x1 cube
  const uVertices = vertices.map(([x, y, z]) => [
    MathUtils.inverseLerp(
      geometry.boundingBox!.min.x,
      geometry.boundingBox!.max.x,
      x
    ),

    MathUtils.inverseLerp(
      geometry.boundingBox!.min.y,
      geometry.boundingBox!.max.y,
      y
    ),

    MathUtils.inverseLerp(
      geometry.boundingBox!.min.z,
      geometry.boundingBox!.max.z,
      z
    ),
  ]);

  const packed = new Uint16Array(
    uVertices.map((p) => p.map((x) => Math.floor(x * 256 * 256))).flat()
  );

  fs.writeFileSync(path.join(__dirname, "../dist/skull-vertices.bin"), packed);
};
