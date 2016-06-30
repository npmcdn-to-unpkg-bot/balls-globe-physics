/* */ 
var Container = require('../display/Container'),
    CONST = require('../const');
function ParticleContainer(maxSize, properties, batchSize) {
  Container.call(this);
  batchSize = batchSize || 15000;
  maxSize = maxSize || 15000;
  var maxBatchSize = 16384;
  if (batchSize > maxBatchSize) {
    batchSize = maxBatchSize;
  }
  if (batchSize > maxSize) {
    batchSize = maxSize;
  }
  this._properties = [false, true, false, false, false];
  this._maxSize = maxSize;
  this._batchSize = batchSize;
  this._buffers = null;
  this._bufferToUpdate = 0;
  this.interactiveChildren = false;
  this.blendMode = CONST.BLEND_MODES.NORMAL;
  this.roundPixels = true;
  this.setProperties(properties);
}
ParticleContainer.prototype = Object.create(Container.prototype);
ParticleContainer.prototype.constructor = ParticleContainer;
module.exports = ParticleContainer;
ParticleContainer.prototype.setProperties = function(properties) {
  if (properties) {
    this._properties[0] = 'scale' in properties ? !!properties.scale : this._properties[0];
    this._properties[1] = 'position' in properties ? !!properties.position : this._properties[1];
    this._properties[2] = 'rotation' in properties ? !!properties.rotation : this._properties[2];
    this._properties[3] = 'uvs' in properties ? !!properties.uvs : this._properties[3];
    this._properties[4] = 'alpha' in properties ? !!properties.alpha : this._properties[4];
  }
};
ParticleContainer.prototype.updateTransform = function() {
  this.displayObjectUpdateTransform();
};
ParticleContainer.prototype.renderWebGL = function(renderer) {
  if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable) {
    return;
  }
  renderer.setObjectRenderer(renderer.plugins.particle);
  renderer.plugins.particle.render(this);
};
ParticleContainer.prototype.onChildrenChange = function(smallestChildIndex) {
  var bufferIndex = Math.floor(smallestChildIndex / this._batchSize);
  if (bufferIndex < this._bufferToUpdate) {
    this._bufferToUpdate = bufferIndex;
  }
};
ParticleContainer.prototype.renderCanvas = function(renderer) {
  if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable) {
    return;
  }
  var context = renderer.context;
  var transform = this.worldTransform;
  var isRotated = true;
  var positionX = 0;
  var positionY = 0;
  var finalWidth = 0;
  var finalHeight = 0;
  var compositeOperation = renderer.blendModes[this.blendMode];
  if (compositeOperation !== context.globalCompositeOperation) {
    context.globalCompositeOperation = compositeOperation;
  }
  context.globalAlpha = this.worldAlpha;
  this.displayObjectUpdateTransform();
  for (var i = 0; i < this.children.length; ++i) {
    var child = this.children[i];
    if (!child.visible) {
      continue;
    }
    var frame = child.texture.frame;
    context.globalAlpha = this.worldAlpha * child.alpha;
    if (child.rotation % (Math.PI * 2) === 0) {
      if (isRotated) {
        context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        isRotated = false;
      }
      positionX = ((child.anchor.x) * (-frame.width * child.scale.x) + child.position.x + 0.5);
      positionY = ((child.anchor.y) * (-frame.height * child.scale.y) + child.position.y + 0.5);
      finalWidth = frame.width * child.scale.x;
      finalHeight = frame.height * child.scale.y;
    } else {
      if (!isRotated) {
        isRotated = true;
      }
      child.displayObjectUpdateTransform();
      var childTransform = child.worldTransform;
      if (renderer.roundPixels) {
        context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, childTransform.tx | 0, childTransform.ty | 0);
      } else {
        context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, childTransform.tx, childTransform.ty);
      }
      positionX = ((child.anchor.x) * (-frame.width) + 0.5);
      positionY = ((child.anchor.y) * (-frame.height) + 0.5);
      finalWidth = frame.width;
      finalHeight = frame.height;
    }
    context.drawImage(child.texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, positionX, positionY, finalWidth, finalHeight);
  }
};
ParticleContainer.prototype.destroy = function() {
  Container.prototype.destroy.apply(this, arguments);
  if (this._buffers) {
    for (var i = 0; i < this._buffers.length; ++i) {
      this._buffers[i].destroy();
    }
  }
  this._properties = null;
  this._buffers = null;
};
