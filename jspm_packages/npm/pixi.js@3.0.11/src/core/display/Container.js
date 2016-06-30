/* */ 
var math = require('../math/index'),
    utils = require('../utils/index'),
    DisplayObject = require('./DisplayObject'),
    RenderTexture = require('../textures/RenderTexture'),
    _tempMatrix = new math.Matrix();
function Container() {
  DisplayObject.call(this);
  this.children = [];
}
Container.prototype = Object.create(DisplayObject.prototype);
Container.prototype.constructor = Container;
module.exports = Container;
Object.defineProperties(Container.prototype, {
  width: {
    get: function() {
      return this.scale.x * this.getLocalBounds().width;
    },
    set: function(value) {
      var width = this.getLocalBounds().width;
      if (width !== 0) {
        this.scale.x = value / width;
      } else {
        this.scale.x = 1;
      }
      this._width = value;
    }
  },
  height: {
    get: function() {
      return this.scale.y * this.getLocalBounds().height;
    },
    set: function(value) {
      var height = this.getLocalBounds().height;
      if (height !== 0) {
        this.scale.y = value / height;
      } else {
        this.scale.y = 1;
      }
      this._height = value;
    }
  }
});
Container.prototype.onChildrenChange = function() {};
Container.prototype.addChild = function(child) {
  var argumentsLength = arguments.length;
  if (argumentsLength > 1) {
    for (var i = 0; i < argumentsLength; i++) {
      this.addChild(arguments[i]);
    }
  } else {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.push(child);
    this.onChildrenChange(this.children.length - 1);
    child.emit('added', this);
  }
  return child;
};
Container.prototype.addChildAt = function(child, index) {
  if (index >= 0 && index <= this.children.length) {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.splice(index, 0, child);
    this.onChildrenChange(index);
    child.emit('added', this);
    return child;
  } else {
    throw new Error(child + 'addChildAt: The index ' + index + ' supplied is out of bounds ' + this.children.length);
  }
};
Container.prototype.swapChildren = function(child, child2) {
  if (child === child2) {
    return;
  }
  var index1 = this.getChildIndex(child);
  var index2 = this.getChildIndex(child2);
  if (index1 < 0 || index2 < 0) {
    throw new Error('swapChildren: Both the supplied DisplayObjects must be children of the caller.');
  }
  this.children[index1] = child2;
  this.children[index2] = child;
  this.onChildrenChange(index1 < index2 ? index1 : index2);
};
Container.prototype.getChildIndex = function(child) {
  var index = this.children.indexOf(child);
  if (index === -1) {
    throw new Error('The supplied DisplayObject must be a child of the caller');
  }
  return index;
};
Container.prototype.setChildIndex = function(child, index) {
  if (index < 0 || index >= this.children.length) {
    throw new Error('The supplied index is out of bounds');
  }
  var currentIndex = this.getChildIndex(child);
  utils.removeItems(this.children, currentIndex, 1);
  this.children.splice(index, 0, child);
  this.onChildrenChange(index);
};
Container.prototype.getChildAt = function(index) {
  if (index < 0 || index >= this.children.length) {
    throw new Error('getChildAt: Supplied index ' + index + ' does not exist in the child list, or the supplied DisplayObject is not a child of the caller');
  }
  return this.children[index];
};
Container.prototype.removeChild = function(child) {
  var argumentsLength = arguments.length;
  if (argumentsLength > 1) {
    for (var i = 0; i < argumentsLength; i++) {
      this.removeChild(arguments[i]);
    }
  } else {
    var index = this.children.indexOf(child);
    if (index === -1) {
      return;
    }
    child.parent = null;
    utils.removeItems(this.children, index, 1);
    this.onChildrenChange(index);
    child.emit('removed', this);
  }
  return child;
};
Container.prototype.removeChildAt = function(index) {
  var child = this.getChildAt(index);
  child.parent = null;
  utils.removeItems(this.children, index, 1);
  this.onChildrenChange(index);
  child.emit('removed', this);
  return child;
};
Container.prototype.removeChildren = function(beginIndex, endIndex) {
  var begin = beginIndex || 0;
  var end = typeof endIndex === 'number' ? endIndex : this.children.length;
  var range = end - begin;
  var removed,
      i;
  if (range > 0 && range <= end) {
    removed = this.children.splice(begin, range);
    for (i = 0; i < removed.length; ++i) {
      removed[i].parent = null;
    }
    this.onChildrenChange(beginIndex);
    for (i = 0; i < removed.length; ++i) {
      removed[i].emit('removed', this);
    }
    return removed;
  } else if (range === 0 && this.children.length === 0) {
    return [];
  } else {
    throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
  }
};
Container.prototype.generateTexture = function(renderer, resolution, scaleMode) {
  var bounds = this.getLocalBounds();
  var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0, scaleMode, resolution);
  _tempMatrix.tx = -bounds.x;
  _tempMatrix.ty = -bounds.y;
  renderTexture.render(this, _tempMatrix);
  return renderTexture;
};
Container.prototype.updateTransform = function() {
  if (!this.visible) {
    return;
  }
  this.displayObjectUpdateTransform();
  for (var i = 0,
      j = this.children.length; i < j; ++i) {
    this.children[i].updateTransform();
  }
};
Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;
Container.prototype.getBounds = function() {
  if (!this._currentBounds) {
    if (this.children.length === 0) {
      return math.Rectangle.EMPTY;
    }
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var childBounds;
    var childMaxX;
    var childMaxY;
    var childVisible = false;
    for (var i = 0,
        j = this.children.length; i < j; ++i) {
      var child = this.children[i];
      if (!child.visible) {
        continue;
      }
      childVisible = true;
      childBounds = this.children[i].getBounds();
      minX = minX < childBounds.x ? minX : childBounds.x;
      minY = minY < childBounds.y ? minY : childBounds.y;
      childMaxX = childBounds.width + childBounds.x;
      childMaxY = childBounds.height + childBounds.y;
      maxX = maxX > childMaxX ? maxX : childMaxX;
      maxY = maxY > childMaxY ? maxY : childMaxY;
    }
    if (!childVisible) {
      return math.Rectangle.EMPTY;
    }
    var bounds = this._bounds;
    bounds.x = minX;
    bounds.y = minY;
    bounds.width = maxX - minX;
    bounds.height = maxY - minY;
    this._currentBounds = bounds;
  }
  return this._currentBounds;
};
Container.prototype.containerGetBounds = Container.prototype.getBounds;
Container.prototype.getLocalBounds = function() {
  var matrixCache = this.worldTransform;
  this.worldTransform = math.Matrix.IDENTITY;
  for (var i = 0,
      j = this.children.length; i < j; ++i) {
    this.children[i].updateTransform();
  }
  this.worldTransform = matrixCache;
  this._currentBounds = null;
  return this.getBounds(math.Matrix.IDENTITY);
};
Container.prototype.renderWebGL = function(renderer) {
  if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
    return;
  }
  var i,
      j;
  if (this._mask || this._filters) {
    renderer.currentRenderer.flush();
    if (this._filters && this._filters.length) {
      renderer.filterManager.pushFilter(this, this._filters);
    }
    if (this._mask) {
      renderer.maskManager.pushMask(this, this._mask);
    }
    renderer.currentRenderer.start();
    this._renderWebGL(renderer);
    for (i = 0, j = this.children.length; i < j; i++) {
      this.children[i].renderWebGL(renderer);
    }
    renderer.currentRenderer.flush();
    if (this._mask) {
      renderer.maskManager.popMask(this, this._mask);
    }
    if (this._filters) {
      renderer.filterManager.popFilter();
    }
    renderer.currentRenderer.start();
  } else {
    this._renderWebGL(renderer);
    for (i = 0, j = this.children.length; i < j; ++i) {
      this.children[i].renderWebGL(renderer);
    }
  }
};
Container.prototype._renderWebGL = function(renderer) {};
Container.prototype._renderCanvas = function(renderer) {};
Container.prototype.renderCanvas = function(renderer) {
  if (!this.visible || this.alpha <= 0 || !this.renderable) {
    return;
  }
  if (this._mask) {
    renderer.maskManager.pushMask(this._mask, renderer);
  }
  this._renderCanvas(renderer);
  for (var i = 0,
      j = this.children.length; i < j; ++i) {
    this.children[i].renderCanvas(renderer);
  }
  if (this._mask) {
    renderer.maskManager.popMask(renderer);
  }
};
Container.prototype.destroy = function(destroyChildren) {
  DisplayObject.prototype.destroy.call(this);
  if (destroyChildren) {
    for (var i = 0,
        j = this.children.length; i < j; ++i) {
      this.children[i].destroy(destroyChildren);
    }
  }
  this.removeChildren();
  this.children = null;
};
