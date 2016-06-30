/* */ 
var World = {};
module.exports = World;
var Composite = require('./Composite');
var Constraint = require('../constraint/Constraint');
var Common = require('../core/Common');
(function() {
  World.create = function(options) {
    var composite = Composite.create();
    var defaults = {
      label: 'World',
      gravity: {
        x: 0,
        y: 1,
        scale: 0.001
      },
      bounds: {
        min: {
          x: -Infinity,
          y: -Infinity
        },
        max: {
          x: Infinity,
          y: Infinity
        }
      }
    };
    return Common.extend(composite, defaults, options);
  };
})();
