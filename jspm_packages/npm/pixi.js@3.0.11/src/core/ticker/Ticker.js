/* */ 
var CONST = require('../const'),
    EventEmitter = require('eventemitter3'),
    TICK = 'tick';
function Ticker() {
  var _this = this;
  this._tick = function _tick(time) {
    _this._requestId = null;
    if (_this.started) {
      _this.update(time);
      if (_this.started && _this._requestId === null && _this._emitter.listeners(TICK, true)) {
        _this._requestId = requestAnimationFrame(_this._tick);
      }
    }
  };
  this._emitter = new EventEmitter();
  this._requestId = null;
  this._maxElapsedMS = 100;
  this.autoStart = false;
  this.deltaTime = 1;
  this.elapsedMS = 1 / CONST.TARGET_FPMS;
  this.lastTime = 0;
  this.speed = 1;
  this.started = false;
}
Object.defineProperties(Ticker.prototype, {
  FPS: {get: function() {
      return 1000 / this.elapsedMS;
    }},
  minFPS: {
    get: function() {
      return 1000 / this._maxElapsedMS;
    },
    set: function(fps) {
      var minFPMS = Math.min(Math.max(0, fps) / 1000, CONST.TARGET_FPMS);
      this._maxElapsedMS = 1 / minFPMS;
    }
  }
});
Ticker.prototype._requestIfNeeded = function _requestIfNeeded() {
  if (this._requestId === null && this._emitter.listeners(TICK, true)) {
    this.lastTime = performance.now();
    this._requestId = requestAnimationFrame(this._tick);
  }
};
Ticker.prototype._cancelIfNeeded = function _cancelIfNeeded() {
  if (this._requestId !== null) {
    cancelAnimationFrame(this._requestId);
    this._requestId = null;
  }
};
Ticker.prototype._startIfPossible = function _startIfPossible() {
  if (this.started) {
    this._requestIfNeeded();
  } else if (this.autoStart) {
    this.start();
  }
};
Ticker.prototype.add = function add(fn, context) {
  this._emitter.on(TICK, fn, context);
  this._startIfPossible();
  return this;
};
Ticker.prototype.addOnce = function addOnce(fn, context) {
  this._emitter.once(TICK, fn, context);
  this._startIfPossible();
  return this;
};
Ticker.prototype.remove = function remove(fn, context) {
  this._emitter.off(TICK, fn, context);
  if (!this._emitter.listeners(TICK, true)) {
    this._cancelIfNeeded();
  }
  return this;
};
Ticker.prototype.start = function start() {
  if (!this.started) {
    this.started = true;
    this._requestIfNeeded();
  }
};
Ticker.prototype.stop = function stop() {
  if (this.started) {
    this.started = false;
    this._cancelIfNeeded();
  }
};
Ticker.prototype.update = function update(currentTime) {
  var elapsedMS;
  currentTime = currentTime || performance.now();
  elapsedMS = this.elapsedMS = currentTime - this.lastTime;
  if (elapsedMS > this._maxElapsedMS) {
    elapsedMS = this._maxElapsedMS;
  }
  this.deltaTime = elapsedMS * CONST.TARGET_FPMS * this.speed;
  this._emitter.emit(TICK, this.deltaTime);
  this.lastTime = currentTime;
};
module.exports = Ticker;
