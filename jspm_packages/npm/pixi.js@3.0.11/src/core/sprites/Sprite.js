/* */ 
var math = require('../math/index'),
    Texture = require('../textures/Texture'),
    Container = require('../display/Container'),
    CanvasTinter = require('../renderers/canvas/utils/CanvasTinter'),
    utils = require('../utils/index'),
    CONST = require('../const'),
    tempPoint = new math.Point(),
    GroupD8 = math.GroupD8,
    canvasRenderWorldTransform = new math.Matrix();
function Sprite(texture) {
  Container.call(this);
  this.anchor = new math.Point();
  this._texture = null;
  this._width = 0;
  this._height = 0;
  this.tint = 0xFFFFFF;
  this.blendMode = CONST.BLEND_MODES.NORMAL;
  this.shader = null;
  this.cachedTint = 0xFFFFFF;
  this.texture = texture || Texture.EMPTY;
}
Sprite.prototype = Object.create(Container.prototype);
Sprite.prototype.constructor = Sprite;
module.exports = Sprite;
Object.defineProperties(Sprite.prototype, {
  width: {
    get: function() {
      return Math.abs(this.scale.x) * this.texture._frame.width;
    },
    set: function(value) {
      var sign = utils.sign(this.scale.x) || 1;
      this.scale.x = sign * value / this.texture._frame.width;
      this._width = value;
    }
  },
  height: {
    get: function() {
      return Math.abs(this.scale.y) * this.texture._frame.height;
    },
    set: function(value) {
      var sign = utils.sign(this.scale.y) || 1;
      this.scale.y = sign * value / this.texture._frame.height;
      this._height = value;
    }
  },
  texture: {
    get: function() {
      return this._texture;
    },
    set: function(value) {
      if (this._texture === value) {
        return;
      }
      this._texture = value;
      this.cachedTint = 0xFFFFFF;
      if (value) {
        if (value.baseTexture.hasLoaded) {
          this._onTextureUpdate();
        } else {
          value.once('update', this._onTextureUpdate, this);
        }
      }
    }
  }
});
Sprite.prototype._onTextureUpdate = function() {
  if (this._width) {
    this.scale.x = utils.sign(this.scale.x) * this._width / this.texture.frame.width;
  }
  if (this._height) {
    this.scale.y = utils.sign(this.scale.y) * this._height / this.texture.frame.height;
  }
};
Sprite.prototype._renderWebGL = function(renderer) {
  renderer.setObjectRenderer(renderer.plugins.sprite);
  renderer.plugins.sprite.render(this);
};
Sprite.prototype.getBounds = function(matrix) {
  if (!this._currentBounds) {
    var width = this._texture._frame.width;
    var height = this._texture._frame.height;
    var w0 = width * (1 - this.anchor.x);
    var w1 = width * -this.anchor.x;
    var h0 = height * (1 - this.anchor.y);
    var h1 = height * -this.anchor.y;
    var worldTransform = matrix || this.worldTransform;
    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;
    var minX,
        maxX,
        minY,
        maxY;
    var x1 = a * w1 + c * h1 + tx;
    var y1 = d * h1 + b * w1 + ty;
    var x2 = a * w0 + c * h1 + tx;
    var y2 = d * h1 + b * w0 + ty;
    var x3 = a * w0 + c * h0 + tx;
    var y3 = d * h0 + b * w0 + ty;
    var x4 = a * w1 + c * h0 + tx;
    var y4 = d * h0 + b * w1 + ty;
    minX = x1;
    minX = x2 < minX ? x2 : minX;
    minX = x3 < minX ? x3 : minX;
    minX = x4 < minX ? x4 : minX;
    minY = y1;
    minY = y2 < minY ? y2 : minY;
    minY = y3 < minY ? y3 : minY;
    minY = y4 < minY ? y4 : minY;
    maxX = x1;
    maxX = x2 > maxX ? x2 : maxX;
    maxX = x3 > maxX ? x3 : maxX;
    maxX = x4 > maxX ? x4 : maxX;
    maxY = y1;
    maxY = y2 > maxY ? y2 : maxY;
    maxY = y3 > maxY ? y3 : maxY;
    maxY = y4 > maxY ? y4 : maxY;
    if (this.children.length) {
      var childBounds = this.containerGetBounds();
      w0 = childBounds.x;
      w1 = childBounds.x + childBounds.width;
      h0 = childBounds.y;
      h1 = childBounds.y + childBounds.height;
      minX = (minX < w0) ? minX : w0;
      minY = (minY < h0) ? minY : h0;
      maxX = (maxX > w1) ? maxX : w1;
      maxY = (maxY > h1) ? maxY : h1;
    }
    var bounds = this._bounds;
    bounds.x = minX;
    bounds.width = maxX - minX;
    bounds.y = minY;
    bounds.height = maxY - minY;
    this._currentBounds = bounds;
  }
  return this._currentBounds;
};
Sprite.prototype.getLocalBounds = function() {
  this._bounds.x = -this._texture._frame.width * this.anchor.x;
  this._bounds.y = -this._texture._frame.height * this.anchor.y;
  this._bounds.width = this._texture._frame.width;
  this._bounds.height = this._texture._frame.height;
  return this._bounds;
};
Sprite.prototype.containsPoint = function(point) {
  this.worldTransform.applyInverse(point, tempPoint);
  var width = this._texture._frame.width;
  var height = this._texture._frame.height;
  var x1 = -width * this.anchor.x;
  var y1;
  if (tempPoint.x > x1 && tempPoint.x < x1 + width) {
    y1 = -height * this.anchor.y;
    if (tempPoint.y > y1 && tempPoint.y < y1 + height) {
      return true;
    }
  }
  return false;
};
Sprite.prototype._renderCanvas = function(renderer) {
  if (this.texture.crop.width <= 0 || this.texture.crop.height <= 0) {
    return;
  }
  var compositeOperation = renderer.blendModes[this.blendMode];
  if (compositeOperation !== renderer.context.globalCompositeOperation) {
    renderer.context.globalCompositeOperation = compositeOperation;
  }
  if (this.texture.valid) {
    var texture = this._texture,
        wt = this.worldTransform,
        dx,
        dy,
        width = texture.crop.width,
        height = texture.crop.height;
    renderer.context.globalAlpha = this.worldAlpha;
    var smoothingEnabled = texture.baseTexture.scaleMode === CONST.SCALE_MODES.LINEAR;
    if (renderer.smoothProperty && renderer.context[renderer.smoothProperty] !== smoothingEnabled) {
      renderer.context[renderer.smoothProperty] = smoothingEnabled;
    }
    if ((texture.rotate & 3) === 2) {
      width = texture.crop.height;
      height = texture.crop.width;
    }
    if (texture.trim) {
      dx = texture.crop.width / 2 + texture.trim.x - this.anchor.x * texture.trim.width;
      dy = texture.crop.height / 2 + texture.trim.y - this.anchor.y * texture.trim.height;
    } else {
      dx = (0.5 - this.anchor.x) * texture._frame.width;
      dy = (0.5 - this.anchor.y) * texture._frame.height;
    }
    if (texture.rotate) {
      wt.copy(canvasRenderWorldTransform);
      wt = canvasRenderWorldTransform;
      GroupD8.matrixAppendRotationInv(wt, texture.rotate, dx, dy);
      dx = 0;
      dy = 0;
    }
    dx -= width / 2;
    dy -= height / 2;
    if (renderer.roundPixels) {
      renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, (wt.tx * renderer.resolution) | 0, (wt.ty * renderer.resolution) | 0);
      dx = dx | 0;
      dy = dy | 0;
    } else {
      renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderer.resolution, wt.ty * renderer.resolution);
    }
    var resolution = texture.baseTexture.resolution;
    if (this.tint !== 0xFFFFFF) {
      if (this.cachedTint !== this.tint) {
        this.cachedTint = this.tint;
        this.tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
      }
      renderer.context.drawImage(this.tintedTexture, 0, 0, width * resolution, height * resolution, dx * renderer.resolution, dy * renderer.resolution, width * renderer.resolution, height * renderer.resolution);
    } else {
      renderer.context.drawImage(texture.baseTexture.source, texture.crop.x * resolution, texture.crop.y * resolution, width * resolution, height * resolution, dx * renderer.resolution, dy * renderer.resolution, width * renderer.resolution, height * renderer.resolution);
    }
  }
};
Sprite.prototype.destroy = function(destroyTexture, destroyBaseTexture) {
  Container.prototype.destroy.call(this);
  this.anchor = null;
  if (destroyTexture) {
    this._texture.destroy(destroyBaseTexture);
  }
  this._texture = null;
  this.shader = null;
};
Sprite.fromFrame = function(frameId) {
  var texture = utils.TextureCache[frameId];
  if (!texture) {
    throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
  }
  return new Sprite(texture);
};
Sprite.fromImage = function(imageId, crossorigin, scaleMode) {
  return new Sprite(Texture.fromImage(imageId, crossorigin, scaleMode));
};
