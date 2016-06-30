/* */ 
var Sprite = require('../sprites/Sprite'),
    Texture = require('../textures/Texture'),
    math = require('../math/index'),
    utils = require('../utils/index'),
    CONST = require('../const');
function Text(text, style, resolution) {
  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext('2d');
  this.resolution = resolution || CONST.RESOLUTION;
  this._text = null;
  this._style = null;
  var texture = Texture.fromCanvas(this.canvas);
  texture.trim = new math.Rectangle();
  Sprite.call(this, texture);
  this.text = text;
  this.style = style;
}
Text.prototype = Object.create(Sprite.prototype);
Text.prototype.constructor = Text;
module.exports = Text;
Text.fontPropertiesCache = {};
Text.fontPropertiesCanvas = document.createElement('canvas');
Text.fontPropertiesContext = Text.fontPropertiesCanvas.getContext('2d');
Object.defineProperties(Text.prototype, {
  width: {
    get: function() {
      if (this.dirty) {
        this.updateText();
      }
      return this.scale.x * this._texture._frame.width;
    },
    set: function(value) {
      this.scale.x = value / this._texture._frame.width;
      this._width = value;
    }
  },
  height: {
    get: function() {
      if (this.dirty) {
        this.updateText();
      }
      return this.scale.y * this._texture._frame.height;
    },
    set: function(value) {
      this.scale.y = value / this._texture._frame.height;
      this._height = value;
    }
  },
  style: {
    get: function() {
      return this._style;
    },
    set: function(style) {
      style = style || {};
      if (typeof style.fill === 'number') {
        style.fill = utils.hex2string(style.fill);
      }
      if (typeof style.stroke === 'number') {
        style.stroke = utils.hex2string(style.stroke);
      }
      if (typeof style.dropShadowColor === 'number') {
        style.dropShadowColor = utils.hex2string(style.dropShadowColor);
      }
      style.font = style.font || 'bold 20pt Arial';
      style.fill = style.fill || 'black';
      style.align = style.align || 'left';
      style.stroke = style.stroke || 'black';
      style.strokeThickness = style.strokeThickness || 0;
      style.wordWrap = style.wordWrap || false;
      style.wordWrapWidth = style.wordWrapWidth || 100;
      style.breakWords = style.breakWords || false;
      style.letterSpacing = style.letterSpacing || 0;
      style.dropShadow = style.dropShadow || false;
      style.dropShadowColor = style.dropShadowColor || '#000000';
      style.dropShadowAngle = style.dropShadowAngle !== undefined ? style.dropShadowAngle : Math.PI / 6;
      style.dropShadowDistance = style.dropShadowDistance !== undefined ? style.dropShadowDistance : 5;
      style.dropShadowBlur = style.dropShadowBlur !== undefined ? style.dropShadowBlur : 0;
      style.padding = style.padding || 0;
      style.textBaseline = style.textBaseline || 'alphabetic';
      style.lineJoin = style.lineJoin || 'miter';
      style.miterLimit = style.miterLimit || 10;
      this._style = style;
      this.dirty = true;
    }
  },
  text: {
    get: function() {
      return this._text;
    },
    set: function(text) {
      text = text.toString() || ' ';
      if (this._text === text) {
        return;
      }
      this._text = text;
      this.dirty = true;
    }
  }
});
Text.prototype.updateText = function() {
  var style = this._style;
  this.context.font = style.font;
  var outputText = style.wordWrap ? this.wordWrap(this._text) : this._text;
  var lines = outputText.split(/(?:\r\n|\r|\n)/);
  var lineWidths = new Array(lines.length);
  var maxLineWidth = 0;
  var fontProperties = this.determineFontProperties(style.font);
  for (var i = 0; i < lines.length; i++) {
    var lineWidth = this.context.measureText(lines[i]).width + ((lines[i].length - 1) * style.letterSpacing);
    lineWidths[i] = lineWidth;
    maxLineWidth = Math.max(maxLineWidth, lineWidth);
  }
  var width = maxLineWidth + style.strokeThickness;
  if (style.dropShadow) {
    width += style.dropShadowDistance;
  }
  this.canvas.width = Math.ceil((width + this.context.lineWidth) * this.resolution);
  var lineHeight = this.style.lineHeight || fontProperties.fontSize + style.strokeThickness;
  var height = lineHeight * lines.length;
  if (style.dropShadow) {
    height += style.dropShadowDistance;
  }
  this.canvas.height = Math.ceil((height + this._style.padding * 2) * this.resolution);
  this.context.scale(this.resolution, this.resolution);
  if (navigator.isCocoonJS) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  this.context.font = style.font;
  this.context.strokeStyle = style.stroke;
  this.context.lineWidth = style.strokeThickness;
  this.context.textBaseline = style.textBaseline;
  this.context.lineJoin = style.lineJoin;
  this.context.miterLimit = style.miterLimit;
  var linePositionX;
  var linePositionY;
  if (style.dropShadow) {
    if (style.dropShadowBlur > 0) {
      this.context.shadowColor = style.dropShadowColor;
      this.context.shadowBlur = style.dropShadowBlur;
    } else {
      this.context.fillStyle = style.dropShadowColor;
    }
    var xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
    var yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;
    for (i = 0; i < lines.length; i++) {
      linePositionX = style.strokeThickness / 2;
      linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;
      if (style.align === 'right') {
        linePositionX += maxLineWidth - lineWidths[i];
      } else if (style.align === 'center') {
        linePositionX += (maxLineWidth - lineWidths[i]) / 2;
      }
      if (style.fill) {
        this.drawLetterSpacing(lines[i], linePositionX + xShadowOffset, linePositionY + yShadowOffset + style.padding);
      }
    }
  }
  this.context.fillStyle = style.fill;
  for (i = 0; i < lines.length; i++) {
    linePositionX = style.strokeThickness / 2;
    linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;
    if (style.align === 'right') {
      linePositionX += maxLineWidth - lineWidths[i];
    } else if (style.align === 'center') {
      linePositionX += (maxLineWidth - lineWidths[i]) / 2;
    }
    if (style.stroke && style.strokeThickness) {
      this.drawLetterSpacing(lines[i], linePositionX, linePositionY + style.padding, true);
    }
    if (style.fill) {
      this.drawLetterSpacing(lines[i], linePositionX, linePositionY + style.padding);
    }
  }
  this.updateTexture();
};
Text.prototype.drawLetterSpacing = function(text, x, y, isStroke) {
  var style = this._style;
  var letterSpacing = style.letterSpacing;
  if (letterSpacing === 0) {
    if (isStroke) {
      this.context.strokeText(text, x, y);
    } else {
      this.context.fillText(text, x, y);
    }
    return;
  }
  var characters = String.prototype.split.call(text, ''),
      index = 0,
      current,
      currentPosition = x;
  while (index < text.length) {
    current = characters[index++];
    if (isStroke) {
      this.context.strokeText(current, currentPosition, y);
    } else {
      this.context.fillText(current, currentPosition, y);
    }
    currentPosition += this.context.measureText(current).width + letterSpacing;
  }
};
Text.prototype.updateTexture = function() {
  var texture = this._texture;
  var style = this._style;
  texture.baseTexture.hasLoaded = true;
  texture.baseTexture.resolution = this.resolution;
  texture.baseTexture.width = this.canvas.width / this.resolution;
  texture.baseTexture.height = this.canvas.height / this.resolution;
  texture.crop.width = texture._frame.width = this.canvas.width / this.resolution;
  texture.crop.height = texture._frame.height = this.canvas.height / this.resolution;
  texture.trim.x = 0;
  texture.trim.y = -style.padding;
  texture.trim.width = texture._frame.width;
  texture.trim.height = texture._frame.height - style.padding * 2;
  this._width = this.canvas.width / this.resolution;
  this._height = this.canvas.height / this.resolution;
  texture.baseTexture.emit('update', texture.baseTexture);
  this.dirty = false;
};
Text.prototype.renderWebGL = function(renderer) {
  if (this.dirty) {
    this.updateText();
  }
  Sprite.prototype.renderWebGL.call(this, renderer);
};
Text.prototype._renderCanvas = function(renderer) {
  if (this.dirty) {
    this.updateText();
  }
  Sprite.prototype._renderCanvas.call(this, renderer);
};
Text.prototype.determineFontProperties = function(fontStyle) {
  var properties = Text.fontPropertiesCache[fontStyle];
  if (!properties) {
    properties = {};
    var canvas = Text.fontPropertiesCanvas;
    var context = Text.fontPropertiesContext;
    context.font = fontStyle;
    var width = Math.ceil(context.measureText('|MÉq').width);
    var baseline = Math.ceil(context.measureText('M').width);
    var height = 2 * baseline;
    baseline = baseline * 1.4 | 0;
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#f00';
    context.fillRect(0, 0, width, height);
    context.font = fontStyle;
    context.textBaseline = 'alphabetic';
    context.fillStyle = '#000';
    context.fillText('|MÉq', 0, baseline);
    var imagedata = context.getImageData(0, 0, width, height).data;
    var pixels = imagedata.length;
    var line = width * 4;
    var i,
        j;
    var idx = 0;
    var stop = false;
    for (i = 0; i < baseline; i++) {
      for (j = 0; j < line; j += 4) {
        if (imagedata[idx + j] !== 255) {
          stop = true;
          break;
        }
      }
      if (!stop) {
        idx += line;
      } else {
        break;
      }
    }
    properties.ascent = baseline - i;
    idx = pixels - line;
    stop = false;
    for (i = height; i > baseline; i--) {
      for (j = 0; j < line; j += 4) {
        if (imagedata[idx + j] !== 255) {
          stop = true;
          break;
        }
      }
      if (!stop) {
        idx -= line;
      } else {
        break;
      }
    }
    properties.descent = i - baseline;
    properties.fontSize = properties.ascent + properties.descent;
    Text.fontPropertiesCache[fontStyle] = properties;
  }
  return properties;
};
Text.prototype.wordWrap = function(text) {
  var result = '';
  var lines = text.split('\n');
  var wordWrapWidth = this._style.wordWrapWidth;
  for (var i = 0; i < lines.length; i++) {
    var spaceLeft = wordWrapWidth;
    var words = lines[i].split(' ');
    for (var j = 0; j < words.length; j++) {
      var wordWidth = this.context.measureText(words[j]).width;
      if (this._style.breakWords && wordWidth > wordWrapWidth) {
        var characters = words[j].split('');
        for (var c = 0; c < characters.length; c++) {
          var characterWidth = this.context.measureText(characters[c]).width;
          if (characterWidth > spaceLeft) {
            result += '\n' + characters[c];
            spaceLeft = wordWrapWidth - characterWidth;
          } else {
            if (c === 0) {
              result += ' ';
            }
            result += characters[c];
            spaceLeft -= characterWidth;
          }
        }
      } else {
        var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
        if (j === 0 || wordWidthWithSpace > spaceLeft) {
          if (j > 0) {
            result += '\n';
          }
          result += words[j];
          spaceLeft = wordWrapWidth - wordWidth;
        } else {
          spaceLeft -= wordWidthWithSpace;
          result += ' ' + words[j];
        }
      }
    }
    if (i < lines.length - 1) {
      result += '\n';
    }
  }
  return result;
};
Text.prototype.getBounds = function(matrix) {
  if (this.dirty) {
    this.updateText();
  }
  return Sprite.prototype.getBounds.call(this, matrix);
};
Text.prototype.destroy = function(destroyBaseTexture) {
  this.context = null;
  this.canvas = null;
  this._style = null;
  this._texture.destroy(destroyBaseTexture === undefined ? true : destroyBaseTexture);
};
