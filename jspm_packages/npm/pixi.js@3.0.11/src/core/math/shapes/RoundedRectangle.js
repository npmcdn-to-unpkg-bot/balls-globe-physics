/* */ 
var CONST = require('../../const');
function RoundedRectangle(x, y, width, height, radius) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 0;
  this.height = height || 0;
  this.radius = radius || 20;
  this.type = CONST.SHAPES.RREC;
}
RoundedRectangle.prototype.constructor = RoundedRectangle;
module.exports = RoundedRectangle;
RoundedRectangle.prototype.clone = function() {
  return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
};
RoundedRectangle.prototype.contains = function(x, y) {
  if (this.width <= 0 || this.height <= 0) {
    return false;
  }
  if (x >= this.x && x <= this.x + this.width) {
    if (y >= this.y && y <= this.y + this.height) {
      return true;
    }
  }
  return false;
};
