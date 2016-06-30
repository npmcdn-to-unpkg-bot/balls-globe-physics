/* */ 
var Mesh = require('./Mesh');
var core = require('../core/index');
function Rope(texture, points) {
  Mesh.call(this, texture);
  this.points = points;
  this.vertices = new Float32Array(points.length * 4);
  this.uvs = new Float32Array(points.length * 4);
  this.colors = new Float32Array(points.length * 2);
  this.indices = new Uint16Array(points.length * 2);
  this._ready = true;
  this.refresh();
}
Rope.prototype = Object.create(Mesh.prototype);
Rope.prototype.constructor = Rope;
module.exports = Rope;
Rope.prototype.refresh = function() {
  var points = this.points;
  if (points.length < 1 || !this._texture._uvs) {
    return;
  }
  var uvs = this.uvs;
  var indices = this.indices;
  var colors = this.colors;
  var textureUvs = this._texture._uvs;
  var offset = new core.Point(textureUvs.x0, textureUvs.y0);
  var factor = new core.Point(textureUvs.x2 - textureUvs.x0, textureUvs.y2 - textureUvs.y0);
  uvs[0] = 0 + offset.x;
  uvs[1] = 0 + offset.y;
  uvs[2] = 0 + offset.x;
  uvs[3] = 1 * factor.y + offset.y;
  colors[0] = 1;
  colors[1] = 1;
  indices[0] = 0;
  indices[1] = 1;
  var total = points.length,
      point,
      index,
      amount;
  for (var i = 1; i < total; i++) {
    point = points[i];
    index = i * 4;
    amount = i / (total - 1);
    uvs[index] = amount * factor.x + offset.x;
    uvs[index + 1] = 0 + offset.y;
    uvs[index + 2] = amount * factor.x + offset.x;
    uvs[index + 3] = 1 * factor.y + offset.y;
    index = i * 2;
    colors[index] = 1;
    colors[index + 1] = 1;
    index = i * 2;
    indices[index] = index;
    indices[index + 1] = index + 1;
  }
  this.dirty = true;
};
Rope.prototype._onTextureUpdate = function() {
  Mesh.prototype._onTextureUpdate.call(this);
  if (this._ready) {
    this.refresh();
  }
};
Rope.prototype.updateTransform = function() {
  var points = this.points;
  if (points.length < 1) {
    return;
  }
  var lastPoint = points[0];
  var nextPoint;
  var perpX = 0;
  var perpY = 0;
  var vertices = this.vertices;
  var total = points.length,
      point,
      index,
      ratio,
      perpLength,
      num;
  for (var i = 0; i < total; i++) {
    point = points[i];
    index = i * 4;
    if (i < points.length - 1) {
      nextPoint = points[i + 1];
    } else {
      nextPoint = point;
    }
    perpY = -(nextPoint.x - lastPoint.x);
    perpX = nextPoint.y - lastPoint.y;
    ratio = (1 - (i / (total - 1))) * 10;
    if (ratio > 1) {
      ratio = 1;
    }
    perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
    num = this._texture.height / 2;
    perpX /= perpLength;
    perpY /= perpLength;
    perpX *= num;
    perpY *= num;
    vertices[index] = point.x + perpX;
    vertices[index + 1] = point.y + perpY;
    vertices[index + 2] = point.x - perpX;
    vertices[index + 3] = point.y - perpY;
    lastPoint = point;
  }
  this.containerUpdateTransform();
};
