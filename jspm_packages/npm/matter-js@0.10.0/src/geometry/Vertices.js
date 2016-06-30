/* */ 
var Vertices = {};
module.exports = Vertices;
var Vector = require('./Vector');
var Common = require('../core/Common');
(function() {
  Vertices.create = function(points, body) {
    var vertices = [];
    for (var i = 0; i < points.length; i++) {
      var point = points[i],
          vertex = {
            x: point.x,
            y: point.y,
            index: i,
            body: body,
            isInternal: false
          };
      vertices.push(vertex);
    }
    return vertices;
  };
  Vertices.fromPath = function(path, body) {
    var pathPattern = /L?\s*([\-\d\.e]+)[\s,]*([\-\d\.e]+)*/ig,
        points = [];
    path.replace(pathPattern, function(match, x, y) {
      points.push({
        x: parseFloat(x),
        y: parseFloat(y)
      });
    });
    return Vertices.create(points, body);
  };
  Vertices.centre = function(vertices) {
    var area = Vertices.area(vertices, true),
        centre = {
          x: 0,
          y: 0
        },
        cross,
        temp,
        j;
    for (var i = 0; i < vertices.length; i++) {
      j = (i + 1) % vertices.length;
      cross = Vector.cross(vertices[i], vertices[j]);
      temp = Vector.mult(Vector.add(vertices[i], vertices[j]), cross);
      centre = Vector.add(centre, temp);
    }
    return Vector.div(centre, 6 * area);
  };
  Vertices.mean = function(vertices) {
    var average = {
      x: 0,
      y: 0
    };
    for (var i = 0; i < vertices.length; i++) {
      average.x += vertices[i].x;
      average.y += vertices[i].y;
    }
    return Vector.div(average, vertices.length);
  };
  Vertices.area = function(vertices, signed) {
    var area = 0,
        j = vertices.length - 1;
    for (var i = 0; i < vertices.length; i++) {
      area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
      j = i;
    }
    if (signed)
      return area / 2;
    return Math.abs(area) / 2;
  };
  Vertices.inertia = function(vertices, mass) {
    var numerator = 0,
        denominator = 0,
        v = vertices,
        cross,
        j;
    for (var n = 0; n < v.length; n++) {
      j = (n + 1) % v.length;
      cross = Math.abs(Vector.cross(v[j], v[n]));
      numerator += cross * (Vector.dot(v[j], v[j]) + Vector.dot(v[j], v[n]) + Vector.dot(v[n], v[n]));
      denominator += cross;
    }
    return (mass / 6) * (numerator / denominator);
  };
  Vertices.translate = function(vertices, vector, scalar) {
    var i;
    if (scalar) {
      for (i = 0; i < vertices.length; i++) {
        vertices[i].x += vector.x * scalar;
        vertices[i].y += vector.y * scalar;
      }
    } else {
      for (i = 0; i < vertices.length; i++) {
        vertices[i].x += vector.x;
        vertices[i].y += vector.y;
      }
    }
    return vertices;
  };
  Vertices.rotate = function(vertices, angle, point) {
    if (angle === 0)
      return;
    var cos = Math.cos(angle),
        sin = Math.sin(angle);
    for (var i = 0; i < vertices.length; i++) {
      var vertice = vertices[i],
          dx = vertice.x - point.x,
          dy = vertice.y - point.y;
      vertice.x = point.x + (dx * cos - dy * sin);
      vertice.y = point.y + (dx * sin + dy * cos);
    }
    return vertices;
  };
  Vertices.contains = function(vertices, point) {
    for (var i = 0; i < vertices.length; i++) {
      var vertice = vertices[i],
          nextVertice = vertices[(i + 1) % vertices.length];
      if ((point.x - vertice.x) * (nextVertice.y - vertice.y) + (point.y - vertice.y) * (vertice.x - nextVertice.x) > 0) {
        return false;
      }
    }
    return true;
  };
  Vertices.scale = function(vertices, scaleX, scaleY, point) {
    if (scaleX === 1 && scaleY === 1)
      return vertices;
    point = point || Vertices.centre(vertices);
    var vertex,
        delta;
    for (var i = 0; i < vertices.length; i++) {
      vertex = vertices[i];
      delta = Vector.sub(vertex, point);
      vertices[i].x = point.x + delta.x * scaleX;
      vertices[i].y = point.y + delta.y * scaleY;
    }
    return vertices;
  };
  Vertices.chamfer = function(vertices, radius, quality, qualityMin, qualityMax) {
    radius = radius || [8];
    if (!radius.length)
      radius = [radius];
    quality = (typeof quality !== 'undefined') ? quality : -1;
    qualityMin = qualityMin || 2;
    qualityMax = qualityMax || 14;
    var newVertices = [];
    for (var i = 0; i < vertices.length; i++) {
      var prevVertex = vertices[i - 1 >= 0 ? i - 1 : vertices.length - 1],
          vertex = vertices[i],
          nextVertex = vertices[(i + 1) % vertices.length],
          currentRadius = radius[i < radius.length ? i : radius.length - 1];
      if (currentRadius === 0) {
        newVertices.push(vertex);
        continue;
      }
      var prevNormal = Vector.normalise({
        x: vertex.y - prevVertex.y,
        y: prevVertex.x - vertex.x
      });
      var nextNormal = Vector.normalise({
        x: nextVertex.y - vertex.y,
        y: vertex.x - nextVertex.x
      });
      var diagonalRadius = Math.sqrt(2 * Math.pow(currentRadius, 2)),
          radiusVector = Vector.mult(Common.clone(prevNormal), currentRadius),
          midNormal = Vector.normalise(Vector.mult(Vector.add(prevNormal, nextNormal), 0.5)),
          scaledVertex = Vector.sub(vertex, Vector.mult(midNormal, diagonalRadius));
      var precision = quality;
      if (quality === -1) {
        precision = Math.pow(currentRadius, 0.32) * 1.75;
      }
      precision = Common.clamp(precision, qualityMin, qualityMax);
      if (precision % 2 === 1)
        precision += 1;
      var alpha = Math.acos(Vector.dot(prevNormal, nextNormal)),
          theta = alpha / precision;
      for (var j = 0; j < precision; j++) {
        newVertices.push(Vector.add(Vector.rotate(radiusVector, theta * j), scaledVertex));
      }
    }
    return newVertices;
  };
  Vertices.clockwiseSort = function(vertices) {
    var centre = Vertices.mean(vertices);
    vertices.sort(function(vertexA, vertexB) {
      return Vector.angle(centre, vertexA) - Vector.angle(centre, vertexB);
    });
    return vertices;
  };
  Vertices.isConvex = function(vertices) {
    var flag = 0,
        n = vertices.length,
        i,
        j,
        k,
        z;
    if (n < 3)
      return null;
    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      k = (i + 2) % n;
      z = (vertices[j].x - vertices[i].x) * (vertices[k].y - vertices[j].y);
      z -= (vertices[j].y - vertices[i].y) * (vertices[k].x - vertices[j].x);
      if (z < 0) {
        flag |= 1;
      } else if (z > 0) {
        flag |= 2;
      }
      if (flag === 3) {
        return false;
      }
    }
    if (flag !== 0) {
      return true;
    } else {
      return null;
    }
  };
  Vertices.hull = function(vertices) {
    var upper = [],
        lower = [],
        vertex,
        i;
    vertices = vertices.slice(0);
    vertices.sort(function(vertexA, vertexB) {
      var dx = vertexA.x - vertexB.x;
      return dx !== 0 ? dx : vertexA.y - vertexB.y;
    });
    for (i = 0; i < vertices.length; i++) {
      vertex = vertices[i];
      while (lower.length >= 2 && Vector.cross3(lower[lower.length - 2], lower[lower.length - 1], vertex) <= 0) {
        lower.pop();
      }
      lower.push(vertex);
    }
    for (i = vertices.length - 1; i >= 0; i--) {
      vertex = vertices[i];
      while (upper.length >= 2 && Vector.cross3(upper[upper.length - 2], upper[upper.length - 1], vertex) <= 0) {
        upper.pop();
      }
      upper.push(vertex);
    }
    upper.pop();
    lower.pop();
    return upper.concat(lower);
  };
})();
