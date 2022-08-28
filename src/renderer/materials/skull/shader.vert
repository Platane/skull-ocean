 


attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

uniform mat4 uWorldMatrix;
uniform mat4 uInstancedMatrix;

varying lowp vec3 vColor;
varying lowp vec3 vNormal;

void main(void) {

  gl_Position = uWorldMatrix * uInstancedMatrix * vec4(aVertexPosition, 1.0);

  vNormal = aVertexNormal;
  
  vColor = aVertexColor ;
}