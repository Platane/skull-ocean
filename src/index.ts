import "./debug/mock-random";
import "./debug/auto-reload";
// import "./debug/debug";

import "./controls";

import { render } from "./renderer/render";

import { stepPhysic } from "./engine/stepPhysic";
import { stepInert } from "./engine/stepInert";
import { stepSurfer } from "./engine/stepSurfer";

const dt = 1 / 60;
const loop = () => {
  stepPhysic(dt);
  stepSurfer(dt);
  stepInert(dt);

  render();
  requestAnimationFrame(loop);
};
loop();
