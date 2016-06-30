/* */ 
var core = require('../../core/index');
var fs = require('fs');
function SmartBlurFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/smartBlur.frag', 'utf8'), {delta: {
      type: 'v2',
      value: {
        x: 0.1,
        y: 0.0
      }
    }});
}
SmartBlurFilter.prototype = Object.create(core.AbstractFilter.prototype);
SmartBlurFilter.prototype.constructor = SmartBlurFilter;
module.exports = SmartBlurFilter;
