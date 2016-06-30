/* */ 
var utils = require('../../../utils/index');
function Shader(shaderManager, vertexSrc, fragmentSrc, uniforms, attributes) {
  if (!vertexSrc || !fragmentSrc) {
    throw new Error('Pixi.js Error. Shader requires vertexSrc and fragmentSrc');
  }
  this.uid = utils.uid();
  this.gl = shaderManager.renderer.gl;
  this.shaderManager = shaderManager;
  this.program = null;
  this.uniforms = uniforms || {};
  this.attributes = attributes || {};
  this.textureCount = 1;
  this.vertexSrc = vertexSrc;
  this.fragmentSrc = fragmentSrc;
  this.init();
}
Shader.prototype.constructor = Shader;
module.exports = Shader;
Shader.prototype.init = function() {
  this.compile();
  this.gl.useProgram(this.program);
  this.cacheUniformLocations(Object.keys(this.uniforms));
  this.cacheAttributeLocations(Object.keys(this.attributes));
};
Shader.prototype.cacheUniformLocations = function(keys) {
  for (var i = 0; i < keys.length; ++i) {
    this.uniforms[keys[i]]._location = this.gl.getUniformLocation(this.program, keys[i]);
  }
};
Shader.prototype.cacheAttributeLocations = function(keys) {
  for (var i = 0; i < keys.length; ++i) {
    this.attributes[keys[i]] = this.gl.getAttribLocation(this.program, keys[i]);
  }
};
Shader.prototype.compile = function() {
  var gl = this.gl;
  var glVertShader = this._glCompile(gl.VERTEX_SHADER, this.vertexSrc);
  var glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this.fragmentSrc);
  var program = gl.createProgram();
  gl.attachShader(program, glVertShader);
  gl.attachShader(program, glFragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Pixi.js Error: Could not initialize shader.');
    console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS));
    console.error('gl.getError()', gl.getError());
    if (gl.getProgramInfoLog(program) !== '') {
      console.warn('Pixi.js Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(program));
    }
    gl.deleteProgram(program);
    program = null;
  }
  gl.deleteShader(glVertShader);
  gl.deleteShader(glFragShader);
  return (this.program = program);
};
Shader.prototype.syncUniform = function(uniform) {
  var location = uniform._location,
      value = uniform.value,
      gl = this.gl,
      i,
      il;
  switch (uniform.type) {
    case 'b':
    case 'bool':
    case 'boolean':
      gl.uniform1i(location, value ? 1 : 0);
      break;
    case 'i':
    case '1i':
      gl.uniform1i(location, value);
      break;
    case 'f':
    case '1f':
      gl.uniform1f(location, value);
      break;
    case '2f':
      gl.uniform2f(location, value[0], value[1]);
      break;
    case '3f':
      gl.uniform3f(location, value[0], value[1], value[2]);
      break;
    case '4f':
      gl.uniform4f(location, value[0], value[1], value[2], value[3]);
      break;
    case 'v2':
      gl.uniform2f(location, value.x, value.y);
      break;
    case 'v3':
      gl.uniform3f(location, value.x, value.y, value.z);
      break;
    case 'v4':
      gl.uniform4f(location, value.x, value.y, value.z, value.w);
      break;
    case '1iv':
      gl.uniform1iv(location, value);
      break;
    case '2iv':
      gl.uniform2iv(location, value);
      break;
    case '3iv':
      gl.uniform3iv(location, value);
      break;
    case '4iv':
      gl.uniform4iv(location, value);
      break;
    case '1fv':
      gl.uniform1fv(location, value);
      break;
    case '2fv':
      gl.uniform2fv(location, value);
      break;
    case '3fv':
      gl.uniform3fv(location, value);
      break;
    case '4fv':
      gl.uniform4fv(location, value);
      break;
    case 'm2':
    case 'mat2':
    case 'Matrix2fv':
      gl.uniformMatrix2fv(location, uniform.transpose, value);
      break;
    case 'm3':
    case 'mat3':
    case 'Matrix3fv':
      gl.uniformMatrix3fv(location, uniform.transpose, value);
      break;
    case 'm4':
    case 'mat4':
    case 'Matrix4fv':
      gl.uniformMatrix4fv(location, uniform.transpose, value);
      break;
    case 'c':
      if (typeof value === 'number') {
        value = utils.hex2rgb(value);
      }
      gl.uniform3f(location, value[0], value[1], value[2]);
      break;
    case 'iv1':
      gl.uniform1iv(location, value);
      break;
    case 'iv':
      gl.uniform3iv(location, value);
      break;
    case 'fv1':
      gl.uniform1fv(location, value);
      break;
    case 'fv':
      gl.uniform3fv(location, value);
      break;
    case 'v2v':
      if (!uniform._array) {
        uniform._array = new Float32Array(2 * value.length);
      }
      for (i = 0, il = value.length; i < il; ++i) {
        uniform._array[i * 2] = value[i].x;
        uniform._array[i * 2 + 1] = value[i].y;
      }
      gl.uniform2fv(location, uniform._array);
      break;
    case 'v3v':
      if (!uniform._array) {
        uniform._array = new Float32Array(3 * value.length);
      }
      for (i = 0, il = value.length; i < il; ++i) {
        uniform._array[i * 3] = value[i].x;
        uniform._array[i * 3 + 1] = value[i].y;
        uniform._array[i * 3 + 2] = value[i].z;
      }
      gl.uniform3fv(location, uniform._array);
      break;
    case 'v4v':
      if (!uniform._array) {
        uniform._array = new Float32Array(4 * value.length);
      }
      for (i = 0, il = value.length; i < il; ++i) {
        uniform._array[i * 4] = value[i].x;
        uniform._array[i * 4 + 1] = value[i].y;
        uniform._array[i * 4 + 2] = value[i].z;
        uniform._array[i * 4 + 3] = value[i].w;
      }
      gl.uniform4fv(location, uniform._array);
      break;
    case 't':
    case 'sampler2D':
      if (!uniform.value || !uniform.value.baseTexture.hasLoaded) {
        break;
      }
      gl.activeTexture(gl['TEXTURE' + this.textureCount]);
      var texture = uniform.value.baseTexture._glTextures[gl.id];
      if (!texture) {
        this.initSampler2D(uniform);
        texture = uniform.value.baseTexture._glTextures[gl.id];
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniform._location, this.textureCount);
      this.textureCount++;
      break;
    default:
      console.warn('Pixi.js Shader Warning: Unknown uniform type: ' + uniform.type);
  }
};
Shader.prototype.syncUniforms = function() {
  this.textureCount = 1;
  for (var key in this.uniforms) {
    this.syncUniform(this.uniforms[key]);
  }
};
Shader.prototype.initSampler2D = function(uniform) {
  var gl = this.gl;
  var texture = uniform.value.baseTexture;
  if (!texture.hasLoaded) {
    return;
  }
  if (uniform.textureData) {
    var data = uniform.textureData;
    texture._glTextures[gl.id] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
    gl.texImage2D(gl.TEXTURE_2D, 0, data.luminance ? gl.LUMINANCE : gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, data.magFilter ? data.magFilter : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, data.wrapS ? data.wrapS : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, data.wrapS ? data.wrapS : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, data.wrapT ? data.wrapT : gl.CLAMP_TO_EDGE);
  } else {
    this.shaderManager.renderer.updateTexture(texture);
  }
};
Shader.prototype.destroy = function() {
  this.gl.deleteProgram(this.program);
  this.gl = null;
  this.uniforms = null;
  this.attributes = null;
  this.vertexSrc = null;
  this.fragmentSrc = null;
};
Shader.prototype._glCompile = function(type, src) {
  var shader = this.gl.createShader(type);
  this.gl.shaderSource(shader, src);
  this.gl.compileShader(shader);
  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    console.log(this.gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
};
