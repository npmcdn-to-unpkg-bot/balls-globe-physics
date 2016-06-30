/* */ 
var core = require('../../core/index');
var fs = require('fs');
function BlurYTintFilter() {
  core.AbstractFilter.call(this, fs.readFileSync(__dirname + '/blurYTint.vert', 'utf8'), fs.readFileSync(__dirname + '/blurYTint.frag', 'utf8'), {
    blur: {
      type: '1f',
      value: 1 / 512
    },
    color: {
      type: 'c',
      value: [0, 0, 0]
    },
    alpha: {
      type: '1f',
      value: 0.7
    },
    offset: {
      type: '2f',
      value: [5, 5]
    },
    strength: {
      type: '1f',
      value: 1
    }
  });
  this.passes = 1;
  this.strength = 4;
}
BlurYTintFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurYTintFilter.prototype.constructor = BlurYTintFilter;
module.exports = BlurYTintFilter;
BlurYTintFilter.prototype.applyFilter = function(renderer, input, output, clear) {
  var shader = this.getShader(renderer);
  this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.height / input.size.height);
  if (this.passes === 1) {
    renderer.filterManager.applyFilter(shader, input, output, clear);
  } else {
    var renderTarget = renderer.filterManager.getRenderTarget(true);
    var flip = input;
    var flop = renderTarget;
    for (var i = 0; i < this.passes - 1; i++) {
      renderer.filterManager.applyFilter(shader, flip, flop, clear);
      var temp = flop;
      flop = flip;
      flip = temp;
    }
    renderer.filterManager.applyFilter(shader, flip, output, clear);
    renderer.filterManager.returnRenderTarget(renderTarget);
  }
};
Object.defineProperties(BlurYTintFilter.prototype, {blur: {
    get: function() {
      return this.strength;
    },
    set: function(value) {
      this.padding = value * 0.5;
      this.strength = value;
    }
  }});
