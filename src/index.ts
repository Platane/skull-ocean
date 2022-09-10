import "./debug/mock-random";
import "./debug/auto-reload";
import "./debug/debug";

import "./controls";
import { render } from "./renderer/render";

import { step } from "./engine";

const loop = () => {
  step(1 / 60);

  render();
  requestAnimationFrame(loop);
};
loop();
