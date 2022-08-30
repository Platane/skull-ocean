precision highp float;

varying lowp vec3 vColor;
varying lowp vec3 vNormal;

void main(void) {

  vec3 staticLightDirection = vec3(0.615457,0.492365 ,0.615457);

  float staticLightPower = dot(vNormal, staticLightDirection) ;


  gl_FragColor = vec4(vColor, 1.0);

  gl_FragColor.rgb *= 0.6 + clamp(  staticLightPower, -0.47, 10.0 ) * 0.45  ;

}
