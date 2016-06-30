/* */ 
var core = require('../../core/index');
var fs = require('fs');
function BlurXFilter() {
  core.AbstractFilter.call(this, fs.readFileSync(__dirname + '/blurX.vert', 'utf8'), fs.readFileSync(__dirname + '/blur.frag', 'utf8'), {strength: {
      type: '1f',
      value: 1
    }});
  this.passes = 1;
  this.strength = 4;
}
BlurXFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurXFilter.prototype.constructor = BlurXFilter;
module.exports = BlurXFilter;
BlurXFilter.prototype.applyFilter = function(renderer, input, output, clear) {
  var shader = this.getShader(renderer);
  this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.width / input.size.width);
  if (this.passes === 1) {
    renderer.filterManager.applyFilter(shader, input, output, clear);
  } else {
    var renderTarget = renderer.filterManager.getRenderTarget(true);
    var flip = input;
    var flop = renderTarget;
    for (var i = 0; i < this.passes - 1; i++) {
      renderer.filterManager.applyFilter(shader, flip, flop, true);
      var temp = flop;
      flop = flip;
      flip = temp;
    }
    renderer.filterManager.applyFilter(shader, flip, output, clear);
    renderer.filterManager.returnRenderTarget(renderTarget);
  }
};
Object.defineProperties(BlurXFilter.prototype, {blur: {
    get: function() {
      return this.strength;
    },
    set: function(value) {
      this.padding = Math.abs(value) * 0.5;
      this.strength = value;
    }
  }});
