/* */ 
var core = require('../core/index');
module.exports = function() {
  return function(resource, next) {
    if (resource.data && resource.isImage) {
      var baseTexture = new core.BaseTexture(resource.data, null, core.utils.getResolutionOfUrl(resource.url));
      baseTexture.imageUrl = resource.url;
      resource.texture = new core.Texture(baseTexture);
      core.utils.BaseTextureCache[resource.url] = baseTexture;
      core.utils.TextureCache[resource.url] = resource.texture;
    }
    next();
  };
};
