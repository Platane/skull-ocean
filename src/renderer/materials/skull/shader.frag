precision highp float;

varying lowp vec3 vColor;
varying lowp vec3 vNormal;

uniform float uTime;


void main(void) {

  

  vec3 staticLightDirection = vec3(1.0,0.8,1.0);
  normalize(staticLightDirection);
  float staticLightPower = dot(vNormal, staticLightDirection) ;

  float angle = uTime * 2.0 * 1.0;
  vec3 movingLightDirection = vec3( sin(angle), 1.5, cos(angle) );
  normalize(movingLightDirection);
  float movingLightPower =  dot(vNormal, movingLightDirection) ;

  gl_FragColor = vec4(vColor, 1.0);

  gl_FragColor.rgb *= 0.6 + clamp(  staticLightPower, -0.47, 10.0 ) * 0.45  ;

  
}