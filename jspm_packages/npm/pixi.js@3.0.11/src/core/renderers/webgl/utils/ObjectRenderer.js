/* */ 
var WebGLManager = require('../managers/WebGLManager');
function ObjectRenderer(renderer) {
  WebGLManager.call(this, renderer);
}
ObjectRenderer.prototype = Object.create(WebGLManager.prototype);
ObjectRenderer.prototype.constructor = ObjectRenderer;
module.exports = ObjectRenderer;
ObjectRenderer.prototype.start = function() {};
ObjectRenderer.prototype.stop = function() {
  this.flush();
};
ObjectRenderer.prototype.flush = function() {};
ObjectRenderer.prototype.render = function(object) {};
