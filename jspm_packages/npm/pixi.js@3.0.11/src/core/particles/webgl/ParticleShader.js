/* */ 
var TextureShader = require('../../renderers/webgl/shaders/TextureShader');
function ParticleShader(shaderManager) {
  TextureShader.call(this, shaderManager, ['attribute vec2 aVertexPosition;', 'attribute vec2 aTextureCoord;', 'attribute float aColor;', 'attribute vec2 aPositionCoord;', 'attribute vec2 aScale;', 'attribute float aRotation;', 'uniform mat3 projectionMatrix;', 'varying vec2 vTextureCoord;', 'varying float vColor;', 'void main(void){', '   vec2 v = aVertexPosition;', '   v.x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);', '   v.y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);', '   v = v + aPositionCoord;', '   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);', '   vTextureCoord = aTextureCoord;', '   vColor = aColor;', '}'].join('\n'), ['precision lowp float;', 'varying vec2 vTextureCoord;', 'varying float vColor;', 'uniform sampler2D uSampler;', 'uniform float uAlpha;', 'void main(void){', '  vec4 color = texture2D(uSampler, vTextureCoord) * vColor * uAlpha;', '  if (color.a == 0.0) discard;', '  gl_FragColor = color;', '}'].join('\n'), {uAlpha: {
      type: '1f',
      value: 1
    }}, {
    aPositionCoord: 0,
    aRotation: 0
  });
}
ParticleShader.prototype = Object.create(TextureShader.prototype);
ParticleShader.prototype.constructor = ParticleShader;
module.exports = ParticleShader;
