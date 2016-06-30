/* */ 
var core = require('../../core/index');
var fs = require('fs');
function AsciiFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/ascii.frag', 'utf8'), {
    dimensions: {
      type: '4fv',
      value: new Float32Array([0, 0, 0, 0])
    },
    pixelSize: {
      type: '1f',
      value: 8
    }
  });
}
AsciiFilter.prototype = Object.create(core.AbstractFilter.prototype);
AsciiFilter.prototype.constructor = AsciiFilter;
module.exports = AsciiFilter;
Object.defineProperties(AsciiFilter.prototype, {size: {
    get: function() {
      return this.uniforms.pixelSize.value;
    },
    set: function(value) {
      this.uniforms.pixelSize.value = value;
    }
  }});
