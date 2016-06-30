/* */ 
var Ticker = require('./Ticker');
var shared = new Ticker();
shared.autoStart = true;
module.exports = {
  shared: shared,
  Ticker: Ticker
};
