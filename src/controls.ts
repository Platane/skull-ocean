import { canvas } from "./canvas";
import {
  onTouchStart as onTouchStart_camera,
  onTouchMove as onTouchMove_camera,
  onTouchEnd as onTouchEnd_camera,
} from "./renderer/camera";
import { Handler } from "./controls-type";
import {
  onMouseMove as onMouseMove_surfer,
  onTap as onTap_surfer,
} from "./engine/stepSurfer";

let tap: { pageX: number; pageY: number; timeStamp: number } | null = null;
const onStart: Handler = (t) => {
  if (t[0])
    tap = { pageX: t[0].pageX, pageY: t[0].pageY, timeStamp: Date.now() };

  onTouchStart_camera(t);
};
const onMove: Handler = (t) => {
  if (tap && Math.hypot(t[0].pageX - tap.pageX, t[0].pageY - tap.pageY) > 40)
    tap = null;

  onTouchMove_camera(t);
  onMouseMove_surfer(t);
};
const onEnd: Handler = (t) => {
  onTouchEnd_camera(t);

  if (tap && Date.now() < tap.timeStamp + 300) {
    onTap_surfer(t);
  }
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
