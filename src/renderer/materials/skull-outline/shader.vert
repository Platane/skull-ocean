#version 300 es

// attributes
in vec4 a_position;

// instancied
in mat4 a_matrix;

// uniforms
uniform mat4 u_matrix;

void main() {
  
  gl_Position = u_matrix * a_matrix * a_position;
  
}

