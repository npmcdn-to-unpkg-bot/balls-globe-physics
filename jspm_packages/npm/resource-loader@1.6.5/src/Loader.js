/* */ 
(function(process) {
  var async = require('async'),
      urlParser = require('url'),
      Resource = require('./Resource'),
      EventEmitter = require('eventemitter3');
  function Loader(baseUrl, concurrency) {
    EventEmitter.call(this);
    concurrency = concurrency || 10;
    this.baseUrl = baseUrl || '';
    this.progress = 0;
    this.loading = false;
    this._progressChunk = 0;
    this._beforeMiddleware = [];
    this._afterMiddleware = [];
    this._boundLoadResource = this._loadResource.bind(this);
    this._boundOnLoad = this._onLoad.bind(this);
    this._buffer = [];
    this._numToLoad = 0;
    this._queue = async.queue(this._boundLoadResource, concurrency);
    this.resources = {};
  }
  Loader.prototype = Object.create(EventEmitter.prototype);
  Loader.prototype.constructor = Loader;
  module.exports = Loader;
  Loader.prototype.add = Loader.prototype.enqueue = function(name, url, options, cb) {
    if (Array.isArray(name)) {
      for (var i = 0; i < name.length; ++i) {
        this.add(name[i]);
      }
      return this;
    }
    if (typeof name === 'object') {
      cb = url || name.callback || name.onComplete;
      options = name;
      url = name.url;
      name = name.name || name.key || name.url;
    }
    if (typeof url !== 'string') {
      cb = options;
      options = url;
      url = name;
    }
    if (typeof url !== 'string') {
      throw new Error('No url passed to add resource to loader.');
    }
    if (typeof options === 'function') {
      cb = options;
      options = null;
    }
    if (this.resources[name]) {
      throw new Error('Resource with name "' + name + '" already exists.');
    }
    url = this._handleBaseUrl(url);
    this.resources[name] = new Resource(name, url, options);
    if (typeof cb === 'function') {
      this.resources[name].once('afterMiddleware', cb);
    }
    this._numToLoad++;
    if (this._queue.started) {
      this._queue.push(this.resources[name]);
      this._progressChunk = (100 - this.progress) / (this._queue.length() + this._queue.running());
    } else {
      this._buffer.push(this.resources[name]);
      this._progressChunk = 100 / this._buffer.length;
    }
    return this;
  };
  Loader.prototype._handleBaseUrl = function(url) {
    var parsedUrl = urlParser.parse(url);
    if (parsedUrl.protocol || !parsedUrl.pathname || parsedUrl.pathname.indexOf('//') === 0) {
      return url;
    }
    if (this.baseUrl.length && this.baseUrl.lastIndexOf('/') !== this.baseUrl.length - 1 && url.charAt(0) !== '/') {
      return this.baseUrl + '/' + url;
    } else {
      return this.baseUrl + url;
    }
  };
  Loader.prototype.before = Loader.prototype.pre = function(fn) {
    this._beforeMiddleware.push(fn);
    return this;
  };
  Loader.prototype.after = Loader.prototype.use = function(fn) {
    this._afterMiddleware.push(fn);
    return this;
  };
  Loader.prototype.reset = function() {
    this.progress = 0;
    this.loading = false;
    this._progressChunk = 0;
    this._buffer.length = 0;
    this._numToLoad = 0;
    this._queue.kill();
    this._queue.started = false;
    this.resources = {};
  };
  Loader.prototype.load = function(cb) {
    if (typeof cb === 'function') {
      this.once('complete', cb);
    }
    if (this._queue.started) {
      return this;
    }
    this.emit('start', this);
    for (var i = 0; i < this._buffer.length; ++i) {
      this._queue.push(this._buffer[i]);
    }
    this._buffer.length = 0;
    return this;
  };
  Loader.prototype._loadResource = function(resource, dequeue) {
    var self = this;
    resource._dequeue = dequeue;
    this._runMiddleware(resource, this._beforeMiddleware, function() {
      resource.load(self._boundOnLoad);
    });
  };
  Loader.prototype._onComplete = function() {
    this.emit('complete', this, this.resources);
  };
  Loader.prototype._onLoad = function(resource) {
    this.progress += this._progressChunk;
    this.emit('progress', this, resource);
    this._runMiddleware(resource, this._afterMiddleware, function() {
      resource.emit('afterMiddleware', resource);
      this._numToLoad--;
      if (resource.error) {
        this.emit('error', resource.error, this, resource);
      } else {
        this.emit('load', this, resource);
      }
      if (this._numToLoad === 0) {
        this.progress = 100;
        this._onComplete();
      }
    });
    resource._dequeue();
  };
  Loader.prototype._runMiddleware = function(resource, fns, cb) {
    var self = this;
    async.eachSeries(fns, function(fn, next) {
      fn.call(self, resource, next);
    }, cb.bind(this, resource));
  };
  Loader.LOAD_TYPE = Resource.LOAD_TYPE;
  Loader.XHR_READY_STATE = Resource.XHR_READY_STATE;
  Loader.XHR_RESPONSE_TYPE = Resource.XHR_RESPONSE_TYPE;
})(require('process'));
