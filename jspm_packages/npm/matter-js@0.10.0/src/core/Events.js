/* */ 
var Events = {};
module.exports = Events;
var Common = require('./Common');
(function() {
  Events.on = function(object, eventNames, callback) {
    var names = eventNames.split(' '),
        name;
    for (var i = 0; i < names.length; i++) {
      name = names[i];
      object.events = object.events || {};
      object.events[name] = object.events[name] || [];
      object.events[name].push(callback);
    }
    return callback;
  };
  Events.off = function(object, eventNames, callback) {
    if (!eventNames) {
      object.events = {};
      return;
    }
    if (typeof eventNames === 'function') {
      callback = eventNames;
      eventNames = Common.keys(object.events).join(' ');
    }
    var names = eventNames.split(' ');
    for (var i = 0; i < names.length; i++) {
      var callbacks = object.events[names[i]],
          newCallbacks = [];
      if (callback && callbacks) {
        for (var j = 0; j < callbacks.length; j++) {
          if (callbacks[j] !== callback)
            newCallbacks.push(callbacks[j]);
        }
      }
      object.events[names[i]] = newCallbacks;
    }
  };
  Events.trigger = function(object, eventNames, event) {
    var names,
        name,
        callbacks,
        eventClone;
    if (object.events) {
      if (!event)
        event = {};
      names = eventNames.split(' ');
      for (var i = 0; i < names.length; i++) {
        name = names[i];
        callbacks = object.events[name];
        if (callbacks) {
          eventClone = Common.clone(event, false);
          eventClone.name = name;
          eventClone.source = object;
          for (var j = 0; j < callbacks.length; j++) {
            callbacks[j].apply(object, [eventClone]);
          }
        }
      }
    }
  };
})();
