const q = Object.fromEntries(
  Array.from(
    (new URLSearchParams(window.location.search) as any).entries()
  ).map(([name, value]: any) => [name, value !== "0"])
);

export const debug = {
  gizmo: false,
  meshes: false,
  particles: false,
  boundingBoxes: false,
  skipSplash: false,
};
Object.assign(debug, q);
if ("all" in q) for (let i in debug) (debug as any)[i] = q.all;
