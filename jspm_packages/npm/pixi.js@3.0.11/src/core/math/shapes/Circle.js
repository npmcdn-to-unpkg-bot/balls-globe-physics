/* */ 
var Rectangle = require('./Rectangle'),
    CONST = require('../../const');
function Circle(x, y, radius) {
  this.x = x || 0;
  this.y = y || 0;
  this.radius = radius || 0;
  this.type = CONST.SHAPES.CIRC;
}
Circle.prototype.constructor = Circle;
module.exports = Circle;
Circle.prototype.clone = function() {
  return new Circle(this.x, this.y, this.radius);
};
Circle.prototype.contains = function(x, y) {
  if (this.radius <= 0) {
    return false;
  }
  var dx = (this.x - x),
      dy = (this.y - y),
      r2 = this.radius * this.radius;
  dx *= dx;
  dy *= dy;
  return (dx + dy <= r2);
};
Circle.prototype.getBounds = function() {
  return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
};
