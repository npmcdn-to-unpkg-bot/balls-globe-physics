/* */ 
var Runner = {};
module.exports = Runner;
var Events = require('./Events');
var Engine = require('./Engine');
var Common = require('./Common');
(function() {
  var _requestAnimationFrame,
      _cancelAnimationFrame;
  if (typeof window !== 'undefined') {
    _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
      window.setTimeout(function() {
        callback(Common.now());
      }, 1000 / 60);
    };
    _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
  }
  Runner.create = function(options) {
    var defaults = {
      fps: 60,
      correction: 1,
      deltaSampleSize: 60,
      counterTimestamp: 0,
      frameCounter: 0,
      deltaHistory: [],
      timePrev: null,
      timeScalePrev: 1,
      frameRequestId: null,
      isFixed: false,
      enabled: true
    };
    var runner = Common.extend(defaults, options);
    runner.delta = runner.delta || 1000 / runner.fps;
    runner.deltaMin = runner.deltaMin || 1000 / runner.fps;
    runner.deltaMax = runner.deltaMax || 1000 / (runner.fps * 0.5);
    runner.fps = 1000 / runner.delta;
    return runner;
  };
  Runner.run = function(runner, engine) {
    if (typeof runner.positionIterations !== 'undefined') {
      engine = runner;
      runner = Runner.create();
    }
    (function render(time) {
      runner.frameRequestId = _requestAnimationFrame(render);
      if (time && runner.enabled) {
        Runner.tick(runner, engine, time);
      }
    })();
    return runner;
  };
  Runner.tick = function(runner, engine, time) {
    var timing = engine.timing,
        correction = 1,
        delta;
    var event = {timestamp: timing.timestamp};
    Events.trigger(runner, 'beforeTick', event);
    Events.trigger(engine, 'beforeTick', event);
    if (runner.isFixed) {
      delta = runner.delta;
    } else {
      delta = (time - runner.timePrev) || runner.delta;
      runner.timePrev = time;
      runner.deltaHistory.push(delta);
      runner.deltaHistory = runner.deltaHistory.slice(-runner.deltaSampleSize);
      delta = Math.min.apply(null, runner.deltaHistory);
      delta = delta < runner.deltaMin ? runner.deltaMin : delta;
      delta = delta > runner.deltaMax ? runner.deltaMax : delta;
      correction = delta / runner.delta;
      runner.delta = delta;
    }
    if (runner.timeScalePrev !== 0)
      correction *= timing.timeScale / runner.timeScalePrev;
    if (timing.timeScale === 0)
      correction = 0;
    runner.timeScalePrev = timing.timeScale;
    runner.correction = correction;
    runner.frameCounter += 1;
    if (time - runner.counterTimestamp >= 1000) {
      runner.fps = runner.frameCounter * ((time - runner.counterTimestamp) / 1000);
      runner.counterTimestamp = time;
      runner.frameCounter = 0;
    }
    Events.trigger(runner, 'tick', event);
    Events.trigger(engine, 'tick', event);
    if (engine.world.isModified && engine.render && engine.render.controller && engine.render.controller.clear) {
      engine.render.controller.clear(engine.render);
    }
    Events.trigger(runner, 'beforeUpdate', event);
    Engine.update(engine, delta, correction);
    Events.trigger(runner, 'afterUpdate', event);
    if (engine.render && engine.render.controller) {
      Events.trigger(runner, 'beforeRender', event);
      Events.trigger(engine, 'beforeRender', event);
      engine.render.controller.world(engine.render);
      Events.trigger(runner, 'afterRender', event);
      Events.trigger(engine, 'afterRender', event);
    }
    Events.trigger(runner, 'afterTick', event);
    Events.trigger(engine, 'afterTick', event);
  };
  Runner.stop = function(runner) {
    _cancelAnimationFrame(runner.frameRequestId);
  };
  Runner.start = function(runner, engine) {
    Runner.run(runner, engine);
  };
})();
