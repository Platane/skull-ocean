import { vec2, vec3 } from "gl-matrix";
import { Handler } from "../controls-type";
import { clamp } from "../math/utils";
import {
  getScreenX,
  getScreenY,
  projectOnGround,
} from "../renderer/utils/raycast";
import { forceLines } from "./stepWaves";

export const cursor = vec3.create();

export const onTouchMove_cursor: Handler = (touches) => {
  const { pageX, pageY } = touches[0];

  projectOnGround(cursor, getScreenX(pageX), getScreenY(pageY));
};

export const state = {
  drag: null as null | { x: number; y: number; t: number }[],
};

export const onTouchStart_wave: Handler = (touches) => {
  state.drag = [];
  onTouchMove_wave(touches);
};

export const onTouchMove_wave: Handler = (touches) => {
  if (!state.drag) return;

  let x = 0;
  let y = 0;
  for (const { pageX, pageY } of touches) {
    x += pageX;
    y += pageY;
  }

  projectOnGround(tmp, getScreenX(x), getScreenY(y), 1);

  state.drag.unshift({ t: Date.now() / 1000, x: tmp[0], y: tmp[2] });
  while (state.drag.length > 200) state.drag.pop();
};

const tmp = vec3.create();
export const onTouchEnd_wave: Handler = () => {
  if (state.drag) {
    const MAX_DURATION = 0.3;

    const end = state.drag[0];
    let i = 0;
    for (
      ;
      i < state.drag.length && end.t - state.drag[i].t < MAX_DURATION;
      i++
    );
    const start = state.drag[i] ?? state.drag[state.drag.length - 1];

    const dt = end.t - start.t;
    const l = Math.hypot(start.x - end.x, start.y - end.y);

    if (dt > MAX_DURATION * 0.4 && l > 2) {
      // create wave

      const n = vec2.create();
      n[0] = (end.x - start.x) / l;
      n[1] = (end.y - start.y) / l;

      const velocity = clamp(l / dt, 0, 6);

      const downLine = {
        n,
        l: 5,
        dN: n[0] * end.x + n[1] * end.y,
        dOrtho: -n[1] * end.x + n[0] * end.y,
        h: 3,
        velocity,
        force: vec3.set(vec3.create(), 0, -3, 0),
        age: 0,
        lifeSpan: 2,
      };

      forceLines.push(downLine);
    }

    state.drag = null;
  }
};
