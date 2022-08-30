import "./debug/mock-random";
import "./debug/auto-reload";
import "./debug/debug";

import "./controls";
import { render } from "./renderer/render";
import { createSkullGeometry } from "./renderer/geometries/skull-bin";

createSkullGeometry();

const loop = () => {
  render();
  requestAnimationFrame(loop);
};
loop();
