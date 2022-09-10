import { gl } from "../canvas";
import { updateTransform as updateSkullTransform } from "./materials/skull/transform";

import { draw as drawFlat } from "./materials/flat";
import { draw as drawGiz } from "./materials/giz";
import { draw as drawSkull } from "./materials/skull";
import { draw as drawSkullOutline } from "./materials/skull-outline";

gl.clearColor(0, 0, 0, 0);
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LESS);

export const render = () => {
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // update transform buffer
  updateSkullTransform();

  // draw
  drawFlat();
  drawGiz();
  drawSkull();
  drawSkullOutline();
};
