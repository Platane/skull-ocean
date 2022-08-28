import { mat4, vec3 } from "gl-matrix";
import { gl } from "../canvas";
import { worldMatrix } from "./camera";
import { draw as drawSkull } from "./materials/skull";
import { draw as drawSkullOutline } from "./materials/skull-outline";

gl.clearColor(0, 0, 0, 0);
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LESS);

// gl.enable(gl.BLEND);
// gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

export const render = () => {
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // object transform
  const matrix = mat4.create();
  mat4.identity(matrix);
  const t = vec3.create();
  vec3.set(t, 0, 0.42, 0.5);
  mat4.translate(matrix, matrix, t);

  // draw
  drawSkullOutline(worldMatrix);
  drawSkull(worldMatrix, matrix as Float32Array);
};
