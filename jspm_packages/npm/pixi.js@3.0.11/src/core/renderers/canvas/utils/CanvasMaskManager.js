/* */ 
var CanvasGraphics = require('./CanvasGraphics');
function CanvasMaskManager() {}
CanvasMaskManager.prototype.constructor = CanvasMaskManager;
module.exports = CanvasMaskManager;
CanvasMaskManager.prototype.pushMask = function(maskData, renderer) {
  renderer.context.save();
  var cacheAlpha = maskData.alpha;
  var transform = maskData.worldTransform;
  var resolution = renderer.resolution;
  renderer.context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution);
  if (!maskData.texture) {
    CanvasGraphics.renderGraphicsMask(maskData, renderer.context);
    renderer.context.clip();
  }
  maskData.worldAlpha = cacheAlpha;
};
CanvasMaskManager.prototype.popMask = function(renderer) {
  renderer.context.restore();
};
CanvasMaskManager.prototype.destroy = function() {};
