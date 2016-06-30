/* */ 
var Grid = {};
module.exports = Grid;
var Pair = require('./Pair');
var Detector = require('./Detector');
var Common = require('../core/Common');
(function() {
  Grid.create = function(options) {
    var defaults = {
      controller: Grid,
      detector: Detector.collisions,
      buckets: {},
      pairs: {},
      pairsList: [],
      bucketWidth: 48,
      bucketHeight: 48
    };
    return Common.extend(defaults, options);
  };
  Grid.update = function(grid, bodies, engine, forceUpdate) {
    var i,
        col,
        row,
        world = engine.world,
        buckets = grid.buckets,
        bucket,
        bucketId,
        gridChanged = false;
    var metrics = engine.metrics;
    metrics.broadphaseTests = 0;
    for (i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      if (body.isSleeping && !forceUpdate)
        continue;
      if (body.bounds.max.x < world.bounds.min.x || body.bounds.min.x > world.bounds.max.x || body.bounds.max.y < world.bounds.min.y || body.bounds.min.y > world.bounds.max.y)
        continue;
      var newRegion = _getRegion(grid, body);
      if (!body.region || newRegion.id !== body.region.id || forceUpdate) {
        metrics.broadphaseTests += 1;
        if (!body.region || forceUpdate)
          body.region = newRegion;
        var union = _regionUnion(newRegion, body.region);
        for (col = union.startCol; col <= union.endCol; col++) {
          for (row = union.startRow; row <= union.endRow; row++) {
            bucketId = _getBucketId(col, row);
            bucket = buckets[bucketId];
            var isInsideNewRegion = (col >= newRegion.startCol && col <= newRegion.endCol && row >= newRegion.startRow && row <= newRegion.endRow);
            var isInsideOldRegion = (col >= body.region.startCol && col <= body.region.endCol && row >= body.region.startRow && row <= body.region.endRow);
            if (!isInsideNewRegion && isInsideOldRegion) {
              if (isInsideOldRegion) {
                if (bucket)
                  _bucketRemoveBody(grid, bucket, body);
              }
            }
            if (body.region === newRegion || (isInsideNewRegion && !isInsideOldRegion) || forceUpdate) {
              if (!bucket)
                bucket = _createBucket(buckets, bucketId);
              _bucketAddBody(grid, bucket, body);
            }
          }
        }
        body.region = newRegion;
        gridChanged = true;
      }
    }
    if (gridChanged)
      grid.pairsList = _createActivePairsList(grid);
  };
  Grid.clear = function(grid) {
    grid.buckets = {};
    grid.pairs = {};
    grid.pairsList = [];
  };
  var _regionUnion = function(regionA, regionB) {
    var startCol = Math.min(regionA.startCol, regionB.startCol),
        endCol = Math.max(regionA.endCol, regionB.endCol),
        startRow = Math.min(regionA.startRow, regionB.startRow),
        endRow = Math.max(regionA.endRow, regionB.endRow);
    return _createRegion(startCol, endCol, startRow, endRow);
  };
  var _getRegion = function(grid, body) {
    var bounds = body.bounds,
        startCol = Math.floor(bounds.min.x / grid.bucketWidth),
        endCol = Math.floor(bounds.max.x / grid.bucketWidth),
        startRow = Math.floor(bounds.min.y / grid.bucketHeight),
        endRow = Math.floor(bounds.max.y / grid.bucketHeight);
    return _createRegion(startCol, endCol, startRow, endRow);
  };
  var _createRegion = function(startCol, endCol, startRow, endRow) {
    return {
      id: startCol + ',' + endCol + ',' + startRow + ',' + endRow,
      startCol: startCol,
      endCol: endCol,
      startRow: startRow,
      endRow: endRow
    };
  };
  var _getBucketId = function(column, row) {
    return column + ',' + row;
  };
  var _createBucket = function(buckets, bucketId) {
    var bucket = buckets[bucketId] = [];
    return bucket;
  };
  var _bucketAddBody = function(grid, bucket, body) {
    for (var i = 0; i < bucket.length; i++) {
      var bodyB = bucket[i];
      if (body.id === bodyB.id || (body.isStatic && bodyB.isStatic))
        continue;
      var pairId = Pair.id(body, bodyB),
          pair = grid.pairs[pairId];
      if (pair) {
        pair[2] += 1;
      } else {
        grid.pairs[pairId] = [body, bodyB, 1];
      }
    }
    bucket.push(body);
  };
  var _bucketRemoveBody = function(grid, bucket, body) {
    bucket.splice(Common.indexOf(bucket, body), 1);
    for (var i = 0; i < bucket.length; i++) {
      var bodyB = bucket[i],
          pairId = Pair.id(body, bodyB),
          pair = grid.pairs[pairId];
      if (pair)
        pair[2] -= 1;
    }
  };
  var _createActivePairsList = function(grid) {
    var pairKeys,
        pair,
        pairs = [];
    pairKeys = Common.keys(grid.pairs);
    for (var k = 0; k < pairKeys.length; k++) {
      pair = grid.pairs[pairKeys[k]];
      if (pair[2] > 0) {
        pairs.push(pair);
      } else {
        delete grid.pairs[pairKeys[k]];
      }
    }
    return pairs;
  };
})();
