/* */ 
var core = require('./core/index'),
    mesh = require('./mesh/index'),
    extras = require('./extras/index'),
    filters = require('./filters/index');
core.SpriteBatch = function() {
  throw new ReferenceError('SpriteBatch does not exist any more, please use the new ParticleContainer instead.');
};
core.AssetLoader = function() {
  throw new ReferenceError('The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.');
};
Object.defineProperties(core, {
  Stage: {get: function() {
      console.warn('You do not need to use a PIXI Stage any more, you can simply render any container.');
      return core.Container;
    }},
  DisplayObjectContainer: {get: function() {
      console.warn('DisplayObjectContainer has been shortened to Container, please use Container from now on.');
      return core.Container;
    }},
  Strip: {get: function() {
      console.warn('The Strip class has been renamed to Mesh and moved to mesh.Mesh, please use mesh.Mesh from now on.');
      return mesh.Mesh;
    }},
  Rope: {get: function() {
      console.warn('The Rope class has been moved to mesh.Rope, please use mesh.Rope from now on.');
      return mesh.Rope;
    }},
  MovieClip: {get: function() {
      console.warn('The MovieClip class has been moved to extras.MovieClip, please use extras.MovieClip from now on.');
      return extras.MovieClip;
    }},
  TilingSprite: {get: function() {
      console.warn('The TilingSprite class has been moved to extras.TilingSprite, please use extras.TilingSprite from now on.');
      return extras.TilingSprite;
    }},
  BitmapText: {get: function() {
      console.warn('The BitmapText class has been moved to extras.BitmapText, please use extras.BitmapText from now on.');
      return extras.BitmapText;
    }},
  blendModes: {get: function() {
      console.warn('The blendModes has been moved to BLEND_MODES, please use BLEND_MODES from now on.');
      return core.BLEND_MODES;
    }},
  scaleModes: {get: function() {
      console.warn('The scaleModes has been moved to SCALE_MODES, please use SCALE_MODES from now on.');
      return core.SCALE_MODES;
    }},
  BaseTextureCache: {get: function() {
      console.warn('The BaseTextureCache class has been moved to utils.BaseTextureCache, please use utils.BaseTextureCache from now on.');
      return core.utils.BaseTextureCache;
    }},
  TextureCache: {get: function() {
      console.warn('The TextureCache class has been moved to utils.TextureCache, please use utils.TextureCache from now on.');
      return core.utils.TextureCache;
    }},
  math: {get: function() {
      console.warn('The math namespace is deprecated, please access members already accessible on PIXI.');
      return core;
    }}
});
core.Sprite.prototype.setTexture = function(texture) {
  this.texture = texture;
  console.warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
};
extras.BitmapText.prototype.setText = function(text) {
  this.text = text;
  console.warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
};
core.Text.prototype.setText = function(text) {
  this.text = text;
  console.warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
};
core.Text.prototype.setStyle = function(style) {
  this.style = style;
  console.warn('setStyle is now deprecated, please use the style property, e.g : myText.style = style;');
};
core.Texture.prototype.setFrame = function(frame) {
  this.frame = frame;
  console.warn('setFrame is now deprecated, please use the frame property, e.g : myTexture.frame = frame;');
};
Object.defineProperties(filters, {
  AbstractFilter: {get: function() {
      console.warn('filters.AbstractFilter is an undocumented alias, please use AbstractFilter from now on.');
      return core.AbstractFilter;
    }},
  FXAAFilter: {get: function() {
      console.warn('filters.FXAAFilter is an undocumented alias, please use FXAAFilter from now on.');
      return core.FXAAFilter;
    }},
  SpriteMaskFilter: {get: function() {
      console.warn('filters.SpriteMaskFilter is an undocumented alias, please use SpriteMaskFilter from now on.');
      return core.SpriteMaskFilter;
    }}
});
core.utils.uuid = function() {
  console.warn('utils.uuid() is deprecated, please use utils.uid() from now on.');
  return core.utils.uid();
};
