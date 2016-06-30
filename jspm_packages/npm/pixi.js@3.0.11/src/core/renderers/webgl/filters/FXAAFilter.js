/* */ 
var AbstractFilter = require('./AbstractFilter');
var fs = require('fs');
function FXAAFilter() {
  AbstractFilter.call(this, fs.readFileSync(__dirname + '/FXAA.vert', 'utf8'), fs.readFileSync(__dirname + '/FXAA.frag', 'utf8'), {resolution: {
      type: 'v2',
      value: {
        x: 1,
        y: 1
      }
    }});
}
FXAAFilter.prototype = Object.create(AbstractFilter.prototype);
FXAAFilter.prototype.constructor = FXAAFilter;
module.exports = FXAAFilter;
FXAAFilter.prototype.applyFilter = function(renderer, input, output) {
  var filterManager = renderer.filterManager;
  var shader = this.getShader(renderer);
  filterManager.applyFilter(shader, input, output);
};
