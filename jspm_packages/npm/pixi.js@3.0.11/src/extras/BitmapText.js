/* */ 
var core = require('../core/index');
function BitmapText(text, style) {
  core.Container.call(this);
  style = style || {};
  this.textWidth = 0;
  this.textHeight = 0;
  this._glyphs = [];
  this._font = {
    tint: style.tint !== undefined ? style.tint : 0xFFFFFF,
    align: style.align || 'left',
    name: null,
    size: 0
  };
  this.font = style.font;
  this._text = text;
  this.maxWidth = 0;
  this.maxLineHeight = 0;
  this.dirty = false;
  this.updateText();
}
BitmapText.prototype = Object.create(core.Container.prototype);
BitmapText.prototype.constructor = BitmapText;
module.exports = BitmapText;
Object.defineProperties(BitmapText.prototype, {
  tint: {
    get: function() {
      return this._font.tint;
    },
    set: function(value) {
      this._font.tint = (typeof value === 'number' && value >= 0) ? value : 0xFFFFFF;
      this.dirty = true;
    }
  },
  align: {
    get: function() {
      return this._font.align;
    },
    set: function(value) {
      this._font.align = value || 'left';
      this.dirty = true;
    }
  },
  font: {
    get: function() {
      return this._font;
    },
    set: function(value) {
      if (!value) {
        return;
      }
      if (typeof value === 'string') {
        value = value.split(' ');
        this._font.name = value.length === 1 ? value[0] : value.slice(1).join(' ');
        this._font.size = value.length >= 2 ? parseInt(value[0], 10) : BitmapText.fonts[this._font.name].size;
      } else {
        this._font.name = value.name;
        this._font.size = typeof value.size === 'number' ? value.size : parseInt(value.size, 10);
      }
      this.dirty = true;
    }
  },
  text: {
    get: function() {
      return this._text;
    },
    set: function(value) {
      value = value.toString() || ' ';
      if (this._text === value) {
        return;
      }
      this._text = value;
      this.dirty = true;
    }
  }
});
BitmapText.prototype.updateText = function() {
  var data = BitmapText.fonts[this._font.name];
  var pos = new core.Point();
  var prevCharCode = null;
  var chars = [];
  var lastLineWidth = 0;
  var maxLineWidth = 0;
  var lineWidths = [];
  var line = 0;
  var scale = this._font.size / data.size;
  var lastSpace = -1;
  var maxLineHeight = 0;
  for (var i = 0; i < this.text.length; i++) {
    var charCode = this.text.charCodeAt(i);
    lastSpace = /(\s)/.test(this.text.charAt(i)) ? i : lastSpace;
    if (/(?:\r\n|\r|\n)/.test(this.text.charAt(i))) {
      lineWidths.push(lastLineWidth);
      maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
      line++;
      pos.x = 0;
      pos.y += data.lineHeight;
      prevCharCode = null;
      continue;
    }
    if (lastSpace !== -1 && this.maxWidth > 0 && pos.x * scale > this.maxWidth) {
      core.utils.removeItems(chars, lastSpace, i - lastSpace);
      i = lastSpace;
      lastSpace = -1;
      lineWidths.push(lastLineWidth);
      maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
      line++;
      pos.x = 0;
      pos.y += data.lineHeight;
      prevCharCode = null;
      continue;
    }
    var charData = data.chars[charCode];
    if (!charData) {
      continue;
    }
    if (prevCharCode && charData.kerning[prevCharCode]) {
      pos.x += charData.kerning[prevCharCode];
    }
    chars.push({
      texture: charData.texture,
      line: line,
      charCode: charCode,
      position: new core.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)
    });
    lastLineWidth = pos.x + (charData.texture.width + charData.xOffset);
    pos.x += charData.xAdvance;
    maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
    prevCharCode = charCode;
  }
  lineWidths.push(lastLineWidth);
  maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
  var lineAlignOffsets = [];
  for (i = 0; i <= line; i++) {
    var alignOffset = 0;
    if (this._font.align === 'right') {
      alignOffset = maxLineWidth - lineWidths[i];
    } else if (this._font.align === 'center') {
      alignOffset = (maxLineWidth - lineWidths[i]) / 2;
    }
    lineAlignOffsets.push(alignOffset);
  }
  var lenChars = chars.length;
  var tint = this.tint;
  for (i = 0; i < lenChars; i++) {
    var c = this._glyphs[i];
    if (c) {
      c.texture = chars[i].texture;
    } else {
      c = new core.Sprite(chars[i].texture);
      this._glyphs.push(c);
    }
    c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
    c.position.y = chars[i].position.y * scale;
    c.scale.x = c.scale.y = scale;
    c.tint = tint;
    if (!c.parent) {
      this.addChild(c);
    }
  }
  for (i = lenChars; i < this._glyphs.length; ++i) {
    this.removeChild(this._glyphs[i]);
  }
  this.textWidth = maxLineWidth * scale;
  this.textHeight = (pos.y + data.lineHeight) * scale;
  this.maxLineHeight = maxLineHeight * scale;
};
BitmapText.prototype.updateTransform = function() {
  this.validate();
  this.containerUpdateTransform();
};
BitmapText.prototype.getLocalBounds = function() {
  this.validate();
  return core.Container.prototype.getLocalBounds.call(this);
};
BitmapText.prototype.validate = function() {
  if (this.dirty) {
    this.updateText();
    this.dirty = false;
  }
};
BitmapText.fonts = {};
