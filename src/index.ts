import "./debug/mock-random";
import "./debug/auto-reload";
import "./debug/debug";

import "./controls";
import { render } from "./renderer/render";
import { createSkullGeometry } from "./renderer/geometries/skull-bin";
import { particlesMatrices } from "./particles";
import { mat4 } from "gl-matrix";

createSkullGeometry();

const loop = () => {
  mat4.fromYRotation(particlesMatrices[0], Date.now() / 2000);
  mat4.fromTranslation(particlesMatrices[0], [
    Math.sin(Date.now() / 2000),
    0,
    0,
  ]);

  render();
  requestAnimationFrame(loop);
};
loop();
