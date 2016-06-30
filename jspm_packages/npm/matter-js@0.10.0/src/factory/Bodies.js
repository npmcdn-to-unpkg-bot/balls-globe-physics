/* */ 
(function(process) {
  var Bodies = {};
  module.exports = Bodies;
  var Vertices = require('../geometry/Vertices');
  var Common = require('../core/Common');
  var Body = require('../body/Body');
  var Bounds = require('../geometry/Bounds');
  var Vector = require('../geometry/Vector');
  (function() {
    Bodies.rectangle = function(x, y, width, height, options) {
      options = options || {};
      var rectangle = {
        label: 'Rectangle Body',
        position: {
          x: x,
          y: y
        },
        vertices: Vertices.fromPath('L 0 0 L ' + width + ' 0 L ' + width + ' ' + height + ' L 0 ' + height)
      };
      if (options.chamfer) {
        var chamfer = options.chamfer;
        rectangle.vertices = Vertices.chamfer(rectangle.vertices, chamfer.radius, chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
        delete options.chamfer;
      }
      return Body.create(Common.extend({}, rectangle, options));
    };
    Bodies.trapezoid = function(x, y, width, height, slope, options) {
      options = options || {};
      slope *= 0.5;
      var roof = (1 - (slope * 2)) * width;
      var x1 = width * slope,
          x2 = x1 + roof,
          x3 = x2 + x1,
          verticesPath;
      if (slope < 0.5) {
        verticesPath = 'L 0 0 L ' + x1 + ' ' + (-height) + ' L ' + x2 + ' ' + (-height) + ' L ' + x3 + ' 0';
      } else {
        verticesPath = 'L 0 0 L ' + x2 + ' ' + (-height) + ' L ' + x3 + ' 0';
      }
      var trapezoid = {
        label: 'Trapezoid Body',
        position: {
          x: x,
          y: y
        },
        vertices: Vertices.fromPath(verticesPath)
      };
      if (options.chamfer) {
        var chamfer = options.chamfer;
        trapezoid.vertices = Vertices.chamfer(trapezoid.vertices, chamfer.radius, chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
        delete options.chamfer;
      }
      return Body.create(Common.extend({}, trapezoid, options));
    };
    Bodies.circle = function(x, y, radius, options, maxSides) {
      options = options || {};
      var circle = {
        label: 'Circle Body',
        circleRadius: radius
      };
      maxSides = maxSides || 25;
      var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));
      if (sides % 2 === 1)
        sides += 1;
      return Bodies.polygon(x, y, sides, radius, Common.extend({}, circle, options));
    };
    Bodies.polygon = function(x, y, sides, radius, options) {
      options = options || {};
      if (sides < 3)
        return Bodies.circle(x, y, radius, options);
      var theta = 2 * Math.PI / sides,
          path = '',
          offset = theta * 0.5;
      for (var i = 0; i < sides; i += 1) {
        var angle = offset + (i * theta),
            xx = Math.cos(angle) * radius,
            yy = Math.sin(angle) * radius;
        path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
      }
      var polygon = {
        label: 'Polygon Body',
        position: {
          x: x,
          y: y
        },
        vertices: Vertices.fromPath(path)
      };
      if (options.chamfer) {
        var chamfer = options.chamfer;
        polygon.vertices = Vertices.chamfer(polygon.vertices, chamfer.radius, chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
        delete options.chamfer;
      }
      return Body.create(Common.extend({}, polygon, options));
    };
    Bodies.fromVertices = function(x, y, vertexSets, options, flagInternal, removeCollinear, minimumArea) {
      var body,
          parts,
          isConvex,
          vertices,
          i,
          j,
          k,
          v,
          z;
      options = options || {};
      parts = [];
      flagInternal = typeof flagInternal !== 'undefined' ? flagInternal : false;
      removeCollinear = typeof removeCollinear !== 'undefined' ? removeCollinear : 0.01;
      minimumArea = typeof minimumArea !== 'undefined' ? minimumArea : 10;
      if (!window.decomp) {
        Common.log('Bodies.fromVertices: poly-decomp.js required. Could not decompose vertices. Fallback to convex hull.', 'warn');
      }
      if (!Common.isArray(vertexSets[0])) {
        vertexSets = [vertexSets];
      }
      for (v = 0; v < vertexSets.length; v += 1) {
        vertices = vertexSets[v];
        isConvex = Vertices.isConvex(vertices);
        if (isConvex || !window.decomp) {
          if (isConvex) {
            vertices = Vertices.clockwiseSort(vertices);
          } else {
            vertices = Vertices.hull(vertices);
          }
          parts.push({
            position: {
              x: x,
              y: y
            },
            vertices: vertices
          });
        } else {
          var concave = new decomp.Polygon();
          for (i = 0; i < vertices.length; i++) {
            concave.vertices.push([vertices[i].x, vertices[i].y]);
          }
          concave.makeCCW();
          if (removeCollinear !== false)
            concave.removeCollinearPoints(removeCollinear);
          var decomposed = concave.quickDecomp();
          for (i = 0; i < decomposed.length; i++) {
            var chunk = decomposed[i],
                chunkVertices = [];
            for (j = 0; j < chunk.vertices.length; j++) {
              chunkVertices.push({
                x: chunk.vertices[j][0],
                y: chunk.vertices[j][1]
              });
            }
            if (minimumArea > 0 && Vertices.area(chunkVertices) < minimumArea)
              continue;
            parts.push({
              position: Vertices.centre(chunkVertices),
              vertices: chunkVertices
            });
          }
        }
      }
      for (i = 0; i < parts.length; i++) {
        parts[i] = Body.create(Common.extend(parts[i], options));
      }
      if (flagInternal) {
        var coincident_max_dist = 5;
        for (i = 0; i < parts.length; i++) {
          var partA = parts[i];
          for (j = i + 1; j < parts.length; j++) {
            var partB = parts[j];
            if (Bounds.overlaps(partA.bounds, partB.bounds)) {
              var pav = partA.vertices,
                  pbv = partB.vertices;
              for (k = 0; k < partA.vertices.length; k++) {
                for (z = 0; z < partB.vertices.length; z++) {
                  var da = Vector.magnitudeSquared(Vector.sub(pav[(k + 1) % pav.length], pbv[z])),
                      db = Vector.magnitudeSquared(Vector.sub(pav[k], pbv[(z + 1) % pbv.length]));
                  if (da < coincident_max_dist && db < coincident_max_dist) {
                    pav[k].isInternal = true;
                    pbv[z].isInternal = true;
                  }
                }
              }
            }
          }
        }
      }
      if (parts.length > 1) {
        body = Body.create(Common.extend({parts: parts.slice(0)}, options));
        Body.setPosition(body, {
          x: x,
          y: y
        });
        return body;
      } else {
        return parts[0];
      }
    };
  })();
})(require('process'));
