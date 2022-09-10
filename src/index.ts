import "./debug/mock-random";
import "./debug/auto-reload";
import "./debug/debug";

import "./controls";
import { render } from "./renderer/render";
import { createSkullGeometry } from "./renderer/geometries/skull-bin";
import { particles } from "./particles";
import { mat4, quat } from "gl-matrix";

createSkullGeometry();

const loop = () => {
  const vR = quat.create();
  quat.fromEuler(vR, 0, 0.5, 0.2);

  particles.forEach((p) => {
    p.position[1] = Math.max(p.position[1] - 0.02, 0);
    quat.multiply(p.rotation, p.rotation, p.vRotation);
  });

  render();
  requestAnimationFrame(loop);
};
loop();
