/* */ 
var Sleeping = {};
module.exports = Sleeping;
var Events = require('./Events');
(function() {
  Sleeping._motionWakeThreshold = 0.18;
  Sleeping._motionSleepThreshold = 0.08;
  Sleeping._minBias = 0.9;
  Sleeping.update = function(bodies, timeScale) {
    var timeFactor = timeScale * timeScale * timeScale;
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i],
          motion = body.speed * body.speed + body.angularSpeed * body.angularSpeed;
      if (body.force.x !== 0 || body.force.y !== 0) {
        Sleeping.set(body, false);
        continue;
      }
      var minMotion = Math.min(body.motion, motion),
          maxMotion = Math.max(body.motion, motion);
      body.motion = Sleeping._minBias * minMotion + (1 - Sleeping._minBias) * maxMotion;
      if (body.sleepThreshold > 0 && body.motion < Sleeping._motionSleepThreshold * timeFactor) {
        body.sleepCounter += 1;
        if (body.sleepCounter >= body.sleepThreshold)
          Sleeping.set(body, true);
      } else if (body.sleepCounter > 0) {
        body.sleepCounter -= 1;
      }
    }
  };
  Sleeping.afterCollisions = function(pairs, timeScale) {
    var timeFactor = timeScale * timeScale * timeScale;
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      if (!pair.isActive)
        continue;
      var collision = pair.collision,
          bodyA = collision.bodyA.parent,
          bodyB = collision.bodyB.parent;
      if ((bodyA.isSleeping && bodyB.isSleeping) || bodyA.isStatic || bodyB.isStatic)
        continue;
      if (bodyA.isSleeping || bodyB.isSleeping) {
        var sleepingBody = (bodyA.isSleeping && !bodyA.isStatic) ? bodyA : bodyB,
            movingBody = sleepingBody === bodyA ? bodyB : bodyA;
        if (!sleepingBody.isStatic && movingBody.motion > Sleeping._motionWakeThreshold * timeFactor) {
          Sleeping.set(sleepingBody, false);
        }
      }
    }
  };
  Sleeping.set = function(body, isSleeping) {
    var wasSleeping = body.isSleeping;
    if (isSleeping) {
      body.isSleeping = true;
      body.sleepCounter = body.sleepThreshold;
      body.positionImpulse.x = 0;
      body.positionImpulse.y = 0;
      body.positionPrev.x = body.position.x;
      body.positionPrev.y = body.position.y;
      body.anglePrev = body.angle;
      body.speed = 0;
      body.angularSpeed = 0;
      body.motion = 0;
      if (!wasSleeping) {
        Events.trigger(body, 'sleepStart');
      }
    } else {
      body.isSleeping = false;
      body.sleepCounter = 0;
      if (wasSleeping) {
        Events.trigger(body, 'sleepEnd');
      }
    }
  };
})();
