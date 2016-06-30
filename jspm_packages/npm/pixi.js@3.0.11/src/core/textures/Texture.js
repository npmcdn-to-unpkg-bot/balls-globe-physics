/* */ 
var BaseTexture = require('./BaseTexture'),
    VideoBaseTexture = require('./VideoBaseTexture'),
    TextureUvs = require('./TextureUvs'),
    EventEmitter = require('eventemitter3'),
    math = require('../math/index'),
    utils = require('../utils/index');
function Texture(baseTexture, frame, crop, trim, rotate) {
  EventEmitter.call(this);
  this.noFrame = false;
  if (!frame) {
    this.noFrame = true;
    frame = new math.Rectangle(0, 0, 1, 1);
  }
  if (baseTexture instanceof Texture) {
    baseTexture = baseTexture.baseTexture;
  }
  this.baseTexture = baseTexture;
  this._frame = frame;
  this.trim = trim;
  this.valid = false;
  this.requiresUpdate = false;
  this._uvs = null;
  this.width = 0;
  this.height = 0;
  this.crop = crop || frame;
  this._rotate = +(rotate || 0);
  if (rotate === true) {
    this._rotate = 2;
  } else {
    if (this._rotate % 2 !== 0) {
      throw 'attempt to use diamond-shaped UVs. If you are sure, set rotation manually';
    }
  }
  if (baseTexture.hasLoaded) {
    if (this.noFrame) {
      frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);
      baseTexture.on('update', this.onBaseTextureUpdated, this);
    }
    this.frame = frame;
  } else {
    baseTexture.once('loaded', this.onBaseTextureLoaded, this);
  }
}
Texture.prototype = Object.create(EventEmitter.prototype);
Texture.prototype.constructor = Texture;
module.exports = Texture;
Object.defineProperties(Texture.prototype, {
  frame: {
    get: function() {
      return this._frame;
    },
    set: function(frame) {
      this._frame = frame;
      this.noFrame = false;
      this.width = frame.width;
      this.height = frame.height;
      if (!this.trim && !this.rotate && (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height)) {
        throw new Error('Texture Error: frame does not fit inside the base Texture dimensions ' + this);
      }
      this.valid = frame && frame.width && frame.height && this.baseTexture.hasLoaded;
      if (this.trim) {
        this.width = this.trim.width;
        this.height = this.trim.height;
        this._frame.width = this.trim.width;
        this._frame.height = this.trim.height;
      } else {
        this.crop = frame;
      }
      if (this.valid) {
        this._updateUvs();
      }
    }
  },
  rotate: {
    get: function() {
      return this._rotate;
    },
    set: function(rotate) {
      this._rotate = rotate;
      if (this.valid) {
        this._updateUvs();
      }
    }
  }
});
Texture.prototype.update = function() {
  this.baseTexture.update();
};
Texture.prototype.onBaseTextureLoaded = function(baseTexture) {
  if (this.noFrame) {
    this.frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);
  } else {
    this.frame = this._frame;
  }
  this.emit('update', this);
};
Texture.prototype.onBaseTextureUpdated = function(baseTexture) {
  this._frame.width = baseTexture.width;
  this._frame.height = baseTexture.height;
  this.emit('update', this);
};
Texture.prototype.destroy = function(destroyBase) {
  if (this.baseTexture) {
    if (destroyBase) {
      this.baseTexture.destroy();
    }
    this.baseTexture.off('update', this.onBaseTextureUpdated, this);
    this.baseTexture.off('loaded', this.onBaseTextureLoaded, this);
    this.baseTexture = null;
  }
  this._frame = null;
  this._uvs = null;
  this.trim = null;
  this.crop = null;
  this.valid = false;
  this.off('dispose', this.dispose, this);
  this.off('update', this.update, this);
};
Texture.prototype.clone = function() {
  return new Texture(this.baseTexture, this.frame, this.crop, this.trim, this.rotate);
};
Texture.prototype._updateUvs = function() {
  if (!this._uvs) {
    this._uvs = new TextureUvs();
  }
  this._uvs.set(this.crop, this.baseTexture, this.rotate);
};
Texture.fromImage = function(imageUrl, crossorigin, scaleMode) {
  var texture = utils.TextureCache[imageUrl];
  if (!texture) {
    texture = new Texture(BaseTexture.fromImage(imageUrl, crossorigin, scaleMode));
    utils.TextureCache[imageUrl] = texture;
  }
  return texture;
};
Texture.fromFrame = function(frameId) {
  var texture = utils.TextureCache[frameId];
  if (!texture) {
    throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
  }
  return texture;
};
Texture.fromCanvas = function(canvas, scaleMode) {
  return new Texture(BaseTexture.fromCanvas(canvas, scaleMode));
};
Texture.fromVideo = function(video, scaleMode) {
  if (typeof video === 'string') {
    return Texture.fromVideoUrl(video, scaleMode);
  } else {
    return new Texture(VideoBaseTexture.fromVideo(video, scaleMode));
  }
};
Texture.fromVideoUrl = function(videoUrl, scaleMode) {
  return new Texture(VideoBaseTexture.fromUrl(videoUrl, scaleMode));
};
Texture.addTextureToCache = function(texture, id) {
  utils.TextureCache[id] = texture;
};
Texture.removeTextureFromCache = function(id) {
  var texture = utils.TextureCache[id];
  delete utils.TextureCache[id];
  delete utils.BaseTextureCache[id];
  return texture;
};
Texture.EMPTY = new Texture(new BaseTexture());
