export const canvas: HTMLCanvasElement =
  document.getElementsByTagName("canvas")[0];

export const gl = canvas.getContext("webgl2")!;

export const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

const resize = () => {
  const w = window.innerWidth * dpr;
  const h = window.innerHeight * dpr;

  canvas.width = w;
  canvas.height = h;

  gl.viewport(0, 0, w, h);

  centerCamera();
};

const centerCamera = () => {};

resize();
window.addEventListener("resize", resize);
