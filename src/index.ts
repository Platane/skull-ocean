import "./debug/mock-random";
import "./debug/auto-reload";
import "./debug/debug";

import "./controls";
import { render } from "./renderer/render";

import { stepPhysic, stepInert } from "./engine";

const loop = () => {
  stepPhysic(1 / 60);
  stepInert(1 / 60);

  render();
  requestAnimationFrame(loop);
};
loop();
