/* */ 
var Axes = {};
module.exports = Axes;
var Vector = require('./Vector');
var Common = require('../core/Common');
(function() {
  Axes.fromVertices = function(vertices) {
    var axes = {};
    for (var i = 0; i < vertices.length; i++) {
      var j = (i + 1) % vertices.length,
          normal = Vector.normalise({
            x: vertices[j].y - vertices[i].y,
            y: vertices[i].x - vertices[j].x
          }),
          gradient = (normal.y === 0) ? Infinity : (normal.x / normal.y);
      gradient = gradient.toFixed(3).toString();
      axes[gradient] = normal;
    }
    return Common.values(axes);
  };
  Axes.rotate = function(axes, angle) {
    if (angle === 0)
      return;
    var cos = Math.cos(angle),
        sin = Math.sin(angle);
    for (var i = 0; i < axes.length; i++) {
      var axis = axes[i],
          xx;
      xx = axis.x * cos - axis.y * sin;
      axis.y = axis.x * sin + axis.y * cos;
      axis.x = xx;
    }
  };
})();
