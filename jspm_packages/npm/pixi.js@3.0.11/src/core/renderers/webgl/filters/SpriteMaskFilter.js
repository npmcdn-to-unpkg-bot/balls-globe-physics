/* */ 
var AbstractFilter = require('./AbstractFilter'),
    math = require('../../../math/index');
var fs = require('fs');
function SpriteMaskFilter(sprite) {
  var maskMatrix = new math.Matrix();
  AbstractFilter.call(this, fs.readFileSync(__dirname + '/spriteMaskFilter.vert', 'utf8'), fs.readFileSync(__dirname + '/spriteMaskFilter.frag', 'utf8'), {
    mask: {
      type: 'sampler2D',
      value: sprite._texture
    },
    alpha: {
      type: 'f',
      value: 1
    },
    otherMatrix: {
      type: 'mat3',
      value: maskMatrix.toArray(true)
    }
  });
  this.maskSprite = sprite;
  this.maskMatrix = maskMatrix;
}
SpriteMaskFilter.prototype = Object.create(AbstractFilter.prototype);
SpriteMaskFilter.prototype.constructor = SpriteMaskFilter;
module.exports = SpriteMaskFilter;
SpriteMaskFilter.prototype.applyFilter = function(renderer, input, output) {
  var filterManager = renderer.filterManager;
  this.uniforms.mask.value = this.maskSprite._texture;
  filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);
  this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);
  this.uniforms.alpha.value = this.maskSprite.worldAlpha;
  var shader = this.getShader(renderer);
  filterManager.applyFilter(shader, input, output);
};
Object.defineProperties(SpriteMaskFilter.prototype, {
  map: {
    get: function() {
      return this.uniforms.mask.value;
    },
    set: function(value) {
      this.uniforms.mask.value = value;
    }
  },
  offset: {
    get: function() {
      return this.uniforms.offset.value;
    },
    set: function(value) {
      this.uniforms.offset.value = value;
    }
  }
});
