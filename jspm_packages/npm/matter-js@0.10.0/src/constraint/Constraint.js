/* */ 
var Constraint = {};
module.exports = Constraint;
var Vertices = require('../geometry/Vertices');
var Vector = require('../geometry/Vector');
var Sleeping = require('../core/Sleeping');
var Bounds = require('../geometry/Bounds');
var Axes = require('../geometry/Axes');
var Common = require('../core/Common');
(function() {
  var _minLength = 0.000001,
      _minDifference = 0.001;
  Constraint.create = function(options) {
    var constraint = options;
    if (constraint.bodyA && !constraint.pointA)
      constraint.pointA = {
        x: 0,
        y: 0
      };
    if (constraint.bodyB && !constraint.pointB)
      constraint.pointB = {
        x: 0,
        y: 0
      };
    var initialPointA = constraint.bodyA ? Vector.add(constraint.bodyA.position, constraint.pointA) : constraint.pointA,
        initialPointB = constraint.bodyB ? Vector.add(constraint.bodyB.position, constraint.pointB) : constraint.pointB,
        length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));
    constraint.length = constraint.length || length || _minLength;
    var render = {
      visible: true,
      lineWidth: 2,
      strokeStyle: '#666'
    };
    constraint.render = Common.extend(render, constraint.render);
    constraint.id = constraint.id || Common.nextId();
    constraint.label = constraint.label || 'Constraint';
    constraint.type = 'constraint';
    constraint.stiffness = constraint.stiffness || 1;
    constraint.angularStiffness = constraint.angularStiffness || 0;
    constraint.angleA = constraint.bodyA ? constraint.bodyA.angle : constraint.angleA;
    constraint.angleB = constraint.bodyB ? constraint.bodyB.angle : constraint.angleB;
    return constraint;
  };
  Constraint.solveAll = function(constraints, timeScale) {
    for (var i = 0; i < constraints.length; i++) {
      Constraint.solve(constraints[i], timeScale);
    }
  };
  Constraint.solve = function(constraint, timeScale) {
    var bodyA = constraint.bodyA,
        bodyB = constraint.bodyB,
        pointA = constraint.pointA,
        pointB = constraint.pointB;
    if (bodyA && !bodyA.isStatic) {
      constraint.pointA = Vector.rotate(pointA, bodyA.angle - constraint.angleA);
      constraint.angleA = bodyA.angle;
    }
    if (bodyB && !bodyB.isStatic) {
      constraint.pointB = Vector.rotate(pointB, bodyB.angle - constraint.angleB);
      constraint.angleB = bodyB.angle;
    }
    var pointAWorld = pointA,
        pointBWorld = pointB;
    if (bodyA)
      pointAWorld = Vector.add(bodyA.position, pointA);
    if (bodyB)
      pointBWorld = Vector.add(bodyB.position, pointB);
    if (!pointAWorld || !pointBWorld)
      return;
    var delta = Vector.sub(pointAWorld, pointBWorld),
        currentLength = Vector.magnitude(delta);
    if (currentLength === 0)
      currentLength = _minLength;
    var difference = (currentLength - constraint.length) / currentLength,
        normal = Vector.div(delta, currentLength),
        force = Vector.mult(delta, difference * 0.5 * constraint.stiffness * timeScale * timeScale);
    if (Math.abs(1 - (currentLength / constraint.length)) < _minDifference * timeScale)
      return;
    var velocityPointA,
        velocityPointB,
        offsetA,
        offsetB,
        oAn,
        oBn,
        bodyADenom,
        bodyBDenom;
    if (bodyA && !bodyA.isStatic) {
      offsetA = {
        x: pointAWorld.x - bodyA.position.x + force.x,
        y: pointAWorld.y - bodyA.position.y + force.y
      };
      bodyA.velocity.x = bodyA.position.x - bodyA.positionPrev.x;
      bodyA.velocity.y = bodyA.position.y - bodyA.positionPrev.y;
      bodyA.angularVelocity = bodyA.angle - bodyA.anglePrev;
      velocityPointA = Vector.add(bodyA.velocity, Vector.mult(Vector.perp(offsetA), bodyA.angularVelocity));
      oAn = Vector.dot(offsetA, normal);
      bodyADenom = bodyA.inverseMass + bodyA.inverseInertia * oAn * oAn;
    } else {
      velocityPointA = {
        x: 0,
        y: 0
      };
      bodyADenom = bodyA ? bodyA.inverseMass : 0;
    }
    if (bodyB && !bodyB.isStatic) {
      offsetB = {
        x: pointBWorld.x - bodyB.position.x - force.x,
        y: pointBWorld.y - bodyB.position.y - force.y
      };
      bodyB.velocity.x = bodyB.position.x - bodyB.positionPrev.x;
      bodyB.velocity.y = bodyB.position.y - bodyB.positionPrev.y;
      bodyB.angularVelocity = bodyB.angle - bodyB.anglePrev;
      velocityPointB = Vector.add(bodyB.velocity, Vector.mult(Vector.perp(offsetB), bodyB.angularVelocity));
      oBn = Vector.dot(offsetB, normal);
      bodyBDenom = bodyB.inverseMass + bodyB.inverseInertia * oBn * oBn;
    } else {
      velocityPointB = {
        x: 0,
        y: 0
      };
      bodyBDenom = bodyB ? bodyB.inverseMass : 0;
    }
    var relativeVelocity = Vector.sub(velocityPointB, velocityPointA),
        normalImpulse = Vector.dot(normal, relativeVelocity) / (bodyADenom + bodyBDenom);
    if (normalImpulse > 0)
      normalImpulse = 0;
    var normalVelocity = {
      x: normal.x * normalImpulse,
      y: normal.y * normalImpulse
    };
    var torque;
    if (bodyA && !bodyA.isStatic) {
      torque = Vector.cross(offsetA, normalVelocity) * bodyA.inverseInertia * (1 - constraint.angularStiffness);
      bodyA.constraintImpulse.x -= force.x;
      bodyA.constraintImpulse.y -= force.y;
      bodyA.constraintImpulse.angle += torque;
      bodyA.position.x -= force.x;
      bodyA.position.y -= force.y;
      bodyA.angle += torque;
    }
    if (bodyB && !bodyB.isStatic) {
      torque = Vector.cross(offsetB, normalVelocity) * bodyB.inverseInertia * (1 - constraint.angularStiffness);
      bodyB.constraintImpulse.x += force.x;
      bodyB.constraintImpulse.y += force.y;
      bodyB.constraintImpulse.angle -= torque;
      bodyB.position.x += force.x;
      bodyB.position.y += force.y;
      bodyB.angle -= torque;
    }
  };
  Constraint.postSolveAll = function(bodies) {
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i],
          impulse = body.constraintImpulse;
      if (impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
        continue;
      }
      Sleeping.set(body, false);
      for (var j = 0; j < body.parts.length; j++) {
        var part = body.parts[j];
        Vertices.translate(part.vertices, impulse);
        if (j > 0) {
          part.position.x += impulse.x;
          part.position.y += impulse.y;
        }
        if (impulse.angle !== 0) {
          Vertices.rotate(part.vertices, impulse.angle, body.position);
          Axes.rotate(part.axes, impulse.angle);
          if (j > 0) {
            Vector.rotateAbout(part.position, impulse.angle, body.position, part.position);
          }
        }
        Bounds.update(part.bounds, part.vertices, body.velocity);
      }
      impulse.angle = 0;
      impulse.x = 0;
      impulse.y = 0;
    }
  };
})();
