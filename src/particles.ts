import { quat, vec3 } from "gl-matrix";

export const nParticles = 500;

export const particles = Array.from({ length: nParticles }, (_, i) => ({
  position: vec3.set(
    vec3.create(),
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 4 + 5,
    (Math.random() - 0.5) * 4
  ),
  rotation: quat.fromEuler(
    quat.create(),
    Math.random(),
    Math.random(),
    Math.random()
  ),
  color: [
    [0.4, 0.1, 0.7],
    [0.4, 0.2, 0.4],
    [0.3, 0.6, 0.1],
    [0.8, 0.4, 0.3],
  ][Math.floor(Math.random() * 4)],
}));
