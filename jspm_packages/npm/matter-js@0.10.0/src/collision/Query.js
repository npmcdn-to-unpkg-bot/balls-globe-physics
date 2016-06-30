/* */ 
var Query = {};
module.exports = Query;
var Vector = require('../geometry/Vector');
var SAT = require('./SAT');
var Bounds = require('../geometry/Bounds');
var Bodies = require('../factory/Bodies');
var Vertices = require('../geometry/Vertices');
(function() {
  Query.ray = function(bodies, startPoint, endPoint, rayWidth) {
    rayWidth = rayWidth || 1e-100;
    var rayAngle = Vector.angle(startPoint, endPoint),
        rayLength = Vector.magnitude(Vector.sub(startPoint, endPoint)),
        rayX = (endPoint.x + startPoint.x) * 0.5,
        rayY = (endPoint.y + startPoint.y) * 0.5,
        ray = Bodies.rectangle(rayX, rayY, rayLength, rayWidth, {angle: rayAngle}),
        collisions = [];
    for (var i = 0; i < bodies.length; i++) {
      var bodyA = bodies[i];
      if (Bounds.overlaps(bodyA.bounds, ray.bounds)) {
        for (var j = bodyA.parts.length === 1 ? 0 : 1; j < bodyA.parts.length; j++) {
          var part = bodyA.parts[j];
          if (Bounds.overlaps(part.bounds, ray.bounds)) {
            var collision = SAT.collides(part, ray);
            if (collision.collided) {
              collision.body = collision.bodyA = collision.bodyB = bodyA;
              collisions.push(collision);
              break;
            }
          }
        }
      }
    }
    return collisions;
  };
  Query.region = function(bodies, bounds, outside) {
    var result = [];
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i],
          overlaps = Bounds.overlaps(body.bounds, bounds);
      if ((overlaps && !outside) || (!overlaps && outside))
        result.push(body);
    }
    return result;
  };
  Query.point = function(bodies, point) {
    var result = [];
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      if (Bounds.contains(body.bounds, point)) {
        for (var j = body.parts.length === 1 ? 0 : 1; j < body.parts.length; j++) {
          var part = body.parts[j];
          if (Bounds.contains(part.bounds, point) && Vertices.contains(part.vertices, point)) {
            result.push(body);
            break;
          }
        }
      }
    }
    return result;
  };
})();
