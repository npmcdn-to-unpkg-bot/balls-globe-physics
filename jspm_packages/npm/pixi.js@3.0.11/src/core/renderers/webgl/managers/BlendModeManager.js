/* */ 
var WebGLManager = require('./WebGLManager');
function BlendModeManager(renderer) {
  WebGLManager.call(this, renderer);
  this.currentBlendMode = 99999;
}
BlendModeManager.prototype = Object.create(WebGLManager.prototype);
BlendModeManager.prototype.constructor = BlendModeManager;
module.exports = BlendModeManager;
BlendModeManager.prototype.setBlendMode = function(blendMode) {
  if (this.currentBlendMode === blendMode) {
    return false;
  }
  this.currentBlendMode = blendMode;
  var mode = this.renderer.blendModes[this.currentBlendMode];
  this.renderer.gl.blendFunc(mode[0], mode[1]);
  return true;
};
