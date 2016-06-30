/* */ 
var core = require('../../core/index');
var fs = require('fs');
function SepiaFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/sepia.frag', 'utf8'), {sepia: {
      type: '1f',
      value: 1
    }});
}
SepiaFilter.prototype = Object.create(core.AbstractFilter.prototype);
SepiaFilter.prototype.constructor = SepiaFilter;
module.exports = SepiaFilter;
Object.defineProperties(SepiaFilter.prototype, {sepia: {
    get: function() {
      return this.uniforms.sepia.value;
    },
    set: function(value) {
      this.uniforms.sepia.value = value;
    }
  }});
