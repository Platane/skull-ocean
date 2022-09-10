import { quat, vec3 } from "gl-matrix";

export const nParticles = 10;

export const particles = Array.from({ length: nParticles }, (_, i) => ({
  position: vec3.set(
    vec3.create(),
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 5 + 5,
    (Math.random() - 0.5) * 6
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
  color: [
    [0.4, 0.1, 0.7],
    [0.4, 0.2, 0.4],
    [0.3, 0.6, 0.1],
    [0.8, 0.4, 0.3],
  ][Math.floor(Math.random() * 4)],
}));
