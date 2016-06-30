/* */ 
var core = require('../core/index'),
    tempPoint = new core.Point(),
    CanvasTinter = require('../core/renderers/canvas/utils/CanvasTinter');
function TilingSprite(texture, width, height) {
  core.Sprite.call(this, texture);
  this.tileScale = new core.Point(1, 1);
  this.tilePosition = new core.Point(0, 0);
  this._width = width || 100;
  this._height = height || 100;
  this._uvs = new core.TextureUvs();
  this._canvasPattern = null;
  this.shader = new core.AbstractFilter(['precision lowp float;', 'attribute vec2 aVertexPosition;', 'attribute vec2 aTextureCoord;', 'attribute vec4 aColor;', 'uniform mat3 projectionMatrix;', 'uniform vec4 uFrame;', 'uniform vec4 uTransform;', 'varying vec2 vTextureCoord;', 'varying vec4 vColor;', 'void main(void){', '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);', '   vec2 coord = aTextureCoord;', '   coord -= uTransform.xy;', '   coord /= uTransform.zw;', '   vTextureCoord = coord;', '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);', '}'].join('\n'), ['precision lowp float;', 'varying vec2 vTextureCoord;', 'varying vec4 vColor;', 'uniform sampler2D uSampler;', 'uniform vec4 uFrame;', 'uniform vec2 uPixelSize;', 'void main(void){', '   vec2 coord = mod(vTextureCoord, uFrame.zw);', '   coord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);', '   coord += uFrame.xy;', '   gl_FragColor =  texture2D(uSampler, coord) * vColor ;', '}'].join('\n'), {
    uFrame: {
      type: '4fv',
      value: [0, 0, 1, 1]
    },
    uTransform: {
      type: '4fv',
      value: [0, 0, 1, 1]
    },
    uPixelSize: {
      type: '2fv',
      value: [1, 1]
    }
  });
}
TilingSprite.prototype = Object.create(core.Sprite.prototype);
TilingSprite.prototype.constructor = TilingSprite;
module.exports = TilingSprite;
Object.defineProperties(TilingSprite.prototype, {
  width: {
    get: function() {
      return this._width;
    },
    set: function(value) {
      this._width = value;
    }
  },
  height: {
    get: function() {
      return this._height;
    },
    set: function(value) {
      this._height = value;
    }
  }
});
TilingSprite.prototype._onTextureUpdate = function() {
  return;
};
TilingSprite.prototype._renderWebGL = function(renderer) {
  var texture = this._texture;
  if (!texture || !texture._uvs) {
    return;
  }
  var tempUvs = texture._uvs,
      tempWidth = texture._frame.width,
      tempHeight = texture._frame.height,
      tw = texture.baseTexture.width,
      th = texture.baseTexture.height;
  texture._uvs = this._uvs;
  texture._frame.width = this.width;
  texture._frame.height = this.height;
  this.shader.uniforms.uPixelSize.value[0] = 1.0 / tw;
  this.shader.uniforms.uPixelSize.value[1] = 1.0 / th;
  this.shader.uniforms.uFrame.value[0] = tempUvs.x0;
  this.shader.uniforms.uFrame.value[1] = tempUvs.y0;
  this.shader.uniforms.uFrame.value[2] = tempUvs.x1 - tempUvs.x0;
  this.shader.uniforms.uFrame.value[3] = tempUvs.y2 - tempUvs.y0;
  this.shader.uniforms.uTransform.value[0] = (this.tilePosition.x % (tempWidth * this.tileScale.x)) / this._width;
  this.shader.uniforms.uTransform.value[1] = (this.tilePosition.y % (tempHeight * this.tileScale.y)) / this._height;
  this.shader.uniforms.uTransform.value[2] = (tw / this._width) * this.tileScale.x;
  this.shader.uniforms.uTransform.value[3] = (th / this._height) * this.tileScale.y;
  renderer.setObjectRenderer(renderer.plugins.sprite);
  renderer.plugins.sprite.render(this);
  texture._uvs = tempUvs;
  texture._frame.width = tempWidth;
  texture._frame.height = tempHeight;
};
TilingSprite.prototype._renderCanvas = function(renderer) {
  var texture = this._texture;
  if (!texture.baseTexture.hasLoaded) {
    return;
  }
  var context = renderer.context,
      transform = this.worldTransform,
      resolution = renderer.resolution,
      baseTexture = texture.baseTexture,
      modX = (this.tilePosition.x / this.tileScale.x) % texture._frame.width,
      modY = (this.tilePosition.y / this.tileScale.y) % texture._frame.height;
  if (!this._canvasPattern) {
    var tempCanvas = new core.CanvasBuffer(texture._frame.width * resolution, texture._frame.height * resolution);
    if (this.tint !== 0xFFFFFF) {
      if (this.cachedTint !== this.tint) {
        this.cachedTint = this.tint;
        this.tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
      }
      tempCanvas.context.drawImage(this.tintedTexture, 0, 0);
    } else {
      tempCanvas.context.drawImage(baseTexture.source, -texture._frame.x * resolution, -texture._frame.y * resolution);
    }
    this._canvasPattern = tempCanvas.context.createPattern(tempCanvas.canvas, 'repeat');
  }
  context.globalAlpha = this.worldAlpha;
  context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution);
  context.scale(this.tileScale.x / resolution, this.tileScale.y / resolution);
  context.translate(modX + (this.anchor.x * -this._width), modY + (this.anchor.y * -this._height));
  var compositeOperation = renderer.blendModes[this.blendMode];
  if (compositeOperation !== renderer.context.globalCompositeOperation) {
    context.globalCompositeOperation = compositeOperation;
  }
  context.fillStyle = this._canvasPattern;
  context.fillRect(-modX, -modY, this._width * resolution / this.tileScale.x, this._height * resolution / this.tileScale.y);
};
TilingSprite.prototype.getBounds = function() {
  var width = this._width;
  var height = this._height;
  var w0 = width * (1 - this.anchor.x);
  var w1 = width * -this.anchor.x;
  var h0 = height * (1 - this.anchor.y);
  var h1 = height * -this.anchor.y;
  var worldTransform = this.worldTransform;
  var a = worldTransform.a;
  var b = worldTransform.b;
  var c = worldTransform.c;
  var d = worldTransform.d;
  var tx = worldTransform.tx;
  var ty = worldTransform.ty;
  var x1 = a * w1 + c * h1 + tx;
  var y1 = d * h1 + b * w1 + ty;
  var x2 = a * w0 + c * h1 + tx;
  var y2 = d * h1 + b * w0 + ty;
  var x3 = a * w0 + c * h0 + tx;
  var y3 = d * h0 + b * w0 + ty;
  var x4 = a * w1 + c * h0 + tx;
  var y4 = d * h0 + b * w1 + ty;
  var minX,
      maxX,
      minY,
      maxY;
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
  var bounds = this._bounds;
  bounds.x = minX;
  bounds.width = maxX - minX;
  bounds.y = minY;
  bounds.height = maxY - minY;
  this._currentBounds = bounds;
  return bounds;
};
TilingSprite.prototype.containsPoint = function(point) {
  this.worldTransform.applyInverse(point, tempPoint);
  var width = this._width;
  var height = this._height;
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
TilingSprite.prototype.destroy = function() {
  core.Sprite.prototype.destroy.call(this);
  this.tileScale = null;
  this._tileScaleOffset = null;
  this.tilePosition = null;
  this._uvs = null;
};
TilingSprite.fromFrame = function(frameId, width, height) {
  var texture = core.utils.TextureCache[frameId];
  if (!texture) {
    throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ' + this);
  }
  return new TilingSprite(texture, width, height);
};
TilingSprite.fromImage = function(imageId, width, height, crossorigin, scaleMode) {
  return new TilingSprite(core.Texture.fromImage(imageId, crossorigin, scaleMode), width, height);
};
