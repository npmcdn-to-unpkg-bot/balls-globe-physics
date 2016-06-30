/* */ 
var DefaultShader = require('../shaders/TextureShader');
function AbstractFilter(vertexSrc, fragmentSrc, uniforms) {
  this.shaders = [];
  this.padding = 0;
  this.uniforms = uniforms || {};
  this.vertexSrc = vertexSrc || DefaultShader.defaultVertexSrc;
  this.fragmentSrc = fragmentSrc || DefaultShader.defaultFragmentSrc;
}
AbstractFilter.prototype.constructor = AbstractFilter;
module.exports = AbstractFilter;
AbstractFilter.prototype.getShader = function(renderer) {
  var gl = renderer.gl;
  var shader = this.shaders[gl.id];
  if (!shader) {
    shader = new DefaultShader(renderer.shaderManager, this.vertexSrc, this.fragmentSrc, this.uniforms, this.attributes);
    this.shaders[gl.id] = shader;
  }
  return shader;
};
AbstractFilter.prototype.applyFilter = function(renderer, input, output, clear) {
  var shader = this.getShader(renderer);
  renderer.filterManager.applyFilter(shader, input, output, clear);
};
AbstractFilter.prototype.syncUniform = function(uniform) {
  for (var i = 0,
      j = this.shaders.length; i < j; ++i) {
    this.shaders[i].syncUniform(uniform);
  }
};
