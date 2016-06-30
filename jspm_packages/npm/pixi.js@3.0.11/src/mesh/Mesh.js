/* */ 
var core = require('../core/index'),
    tempPoint = new core.Point(),
    tempPolygon = new core.Polygon();
function Mesh(texture, vertices, uvs, indices, drawMode) {
  core.Container.call(this);
  this._texture = null;
  this.uvs = uvs || new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
  this.vertices = vertices || new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
  this.indices = indices || new Uint16Array([0, 1, 3, 2]);
  this.dirty = true;
  this.blendMode = core.BLEND_MODES.NORMAL;
  this.canvasPadding = 0;
  this.drawMode = drawMode || Mesh.DRAW_MODES.TRIANGLE_MESH;
  this.texture = texture;
  this.shader = null;
}
Mesh.prototype = Object.create(core.Container.prototype);
Mesh.prototype.constructor = Mesh;
module.exports = Mesh;
Object.defineProperties(Mesh.prototype, {texture: {
    get: function() {
      return this._texture;
    },
    set: function(value) {
      if (this._texture === value) {
        return;
      }
      this._texture = value;
      if (value) {
        if (value.baseTexture.hasLoaded) {
          this._onTextureUpdate();
        } else {
          value.once('update', this._onTextureUpdate, this);
        }
      }
    }
  }});
Mesh.prototype._renderWebGL = function(renderer) {
  renderer.setObjectRenderer(renderer.plugins.mesh);
  renderer.plugins.mesh.render(this);
};
Mesh.prototype._renderCanvas = function(renderer) {
  var context = renderer.context;
  var transform = this.worldTransform;
  var res = renderer.resolution;
  if (renderer.roundPixels) {
    context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, (transform.tx * res) | 0, (transform.ty * res) | 0);
  } else {
    context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res, transform.ty * res);
  }
  if (this.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH) {
    this._renderCanvasTriangleMesh(context);
  } else {
    this._renderCanvasTriangles(context);
  }
};
Mesh.prototype._renderCanvasTriangleMesh = function(context) {
  var vertices = this.vertices;
  var uvs = this.uvs;
  var length = vertices.length / 2;
  for (var i = 0; i < length - 2; i++) {
    var index = i * 2;
    this._renderCanvasDrawTriangle(context, vertices, uvs, index, (index + 2), (index + 4));
  }
};
Mesh.prototype._renderCanvasTriangles = function(context) {
  var vertices = this.vertices;
  var uvs = this.uvs;
  var indices = this.indices;
  var length = indices.length;
  for (var i = 0; i < length; i += 3) {
    var index0 = indices[i] * 2,
        index1 = indices[i + 1] * 2,
        index2 = indices[i + 2] * 2;
    this._renderCanvasDrawTriangle(context, vertices, uvs, index0, index1, index2);
  }
};
Mesh.prototype._renderCanvasDrawTriangle = function(context, vertices, uvs, index0, index1, index2) {
  var base = this._texture.baseTexture;
  var textureSource = base.source;
  var textureWidth = base.width;
  var textureHeight = base.height;
  var x0 = vertices[index0],
      x1 = vertices[index1],
      x2 = vertices[index2];
  var y0 = vertices[index0 + 1],
      y1 = vertices[index1 + 1],
      y2 = vertices[index2 + 1];
  var u0 = uvs[index0] * base.width,
      u1 = uvs[index1] * base.width,
      u2 = uvs[index2] * base.width;
  var v0 = uvs[index0 + 1] * base.height,
      v1 = uvs[index1 + 1] * base.height,
      v2 = uvs[index2 + 1] * base.height;
  if (this.canvasPadding > 0) {
    var paddingX = this.canvasPadding / this.worldTransform.a;
    var paddingY = this.canvasPadding / this.worldTransform.d;
    var centerX = (x0 + x1 + x2) / 3;
    var centerY = (y0 + y1 + y2) / 3;
    var normX = x0 - centerX;
    var normY = y0 - centerY;
    var dist = Math.sqrt(normX * normX + normY * normY);
    x0 = centerX + (normX / dist) * (dist + paddingX);
    y0 = centerY + (normY / dist) * (dist + paddingY);
    normX = x1 - centerX;
    normY = y1 - centerY;
    dist = Math.sqrt(normX * normX + normY * normY);
    x1 = centerX + (normX / dist) * (dist + paddingX);
    y1 = centerY + (normY / dist) * (dist + paddingY);
    normX = x2 - centerX;
    normY = y2 - centerY;
    dist = Math.sqrt(normX * normX + normY * normY);
    x2 = centerX + (normX / dist) * (dist + paddingX);
    y2 = centerY + (normY / dist) * (dist + paddingY);
  }
  context.save();
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.lineTo(x2, y2);
  context.closePath();
  context.clip();
  var delta = (u0 * v1) + (v0 * u2) + (u1 * v2) - (v1 * u2) - (v0 * u1) - (u0 * v2);
  var deltaA = (x0 * v1) + (v0 * x2) + (x1 * v2) - (v1 * x2) - (v0 * x1) - (x0 * v2);
  var deltaB = (u0 * x1) + (x0 * u2) + (u1 * x2) - (x1 * u2) - (x0 * u1) - (u0 * x2);
  var deltaC = (u0 * v1 * x2) + (v0 * x1 * u2) + (x0 * u1 * v2) - (x0 * v1 * u2) - (v0 * u1 * x2) - (u0 * x1 * v2);
  var deltaD = (y0 * v1) + (v0 * y2) + (y1 * v2) - (v1 * y2) - (v0 * y1) - (y0 * v2);
  var deltaE = (u0 * y1) + (y0 * u2) + (u1 * y2) - (y1 * u2) - (y0 * u1) - (u0 * y2);
  var deltaF = (u0 * v1 * y2) + (v0 * y1 * u2) + (y0 * u1 * v2) - (y0 * v1 * u2) - (v0 * u1 * y2) - (u0 * y1 * v2);
  context.transform(deltaA / delta, deltaD / delta, deltaB / delta, deltaE / delta, deltaC / delta, deltaF / delta);
  context.drawImage(textureSource, 0, 0, textureWidth * base.resolution, textureHeight * base.resolution, 0, 0, textureWidth, textureHeight);
  context.restore();
};
Mesh.prototype.renderMeshFlat = function(Mesh) {
  var context = this.context;
  var vertices = Mesh.vertices;
  var length = vertices.length / 2;
  context.beginPath();
  for (var i = 1; i < length - 2; i++) {
    var index = i * 2;
    var x0 = vertices[index],
        x1 = vertices[index + 2],
        x2 = vertices[index + 4];
    var y0 = vertices[index + 1],
        y1 = vertices[index + 3],
        y2 = vertices[index + 5];
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
  }
  context.fillStyle = '#FF0000';
  context.fill();
  context.closePath();
};
Mesh.prototype._onTextureUpdate = function() {
  this.updateFrame = true;
};
Mesh.prototype.getBounds = function(matrix) {
  if (!this._currentBounds) {
    var worldTransform = matrix || this.worldTransform;
    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minX = Infinity;
    var minY = Infinity;
    var vertices = this.vertices;
    for (var i = 0,
        n = vertices.length; i < n; i += 2) {
      var rawX = vertices[i],
          rawY = vertices[i + 1];
      var x = (a * rawX) + (c * rawY) + tx;
      var y = (d * rawY) + (b * rawX) + ty;
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
    }
    if (minX === -Infinity || maxY === Infinity) {
      return core.Rectangle.EMPTY;
    }
    var bounds = this._bounds;
    bounds.x = minX;
    bounds.width = maxX - minX;
    bounds.y = minY;
    bounds.height = maxY - minY;
    this._currentBounds = bounds;
  }
  return this._currentBounds;
};
Mesh.prototype.containsPoint = function(point) {
  if (!this.getBounds().contains(point.x, point.y)) {
    return false;
  }
  this.worldTransform.applyInverse(point, tempPoint);
  var vertices = this.vertices;
  var points = tempPolygon.points;
  var i,
      len;
  if (this.drawMode === Mesh.DRAW_MODES.TRIANGLES) {
    var indices = this.indices;
    len = this.indices.length;
    for (i = 0; i < len; i += 3) {
      var ind0 = indices[i] * 2,
          ind1 = indices[i + 1] * 2,
          ind2 = indices[i + 2] * 2;
      points[0] = vertices[ind0];
      points[1] = vertices[ind0 + 1];
      points[2] = vertices[ind1];
      points[3] = vertices[ind1 + 1];
      points[4] = vertices[ind2];
      points[5] = vertices[ind2 + 1];
      if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
        return true;
      }
    }
  } else {
    len = vertices.length;
    for (i = 0; i < len; i += 6) {
      points[0] = vertices[i];
      points[1] = vertices[i + 1];
      points[2] = vertices[i + 2];
      points[3] = vertices[i + 3];
      points[4] = vertices[i + 4];
      points[5] = vertices[i + 5];
      if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
        return true;
      }
    }
  }
  return false;
};
Mesh.DRAW_MODES = {
  TRIANGLE_MESH: 0,
  TRIANGLES: 1
};
