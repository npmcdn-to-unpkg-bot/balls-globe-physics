/* */ 
var core = require('../../core/index');
var fs = require('fs');
function InvertFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/invert.frag', 'utf8'), {invert: {
      type: '1f',
      value: 1
    }});
}
InvertFilter.prototype = Object.create(core.AbstractFilter.prototype);
InvertFilter.prototype.constructor = InvertFilter;
module.exports = InvertFilter;
Object.defineProperties(InvertFilter.prototype, {invert: {
    get: function() {
      return this.uniforms.invert.value;
    },
    set: function(value) {
      this.uniforms.invert.value = value;
    }
  }});
