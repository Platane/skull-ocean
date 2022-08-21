export const getAttributeLocation = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string
) => {
  const location = gl.getAttribLocation(program, name);

  if (process.env.NODE_ENV !== "production" && location == -1)
    throw Error(`attribute ${name} not found in the shader program`);

  gl.enableVertexAttribArray(location);

  return location;
};

export const getUniformLocation = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string
) => {
  const location = gl.getUniformLocation(program, name);

  if (process.env.NODE_ENV !== "production" && location == -1)
    throw Error(`uniform ${name} not found in the shader program`);

  return location;
};
