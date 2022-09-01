 


attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

// instancied
attribute mat4 aWorldMatrix;
attribute mat4 aNormalTransformMatrix;
attribute vec4 aColor;

// varying
varying lowp vec3 vColor;
varying lowp vec3 vNormal;

void main(void) {

  gl_Position =  aWorldMatrix * vec4(aVertexPosition, 1.0);

  vNormal = vec3(  aNormalTransformMatrix * vec4(aVertexNormal, 1.0));
  
  vColor = vec3(aColor);

}