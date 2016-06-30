/* */ 
var WebGLManager = require('./WebGLManager'),
    AlphaMaskFilter = require('../filters/SpriteMaskFilter');
function MaskManager(renderer) {
  WebGLManager.call(this, renderer);
  this.stencilStack = [];
  this.reverse = true;
  this.count = 0;
  this.alphaMaskPool = [];
}
MaskManager.prototype = Object.create(WebGLManager.prototype);
MaskManager.prototype.constructor = MaskManager;
module.exports = MaskManager;
MaskManager.prototype.pushMask = function(target, maskData) {
  if (maskData.texture) {
    this.pushSpriteMask(target, maskData);
  } else {
    this.pushStencilMask(target, maskData);
  }
};
MaskManager.prototype.popMask = function(target, maskData) {
  if (maskData.texture) {
    this.popSpriteMask(target, maskData);
  } else {
    this.popStencilMask(target, maskData);
  }
};
MaskManager.prototype.pushSpriteMask = function(target, maskData) {
  var alphaMaskFilter = this.alphaMaskPool.pop();
  if (!alphaMaskFilter) {
    alphaMaskFilter = [new AlphaMaskFilter(maskData)];
  }
  alphaMaskFilter[0].maskSprite = maskData;
  this.renderer.filterManager.pushFilter(target, alphaMaskFilter);
};
MaskManager.prototype.popSpriteMask = function() {
  var filters = this.renderer.filterManager.popFilter();
  this.alphaMaskPool.push(filters);
};
MaskManager.prototype.pushStencilMask = function(target, maskData) {
  this.renderer.stencilManager.pushMask(maskData);
};
MaskManager.prototype.popStencilMask = function(target, maskData) {
  this.renderer.stencilManager.popMask(maskData);
};
