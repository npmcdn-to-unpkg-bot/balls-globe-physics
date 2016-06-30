/* */ 
var CONST = require('../../const');
function Rectangle(x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 0;
  this.height = height || 0;
  this.type = CONST.SHAPES.RECT;
}
Rectangle.prototype.constructor = Rectangle;
module.exports = Rectangle;
Rectangle.EMPTY = new Rectangle(0, 0, 0, 0);
Rectangle.prototype.clone = function() {
  return new Rectangle(this.x, this.y, this.width, this.height);
};
Rectangle.prototype.contains = function(x, y) {
  if (this.width <= 0 || this.height <= 0) {
    return false;
  }
  if (x >= this.x && x < this.x + this.width) {
    if (y >= this.y && y < this.y + this.height) {
      return true;
    }
  }
  return false;
};
