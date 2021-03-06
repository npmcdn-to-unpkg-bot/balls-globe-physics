/* */ 
var utils = require('../../../utils/index');
var CanvasTinter = {};
module.exports = CanvasTinter;
CanvasTinter.getTintedTexture = function(sprite, color) {
  var texture = sprite.texture;
  color = CanvasTinter.roundColor(color);
  var stringColor = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
  texture.tintCache = texture.tintCache || {};
  if (texture.tintCache[stringColor]) {
    return texture.tintCache[stringColor];
  }
  var canvas = CanvasTinter.canvas || document.createElement('canvas');
  CanvasTinter.tintMethod(texture, color, canvas);
  if (CanvasTinter.convertTintToImage) {
    var tintImage = new Image();
    tintImage.src = canvas.toDataURL();
    texture.tintCache[stringColor] = tintImage;
  } else {
    texture.tintCache[stringColor] = canvas;
    CanvasTinter.canvas = null;
  }
  return canvas;
};
CanvasTinter.tintWithMultiply = function(texture, color, canvas) {
  var context = canvas.getContext('2d');
  var resolution = texture.baseTexture.resolution;
  var crop = texture.crop.clone();
  crop.x *= resolution;
  crop.y *= resolution;
  crop.width *= resolution;
  crop.height *= resolution;
  canvas.width = crop.width;
  canvas.height = crop.height;
  context.fillStyle = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
  context.fillRect(0, 0, crop.width, crop.height);
  context.globalCompositeOperation = 'multiply';
  context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  context.globalCompositeOperation = 'destination-atop';
  context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
};
CanvasTinter.tintWithOverlay = function(texture, color, canvas) {
  var context = canvas.getContext('2d');
  var resolution = texture.baseTexture.resolution;
  var crop = texture.crop.clone();
  crop.x *= resolution;
  crop.y *= resolution;
  crop.width *= resolution;
  crop.height *= resolution;
  canvas.width = crop.width;
  canvas.height = crop.height;
  context.globalCompositeOperation = 'copy';
  context.fillStyle = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
  context.fillRect(0, 0, crop.width, crop.height);
  context.globalCompositeOperation = 'destination-atop';
  context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
};
CanvasTinter.tintWithPerPixel = function(texture, color, canvas) {
  var context = canvas.getContext('2d');
  var resolution = texture.baseTexture.resolution;
  var crop = texture.crop.clone();
  crop.x *= resolution;
  crop.y *= resolution;
  crop.width *= resolution;
  crop.height *= resolution;
  canvas.width = crop.width;
  canvas.height = crop.height;
  context.globalCompositeOperation = 'copy';
  context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  var rgbValues = utils.hex2rgb(color);
  var r = rgbValues[0],
      g = rgbValues[1],
      b = rgbValues[2];
  var pixelData = context.getImageData(0, 0, crop.width, crop.height);
  var pixels = pixelData.data;
  for (var i = 0; i < pixels.length; i += 4) {
    pixels[i + 0] *= r;
    pixels[i + 1] *= g;
    pixels[i + 2] *= b;
  }
  context.putImageData(pixelData, 0, 0);
};
CanvasTinter.roundColor = function(color) {
  var step = CanvasTinter.cacheStepsPerColorChannel;
  var rgbValues = utils.hex2rgb(color);
  rgbValues[0] = Math.min(255, (rgbValues[0] / step) * step);
  rgbValues[1] = Math.min(255, (rgbValues[1] / step) * step);
  rgbValues[2] = Math.min(255, (rgbValues[2] / step) * step);
  return utils.rgb2hex(rgbValues);
};
CanvasTinter.cacheStepsPerColorChannel = 8;
CanvasTinter.convertTintToImage = false;
CanvasTinter.canUseMultiply = utils.canUseNewCanvasBlendModes();
CanvasTinter.tintMethod = CanvasTinter.canUseMultiply ? CanvasTinter.tintWithMultiply : CanvasTinter.tintWithPerPixel;
