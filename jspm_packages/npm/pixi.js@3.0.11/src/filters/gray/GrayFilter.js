/* */ 
var core = require('../../core/index');
var fs = require('fs');
function GrayFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/gray.frag', 'utf8'), {gray: {
      type: '1f',
      value: 1
    }});
}
GrayFilter.prototype = Object.create(core.AbstractFilter.prototype);
GrayFilter.prototype.constructor = GrayFilter;
module.exports = GrayFilter;
Object.defineProperties(GrayFilter.prototype, {gray: {
    get: function() {
      return this.uniforms.gray.value;
    },
    set: function(value) {
      this.uniforms.gray.value = value;
    }
  }});
