/* */ 
var core = require('../../core/index'),
    BlurXFilter = require('./BlurXFilter'),
    BlurYFilter = require('./BlurYFilter');
function BlurFilter() {
  core.AbstractFilter.call(this);
  this.blurXFilter = new BlurXFilter();
  this.blurYFilter = new BlurYFilter();
}
BlurFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurFilter.prototype.constructor = BlurFilter;
module.exports = BlurFilter;
BlurFilter.prototype.applyFilter = function(renderer, input, output) {
  var renderTarget = renderer.filterManager.getRenderTarget(true);
  this.blurXFilter.applyFilter(renderer, input, renderTarget);
  this.blurYFilter.applyFilter(renderer, renderTarget, output);
  renderer.filterManager.returnRenderTarget(renderTarget);
};
Object.defineProperties(BlurFilter.prototype, {
  blur: {
    get: function() {
      return this.blurXFilter.blur;
    },
    set: function(value) {
      this.padding = Math.abs(value) * 0.5;
      this.blurXFilter.blur = this.blurYFilter.blur = value;
    }
  },
  passes: {
    get: function() {
      return this.blurXFilter.passes;
    },
    set: function(value) {
      this.blurXFilter.passes = this.blurYFilter.passes = value;
    }
  },
  blurX: {
    get: function() {
      return this.blurXFilter.blur;
    },
    set: function(value) {
      this.blurXFilter.blur = value;
    }
  },
  blurY: {
    get: function() {
      return this.blurYFilter.blur;
    },
    set: function(value) {
      this.blurYFilter.blur = value;
    }
  }
});
