/* */ 
require('./polyfill/index');
var core = module.exports = require('./core/index');
core.extras = require('./extras/index');
core.filters = require('./filters/index');
core.interaction = require('./interaction/index');
core.loaders = require('./loaders/index');
core.mesh = require('./mesh/index');
core.accessibility = require('./accessibility/index');
core.loader = new core.loaders.Loader();
Object.assign(core, require('./deprecation'));
global.PIXI = core;
