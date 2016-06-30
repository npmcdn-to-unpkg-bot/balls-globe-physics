/* */ 
(function(process) {
  var BaseTexture = require('./BaseTexture'),
      utils = require('../utils/index');
  function VideoBaseTexture(source, scaleMode) {
    if (!source) {
      throw new Error('No video source element specified.');
    }
    if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height) {
      source.complete = true;
    }
    BaseTexture.call(this, source, scaleMode);
    this.autoUpdate = false;
    this._onUpdate = this._onUpdate.bind(this);
    this._onCanPlay = this._onCanPlay.bind(this);
    if (!source.complete) {
      source.addEventListener('canplay', this._onCanPlay);
      source.addEventListener('canplaythrough', this._onCanPlay);
      source.addEventListener('play', this._onPlayStart.bind(this));
      source.addEventListener('pause', this._onPlayStop.bind(this));
    }
    this.__loaded = false;
  }
  VideoBaseTexture.prototype = Object.create(BaseTexture.prototype);
  VideoBaseTexture.prototype.constructor = VideoBaseTexture;
  module.exports = VideoBaseTexture;
  VideoBaseTexture.prototype._onUpdate = function() {
    if (this.autoUpdate) {
      window.requestAnimationFrame(this._onUpdate);
      this.update();
    }
  };
  VideoBaseTexture.prototype._onPlayStart = function() {
    if (!this.autoUpdate) {
      window.requestAnimationFrame(this._onUpdate);
      this.autoUpdate = true;
    }
  };
  VideoBaseTexture.prototype._onPlayStop = function() {
    this.autoUpdate = false;
  };
  VideoBaseTexture.prototype._onCanPlay = function() {
    this.hasLoaded = true;
    if (this.source) {
      this.source.removeEventListener('canplay', this._onCanPlay);
      this.source.removeEventListener('canplaythrough', this._onCanPlay);
      this.width = this.source.videoWidth;
      this.height = this.source.videoHeight;
      this.source.play();
      if (!this.__loaded) {
        this.__loaded = true;
        this.emit('loaded', this);
      }
    }
  };
  VideoBaseTexture.prototype.destroy = function() {
    if (this.source && this.source._pixiId) {
      delete utils.BaseTextureCache[this.source._pixiId];
      delete this.source._pixiId;
    }
    BaseTexture.prototype.destroy.call(this);
  };
  VideoBaseTexture.fromVideo = function(video, scaleMode) {
    if (!video._pixiId) {
      video._pixiId = 'video_' + utils.uid();
    }
    var baseTexture = utils.BaseTextureCache[video._pixiId];
    if (!baseTexture) {
      baseTexture = new VideoBaseTexture(video, scaleMode);
      utils.BaseTextureCache[video._pixiId] = baseTexture;
    }
    return baseTexture;
  };
  VideoBaseTexture.fromUrl = function(videoSrc, scaleMode) {
    var video = document.createElement('video');
    if (Array.isArray(videoSrc)) {
      for (var i = 0; i < videoSrc.length; ++i) {
        video.appendChild(createSource(videoSrc[i].src || videoSrc[i], videoSrc[i].mime));
      }
    } else {
      video.appendChild(createSource(videoSrc.src || videoSrc, videoSrc.mime));
    }
    video.load();
    video.play();
    return VideoBaseTexture.fromVideo(video, scaleMode);
  };
  VideoBaseTexture.fromUrls = VideoBaseTexture.fromUrl;
  function createSource(path, type) {
    if (!type) {
      type = 'video/' + path.substr(path.lastIndexOf('.') + 1);
    }
    var source = document.createElement('source');
    source.src = path;
    source.type = type;
    return source;
  }
})(require('process'));
