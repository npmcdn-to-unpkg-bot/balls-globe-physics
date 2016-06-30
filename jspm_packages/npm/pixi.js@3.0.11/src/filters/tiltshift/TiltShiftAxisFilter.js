/* */ 
var core = require('../../core/index');
var fs = require('fs');
function TiltShiftAxisFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/tiltShift.frag', 'utf8'), {
    blur: {
      type: '1f',
      value: 100
    },
    gradientBlur: {
      type: '1f',
      value: 600
    },
    start: {
      type: 'v2',
      value: {
        x: 0,
        y: window.innerHeight / 2
      }
    },
    end: {
      type: 'v2',
      value: {
        x: 600,
        y: window.innerHeight / 2
      }
    },
    delta: {
      type: 'v2',
      value: {
        x: 30,
        y: 30
      }
    },
    texSize: {
      type: 'v2',
      value: {
        x: window.innerWidth,
        y: window.innerHeight
      }
    }
  });
  this.updateDelta();
}
TiltShiftAxisFilter.prototype = Object.create(core.AbstractFilter.prototype);
TiltShiftAxisFilter.prototype.constructor = TiltShiftAxisFilter;
module.exports = TiltShiftAxisFilter;
TiltShiftAxisFilter.prototype.updateDelta = function() {
  this.uniforms.delta.value.x = 0;
  this.uniforms.delta.value.y = 0;
};
Object.defineProperties(TiltShiftAxisFilter.prototype, {
  blur: {
    get: function() {
      return this.uniforms.blur.value;
    },
    set: function(value) {
      this.uniforms.blur.value = value;
    }
  },
  gradientBlur: {
    get: function() {
      return this.uniforms.gradientBlur.value;
    },
    set: function(value) {
      this.uniforms.gradientBlur.value = value;
    }
  },
  start: {
    get: function() {
      return this.uniforms.start.value;
    },
    set: function(value) {
      this.uniforms.start.value = value;
      this.updateDelta();
    }
  },
  end: {
    get: function() {
      return this.uniforms.end.value;
    },
    set: function(value) {
      this.uniforms.end.value = value;
      this.updateDelta();
    }
  }
});
