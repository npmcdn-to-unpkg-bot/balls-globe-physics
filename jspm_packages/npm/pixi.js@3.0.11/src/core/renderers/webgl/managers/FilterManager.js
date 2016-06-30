/* */ 
var WebGLManager = require('./WebGLManager'),
    RenderTarget = require('../utils/RenderTarget'),
    CONST = require('../../../const'),
    Quad = require('../utils/Quad'),
    math = require('../../../math/index');
function FilterManager(renderer) {
  WebGLManager.call(this, renderer);
  this.filterStack = [];
  this.filterStack.push({
    renderTarget: renderer.currentRenderTarget,
    filter: [],
    bounds: null
  });
  this.texturePool = [];
  this.textureSize = new math.Rectangle(0, 0, renderer.width, renderer.height);
  this.currentFrame = null;
}
FilterManager.prototype = Object.create(WebGLManager.prototype);
FilterManager.prototype.constructor = FilterManager;
module.exports = FilterManager;
FilterManager.prototype.onContextChange = function() {
  this.texturePool.length = 0;
  var gl = this.renderer.gl;
  this.quad = new Quad(gl);
};
FilterManager.prototype.setFilterStack = function(filterStack) {
  this.filterStack = filterStack;
};
FilterManager.prototype.pushFilter = function(target, filters) {
  var bounds = target.filterArea ? target.filterArea.clone() : target.getBounds();
  bounds.x = bounds.x | 0;
  bounds.y = bounds.y | 0;
  bounds.width = bounds.width | 0;
  bounds.height = bounds.height | 0;
  var padding = filters[0].padding | 0;
  bounds.x -= padding;
  bounds.y -= padding;
  bounds.width += padding * 2;
  bounds.height += padding * 2;
  if (this.renderer.currentRenderTarget.transform) {
    var transform = this.renderer.currentRenderTarget.transform;
    bounds.x += transform.tx;
    bounds.y += transform.ty;
    this.capFilterArea(bounds);
    bounds.x -= transform.tx;
    bounds.y -= transform.ty;
  } else {
    this.capFilterArea(bounds);
  }
  if (bounds.width > 0 && bounds.height > 0) {
    this.currentFrame = bounds;
    var texture = this.getRenderTarget();
    this.renderer.setRenderTarget(texture);
    texture.clear();
    this.filterStack.push({
      renderTarget: texture,
      filter: filters
    });
  } else {
    this.filterStack.push({
      renderTarget: null,
      filter: filters
    });
  }
};
FilterManager.prototype.popFilter = function() {
  var filterData = this.filterStack.pop();
  var previousFilterData = this.filterStack[this.filterStack.length - 1];
  var input = filterData.renderTarget;
  if (!filterData.renderTarget) {
    return;
  }
  var output = previousFilterData.renderTarget;
  var gl = this.renderer.gl;
  this.currentFrame = input.frame;
  this.quad.map(this.textureSize, input.frame);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.vertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quad.indexBuffer);
  var filters = filterData.filter;
  gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 2 * 4 * 4);
  gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aColor, 4, gl.FLOAT, false, 0, 4 * 4 * 4);
  this.renderer.blendModeManager.setBlendMode(CONST.BLEND_MODES.NORMAL);
  if (filters.length === 1) {
    if (filters[0].uniforms.dimensions) {
      filters[0].uniforms.dimensions.value[0] = this.renderer.width;
      filters[0].uniforms.dimensions.value[1] = this.renderer.height;
      filters[0].uniforms.dimensions.value[2] = this.quad.vertices[0];
      filters[0].uniforms.dimensions.value[3] = this.quad.vertices[5];
    }
    filters[0].applyFilter(this.renderer, input, output);
    this.returnRenderTarget(input);
  } else {
    var flipTexture = input;
    var flopTexture = this.getRenderTarget(true);
    for (var i = 0; i < filters.length - 1; i++) {
      var filter = filters[i];
      if (filter.uniforms.dimensions) {
        filter.uniforms.dimensions.value[0] = this.renderer.width;
        filter.uniforms.dimensions.value[1] = this.renderer.height;
        filter.uniforms.dimensions.value[2] = this.quad.vertices[0];
        filter.uniforms.dimensions.value[3] = this.quad.vertices[5];
      }
      filter.applyFilter(this.renderer, flipTexture, flopTexture);
      var temp = flipTexture;
      flipTexture = flopTexture;
      flopTexture = temp;
    }
    filters[filters.length - 1].applyFilter(this.renderer, flipTexture, output);
    this.returnRenderTarget(flipTexture);
    this.returnRenderTarget(flopTexture);
  }
  return filterData.filter;
};
FilterManager.prototype.getRenderTarget = function(clear) {
  var renderTarget = this.texturePool.pop() || new RenderTarget(this.renderer.gl, this.textureSize.width, this.textureSize.height, CONST.SCALE_MODES.LINEAR, this.renderer.resolution * CONST.FILTER_RESOLUTION);
  renderTarget.frame = this.currentFrame;
  if (clear) {
    renderTarget.clear(true);
  }
  return renderTarget;
};
FilterManager.prototype.returnRenderTarget = function(renderTarget) {
  this.texturePool.push(renderTarget);
};
FilterManager.prototype.applyFilter = function(shader, inputTarget, outputTarget, clear) {
  var gl = this.renderer.gl;
  this.renderer.setRenderTarget(outputTarget);
  if (clear) {
    outputTarget.clear();
  }
  this.renderer.shaderManager.setShader(shader);
  shader.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(true);
  shader.syncUniforms();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, inputTarget.texture);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  this.renderer.drawCount++;
};
FilterManager.prototype.calculateMappedMatrix = function(filterArea, sprite, outputMatrix) {
  var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
      texture = sprite._texture.baseTexture;
  var mappedMatrix = outputMatrix.identity();
  var ratio = this.textureSize.height / this.textureSize.width;
  mappedMatrix.translate(filterArea.x / this.textureSize.width, filterArea.y / this.textureSize.height);
  mappedMatrix.scale(1, ratio);
  var translateScaleX = (this.textureSize.width / texture.width);
  var translateScaleY = (this.textureSize.height / texture.height);
  worldTransform.tx /= texture.width * translateScaleX;
  worldTransform.ty /= texture.width * translateScaleX;
  worldTransform.invert();
  mappedMatrix.prepend(worldTransform);
  mappedMatrix.scale(1, 1 / ratio);
  mappedMatrix.scale(translateScaleX, translateScaleY);
  mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);
  return mappedMatrix;
};
FilterManager.prototype.capFilterArea = function(filterArea) {
  if (filterArea.x < 0) {
    filterArea.width += filterArea.x;
    filterArea.x = 0;
  }
  if (filterArea.y < 0) {
    filterArea.height += filterArea.y;
    filterArea.y = 0;
  }
  if (filterArea.x + filterArea.width > this.textureSize.width) {
    filterArea.width = this.textureSize.width - filterArea.x;
  }
  if (filterArea.y + filterArea.height > this.textureSize.height) {
    filterArea.height = this.textureSize.height - filterArea.y;
  }
};
FilterManager.prototype.resize = function(width, height) {
  this.textureSize.width = width;
  this.textureSize.height = height;
  for (var i = 0; i < this.texturePool.length; i++) {
    this.texturePool[i].resize(width, height);
  }
};
FilterManager.prototype.destroy = function() {
  this.quad.destroy();
  WebGLManager.prototype.destroy.call(this);
  this.filterStack = null;
  this.offsetY = 0;
  for (var i = 0; i < this.texturePool.length; i++) {
    this.texturePool[i].destroy();
  }
  this.texturePool = null;
};
