/* */ 
var Resource = require('resource-loader').Resource,
    core = require('../core/index'),
    extras = require('../extras/index'),
    path = require('path');
function parse(resource, texture) {
  var data = {};
  var info = resource.data.getElementsByTagName('info')[0];
  var common = resource.data.getElementsByTagName('common')[0];
  data.font = info.getAttribute('face');
  data.size = parseInt(info.getAttribute('size'), 10);
  data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
  data.chars = {};
  var letters = resource.data.getElementsByTagName('char');
  for (var i = 0; i < letters.length; i++) {
    var charCode = parseInt(letters[i].getAttribute('id'), 10);
    var textureRect = new core.Rectangle(parseInt(letters[i].getAttribute('x'), 10) + texture.frame.x, parseInt(letters[i].getAttribute('y'), 10) + texture.frame.y, parseInt(letters[i].getAttribute('width'), 10), parseInt(letters[i].getAttribute('height'), 10));
    data.chars[charCode] = {
      xOffset: parseInt(letters[i].getAttribute('xoffset'), 10),
      yOffset: parseInt(letters[i].getAttribute('yoffset'), 10),
      xAdvance: parseInt(letters[i].getAttribute('xadvance'), 10),
      kerning: {},
      texture: new core.Texture(texture.baseTexture, textureRect)
    };
  }
  var kernings = resource.data.getElementsByTagName('kerning');
  for (i = 0; i < kernings.length; i++) {
    var first = parseInt(kernings[i].getAttribute('first'), 10);
    var second = parseInt(kernings[i].getAttribute('second'), 10);
    var amount = parseInt(kernings[i].getAttribute('amount'), 10);
    if (data.chars[second]) {
      data.chars[second].kerning[first] = amount;
    }
  }
  resource.bitmapFont = data;
  extras.BitmapText.fonts[data.font] = data;
}
module.exports = function() {
  return function(resource, next) {
    if (!resource.data || !resource.isXml) {
      return next();
    }
    if (resource.data.getElementsByTagName('page').length === 0 || resource.data.getElementsByTagName('info').length === 0 || resource.data.getElementsByTagName('info')[0].getAttribute('face') === null) {
      return next();
    }
    var xmlUrl = path.dirname(resource.url);
    if (xmlUrl === '.') {
      xmlUrl = '';
    }
    if (this.baseUrl && xmlUrl) {
      if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/') {
        xmlUrl += '/';
      }
      xmlUrl = xmlUrl.replace(this.baseUrl, '');
    }
    if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/') {
      xmlUrl += '/';
    }
    var textureUrl = xmlUrl + resource.data.getElementsByTagName('page')[0].getAttribute('file');
    if (core.utils.TextureCache[textureUrl]) {
      parse(resource, core.utils.TextureCache[textureUrl]);
      next();
    } else {
      var loadOptions = {
        crossOrigin: resource.crossOrigin,
        loadType: Resource.LOAD_TYPE.IMAGE,
        metadata: resource.metadata.imageMetadata
      };
      this.add(resource.name + '_image', textureUrl, loadOptions, function(res) {
        parse(resource, res.texture);
        next();
      });
    }
  };
};
