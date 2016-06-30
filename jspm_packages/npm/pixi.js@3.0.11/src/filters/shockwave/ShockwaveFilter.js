/* */ 
var core = require('../../core/index');
var fs = require('fs');
function ShockwaveFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/shockwave.frag', 'utf8'), {
    center: {
      type: 'v2',
      value: {
        x: 0.5,
        y: 0.5
      }
    },
    params: {
      type: 'v3',
      value: {
        x: 10,
        y: 0.8,
        z: 0.1
      }
    },
    time: {
      type: '1f',
      value: 0
    }
  });
}
ShockwaveFilter.prototype = Object.create(core.AbstractFilter.prototype);
ShockwaveFilter.prototype.constructor = ShockwaveFilter;
module.exports = ShockwaveFilter;
Object.defineProperties(ShockwaveFilter.prototype, {
  center: {
    get: function() {
      return this.uniforms.center.value;
    },
    set: function(value) {
      this.uniforms.center.value = value;
    }
  },
  params: {
    get: function() {
      return this.uniforms.params.value;
    },
    set: function(value) {
      this.uniforms.params.value = value;
    }
  },
  time: {
    get: function() {
      return this.uniforms.time.value;
    },
    set: function(value) {
      this.uniforms.time.value = value;
    }
  }
});
