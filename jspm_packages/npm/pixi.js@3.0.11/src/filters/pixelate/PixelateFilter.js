/* */ 
var core = require('../../core/index');
var fs = require('fs');
function PixelateFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/pixelate.frag', 'utf8'), {
    dimensions: {
      type: '4fv',
      value: new Float32Array([0, 0, 0, 0])
    },
    pixelSize: {
      type: 'v2',
      value: {
        x: 10,
        y: 10
      }
    }
  });
}
PixelateFilter.prototype = Object.create(core.AbstractFilter.prototype);
PixelateFilter.prototype.constructor = PixelateFilter;
module.exports = PixelateFilter;
Object.defineProperties(PixelateFilter.prototype, {size: {
    get: function() {
      return this.uniforms.pixelSize.value;
    },
    set: function(value) {
      this.uniforms.pixelSize.value = value;
    }
  }});
