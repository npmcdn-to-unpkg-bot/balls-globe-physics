/* */ 
var core = require('../core/index'),
    DisplayObject = core.DisplayObject,
    _tempMatrix = new core.Matrix();
DisplayObject.prototype._cacheAsBitmap = false;
DisplayObject.prototype._originalRenderWebGL = null;
DisplayObject.prototype._originalRenderCanvas = null;
DisplayObject.prototype._originalUpdateTransform = null;
DisplayObject.prototype._originalHitTest = null;
DisplayObject.prototype._originalDestroy = null;
DisplayObject.prototype._cachedSprite = null;
Object.defineProperties(DisplayObject.prototype, {cacheAsBitmap: {
    get: function() {
      return this._cacheAsBitmap;
    },
    set: function(value) {
      if (this._cacheAsBitmap === value) {
        return;
      }
      this._cacheAsBitmap = value;
      if (value) {
        this._originalRenderWebGL = this.renderWebGL;
        this._originalRenderCanvas = this.renderCanvas;
        this._originalUpdateTransform = this.updateTransform;
        this._originalGetBounds = this.getBounds;
        this._originalDestroy = this.destroy;
        this._originalContainsPoint = this.containsPoint;
        this.renderWebGL = this._renderCachedWebGL;
        this.renderCanvas = this._renderCachedCanvas;
        this.destroy = this._cacheAsBitmapDestroy;
      } else {
        if (this._cachedSprite) {
          this._destroyCachedDisplayObject();
        }
        this.renderWebGL = this._originalRenderWebGL;
        this.renderCanvas = this._originalRenderCanvas;
        this.getBounds = this._originalGetBounds;
        this.destroy = this._originalDestroy;
        this.updateTransform = this._originalUpdateTransform;
        this.containsPoint = this._originalContainsPoint;
      }
    }
  }});
DisplayObject.prototype._renderCachedWebGL = function(renderer) {
  if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
    return;
  }
  this._initCachedDisplayObject(renderer);
  this._cachedSprite.worldAlpha = this.worldAlpha;
  renderer.setObjectRenderer(renderer.plugins.sprite);
  renderer.plugins.sprite.render(this._cachedSprite);
};
DisplayObject.prototype._initCachedDisplayObject = function(renderer) {
  if (this._cachedSprite) {
    return;
  }
  renderer.currentRenderer.flush();
  var bounds = this.getLocalBounds().clone();
  if (this._filters) {
    var padding = this._filters[0].padding;
    bounds.x -= padding;
    bounds.y -= padding;
    bounds.width += padding * 2;
    bounds.height += padding * 2;
  }
  var cachedRenderTarget = renderer.currentRenderTarget;
  var stack = renderer.filterManager.filterStack;
  var renderTexture = new core.RenderTexture(renderer, bounds.width | 0, bounds.height | 0);
  var m = _tempMatrix;
  m.tx = -bounds.x;
  m.ty = -bounds.y;
  this.renderWebGL = this._originalRenderWebGL;
  renderTexture.render(this, m, true, true);
  renderer.setRenderTarget(cachedRenderTarget);
  renderer.filterManager.filterStack = stack;
  this.renderWebGL = this._renderCachedWebGL;
  this.updateTransform = this.displayObjectUpdateTransform;
  this.getBounds = this._getCachedBounds;
  this._cachedSprite = new core.Sprite(renderTexture);
  this._cachedSprite.worldTransform = this.worldTransform;
  this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
  this._cachedSprite.anchor.y = -(bounds.y / bounds.height);
  this.updateTransform();
  this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
};
DisplayObject.prototype._renderCachedCanvas = function(renderer) {
  if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
    return;
  }
  this._initCachedDisplayObjectCanvas(renderer);
  this._cachedSprite.worldAlpha = this.worldAlpha;
  this._cachedSprite.renderCanvas(renderer);
};
DisplayObject.prototype._initCachedDisplayObjectCanvas = function(renderer) {
  if (this._cachedSprite) {
    return;
  }
  var bounds = this.getLocalBounds();
  var cachedRenderTarget = renderer.context;
  var renderTexture = new core.RenderTexture(renderer, bounds.width | 0, bounds.height | 0);
  var m = _tempMatrix;
  m.tx = -bounds.x;
  m.ty = -bounds.y;
  this.renderCanvas = this._originalRenderCanvas;
  renderTexture.render(this, m, true);
  renderer.context = cachedRenderTarget;
  this.renderCanvas = this._renderCachedCanvas;
  this.updateTransform = this.displayObjectUpdateTransform;
  this.getBounds = this._getCachedBounds;
  this._cachedSprite = new core.Sprite(renderTexture);
  this._cachedSprite.worldTransform = this.worldTransform;
  this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
  this._cachedSprite.anchor.y = -(bounds.y / bounds.height);
  this.updateTransform();
  this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
};
DisplayObject.prototype._getCachedBounds = function() {
  this._cachedSprite._currentBounds = null;
  return this._cachedSprite.getBounds();
};
DisplayObject.prototype._destroyCachedDisplayObject = function() {
  this._cachedSprite._texture.destroy();
  this._cachedSprite = null;
};
DisplayObject.prototype._cacheAsBitmapDestroy = function() {
  this.cacheAsBitmap = false;
  this._originalDestroy();
};
