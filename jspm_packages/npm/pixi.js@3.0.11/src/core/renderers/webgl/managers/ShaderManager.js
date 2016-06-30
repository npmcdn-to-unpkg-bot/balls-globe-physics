/* */ 
var WebGLManager = require('./WebGLManager'),
    TextureShader = require('../shaders/TextureShader'),
    ComplexPrimitiveShader = require('../shaders/ComplexPrimitiveShader'),
    PrimitiveShader = require('../shaders/PrimitiveShader'),
    utils = require('../../../utils/index');
function ShaderManager(renderer) {
  WebGLManager.call(this, renderer);
  this.maxAttibs = 10;
  this.attribState = [];
  this.tempAttribState = [];
  for (var i = 0; i < this.maxAttibs; i++) {
    this.attribState[i] = false;
  }
  this.stack = [];
  this._currentId = -1;
  this.currentShader = null;
}
ShaderManager.prototype = Object.create(WebGLManager.prototype);
ShaderManager.prototype.constructor = ShaderManager;
utils.pluginTarget.mixin(ShaderManager);
module.exports = ShaderManager;
ShaderManager.prototype.onContextChange = function() {
  this.initPlugins();
  var gl = this.renderer.gl;
  this.maxAttibs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
  this.attribState = [];
  for (var i = 0; i < this.maxAttibs; i++) {
    this.attribState[i] = false;
  }
  this.defaultShader = new TextureShader(this);
  this.primitiveShader = new PrimitiveShader(this);
  this.complexPrimitiveShader = new ComplexPrimitiveShader(this);
};
ShaderManager.prototype.setAttribs = function(attribs) {
  var i;
  for (i = 0; i < this.tempAttribState.length; i++) {
    this.tempAttribState[i] = false;
  }
  for (var a in attribs) {
    this.tempAttribState[attribs[a]] = true;
  }
  var gl = this.renderer.gl;
  for (i = 0; i < this.attribState.length; i++) {
    if (this.attribState[i] !== this.tempAttribState[i]) {
      this.attribState[i] = this.tempAttribState[i];
      if (this.attribState[i]) {
        gl.enableVertexAttribArray(i);
      } else {
        gl.disableVertexAttribArray(i);
      }
    }
  }
};
ShaderManager.prototype.setShader = function(shader) {
  if (this._currentId === shader.uid) {
    return false;
  }
  this._currentId = shader.uid;
  this.currentShader = shader;
  this.renderer.gl.useProgram(shader.program);
  this.setAttribs(shader.attributes);
  return true;
};
ShaderManager.prototype.destroy = function() {
  this.primitiveShader.destroy();
  this.complexPrimitiveShader.destroy();
  WebGLManager.prototype.destroy.call(this);
  this.destroyPlugins();
  this.attribState = null;
  this.tempAttribState = null;
};
