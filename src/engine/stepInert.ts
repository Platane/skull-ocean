import { lerp } from "../math/utils";
import { positions } from "./buffers";
import { nAround, nPhysic, nUnderneath } from "./constants";

let t = 0;
export const stepInert = (dt: number) => {
  const lastT = t;
  t += dt;

  for (
    let i = nPhysic + nUnderneath;
    i < nPhysic + nUnderneath + nAround;
    i++
  ) {
    const offset = ((i % 103) / 103) * Math.PI * 2;
    const a = lerp(((i * 17) % 29) / 29, 3, 3);

    const A = 0.2;
    const dy_last = Math.sin(a * lastT + offset) * A;
    const dy = Math.sin(a * t + offset) * A;

    positions[i * 3 + 1] += dy - dy_last;
  }
};
