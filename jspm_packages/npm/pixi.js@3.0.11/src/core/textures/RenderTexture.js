/* */ 
var BaseTexture = require('./BaseTexture'),
    Texture = require('./Texture'),
    RenderTarget = require('../renderers/webgl/utils/RenderTarget'),
    FilterManager = require('../renderers/webgl/managers/FilterManager'),
    CanvasBuffer = require('../renderers/canvas/utils/CanvasBuffer'),
    math = require('../math/index'),
    CONST = require('../const'),
    tempMatrix = new math.Matrix();
function RenderTexture(renderer, width, height, scaleMode, resolution) {
  if (!renderer) {
    throw new Error('Unable to create RenderTexture, you must pass a renderer into the constructor.');
  }
  width = width || 100;
  height = height || 100;
  resolution = resolution || CONST.RESOLUTION;
  var baseTexture = new BaseTexture();
  baseTexture.width = width;
  baseTexture.height = height;
  baseTexture.resolution = resolution;
  baseTexture.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
  baseTexture.hasLoaded = true;
  Texture.call(this, baseTexture, new math.Rectangle(0, 0, width, height));
  this.width = width;
  this.height = height;
  this.resolution = resolution;
  this.render = null;
  this.renderer = renderer;
  if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
    var gl = this.renderer.gl;
    this.textureBuffer = new RenderTarget(gl, this.width, this.height, baseTexture.scaleMode, this.resolution);
    this.baseTexture._glTextures[gl.id] = this.textureBuffer.texture;
    this.filterManager = new FilterManager(this.renderer);
    this.filterManager.onContextChange();
    this.filterManager.resize(width, height);
    this.render = this.renderWebGL;
    this.renderer.currentRenderer.start();
    this.renderer.currentRenderTarget.activate();
  } else {
    this.render = this.renderCanvas;
    this.textureBuffer = new CanvasBuffer(this.width * this.resolution, this.height * this.resolution);
    this.baseTexture.source = this.textureBuffer.canvas;
  }
  this.valid = true;
  this._updateUvs();
}
RenderTexture.prototype = Object.create(Texture.prototype);
RenderTexture.prototype.constructor = RenderTexture;
module.exports = RenderTexture;
RenderTexture.prototype.resize = function(width, height, updateBase) {
  if (width === this.width && height === this.height) {
    return;
  }
  this.valid = (width > 0 && height > 0);
  this.width = this._frame.width = this.crop.width = width;
  this.height = this._frame.height = this.crop.height = height;
  if (updateBase) {
    this.baseTexture.width = this.width;
    this.baseTexture.height = this.height;
  }
  if (!this.valid) {
    return;
  }
  this.textureBuffer.resize(this.width, this.height);
  if (this.filterManager) {
    this.filterManager.resize(this.width, this.height);
  }
};
RenderTexture.prototype.clear = function() {
  if (!this.valid) {
    return;
  }
  if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
    this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
  }
  this.textureBuffer.clear();
};
RenderTexture.prototype.renderWebGL = function(displayObject, matrix, clear, updateTransform) {
  if (!this.valid) {
    return;
  }
  updateTransform = (updateTransform !== undefined) ? updateTransform : true;
  this.textureBuffer.transform = matrix;
  this.textureBuffer.activate();
  displayObject.worldAlpha = 1;
  if (updateTransform) {
    displayObject.worldTransform.identity();
    displayObject.currentBounds = null;
    var children = displayObject.children;
    var i,
        j;
    for (i = 0, j = children.length; i < j; ++i) {
      children[i].updateTransform();
    }
  }
  var temp = this.renderer.filterManager;
  this.renderer.filterManager = this.filterManager;
  this.renderer.renderDisplayObject(displayObject, this.textureBuffer, clear);
  this.renderer.filterManager = temp;
};
RenderTexture.prototype.renderCanvas = function(displayObject, matrix, clear, updateTransform) {
  if (!this.valid) {
    return;
  }
  updateTransform = !!updateTransform;
  var wt = tempMatrix;
  wt.identity();
  if (matrix) {
    wt.append(matrix);
  }
  var cachedWt = displayObject.worldTransform;
  displayObject.worldTransform = wt;
  displayObject.worldAlpha = 1;
  var children = displayObject.children;
  var i,
      j;
  for (i = 0, j = children.length; i < j; ++i) {
    children[i].updateTransform();
  }
  if (clear) {
    this.textureBuffer.clear();
  }
  var context = this.textureBuffer.context;
  var realResolution = this.renderer.resolution;
  this.renderer.resolution = this.resolution;
  this.renderer.renderDisplayObject(displayObject, context);
  this.renderer.resolution = realResolution;
  if (displayObject.worldTransform === wt) {
    displayObject.worldTransform = cachedWt;
  }
};
RenderTexture.prototype.destroy = function() {
  Texture.prototype.destroy.call(this, true);
  this.textureBuffer.destroy();
  if (this.filterManager) {
    this.filterManager.destroy();
  }
  this.renderer = null;
};
RenderTexture.prototype.getImage = function() {
  var image = new Image();
  image.src = this.getBase64();
  return image;
};
RenderTexture.prototype.getBase64 = function() {
  return this.getCanvas().toDataURL();
};
RenderTexture.prototype.getCanvas = function() {
  if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
    var gl = this.renderer.gl;
    var width = this.textureBuffer.size.width;
    var height = this.textureBuffer.size.height;
    var webGLPixels = new Uint8Array(4 * width * height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    var tempCanvas = new CanvasBuffer(width, height);
    var canvasData = tempCanvas.context.getImageData(0, 0, width, height);
    canvasData.data.set(webGLPixels);
    tempCanvas.context.putImageData(canvasData, 0, 0);
    return tempCanvas.canvas;
  } else {
    return this.textureBuffer.canvas;
  }
};
RenderTexture.prototype.getPixels = function() {
  var width,
      height;
  if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
    var gl = this.renderer.gl;
    width = this.textureBuffer.size.width;
    height = this.textureBuffer.size.height;
    var webGLPixels = new Uint8Array(4 * width * height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return webGLPixels;
  } else {
    width = this.textureBuffer.canvas.width;
    height = this.textureBuffer.canvas.height;
    return this.textureBuffer.canvas.getContext('2d').getImageData(0, 0, width, height).data;
  }
};
RenderTexture.prototype.getPixel = function(x, y) {
  if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
    var gl = this.renderer.gl;
    var webGLPixels = new Uint8Array(4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return webGLPixels;
  } else {
    return this.textureBuffer.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
  }
};
