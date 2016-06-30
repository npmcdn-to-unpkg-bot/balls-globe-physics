/* */ 
var SystemRenderer = require('../SystemRenderer'),
    CanvasMaskManager = require('./utils/CanvasMaskManager'),
    utils = require('../../utils/index'),
    math = require('../../math/index'),
    CONST = require('../../const');
function CanvasRenderer(width, height, options) {
  options = options || {};
  SystemRenderer.call(this, 'Canvas', width, height, options);
  this.type = CONST.RENDERER_TYPE.CANVAS;
  this.context = this.view.getContext('2d', {alpha: this.transparent});
  this.refresh = true;
  this.maskManager = new CanvasMaskManager();
  this.smoothProperty = 'imageSmoothingEnabled';
  if (!this.context.imageSmoothingEnabled) {
    if (this.context.webkitImageSmoothingEnabled) {
      this.smoothProperty = 'webkitImageSmoothingEnabled';
    } else if (this.context.mozImageSmoothingEnabled) {
      this.smoothProperty = 'mozImageSmoothingEnabled';
    } else if (this.context.oImageSmoothingEnabled) {
      this.smoothProperty = 'oImageSmoothingEnabled';
    } else if (this.context.msImageSmoothingEnabled) {
      this.smoothProperty = 'msImageSmoothingEnabled';
    }
  }
  this.initPlugins();
  this._mapBlendModes();
  this._tempDisplayObjectParent = {
    worldTransform: new math.Matrix(),
    worldAlpha: 1
  };
  this.resize(width, height);
}
CanvasRenderer.prototype = Object.create(SystemRenderer.prototype);
CanvasRenderer.prototype.constructor = CanvasRenderer;
module.exports = CanvasRenderer;
utils.pluginTarget.mixin(CanvasRenderer);
CanvasRenderer.prototype.render = function(object) {
  this.emit('prerender');
  var cacheParent = object.parent;
  this._lastObjectRendered = object;
  object.parent = this._tempDisplayObjectParent;
  object.updateTransform();
  object.parent = cacheParent;
  this.context.setTransform(1, 0, 0, 1, 0, 0);
  this.context.globalAlpha = 1;
  this.context.globalCompositeOperation = this.blendModes[CONST.BLEND_MODES.NORMAL];
  if (navigator.isCocoonJS && this.view.screencanvas) {
    this.context.fillStyle = 'black';
    this.context.clear();
  }
  if (this.clearBeforeRender) {
    if (this.transparent) {
      this.context.clearRect(0, 0, this.width, this.height);
    } else {
      this.context.fillStyle = this._backgroundColorString;
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }
  this.renderDisplayObject(object, this.context);
  this.emit('postrender');
};
CanvasRenderer.prototype.destroy = function(removeView) {
  this.destroyPlugins();
  SystemRenderer.prototype.destroy.call(this, removeView);
  this.context = null;
  this.refresh = true;
  this.maskManager.destroy();
  this.maskManager = null;
  this.smoothProperty = null;
};
CanvasRenderer.prototype.renderDisplayObject = function(displayObject, context) {
  var tempContext = this.context;
  this.context = context;
  displayObject.renderCanvas(this);
  this.context = tempContext;
};
CanvasRenderer.prototype.resize = function(w, h) {
  SystemRenderer.prototype.resize.call(this, w, h);
  if (this.smoothProperty) {
    this.context[this.smoothProperty] = (CONST.SCALE_MODES.DEFAULT === CONST.SCALE_MODES.LINEAR);
  }
};
CanvasRenderer.prototype._mapBlendModes = function() {
  if (!this.blendModes) {
    this.blendModes = {};
    if (utils.canUseNewCanvasBlendModes()) {
      this.blendModes[CONST.BLEND_MODES.NORMAL] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.ADD] = 'lighter';
      this.blendModes[CONST.BLEND_MODES.MULTIPLY] = 'multiply';
      this.blendModes[CONST.BLEND_MODES.SCREEN] = 'screen';
      this.blendModes[CONST.BLEND_MODES.OVERLAY] = 'overlay';
      this.blendModes[CONST.BLEND_MODES.DARKEN] = 'darken';
      this.blendModes[CONST.BLEND_MODES.LIGHTEN] = 'lighten';
      this.blendModes[CONST.BLEND_MODES.COLOR_DODGE] = 'color-dodge';
      this.blendModes[CONST.BLEND_MODES.COLOR_BURN] = 'color-burn';
      this.blendModes[CONST.BLEND_MODES.HARD_LIGHT] = 'hard-light';
      this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT] = 'soft-light';
      this.blendModes[CONST.BLEND_MODES.DIFFERENCE] = 'difference';
      this.blendModes[CONST.BLEND_MODES.EXCLUSION] = 'exclusion';
      this.blendModes[CONST.BLEND_MODES.HUE] = 'hue';
      this.blendModes[CONST.BLEND_MODES.SATURATION] = 'saturate';
      this.blendModes[CONST.BLEND_MODES.COLOR] = 'color';
      this.blendModes[CONST.BLEND_MODES.LUMINOSITY] = 'luminosity';
    } else {
      this.blendModes[CONST.BLEND_MODES.NORMAL] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.ADD] = 'lighter';
      this.blendModes[CONST.BLEND_MODES.MULTIPLY] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.SCREEN] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.OVERLAY] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.DARKEN] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.LIGHTEN] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.COLOR_DODGE] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.COLOR_BURN] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.HARD_LIGHT] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.DIFFERENCE] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.EXCLUSION] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.HUE] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.SATURATION] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.COLOR] = 'source-over';
      this.blendModes[CONST.BLEND_MODES.LUMINOSITY] = 'source-over';
    }
  }
};
