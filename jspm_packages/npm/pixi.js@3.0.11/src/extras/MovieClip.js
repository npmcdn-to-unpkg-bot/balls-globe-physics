/* */ 
var core = require('../core/index');
function MovieClip(textures) {
  core.Sprite.call(this, textures[0] instanceof core.Texture ? textures[0] : textures[0].texture);
  this._textures = null;
  this._durations = null;
  this.textures = textures;
  this.animationSpeed = 1;
  this.loop = true;
  this.onComplete = null;
  this._currentTime = 0;
  this.playing = false;
}
MovieClip.prototype = Object.create(core.Sprite.prototype);
MovieClip.prototype.constructor = MovieClip;
module.exports = MovieClip;
Object.defineProperties(MovieClip.prototype, {
  totalFrames: {get: function() {
      return this._textures.length;
    }},
  textures: {
    get: function() {
      return this._textures;
    },
    set: function(value) {
      if (value[0] instanceof core.Texture) {
        this._textures = value;
        this._durations = null;
      } else {
        this._textures = [];
        this._durations = [];
        for (var i = 0; i < value.length; i++) {
          this._textures.push(value[i].texture);
          this._durations.push(value[i].time);
        }
      }
    }
  },
  currentFrame: {get: function() {
      var currentFrame = Math.floor(this._currentTime) % this._textures.length;
      if (currentFrame < 0) {
        currentFrame += this._textures.length;
      }
      return currentFrame;
    }}
});
MovieClip.prototype.stop = function() {
  if (!this.playing) {
    return;
  }
  this.playing = false;
  core.ticker.shared.remove(this.update, this);
};
MovieClip.prototype.play = function() {
  if (this.playing) {
    return;
  }
  this.playing = true;
  core.ticker.shared.add(this.update, this);
};
MovieClip.prototype.gotoAndStop = function(frameNumber) {
  this.stop();
  this._currentTime = frameNumber;
  this._texture = this._textures[this.currentFrame];
};
MovieClip.prototype.gotoAndPlay = function(frameNumber) {
  this._currentTime = frameNumber;
  this.play();
};
MovieClip.prototype.update = function(deltaTime) {
  var elapsed = this.animationSpeed * deltaTime;
  if (this._durations !== null) {
    var lag = this._currentTime % 1 * this._durations[this.currentFrame];
    lag += elapsed / 60 * 1000;
    while (lag < 0) {
      this._currentTime--;
      lag += this._durations[this.currentFrame];
    }
    var sign = Math.sign(this.animationSpeed * deltaTime);
    this._currentTime = Math.floor(this._currentTime);
    while (lag >= this._durations[this.currentFrame]) {
      lag -= this._durations[this.currentFrame] * sign;
      this._currentTime += sign;
    }
    this._currentTime += lag / this._durations[this.currentFrame];
  } else {
    this._currentTime += elapsed;
  }
  if (this._currentTime < 0 && !this.loop) {
    this.gotoAndStop(0);
    if (this.onComplete) {
      this.onComplete();
    }
  } else if (this._currentTime >= this._textures.length && !this.loop) {
    this.gotoAndStop(this._textures.length - 1);
    if (this.onComplete) {
      this.onComplete();
    }
  } else {
    this._texture = this._textures[this.currentFrame];
  }
};
MovieClip.prototype.destroy = function() {
  this.stop();
  core.Sprite.prototype.destroy.call(this);
};
MovieClip.fromFrames = function(frames) {
  var textures = [];
  for (var i = 0; i < frames.length; ++i) {
    textures.push(new core.Texture.fromFrame(frames[i]));
  }
  return new MovieClip(textures);
};
MovieClip.fromImages = function(images) {
  var textures = [];
  for (var i = 0; i < images.length; ++i) {
    textures.push(new core.Texture.fromImage(images[i]));
  }
  return new MovieClip(textures);
};
