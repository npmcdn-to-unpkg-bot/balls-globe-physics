/* */ 
var Detector = {};
module.exports = Detector;
var SAT = require('./SAT');
var Pair = require('./Pair');
var Bounds = require('../geometry/Bounds');
(function() {
  Detector.collisions = function(broadphasePairs, engine) {
    var collisions = [],
        pairsTable = engine.pairs.table;
    var metrics = engine.metrics;
    for (var i = 0; i < broadphasePairs.length; i++) {
      var bodyA = broadphasePairs[i][0],
          bodyB = broadphasePairs[i][1];
      if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
        continue;
      if (!Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter))
        continue;
      metrics.midphaseTests += 1;
      if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {
        for (var j = bodyA.parts.length > 1 ? 1 : 0; j < bodyA.parts.length; j++) {
          var partA = bodyA.parts[j];
          for (var k = bodyB.parts.length > 1 ? 1 : 0; k < bodyB.parts.length; k++) {
            var partB = bodyB.parts[k];
            if ((partA === bodyA && partB === bodyB) || Bounds.overlaps(partA.bounds, partB.bounds)) {
              var pairId = Pair.id(partA, partB),
                  pair = pairsTable[pairId],
                  previousCollision;
              if (pair && pair.isActive) {
                previousCollision = pair.collision;
              } else {
                previousCollision = null;
              }
              var collision = SAT.collides(partA, partB, previousCollision);
              metrics.narrowphaseTests += 1;
              if (collision.reused)
                metrics.narrowReuseCount += 1;
              if (collision.collided) {
                collisions.push(collision);
                metrics.narrowDetections += 1;
              }
            }
          }
        }
      }
    }
    return collisions;
  };
  Detector.canCollide = function(filterA, filterB) {
    if (filterA.group === filterB.group && filterA.group !== 0)
      return filterA.group > 0;
    return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
  };
})();
