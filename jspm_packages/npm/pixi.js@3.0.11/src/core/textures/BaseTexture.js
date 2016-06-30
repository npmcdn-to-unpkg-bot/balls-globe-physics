/* */ 
var utils = require('../utils/index'),
    CONST = require('../const'),
    EventEmitter = require('eventemitter3');
function BaseTexture(source, scaleMode, resolution) {
  EventEmitter.call(this);
  this.uid = utils.uid();
  this.resolution = resolution || 1;
  this.width = 100;
  this.height = 100;
  this.realWidth = 100;
  this.realHeight = 100;
  this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
  this.hasLoaded = false;
  this.isLoading = false;
  this.source = null;
  this.premultipliedAlpha = true;
  this.imageUrl = null;
  this.isPowerOfTwo = false;
  this.mipmap = false;
  this._glTextures = {};
  if (source) {
    this.loadSource(source);
  }
}
BaseTexture.prototype = Object.create(EventEmitter.prototype);
BaseTexture.prototype.constructor = BaseTexture;
module.exports = BaseTexture;
BaseTexture.prototype.update = function() {
  this.realWidth = this.source.naturalWidth || this.source.width;
  this.realHeight = this.source.naturalHeight || this.source.height;
  this.width = this.realWidth / this.resolution;
  this.height = this.realHeight / this.resolution;
  this.isPowerOfTwo = utils.isPowerOfTwo(this.realWidth, this.realHeight);
  this.emit('update', this);
};
BaseTexture.prototype.loadSource = function(source) {
  var wasLoading = this.isLoading;
  this.hasLoaded = false;
  this.isLoading = false;
  if (wasLoading && this.source) {
    this.source.onload = null;
    this.source.onerror = null;
  }
  this.source = source;
  if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height) {
    this._sourceLoaded();
  } else if (!source.getContext) {
    this.isLoading = true;
    var scope = this;
    source.onload = function() {
      source.onload = null;
      source.onerror = null;
      if (!scope.isLoading) {
        return;
      }
      scope.isLoading = false;
      scope._sourceLoaded();
      scope.emit('loaded', scope);
    };
    source.onerror = function() {
      source.onload = null;
      source.onerror = null;
      if (!scope.isLoading) {
        return;
      }
      scope.isLoading = false;
      scope.emit('error', scope);
    };
    if (source.complete && source.src) {
      this.isLoading = false;
      source.onload = null;
      source.onerror = null;
      if (source.width && source.height) {
        this._sourceLoaded();
        if (wasLoading) {
          this.emit('loaded', this);
        }
      } else {
        if (wasLoading) {
          this.emit('error', this);
        }
      }
    }
  }
};
BaseTexture.prototype._sourceLoaded = function() {
  this.hasLoaded = true;
  this.update();
};
BaseTexture.prototype.destroy = function() {
  if (this.imageUrl) {
    delete utils.BaseTextureCache[this.imageUrl];
    delete utils.TextureCache[this.imageUrl];
    this.imageUrl = null;
    if (!navigator.isCocoonJS) {
      this.source.src = '';
    }
  } else if (this.source && this.source._pixiId) {
    delete utils.BaseTextureCache[this.source._pixiId];
  }
  this.source = null;
  this.dispose();
};
BaseTexture.prototype.dispose = function() {
  this.emit('dispose', this);
};
BaseTexture.prototype.updateSourceImage = function(newSrc) {
  this.source.src = newSrc;
  this.loadSource(this.source);
};
BaseTexture.fromImage = function(imageUrl, crossorigin, scaleMode) {
  var baseTexture = utils.BaseTextureCache[imageUrl];
  if (crossorigin === undefined && imageUrl.indexOf('data:') !== 0) {
    crossorigin = true;
  }
  if (!baseTexture) {
    var image = new Image();
    if (crossorigin) {
      image.crossOrigin = '';
    }
    baseTexture = new BaseTexture(image, scaleMode);
    baseTexture.imageUrl = imageUrl;
    image.src = imageUrl;
    utils.BaseTextureCache[imageUrl] = baseTexture;
    baseTexture.resolution = utils.getResolutionOfUrl(imageUrl);
  }
  return baseTexture;
};
BaseTexture.fromCanvas = function(canvas, scaleMode) {
  if (!canvas._pixiId) {
    canvas._pixiId = 'canvas_' + utils.uid();
  }
  var baseTexture = utils.BaseTextureCache[canvas._pixiId];
  if (!baseTexture) {
    baseTexture = new BaseTexture(canvas, scaleMode);
    utils.BaseTextureCache[canvas._pixiId] = baseTexture;
  }
  return baseTexture;
};
