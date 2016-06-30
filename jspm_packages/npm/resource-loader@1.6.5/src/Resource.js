/* */ 
var EventEmitter = require('eventemitter3'),
    _url = require('url'),
    useXdr = !!(window.XDomainRequest && !('withCredentials' in (new XMLHttpRequest()))),
    tempAnchor = null;
function Resource(name, url, options) {
  EventEmitter.call(this);
  options = options || {};
  if (typeof name !== 'string' || typeof url !== 'string') {
    throw new Error('Both name and url are required for constructing a resource.');
  }
  this.name = name;
  this.url = url;
  this.isDataUrl = this.url.indexOf('data:') === 0;
  this.data = null;
  this.crossOrigin = options.crossOrigin === true ? 'anonymous' : options.crossOrigin;
  this.loadType = options.loadType || this._determineLoadType();
  this.xhrType = options.xhrType;
  this.metadata = options.metadata || {};
  this.error = null;
  this.xhr = null;
  this.isJson = false;
  this.isXml = false;
  this.isImage = false;
  this.isAudio = false;
  this.isVideo = false;
  this._dequeue = null;
  this._boundComplete = this.complete.bind(this);
  this._boundOnError = this._onError.bind(this);
  this._boundOnProgress = this._onProgress.bind(this);
  this._boundXhrOnError = this._xhrOnError.bind(this);
  this._boundXhrOnAbort = this._xhrOnAbort.bind(this);
  this._boundXhrOnLoad = this._xhrOnLoad.bind(this);
  this._boundXdrOnTimeout = this._xdrOnTimeout.bind(this);
}
Resource.prototype = Object.create(EventEmitter.prototype);
Resource.prototype.constructor = Resource;
module.exports = Resource;
Resource.prototype.complete = function() {
  if (this.data && this.data.removeEventListener) {
    this.data.removeEventListener('error', this._boundOnError);
    this.data.removeEventListener('load', this._boundComplete);
    this.data.removeEventListener('progress', this._boundOnProgress);
    this.data.removeEventListener('canplaythrough', this._boundComplete);
  }
  if (this.xhr) {
    if (this.xhr.removeEventListener) {
      this.xhr.removeEventListener('error', this._boundXhrOnError);
      this.xhr.removeEventListener('abort', this._boundXhrOnAbort);
      this.xhr.removeEventListener('progress', this._boundOnProgress);
      this.xhr.removeEventListener('load', this._boundXhrOnLoad);
    } else {
      this.xhr.onerror = null;
      this.xhr.ontimeout = null;
      this.xhr.onprogress = null;
      this.xhr.onload = null;
    }
  }
  this.emit('complete', this);
};
Resource.prototype.load = function(cb) {
  this.emit('start', this);
  if (cb) {
    this.once('complete', cb);
  }
  if (this.crossOrigin === false || typeof this.crossOrigin !== 'string') {
    this.crossOrigin = this._determineCrossOrigin(this.url);
  }
  switch (this.loadType) {
    case Resource.LOAD_TYPE.IMAGE:
      this._loadImage();
      break;
    case Resource.LOAD_TYPE.AUDIO:
      this._loadElement('audio');
      break;
    case Resource.LOAD_TYPE.VIDEO:
      this._loadElement('video');
      break;
    case Resource.LOAD_TYPE.XHR:
    default:
      if (useXdr && this.crossOrigin) {
        this._loadXdr();
      } else {
        this._loadXhr();
      }
      break;
  }
};
Resource.prototype._loadImage = function() {
  this.data = new Image();
  if (this.crossOrigin) {
    this.data.crossOrigin = this.crossOrigin;
  }
  this.data.src = this.url;
  this.isImage = true;
  this.data.addEventListener('error', this._boundOnError, false);
  this.data.addEventListener('load', this._boundComplete, false);
  this.data.addEventListener('progress', this._boundOnProgress, false);
};
Resource.prototype._loadElement = function(type) {
  if (type === 'audio' && typeof Audio !== 'undefined') {
    this.data = new Audio();
  } else {
    this.data = document.createElement(type);
  }
  if (this.data === null) {
    this.error = new Error('Unsupported element ' + type);
    this.complete();
    return;
  }
  if (navigator.isCocoonJS) {
    this.data.src = Array.isArray(this.url) ? this.url[0] : this.url;
  } else {
    if (Array.isArray(this.url)) {
      for (var i = 0; i < this.url.length; ++i) {
        this.data.appendChild(this._createSource(type, this.url[i]));
      }
    } else {
      this.data.appendChild(this._createSource(type, this.url));
    }
  }
  this['is' + type[0].toUpperCase() + type.substring(1)] = true;
  this.data.addEventListener('error', this._boundOnError, false);
  this.data.addEventListener('load', this._boundComplete, false);
  this.data.addEventListener('progress', this._boundOnProgress, false);
  this.data.addEventListener('canplaythrough', this._boundComplete, false);
  this.data.load();
};
Resource.prototype._loadXhr = function() {
  if (typeof this.xhrType !== 'string') {
    this.xhrType = this._determineXhrType();
  }
  var xhr = this.xhr = new XMLHttpRequest();
  xhr.open('GET', this.url, true);
  if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON || this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
    xhr.responseType = Resource.XHR_RESPONSE_TYPE.TEXT;
  } else {
    xhr.responseType = this.xhrType;
  }
  xhr.addEventListener('error', this._boundXhrOnError, false);
  xhr.addEventListener('abort', this._boundXhrOnAbort, false);
  xhr.addEventListener('progress', this._boundOnProgress, false);
  xhr.addEventListener('load', this._boundXhrOnLoad, false);
  xhr.send();
};
Resource.prototype._loadXdr = function() {
  if (typeof this.xhrType !== 'string') {
    this.xhrType = this._determineXhrType();
  }
  var xdr = this.xhr = new XDomainRequest();
  xdr.timeout = 5000;
  xdr.onerror = this._boundXhrOnError;
  xdr.ontimeout = this._boundXdrOnTimeout;
  xdr.onprogress = this._boundOnProgress;
  xdr.onload = this._boundXhrOnLoad;
  xdr.open('GET', this.url, true);
  setTimeout(function() {
    xdr.send();
  }, 0);
};
Resource.prototype._createSource = function(type, url, mime) {
  if (!mime) {
    mime = type + '/' + url.substr(url.lastIndexOf('.') + 1);
  }
  var source = document.createElement('source');
  source.src = url;
  source.type = mime;
  return source;
};
Resource.prototype._onError = function(event) {
  this.error = new Error('Failed to load element using ' + event.target.nodeName);
  this.complete();
};
Resource.prototype._onProgress = function(event) {
  if (event && event.lengthComputable) {
    this.emit('progress', this, event.loaded / event.total);
  }
};
Resource.prototype._xhrOnError = function() {
  this.error = new Error(reqType(this.xhr) + ' Request failed. ' + 'Status: ' + this.xhr.status + ', text: "' + this.xhr.statusText + '"');
  this.complete();
};
Resource.prototype._xhrOnAbort = function() {
  this.error = new Error(reqType(this.xhr) + ' Request was aborted by the user.');
  this.complete();
};
Resource.prototype._xdrOnTimeout = function() {
  this.error = new Error(reqType(this.xhr) + ' Request timed out.');
  this.complete();
};
Resource.prototype._xhrOnLoad = function() {
  var xhr = this.xhr,
      status = xhr.status !== undefined ? xhr.status : 200;
  if (status === 200 || status === 204 || (status === 0 && xhr.responseText.length > 0)) {
    if (this.xhrType === Resource.XHR_RESPONSE_TYPE.TEXT) {
      this.data = xhr.responseText;
    } else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON) {
      try {
        this.data = JSON.parse(xhr.responseText);
        this.isJson = true;
      } catch (e) {
        this.error = new Error('Error trying to parse loaded json:', e);
      }
    } else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
      try {
        if (window.DOMParser) {
          var domparser = new DOMParser();
          this.data = domparser.parseFromString(xhr.responseText, 'text/xml');
        } else {
          var div = document.createElement('div');
          div.innerHTML = xhr.responseText;
          this.data = div;
        }
        this.isXml = true;
      } catch (e) {
        this.error = new Error('Error trying to parse loaded xml:', e);
      }
    } else {
      this.data = xhr.response || xhr.responseText;
    }
  } else {
    this.error = new Error('[' + xhr.status + ']' + xhr.statusText + ':' + xhr.responseURL);
  }
  this.complete();
};
function reqType(xhr) {
  return xhr.toString().replace('object ', '');
}
Resource.prototype._determineCrossOrigin = function(url, loc) {
  if (url.indexOf('data:') === 0) {
    return '';
  }
  loc = loc || window.location;
  if (!tempAnchor) {
    tempAnchor = document.createElement('a');
  }
  tempAnchor.href = url;
  url = _url.parse(tempAnchor.href);
  var samePort = (!url.port && loc.port === '') || (url.port === loc.port);
  if (url.hostname !== loc.hostname || !samePort || url.protocol !== loc.protocol) {
    return 'anonymous';
  }
  return '';
};
Resource.prototype._determineXhrType = function() {
  return Resource._xhrTypeMap[this._getExtension()] || Resource.XHR_RESPONSE_TYPE.TEXT;
};
Resource.prototype._determineLoadType = function() {
  return Resource._loadTypeMap[this._getExtension()] || Resource.LOAD_TYPE.XHR;
};
Resource.prototype._getExtension = function() {
  var url = this.url,
      ext;
  if (this.isDataUrl) {
    var slashIndex = url.indexOf('/');
    ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
  } else {
    var queryStart = url.indexOf('?');
    if (queryStart !== -1) {
      url = url.substring(0, queryStart);
    }
    ext = url.substring(url.lastIndexOf('.') + 1);
  }
  return ext.toLowerCase();
};
Resource.prototype._getMimeFromXhrType = function(type) {
  switch (type) {
    case Resource.XHR_RESPONSE_TYPE.BUFFER:
      return 'application/octet-binary';
    case Resource.XHR_RESPONSE_TYPE.BLOB:
      return 'application/blob';
    case Resource.XHR_RESPONSE_TYPE.DOCUMENT:
      return 'application/xml';
    case Resource.XHR_RESPONSE_TYPE.JSON:
      return 'application/json';
    case Resource.XHR_RESPONSE_TYPE.DEFAULT:
    case Resource.XHR_RESPONSE_TYPE.TEXT:
    default:
      return 'text/plain';
  }
};
Resource.LOAD_TYPE = {
  XHR: 1,
  IMAGE: 2,
  AUDIO: 3,
  VIDEO: 4
};
Resource.XHR_READY_STATE = {
  UNSENT: 0,
  OPENED: 1,
  HEADERS_RECEIVED: 2,
  LOADING: 3,
  DONE: 4
};
Resource.XHR_RESPONSE_TYPE = {
  DEFAULT: 'text',
  BUFFER: 'arraybuffer',
  BLOB: 'blob',
  DOCUMENT: 'document',
  JSON: 'json',
  TEXT: 'text'
};
Resource._loadTypeMap = {
  'gif': Resource.LOAD_TYPE.IMAGE,
  'png': Resource.LOAD_TYPE.IMAGE,
  'bmp': Resource.LOAD_TYPE.IMAGE,
  'jpg': Resource.LOAD_TYPE.IMAGE,
  'jpeg': Resource.LOAD_TYPE.IMAGE,
  'tif': Resource.LOAD_TYPE.IMAGE,
  'tiff': Resource.LOAD_TYPE.IMAGE,
  'webp': Resource.LOAD_TYPE.IMAGE,
  'tga': Resource.LOAD_TYPE.IMAGE,
  'svg+xml': Resource.LOAD_TYPE.IMAGE
};
Resource._xhrTypeMap = {
  'xhtml': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
  'html': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
  'htm': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
  'xml': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
  'tmx': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
  'tsx': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
  'svg': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
  'gif': Resource.XHR_RESPONSE_TYPE.BLOB,
  'png': Resource.XHR_RESPONSE_TYPE.BLOB,
  'bmp': Resource.XHR_RESPONSE_TYPE.BLOB,
  'jpg': Resource.XHR_RESPONSE_TYPE.BLOB,
  'jpeg': Resource.XHR_RESPONSE_TYPE.BLOB,
  'tif': Resource.XHR_RESPONSE_TYPE.BLOB,
  'tiff': Resource.XHR_RESPONSE_TYPE.BLOB,
  'webp': Resource.XHR_RESPONSE_TYPE.BLOB,
  'tga': Resource.XHR_RESPONSE_TYPE.BLOB,
  'json': Resource.XHR_RESPONSE_TYPE.JSON,
  'text': Resource.XHR_RESPONSE_TYPE.TEXT,
  'txt': Resource.XHR_RESPONSE_TYPE.TEXT
};
Resource.setExtensionLoadType = function(extname, loadType) {
  setExtMap(Resource._loadTypeMap, extname, loadType);
};
Resource.setExtensionXhrType = function(extname, xhrType) {
  setExtMap(Resource._xhrTypeMap, extname, xhrType);
};
function setExtMap(map, extname, val) {
  if (extname && extname.indexOf('.') === 0) {
    extname = extname.substring(1);
  }
  if (!extname) {
    return;
  }
  map[extname] = val;
}
