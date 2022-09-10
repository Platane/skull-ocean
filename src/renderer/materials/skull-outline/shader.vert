#version 300 es

// attributes
in vec4 a_position;

// instancied
in mat4 a_matrix;


void main() {
  
  gl_Position = a_matrix * a_position;
  
}

