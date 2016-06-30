/* */ 
var MouseConstraint = {};
module.exports = MouseConstraint;
var Vertices = require('../geometry/Vertices');
var Sleeping = require('../core/Sleeping');
var Mouse = require('../core/Mouse');
var Events = require('../core/Events');
var Detector = require('../collision/Detector');
var Constraint = require('./Constraint');
var Composite = require('../body/Composite');
var Common = require('../core/Common');
var Bounds = require('../geometry/Bounds');
(function() {
  MouseConstraint.create = function(engine, options) {
    var mouse = (engine ? engine.mouse : null) || (options ? options.mouse : null);
    if (!mouse) {
      if (engine && engine.render && engine.render.canvas) {
        mouse = Mouse.create(engine.render.canvas);
      } else if (options && options.element) {
        mouse = Mouse.create(options.element);
      } else {
        mouse = Mouse.create();
        Common.log('MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected', 'warn');
      }
    }
    var constraint = Constraint.create({
      label: 'Mouse Constraint',
      pointA: mouse.position,
      pointB: {
        x: 0,
        y: 0
      },
      length: 0.01,
      stiffness: 0.1,
      angularStiffness: 1,
      render: {
        strokeStyle: '#90EE90',
        lineWidth: 3
      }
    });
    var defaults = {
      type: 'mouseConstraint',
      mouse: mouse,
      element: null,
      body: null,
      constraint: constraint,
      collisionFilter: {
        category: 0x0001,
        mask: 0xFFFFFFFF,
        group: 0
      }
    };
    var mouseConstraint = Common.extend(defaults, options);
    Events.on(engine, 'tick', function() {
      var allBodies = Composite.allBodies(engine.world);
      MouseConstraint.update(mouseConstraint, allBodies);
      _triggerEvents(mouseConstraint);
    });
    return mouseConstraint;
  };
  MouseConstraint.update = function(mouseConstraint, bodies) {
    var mouse = mouseConstraint.mouse,
        constraint = mouseConstraint.constraint,
        body = mouseConstraint.body;
    if (mouse.button === 0) {
      if (!constraint.bodyB) {
        for (var i = 0; i < bodies.length; i++) {
          body = bodies[i];
          if (Bounds.contains(body.bounds, mouse.position) && Detector.canCollide(body.collisionFilter, mouseConstraint.collisionFilter)) {
            for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
              var part = body.parts[j];
              if (Vertices.contains(part.vertices, mouse.position)) {
                constraint.pointA = mouse.position;
                constraint.bodyB = mouseConstraint.body = body;
                constraint.pointB = {
                  x: mouse.position.x - body.position.x,
                  y: mouse.position.y - body.position.y
                };
                constraint.angleB = body.angle;
                Sleeping.set(body, false);
                Events.trigger(mouseConstraint, 'startdrag', {
                  mouse: mouse,
                  body: body
                });
                break;
              }
            }
          }
        }
      } else {
        Sleeping.set(constraint.bodyB, false);
        constraint.pointA = mouse.position;
      }
    } else {
      constraint.bodyB = mouseConstraint.body = null;
      constraint.pointB = null;
      if (body)
        Events.trigger(mouseConstraint, 'enddrag', {
          mouse: mouse,
          body: body
        });
    }
  };
  var _triggerEvents = function(mouseConstraint) {
    var mouse = mouseConstraint.mouse,
        mouseEvents = mouse.sourceEvents;
    if (mouseEvents.mousemove)
      Events.trigger(mouseConstraint, 'mousemove', {mouse: mouse});
    if (mouseEvents.mousedown)
      Events.trigger(mouseConstraint, 'mousedown', {mouse: mouse});
    if (mouseEvents.mouseup)
      Events.trigger(mouseConstraint, 'mouseup', {mouse: mouse});
    Mouse.clearSourceEvents(mouse);
  };
})();
