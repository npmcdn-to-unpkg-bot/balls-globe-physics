/* */ 
var core = require('../../core/index');
var fs = require('fs');
function NoiseFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/noise.frag', 'utf8'), {noise: {
      type: '1f',
      value: 0.5
    }});
}
NoiseFilter.prototype = Object.create(core.AbstractFilter.prototype);
NoiseFilter.prototype.constructor = NoiseFilter;
module.exports = NoiseFilter;
Object.defineProperties(NoiseFilter.prototype, {noise: {
    get: function() {
      return this.uniforms.noise.value;
    },
    set: function(value) {
      this.uniforms.noise.value = value;
    }
  }});
