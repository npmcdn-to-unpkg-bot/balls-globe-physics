/* */ 
var core = require('../../core/index');
var fs = require('fs');
function TwistFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/twist.frag', 'utf8'), {
    radius: {
      type: '1f',
      value: 0.5
    },
    angle: {
      type: '1f',
      value: 5
    },
    offset: {
      type: 'v2',
      value: {
        x: 0.5,
        y: 0.5
      }
    }
  });
}
TwistFilter.prototype = Object.create(core.AbstractFilter.prototype);
TwistFilter.prototype.constructor = TwistFilter;
module.exports = TwistFilter;
Object.defineProperties(TwistFilter.prototype, {
  offset: {
    get: function() {
      return this.uniforms.offset.value;
    },
    set: function(value) {
      this.uniforms.offset.value = value;
    }
  },
  radius: {
    get: function() {
      return this.uniforms.radius.value;
    },
    set: function(value) {
      this.uniforms.radius.value = value;
    }
  },
  angle: {
    get: function() {
      return this.uniforms.angle.value;
    },
    set: function(value) {
      this.uniforms.angle.value = value;
    }
  }
});
