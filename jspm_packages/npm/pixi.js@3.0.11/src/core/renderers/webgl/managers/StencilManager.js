/* */ 
var WebGLManager = require('./WebGLManager'),
    utils = require('../../../utils/index');
function WebGLMaskManager(renderer) {
  WebGLManager.call(this, renderer);
  this.stencilMaskStack = null;
}
WebGLMaskManager.prototype = Object.create(WebGLManager.prototype);
WebGLMaskManager.prototype.constructor = WebGLMaskManager;
module.exports = WebGLMaskManager;
WebGLMaskManager.prototype.setMaskStack = function(stencilMaskStack) {
  this.stencilMaskStack = stencilMaskStack;
  var gl = this.renderer.gl;
  if (stencilMaskStack.stencilStack.length === 0) {
    gl.disable(gl.STENCIL_TEST);
  } else {
    gl.enable(gl.STENCIL_TEST);
  }
};
WebGLMaskManager.prototype.pushStencil = function(graphics, webGLData) {
  this.renderer.currentRenderTarget.attachStencilBuffer();
  var gl = this.renderer.gl,
      sms = this.stencilMaskStack;
  this.bindGraphics(graphics, webGLData);
  if (sms.stencilStack.length === 0) {
    gl.enable(gl.STENCIL_TEST);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    sms.reverse = true;
    sms.count = 0;
  }
  sms.stencilStack.push(webGLData);
  var level = sms.count;
  gl.colorMask(false, false, false, false);
  gl.stencilFunc(gl.ALWAYS, 0, 0xFF);
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
  if (webGLData.mode === 1) {
    gl.drawElements(gl.TRIANGLE_FAN, webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0);
    if (sms.reverse) {
      gl.stencilFunc(gl.EQUAL, 0xFF - level, 0xFF);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
    } else {
      gl.stencilFunc(gl.EQUAL, level, 0xFF);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
    }
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
    if (sms.reverse) {
      gl.stencilFunc(gl.EQUAL, 0xFF - (level + 1), 0xFF);
    } else {
      gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
    }
    sms.reverse = !sms.reverse;
  } else {
    if (!sms.reverse) {
      gl.stencilFunc(gl.EQUAL, 0xFF - level, 0xFF);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
    } else {
      gl.stencilFunc(gl.EQUAL, level, 0xFF);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
    }
    gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
    if (!sms.reverse) {
      gl.stencilFunc(gl.EQUAL, 0xFF - (level + 1), 0xFF);
    } else {
      gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
    }
  }
  gl.colorMask(true, true, true, true);
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
  sms.count++;
};
WebGLMaskManager.prototype.bindGraphics = function(graphics, webGLData) {
  var gl = this.renderer.gl;
  var shader;
  if (webGLData.mode === 1) {
    shader = this.renderer.shaderManager.complexPrimitiveShader;
    this.renderer.shaderManager.setShader(shader);
    gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));
    gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, this.renderer.currentRenderTarget.projectionMatrix.toArray(true));
    gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));
    gl.uniform3fv(shader.uniforms.color._location, webGLData.color);
    gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 2, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
  } else {
    shader = this.renderer.shaderManager.primitiveShader;
    this.renderer.shaderManager.setShader(shader);
    gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));
    gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, this.renderer.currentRenderTarget.projectionMatrix.toArray(true));
    gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));
    gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
    gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
  }
};
WebGLMaskManager.prototype.popStencil = function(graphics, webGLData) {
  var gl = this.renderer.gl,
      sms = this.stencilMaskStack;
  sms.stencilStack.pop();
  sms.count--;
  if (sms.stencilStack.length === 0) {
    gl.disable(gl.STENCIL_TEST);
  } else {
    var level = sms.count;
    this.bindGraphics(graphics, webGLData);
    gl.colorMask(false, false, false, false);
    if (webGLData.mode === 1) {
      sms.reverse = !sms.reverse;
      if (sms.reverse) {
        gl.stencilFunc(gl.EQUAL, 0xFF - (level + 1), 0xFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
      } else {
        gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
      }
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
      gl.stencilFunc(gl.ALWAYS, 0, 0xFF);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
      gl.drawElements(gl.TRIANGLE_FAN, webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0);
      this.renderer.drawCount += 2;
      if (!sms.reverse) {
        gl.stencilFunc(gl.EQUAL, 0xFF - (level), 0xFF);
      } else {
        gl.stencilFunc(gl.EQUAL, level, 0xFF);
      }
    } else {
      if (!sms.reverse) {
        gl.stencilFunc(gl.EQUAL, 0xFF - (level + 1), 0xFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
      } else {
        gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
      }
      gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
      this.renderer.drawCount++;
      if (!sms.reverse) {
        gl.stencilFunc(gl.EQUAL, 0xFF - (level), 0xFF);
      } else {
        gl.stencilFunc(gl.EQUAL, level, 0xFF);
      }
    }
    gl.colorMask(true, true, true, true);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
  }
};
WebGLMaskManager.prototype.destroy = function() {
  WebGLManager.prototype.destroy.call(this);
  this.stencilMaskStack.stencilStack = null;
};
WebGLMaskManager.prototype.pushMask = function(maskData) {
  this.renderer.setObjectRenderer(this.renderer.plugins.graphics);
  if (maskData.dirty) {
    this.renderer.plugins.graphics.updateGraphics(maskData, this.renderer.gl);
  }
  if (!maskData._webGL[this.renderer.gl.id].data.length) {
    return;
  }
  this.pushStencil(maskData, maskData._webGL[this.renderer.gl.id].data[0]);
};
WebGLMaskManager.prototype.popMask = function(maskData) {
  this.renderer.setObjectRenderer(this.renderer.plugins.graphics);
  this.popStencil(maskData, maskData._webGL[this.renderer.gl.id].data[0]);
};
