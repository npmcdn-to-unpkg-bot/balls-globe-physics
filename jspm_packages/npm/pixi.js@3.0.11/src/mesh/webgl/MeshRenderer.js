/* */ 
var core = require('../../core/index'),
    Mesh = require('../Mesh');
function MeshRenderer(renderer) {
  core.ObjectRenderer.call(this, renderer);
  this.indices = new Uint16Array(15000);
  for (var i = 0,
      j = 0; i < 15000; i += 6, j += 4) {
    this.indices[i + 0] = j + 0;
    this.indices[i + 1] = j + 1;
    this.indices[i + 2] = j + 2;
    this.indices[i + 3] = j + 0;
    this.indices[i + 4] = j + 2;
    this.indices[i + 5] = j + 3;
  }
  this.currentShader = null;
}
MeshRenderer.prototype = Object.create(core.ObjectRenderer.prototype);
MeshRenderer.prototype.constructor = MeshRenderer;
module.exports = MeshRenderer;
core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);
MeshRenderer.prototype.onContextChange = function() {};
MeshRenderer.prototype.render = function(mesh) {
  if (!mesh._vertexBuffer) {
    this._initWebGL(mesh);
  }
  var renderer = this.renderer,
      gl = renderer.gl,
      texture = mesh._texture.baseTexture,
      shader = mesh.shader;
  var drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;
  renderer.blendModeManager.setBlendMode(mesh.blendMode);
  if (!shader) {
    shader = renderer.shaderManager.plugins.meshShader;
  } else {
    shader = shader.shaders[gl.id] || shader.getShader(renderer);
  }
  this.renderer.shaderManager.setShader(shader);
  shader.uniforms.translationMatrix.value = mesh.worldTransform.toArray(true);
  shader.uniforms.projectionMatrix.value = renderer.currentRenderTarget.projectionMatrix.toArray(true);
  shader.uniforms.alpha.value = mesh.worldAlpha;
  shader.syncUniforms();
  if (!mesh.dirty) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, mesh.vertices);
    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
    gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    if (!texture._glTextures[gl.id]) {
      this.renderer.updateTexture(texture);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, mesh.indices);
  } else {
    mesh.dirty = false;
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);
    gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    if (!texture._glTextures[gl.id]) {
      this.renderer.updateTexture(texture);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
  }
  gl.drawElements(drawMode, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
};
MeshRenderer.prototype._initWebGL = function(mesh) {
  var gl = this.renderer.gl;
  mesh._vertexBuffer = gl.createBuffer();
  mesh._indexBuffer = gl.createBuffer();
  mesh._uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);
  if (mesh.colors) {
    mesh._colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh._colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.colors, gl.STATIC_DRAW);
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
};
MeshRenderer.prototype.flush = function() {};
MeshRenderer.prototype.start = function() {
  this.currentShader = null;
};
MeshRenderer.prototype.destroy = function() {
  core.ObjectRenderer.prototype.destroy.call(this);
};
