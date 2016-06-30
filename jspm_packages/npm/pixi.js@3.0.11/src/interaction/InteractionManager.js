/* */ 
var core = require('../core/index'),
    InteractionData = require('./InteractionData');
Object.assign(core.DisplayObject.prototype, require('./interactiveTarget'));
function InteractionManager(renderer, options) {
  options = options || {};
  this.renderer = renderer;
  this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;
  this.interactionFrequency = options.interactionFrequency || 10;
  this.mouse = new InteractionData();
  this.eventData = {
    stopped: false,
    target: null,
    type: null,
    data: this.mouse,
    stopPropagation: function() {
      this.stopped = true;
    }
  };
  this.interactiveDataPool = [];
  this.interactionDOMElement = null;
  this.moveWhenInside = false;
  this.eventsAdded = false;
  this.onMouseUp = this.onMouseUp.bind(this);
  this.processMouseUp = this.processMouseUp.bind(this);
  this.onMouseDown = this.onMouseDown.bind(this);
  this.processMouseDown = this.processMouseDown.bind(this);
  this.onMouseMove = this.onMouseMove.bind(this);
  this.processMouseMove = this.processMouseMove.bind(this);
  this.onMouseOut = this.onMouseOut.bind(this);
  this.processMouseOverOut = this.processMouseOverOut.bind(this);
  this.onTouchStart = this.onTouchStart.bind(this);
  this.processTouchStart = this.processTouchStart.bind(this);
  this.onTouchEnd = this.onTouchEnd.bind(this);
  this.processTouchEnd = this.processTouchEnd.bind(this);
  this.onTouchMove = this.onTouchMove.bind(this);
  this.processTouchMove = this.processTouchMove.bind(this);
  this.last = 0;
  this.currentCursorStyle = 'inherit';
  this._tempPoint = new core.Point();
  this.resolution = 1;
  this.setTargetElement(this.renderer.view, this.renderer.resolution);
}
InteractionManager.prototype.constructor = InteractionManager;
module.exports = InteractionManager;
InteractionManager.prototype.setTargetElement = function(element, resolution) {
  this.removeEvents();
  this.interactionDOMElement = element;
  this.resolution = resolution || 1;
  this.addEvents();
};
InteractionManager.prototype.addEvents = function() {
  if (!this.interactionDOMElement) {
    return;
  }
  core.ticker.shared.add(this.update, this);
  if (window.navigator.msPointerEnabled) {
    this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
    this.interactionDOMElement.style['-ms-touch-action'] = 'none';
  }
  window.document.addEventListener('mousemove', this.onMouseMove, true);
  this.interactionDOMElement.addEventListener('mousedown', this.onMouseDown, true);
  this.interactionDOMElement.addEventListener('mouseout', this.onMouseOut, true);
  this.interactionDOMElement.addEventListener('touchstart', this.onTouchStart, true);
  this.interactionDOMElement.addEventListener('touchend', this.onTouchEnd, true);
  this.interactionDOMElement.addEventListener('touchmove', this.onTouchMove, true);
  window.addEventListener('mouseup', this.onMouseUp, true);
  this.eventsAdded = true;
};
InteractionManager.prototype.removeEvents = function() {
  if (!this.interactionDOMElement) {
    return;
  }
  core.ticker.shared.remove(this.update);
  if (window.navigator.msPointerEnabled) {
    this.interactionDOMElement.style['-ms-content-zooming'] = '';
    this.interactionDOMElement.style['-ms-touch-action'] = '';
  }
  window.document.removeEventListener('mousemove', this.onMouseMove, true);
  this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
  this.interactionDOMElement.removeEventListener('mouseout', this.onMouseOut, true);
  this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
  this.interactionDOMElement.removeEventListener('touchend', this.onTouchEnd, true);
  this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);
  this.interactionDOMElement = null;
  window.removeEventListener('mouseup', this.onMouseUp, true);
  this.eventsAdded = false;
};
InteractionManager.prototype.update = function(deltaTime) {
  this._deltaTime += deltaTime;
  if (this._deltaTime < this.interactionFrequency) {
    return;
  }
  this._deltaTime = 0;
  if (!this.interactionDOMElement) {
    return;
  }
  if (this.didMove) {
    this.didMove = false;
    return;
  }
  this.cursor = 'inherit';
  this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, true);
  if (this.currentCursorStyle !== this.cursor) {
    this.currentCursorStyle = this.cursor;
    this.interactionDOMElement.style.cursor = this.cursor;
  }
};
InteractionManager.prototype.dispatchEvent = function(displayObject, eventString, eventData) {
  if (!eventData.stopped) {
    eventData.target = displayObject;
    eventData.type = eventString;
    displayObject.emit(eventString, eventData);
    if (displayObject[eventString]) {
      displayObject[eventString](eventData);
    }
  }
};
InteractionManager.prototype.mapPositionToPoint = function(point, x, y) {
  var rect = this.interactionDOMElement.getBoundingClientRect();
  point.x = ((x - rect.left) * (this.interactionDOMElement.width / rect.width)) / this.resolution;
  point.y = ((y - rect.top) * (this.interactionDOMElement.height / rect.height)) / this.resolution;
};
InteractionManager.prototype.processInteractive = function(point, displayObject, func, hitTest, interactive) {
  if (!displayObject || !displayObject.visible) {
    return false;
  }
  var hit = false,
      interactiveParent = interactive = displayObject.interactive || interactive;
  if (displayObject.hitArea) {
    interactiveParent = false;
  }
  if (displayObject.interactiveChildren) {
    var children = displayObject.children;
    for (var i = children.length - 1; i >= 0; i--) {
      var child = children[i];
      if (this.processInteractive(point, child, func, hitTest, interactiveParent)) {
        if (!child.parent) {
          continue;
        }
        hit = true;
        interactiveParent = false;
        hitTest = false;
      }
    }
  }
  if (interactive) {
    if (hitTest && !hit) {
      if (displayObject.hitArea) {
        displayObject.worldTransform.applyInverse(point, this._tempPoint);
        hit = displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y);
      } else if (displayObject.containsPoint) {
        hit = displayObject.containsPoint(point);
      }
    }
    if (displayObject.interactive) {
      func(displayObject, hit);
    }
  }
  return hit;
};
InteractionManager.prototype.onMouseDown = function(event) {
  this.mouse.originalEvent = event;
  this.eventData.data = this.mouse;
  this.eventData.stopped = false;
  this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
  if (this.autoPreventDefault) {
    this.mouse.originalEvent.preventDefault();
  }
  this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, true);
};
InteractionManager.prototype.processMouseDown = function(displayObject, hit) {
  var e = this.mouse.originalEvent;
  var isRightButton = e.button === 2 || e.which === 3;
  if (hit) {
    displayObject[isRightButton ? '_isRightDown' : '_isLeftDown'] = true;
    this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', this.eventData);
  }
};
InteractionManager.prototype.onMouseUp = function(event) {
  this.mouse.originalEvent = event;
  this.eventData.data = this.mouse;
  this.eventData.stopped = false;
  this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
  this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseUp, true);
};
InteractionManager.prototype.processMouseUp = function(displayObject, hit) {
  var e = this.mouse.originalEvent;
  var isRightButton = e.button === 2 || e.which === 3;
  var isDown = isRightButton ? '_isRightDown' : '_isLeftDown';
  if (hit) {
    this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', this.eventData);
    if (displayObject[isDown]) {
      displayObject[isDown] = false;
      this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', this.eventData);
    }
  } else {
    if (displayObject[isDown]) {
      displayObject[isDown] = false;
      this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', this.eventData);
    }
  }
};
InteractionManager.prototype.onMouseMove = function(event) {
  this.mouse.originalEvent = event;
  this.eventData.data = this.mouse;
  this.eventData.stopped = false;
  this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
  this.didMove = true;
  this.cursor = 'inherit';
  this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, true);
  if (this.currentCursorStyle !== this.cursor) {
    this.currentCursorStyle = this.cursor;
    this.interactionDOMElement.style.cursor = this.cursor;
  }
};
InteractionManager.prototype.processMouseMove = function(displayObject, hit) {
  this.processMouseOverOut(displayObject, hit);
  if (!this.moveWhenInside || hit) {
    this.dispatchEvent(displayObject, 'mousemove', this.eventData);
  }
};
InteractionManager.prototype.onMouseOut = function(event) {
  this.mouse.originalEvent = event;
  this.eventData.stopped = false;
  this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
  this.interactionDOMElement.style.cursor = 'inherit';
  this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
  this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, false);
};
InteractionManager.prototype.processMouseOverOut = function(displayObject, hit) {
  if (hit) {
    if (!displayObject._over) {
      displayObject._over = true;
      this.dispatchEvent(displayObject, 'mouseover', this.eventData);
    }
    if (displayObject.buttonMode) {
      this.cursor = displayObject.defaultCursor;
    }
  } else {
    if (displayObject._over) {
      displayObject._over = false;
      this.dispatchEvent(displayObject, 'mouseout', this.eventData);
    }
  }
};
InteractionManager.prototype.onTouchStart = function(event) {
  if (this.autoPreventDefault) {
    event.preventDefault();
  }
  var changedTouches = event.changedTouches;
  var cLength = changedTouches.length;
  for (var i = 0; i < cLength; i++) {
    var touchEvent = changedTouches[i];
    var touchData = this.getTouchData(touchEvent);
    touchData.originalEvent = event;
    this.eventData.data = touchData;
    this.eventData.stopped = false;
    this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchStart, true);
    this.returnTouchData(touchData);
  }
};
InteractionManager.prototype.processTouchStart = function(displayObject, hit) {
  if (hit) {
    displayObject._touchDown = true;
    this.dispatchEvent(displayObject, 'touchstart', this.eventData);
  }
};
InteractionManager.prototype.onTouchEnd = function(event) {
  if (this.autoPreventDefault) {
    event.preventDefault();
  }
  var changedTouches = event.changedTouches;
  var cLength = changedTouches.length;
  for (var i = 0; i < cLength; i++) {
    var touchEvent = changedTouches[i];
    var touchData = this.getTouchData(touchEvent);
    touchData.originalEvent = event;
    this.eventData.data = touchData;
    this.eventData.stopped = false;
    this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchEnd, true);
    this.returnTouchData(touchData);
  }
};
InteractionManager.prototype.processTouchEnd = function(displayObject, hit) {
  if (hit) {
    this.dispatchEvent(displayObject, 'touchend', this.eventData);
    if (displayObject._touchDown) {
      displayObject._touchDown = false;
      this.dispatchEvent(displayObject, 'tap', this.eventData);
    }
  } else {
    if (displayObject._touchDown) {
      displayObject._touchDown = false;
      this.dispatchEvent(displayObject, 'touchendoutside', this.eventData);
    }
  }
};
InteractionManager.prototype.onTouchMove = function(event) {
  if (this.autoPreventDefault) {
    event.preventDefault();
  }
  var changedTouches = event.changedTouches;
  var cLength = changedTouches.length;
  for (var i = 0; i < cLength; i++) {
    var touchEvent = changedTouches[i];
    var touchData = this.getTouchData(touchEvent);
    touchData.originalEvent = event;
    this.eventData.data = touchData;
    this.eventData.stopped = false;
    this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchMove, this.moveWhenInside);
    this.returnTouchData(touchData);
  }
};
InteractionManager.prototype.processTouchMove = function(displayObject, hit) {
  if (!this.moveWhenInside || hit) {
    this.dispatchEvent(displayObject, 'touchmove', this.eventData);
  }
};
InteractionManager.prototype.getTouchData = function(touchEvent) {
  var touchData = this.interactiveDataPool.pop();
  if (!touchData) {
    touchData = new InteractionData();
  }
  touchData.identifier = touchEvent.identifier;
  this.mapPositionToPoint(touchData.global, touchEvent.clientX, touchEvent.clientY);
  if (navigator.isCocoonJS) {
    touchData.global.x = touchData.global.x / this.resolution;
    touchData.global.y = touchData.global.y / this.resolution;
  }
  touchEvent.globalX = touchData.global.x;
  touchEvent.globalY = touchData.global.y;
  return touchData;
};
InteractionManager.prototype.returnTouchData = function(touchData) {
  this.interactiveDataPool.push(touchData);
};
InteractionManager.prototype.destroy = function() {
  this.removeEvents();
  this.renderer = null;
  this.mouse = null;
  this.eventData = null;
  this.interactiveDataPool = null;
  this.interactionDOMElement = null;
  this.onMouseUp = null;
  this.processMouseUp = null;
  this.onMouseDown = null;
  this.processMouseDown = null;
  this.onMouseMove = null;
  this.processMouseMove = null;
  this.onMouseOut = null;
  this.processMouseOverOut = null;
  this.onTouchStart = null;
  this.processTouchStart = null;
  this.onTouchEnd = null;
  this.processTouchEnd = null;
  this.onTouchMove = null;
  this.processTouchMove = null;
  this._tempPoint = null;
};
core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
core.CanvasRenderer.registerPlugin('interaction', InteractionManager);
