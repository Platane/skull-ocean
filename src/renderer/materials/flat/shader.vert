#version 300 es



// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
// in vec4 a_position;
in vec2 a_position;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  // gl_Position = a_position;
  gl_Position = vec4( a_position.x, a_position.y, 0.0, 1.0 );
}