/* */ 
(function(process) {
  var core = require('../../core/index');
  var fs = require('fs');
  function ColorMatrixFilter() {
    core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/colorMatrix.frag', 'utf8'), {m: {
        type: '1fv',
        value: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
      }});
  }
  ColorMatrixFilter.prototype = Object.create(core.AbstractFilter.prototype);
  ColorMatrixFilter.prototype.constructor = ColorMatrixFilter;
  module.exports = ColorMatrixFilter;
  ColorMatrixFilter.prototype._loadMatrix = function(matrix, multiply) {
    multiply = !!multiply;
    var newMatrix = matrix;
    if (multiply) {
      this._multiply(newMatrix, this.uniforms.m.value, matrix);
      newMatrix = this._colorMatrix(newMatrix);
    }
    this.uniforms.m.value = newMatrix;
  };
  ColorMatrixFilter.prototype._multiply = function(out, a, b) {
    out[0] = (a[0] * b[0]) + (a[1] * b[5]) + (a[2] * b[10]) + (a[3] * b[15]);
    out[1] = (a[0] * b[1]) + (a[1] * b[6]) + (a[2] * b[11]) + (a[3] * b[16]);
    out[2] = (a[0] * b[2]) + (a[1] * b[7]) + (a[2] * b[12]) + (a[3] * b[17]);
    out[3] = (a[0] * b[3]) + (a[1] * b[8]) + (a[2] * b[13]) + (a[3] * b[18]);
    out[4] = (a[0] * b[4]) + (a[1] * b[9]) + (a[2] * b[14]) + (a[3] * b[19]);
    out[5] = (a[5] * b[0]) + (a[6] * b[5]) + (a[7] * b[10]) + (a[8] * b[15]);
    out[6] = (a[5] * b[1]) + (a[6] * b[6]) + (a[7] * b[11]) + (a[8] * b[16]);
    out[7] = (a[5] * b[2]) + (a[6] * b[7]) + (a[7] * b[12]) + (a[8] * b[17]);
    out[8] = (a[5] * b[3]) + (a[6] * b[8]) + (a[7] * b[13]) + (a[8] * b[18]);
    out[9] = (a[5] * b[4]) + (a[6] * b[9]) + (a[7] * b[14]) + (a[8] * b[19]);
    out[10] = (a[10] * b[0]) + (a[11] * b[5]) + (a[12] * b[10]) + (a[13] * b[15]);
    out[11] = (a[10] * b[1]) + (a[11] * b[6]) + (a[12] * b[11]) + (a[13] * b[16]);
    out[12] = (a[10] * b[2]) + (a[11] * b[7]) + (a[12] * b[12]) + (a[13] * b[17]);
    out[13] = (a[10] * b[3]) + (a[11] * b[8]) + (a[12] * b[13]) + (a[13] * b[18]);
    out[14] = (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]);
    out[15] = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15]);
    out[16] = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16]);
    out[17] = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17]);
    out[18] = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18]);
    out[19] = (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]);
    return out;
  };
  ColorMatrixFilter.prototype._colorMatrix = function(matrix) {
    var m = new Float32Array(matrix);
    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;
    return m;
  };
  ColorMatrixFilter.prototype.brightness = function(b, multiply) {
    var matrix = [b, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.greyscale = function(scale, multiply) {
    var matrix = [scale, scale, scale, 0, 0, scale, scale, scale, 0, 0, scale, scale, scale, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.grayscale = ColorMatrixFilter.prototype.greyscale;
  ColorMatrixFilter.prototype.blackAndWhite = function(multiply) {
    var matrix = [0.3, 0.6, 0.1, 0, 0, 0.3, 0.6, 0.1, 0, 0, 0.3, 0.6, 0.1, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.hue = function(rotation, multiply) {
    rotation = (rotation || 0) / 180 * Math.PI;
    var cos = Math.cos(rotation),
        sin = Math.sin(rotation);
    var lumR = 0.213,
        lumG = 0.715,
        lumB = 0.072;
    var matrix = [lumR + cos * (1 - lumR) + sin * (-lumR), lumG + cos * (-lumG) + sin * (-lumG), lumB + cos * (-lumB) + sin * (1 - lumB), 0, 0, lumR + cos * (-lumR) + sin * (0.143), lumG + cos * (1 - lumG) + sin * (0.140), lumB + cos * (-lumB) + sin * (-0.283), 0, 0, lumR + cos * (-lumR) + sin * (-(1 - lumR)), lumG + cos * (-lumG) + sin * (lumG), lumB + cos * (1 - lumB) + sin * (lumB), 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.contrast = function(amount, multiply) {
    var v = (amount || 0) + 1;
    var o = -128 * (v - 1);
    var matrix = [v, 0, 0, 0, o, 0, v, 0, 0, o, 0, 0, v, 0, o, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.saturate = function(amount, multiply) {
    var x = (amount || 0) * 2 / 3 + 1;
    var y = ((x - 1) * -0.5);
    var matrix = [x, y, y, 0, 0, y, x, y, 0, 0, y, y, x, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.desaturate = function(multiply) {
    this.saturate(-1);
  };
  ColorMatrixFilter.prototype.negative = function(multiply) {
    var matrix = [0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.sepia = function(multiply) {
    var matrix = [0.393, 0.7689999, 0.18899999, 0, 0, 0.349, 0.6859999, 0.16799999, 0, 0, 0.272, 0.5339999, 0.13099999, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.technicolor = function(multiply) {
    var matrix = [1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 11.793603434377337, -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -70.35205161461398, -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.polaroid = function(multiply) {
    var matrix = [1.438, -0.062, -0.062, 0, 0, -0.122, 1.378, -0.122, 0, 0, -0.016, -0.016, 1.483, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.toBGR = function(multiply) {
    var matrix = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.kodachrome = function(multiply) {
    var matrix = [1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 63.72958762196502, -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 24.732407896706203, -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.browni = function(multiply) {
    var matrix = [0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 47.43192855600873, -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -36.96841498319127, 0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -7.562075277591283, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.vintage = function(multiply) {
    var matrix = [0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 9.651285835294123, 0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 7.462829176470591, 0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 5.159190588235296, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.colorTone = function(desaturation, toned, lightColor, darkColor, multiply) {
    desaturation = desaturation || 0.2;
    toned = toned || 0.15;
    lightColor = lightColor || 0xFFE580;
    darkColor = darkColor || 0x338000;
    var lR = ((lightColor >> 16) & 0xFF) / 255;
    var lG = ((lightColor >> 8) & 0xFF) / 255;
    var lB = (lightColor & 0xFF) / 255;
    var dR = ((darkColor >> 16) & 0xFF) / 255;
    var dG = ((darkColor >> 8) & 0xFF) / 255;
    var dB = (darkColor & 0xFF) / 255;
    var matrix = [0.3, 0.59, 0.11, 0, 0, lR, lG, lB, desaturation, 0, dR, dG, dB, toned, 0, lR - dR, lG - dG, lB - dB, 0, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.night = function(intensity, multiply) {
    intensity = intensity || 0.1;
    var matrix = [intensity * (-2.0), -intensity, 0, 0, 0, -intensity, 0, intensity, 0, 0, 0, intensity, intensity * 2.0, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.predator = function(amount, multiply) {
    var matrix = [11.224130630493164 * amount, -4.794486999511719 * amount, -2.8746118545532227 * amount, 0 * amount, 0.40342438220977783 * amount, -3.6330697536468506 * amount, 9.193157196044922 * amount, -2.951810836791992 * amount, 0 * amount, -1.316135048866272 * amount, -3.2184197902679443 * amount, -4.2375030517578125 * amount, 7.476448059082031 * amount, 0 * amount, 0.8044459223747253 * amount, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.lsd = function(multiply) {
    var matrix = [2, -0.4, 0.5, 0, 0, -0.5, 2, -0.4, 0, 0, -0.4, -0.5, 3, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter.prototype.reset = function() {
    var matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    this._loadMatrix(matrix, false);
  };
  Object.defineProperties(ColorMatrixFilter.prototype, {matrix: {
      get: function() {
        return this.uniforms.m.value;
      },
      set: function(value) {
        this.uniforms.m.value = value;
      }
    }});
})(require('process'));
