/* */ 
var Shader = require('./Shader');
function ComplexPrimitiveShader(shaderManager) {
  Shader.call(this, shaderManager, ['attribute vec2 aVertexPosition;', 'uniform mat3 translationMatrix;', 'uniform mat3 projectionMatrix;', 'uniform vec3 tint;', 'uniform float alpha;', 'uniform vec3 color;', 'varying vec4 vColor;', 'void main(void){', '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);', '   vColor = vec4(color * alpha * tint, alpha);', '}'].join('\n'), ['precision mediump float;', 'varying vec4 vColor;', 'void main(void){', '   gl_FragColor = vColor;', '}'].join('\n'), {
    tint: {
      type: '3f',
      value: [0, 0, 0]
    },
    alpha: {
      type: '1f',
      value: 0
    },
    color: {
      type: '3f',
      value: [0, 0, 0]
    },
    translationMatrix: {
      type: 'mat3',
      value: new Float32Array(9)
    },
    projectionMatrix: {
      type: 'mat3',
      value: new Float32Array(9)
    }
  }, {aVertexPosition: 0});
}
ComplexPrimitiveShader.prototype = Object.create(Shader.prototype);
ComplexPrimitiveShader.prototype.constructor = ComplexPrimitiveShader;
module.exports = ComplexPrimitiveShader;
