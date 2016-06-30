/* */ 
var core = require('../core/index');
core.DisplayObject.prototype.getGlobalPosition = function(point) {
  point = point || new core.Point();
  if (this.parent) {
    this.displayObjectUpdateTransform();
    point.x = this.worldTransform.tx;
    point.y = this.worldTransform.ty;
  } else {
    point.x = this.position.x;
    point.y = this.position.y;
  }
  return point;
};
