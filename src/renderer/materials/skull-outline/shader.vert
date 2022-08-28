 


attribute vec3 aVertexPosition;

uniform mat4 uWorldMatrix;

void main(void) {

  gl_Position = uWorldMatrix * vec4(aVertexPosition, 1.0);


}