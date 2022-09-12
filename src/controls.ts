import { canvas } from "./canvas";
import { Touches } from "./controls-type";
import { ui } from "./ui";
import {
  onTouchStart as onTouchStart_camera,
  onTouchMove as onTouchMove_camera,
  onTouchEnd as onTouchEnd_camera,
} from "./renderer/camera";
import {
  onTouchMove as onTouchMove_surfer,
  onTap as onTap_surfer,
} from "./engine/stepSurfer";
import {
  onTouchEnd_wave,
  onTouchMove_wave,
  onTouchStart_wave,
} from "./engine/waveCreator";

let tap: { pageX: number; pageY: number; timeStamp: number } | null = null;
const onStart = (touches: Touches, event: Event) => {
  if (touches[0])
    tap = {
      pageX: touches[0].pageX,
      pageY: touches[0].pageY,
      timeStamp: Date.now(),
    };

  if (
    ui.mode === "camera" ||
    (event as any).button === 1 ||
    (event as any).ctrlKey
  ) {
    onTouchStart_camera(touches);
  } else {
    onTouchStart_wave(touches);
  }
};
const onMove = (touches: Touches, event: Event) => {
  if (
    tap &&
    Math.hypot(touches[0].pageX - tap.pageX, touches[0].pageY - tap.pageY) > 40
  )
    tap = null;

  onTouchMove_camera(touches);
  onTouchMove_surfer(touches);
  onTouchMove_wave(touches);
};
const onEnd = (touches: Touches, event: Event) => {
  onTouchEnd_camera(touches);
  onTouchEnd_wave(touches);

  if (tap && Date.now() < tap.timeStamp + 300) {
    onTap_surfer(touches);
  }
};

canvas.addEventListener("mousedown", (event) => onStart([event], event));
canvas.addEventListener("mousemove", (event) => onMove([event], event));
canvas.addEventListener("mouseup", (event) => onEnd([], event));

canvas.addEventListener(
  "touchstart",
  (event) => onStart(Array.from(event.touches), event),
  { passive: true }
);
canvas.addEventListener(
  "touchmove",
  (event) => onMove(Array.from(event.touches), event),
  { passive: true }
);
canvas.addEventListener(
  "touchend",
  (event) => onEnd(Array.from(event.touches), event),
  { passive: true }
);
