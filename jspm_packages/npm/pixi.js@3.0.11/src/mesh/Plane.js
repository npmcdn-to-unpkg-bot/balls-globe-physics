/* */ 
var Mesh = require('./Mesh');
function Plane(texture, segmentsX, segmentsY) {
  Mesh.call(this, texture);
  this._ready = true;
  this.segmentsX = segmentsX || 10;
  this.segmentsY = segmentsY || 10;
  this.drawMode = Mesh.DRAW_MODES.TRIANGLES;
  this.refresh();
}
Plane.prototype = Object.create(Mesh.prototype);
Plane.prototype.constructor = Plane;
module.exports = Plane;
Plane.prototype.refresh = function() {
  var total = this.segmentsX * this.segmentsY;
  var verts = [];
  var colors = [];
  var uvs = [];
  var indices = [];
  var texture = this.texture;
  var segmentsXSub = this.segmentsX - 1;
  var segmentsYSub = this.segmentsY - 1;
  var i = 0;
  var sizeX = texture.width / segmentsXSub;
  var sizeY = texture.height / segmentsYSub;
  for (i = 0; i < total; i++) {
    var x = (i % this.segmentsX);
    var y = ((i / this.segmentsX) | 0);
    verts.push((x * sizeX), (y * sizeY));
    uvs.push(texture._uvs.x0 + (texture._uvs.x1 - texture._uvs.x0) * (x / (this.segmentsX - 1)), texture._uvs.y0 + (texture._uvs.y3 - texture._uvs.y0) * (y / (this.segmentsY - 1)));
  }
  var totalSub = segmentsXSub * segmentsYSub;
  for (i = 0; i < totalSub; i++) {
    var xpos = i % segmentsXSub;
    var ypos = (i / segmentsXSub) | 0;
    var value = (ypos * this.segmentsX) + xpos;
    var value2 = (ypos * this.segmentsX) + xpos + 1;
    var value3 = ((ypos + 1) * this.segmentsX) + xpos;
    var value4 = ((ypos + 1) * this.segmentsX) + xpos + 1;
    indices.push(value, value2, value3);
    indices.push(value2, value4, value3);
  }
  this.vertices = new Float32Array(verts);
  this.uvs = new Float32Array(uvs);
  this.colors = new Float32Array(colors);
  this.indices = new Uint16Array(indices);
};
Plane.prototype._onTextureUpdate = function() {
  Mesh.prototype._onTextureUpdate.call(this);
  if (this._ready) {
    this.refresh();
  }
};
