import { mat4, vec3 } from "gl-matrix";

export const nParticles = 5;

export const particlesMatrices = Array.from(
  { length: nParticles },
  (_, i) => new Float32Array(4 * 4)
);

// export const particlesMatrices = Array.from({ length: nParticles }, (_, i) => {
//   const byteOffsetToMatrix = i * 16 * 4;
//   const numFloatsForView = 16;
//   return new Float32Array(
//     particlesMatrix.buffer,
//     byteOffsetToMatrix,
//     numFloatsForView
//   );
// });

particlesMatrices.forEach((m, i) => {
  mat4.identity(m);

  const t = vec3.create();
  vec3.set(t, 0, 0, i * 1);
  mat4.translate(m, m, t);
  mat4.rotateX(m, m, Math.random() * Math.PI);
  mat4.rotateY(m, m, Math.random() * Math.PI);
  mat4.rotateZ(m, m, Math.random() * Math.PI);
});
