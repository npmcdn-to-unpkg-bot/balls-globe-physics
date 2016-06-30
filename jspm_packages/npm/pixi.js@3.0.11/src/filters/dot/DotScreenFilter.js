/* */ 
var core = require('../../core/index');
var fs = require('fs');
function DotScreenFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/dotScreen.frag', 'utf8'), {
    scale: {
      type: '1f',
      value: 1
    },
    angle: {
      type: '1f',
      value: 5
    },
    dimensions: {
      type: '4fv',
      value: [0, 0, 0, 0]
    }
  });
}
DotScreenFilter.prototype = Object.create(core.AbstractFilter.prototype);
DotScreenFilter.prototype.constructor = DotScreenFilter;
module.exports = DotScreenFilter;
Object.defineProperties(DotScreenFilter.prototype, {
  scale: {
    get: function() {
      return this.uniforms.scale.value;
    },
    set: function(value) {
      this.uniforms.scale.value = value;
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
