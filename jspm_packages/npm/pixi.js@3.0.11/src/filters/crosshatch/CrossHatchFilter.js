/* */ 
var core = require('../../core/index');
var fs = require('fs');
function CrossHatchFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/crosshatch.frag', 'utf8'));
}
CrossHatchFilter.prototype = Object.create(core.AbstractFilter.prototype);
CrossHatchFilter.prototype.constructor = CrossHatchFilter;
module.exports = CrossHatchFilter;
