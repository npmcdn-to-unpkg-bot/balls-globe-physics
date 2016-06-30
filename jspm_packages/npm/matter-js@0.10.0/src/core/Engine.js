/* */ 
var Engine = {};
module.exports = Engine;
var World = require('../body/World');
var Sleeping = require('./Sleeping');
var Resolver = require('../collision/Resolver');
var Render = require('../render/Render');
var Pairs = require('../collision/Pairs');
var Metrics = require('./Metrics');
var Grid = require('../collision/Grid');
var Events = require('./Events');
var Composite = require('../body/Composite');
var Constraint = require('../constraint/Constraint');
var Common = require('./Common');
var Body = require('../body/Body');
(function() {
  Engine.create = function(element, options) {
    options = Common.isElement(element) ? options : element;
    element = Common.isElement(element) ? element : null;
    options = options || {};
    if (element || options.render) {
      Common.log('Engine.create: engine.render is deprecated (see docs)', 'warn');
    }
    var defaults = {
      positionIterations: 6,
      velocityIterations: 4,
      constraintIterations: 2,
      enableSleeping: false,
      events: [],
      timing: {
        timestamp: 0,
        timeScale: 1
      },
      broadphase: {controller: Grid}
    };
    var engine = Common.extend(defaults, options);
    if (element || engine.render) {
      var renderDefaults = {
        element: element,
        controller: Render
      };
      engine.render = Common.extend(renderDefaults, engine.render);
    }
    if (engine.render && engine.render.controller) {
      engine.render = engine.render.controller.create(engine.render);
    }
    if (engine.render) {
      engine.render.engine = engine;
    }
    engine.world = options.world || World.create(engine.world);
    engine.pairs = Pairs.create();
    engine.broadphase = engine.broadphase.controller.create(engine.broadphase);
    engine.metrics = engine.metrics || {extended: false};
    engine.metrics = Metrics.create(engine.metrics);
    return engine;
  };
  Engine.update = function(engine, delta, correction) {
    delta = delta || 1000 / 60;
    correction = correction || 1;
    var world = engine.world,
        timing = engine.timing,
        broadphase = engine.broadphase,
        broadphasePairs = [],
        i;
    timing.timestamp += delta * timing.timeScale;
    var event = {timestamp: timing.timestamp};
    Events.trigger(engine, 'beforeUpdate', event);
    var allBodies = Composite.allBodies(world),
        allConstraints = Composite.allConstraints(world);
    Metrics.reset(engine.metrics);
    if (engine.enableSleeping)
      Sleeping.update(allBodies, timing.timeScale);
    _bodiesApplyGravity(allBodies, world.gravity);
    _bodiesUpdate(allBodies, delta, timing.timeScale, correction, world.bounds);
    for (i = 0; i < engine.constraintIterations; i++) {
      Constraint.solveAll(allConstraints, timing.timeScale);
    }
    Constraint.postSolveAll(allBodies);
    if (broadphase.controller) {
      if (world.isModified)
        broadphase.controller.clear(broadphase);
      broadphase.controller.update(broadphase, allBodies, engine, world.isModified);
      broadphasePairs = broadphase.pairsList;
    } else {
      broadphasePairs = allBodies;
    }
    if (world.isModified) {
      Composite.setModified(world, false, false, true);
    }
    var collisions = broadphase.detector(broadphasePairs, engine);
    var pairs = engine.pairs,
        timestamp = timing.timestamp;
    Pairs.update(pairs, collisions, timestamp);
    Pairs.removeOld(pairs, timestamp);
    if (engine.enableSleeping)
      Sleeping.afterCollisions(pairs.list, timing.timeScale);
    if (pairs.collisionStart.length > 0)
      Events.trigger(engine, 'collisionStart', {pairs: pairs.collisionStart});
    Resolver.preSolvePosition(pairs.list);
    for (i = 0; i < engine.positionIterations; i++) {
      Resolver.solvePosition(pairs.list, timing.timeScale);
    }
    Resolver.postSolvePosition(allBodies);
    Resolver.preSolveVelocity(pairs.list);
    for (i = 0; i < engine.velocityIterations; i++) {
      Resolver.solveVelocity(pairs.list, timing.timeScale);
    }
    if (pairs.collisionActive.length > 0)
      Events.trigger(engine, 'collisionActive', {pairs: pairs.collisionActive});
    if (pairs.collisionEnd.length > 0)
      Events.trigger(engine, 'collisionEnd', {pairs: pairs.collisionEnd});
    Metrics.update(engine.metrics, engine);
    _bodiesClearForces(allBodies);
    Events.trigger(engine, 'afterUpdate', event);
    return engine;
  };
  Engine.merge = function(engineA, engineB) {
    Common.extend(engineA, engineB);
    if (engineB.world) {
      engineA.world = engineB.world;
      Engine.clear(engineA);
      var bodies = Composite.allBodies(engineA.world);
      for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        Sleeping.set(body, false);
        body.id = Common.nextId();
      }
    }
  };
  Engine.clear = function(engine) {
    var world = engine.world;
    Pairs.clear(engine.pairs);
    var broadphase = engine.broadphase;
    if (broadphase.controller) {
      var bodies = Composite.allBodies(world);
      broadphase.controller.clear(broadphase);
      broadphase.controller.update(broadphase, bodies, engine, true);
    }
  };
  var _bodiesClearForces = function(bodies) {
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      body.force.x = 0;
      body.force.y = 0;
      body.torque = 0;
    }
  };
  var _bodiesApplyGravity = function(bodies, gravity) {
    var gravityScale = typeof gravity.scale !== 'undefined' ? gravity.scale : 0.001;
    if ((gravity.x === 0 && gravity.y === 0) || gravityScale === 0) {
      return;
    }
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      if (body.isStatic || body.isSleeping)
        continue;
      body.force.y += body.mass * gravity.y * gravityScale;
      body.force.x += body.mass * gravity.x * gravityScale;
    }
  };
  var _bodiesUpdate = function(bodies, deltaTime, timeScale, correction, worldBounds) {
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      if (body.isStatic || body.isSleeping)
        continue;
      Body.update(body, deltaTime, timeScale, correction);
    }
  };
})();
