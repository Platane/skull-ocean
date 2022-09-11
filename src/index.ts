import "./debug/mock-random";
import "./debug/auto-reload";
import "./debug/debug";

import "./controls";

import "./engine/initialPosition";

import { render } from "./renderer/render";

import { stepPhysic } from "./engine/stepPhysic";
import { stepInert } from "./engine/stepInert";

const loop = () => {
  stepPhysic(1 / 60);
  stepInert(1 / 60);

  render();
  requestAnimationFrame(loop);
};
loop();
