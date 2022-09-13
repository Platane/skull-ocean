import "./debug/mock-random";
import "./debug/auto-reload";
// import "./debug/stats";
// import "./debug/debug";

import "./controls";

import { render } from "./renderer/render";

import { stepPhysic } from "./engine/stepPhysic";
import { stepInert } from "./engine/stepInert";
import { stepSurfer } from "./engine/stepSurfer";
import { stepWaves } from "./engine/stepWaves";

const DT = 1 / 60;

const loop = () => {
  stepPhysic(DT);
  stepSurfer(DT);
  stepInert(DT);
  stepWaves(DT);

  render();
  requestAnimationFrame(loop);
};
loop();
