/* */ 
var Point = require('../Point'),
    CONST = require('../../const');
function Polygon(points_) {
  var points = points_;
  if (!Array.isArray(points)) {
    points = new Array(arguments.length);
    for (var a = 0; a < points.length; ++a) {
      points[a] = arguments[a];
    }
  }
  if (points[0] instanceof Point) {
    var p = [];
    for (var i = 0,
        il = points.length; i < il; i++) {
      p.push(points[i].x, points[i].y);
    }
    points = p;
  }
  this.closed = true;
  this.points = points;
  this.type = CONST.SHAPES.POLY;
}
Polygon.prototype.constructor = Polygon;
module.exports = Polygon;
Polygon.prototype.clone = function() {
  return new Polygon(this.points.slice());
};
Polygon.prototype.contains = function(x, y) {
  var inside = false;
  var length = this.points.length / 2;
  for (var i = 0,
      j = length - 1; i < length; j = i++) {
    var xi = this.points[i * 2],
        yi = this.points[i * 2 + 1],
        xj = this.points[j * 2],
        yj = this.points[j * 2 + 1],
        intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
};
