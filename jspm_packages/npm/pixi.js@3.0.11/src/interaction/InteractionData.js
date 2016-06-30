/* */ 
var core = require('../core/index');
function InteractionData() {
  this.global = new core.Point();
  this.target = null;
  this.originalEvent = null;
}
InteractionData.prototype.constructor = InteractionData;
module.exports = InteractionData;
InteractionData.prototype.getLocalPosition = function(displayObject, point, globalPos) {
  return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
};
