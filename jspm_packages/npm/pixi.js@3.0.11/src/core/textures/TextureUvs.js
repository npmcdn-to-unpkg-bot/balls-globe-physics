/* */ 
function TextureUvs() {
  this.x0 = 0;
  this.y0 = 0;
  this.x1 = 1;
  this.y1 = 0;
  this.x2 = 1;
  this.y2 = 1;
  this.x3 = 0;
  this.y3 = 1;
}
module.exports = TextureUvs;
var GroupD8 = require('../math/GroupD8');
TextureUvs.prototype.set = function(frame, baseFrame, rotate) {
  var tw = baseFrame.width;
  var th = baseFrame.height;
  if (rotate) {
    var swapWidthHeight = GroupD8.isSwapWidthHeight(rotate);
    var w2 = (swapWidthHeight ? frame.height : frame.width) / 2 / tw;
    var h2 = (swapWidthHeight ? frame.width : frame.height) / 2 / th;
    var cX = frame.x / tw + w2;
    var cY = frame.y / th + h2;
    rotate = GroupD8.add(rotate, GroupD8.NW);
    this.x0 = cX + w2 * GroupD8.uX(rotate);
    this.y0 = cY + h2 * GroupD8.uY(rotate);
    rotate = GroupD8.add(rotate, 2);
    this.x1 = cX + w2 * GroupD8.uX(rotate);
    this.y1 = cY + h2 * GroupD8.uY(rotate);
    rotate = GroupD8.add(rotate, 2);
    this.x2 = cX + w2 * GroupD8.uX(rotate);
    this.y2 = cY + h2 * GroupD8.uY(rotate);
    rotate = GroupD8.add(rotate, 2);
    this.x3 = cX + w2 * GroupD8.uX(rotate);
    this.y3 = cY + h2 * GroupD8.uY(rotate);
  } else {
    this.x0 = frame.x / tw;
    this.y0 = frame.y / th;
    this.x1 = (frame.x + frame.width) / tw;
    this.y1 = frame.y / th;
    this.x2 = (frame.x + frame.width) / tw;
    this.y2 = (frame.y + frame.height) / th;
    this.x3 = frame.x / tw;
    this.y3 = (frame.y + frame.height) / th;
  }
};
