/* */ 
var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    CONST = require('../../const');
function SpriteRenderer(renderer) {
  ObjectRenderer.call(this, renderer);
  this.vertSize = 5;
  this.vertByteSize = this.vertSize * 4;
  this.size = CONST.SPRITE_BATCH_SIZE;
  var numVerts = (this.size * 4) * this.vertByteSize;
  var numIndices = this.size * 6;
  this.vertices = new ArrayBuffer(numVerts);
  this.positions = new Float32Array(this.vertices);
  this.colors = new Uint32Array(this.vertices);
  this.indices = new Uint16Array(numIndices);
  for (var i = 0,
      j = 0; i < numIndices; i += 6, j += 4) {
    this.indices[i + 0] = j + 0;
    this.indices[i + 1] = j + 1;
    this.indices[i + 2] = j + 2;
    this.indices[i + 3] = j + 0;
    this.indices[i + 4] = j + 2;
    this.indices[i + 5] = j + 3;
  }
  this.currentBatchSize = 0;
  this.sprites = [];
  this.shader = null;
}
SpriteRenderer.prototype = Object.create(ObjectRenderer.prototype);
SpriteRenderer.prototype.constructor = SpriteRenderer;
module.exports = SpriteRenderer;
WebGLRenderer.registerPlugin('sprite', SpriteRenderer);
SpriteRenderer.prototype.onContextChange = function() {
  var gl = this.renderer.gl;
  this.shader = this.renderer.shaderManager.defaultShader;
  this.vertexBuffer = gl.createBuffer();
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
  this.currentBlendMode = 99999;
};
SpriteRenderer.prototype.render = function(sprite) {
  var texture = sprite._texture;
  if (this.currentBatchSize >= this.size) {
    this.flush();
  }
  var uvs = texture._uvs;
  if (!uvs) {
    return;
  }
  var aX = sprite.anchor.x;
  var aY = sprite.anchor.y;
  var w0,
      w1,
      h0,
      h1;
  if (texture.trim && sprite.tileScale === undefined) {
    var trim = texture.trim;
    w1 = trim.x - aX * trim.width;
    w0 = w1 + texture.crop.width;
    h1 = trim.y - aY * trim.height;
    h0 = h1 + texture.crop.height;
  } else {
    w0 = (texture._frame.width) * (1 - aX);
    w1 = (texture._frame.width) * -aX;
    h0 = texture._frame.height * (1 - aY);
    h1 = texture._frame.height * -aY;
  }
  var index = this.currentBatchSize * this.vertByteSize;
  var worldTransform = sprite.worldTransform;
  var a = worldTransform.a;
  var b = worldTransform.b;
  var c = worldTransform.c;
  var d = worldTransform.d;
  var tx = worldTransform.tx;
  var ty = worldTransform.ty;
  var colors = this.colors;
  var positions = this.positions;
  if (this.renderer.roundPixels) {
    var resolution = this.renderer.resolution;
    positions[index] = (((a * w1 + c * h1 + tx) * resolution) | 0) / resolution;
    positions[index + 1] = (((d * h1 + b * w1 + ty) * resolution) | 0) / resolution;
    positions[index + 5] = (((a * w0 + c * h1 + tx) * resolution) | 0) / resolution;
    positions[index + 6] = (((d * h1 + b * w0 + ty) * resolution) | 0) / resolution;
    positions[index + 10] = (((a * w0 + c * h0 + tx) * resolution) | 0) / resolution;
    positions[index + 11] = (((d * h0 + b * w0 + ty) * resolution) | 0) / resolution;
    positions[index + 15] = (((a * w1 + c * h0 + tx) * resolution) | 0) / resolution;
    positions[index + 16] = (((d * h0 + b * w1 + ty) * resolution) | 0) / resolution;
  } else {
    positions[index] = a * w1 + c * h1 + tx;
    positions[index + 1] = d * h1 + b * w1 + ty;
    positions[index + 5] = a * w0 + c * h1 + tx;
    positions[index + 6] = d * h1 + b * w0 + ty;
    positions[index + 10] = a * w0 + c * h0 + tx;
    positions[index + 11] = d * h0 + b * w0 + ty;
    positions[index + 15] = a * w1 + c * h0 + tx;
    positions[index + 16] = d * h0 + b * w1 + ty;
  }
  positions[index + 2] = uvs.x0;
  positions[index + 3] = uvs.y0;
  positions[index + 7] = uvs.x1;
  positions[index + 8] = uvs.y1;
  positions[index + 12] = uvs.x2;
  positions[index + 13] = uvs.y2;
  positions[index + 17] = uvs.x3;
  positions[index + 18] = uvs.y3;
  var tint = sprite.tint;
  colors[index + 4] = colors[index + 9] = colors[index + 14] = colors[index + 19] = (tint >> 16) + (tint & 0xff00) + ((tint & 0xff) << 16) + (sprite.worldAlpha * 255 << 24);
  this.sprites[this.currentBatchSize++] = sprite;
};
SpriteRenderer.prototype.flush = function() {
  if (this.currentBatchSize === 0) {
    return;
  }
  var gl = this.renderer.gl;
  var shader;
  if (this.currentBatchSize > (this.size * 0.5)) {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
  } else {
    var view = this.positions.subarray(0, this.currentBatchSize * this.vertByteSize);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
  }
  var nextTexture,
      nextBlendMode,
      nextShader;
  var batchSize = 0;
  var start = 0;
  var currentBaseTexture = null;
  var currentBlendMode = this.renderer.blendModeManager.currentBlendMode;
  var currentShader = null;
  var blendSwap = false;
  var shaderSwap = false;
  var sprite;
  for (var i = 0,
      j = this.currentBatchSize; i < j; i++) {
    sprite = this.sprites[i];
    nextTexture = sprite._texture.baseTexture;
    nextBlendMode = sprite.blendMode;
    nextShader = sprite.shader || this.shader;
    blendSwap = currentBlendMode !== nextBlendMode;
    shaderSwap = currentShader !== nextShader;
    if (currentBaseTexture !== nextTexture || blendSwap || shaderSwap) {
      this.renderBatch(currentBaseTexture, batchSize, start);
      start = i;
      batchSize = 0;
      currentBaseTexture = nextTexture;
      if (blendSwap) {
        currentBlendMode = nextBlendMode;
        this.renderer.blendModeManager.setBlendMode(currentBlendMode);
      }
      if (shaderSwap) {
        currentShader = nextShader;
        shader = currentShader.shaders ? currentShader.shaders[gl.id] : currentShader;
        if (!shader) {
          shader = currentShader.getShader(this.renderer);
        }
        this.renderer.shaderManager.setShader(shader);
        shader.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(true);
        shader.syncUniforms();
        gl.activeTexture(gl.TEXTURE0);
      }
    }
    batchSize++;
  }
  this.renderBatch(currentBaseTexture, batchSize, start);
  this.currentBatchSize = 0;
};
SpriteRenderer.prototype.renderBatch = function(texture, size, startIndex) {
  if (size === 0) {
    return;
  }
  var gl = this.renderer.gl;
  if (!texture._glTextures[gl.id]) {
    this.renderer.updateTexture(texture);
  } else {
    gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
  }
  gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, startIndex * 6 * 2);
  this.renderer.drawCount++;
};
SpriteRenderer.prototype.start = function() {
  var gl = this.renderer.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  var stride = this.vertByteSize;
  gl.vertexAttribPointer(this.shader.attributes.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
  gl.vertexAttribPointer(this.shader.attributes.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);
  gl.vertexAttribPointer(this.shader.attributes.aColor, 4, gl.UNSIGNED_BYTE, true, stride, 4 * 4);
};
SpriteRenderer.prototype.destroy = function() {
  this.renderer.gl.deleteBuffer(this.vertexBuffer);
  this.renderer.gl.deleteBuffer(this.indexBuffer);
  ObjectRenderer.prototype.destroy.call(this);
  this.shader.destroy();
  this.renderer = null;
  this.vertices = null;
  this.positions = null;
  this.colors = null;
  this.indices = null;
  this.vertexBuffer = null;
  this.indexBuffer = null;
  this.sprites = null;
  this.shader = null;
};
