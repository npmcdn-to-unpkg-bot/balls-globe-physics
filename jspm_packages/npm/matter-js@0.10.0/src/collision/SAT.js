/* */ 
var SAT = {};
module.exports = SAT;
var Vertices = require('../geometry/Vertices');
var Vector = require('../geometry/Vector');
(function() {
  SAT.collides = function(bodyA, bodyB, previousCollision) {
    var overlapAB,
        overlapBA,
        minOverlap,
        collision,
        prevCol = previousCollision,
        canReusePrevCol = false;
    if (prevCol) {
      var parentA = bodyA.parent,
          parentB = bodyB.parent,
          motion = parentA.speed * parentA.speed + parentA.angularSpeed * parentA.angularSpeed + parentB.speed * parentB.speed + parentB.angularSpeed * parentB.angularSpeed;
      canReusePrevCol = prevCol && prevCol.collided && motion < 0.2;
      collision = prevCol;
    } else {
      collision = {
        collided: false,
        bodyA: bodyA,
        bodyB: bodyB
      };
    }
    if (prevCol && canReusePrevCol) {
      var axisBodyA = collision.axisBody,
          axisBodyB = axisBodyA === bodyA ? bodyB : bodyA,
          axes = [axisBodyA.axes[prevCol.axisNumber]];
      minOverlap = _overlapAxes(axisBodyA.vertices, axisBodyB.vertices, axes);
      collision.reused = true;
      if (minOverlap.overlap <= 0) {
        collision.collided = false;
        return collision;
      }
    } else {
      overlapAB = _overlapAxes(bodyA.vertices, bodyB.vertices, bodyA.axes);
      if (overlapAB.overlap <= 0) {
        collision.collided = false;
        return collision;
      }
      overlapBA = _overlapAxes(bodyB.vertices, bodyA.vertices, bodyB.axes);
      if (overlapBA.overlap <= 0) {
        collision.collided = false;
        return collision;
      }
      if (overlapAB.overlap < overlapBA.overlap) {
        minOverlap = overlapAB;
        collision.axisBody = bodyA;
      } else {
        minOverlap = overlapBA;
        collision.axisBody = bodyB;
      }
      collision.axisNumber = minOverlap.axisNumber;
    }
    collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
    collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
    collision.collided = true;
    collision.normal = minOverlap.axis;
    collision.depth = minOverlap.overlap;
    collision.parentA = collision.bodyA.parent;
    collision.parentB = collision.bodyB.parent;
    bodyA = collision.bodyA;
    bodyB = collision.bodyB;
    if (Vector.dot(collision.normal, Vector.sub(bodyB.position, bodyA.position)) > 0)
      collision.normal = Vector.neg(collision.normal);
    collision.tangent = Vector.perp(collision.normal);
    collision.penetration = {
      x: collision.normal.x * collision.depth,
      y: collision.normal.y * collision.depth
    };
    var verticesB = _findSupports(bodyA, bodyB, collision.normal),
        supports = collision.supports || [];
    supports.length = 0;
    if (Vertices.contains(bodyA.vertices, verticesB[0]))
      supports.push(verticesB[0]);
    if (Vertices.contains(bodyA.vertices, verticesB[1]))
      supports.push(verticesB[1]);
    if (supports.length < 2) {
      var verticesA = _findSupports(bodyB, bodyA, Vector.neg(collision.normal));
      if (Vertices.contains(bodyB.vertices, verticesA[0]))
        supports.push(verticesA[0]);
      if (supports.length < 2 && Vertices.contains(bodyB.vertices, verticesA[1]))
        supports.push(verticesA[1]);
    }
    if (supports.length < 1)
      supports = [verticesB[0]];
    collision.supports = supports;
    return collision;
  };
  var _overlapAxes = function(verticesA, verticesB, axes) {
    var projectionA = Vector._temp[0],
        projectionB = Vector._temp[1],
        result = {overlap: Number.MAX_VALUE},
        overlap,
        axis;
    for (var i = 0; i < axes.length; i++) {
      axis = axes[i];
      _projectToAxis(projectionA, verticesA, axis);
      _projectToAxis(projectionB, verticesB, axis);
      overlap = Math.min(projectionA.max - projectionB.min, projectionB.max - projectionA.min);
      if (overlap <= 0) {
        result.overlap = overlap;
        return result;
      }
      if (overlap < result.overlap) {
        result.overlap = overlap;
        result.axis = axis;
        result.axisNumber = i;
      }
    }
    return result;
  };
  var _projectToAxis = function(projection, vertices, axis) {
    var min = Vector.dot(vertices[0], axis),
        max = min;
    for (var i = 1; i < vertices.length; i += 1) {
      var dot = Vector.dot(vertices[i], axis);
      if (dot > max) {
        max = dot;
      } else if (dot < min) {
        min = dot;
      }
    }
    projection.min = min;
    projection.max = max;
  };
  var _findSupports = function(bodyA, bodyB, normal) {
    var nearestDistance = Number.MAX_VALUE,
        vertexToBody = Vector._temp[0],
        vertices = bodyB.vertices,
        bodyAPosition = bodyA.position,
        distance,
        vertex,
        vertexA,
        vertexB;
    for (var i = 0; i < vertices.length; i++) {
      vertex = vertices[i];
      vertexToBody.x = vertex.x - bodyAPosition.x;
      vertexToBody.y = vertex.y - bodyAPosition.y;
      distance = -Vector.dot(normal, vertexToBody);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        vertexA = vertex;
      }
    }
    var prevIndex = vertexA.index - 1 >= 0 ? vertexA.index - 1 : vertices.length - 1;
    vertex = vertices[prevIndex];
    vertexToBody.x = vertex.x - bodyAPosition.x;
    vertexToBody.y = vertex.y - bodyAPosition.y;
    nearestDistance = -Vector.dot(normal, vertexToBody);
    vertexB = vertex;
    var nextIndex = (vertexA.index + 1) % vertices.length;
    vertex = vertices[nextIndex];
    vertexToBody.x = vertex.x - bodyAPosition.x;
    vertexToBody.y = vertex.y - bodyAPosition.y;
    distance = -Vector.dot(normal, vertexToBody);
    if (distance < nearestDistance) {
      vertexB = vertex;
    }
    return [vertexA, vertexB];
  };
})();
