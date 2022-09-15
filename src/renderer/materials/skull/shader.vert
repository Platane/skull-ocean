#version 300 es

// attributes
in vec4 a_position;
in vec4 a_normal;

// instancied
in vec4 a_color;
in mat4 a_matrix;
in mat4 a_normalMatrix;

// uniforms
uniform mat4 u_matrix;
uniform mat4 u_normalMatrix;

out vec3 v_color;
out vec3 v_normal;


void main() {
  gl_Position = u_matrix * a_matrix * a_position;
  v_normal = vec3( u_normalMatrix * a_normalMatrix  * a_normal);
  v_color = a_color.rgb;
}

