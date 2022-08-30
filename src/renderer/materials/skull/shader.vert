 


attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
// attribute vec3 aVertexColor;

uniform mat4 uWorldMatrix;

// instancied
// attribute vec4 aVertexColor;
attribute mat4 aInstancedMatrix;

varying lowp vec3 vColor;
varying lowp vec3 vNormal;

void main(void) {

  gl_Position = uWorldMatrix * aInstancedMatrix * vec4(aVertexPosition, 1.0);

  vNormal = aVertexNormal;
  
  vColor = vec3(0.3,0.8,0.4);

}