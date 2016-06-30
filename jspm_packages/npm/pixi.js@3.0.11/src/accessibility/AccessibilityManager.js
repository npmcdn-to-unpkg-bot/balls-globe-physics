/* */ 
var core = require('../core/index');
Object.assign(core.DisplayObject.prototype, require('./accessibleTarget'));
function AccessibilityManager(renderer) {
  var div = document.createElement('div');
  div.style.width = 100 + 'px';
  div.style.height = 100 + 'px';
  div.style.position = 'absolute';
  div.style.top = 0;
  div.style.left = 0;
  div.style.zIndex = 2;
  this.div = div;
  this.pool = [];
  this.renderId = 0;
  this.debug = false;
  this.renderer = renderer;
  this.children = [];
  this._onKeyDown = this._onKeyDown.bind(this);
  this._onMouseMove = this._onMouseMove.bind(this);
  this.isActive = false;
  window.addEventListener('keydown', this._onKeyDown, false);
}
AccessibilityManager.prototype.constructor = AccessibilityManager;
module.exports = AccessibilityManager;
AccessibilityManager.prototype.activate = function() {
  if (this.isActive) {
    return;
  }
  this.isActive = true;
  window.document.addEventListener('mousemove', this._onMouseMove, true);
  window.removeEventListener('keydown', this._onKeyDown, false);
  this.renderer.on('postrender', this.update, this);
  this.renderer.view.parentNode.appendChild(this.div);
};
AccessibilityManager.prototype.deactivate = function() {
  if (!this.isActive) {
    return;
  }
  this.isActive = false;
  window.document.removeEventListener('mousemove', this._onMouseMove);
  window.addEventListener('keydown', this._onKeyDown, false);
  this.renderer.off('postrender', this.update);
  this.div.parentNode.removeChild(this.div);
};
AccessibilityManager.prototype.updateAccessibleObjects = function(displayObject) {
  if (!displayObject.visible) {
    return;
  }
  if (displayObject.accessible && displayObject.interactive) {
    if (!displayObject._accessibleActive) {
      this.addChild(displayObject);
    }
    displayObject.renderId = this.renderId;
  }
  if (displayObject.interactiveChildren) {
    var children = displayObject.children;
    for (var i = children.length - 1; i >= 0; i--) {
      this.updateAccessibleObjects(children[i]);
    }
  }
};
AccessibilityManager.prototype.update = function() {
  this.updateAccessibleObjects(this.renderer._lastObjectRendered);
  var rect = this.renderer.view.getBoundingClientRect();
  var sx = rect.width / this.renderer.width;
  var sy = rect.height / this.renderer.height;
  var div = this.div;
  div.style.left = rect.left + 'px';
  div.style.top = rect.top + 'px';
  div.style.width = this.renderer.width + 'px';
  div.style.height = this.renderer.height + 'px';
  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i];
    if (child.renderId !== this.renderId) {
      child._accessibleActive = false;
      core.utils.removeItems(this.children, i, 1);
      this.div.removeChild(child._accessibleDiv);
      this.pool.push(child._accessibleDiv);
      child._accessibleDiv = null;
      i--;
      if (this.children.length === 0) {
        this.deactivate();
      }
    } else {
      div = child._accessibleDiv;
      var hitArea = child.hitArea;
      var wt = child.worldTransform;
      if (child.hitArea) {
        div.style.left = ((wt.tx + (hitArea.x * wt.a)) * sx) + 'px';
        div.style.top = ((wt.ty + (hitArea.y * wt.d)) * sy) + 'px';
        div.style.width = (hitArea.width * wt.a * sx) + 'px';
        div.style.height = (hitArea.height * wt.d * sy) + 'px';
      } else {
        hitArea = child.getBounds();
        this.capHitArea(hitArea);
        div.style.left = (hitArea.x * sx) + 'px';
        div.style.top = (hitArea.y * sy) + 'px';
        div.style.width = (hitArea.width * sx) + 'px';
        div.style.height = (hitArea.height * sy) + 'px';
      }
    }
  }
  this.renderId++;
};
AccessibilityManager.prototype.capHitArea = function(hitArea) {
  if (hitArea.x < 0) {
    hitArea.width += hitArea.x;
    hitArea.x = 0;
  }
  if (hitArea.y < 0) {
    hitArea.height += hitArea.y;
    hitArea.y = 0;
  }
  if (hitArea.x + hitArea.width > this.renderer.width) {
    hitArea.width = this.renderer.width - hitArea.x;
  }
  if (hitArea.y + hitArea.height > this.renderer.height) {
    hitArea.height = this.renderer.height - hitArea.y;
  }
};
AccessibilityManager.prototype.addChild = function(displayObject) {
  var div = this.pool.pop();
  if (!div) {
    div = document.createElement('button');
    div.style.width = 100 + 'px';
    div.style.height = 100 + 'px';
    div.style.backgroundColor = this.debug ? 'rgba(255,0,0,0.5)' : 'transparent';
    div.style.position = 'absolute';
    div.style.zIndex = 2;
    div.style.borderStyle = 'none';
    div.addEventListener('click', this._onClick.bind(this));
    div.addEventListener('focus', this._onFocus.bind(this));
    div.addEventListener('focusout', this._onFocusOut.bind(this));
  }
  div.title = displayObject.accessibleTitle || 'displayObject ' + this.tabIndex;
  displayObject._accessibleActive = true;
  displayObject._accessibleDiv = div;
  div.displayObject = displayObject;
  this.children.push(displayObject);
  this.div.appendChild(displayObject._accessibleDiv);
  displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
};
AccessibilityManager.prototype._onClick = function(e) {
  var interactionManager = this.renderer.plugins.interaction;
  interactionManager.dispatchEvent(e.target.displayObject, 'click', interactionManager.eventData);
};
AccessibilityManager.prototype._onFocus = function(e) {
  var interactionManager = this.renderer.plugins.interaction;
  interactionManager.dispatchEvent(e.target.displayObject, 'mouseover', interactionManager.eventData);
};
AccessibilityManager.prototype._onFocusOut = function(e) {
  var interactionManager = this.renderer.plugins.interaction;
  interactionManager.dispatchEvent(e.target.displayObject, 'mouseout', interactionManager.eventData);
};
AccessibilityManager.prototype._onKeyDown = function(e) {
  if (e.keyCode !== 9) {
    return;
  }
  this.activate();
};
AccessibilityManager.prototype._onMouseMove = function() {
  this.deactivate();
};
AccessibilityManager.prototype.destroy = function() {
  this.div = null;
  for (var i = 0; i < this.children.length; i++) {
    this.children[i].div = null;
  }
  window.document.removeEventListener('mousemove', this._onMouseMove);
  window.removeEventListener('keydown', this._onKeyDown);
  this.pool = null;
  this.children = null;
  this.renderer = null;
};
core.WebGLRenderer.registerPlugin('accessibility', AccessibilityManager);
core.CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);
