/* */ 
var CONST = require('../const');
var utils = module.exports = {
  _uid: 0,
  _saidHello: false,
  EventEmitter: require('eventemitter3'),
  pluginTarget: require('./pluginTarget'),
  async: require('async'),
  uid: function() {
    return ++utils._uid;
  },
  hex2rgb: function(hex, out) {
    out = out || [];
    out[0] = (hex >> 16 & 0xFF) / 255;
    out[1] = (hex >> 8 & 0xFF) / 255;
    out[2] = (hex & 0xFF) / 255;
    return out;
  },
  hex2string: function(hex) {
    hex = hex.toString(16);
    hex = '000000'.substr(0, 6 - hex.length) + hex;
    return '#' + hex;
  },
  rgb2hex: function(rgb) {
    return ((rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + rgb[2] * 255);
  },
  canUseNewCanvasBlendModes: function() {
    if (typeof document === 'undefined') {
      return false;
    }
    var pngHead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
    var pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
    var magenta = new Image();
    magenta.src = pngHead + 'AP804Oa6' + pngEnd;
    var yellow = new Image();
    yellow.src = pngHead + '/wCKxvRF' + pngEnd;
    var canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;
    var context = canvas.getContext('2d');
    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta, 0, 0);
    context.drawImage(yellow, 2, 0);
    var data = context.getImageData(2, 0, 1, 1).data;
    return (data[0] === 255 && data[1] === 0 && data[2] === 0);
  },
  getNextPowerOfTwo: function(number) {
    if (number > 0 && (number & (number - 1)) === 0) {
      return number;
    } else {
      var result = 1;
      while (result < number) {
        result <<= 1;
      }
      return result;
    }
  },
  isPowerOfTwo: function(width, height) {
    return (width > 0 && (width & (width - 1)) === 0 && height > 0 && (height & (height - 1)) === 0);
  },
  getResolutionOfUrl: function(url) {
    var resolution = CONST.RETINA_PREFIX.exec(url);
    if (resolution) {
      return parseFloat(resolution[1]);
    }
    return 1;
  },
  sayHello: function(type) {
    if (utils._saidHello) {
      return;
    }
    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
      var args = ['\n %c %c %c Pixi.js ' + CONST.VERSION + ' - ✰ ' + type + ' ✰  %c ' + ' %c ' + ' http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n', 'background: #ff66a5; padding:5px 0;', 'background: #ff66a5; padding:5px 0;', 'color: #ff66a5; background: #030307; padding:5px 0;', 'background: #ff66a5; padding:5px 0;', 'background: #ffc3dc; padding:5px 0;', 'background: #ff66a5; padding:5px 0;', 'color: #ff2424; background: #fff; padding:5px 0;', 'color: #ff2424; background: #fff; padding:5px 0;', 'color: #ff2424; background: #fff; padding:5px 0;'];
      window.console.log.apply(console, args);
    } else if (window.console) {
      window.console.log('Pixi.js ' + CONST.VERSION + ' - ' + type + ' - http://www.pixijs.com/');
    }
    utils._saidHello = true;
  },
  isWebGLSupported: function() {
    var contextOptions = {stencil: true};
    try {
      if (!window.WebGLRenderingContext) {
        return false;
      }
      var canvas = document.createElement('canvas'),
          gl = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);
      return !!(gl && gl.getContextAttributes().stencil);
    } catch (e) {
      return false;
    }
  },
  sign: function(n) {
    return n ? (n < 0 ? -1 : 1) : 0;
  },
  removeItems: function(arr, startIdx, removeCount) {
    var length = arr.length;
    if (startIdx >= length || removeCount === 0) {
      return;
    }
    removeCount = (startIdx + removeCount > length ? length - startIdx : removeCount);
    for (var i = startIdx,
        len = length - removeCount; i < len; ++i) {
      arr[i] = arr[i + removeCount];
    }
    arr.length = len;
  },
  TextureCache: {},
  BaseTextureCache: {}
};
