import { canvas } from "./canvas";
import { onTouchStart, onTouchMove, onTouchEnd } from "./renderer/camera";
import { Handler } from "./controls-type";
import {
  onMouseMove as onMouseMove_surfer,
  onTap as onTap_surfer,
} from "./engine/stepSurfer";

let downTimeStamp = 0;
let t0: { pageX: number; pageY: number }[];
const onStart: Handler = (t) => {
  downTimeStamp = Date.now();
  t0 = t;
  onTouchStart(t);
};
const onMove: Handler = (t) => {
  onTouchMove(t);
  onMouseMove_surfer(t);
};
const onEnd: Handler = (t) => {
  onTouchEnd(t);

  if (Date.now() < downTimeStamp + 300) onTap_surfer(t);
};

canvas.addEventListener("mousedown", (event) => onStart([event]));
canvas.addEventListener("mousemove", (event) => onMove([event]));
canvas.addEventListener("mouseup", () => onEnd([]));

canvas.addEventListener(
  "touchstart",
  (event) => onStart(Array.from(event.touches)),
  { passive: true }
);
canvas.addEventListener(
  "touchmove",
  (event) => onMove(Array.from(event.touches)),
  { passive: true }
);
canvas.addEventListener(
  "touchend",
  (event) => onEnd(Array.from(event.touches)),
  { passive: true }
);
