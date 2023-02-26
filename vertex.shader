precision mediump float;

uniform vec3 Camera;
uniform mat3 Rotation;
uniform vec2 Scale;

attribute vec3 position;
attribute vec3 offset;
varying vec3 vColor;

void main() {
  vColor = vec3( position.xyz / 2.3 + 0.4 );

  vec3 p = Rotation * (position - vec3(0.5,0.5,0.0) + offset - Camera);
  p.xz *= Scale;
  float newy = p.y * p.y / (p.y + 1.0);
  gl_Position = vec4(p.x, p.z, newy, p.y);
}
