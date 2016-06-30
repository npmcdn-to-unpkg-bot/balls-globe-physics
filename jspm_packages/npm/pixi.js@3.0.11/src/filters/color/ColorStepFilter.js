/* */ 
var core = require('../../core/index');
var fs = require('fs');
function ColorStepFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/colorStep.frag', 'utf8'), {step: {
      type: '1f',
      value: 5
    }});
}
ColorStepFilter.prototype = Object.create(core.AbstractFilter.prototype);
ColorStepFilter.prototype.constructor = ColorStepFilter;
module.exports = ColorStepFilter;
Object.defineProperties(ColorStepFilter.prototype, {step: {
    get: function() {
      return this.uniforms.step.value;
    },
    set: function(value) {
      this.uniforms.step.value = value;
    }
  }});
