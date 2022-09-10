import { quat, vec3 } from "gl-matrix";
import { hslToRgb } from "./renderer/utils/color";

export const nParticles = 100;

export const particles = Array.from({ length: nParticles }, (_, i) => ({
  position: vec3.set(
    vec3.create(),
    (Math.random() - 0.5) * 7,
    (Math.random() - 0.5) * 12 + 5,
    (Math.random() - 0.5) * 7
  ),
  rotation: quat.fromEuler(
    quat.create(),
    //
    Math.random() * 360,
    Math.random() * 360,
    Math.random() * 360
  ),
  vRotation: quat.fromEuler(
    quat.create(),
    (Math.random() - 0.5) * 3,
    (Math.random() - 0.5) * 3,
    (Math.random() - 0.5) * 3
  ),
  color: hslToRgb(
    1.085 + Math.random() * 0.07,
    0.25 + Math.random() * 0.1,
    0.6 + Math.random() * 0.2
  ),
}));
