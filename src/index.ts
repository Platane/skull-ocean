import "./debug/mock-random";
import "./debug/auto-reload";
import "./debug/debug";

import "./controls";
import { render } from "./renderer/render";

const loop = () => {
  render();
  requestAnimationFrame(loop);
};
loop();
