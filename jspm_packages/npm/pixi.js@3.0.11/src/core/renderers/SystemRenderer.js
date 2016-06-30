/* */ 
var utils = require('../utils/index'),
    math = require('../math/index'),
    CONST = require('../const'),
    EventEmitter = require('eventemitter3');
function SystemRenderer(system, width, height, options) {
  EventEmitter.call(this);
  utils.sayHello(system);
  if (options) {
    for (var i in CONST.DEFAULT_RENDER_OPTIONS) {
      if (typeof options[i] === 'undefined') {
        options[i] = CONST.DEFAULT_RENDER_OPTIONS[i];
      }
    }
  } else {
    options = CONST.DEFAULT_RENDER_OPTIONS;
  }
  this.type = CONST.RENDERER_TYPE.UNKNOWN;
  this.width = width || 800;
  this.height = height || 600;
  this.view = options.view || document.createElement('canvas');
  this.resolution = options.resolution;
  this.transparent = options.transparent;
  this.autoResize = options.autoResize || false;
  this.blendModes = null;
  this.preserveDrawingBuffer = options.preserveDrawingBuffer;
  this.clearBeforeRender = options.clearBeforeRender;
  this.roundPixels = options.roundPixels;
  this._backgroundColor = 0x000000;
  this._backgroundColorRgb = [0, 0, 0];
  this._backgroundColorString = '#000000';
  this.backgroundColor = options.backgroundColor || this._backgroundColor;
  this._tempDisplayObjectParent = {
    worldTransform: new math.Matrix(),
    worldAlpha: 1,
    children: []
  };
  this._lastObjectRendered = this._tempDisplayObjectParent;
}
SystemRenderer.prototype = Object.create(EventEmitter.prototype);
SystemRenderer.prototype.constructor = SystemRenderer;
module.exports = SystemRenderer;
Object.defineProperties(SystemRenderer.prototype, {backgroundColor: {
    get: function() {
      return this._backgroundColor;
    },
    set: function(val) {
      this._backgroundColor = val;
      this._backgroundColorString = utils.hex2string(val);
      utils.hex2rgb(val, this._backgroundColorRgb);
    }
  }});
SystemRenderer.prototype.resize = function(width, height) {
  this.width = width * this.resolution;
  this.height = height * this.resolution;
  this.view.width = this.width;
  this.view.height = this.height;
  if (this.autoResize) {
    this.view.style.width = this.width / this.resolution + 'px';
    this.view.style.height = this.height / this.resolution + 'px';
  }
};
SystemRenderer.prototype.destroy = function(removeView) {
  if (removeView && this.view.parentNode) {
    this.view.parentNode.removeChild(this.view);
  }
  this.type = CONST.RENDERER_TYPE.UNKNOWN;
  this.width = 0;
  this.height = 0;
  this.view = null;
  this.resolution = 0;
  this.transparent = false;
  this.autoResize = false;
  this.blendModes = null;
  this.preserveDrawingBuffer = false;
  this.clearBeforeRender = false;
  this.roundPixels = false;
  this._backgroundColor = 0;
  this._backgroundColorRgb = null;
  this._backgroundColorString = null;
};
