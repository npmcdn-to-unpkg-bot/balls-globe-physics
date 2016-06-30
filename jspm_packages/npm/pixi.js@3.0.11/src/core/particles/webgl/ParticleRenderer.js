/* */ 
var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    ParticleShader = require('./ParticleShader'),
    ParticleBuffer = require('./ParticleBuffer'),
    math = require('../../math/index');
function ParticleRenderer(renderer) {
  ObjectRenderer.call(this, renderer);
  var numIndices = 98304;
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
  this.shader = null;
  this.indexBuffer = null;
  this.properties = null;
  this.tempMatrix = new math.Matrix();
}
ParticleRenderer.prototype = Object.create(ObjectRenderer.prototype);
ParticleRenderer.prototype.constructor = ParticleRenderer;
module.exports = ParticleRenderer;
WebGLRenderer.registerPlugin('particle', ParticleRenderer);
ParticleRenderer.prototype.onContextChange = function() {
  var gl = this.renderer.gl;
  this.shader = new ParticleShader(this.renderer.shaderManager);
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  this.properties = [{
    attribute: this.shader.attributes.aVertexPosition,
    size: 2,
    uploadFunction: this.uploadVertices,
    offset: 0
  }, {
    attribute: this.shader.attributes.aPositionCoord,
    size: 2,
    uploadFunction: this.uploadPosition,
    offset: 0
  }, {
    attribute: this.shader.attributes.aRotation,
    size: 1,
    uploadFunction: this.uploadRotation,
    offset: 0
  }, {
    attribute: this.shader.attributes.aTextureCoord,
    size: 2,
    uploadFunction: this.uploadUvs,
    offset: 0
  }, {
    attribute: this.shader.attributes.aColor,
    size: 1,
    uploadFunction: this.uploadAlpha,
    offset: 0
  }];
};
ParticleRenderer.prototype.start = function() {
  var gl = this.renderer.gl;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  var shader = this.shader;
  this.renderer.shaderManager.setShader(shader);
};
ParticleRenderer.prototype.render = function(container) {
  var children = container.children,
      totalChildren = children.length,
      maxSize = container._maxSize,
      batchSize = container._batchSize;
  if (totalChildren === 0) {
    return;
  } else if (totalChildren > maxSize) {
    totalChildren = maxSize;
  }
  if (!container._buffers) {
    container._buffers = this.generateBuffers(container);
  }
  this.renderer.blendModeManager.setBlendMode(container.blendMode);
  var gl = this.renderer.gl;
  var m = container.worldTransform.copy(this.tempMatrix);
  m.prepend(this.renderer.currentRenderTarget.projectionMatrix);
  gl.uniformMatrix3fv(this.shader.uniforms.projectionMatrix._location, false, m.toArray(true));
  gl.uniform1f(this.shader.uniforms.uAlpha._location, container.worldAlpha);
  var baseTexture = children[0]._texture.baseTexture;
  if (!baseTexture._glTextures[gl.id]) {
    if (!this.renderer.updateTexture(baseTexture)) {
      return;
    }
    if (!container._properties[0] || !container._properties[3]) {
      container._bufferToUpdate = 0;
    }
  } else {
    gl.bindTexture(gl.TEXTURE_2D, baseTexture._glTextures[gl.id]);
  }
  for (var i = 0,
      j = 0; i < totalChildren; i += batchSize, j += 1) {
    var amount = (totalChildren - i);
    if (amount > batchSize) {
      amount = batchSize;
    }
    var buffer = container._buffers[j];
    buffer.uploadDynamic(children, i, amount);
    if (container._bufferToUpdate === j) {
      buffer.uploadStatic(children, i, amount);
      container._bufferToUpdate = j + 1;
    }
    buffer.bind(this.shader);
    gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
    this.renderer.drawCount++;
  }
};
ParticleRenderer.prototype.generateBuffers = function(container) {
  var gl = this.renderer.gl,
      buffers = [],
      size = container._maxSize,
      batchSize = container._batchSize,
      dynamicPropertyFlags = container._properties,
      i;
  for (i = 0; i < size; i += batchSize) {
    buffers.push(new ParticleBuffer(gl, this.properties, dynamicPropertyFlags, batchSize));
  }
  return buffers;
};
ParticleRenderer.prototype.uploadVertices = function(children, startIndex, amount, array, stride, offset) {
  var sprite,
      texture,
      trim,
      sx,
      sy,
      w0,
      w1,
      h0,
      h1;
  for (var i = 0; i < amount; i++) {
    sprite = children[startIndex + i];
    texture = sprite._texture;
    sx = sprite.scale.x;
    sy = sprite.scale.y;
    if (texture.trim) {
      trim = texture.trim;
      w1 = trim.x - sprite.anchor.x * trim.width;
      w0 = w1 + texture.crop.width;
      h1 = trim.y - sprite.anchor.y * trim.height;
      h0 = h1 + texture.crop.height;
    } else {
      w0 = (texture._frame.width) * (1 - sprite.anchor.x);
      w1 = (texture._frame.width) * -sprite.anchor.x;
      h0 = texture._frame.height * (1 - sprite.anchor.y);
      h1 = texture._frame.height * -sprite.anchor.y;
    }
    array[offset] = w1 * sx;
    array[offset + 1] = h1 * sy;
    array[offset + stride] = w0 * sx;
    array[offset + stride + 1] = h1 * sy;
    array[offset + stride * 2] = w0 * sx;
    array[offset + stride * 2 + 1] = h0 * sy;
    array[offset + stride * 3] = w1 * sx;
    array[offset + stride * 3 + 1] = h0 * sy;
    offset += stride * 4;
  }
};
ParticleRenderer.prototype.uploadPosition = function(children, startIndex, amount, array, stride, offset) {
  for (var i = 0; i < amount; i++) {
    var spritePosition = children[startIndex + i].position;
    array[offset] = spritePosition.x;
    array[offset + 1] = spritePosition.y;
    array[offset + stride] = spritePosition.x;
    array[offset + stride + 1] = spritePosition.y;
    array[offset + stride * 2] = spritePosition.x;
    array[offset + stride * 2 + 1] = spritePosition.y;
    array[offset + stride * 3] = spritePosition.x;
    array[offset + stride * 3 + 1] = spritePosition.y;
    offset += stride * 4;
  }
};
ParticleRenderer.prototype.uploadRotation = function(children, startIndex, amount, array, stride, offset) {
  for (var i = 0; i < amount; i++) {
    var spriteRotation = children[startIndex + i].rotation;
    array[offset] = spriteRotation;
    array[offset + stride] = spriteRotation;
    array[offset + stride * 2] = spriteRotation;
    array[offset + stride * 3] = spriteRotation;
    offset += stride * 4;
  }
};
ParticleRenderer.prototype.uploadUvs = function(children, startIndex, amount, array, stride, offset) {
  for (var i = 0; i < amount; i++) {
    var textureUvs = children[startIndex + i]._texture._uvs;
    if (textureUvs) {
      array[offset] = textureUvs.x0;
      array[offset + 1] = textureUvs.y0;
      array[offset + stride] = textureUvs.x1;
      array[offset + stride + 1] = textureUvs.y1;
      array[offset + stride * 2] = textureUvs.x2;
      array[offset + stride * 2 + 1] = textureUvs.y2;
      array[offset + stride * 3] = textureUvs.x3;
      array[offset + stride * 3 + 1] = textureUvs.y3;
      offset += stride * 4;
    } else {
      array[offset] = 0;
      array[offset + 1] = 0;
      array[offset + stride] = 0;
      array[offset + stride + 1] = 0;
      array[offset + stride * 2] = 0;
      array[offset + stride * 2 + 1] = 0;
      array[offset + stride * 3] = 0;
      array[offset + stride * 3 + 1] = 0;
      offset += stride * 4;
    }
  }
};
ParticleRenderer.prototype.uploadAlpha = function(children, startIndex, amount, array, stride, offset) {
  for (var i = 0; i < amount; i++) {
    var spriteAlpha = children[startIndex + i].alpha;
    array[offset] = spriteAlpha;
    array[offset + stride] = spriteAlpha;
    array[offset + stride * 2] = spriteAlpha;
    array[offset + stride * 3] = spriteAlpha;
    offset += stride * 4;
  }
};
ParticleRenderer.prototype.destroy = function() {
  if (this.renderer.gl) {
    this.renderer.gl.deleteBuffer(this.indexBuffer);
  }
  ObjectRenderer.prototype.destroy.apply(this, arguments);
  this.shader.destroy();
  this.indices = null;
  this.tempMatrix = null;
};
