/* */ 
var SystemRenderer = require('../SystemRenderer'),
    ShaderManager = require('./managers/ShaderManager'),
    MaskManager = require('./managers/MaskManager'),
    StencilManager = require('./managers/StencilManager'),
    FilterManager = require('./managers/FilterManager'),
    BlendModeManager = require('./managers/BlendModeManager'),
    RenderTarget = require('./utils/RenderTarget'),
    ObjectRenderer = require('./utils/ObjectRenderer'),
    FXAAFilter = require('./filters/FXAAFilter'),
    utils = require('../../utils/index'),
    CONST = require('../../const');
function WebGLRenderer(width, height, options) {
  options = options || {};
  SystemRenderer.call(this, 'WebGL', width, height, options);
  this.type = CONST.RENDERER_TYPE.WEBGL;
  this.handleContextLost = this.handleContextLost.bind(this);
  this.handleContextRestored = this.handleContextRestored.bind(this);
  this.view.addEventListener('webglcontextlost', this.handleContextLost, false);
  this.view.addEventListener('webglcontextrestored', this.handleContextRestored, false);
  this._useFXAA = !!options.forceFXAA && options.antialias;
  this._FXAAFilter = null;
  this._contextOptions = {
    alpha: this.transparent,
    antialias: options.antialias,
    premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
    stencil: true,
    preserveDrawingBuffer: options.preserveDrawingBuffer
  };
  this.drawCount = 0;
  this.shaderManager = new ShaderManager(this);
  this.maskManager = new MaskManager(this);
  this.stencilManager = new StencilManager(this);
  this.filterManager = new FilterManager(this);
  this.blendModeManager = new BlendModeManager(this);
  this.currentRenderTarget = null;
  this.currentRenderer = new ObjectRenderer(this);
  this.initPlugins();
  this._createContext();
  this._initContext();
  this._mapGlModes();
  this._managedTextures = [];
  this._renderTargetStack = [];
}
WebGLRenderer.prototype = Object.create(SystemRenderer.prototype);
WebGLRenderer.prototype.constructor = WebGLRenderer;
module.exports = WebGLRenderer;
utils.pluginTarget.mixin(WebGLRenderer);
WebGLRenderer.glContextId = 0;
WebGLRenderer.prototype._createContext = function() {
  var gl = this.view.getContext('webgl', this._contextOptions) || this.view.getContext('experimental-webgl', this._contextOptions);
  this.gl = gl;
  if (!gl) {
    throw new Error('This browser does not support webGL. Try using the canvas renderer');
  }
  this.glContextId = WebGLRenderer.glContextId++;
  gl.id = this.glContextId;
  gl.renderer = this;
};
WebGLRenderer.prototype._initContext = function() {
  var gl = this.gl;
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  this.renderTarget = new RenderTarget(gl, this.width, this.height, null, this.resolution, true);
  this.setRenderTarget(this.renderTarget);
  this.emit('context', gl);
  this.resize(this.width, this.height);
  if (!this._useFXAA) {
    this._useFXAA = (this._contextOptions.antialias && !gl.getContextAttributes().antialias);
  }
  if (this._useFXAA) {
    window.console.warn('FXAA antialiasing being used instead of native antialiasing');
    this._FXAAFilter = [new FXAAFilter()];
  }
};
WebGLRenderer.prototype.render = function(object) {
  this.emit('prerender');
  if (this.gl.isContextLost()) {
    return;
  }
  this.drawCount = 0;
  this._lastObjectRendered = object;
  if (this._useFXAA) {
    this._FXAAFilter[0].uniforms.resolution.value.x = this.width;
    this._FXAAFilter[0].uniforms.resolution.value.y = this.height;
    object.filterArea = this.renderTarget.size;
    object.filters = this._FXAAFilter;
  }
  var cacheParent = object.parent;
  object.parent = this._tempDisplayObjectParent;
  object.updateTransform();
  object.parent = cacheParent;
  var gl = this.gl;
  this.setRenderTarget(this.renderTarget);
  if (this.clearBeforeRender) {
    if (this.transparent) {
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(this._backgroundColorRgb[0], this._backgroundColorRgb[1], this._backgroundColorRgb[2], 1);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  this.renderDisplayObject(object, this.renderTarget);
  this.emit('postrender');
};
WebGLRenderer.prototype.renderDisplayObject = function(displayObject, renderTarget, clear) {
  this.setRenderTarget(renderTarget);
  if (clear) {
    renderTarget.clear();
  }
  this.filterManager.setFilterStack(renderTarget.filterStack);
  displayObject.renderWebGL(this);
  this.currentRenderer.flush();
};
WebGLRenderer.prototype.setObjectRenderer = function(objectRenderer) {
  if (this.currentRenderer === objectRenderer) {
    return;
  }
  this.currentRenderer.stop();
  this.currentRenderer = objectRenderer;
  this.currentRenderer.start();
};
WebGLRenderer.prototype.setRenderTarget = function(renderTarget) {
  if (this.currentRenderTarget === renderTarget) {
    return;
  }
  this.currentRenderTarget = renderTarget;
  this.currentRenderTarget.activate();
  this.stencilManager.setMaskStack(renderTarget.stencilMaskStack);
};
WebGLRenderer.prototype.resize = function(width, height) {
  SystemRenderer.prototype.resize.call(this, width, height);
  this.filterManager.resize(width, height);
  this.renderTarget.resize(width, height);
  if (this.currentRenderTarget === this.renderTarget) {
    this.renderTarget.activate();
    this.gl.viewport(0, 0, this.width, this.height);
  }
};
WebGLRenderer.prototype.updateTexture = function(texture) {
  texture = texture.baseTexture || texture;
  if (!texture.hasLoaded) {
    return;
  }
  var gl = this.gl;
  if (!texture._glTextures[gl.id]) {
    texture._glTextures[gl.id] = gl.createTexture();
    texture.on('update', this.updateTexture, this);
    texture.on('dispose', this.destroyTexture, this);
    this._managedTextures.push(texture);
  }
  gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
  if (texture.mipmap && texture.isPowerOfTwo) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
  }
  if (!texture.isPowerOfTwo) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }
  return texture._glTextures[gl.id];
};
WebGLRenderer.prototype.destroyTexture = function(texture, _skipRemove) {
  texture = texture.baseTexture || texture;
  if (!texture.hasLoaded) {
    return;
  }
  if (texture._glTextures[this.gl.id]) {
    this.gl.deleteTexture(texture._glTextures[this.gl.id]);
    delete texture._glTextures[this.gl.id];
    if (!_skipRemove) {
      var i = this._managedTextures.indexOf(texture);
      if (i !== -1) {
        utils.removeItems(this._managedTextures, i, 1);
      }
    }
  }
};
WebGLRenderer.prototype.handleContextLost = function(event) {
  event.preventDefault();
};
WebGLRenderer.prototype.handleContextRestored = function() {
  this._initContext();
  for (var i = 0; i < this._managedTextures.length; ++i) {
    var texture = this._managedTextures[i];
    if (texture._glTextures[this.gl.id]) {
      delete texture._glTextures[this.gl.id];
    }
  }
};
WebGLRenderer.prototype.destroy = function(removeView) {
  this.destroyPlugins();
  this.view.removeEventListener('webglcontextlost', this.handleContextLost);
  this.view.removeEventListener('webglcontextrestored', this.handleContextRestored);
  for (var i = 0; i < this._managedTextures.length; ++i) {
    var texture = this._managedTextures[i];
    this.destroyTexture(texture, true);
    texture.off('update', this.updateTexture, this);
    texture.off('dispose', this.destroyTexture, this);
  }
  SystemRenderer.prototype.destroy.call(this, removeView);
  this.uid = 0;
  this.shaderManager.destroy();
  this.maskManager.destroy();
  this.stencilManager.destroy();
  this.filterManager.destroy();
  this.blendModeManager.destroy();
  this.shaderManager = null;
  this.maskManager = null;
  this.filterManager = null;
  this.blendModeManager = null;
  this.currentRenderer = null;
  this.handleContextLost = null;
  this.handleContextRestored = null;
  this._contextOptions = null;
  this._managedTextures = null;
  this.drawCount = 0;
  this.gl.useProgram(null);
  this.gl.flush();
  this.gl = null;
};
WebGLRenderer.prototype._mapGlModes = function() {
  var gl = this.gl;
  if (!this.blendModes) {
    this.blendModes = {};
    this.blendModes[CONST.BLEND_MODES.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.ADD] = [gl.ONE, gl.DST_ALPHA];
    this.blendModes[CONST.BLEND_MODES.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.SCREEN] = [gl.ONE, gl.ONE_MINUS_SRC_COLOR];
    this.blendModes[CONST.BLEND_MODES.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    this.blendModes[CONST.BLEND_MODES.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  }
  if (!this.drawModes) {
    this.drawModes = {};
    this.drawModes[CONST.DRAW_MODES.POINTS] = gl.POINTS;
    this.drawModes[CONST.DRAW_MODES.LINES] = gl.LINES;
    this.drawModes[CONST.DRAW_MODES.LINE_LOOP] = gl.LINE_LOOP;
    this.drawModes[CONST.DRAW_MODES.LINE_STRIP] = gl.LINE_STRIP;
    this.drawModes[CONST.DRAW_MODES.TRIANGLES] = gl.TRIANGLES;
    this.drawModes[CONST.DRAW_MODES.TRIANGLE_STRIP] = gl.TRIANGLE_STRIP;
    this.drawModes[CONST.DRAW_MODES.TRIANGLE_FAN] = gl.TRIANGLE_FAN;
  }
};
