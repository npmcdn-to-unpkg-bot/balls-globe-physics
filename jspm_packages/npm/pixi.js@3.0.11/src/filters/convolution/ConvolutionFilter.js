/* */ 
var core = require('../../core/index');
var fs = require('fs');
function ConvolutionFilter(matrix, width, height) {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/convolution.frag', 'utf8'), {
    matrix: {
      type: '1fv',
      value: new Float32Array(matrix)
    },
    texelSize: {
      type: 'v2',
      value: {
        x: 1 / width,
        y: 1 / height
      }
    }
  });
}
ConvolutionFilter.prototype = Object.create(core.AbstractFilter.prototype);
ConvolutionFilter.prototype.constructor = ConvolutionFilter;
module.exports = ConvolutionFilter;
Object.defineProperties(ConvolutionFilter.prototype, {
  matrix: {
    get: function() {
      return this.uniforms.matrix.value;
    },
    set: function(value) {
      this.uniforms.matrix.value = new Float32Array(value);
    }
  },
  width: {
    get: function() {
      return 1 / this.uniforms.texelSize.value.x;
    },
    set: function(value) {
      this.uniforms.texelSize.value.x = 1 / value;
    }
  },
  height: {
    get: function() {
      return 1 / this.uniforms.texelSize.value.y;
    },
    set: function(value) {
      this.uniforms.texelSize.value.y = 1 / value;
    }
  }
});
