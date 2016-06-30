/* */ 
var core = require('../../core/index');
var fs = require('fs');
function BlurDirFilter(dirX, dirY) {
  core.AbstractFilter.call(this, fs.readFileSync(__dirname + '/blurDir.vert', 'utf8'), fs.readFileSync(__dirname + '/blurDir.frag', 'utf8'), {
    strength: {
      type: '1f',
      value: 1
    },
    dirX: {
      type: '1f',
      value: dirX || 0
    },
    dirY: {
      type: '1f',
      value: dirY || 0
    }
  });
  this.defaultFilter = new core.AbstractFilter();
  this.passes = 1;
  this.dirX = dirX || 0;
  this.dirY = dirY || 0;
  this.strength = 4;
}
BlurDirFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurDirFilter.prototype.constructor = BlurDirFilter;
module.exports = BlurDirFilter;
BlurDirFilter.prototype.applyFilter = function(renderer, input, output, clear) {
  var shader = this.getShader(renderer);
  this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.width / input.size.width);
  if (this.passes === 1) {
    renderer.filterManager.applyFilter(shader, input, output, clear);
  } else {
    var renderTarget = renderer.filterManager.getRenderTarget(true);
    renderer.filterManager.applyFilter(shader, input, renderTarget, clear);
    for (var i = 0; i < this.passes - 2; i++) {
      renderer.filterManager.applyFilter(shader, renderTarget, renderTarget, clear);
    }
    renderer.filterManager.applyFilter(shader, renderTarget, output, clear);
    renderer.filterManager.returnRenderTarget(renderTarget);
  }
};
Object.defineProperties(BlurDirFilter.prototype, {
  blur: {
    get: function() {
      return this.strength;
    },
    set: function(value) {
      this.padding = value * 0.5;
      this.strength = value;
    }
  },
  dirX: {
    get: function() {
      return this.dirX;
    },
    set: function(value) {
      this.uniforms.dirX.value = value;
    }
  },
  dirY: {
    get: function() {
      return this.dirY;
    },
    set: function(value) {
      this.uniforms.dirY.value = value;
    }
  }
});
