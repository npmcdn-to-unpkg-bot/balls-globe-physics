/* */ 
var core = require('../../core/index');
var fs = require('fs');
function RGBSplitFilter() {
  core.AbstractFilter.call(this, null, fs.readFileSync(__dirname + '/rgbSplit.frag', 'utf8'), {
    red: {
      type: 'v2',
      value: {
        x: 20,
        y: 20
      }
    },
    green: {
      type: 'v2',
      value: {
        x: -20,
        y: 20
      }
    },
    blue: {
      type: 'v2',
      value: {
        x: 20,
        y: -20
      }
    },
    dimensions: {
      type: '4fv',
      value: [0, 0, 0, 0]
    }
  });
}
RGBSplitFilter.prototype = Object.create(core.AbstractFilter.prototype);
RGBSplitFilter.prototype.constructor = RGBSplitFilter;
module.exports = RGBSplitFilter;
Object.defineProperties(RGBSplitFilter.prototype, {
  red: {
    get: function() {
      return this.uniforms.red.value;
    },
    set: function(value) {
      this.uniforms.red.value = value;
    }
  },
  green: {
    get: function() {
      return this.uniforms.green.value;
    },
    set: function(value) {
      this.uniforms.green.value = value;
    }
  },
  blue: {
    get: function() {
      return this.uniforms.blue.value;
    },
    set: function(value) {
      this.uniforms.blue.value = value;
    }
  }
});
