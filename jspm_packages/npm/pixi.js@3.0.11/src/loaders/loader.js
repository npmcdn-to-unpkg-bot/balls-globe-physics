/* */ 
var ResourceLoader = require('resource-loader'),
    textureParser = require('./textureParser'),
    spritesheetParser = require('./spritesheetParser'),
    bitmapFontParser = require('./bitmapFontParser');
function Loader(baseUrl, concurrency) {
  ResourceLoader.call(this, baseUrl, concurrency);
  for (var i = 0; i < Loader._pixiMiddleware.length; ++i) {
    this.use(Loader._pixiMiddleware[i]());
  }
}
Loader.prototype = Object.create(ResourceLoader.prototype);
Loader.prototype.constructor = Loader;
module.exports = Loader;
Loader._pixiMiddleware = [ResourceLoader.middleware.parsing.blob, textureParser, spritesheetParser, bitmapFontParser];
Loader.addPixiMiddleware = function(fn) {
  Loader._pixiMiddleware.push(fn);
};
var Resource = ResourceLoader.Resource;
Resource.setExtensionXhrType('fnt', Resource.XHR_RESPONSE_TYPE.DOCUMENT);
