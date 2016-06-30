/* */ 
var utils = require('../../utils/index'),
    math = require('../../math/index'),
    CONST = require('../../const'),
    ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    WebGLGraphicsData = require('./WebGLGraphicsData'),
    earcut = require('earcut');
function GraphicsRenderer(renderer) {
  ObjectRenderer.call(this, renderer);
  this.graphicsDataPool = [];
  this.primitiveShader = null;
  this.complexPrimitiveShader = null;
  this.maximumSimplePolySize = 200;
}
GraphicsRenderer.prototype = Object.create(ObjectRenderer.prototype);
GraphicsRenderer.prototype.constructor = GraphicsRenderer;
module.exports = GraphicsRenderer;
WebGLRenderer.registerPlugin('graphics', GraphicsRenderer);
GraphicsRenderer.prototype.onContextChange = function() {};
GraphicsRenderer.prototype.destroy = function() {
  ObjectRenderer.prototype.destroy.call(this);
  for (var i = 0; i < this.graphicsDataPool.length; ++i) {
    this.graphicsDataPool[i].destroy();
  }
  this.graphicsDataPool = null;
};
GraphicsRenderer.prototype.render = function(graphics) {
  var renderer = this.renderer;
  var gl = renderer.gl;
  var shader = renderer.shaderManager.plugins.primitiveShader,
      webGLData;
  if (graphics.dirty || !graphics._webGL[gl.id]) {
    this.updateGraphics(graphics);
  }
  var webGL = graphics._webGL[gl.id];
  renderer.blendModeManager.setBlendMode(graphics.blendMode);
  for (var i = 0,
      n = webGL.data.length; i < n; i++) {
    webGLData = webGL.data[i];
    if (webGL.data[i].mode === 1) {
      renderer.stencilManager.pushStencil(graphics, webGLData);
      gl.uniform1f(renderer.shaderManager.complexPrimitiveShader.uniforms.alpha._location, graphics.worldAlpha * webGLData.alpha);
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
      renderer.stencilManager.popStencil(graphics, webGLData);
    } else {
      shader = renderer.shaderManager.primitiveShader;
      renderer.shaderManager.setShader(shader);
      gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));
      gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, renderer.currentRenderTarget.projectionMatrix.toArray(true));
      gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));
      gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);
      gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
      gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
      gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
      gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
    }
    renderer.drawCount++;
  }
};
GraphicsRenderer.prototype.updateGraphics = function(graphics) {
  var gl = this.renderer.gl;
  var webGL = graphics._webGL[gl.id];
  if (!webGL) {
    webGL = graphics._webGL[gl.id] = {
      lastIndex: 0,
      data: [],
      gl: gl
    };
  }
  graphics.dirty = false;
  var i;
  if (graphics.clearDirty) {
    graphics.clearDirty = false;
    for (i = 0; i < webGL.data.length; i++) {
      var graphicsData = webGL.data[i];
      graphicsData.reset();
      this.graphicsDataPool.push(graphicsData);
    }
    webGL.data = [];
    webGL.lastIndex = 0;
  }
  var webGLData;
  for (i = webGL.lastIndex; i < graphics.graphicsData.length; i++) {
    var data = graphics.graphicsData[i];
    if (data.type === CONST.SHAPES.POLY) {
      data.points = data.shape.points.slice();
      if (data.shape.closed) {
        if (data.points[0] !== data.points[data.points.length - 2] || data.points[1] !== data.points[data.points.length - 1]) {
          data.points.push(data.points[0], data.points[1]);
        }
      }
      if (data.fill) {
        if (data.points.length >= 6) {
          if (data.points.length < this.maximumSimplePolySize * 2) {
            webGLData = this.switchMode(webGL, 0);
            var canDrawUsingSimple = this.buildPoly(data, webGLData);
            if (!canDrawUsingSimple) {
              webGLData = this.switchMode(webGL, 1);
              this.buildComplexPoly(data, webGLData);
            }
          } else {
            webGLData = this.switchMode(webGL, 1);
            this.buildComplexPoly(data, webGLData);
          }
        }
      }
      if (data.lineWidth > 0) {
        webGLData = this.switchMode(webGL, 0);
        this.buildLine(data, webGLData);
      }
    } else {
      webGLData = this.switchMode(webGL, 0);
      if (data.type === CONST.SHAPES.RECT) {
        this.buildRectangle(data, webGLData);
      } else if (data.type === CONST.SHAPES.CIRC || data.type === CONST.SHAPES.ELIP) {
        this.buildCircle(data, webGLData);
      } else if (data.type === CONST.SHAPES.RREC) {
        this.buildRoundedRectangle(data, webGLData);
      }
    }
    webGL.lastIndex++;
  }
  for (i = 0; i < webGL.data.length; i++) {
    webGLData = webGL.data[i];
    if (webGLData.dirty) {
      webGLData.upload();
    }
  }
};
GraphicsRenderer.prototype.switchMode = function(webGL, type) {
  var webGLData;
  if (!webGL.data.length) {
    webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(webGL.gl);
    webGLData.mode = type;
    webGL.data.push(webGLData);
  } else {
    webGLData = webGL.data[webGL.data.length - 1];
    if ((webGLData.points.length > 320000) || webGLData.mode !== type || type === 1) {
      webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(webGL.gl);
      webGLData.mode = type;
      webGL.data.push(webGLData);
    }
  }
  webGLData.dirty = true;
  return webGLData;
};
GraphicsRenderer.prototype.buildRectangle = function(graphicsData, webGLData) {
  var rectData = graphicsData.shape;
  var x = rectData.x;
  var y = rectData.y;
  var width = rectData.width;
  var height = rectData.height;
  if (graphicsData.fill) {
    var color = utils.hex2rgb(graphicsData.fillColor);
    var alpha = graphicsData.fillAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;
    var verts = webGLData.points;
    var indices = webGLData.indices;
    var vertPos = verts.length / 6;
    verts.push(x, y);
    verts.push(r, g, b, alpha);
    verts.push(x + width, y);
    verts.push(r, g, b, alpha);
    verts.push(x, y + height);
    verts.push(r, g, b, alpha);
    verts.push(x + width, y + height);
    verts.push(r, g, b, alpha);
    indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3);
  }
  if (graphicsData.lineWidth) {
    var tempPoints = graphicsData.points;
    graphicsData.points = [x, y, x + width, y, x + width, y + height, x, y + height, x, y];
    this.buildLine(graphicsData, webGLData);
    graphicsData.points = tempPoints;
  }
};
GraphicsRenderer.prototype.buildRoundedRectangle = function(graphicsData, webGLData) {
  var rrectData = graphicsData.shape;
  var x = rrectData.x;
  var y = rrectData.y;
  var width = rrectData.width;
  var height = rrectData.height;
  var radius = rrectData.radius;
  var recPoints = [];
  recPoints.push(x, y + radius);
  this.quadraticBezierCurve(x, y + height - radius, x, y + height, x + radius, y + height, recPoints);
  this.quadraticBezierCurve(x + width - radius, y + height, x + width, y + height, x + width, y + height - radius, recPoints);
  this.quadraticBezierCurve(x + width, y + radius, x + width, y, x + width - radius, y, recPoints);
  this.quadraticBezierCurve(x + radius, y, x, y, x, y + radius + 0.0000000001, recPoints);
  if (graphicsData.fill) {
    var color = utils.hex2rgb(graphicsData.fillColor);
    var alpha = graphicsData.fillAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;
    var verts = webGLData.points;
    var indices = webGLData.indices;
    var vecPos = verts.length / 6;
    var triangles = earcut(recPoints, null, 2);
    var i = 0;
    for (i = 0; i < triangles.length; i += 3) {
      indices.push(triangles[i] + vecPos);
      indices.push(triangles[i] + vecPos);
      indices.push(triangles[i + 1] + vecPos);
      indices.push(triangles[i + 2] + vecPos);
      indices.push(triangles[i + 2] + vecPos);
    }
    for (i = 0; i < recPoints.length; i++) {
      verts.push(recPoints[i], recPoints[++i], r, g, b, alpha);
    }
  }
  if (graphicsData.lineWidth) {
    var tempPoints = graphicsData.points;
    graphicsData.points = recPoints;
    this.buildLine(graphicsData, webGLData);
    graphicsData.points = tempPoints;
  }
};
GraphicsRenderer.prototype.quadraticBezierCurve = function(fromX, fromY, cpX, cpY, toX, toY, out) {
  var xa,
      ya,
      xb,
      yb,
      x,
      y,
      n = 20,
      points = out || [];
  function getPt(n1, n2, perc) {
    var diff = n2 - n1;
    return n1 + (diff * perc);
  }
  var j = 0;
  for (var i = 0; i <= n; i++) {
    j = i / n;
    xa = getPt(fromX, cpX, j);
    ya = getPt(fromY, cpY, j);
    xb = getPt(cpX, toX, j);
    yb = getPt(cpY, toY, j);
    x = getPt(xa, xb, j);
    y = getPt(ya, yb, j);
    points.push(x, y);
  }
  return points;
};
GraphicsRenderer.prototype.buildCircle = function(graphicsData, webGLData) {
  var circleData = graphicsData.shape;
  var x = circleData.x;
  var y = circleData.y;
  var width;
  var height;
  if (graphicsData.type === CONST.SHAPES.CIRC) {
    width = circleData.radius;
    height = circleData.radius;
  } else {
    width = circleData.width;
    height = circleData.height;
  }
  var totalSegs = Math.floor(30 * Math.sqrt(circleData.radius)) || Math.floor(15 * Math.sqrt(circleData.width + circleData.height));
  var seg = (Math.PI * 2) / totalSegs;
  var i = 0;
  if (graphicsData.fill) {
    var color = utils.hex2rgb(graphicsData.fillColor);
    var alpha = graphicsData.fillAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;
    var verts = webGLData.points;
    var indices = webGLData.indices;
    var vecPos = verts.length / 6;
    indices.push(vecPos);
    for (i = 0; i < totalSegs + 1; i++) {
      verts.push(x, y, r, g, b, alpha);
      verts.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height, r, g, b, alpha);
      indices.push(vecPos++, vecPos++);
    }
    indices.push(vecPos - 1);
  }
  if (graphicsData.lineWidth) {
    var tempPoints = graphicsData.points;
    graphicsData.points = [];
    for (i = 0; i < totalSegs + 1; i++) {
      graphicsData.points.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height);
    }
    this.buildLine(graphicsData, webGLData);
    graphicsData.points = tempPoints;
  }
};
GraphicsRenderer.prototype.buildLine = function(graphicsData, webGLData) {
  var i = 0;
  var points = graphicsData.points;
  if (points.length === 0) {
    return;
  }
  var firstPoint = new math.Point(points[0], points[1]);
  var lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);
  if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y) {
    points = points.slice();
    points.pop();
    points.pop();
    lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);
    var midPointX = lastPoint.x + (firstPoint.x - lastPoint.x) * 0.5;
    var midPointY = lastPoint.y + (firstPoint.y - lastPoint.y) * 0.5;
    points.unshift(midPointX, midPointY);
    points.push(midPointX, midPointY);
  }
  var verts = webGLData.points;
  var indices = webGLData.indices;
  var length = points.length / 2;
  var indexCount = points.length;
  var indexStart = verts.length / 6;
  var width = graphicsData.lineWidth / 2;
  var color = utils.hex2rgb(graphicsData.lineColor);
  var alpha = graphicsData.lineAlpha;
  var r = color[0] * alpha;
  var g = color[1] * alpha;
  var b = color[2] * alpha;
  var px,
      py,
      p1x,
      p1y,
      p2x,
      p2y,
      p3x,
      p3y;
  var perpx,
      perpy,
      perp2x,
      perp2y,
      perp3x,
      perp3y;
  var a1,
      b1,
      c1,
      a2,
      b2,
      c2;
  var denom,
      pdist,
      dist;
  p1x = points[0];
  p1y = points[1];
  p2x = points[2];
  p2y = points[3];
  perpx = -(p1y - p2y);
  perpy = p1x - p2x;
  dist = Math.sqrt(perpx * perpx + perpy * perpy);
  perpx /= dist;
  perpy /= dist;
  perpx *= width;
  perpy *= width;
  verts.push(p1x - perpx, p1y - perpy, r, g, b, alpha);
  verts.push(p1x + perpx, p1y + perpy, r, g, b, alpha);
  for (i = 1; i < length - 1; i++) {
    p1x = points[(i - 1) * 2];
    p1y = points[(i - 1) * 2 + 1];
    p2x = points[(i) * 2];
    p2y = points[(i) * 2 + 1];
    p3x = points[(i + 1) * 2];
    p3y = points[(i + 1) * 2 + 1];
    perpx = -(p1y - p2y);
    perpy = p1x - p2x;
    dist = Math.sqrt(perpx * perpx + perpy * perpy);
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;
    perp2x = -(p2y - p3y);
    perp2y = p2x - p3x;
    dist = Math.sqrt(perp2x * perp2x + perp2y * perp2y);
    perp2x /= dist;
    perp2y /= dist;
    perp2x *= width;
    perp2y *= width;
    a1 = (-perpy + p1y) - (-perpy + p2y);
    b1 = (-perpx + p2x) - (-perpx + p1x);
    c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
    a2 = (-perp2y + p3y) - (-perp2y + p2y);
    b2 = (-perp2x + p2x) - (-perp2x + p3x);
    c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);
    denom = a1 * b2 - a2 * b1;
    if (Math.abs(denom) < 0.1) {
      denom += 10.1;
      verts.push(p2x - perpx, p2y - perpy, r, g, b, alpha);
      verts.push(p2x + perpx, p2y + perpy, r, g, b, alpha);
      continue;
    }
    px = (b1 * c2 - b2 * c1) / denom;
    py = (a2 * c1 - a1 * c2) / denom;
    pdist = (px - p2x) * (px - p2x) + (py - p2y) * (py - p2y);
    if (pdist > 140 * 140) {
      perp3x = perpx - perp2x;
      perp3y = perpy - perp2y;
      dist = Math.sqrt(perp3x * perp3x + perp3y * perp3y);
      perp3x /= dist;
      perp3y /= dist;
      perp3x *= width;
      perp3y *= width;
      verts.push(p2x - perp3x, p2y - perp3y);
      verts.push(r, g, b, alpha);
      verts.push(p2x + perp3x, p2y + perp3y);
      verts.push(r, g, b, alpha);
      verts.push(p2x - perp3x, p2y - perp3y);
      verts.push(r, g, b, alpha);
      indexCount++;
    } else {
      verts.push(px, py);
      verts.push(r, g, b, alpha);
      verts.push(p2x - (px - p2x), p2y - (py - p2y));
      verts.push(r, g, b, alpha);
    }
  }
  p1x = points[(length - 2) * 2];
  p1y = points[(length - 2) * 2 + 1];
  p2x = points[(length - 1) * 2];
  p2y = points[(length - 1) * 2 + 1];
  perpx = -(p1y - p2y);
  perpy = p1x - p2x;
  dist = Math.sqrt(perpx * perpx + perpy * perpy);
  perpx /= dist;
  perpy /= dist;
  perpx *= width;
  perpy *= width;
  verts.push(p2x - perpx, p2y - perpy);
  verts.push(r, g, b, alpha);
  verts.push(p2x + perpx, p2y + perpy);
  verts.push(r, g, b, alpha);
  indices.push(indexStart);
  for (i = 0; i < indexCount; i++) {
    indices.push(indexStart++);
  }
  indices.push(indexStart - 1);
};
GraphicsRenderer.prototype.buildComplexPoly = function(graphicsData, webGLData) {
  var points = graphicsData.points.slice();
  if (points.length < 6) {
    return;
  }
  var indices = webGLData.indices;
  webGLData.points = points;
  webGLData.alpha = graphicsData.fillAlpha;
  webGLData.color = utils.hex2rgb(graphicsData.fillColor);
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;
  var x,
      y;
  for (var i = 0; i < points.length; i += 2) {
    x = points[i];
    y = points[i + 1];
    minX = x < minX ? x : minX;
    maxX = x > maxX ? x : maxX;
    minY = y < minY ? y : minY;
    maxY = y > maxY ? y : maxY;
  }
  points.push(minX, minY, maxX, minY, maxX, maxY, minX, maxY);
  var length = points.length / 2;
  for (i = 0; i < length; i++) {
    indices.push(i);
  }
};
GraphicsRenderer.prototype.buildPoly = function(graphicsData, webGLData) {
  var points = graphicsData.points;
  if (points.length < 6) {
    return;
  }
  var verts = webGLData.points;
  var indices = webGLData.indices;
  var length = points.length / 2;
  var color = utils.hex2rgb(graphicsData.fillColor);
  var alpha = graphicsData.fillAlpha;
  var r = color[0] * alpha;
  var g = color[1] * alpha;
  var b = color[2] * alpha;
  var triangles = earcut(points, null, 2);
  if (!triangles) {
    return false;
  }
  var vertPos = verts.length / 6;
  var i = 0;
  for (i = 0; i < triangles.length; i += 3) {
    indices.push(triangles[i] + vertPos);
    indices.push(triangles[i] + vertPos);
    indices.push(triangles[i + 1] + vertPos);
    indices.push(triangles[i + 2] + vertPos);
    indices.push(triangles[i + 2] + vertPos);
  }
  for (i = 0; i < length; i++) {
    verts.push(points[i * 2], points[i * 2 + 1], r, g, b, alpha);
  }
  return true;
};
