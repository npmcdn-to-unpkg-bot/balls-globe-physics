/* */ 
var math = require('../../../math/index'),
    utils = require('../../../utils/index'),
    CONST = require('../../../const'),
    StencilMaskStack = require('./StencilMaskStack');
var RenderTarget = function(gl, width, height, scaleMode, resolution, root) {
  this.gl = gl;
  this.frameBuffer = null;
  this.texture = null;
  this.size = new math.Rectangle(0, 0, 1, 1);
  this.resolution = resolution || CONST.RESOLUTION;
  this.projectionMatrix = new math.Matrix();
  this.transform = null;
  this.frame = null;
  this.stencilBuffer = null;
  this.stencilMaskStack = new StencilMaskStack();
  this.filterStack = [{
    renderTarget: this,
    filter: [],
    bounds: this.size
  }];
  this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
  this.root = root;
  if (!this.root) {
    this.frameBuffer = gl.createFramebuffer();
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
    var isPowerOfTwo = utils.isPowerOfTwo(width, height);
    if (!isPowerOfTwo) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
  }
  this.resize(width, height);
};
RenderTarget.prototype.constructor = RenderTarget;
module.exports = RenderTarget;
RenderTarget.prototype.clear = function(bind) {
  var gl = this.gl;
  if (bind) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
  }
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
};
RenderTarget.prototype.attachStencilBuffer = function() {
  if (this.stencilBuffer) {
    return;
  }
  if (!this.root) {
    var gl = this.gl;
    this.stencilBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencilBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.stencilBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.size.width * this.resolution, this.size.height * this.resolution);
  }
};
RenderTarget.prototype.activate = function() {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
  var projectionFrame = this.frame || this.size;
  this.calculateProjection(projectionFrame);
  if (this.transform) {
    this.projectionMatrix.append(this.transform);
  }
  gl.viewport(0, 0, projectionFrame.width * this.resolution, projectionFrame.height * this.resolution);
};
RenderTarget.prototype.calculateProjection = function(projectionFrame) {
  var pm = this.projectionMatrix;
  pm.identity();
  if (!this.root) {
    pm.a = 1 / projectionFrame.width * 2;
    pm.d = 1 / projectionFrame.height * 2;
    pm.tx = -1 - projectionFrame.x * pm.a;
    pm.ty = -1 - projectionFrame.y * pm.d;
  } else {
    pm.a = 1 / projectionFrame.width * 2;
    pm.d = -1 / projectionFrame.height * 2;
    pm.tx = -1 - projectionFrame.x * pm.a;
    pm.ty = 1 - projectionFrame.y * pm.d;
  }
};
RenderTarget.prototype.resize = function(width, height) {
  width = width | 0;
  height = height | 0;
  if (this.size.width === width && this.size.height === height) {
    return;
  }
  this.size.width = width;
  this.size.height = height;
  if (!this.root) {
    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width * this.resolution, height * this.resolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    if (this.stencilBuffer) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencilBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width * this.resolution, height * this.resolution);
    }
  }
  var projectionFrame = this.frame || this.size;
  this.calculateProjection(projectionFrame);
};
RenderTarget.prototype.destroy = function() {
  var gl = this.gl;
  gl.deleteRenderbuffer(this.stencilBuffer);
  gl.deleteFramebuffer(this.frameBuffer);
  gl.deleteTexture(this.texture);
  this.frameBuffer = null;
  this.texture = null;
};
