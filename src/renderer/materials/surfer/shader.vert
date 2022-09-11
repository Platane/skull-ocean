#version 300 es



in vec4 a_position;
in vec3 a_color;
in vec3 a_normal;

out vec3 v_color;
out vec3 v_normal;

void main() {
  gl_Position = a_position;
  v_color = a_color;
  v_normal = a_normal;
}