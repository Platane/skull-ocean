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

/**
 * make the current buffer point to an attribute that change for each instance
 */
export const instancePointerMatrix4fv = (
  gl: WebGL2RenderingContext,
  attributeLocation: number
) => {
  const bytesPerMatrix = 4 * 16;
  for (let i = 0; i < 4; ++i) {
    const loc = attributeLocation + i;
    gl.enableVertexAttribArray(loc);
    // note the stride and offset
    const offset = i * 16; // 4 floats per row, 4 bytes per float
    gl.vertexAttribPointer(
      loc, // location
      4, // size (num values to pull from buffer per iteration)
      gl.FLOAT, // type of data in buffer
      false, // normalize
      bytesPerMatrix, // stride, num bytes to advance to get to next set of values
      offset // offset in buffer
    );
    // this line says this attribute only changes for each 1 instance
    gl.vertexAttribDivisor(loc, 1);
  }
};
