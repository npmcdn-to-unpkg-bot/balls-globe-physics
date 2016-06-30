/* */ 
var core = require('../core/index');
core.DisplayObject.prototype.name = null;
core.Container.prototype.getChildByName = function(name) {
  for (var i = 0; i < this.children.length; i++) {
    if (this.children[i].name === name) {
      return this.children[i];
    }
  }
  return null;
};
