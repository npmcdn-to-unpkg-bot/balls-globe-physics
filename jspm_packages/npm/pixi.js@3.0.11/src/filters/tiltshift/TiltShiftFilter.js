/* */ 
var core = require('../../core/index'),
    TiltShiftXFilter = require('./TiltShiftXFilter'),
    TiltShiftYFilter = require('./TiltShiftYFilter');
function TiltShiftFilter() {
  core.AbstractFilter.call(this);
  this.tiltShiftXFilter = new TiltShiftXFilter();
  this.tiltShiftYFilter = new TiltShiftYFilter();
}
TiltShiftFilter.prototype = Object.create(core.AbstractFilter.prototype);
TiltShiftFilter.prototype.constructor = TiltShiftFilter;
module.exports = TiltShiftFilter;
TiltShiftFilter.prototype.applyFilter = function(renderer, input, output) {
  var renderTarget = renderer.filterManager.getRenderTarget(true);
  this.tiltShiftXFilter.applyFilter(renderer, input, renderTarget);
  this.tiltShiftYFilter.applyFilter(renderer, renderTarget, output);
  renderer.filterManager.returnRenderTarget(renderTarget);
};
Object.defineProperties(TiltShiftFilter.prototype, {
  blur: {
    get: function() {
      return this.tiltShiftXFilter.blur;
    },
    set: function(value) {
      this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = value;
    }
  },
  gradientBlur: {
    get: function() {
      return this.tiltShiftXFilter.gradientBlur;
    },
    set: function(value) {
      this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = value;
    }
  },
  start: {
    get: function() {
      return this.tiltShiftXFilter.start;
    },
    set: function(value) {
      this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = value;
    }
  },
  end: {
    get: function() {
      return this.tiltShiftXFilter.end;
    },
    set: function(value) {
      this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = value;
    }
  }
});
