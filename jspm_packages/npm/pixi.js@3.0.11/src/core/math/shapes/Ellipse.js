/* */ 
var Rectangle = require('./Rectangle'),
    CONST = require('../../const');
function Ellipse(x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 0;
  this.height = height || 0;
  this.type = CONST.SHAPES.ELIP;
}
Ellipse.prototype.constructor = Ellipse;
module.exports = Ellipse;
Ellipse.prototype.clone = function() {
  return new Ellipse(this.x, this.y, this.width, this.height);
};
Ellipse.prototype.contains = function(x, y) {
  if (this.width <= 0 || this.height <= 0) {
    return false;
  }
  var normx = ((x - this.x) / this.width),
      normy = ((y - this.y) / this.height);
  normx *= normx;
  normy *= normy;
  return (normx + normy <= 1);
};
Ellipse.prototype.getBounds = function() {
  return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
};
