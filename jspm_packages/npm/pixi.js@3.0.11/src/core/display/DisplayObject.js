/* */ 
(function(process) {
  var math = require('../math/index'),
      RenderTexture = require('../textures/RenderTexture'),
      EventEmitter = require('eventemitter3'),
      CONST = require('../const'),
      _tempMatrix = new math.Matrix(),
      _tempDisplayObjectParent = {
        worldTransform: new math.Matrix(),
        worldAlpha: 1,
        children: []
      };
  function DisplayObject() {
    EventEmitter.call(this);
    this.position = new math.Point();
    this.scale = new math.Point(1, 1);
    this.pivot = new math.Point(0, 0);
    this.skew = new math.Point(0, 0);
    this.rotation = 0;
    this.alpha = 1;
    this.visible = true;
    this.renderable = true;
    this.parent = null;
    this.worldAlpha = 1;
    this.worldTransform = new math.Matrix();
    this.filterArea = null;
    this._sr = 0;
    this._cr = 1;
    this._bounds = new math.Rectangle(0, 0, 1, 1);
    this._currentBounds = null;
    this._mask = null;
  }
  DisplayObject.prototype = Object.create(EventEmitter.prototype);
  DisplayObject.prototype.constructor = DisplayObject;
  module.exports = DisplayObject;
  Object.defineProperties(DisplayObject.prototype, {
    x: {
      get: function() {
        return this.position.x;
      },
      set: function(value) {
        this.position.x = value;
      }
    },
    y: {
      get: function() {
        return this.position.y;
      },
      set: function(value) {
        this.position.y = value;
      }
    },
    worldVisible: {get: function() {
        var item = this;
        do {
          if (!item.visible) {
            return false;
          }
          item = item.parent;
        } while (item);
        return true;
      }},
    mask: {
      get: function() {
        return this._mask;
      },
      set: function(value) {
        if (this._mask) {
          this._mask.renderable = true;
        }
        this._mask = value;
        if (this._mask) {
          this._mask.renderable = false;
        }
      }
    },
    filters: {
      get: function() {
        return this._filters && this._filters.slice();
      },
      set: function(value) {
        this._filters = value && value.slice();
      }
    }
  });
  DisplayObject.prototype.updateTransform = function() {
    var pt = this.parent.worldTransform;
    var wt = this.worldTransform;
    var a,
        b,
        c,
        d,
        tx,
        ty;
    if (this.skew.x || this.skew.y) {
      _tempMatrix.setTransform(this.position.x, this.position.y, this.pivot.x, this.pivot.y, this.scale.x, this.scale.y, this.rotation, this.skew.x, this.skew.y);
      wt.a = _tempMatrix.a * pt.a + _tempMatrix.b * pt.c;
      wt.b = _tempMatrix.a * pt.b + _tempMatrix.b * pt.d;
      wt.c = _tempMatrix.c * pt.a + _tempMatrix.d * pt.c;
      wt.d = _tempMatrix.c * pt.b + _tempMatrix.d * pt.d;
      wt.tx = _tempMatrix.tx * pt.a + _tempMatrix.ty * pt.c + pt.tx;
      wt.ty = _tempMatrix.tx * pt.b + _tempMatrix.ty * pt.d + pt.ty;
    } else {
      if (this.rotation % CONST.PI_2) {
        if (this.rotation !== this.rotationCache) {
          this.rotationCache = this.rotation;
          this._sr = Math.sin(this.rotation);
          this._cr = Math.cos(this.rotation);
        }
        a = this._cr * this.scale.x;
        b = this._sr * this.scale.x;
        c = -this._sr * this.scale.y;
        d = this._cr * this.scale.y;
        tx = this.position.x;
        ty = this.position.y;
        if (this.pivot.x || this.pivot.y) {
          tx -= this.pivot.x * a + this.pivot.y * c;
          ty -= this.pivot.x * b + this.pivot.y * d;
        }
        wt.a = a * pt.a + b * pt.c;
        wt.b = a * pt.b + b * pt.d;
        wt.c = c * pt.a + d * pt.c;
        wt.d = c * pt.b + d * pt.d;
        wt.tx = tx * pt.a + ty * pt.c + pt.tx;
        wt.ty = tx * pt.b + ty * pt.d + pt.ty;
      } else {
        a = this.scale.x;
        d = this.scale.y;
        tx = this.position.x - this.pivot.x * a;
        ty = this.position.y - this.pivot.y * d;
        wt.a = a * pt.a;
        wt.b = a * pt.b;
        wt.c = d * pt.c;
        wt.d = d * pt.d;
        wt.tx = tx * pt.a + ty * pt.c + pt.tx;
        wt.ty = tx * pt.b + ty * pt.d + pt.ty;
      }
    }
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
    this._currentBounds = null;
  };
  DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;
  DisplayObject.prototype.getBounds = function(matrix) {
    return math.Rectangle.EMPTY;
  };
  DisplayObject.prototype.getLocalBounds = function() {
    return this.getBounds(math.Matrix.IDENTITY);
  };
  DisplayObject.prototype.toGlobal = function(position) {
    if (!this.parent) {
      this.parent = _tempDisplayObjectParent;
      this.displayObjectUpdateTransform();
      this.parent = null;
    } else {
      this.displayObjectUpdateTransform();
    }
    return this.worldTransform.apply(position);
  };
  DisplayObject.prototype.toLocal = function(position, from, point) {
    if (from) {
      position = from.toGlobal(position);
    }
    if (!this.parent) {
      this.parent = _tempDisplayObjectParent;
      this.displayObjectUpdateTransform();
      this.parent = null;
    } else {
      this.displayObjectUpdateTransform();
    }
    return this.worldTransform.applyInverse(position, point);
  };
  DisplayObject.prototype.renderWebGL = function(renderer) {};
  DisplayObject.prototype.renderCanvas = function(renderer) {};
  DisplayObject.prototype.generateTexture = function(renderer, scaleMode, resolution) {
    var bounds = this.getLocalBounds();
    var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0, scaleMode, resolution);
    _tempMatrix.tx = -bounds.x;
    _tempMatrix.ty = -bounds.y;
    renderTexture.render(this, _tempMatrix);
    return renderTexture;
  };
  DisplayObject.prototype.setParent = function(container) {
    if (!container || !container.addChild) {
      throw new Error('setParent: Argument must be a Container');
    }
    container.addChild(this);
    return container;
  };
  DisplayObject.prototype.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY) {
    this.position.x = x || 0;
    this.position.y = y || 0;
    this.scale.x = !scaleX ? 1 : scaleX;
    this.scale.y = !scaleY ? 1 : scaleY;
    this.rotation = rotation || 0;
    this.skew.x = skewX || 0;
    this.skew.y = skewY || 0;
    this.pivot.x = pivotX || 0;
    this.pivot.y = pivotY || 0;
    return this;
  };
  DisplayObject.prototype.destroy = function() {
    this.position = null;
    this.scale = null;
    this.pivot = null;
    this.skew = null;
    this.parent = null;
    this._bounds = null;
    this._currentBounds = null;
    this._mask = null;
    this.worldTransform = null;
    this.filterArea = null;
  };
})(require('process'));
