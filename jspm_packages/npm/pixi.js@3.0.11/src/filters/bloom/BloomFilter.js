/* */ 
var core = require('../../core/index'),
    BlurXFilter = require('../blur/BlurXFilter'),
    BlurYFilter = require('../blur/BlurYFilter');
function BloomFilter() {
  core.AbstractFilter.call(this);
  this.blurXFilter = new BlurXFilter();
  this.blurYFilter = new BlurYFilter();
  this.defaultFilter = new core.AbstractFilter();
}
BloomFilter.prototype = Object.create(core.AbstractFilter.prototype);
BloomFilter.prototype.constructor = BloomFilter;
module.exports = BloomFilter;
BloomFilter.prototype.applyFilter = function(renderer, input, output) {
  var renderTarget = renderer.filterManager.getRenderTarget(true);
  this.defaultFilter.applyFilter(renderer, input, output);
  this.blurXFilter.applyFilter(renderer, input, renderTarget);
  renderer.blendModeManager.setBlendMode(core.BLEND_MODES.SCREEN);
  this.blurYFilter.applyFilter(renderer, renderTarget, output);
  renderer.blendModeManager.setBlendMode(core.BLEND_MODES.NORMAL);
  renderer.filterManager.returnRenderTarget(renderTarget);
};
Object.defineProperties(BloomFilter.prototype, {
  blur: {
    get: function() {
      return this.blurXFilter.blur;
    },
    set: function(value) {
      this.blurXFilter.blur = this.blurYFilter.blur = value;
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
