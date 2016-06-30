/* */ 
var Pairs = {};
module.exports = Pairs;
var Pair = require('./Pair');
var Common = require('../core/Common');
(function() {
  var _pairMaxIdleLife = 1000;
  Pairs.create = function(options) {
    return Common.extend({
      table: {},
      list: [],
      collisionStart: [],
      collisionActive: [],
      collisionEnd: []
    }, options);
  };
  Pairs.update = function(pairs, collisions, timestamp) {
    var pairsList = pairs.list,
        pairsTable = pairs.table,
        collisionStart = pairs.collisionStart,
        collisionEnd = pairs.collisionEnd,
        collisionActive = pairs.collisionActive,
        activePairIds = [],
        collision,
        pairId,
        pair,
        i;
    collisionStart.length = 0;
    collisionEnd.length = 0;
    collisionActive.length = 0;
    for (i = 0; i < collisions.length; i++) {
      collision = collisions[i];
      if (collision.collided) {
        pairId = Pair.id(collision.bodyA, collision.bodyB);
        activePairIds.push(pairId);
        pair = pairsTable[pairId];
        if (pair) {
          if (pair.isActive) {
            collisionActive.push(pair);
          } else {
            collisionStart.push(pair);
          }
          Pair.update(pair, collision, timestamp);
        } else {
          pair = Pair.create(collision, timestamp);
          pairsTable[pairId] = pair;
          collisionStart.push(pair);
          pairsList.push(pair);
        }
      }
    }
    for (i = 0; i < pairsList.length; i++) {
      pair = pairsList[i];
      if (pair.isActive && Common.indexOf(activePairIds, pair.id) === -1) {
        Pair.setActive(pair, false, timestamp);
        collisionEnd.push(pair);
      }
    }
  };
  Pairs.removeOld = function(pairs, timestamp) {
    var pairsList = pairs.list,
        pairsTable = pairs.table,
        indexesToRemove = [],
        pair,
        collision,
        pairIndex,
        i;
    for (i = 0; i < pairsList.length; i++) {
      pair = pairsList[i];
      collision = pair.collision;
      if (collision.bodyA.isSleeping || collision.bodyB.isSleeping) {
        pair.timeUpdated = timestamp;
        continue;
      }
      if (timestamp - pair.timeUpdated > _pairMaxIdleLife) {
        indexesToRemove.push(i);
      }
    }
    for (i = 0; i < indexesToRemove.length; i++) {
      pairIndex = indexesToRemove[i] - i;
      pair = pairsList[pairIndex];
      delete pairsTable[pair.id];
      pairsList.splice(pairIndex, 1);
    }
  };
  Pairs.clear = function(pairs) {
    pairs.table = {};
    pairs.list.length = 0;
    pairs.collisionStart.length = 0;
    pairs.collisionActive.length = 0;
    pairs.collisionEnd.length = 0;
    return pairs;
  };
})();
