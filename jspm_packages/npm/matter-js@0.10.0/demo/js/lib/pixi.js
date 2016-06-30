/* */ 
"format cjs";
(function(process) {
  (function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = f();
    } else if (typeof define === "function" && define.amd) {
      define([], f);
    } else {
      var g;
      if (typeof window !== "undefined") {
        g = window;
      } else if (typeof global !== "undefined") {
        g = global;
      } else if (typeof self !== "undefined") {
        g = self;
      } else {
        g = this;
      }
      g.PIXI = f();
    }
  })(function() {
    var define,
        module,
        exports;
    return (function e(t, n, r) {
      function s(o, u) {
        if (!n[o]) {
          if (!t[o]) {
            var a = typeof require == "function" && require;
            if (!u && a)
              return a(o, !0);
            if (i)
              return i(o, !0);
            var f = new Error("Cannot find module '" + o + "'");
            throw f.code = "MODULE_NOT_FOUND", f;
          }
          var l = n[o] = {exports: {}};
          t[o][0].call(l.exports, function(e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
      }
      var i = typeof require == "function" && require;
      for (var o = 0; o < r.length; o++)
        s(r[o]);
      return s;
    })({
      1: [function(require, module, exports) {
        (function(global) {
          require('./polyfill');
          var core = module.exports = require('./core');
          core.extras = require('./extras');
          core.filters = require('./filters');
          core.interaction = require('./interaction');
          core.loaders = require('./loaders');
          core.mesh = require('./mesh');
          core.loader = new core.loaders.Loader();
          Object.assign(core, require('./deprecation'));
          global.PIXI = core;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
      }, {
        "./core": 29,
        "./deprecation": 78,
        "./extras": 85,
        "./filters": 102,
        "./interaction": 117,
        "./loaders": 120,
        "./mesh": 126,
        "./polyfill": 130
      }],
      2: [function(require, module, exports) {
        (function(process) {
          (function() {
            var async = {};
            var root,
                previous_async;
            root = this;
            if (root != null) {
              previous_async = root.async;
            }
            async.noConflict = function() {
              root.async = previous_async;
              return async;
            };
            function only_once(fn) {
              var called = false;
              return function() {
                if (called)
                  throw new Error("Callback was already called.");
                called = true;
                fn.apply(root, arguments);
              };
            }
            var _toString = Object.prototype.toString;
            var _isArray = Array.isArray || function(obj) {
              return _toString.call(obj) === '[object Array]';
            };
            var _each = function(arr, iterator) {
              if (arr.forEach) {
                return arr.forEach(iterator);
              }
              for (var i = 0; i < arr.length; i += 1) {
                iterator(arr[i], i, arr);
              }
            };
            var _map = function(arr, iterator) {
              if (arr.map) {
                return arr.map(iterator);
              }
              var results = [];
              _each(arr, function(x, i, a) {
                results.push(iterator(x, i, a));
              });
              return results;
            };
            var _reduce = function(arr, iterator, memo) {
              if (arr.reduce) {
                return arr.reduce(iterator, memo);
              }
              _each(arr, function(x, i, a) {
                memo = iterator(memo, x, i, a);
              });
              return memo;
            };
            var _keys = function(obj) {
              if (Object.keys) {
                return Object.keys(obj);
              }
              var keys = [];
              for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                  keys.push(k);
                }
              }
              return keys;
            };
            if (typeof process === 'undefined' || !(process.nextTick)) {
              if (typeof setImmediate === 'function') {
                async.nextTick = function(fn) {
                  setImmediate(fn);
                };
                async.setImmediate = async.nextTick;
              } else {
                async.nextTick = function(fn) {
                  setTimeout(fn, 0);
                };
                async.setImmediate = async.nextTick;
              }
            } else {
              async.nextTick = process.nextTick;
              if (typeof setImmediate !== 'undefined') {
                async.setImmediate = function(fn) {
                  setImmediate(fn);
                };
              } else {
                async.setImmediate = async.nextTick;
              }
            }
            async.each = function(arr, iterator, callback) {
              callback = callback || function() {};
              if (!arr.length) {
                return callback();
              }
              var completed = 0;
              _each(arr, function(x) {
                iterator(x, only_once(done));
              });
              function done(err) {
                if (err) {
                  callback(err);
                  callback = function() {};
                } else {
                  completed += 1;
                  if (completed >= arr.length) {
                    callback();
                  }
                }
              }
            };
            async.forEach = async.each;
            async.eachSeries = function(arr, iterator, callback) {
              callback = callback || function() {};
              if (!arr.length) {
                return callback();
              }
              var completed = 0;
              var iterate = function() {
                iterator(arr[completed], function(err) {
                  if (err) {
                    callback(err);
                    callback = function() {};
                  } else {
                    completed += 1;
                    if (completed >= arr.length) {
                      callback();
                    } else {
                      iterate();
                    }
                  }
                });
              };
              iterate();
            };
            async.forEachSeries = async.eachSeries;
            async.eachLimit = function(arr, limit, iterator, callback) {
              var fn = _eachLimit(limit);
              fn.apply(null, [arr, iterator, callback]);
            };
            async.forEachLimit = async.eachLimit;
            var _eachLimit = function(limit) {
              return function(arr, iterator, callback) {
                callback = callback || function() {};
                if (!arr.length || limit <= 0) {
                  return callback();
                }
                var completed = 0;
                var started = 0;
                var running = 0;
                (function replenish() {
                  if (completed >= arr.length) {
                    return callback();
                  }
                  while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function(err) {
                      if (err) {
                        callback(err);
                        callback = function() {};
                      } else {
                        completed += 1;
                        running -= 1;
                        if (completed >= arr.length) {
                          callback();
                        } else {
                          replenish();
                        }
                      }
                    });
                  }
                })();
              };
            };
            var doParallel = function(fn) {
              return function() {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.each].concat(args));
              };
            };
            var doParallelLimit = function(limit, fn) {
              return function() {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [_eachLimit(limit)].concat(args));
              };
            };
            var doSeries = function(fn) {
              return function() {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.eachSeries].concat(args));
              };
            };
            var _asyncMap = function(eachfn, arr, iterator, callback) {
              arr = _map(arr, function(x, i) {
                return {
                  index: i,
                  value: x
                };
              });
              if (!callback) {
                eachfn(arr, function(x, callback) {
                  iterator(x.value, function(err) {
                    callback(err);
                  });
                });
              } else {
                var results = [];
                eachfn(arr, function(x, callback) {
                  iterator(x.value, function(err, v) {
                    results[x.index] = v;
                    callback(err);
                  });
                }, function(err) {
                  callback(err, results);
                });
              }
            };
            async.map = doParallel(_asyncMap);
            async.mapSeries = doSeries(_asyncMap);
            async.mapLimit = function(arr, limit, iterator, callback) {
              return _mapLimit(limit)(arr, iterator, callback);
            };
            var _mapLimit = function(limit) {
              return doParallelLimit(limit, _asyncMap);
            };
            async.reduce = function(arr, memo, iterator, callback) {
              async.eachSeries(arr, function(x, callback) {
                iterator(memo, x, function(err, v) {
                  memo = v;
                  callback(err);
                });
              }, function(err) {
                callback(err, memo);
              });
            };
            async.inject = async.reduce;
            async.foldl = async.reduce;
            async.reduceRight = function(arr, memo, iterator, callback) {
              var reversed = _map(arr, function(x) {
                return x;
              }).reverse();
              async.reduce(reversed, memo, iterator, callback);
            };
            async.foldr = async.reduceRight;
            var _filter = function(eachfn, arr, iterator, callback) {
              var results = [];
              arr = _map(arr, function(x, i) {
                return {
                  index: i,
                  value: x
                };
              });
              eachfn(arr, function(x, callback) {
                iterator(x.value, function(v) {
                  if (v) {
                    results.push(x);
                  }
                  callback();
                });
              }, function(err) {
                callback(_map(results.sort(function(a, b) {
                  return a.index - b.index;
                }), function(x) {
                  return x.value;
                }));
              });
            };
            async.filter = doParallel(_filter);
            async.filterSeries = doSeries(_filter);
            async.select = async.filter;
            async.selectSeries = async.filterSeries;
            var _reject = function(eachfn, arr, iterator, callback) {
              var results = [];
              arr = _map(arr, function(x, i) {
                return {
                  index: i,
                  value: x
                };
              });
              eachfn(arr, function(x, callback) {
                iterator(x.value, function(v) {
                  if (!v) {
                    results.push(x);
                  }
                  callback();
                });
              }, function(err) {
                callback(_map(results.sort(function(a, b) {
                  return a.index - b.index;
                }), function(x) {
                  return x.value;
                }));
              });
            };
            async.reject = doParallel(_reject);
            async.rejectSeries = doSeries(_reject);
            var _detect = function(eachfn, arr, iterator, main_callback) {
              eachfn(arr, function(x, callback) {
                iterator(x, function(result) {
                  if (result) {
                    main_callback(x);
                    main_callback = function() {};
                  } else {
                    callback();
                  }
                });
              }, function(err) {
                main_callback();
              });
            };
            async.detect = doParallel(_detect);
            async.detectSeries = doSeries(_detect);
            async.some = function(arr, iterator, main_callback) {
              async.each(arr, function(x, callback) {
                iterator(x, function(v) {
                  if (v) {
                    main_callback(true);
                    main_callback = function() {};
                  }
                  callback();
                });
              }, function(err) {
                main_callback(false);
              });
            };
            async.any = async.some;
            async.every = function(arr, iterator, main_callback) {
              async.each(arr, function(x, callback) {
                iterator(x, function(v) {
                  if (!v) {
                    main_callback(false);
                    main_callback = function() {};
                  }
                  callback();
                });
              }, function(err) {
                main_callback(true);
              });
            };
            async.all = async.every;
            async.sortBy = function(arr, iterator, callback) {
              async.map(arr, function(x, callback) {
                iterator(x, function(err, criteria) {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, {
                      value: x,
                      criteria: criteria
                    });
                  }
                });
              }, function(err, results) {
                if (err) {
                  return callback(err);
                } else {
                  var fn = function(left, right) {
                    var a = left.criteria,
                        b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                  };
                  callback(null, _map(results.sort(fn), function(x) {
                    return x.value;
                  }));
                }
              });
            };
            async.auto = function(tasks, callback) {
              callback = callback || function() {};
              var keys = _keys(tasks);
              var remainingTasks = keys.length;
              if (!remainingTasks) {
                return callback();
              }
              var results = {};
              var listeners = [];
              var addListener = function(fn) {
                listeners.unshift(fn);
              };
              var removeListener = function(fn) {
                for (var i = 0; i < listeners.length; i += 1) {
                  if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                  }
                }
              };
              var taskComplete = function() {
                remainingTasks--;
                _each(listeners.slice(0), function(fn) {
                  fn();
                });
              };
              addListener(function() {
                if (!remainingTasks) {
                  var theCallback = callback;
                  callback = function() {};
                  theCallback(null, results);
                }
              });
              _each(keys, function(k) {
                var task = _isArray(tasks[k]) ? tasks[k] : [tasks[k]];
                var taskCallback = function(err) {
                  var args = Array.prototype.slice.call(arguments, 1);
                  if (args.length <= 1) {
                    args = args[0];
                  }
                  if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                      safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    callback = function() {};
                  } else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                  }
                };
                var requires = task.slice(0, Math.abs(task.length - 1)) || [];
                var ready = function() {
                  return _reduce(requires, function(a, x) {
                    return (a && results.hasOwnProperty(x));
                  }, true) && !results.hasOwnProperty(k);
                };
                if (ready()) {
                  task[task.length - 1](taskCallback, results);
                } else {
                  var listener = function() {
                    if (ready()) {
                      removeListener(listener);
                      task[task.length - 1](taskCallback, results);
                    }
                  };
                  addListener(listener);
                }
              });
            };
            async.retry = function(times, task, callback) {
              var DEFAULT_TIMES = 5;
              var attempts = [];
              if (typeof times === 'function') {
                callback = task;
                task = times;
                times = DEFAULT_TIMES;
              }
              times = parseInt(times, 10) || DEFAULT_TIMES;
              var wrappedTask = function(wrappedCallback, wrappedResults) {
                var retryAttempt = function(task, finalAttempt) {
                  return function(seriesCallback) {
                    task(function(err, result) {
                      seriesCallback(!err || finalAttempt, {
                        err: err,
                        result: result
                      });
                    }, wrappedResults);
                  };
                };
                while (times) {
                  attempts.push(retryAttempt(task, !(times -= 1)));
                }
                async.series(attempts, function(done, data) {
                  data = data[data.length - 1];
                  (wrappedCallback || callback)(data.err, data.result);
                });
              };
              return callback ? wrappedTask() : wrappedTask;
            };
            async.waterfall = function(tasks, callback) {
              callback = callback || function() {};
              if (!_isArray(tasks)) {
                var err = new Error('First argument to waterfall must be an array of functions');
                return callback(err);
              }
              if (!tasks.length) {
                return callback();
              }
              var wrapIterator = function(iterator) {
                return function(err) {
                  if (err) {
                    callback.apply(null, arguments);
                    callback = function() {};
                  } else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                      args.push(wrapIterator(next));
                    } else {
                      args.push(callback);
                    }
                    async.setImmediate(function() {
                      iterator.apply(null, args);
                    });
                  }
                };
              };
              wrapIterator(async.iterator(tasks))();
            };
            var _parallel = function(eachfn, tasks, callback) {
              callback = callback || function() {};
              if (_isArray(tasks)) {
                eachfn.map(tasks, function(fn, callback) {
                  if (fn) {
                    fn(function(err) {
                      var args = Array.prototype.slice.call(arguments, 1);
                      if (args.length <= 1) {
                        args = args[0];
                      }
                      callback.call(null, err, args);
                    });
                  }
                }, callback);
              } else {
                var results = {};
                eachfn.each(_keys(tasks), function(k, callback) {
                  tasks[k](function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                      args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                  });
                }, function(err) {
                  callback(err, results);
                });
              }
            };
            async.parallel = function(tasks, callback) {
              _parallel({
                map: async.map,
                each: async.each
              }, tasks, callback);
            };
            async.parallelLimit = function(tasks, limit, callback) {
              _parallel({
                map: _mapLimit(limit),
                each: _eachLimit(limit)
              }, tasks, callback);
            };
            async.series = function(tasks, callback) {
              callback = callback || function() {};
              if (_isArray(tasks)) {
                async.mapSeries(tasks, function(fn, callback) {
                  if (fn) {
                    fn(function(err) {
                      var args = Array.prototype.slice.call(arguments, 1);
                      if (args.length <= 1) {
                        args = args[0];
                      }
                      callback.call(null, err, args);
                    });
                  }
                }, callback);
              } else {
                var results = {};
                async.eachSeries(_keys(tasks), function(k, callback) {
                  tasks[k](function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                      args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                  });
                }, function(err) {
                  callback(err, results);
                });
              }
            };
            async.iterator = function(tasks) {
              var makeCallback = function(index) {
                var fn = function() {
                  if (tasks.length) {
                    tasks[index].apply(null, arguments);
                  }
                  return fn.next();
                };
                fn.next = function() {
                  return (index < tasks.length - 1) ? makeCallback(index + 1) : null;
                };
                return fn;
              };
              return makeCallback(0);
            };
            async.apply = function(fn) {
              var args = Array.prototype.slice.call(arguments, 1);
              return function() {
                return fn.apply(null, args.concat(Array.prototype.slice.call(arguments)));
              };
            };
            var _concat = function(eachfn, arr, fn, callback) {
              var r = [];
              eachfn(arr, function(x, cb) {
                fn(x, function(err, y) {
                  r = r.concat(y || []);
                  cb(err);
                });
              }, function(err) {
                callback(err, r);
              });
            };
            async.concat = doParallel(_concat);
            async.concatSeries = doSeries(_concat);
            async.whilst = function(test, iterator, callback) {
              if (test()) {
                iterator(function(err) {
                  if (err) {
                    return callback(err);
                  }
                  async.whilst(test, iterator, callback);
                });
              } else {
                callback();
              }
            };
            async.doWhilst = function(iterator, test, callback) {
              iterator(function(err) {
                if (err) {
                  return callback(err);
                }
                var args = Array.prototype.slice.call(arguments, 1);
                if (test.apply(null, args)) {
                  async.doWhilst(iterator, test, callback);
                } else {
                  callback();
                }
              });
            };
            async.until = function(test, iterator, callback) {
              if (!test()) {
                iterator(function(err) {
                  if (err) {
                    return callback(err);
                  }
                  async.until(test, iterator, callback);
                });
              } else {
                callback();
              }
            };
            async.doUntil = function(iterator, test, callback) {
              iterator(function(err) {
                if (err) {
                  return callback(err);
                }
                var args = Array.prototype.slice.call(arguments, 1);
                if (!test.apply(null, args)) {
                  async.doUntil(iterator, test, callback);
                } else {
                  callback();
                }
              });
            };
            async.queue = function(worker, concurrency) {
              if (concurrency === undefined) {
                concurrency = 1;
              }
              function _insert(q, data, pos, callback) {
                if (!q.started) {
                  q.started = true;
                }
                if (!_isArray(data)) {
                  data = [data];
                }
                if (data.length == 0) {
                  return async.setImmediate(function() {
                    if (q.drain) {
                      q.drain();
                    }
                  });
                }
                _each(data, function(task) {
                  var item = {
                    data: task,
                    callback: typeof callback === 'function' ? callback : null
                  };
                  if (pos) {
                    q.tasks.unshift(item);
                  } else {
                    q.tasks.push(item);
                  }
                  if (q.saturated && q.tasks.length === q.concurrency) {
                    q.saturated();
                  }
                  async.setImmediate(q.process);
                });
              }
              var workers = 0;
              var q = {
                tasks: [],
                concurrency: concurrency,
                saturated: null,
                empty: null,
                drain: null,
                started: false,
                paused: false,
                push: function(data, callback) {
                  _insert(q, data, false, callback);
                },
                kill: function() {
                  q.drain = null;
                  q.tasks = [];
                },
                unshift: function(data, callback) {
                  _insert(q, data, true, callback);
                },
                process: function() {
                  if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                      q.empty();
                    }
                    workers += 1;
                    var next = function() {
                      workers -= 1;
                      if (task.callback) {
                        task.callback.apply(task, arguments);
                      }
                      if (q.drain && q.tasks.length + workers === 0) {
                        q.drain();
                      }
                      q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                  }
                },
                length: function() {
                  return q.tasks.length;
                },
                running: function() {
                  return workers;
                },
                idle: function() {
                  return q.tasks.length + workers === 0;
                },
                pause: function() {
                  if (q.paused === true) {
                    return;
                  }
                  q.paused = true;
                  q.process();
                },
                resume: function() {
                  if (q.paused === false) {
                    return;
                  }
                  q.paused = false;
                  q.process();
                }
              };
              return q;
            };
            async.priorityQueue = function(worker, concurrency) {
              function _compareTasks(a, b) {
                return a.priority - b.priority;
              }
              ;
              function _binarySearch(sequence, item, compare) {
                var beg = -1,
                    end = sequence.length - 1;
                while (beg < end) {
                  var mid = beg + ((end - beg + 1) >>> 1);
                  if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                  } else {
                    end = mid - 1;
                  }
                }
                return beg;
              }
              function _insert(q, data, priority, callback) {
                if (!q.started) {
                  q.started = true;
                }
                if (!_isArray(data)) {
                  data = [data];
                }
                if (data.length == 0) {
                  return async.setImmediate(function() {
                    if (q.drain) {
                      q.drain();
                    }
                  });
                }
                _each(data, function(task) {
                  var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : null
                  };
                  q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);
                  if (q.saturated && q.tasks.length === q.concurrency) {
                    q.saturated();
                  }
                  async.setImmediate(q.process);
                });
              }
              var q = async.queue(worker, concurrency);
              q.push = function(data, priority, callback) {
                _insert(q, data, priority, callback);
              };
              delete q.unshift;
              return q;
            };
            async.cargo = function(worker, payload) {
              var working = false,
                  tasks = [];
              var cargo = {
                tasks: tasks,
                payload: payload,
                saturated: null,
                empty: null,
                drain: null,
                drained: true,
                push: function(data, callback) {
                  if (!_isArray(data)) {
                    data = [data];
                  }
                  _each(data, function(task) {
                    tasks.push({
                      data: task,
                      callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                      cargo.saturated();
                    }
                  });
                  async.setImmediate(cargo.process);
                },
                process: function process() {
                  if (working)
                    return;
                  if (tasks.length === 0) {
                    if (cargo.drain && !cargo.drained)
                      cargo.drain();
                    cargo.drained = true;
                    return;
                  }
                  var ts = typeof payload === 'number' ? tasks.splice(0, payload) : tasks.splice(0, tasks.length);
                  var ds = _map(ts, function(task) {
                    return task.data;
                  });
                  if (cargo.empty)
                    cargo.empty();
                  working = true;
                  worker(ds, function() {
                    working = false;
                    var args = arguments;
                    _each(ts, function(data) {
                      if (data.callback) {
                        data.callback.apply(null, args);
                      }
                    });
                    process();
                  });
                },
                length: function() {
                  return tasks.length;
                },
                running: function() {
                  return working;
                }
              };
              return cargo;
            };
            var _console_fn = function(name) {
              return function(fn) {
                var args = Array.prototype.slice.call(arguments, 1);
                fn.apply(null, args.concat([function(err) {
                  var args = Array.prototype.slice.call(arguments, 1);
                  if (typeof console !== 'undefined') {
                    if (err) {
                      if (console.error) {
                        console.error(err);
                      }
                    } else if (console[name]) {
                      _each(args, function(x) {
                        console[name](x);
                      });
                    }
                  }
                }]));
              };
            };
            async.log = _console_fn('log');
            async.dir = _console_fn('dir');
            async.memoize = function(fn, hasher) {
              var memo = {};
              var queues = {};
              hasher = hasher || function(x) {
                return x;
              };
              var memoized = function() {
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                var key = hasher.apply(null, args);
                if (key in memo) {
                  async.nextTick(function() {
                    callback.apply(null, memo[key]);
                  });
                } else if (key in queues) {
                  queues[key].push(callback);
                } else {
                  queues[key] = [callback];
                  fn.apply(null, args.concat([function() {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0,
                        l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                  }]));
                }
              };
              memoized.memo = memo;
              memoized.unmemoized = fn;
              return memoized;
            };
            async.unmemoize = function(fn) {
              return function() {
                return (fn.unmemoized || fn).apply(null, arguments);
              };
            };
            async.times = function(count, iterator, callback) {
              var counter = [];
              for (var i = 0; i < count; i++) {
                counter.push(i);
              }
              return async.map(counter, iterator, callback);
            };
            async.timesSeries = function(count, iterator, callback) {
              var counter = [];
              for (var i = 0; i < count; i++) {
                counter.push(i);
              }
              return async.mapSeries(counter, iterator, callback);
            };
            async.seq = function() {
              var fns = arguments;
              return function() {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                async.reduce(fns, args, function(newargs, fn, cb) {
                  fn.apply(that, newargs.concat([function() {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                  }]));
                }, function(err, results) {
                  callback.apply(that, [err].concat(results));
                });
              };
            };
            async.compose = function() {
              return async.seq.apply(null, Array.prototype.reverse.call(arguments));
            };
            var _applyEach = function(eachfn, fns) {
              var go = function() {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                return eachfn(fns, function(fn, cb) {
                  fn.apply(that, args.concat([cb]));
                }, callback);
              };
              if (arguments.length > 2) {
                var args = Array.prototype.slice.call(arguments, 2);
                return go.apply(this, args);
              } else {
                return go;
              }
            };
            async.applyEach = doParallel(_applyEach);
            async.applyEachSeries = doSeries(_applyEach);
            async.forever = function(fn, callback) {
              function next(err) {
                if (err) {
                  if (callback) {
                    return callback(err);
                  }
                  throw err;
                }
                fn(next);
              }
              next();
            };
            if (typeof module !== 'undefined' && module.exports) {
              module.exports = async;
            } else if (typeof define !== 'undefined' && define.amd) {
              define([], function() {
                return async;
              });
            } else {
              root.async = async;
            }
          }());
        }).call(this, require('_process'));
      }, {"_process": 4}],
      3: [function(require, module, exports) {
        (function(process) {
          function normalizeArray(parts, allowAboveRoot) {
            var up = 0;
            for (var i = parts.length - 1; i >= 0; i--) {
              var last = parts[i];
              if (last === '.') {
                parts.splice(i, 1);
              } else if (last === '..') {
                parts.splice(i, 1);
                up++;
              } else if (up) {
                parts.splice(i, 1);
                up--;
              }
            }
            if (allowAboveRoot) {
              for (; up--; up) {
                parts.unshift('..');
              }
            }
            return parts;
          }
          var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
          var splitPath = function(filename) {
            return splitPathRe.exec(filename).slice(1);
          };
          exports.resolve = function() {
            var resolvedPath = '',
                resolvedAbsolute = false;
            for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
              var path = (i >= 0) ? arguments[i] : process.cwd();
              if (typeof path !== 'string') {
                throw new TypeError('Arguments to path.resolve must be strings');
              } else if (!path) {
                continue;
              }
              resolvedPath = path + '/' + resolvedPath;
              resolvedAbsolute = path.charAt(0) === '/';
            }
            resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
              return !!p;
            }), !resolvedAbsolute).join('/');
            return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
          };
          exports.normalize = function(path) {
            var isAbsolute = exports.isAbsolute(path),
                trailingSlash = substr(path, -1) === '/';
            path = normalizeArray(filter(path.split('/'), function(p) {
              return !!p;
            }), !isAbsolute).join('/');
            if (!path && !isAbsolute) {
              path = '.';
            }
            if (path && trailingSlash) {
              path += '/';
            }
            return (isAbsolute ? '/' : '') + path;
          };
          exports.isAbsolute = function(path) {
            return path.charAt(0) === '/';
          };
          exports.join = function() {
            var paths = Array.prototype.slice.call(arguments, 0);
            return exports.normalize(filter(paths, function(p, index) {
              if (typeof p !== 'string') {
                throw new TypeError('Arguments to path.join must be strings');
              }
              return p;
            }).join('/'));
          };
          exports.relative = function(from, to) {
            from = exports.resolve(from).substr(1);
            to = exports.resolve(to).substr(1);
            function trim(arr) {
              var start = 0;
              for (; start < arr.length; start++) {
                if (arr[start] !== '')
                  break;
              }
              var end = arr.length - 1;
              for (; end >= 0; end--) {
                if (arr[end] !== '')
                  break;
              }
              if (start > end)
                return [];
              return arr.slice(start, end - start + 1);
            }
            var fromParts = trim(from.split('/'));
            var toParts = trim(to.split('/'));
            var length = Math.min(fromParts.length, toParts.length);
            var samePartsLength = length;
            for (var i = 0; i < length; i++) {
              if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break;
              }
            }
            var outputParts = [];
            for (var i = samePartsLength; i < fromParts.length; i++) {
              outputParts.push('..');
            }
            outputParts = outputParts.concat(toParts.slice(samePartsLength));
            return outputParts.join('/');
          };
          exports.sep = '/';
          exports.delimiter = ':';
          exports.dirname = function(path) {
            var result = splitPath(path),
                root = result[0],
                dir = result[1];
            if (!root && !dir) {
              return '.';
            }
            if (dir) {
              dir = dir.substr(0, dir.length - 1);
            }
            return root + dir;
          };
          exports.basename = function(path, ext) {
            var f = splitPath(path)[2];
            if (ext && f.substr(-1 * ext.length) === ext) {
              f = f.substr(0, f.length - ext.length);
            }
            return f;
          };
          exports.extname = function(path) {
            return splitPath(path)[3];
          };
          function filter(xs, f) {
            if (xs.filter)
              return xs.filter(f);
            var res = [];
            for (var i = 0; i < xs.length; i++) {
              if (f(xs[i], i, xs))
                res.push(xs[i]);
            }
            return res;
          }
          var substr = 'ab'.substr(-1) === 'b' ? function(str, start, len) {
            return str.substr(start, len);
          } : function(str, start, len) {
            if (start < 0)
              start = str.length + start;
            return str.substr(start, len);
          };
          ;
        }).call(this, require('_process'));
      }, {"_process": 4}],
      4: [function(require, module, exports) {
        var process = module.exports = {};
        var queue = [];
        var draining = false;
        function drainQueue() {
          if (draining) {
            return;
          }
          draining = true;
          var currentQueue;
          var len = queue.length;
          while (len) {
            currentQueue = queue;
            queue = [];
            var i = -1;
            while (++i < len) {
              currentQueue[i]();
            }
            len = queue.length;
          }
          draining = false;
        }
        process.nextTick = function(fun) {
          queue.push(fun);
          if (!draining) {
            setTimeout(drainQueue, 0);
          }
        };
        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = '';
        process.versions = {};
        function noop() {}
        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.binding = function(name) {
          throw new Error('process.binding is not supported');
        };
        process.cwd = function() {
          return '/';
        };
        process.chdir = function(dir) {
          throw new Error('process.chdir is not supported');
        };
        process.umask = function() {
          return 0;
        };
      }, {}],
      5: [function(require, module, exports) {
        (function(global) {
          ;
          (function(root) {
            var freeExports = typeof exports == 'object' && exports;
            var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;
            var freeGlobal = typeof global == 'object' && global;
            if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
              root = freeGlobal;
            }
            var punycode,
                maxInt = 2147483647,
                base = 36,
                tMin = 1,
                tMax = 26,
                skew = 38,
                damp = 700,
                initialBias = 72,
                initialN = 128,
                delimiter = '-',
                regexPunycode = /^xn--/,
                regexNonASCII = /[^ -~]/,
                regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g,
                errors = {
                  'overflow': 'Overflow: input needs wider integers to process',
                  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
                  'invalid-input': 'Invalid input'
                },
                baseMinusTMin = base - tMin,
                floor = Math.floor,
                stringFromCharCode = String.fromCharCode,
                key;
            function error(type) {
              throw RangeError(errors[type]);
            }
            function map(array, fn) {
              var length = array.length;
              while (length--) {
                array[length] = fn(array[length]);
              }
              return array;
            }
            function mapDomain(string, fn) {
              return map(string.split(regexSeparators), fn).join('.');
            }
            function ucs2decode(string) {
              var output = [],
                  counter = 0,
                  length = string.length,
                  value,
                  extra;
              while (counter < length) {
                value = string.charCodeAt(counter++);
                if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                  extra = string.charCodeAt(counter++);
                  if ((extra & 0xFC00) == 0xDC00) {
                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                  } else {
                    output.push(value);
                    counter--;
                  }
                } else {
                  output.push(value);
                }
              }
              return output;
            }
            function ucs2encode(array) {
              return map(array, function(value) {
                var output = '';
                if (value > 0xFFFF) {
                  value -= 0x10000;
                  output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                  value = 0xDC00 | value & 0x3FF;
                }
                output += stringFromCharCode(value);
                return output;
              }).join('');
            }
            function basicToDigit(codePoint) {
              if (codePoint - 48 < 10) {
                return codePoint - 22;
              }
              if (codePoint - 65 < 26) {
                return codePoint - 65;
              }
              if (codePoint - 97 < 26) {
                return codePoint - 97;
              }
              return base;
            }
            function digitToBasic(digit, flag) {
              return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
            }
            function adapt(delta, numPoints, firstTime) {
              var k = 0;
              delta = firstTime ? floor(delta / damp) : delta >> 1;
              delta += floor(delta / numPoints);
              for (; delta > baseMinusTMin * tMax >> 1; k += base) {
                delta = floor(delta / baseMinusTMin);
              }
              return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
            }
            function decode(input) {
              var output = [],
                  inputLength = input.length,
                  out,
                  i = 0,
                  n = initialN,
                  bias = initialBias,
                  basic,
                  j,
                  index,
                  oldi,
                  w,
                  k,
                  digit,
                  t,
                  baseMinusT;
              basic = input.lastIndexOf(delimiter);
              if (basic < 0) {
                basic = 0;
              }
              for (j = 0; j < basic; ++j) {
                if (input.charCodeAt(j) >= 0x80) {
                  error('not-basic');
                }
                output.push(input.charCodeAt(j));
              }
              for (index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
                for (oldi = i, w = 1, k = base; ; k += base) {
                  if (index >= inputLength) {
                    error('invalid-input');
                  }
                  digit = basicToDigit(input.charCodeAt(index++));
                  if (digit >= base || digit > floor((maxInt - i) / w)) {
                    error('overflow');
                  }
                  i += digit * w;
                  t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                  if (digit < t) {
                    break;
                  }
                  baseMinusT = base - t;
                  if (w > floor(maxInt / baseMinusT)) {
                    error('overflow');
                  }
                  w *= baseMinusT;
                }
                out = output.length + 1;
                bias = adapt(i - oldi, out, oldi == 0);
                if (floor(i / out) > maxInt - n) {
                  error('overflow');
                }
                n += floor(i / out);
                i %= out;
                output.splice(i++, 0, n);
              }
              return ucs2encode(output);
            }
            function encode(input) {
              var n,
                  delta,
                  handledCPCount,
                  basicLength,
                  bias,
                  j,
                  m,
                  q,
                  k,
                  t,
                  currentValue,
                  output = [],
                  inputLength,
                  handledCPCountPlusOne,
                  baseMinusT,
                  qMinusT;
              input = ucs2decode(input);
              inputLength = input.length;
              n = initialN;
              delta = 0;
              bias = initialBias;
              for (j = 0; j < inputLength; ++j) {
                currentValue = input[j];
                if (currentValue < 0x80) {
                  output.push(stringFromCharCode(currentValue));
                }
              }
              handledCPCount = basicLength = output.length;
              if (basicLength) {
                output.push(delimiter);
              }
              while (handledCPCount < inputLength) {
                for (m = maxInt, j = 0; j < inputLength; ++j) {
                  currentValue = input[j];
                  if (currentValue >= n && currentValue < m) {
                    m = currentValue;
                  }
                }
                handledCPCountPlusOne = handledCPCount + 1;
                if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                  error('overflow');
                }
                delta += (m - n) * handledCPCountPlusOne;
                n = m;
                for (j = 0; j < inputLength; ++j) {
                  currentValue = input[j];
                  if (currentValue < n && ++delta > maxInt) {
                    error('overflow');
                  }
                  if (currentValue == n) {
                    for (q = delta, k = base; ; k += base) {
                      t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                      if (q < t) {
                        break;
                      }
                      qMinusT = q - t;
                      baseMinusT = base - t;
                      output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                      q = floor(qMinusT / baseMinusT);
                    }
                    output.push(stringFromCharCode(digitToBasic(q, 0)));
                    bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                    delta = 0;
                    ++handledCPCount;
                  }
                }
                ++delta;
                ++n;
              }
              return output.join('');
            }
            function toUnicode(domain) {
              return mapDomain(domain, function(string) {
                return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
              });
            }
            function toASCII(domain) {
              return mapDomain(domain, function(string) {
                return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
              });
            }
            punycode = {
              'version': '1.2.4',
              'ucs2': {
                'decode': ucs2decode,
                'encode': ucs2encode
              },
              'decode': decode,
              'encode': encode,
              'toASCII': toASCII,
              'toUnicode': toUnicode
            };
            if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
              define('punycode', function() {
                return punycode;
              });
            } else if (freeExports && !freeExports.nodeType) {
              if (freeModule) {
                freeModule.exports = punycode;
              } else {
                for (key in punycode) {
                  punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
                }
              }
            } else {
              root.punycode = punycode;
            }
          }(this));
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
      }, {}],
      6: [function(require, module, exports) {
        'use strict';
        function hasOwnProperty(obj, prop) {
          return Object.prototype.hasOwnProperty.call(obj, prop);
        }
        module.exports = function(qs, sep, eq, options) {
          sep = sep || '&';
          eq = eq || '=';
          var obj = {};
          if (typeof qs !== 'string' || qs.length === 0) {
            return obj;
          }
          var regexp = /\+/g;
          qs = qs.split(sep);
          var maxKeys = 1000;
          if (options && typeof options.maxKeys === 'number') {
            maxKeys = options.maxKeys;
          }
          var len = qs.length;
          if (maxKeys > 0 && len > maxKeys) {
            len = maxKeys;
          }
          for (var i = 0; i < len; ++i) {
            var x = qs[i].replace(regexp, '%20'),
                idx = x.indexOf(eq),
                kstr,
                vstr,
                k,
                v;
            if (idx >= 0) {
              kstr = x.substr(0, idx);
              vstr = x.substr(idx + 1);
            } else {
              kstr = x;
              vstr = '';
            }
            k = decodeURIComponent(kstr);
            v = decodeURIComponent(vstr);
            if (!hasOwnProperty(obj, k)) {
              obj[k] = v;
            } else if (isArray(obj[k])) {
              obj[k].push(v);
            } else {
              obj[k] = [obj[k], v];
            }
          }
          return obj;
        };
        var isArray = Array.isArray || function(xs) {
          return Object.prototype.toString.call(xs) === '[object Array]';
        };
      }, {}],
      7: [function(require, module, exports) {
        'use strict';
        var stringifyPrimitive = function(v) {
          switch (typeof v) {
            case 'string':
              return v;
            case 'boolean':
              return v ? 'true' : 'false';
            case 'number':
              return isFinite(v) ? v : '';
            default:
              return '';
          }
        };
        module.exports = function(obj, sep, eq, name) {
          sep = sep || '&';
          eq = eq || '=';
          if (obj === null) {
            obj = undefined;
          }
          if (typeof obj === 'object') {
            return map(objectKeys(obj), function(k) {
              var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
              if (isArray(obj[k])) {
                return map(obj[k], function(v) {
                  return ks + encodeURIComponent(stringifyPrimitive(v));
                }).join(sep);
              } else {
                return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
              }
            }).join(sep);
          }
          if (!name)
            return '';
          return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
        };
        var isArray = Array.isArray || function(xs) {
          return Object.prototype.toString.call(xs) === '[object Array]';
        };
        function map(xs, f) {
          if (xs.map)
            return xs.map(f);
          var res = [];
          for (var i = 0; i < xs.length; i++) {
            res.push(f(xs[i], i));
          }
          return res;
        }
        var objectKeys = Object.keys || function(obj) {
          var res = [];
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              res.push(key);
          }
          return res;
        };
      }, {}],
      8: [function(require, module, exports) {
        'use strict';
        exports.decode = exports.parse = require('./decode');
        exports.encode = exports.stringify = require('./encode');
      }, {
        "./decode": 6,
        "./encode": 7
      }],
      9: [function(require, module, exports) {
        var punycode = require('punycode');
        exports.parse = urlParse;
        exports.resolve = urlResolve;
        exports.resolveObject = urlResolveObject;
        exports.format = urlFormat;
        exports.Url = Url;
        function Url() {
          this.protocol = null;
          this.slashes = null;
          this.auth = null;
          this.host = null;
          this.port = null;
          this.hostname = null;
          this.hash = null;
          this.search = null;
          this.query = null;
          this.pathname = null;
          this.path = null;
          this.href = null;
        }
        var protocolPattern = /^([a-z0-9.+-]+:)/i,
            portPattern = /:[0-9]*$/,
            delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
            unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
            autoEscape = ['\''].concat(unwise),
            nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
            hostEndingChars = ['/', '?', '#'],
            hostnameMaxLen = 255,
            hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
            hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
            unsafeProtocol = {
              'javascript': true,
              'javascript:': true
            },
            hostlessProtocol = {
              'javascript': true,
              'javascript:': true
            },
            slashedProtocol = {
              'http': true,
              'https': true,
              'ftp': true,
              'gopher': true,
              'file': true,
              'http:': true,
              'https:': true,
              'ftp:': true,
              'gopher:': true,
              'file:': true
            },
            querystring = require('querystring');
        function urlParse(url, parseQueryString, slashesDenoteHost) {
          if (url && isObject(url) && url instanceof Url)
            return url;
          var u = new Url;
          u.parse(url, parseQueryString, slashesDenoteHost);
          return u;
        }
        Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
          if (!isString(url)) {
            throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
          }
          var rest = url;
          rest = rest.trim();
          var proto = protocolPattern.exec(rest);
          if (proto) {
            proto = proto[0];
            var lowerProto = proto.toLowerCase();
            this.protocol = lowerProto;
            rest = rest.substr(proto.length);
          }
          if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
            var slashes = rest.substr(0, 2) === '//';
            if (slashes && !(proto && hostlessProtocol[proto])) {
              rest = rest.substr(2);
              this.slashes = true;
            }
          }
          if (!hostlessProtocol[proto] && (slashes || (proto && !slashedProtocol[proto]))) {
            var hostEnd = -1;
            for (var i = 0; i < hostEndingChars.length; i++) {
              var hec = rest.indexOf(hostEndingChars[i]);
              if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                hostEnd = hec;
            }
            var auth,
                atSign;
            if (hostEnd === -1) {
              atSign = rest.lastIndexOf('@');
            } else {
              atSign = rest.lastIndexOf('@', hostEnd);
            }
            if (atSign !== -1) {
              auth = rest.slice(0, atSign);
              rest = rest.slice(atSign + 1);
              this.auth = decodeURIComponent(auth);
            }
            hostEnd = -1;
            for (var i = 0; i < nonHostChars.length; i++) {
              var hec = rest.indexOf(nonHostChars[i]);
              if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                hostEnd = hec;
            }
            if (hostEnd === -1)
              hostEnd = rest.length;
            this.host = rest.slice(0, hostEnd);
            rest = rest.slice(hostEnd);
            this.parseHost();
            this.hostname = this.hostname || '';
            var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';
            if (!ipv6Hostname) {
              var hostparts = this.hostname.split(/\./);
              for (var i = 0,
                  l = hostparts.length; i < l; i++) {
                var part = hostparts[i];
                if (!part)
                  continue;
                if (!part.match(hostnamePartPattern)) {
                  var newpart = '';
                  for (var j = 0,
                      k = part.length; j < k; j++) {
                    if (part.charCodeAt(j) > 127) {
                      newpart += 'x';
                    } else {
                      newpart += part[j];
                    }
                  }
                  if (!newpart.match(hostnamePartPattern)) {
                    var validParts = hostparts.slice(0, i);
                    var notHost = hostparts.slice(i + 1);
                    var bit = part.match(hostnamePartStart);
                    if (bit) {
                      validParts.push(bit[1]);
                      notHost.unshift(bit[2]);
                    }
                    if (notHost.length) {
                      rest = '/' + notHost.join('.') + rest;
                    }
                    this.hostname = validParts.join('.');
                    break;
                  }
                }
              }
            }
            if (this.hostname.length > hostnameMaxLen) {
              this.hostname = '';
            } else {
              this.hostname = this.hostname.toLowerCase();
            }
            if (!ipv6Hostname) {
              var domainArray = this.hostname.split('.');
              var newOut = [];
              for (var i = 0; i < domainArray.length; ++i) {
                var s = domainArray[i];
                newOut.push(s.match(/[^A-Za-z0-9_-]/) ? 'xn--' + punycode.encode(s) : s);
              }
              this.hostname = newOut.join('.');
            }
            var p = this.port ? ':' + this.port : '';
            var h = this.hostname || '';
            this.host = h + p;
            this.href += this.host;
            if (ipv6Hostname) {
              this.hostname = this.hostname.substr(1, this.hostname.length - 2);
              if (rest[0] !== '/') {
                rest = '/' + rest;
              }
            }
          }
          if (!unsafeProtocol[lowerProto]) {
            for (var i = 0,
                l = autoEscape.length; i < l; i++) {
              var ae = autoEscape[i];
              var esc = encodeURIComponent(ae);
              if (esc === ae) {
                esc = escape(ae);
              }
              rest = rest.split(ae).join(esc);
            }
          }
          var hash = rest.indexOf('#');
          if (hash !== -1) {
            this.hash = rest.substr(hash);
            rest = rest.slice(0, hash);
          }
          var qm = rest.indexOf('?');
          if (qm !== -1) {
            this.search = rest.substr(qm);
            this.query = rest.substr(qm + 1);
            if (parseQueryString) {
              this.query = querystring.parse(this.query);
            }
            rest = rest.slice(0, qm);
          } else if (parseQueryString) {
            this.search = '';
            this.query = {};
          }
          if (rest)
            this.pathname = rest;
          if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
            this.pathname = '/';
          }
          if (this.pathname || this.search) {
            var p = this.pathname || '';
            var s = this.search || '';
            this.path = p + s;
          }
          this.href = this.format();
          return this;
        };
        function urlFormat(obj) {
          if (isString(obj))
            obj = urlParse(obj);
          if (!(obj instanceof Url))
            return Url.prototype.format.call(obj);
          return obj.format();
        }
        Url.prototype.format = function() {
          var auth = this.auth || '';
          if (auth) {
            auth = encodeURIComponent(auth);
            auth = auth.replace(/%3A/i, ':');
            auth += '@';
          }
          var protocol = this.protocol || '',
              pathname = this.pathname || '',
              hash = this.hash || '',
              host = false,
              query = '';
          if (this.host) {
            host = auth + this.host;
          } else if (this.hostname) {
            host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : '[' + this.hostname + ']');
            if (this.port) {
              host += ':' + this.port;
            }
          }
          if (this.query && isObject(this.query) && Object.keys(this.query).length) {
            query = querystring.stringify(this.query);
          }
          var search = this.search || (query && ('?' + query)) || '';
          if (protocol && protocol.substr(-1) !== ':')
            protocol += ':';
          if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
            host = '//' + (host || '');
            if (pathname && pathname.charAt(0) !== '/')
              pathname = '/' + pathname;
          } else if (!host) {
            host = '';
          }
          if (hash && hash.charAt(0) !== '#')
            hash = '#' + hash;
          if (search && search.charAt(0) !== '?')
            search = '?' + search;
          pathname = pathname.replace(/[?#]/g, function(match) {
            return encodeURIComponent(match);
          });
          search = search.replace('#', '%23');
          return protocol + host + pathname + search + hash;
        };
        function urlResolve(source, relative) {
          return urlParse(source, false, true).resolve(relative);
        }
        Url.prototype.resolve = function(relative) {
          return this.resolveObject(urlParse(relative, false, true)).format();
        };
        function urlResolveObject(source, relative) {
          if (!source)
            return relative;
          return urlParse(source, false, true).resolveObject(relative);
        }
        Url.prototype.resolveObject = function(relative) {
          if (isString(relative)) {
            var rel = new Url();
            rel.parse(relative, false, true);
            relative = rel;
          }
          var result = new Url();
          Object.keys(this).forEach(function(k) {
            result[k] = this[k];
          }, this);
          result.hash = relative.hash;
          if (relative.href === '') {
            result.href = result.format();
            return result;
          }
          if (relative.slashes && !relative.protocol) {
            Object.keys(relative).forEach(function(k) {
              if (k !== 'protocol')
                result[k] = relative[k];
            });
            if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
              result.path = result.pathname = '/';
            }
            result.href = result.format();
            return result;
          }
          if (relative.protocol && relative.protocol !== result.protocol) {
            if (!slashedProtocol[relative.protocol]) {
              Object.keys(relative).forEach(function(k) {
                result[k] = relative[k];
              });
              result.href = result.format();
              return result;
            }
            result.protocol = relative.protocol;
            if (!relative.host && !hostlessProtocol[relative.protocol]) {
              var relPath = (relative.pathname || '').split('/');
              while (relPath.length && !(relative.host = relPath.shift()))
                ;
              if (!relative.host)
                relative.host = '';
              if (!relative.hostname)
                relative.hostname = '';
              if (relPath[0] !== '')
                relPath.unshift('');
              if (relPath.length < 2)
                relPath.unshift('');
              result.pathname = relPath.join('/');
            } else {
              result.pathname = relative.pathname;
            }
            result.search = relative.search;
            result.query = relative.query;
            result.host = relative.host || '';
            result.auth = relative.auth;
            result.hostname = relative.hostname || relative.host;
            result.port = relative.port;
            if (result.pathname || result.search) {
              var p = result.pathname || '';
              var s = result.search || '';
              result.path = p + s;
            }
            result.slashes = result.slashes || relative.slashes;
            result.href = result.format();
            return result;
          }
          var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
              isRelAbs = (relative.host || relative.pathname && relative.pathname.charAt(0) === '/'),
              mustEndAbs = (isRelAbs || isSourceAbs || (result.host && relative.pathname)),
              removeAllDots = mustEndAbs,
              srcPath = result.pathname && result.pathname.split('/') || [],
              relPath = relative.pathname && relative.pathname.split('/') || [],
              psychotic = result.protocol && !slashedProtocol[result.protocol];
          if (psychotic) {
            result.hostname = '';
            result.port = null;
            if (result.host) {
              if (srcPath[0] === '')
                srcPath[0] = result.host;
              else
                srcPath.unshift(result.host);
            }
            result.host = '';
            if (relative.protocol) {
              relative.hostname = null;
              relative.port = null;
              if (relative.host) {
                if (relPath[0] === '')
                  relPath[0] = relative.host;
                else
                  relPath.unshift(relative.host);
              }
              relative.host = null;
            }
            mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
          }
          if (isRelAbs) {
            result.host = (relative.host || relative.host === '') ? relative.host : result.host;
            result.hostname = (relative.hostname || relative.hostname === '') ? relative.hostname : result.hostname;
            result.search = relative.search;
            result.query = relative.query;
            srcPath = relPath;
          } else if (relPath.length) {
            if (!srcPath)
              srcPath = [];
            srcPath.pop();
            srcPath = srcPath.concat(relPath);
            result.search = relative.search;
            result.query = relative.query;
          } else if (!isNullOrUndefined(relative.search)) {
            if (psychotic) {
              result.hostname = result.host = srcPath.shift();
              var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
              if (authInHost) {
                result.auth = authInHost.shift();
                result.host = result.hostname = authInHost.shift();
              }
            }
            result.search = relative.search;
            result.query = relative.query;
            if (!isNull(result.pathname) || !isNull(result.search)) {
              result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
            }
            result.href = result.format();
            return result;
          }
          if (!srcPath.length) {
            result.pathname = null;
            if (result.search) {
              result.path = '/' + result.search;
            } else {
              result.path = null;
            }
            result.href = result.format();
            return result;
          }
          var last = srcPath.slice(-1)[0];
          var hasTrailingSlash = ((result.host || relative.host) && (last === '.' || last === '..') || last === '');
          var up = 0;
          for (var i = srcPath.length; i >= 0; i--) {
            last = srcPath[i];
            if (last == '.') {
              srcPath.splice(i, 1);
            } else if (last === '..') {
              srcPath.splice(i, 1);
              up++;
            } else if (up) {
              srcPath.splice(i, 1);
              up--;
            }
          }
          if (!mustEndAbs && !removeAllDots) {
            for (; up--; up) {
              srcPath.unshift('..');
            }
          }
          if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
            srcPath.unshift('');
          }
          if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
            srcPath.push('');
          }
          var isAbsolute = srcPath[0] === '' || (srcPath[0] && srcPath[0].charAt(0) === '/');
          if (psychotic) {
            result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
            var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
            if (authInHost) {
              result.auth = authInHost.shift();
              result.host = result.hostname = authInHost.shift();
            }
          }
          mustEndAbs = mustEndAbs || (result.host && srcPath.length);
          if (mustEndAbs && !isAbsolute) {
            srcPath.unshift('');
          }
          if (!srcPath.length) {
            result.pathname = null;
            result.path = null;
          } else {
            result.pathname = srcPath.join('/');
          }
          if (!isNull(result.pathname) || !isNull(result.search)) {
            result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
          }
          result.auth = relative.auth || result.auth;
          result.slashes = result.slashes || relative.slashes;
          result.href = result.format();
          return result;
        };
        Url.prototype.parseHost = function() {
          var host = this.host;
          var port = portPattern.exec(host);
          if (port) {
            port = port[0];
            if (port !== ':') {
              this.port = port.substr(1);
            }
            host = host.substr(0, host.length - port.length);
          }
          if (host)
            this.hostname = host;
        };
        function isString(arg) {
          return typeof arg === "string";
        }
        function isObject(arg) {
          return typeof arg === 'object' && arg !== null;
        }
        function isNull(arg) {
          return arg === null;
        }
        function isNullOrUndefined(arg) {
          return arg == null;
        }
      }, {
        "punycode": 5,
        "querystring": 8
      }],
      10: [function(require, module, exports) {
        'use strict';
        module.exports = earcut;
        function earcut(data, holeIndices, dim) {
          dim = dim || 2;
          var hasHoles = holeIndices && holeIndices.length,
              outerLen = hasHoles ? holeIndices[0] * dim : data.length,
              outerNode = filterPoints(data, linkedList(data, 0, outerLen, dim, true)),
              triangles = [];
          if (!outerNode)
            return triangles;
          var minX,
              minY,
              maxX,
              maxY,
              x,
              y,
              size;
          if (hasHoles)
            outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
          if (data.length > 80 * dim) {
            minX = maxX = data[0];
            minY = maxY = data[1];
            for (var i = dim; i < outerLen; i += dim) {
              x = data[i];
              y = data[i + 1];
              if (x < minX)
                minX = x;
              if (y < minY)
                minY = y;
              if (x > maxX)
                maxX = x;
              if (y > maxY)
                maxY = y;
            }
            size = Math.max(maxX - minX, maxY - minY);
          }
          earcutLinked(data, outerNode, triangles, dim, minX, minY, size);
          return triangles;
        }
        function linkedList(data, start, end, dim, clockwise) {
          var sum = 0,
              i,
              j,
              last;
          for (i = start, j = end - dim; i < end; i += dim) {
            sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
            j = i;
          }
          if (clockwise === (sum > 0)) {
            for (i = start; i < end; i += dim)
              last = insertNode(i, last);
          } else {
            for (i = end - dim; i >= start; i -= dim)
              last = insertNode(i, last);
          }
          return last;
        }
        function filterPoints(data, start, end) {
          if (!end)
            end = start;
          var node = start,
              again;
          do {
            again = false;
            if (equals(data, node.i, node.next.i) || orient(data, node.prev.i, node.i, node.next.i) === 0) {
              node.prev.next = node.next;
              node.next.prev = node.prev;
              if (node.prevZ)
                node.prevZ.nextZ = node.nextZ;
              if (node.nextZ)
                node.nextZ.prevZ = node.prevZ;
              node = end = node.prev;
              if (node === node.next)
                return null;
              again = true;
            } else {
              node = node.next;
            }
          } while (again || node !== end);
          return end;
        }
        function earcutLinked(data, ear, triangles, dim, minX, minY, size, pass) {
          if (!ear)
            return;
          if (!pass && minX !== undefined)
            indexCurve(data, ear, minX, minY, size);
          var stop = ear,
              prev,
              next;
          while (ear.prev !== ear.next) {
            prev = ear.prev;
            next = ear.next;
            if (isEar(data, ear, minX, minY, size)) {
              triangles.push(prev.i / dim);
              triangles.push(ear.i / dim);
              triangles.push(next.i / dim);
              next.prev = prev;
              prev.next = next;
              if (ear.prevZ)
                ear.prevZ.nextZ = ear.nextZ;
              if (ear.nextZ)
                ear.nextZ.prevZ = ear.prevZ;
              ear = next.next;
              stop = next.next;
              continue;
            }
            ear = next;
            if (ear === stop) {
              if (!pass) {
                earcutLinked(data, filterPoints(data, ear), triangles, dim, minX, minY, size, 1);
              } else if (pass === 1) {
                ear = cureLocalIntersections(data, ear, triangles, dim);
                earcutLinked(data, ear, triangles, dim, minX, minY, size, 2);
              } else if (pass === 2) {
                splitEarcut(data, ear, triangles, dim, minX, minY, size);
              }
              break;
            }
          }
        }
        function isEar(data, ear, minX, minY, size) {
          var a = ear.prev.i,
              b = ear.i,
              c = ear.next.i,
              ax = data[a],
              ay = data[a + 1],
              bx = data[b],
              by = data[b + 1],
              cx = data[c],
              cy = data[c + 1],
              abd = ax * by - ay * bx,
              acd = ax * cy - ay * cx,
              cbd = cx * by - cy * bx,
              A = abd - acd - cbd;
          if (A <= 0)
            return false;
          var cay = cy - ay,
              acx = ax - cx,
              aby = ay - by,
              bax = bx - ax,
              i,
              px,
              py,
              s,
              t,
              k,
              node;
          if (minX !== undefined) {
            var minTX = ax < bx ? (ax < cx ? ax : cx) : (bx < cx ? bx : cx),
                minTY = ay < by ? (ay < cy ? ay : cy) : (by < cy ? by : cy),
                maxTX = ax > bx ? (ax > cx ? ax : cx) : (bx > cx ? bx : cx),
                maxTY = ay > by ? (ay > cy ? ay : cy) : (by > cy ? by : cy),
                minZ = zOrder(minTX, minTY, minX, minY, size),
                maxZ = zOrder(maxTX, maxTY, minX, minY, size);
            node = ear.nextZ;
            while (node && node.z <= maxZ) {
              i = node.i;
              node = node.nextZ;
              if (i === a || i === c)
                continue;
              px = data[i];
              py = data[i + 1];
              s = cay * px + acx * py - acd;
              if (s >= 0) {
                t = aby * px + bax * py + abd;
                if (t >= 0) {
                  k = A - s - t;
                  if ((k >= 0) && ((s && t) || (s && k) || (t && k)))
                    return false;
                }
              }
            }
            node = ear.prevZ;
            while (node && node.z >= minZ) {
              i = node.i;
              node = node.prevZ;
              if (i === a || i === c)
                continue;
              px = data[i];
              py = data[i + 1];
              s = cay * px + acx * py - acd;
              if (s >= 0) {
                t = aby * px + bax * py + abd;
                if (t >= 0) {
                  k = A - s - t;
                  if ((k >= 0) && ((s && t) || (s && k) || (t && k)))
                    return false;
                }
              }
            }
          } else {
            node = ear.next.next;
            while (node !== ear.prev) {
              i = node.i;
              node = node.next;
              px = data[i];
              py = data[i + 1];
              s = cay * px + acx * py - acd;
              if (s >= 0) {
                t = aby * px + bax * py + abd;
                if (t >= 0) {
                  k = A - s - t;
                  if ((k >= 0) && ((s && t) || (s && k) || (t && k)))
                    return false;
                }
              }
            }
          }
          return true;
        }
        function cureLocalIntersections(data, start, triangles, dim) {
          var node = start;
          do {
            var a = node.prev,
                b = node.next.next;
            if (a.i !== b.i && intersects(data, a.i, node.i, node.next.i, b.i) && locallyInside(data, a, b) && locallyInside(data, b, a)) {
              triangles.push(a.i / dim);
              triangles.push(node.i / dim);
              triangles.push(b.i / dim);
              a.next = b;
              b.prev = a;
              var az = node.prevZ,
                  bz = node.nextZ && node.nextZ.nextZ;
              if (az)
                az.nextZ = bz;
              if (bz)
                bz.prevZ = az;
              node = start = b;
            }
            node = node.next;
          } while (node !== start);
          return node;
        }
        function splitEarcut(data, start, triangles, dim, minX, minY, size) {
          var a = start;
          do {
            var b = a.next.next;
            while (b !== a.prev) {
              if (a.i !== b.i && isValidDiagonal(data, a, b)) {
                var c = splitPolygon(a, b);
                a = filterPoints(data, a, a.next);
                c = filterPoints(data, c, c.next);
                earcutLinked(data, a, triangles, dim, minX, minY, size);
                earcutLinked(data, c, triangles, dim, minX, minY, size);
                return;
              }
              b = b.next;
            }
            a = a.next;
          } while (a !== start);
        }
        function eliminateHoles(data, holeIndices, outerNode, dim) {
          var queue = [],
              i,
              len,
              start,
              end,
              list;
          for (i = 0, len = holeIndices.length; i < len; i++) {
            start = holeIndices[i] * dim;
            end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            list = filterPoints(data, linkedList(data, start, end, dim, false));
            if (list)
              queue.push(getLeftmost(data, list));
          }
          queue.sort(function(a, b) {
            return data[a.i] - data[b.i];
          });
          for (i = 0; i < queue.length; i++) {
            eliminateHole(data, queue[i], outerNode);
            outerNode = filterPoints(data, outerNode, outerNode.next);
          }
          return outerNode;
        }
        function eliminateHole(data, holeNode, outerNode) {
          outerNode = findHoleBridge(data, holeNode, outerNode);
          if (outerNode) {
            var b = splitPolygon(outerNode, holeNode);
            filterPoints(data, b, b.next);
          }
        }
        function findHoleBridge(data, holeNode, outerNode) {
          var node = outerNode,
              i = holeNode.i,
              px = data[i],
              py = data[i + 1],
              qMax = -Infinity,
              mNode,
              a,
              b;
          do {
            a = node.i;
            b = node.next.i;
            if (py <= data[a + 1] && py >= data[b + 1]) {
              var qx = data[a] + (py - data[a + 1]) * (data[b] - data[a]) / (data[b + 1] - data[a + 1]);
              if (qx <= px && qx > qMax) {
                qMax = qx;
                mNode = data[a] < data[b] ? node : node.next;
              }
            }
            node = node.next;
          } while (node !== outerNode);
          if (!mNode)
            return null;
          var bx = data[mNode.i],
              by = data[mNode.i + 1],
              pbd = px * by - py * bx,
              pcd = px * py - py * qMax,
              cpy = py - py,
              pcx = px - qMax,
              pby = py - by,
              bpx = bx - px,
              A = pbd - pcd - (qMax * by - py * bx),
              sign = A <= 0 ? -1 : 1,
              stop = mNode,
              tanMin = Infinity,
              mx,
              my,
              amx,
              s,
              t,
              tan;
          node = mNode.next;
          while (node !== stop) {
            mx = data[node.i];
            my = data[node.i + 1];
            amx = px - mx;
            if (amx >= 0 && mx >= bx) {
              s = (cpy * mx + pcx * my - pcd) * sign;
              if (s >= 0) {
                t = (pby * mx + bpx * my + pbd) * sign;
                if (t >= 0 && A * sign - s - t >= 0) {
                  tan = Math.abs(py - my) / amx;
                  if (tan < tanMin && locallyInside(data, node, holeNode)) {
                    mNode = node;
                    tanMin = tan;
                  }
                }
              }
            }
            node = node.next;
          }
          return mNode;
        }
        function indexCurve(data, start, minX, minY, size) {
          var node = start;
          do {
            if (node.z === null)
              node.z = zOrder(data[node.i], data[node.i + 1], minX, minY, size);
            node.prevZ = node.prev;
            node.nextZ = node.next;
            node = node.next;
          } while (node !== start);
          node.prevZ.nextZ = null;
          node.prevZ = null;
          sortLinked(node);
        }
        function sortLinked(list) {
          var i,
              p,
              q,
              e,
              tail,
              numMerges,
              pSize,
              qSize,
              inSize = 1;
          do {
            p = list;
            list = null;
            tail = null;
            numMerges = 0;
            while (p) {
              numMerges++;
              q = p;
              pSize = 0;
              for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q)
                  break;
              }
              qSize = inSize;
              while (pSize > 0 || (qSize > 0 && q)) {
                if (pSize === 0) {
                  e = q;
                  q = q.nextZ;
                  qSize--;
                } else if (qSize === 0 || !q) {
                  e = p;
                  p = p.nextZ;
                  pSize--;
                } else if (p.z <= q.z) {
                  e = p;
                  p = p.nextZ;
                  pSize--;
                } else {
                  e = q;
                  q = q.nextZ;
                  qSize--;
                }
                if (tail)
                  tail.nextZ = e;
                else
                  list = e;
                e.prevZ = tail;
                tail = e;
              }
              p = q;
            }
            tail.nextZ = null;
            inSize *= 2;
          } while (numMerges > 1);
          return list;
        }
        function zOrder(x, y, minX, minY, size) {
          x = 1000 * (x - minX) / size;
          x = (x | (x << 8)) & 0x00FF00FF;
          x = (x | (x << 4)) & 0x0F0F0F0F;
          x = (x | (x << 2)) & 0x33333333;
          x = (x | (x << 1)) & 0x55555555;
          y = 1000 * (y - minY) / size;
          y = (y | (y << 8)) & 0x00FF00FF;
          y = (y | (y << 4)) & 0x0F0F0F0F;
          y = (y | (y << 2)) & 0x33333333;
          y = (y | (y << 1)) & 0x55555555;
          return x | (y << 1);
        }
        function getLeftmost(data, start) {
          var node = start,
              leftmost = start;
          do {
            if (data[node.i] < data[leftmost.i])
              leftmost = node;
            node = node.next;
          } while (node !== start);
          return leftmost;
        }
        function isValidDiagonal(data, a, b) {
          return !intersectsPolygon(data, a, a.i, b.i) && locallyInside(data, a, b) && locallyInside(data, b, a) && middleInside(data, a, a.i, b.i);
        }
        function orient(data, p, q, r) {
          var o = (data[q + 1] - data[p + 1]) * (data[r] - data[q]) - (data[q] - data[p]) * (data[r + 1] - data[q + 1]);
          return o > 0 ? 1 : o < 0 ? -1 : 0;
        }
        function equals(data, p1, p2) {
          return data[p1] === data[p2] && data[p1 + 1] === data[p2 + 1];
        }
        function intersects(data, p1, q1, p2, q2) {
          return orient(data, p1, q1, p2) !== orient(data, p1, q1, q2) && orient(data, p2, q2, p1) !== orient(data, p2, q2, q1);
        }
        function intersectsPolygon(data, start, a, b) {
          var node = start;
          do {
            var p1 = node.i,
                p2 = node.next.i;
            if (p1 !== a && p2 !== a && p1 !== b && p2 !== b && intersects(data, p1, p2, a, b))
              return true;
            node = node.next;
          } while (node !== start);
          return false;
        }
        function locallyInside(data, a, b) {
          return orient(data, a.prev.i, a.i, a.next.i) === -1 ? orient(data, a.i, b.i, a.next.i) !== -1 && orient(data, a.i, a.prev.i, b.i) !== -1 : orient(data, a.i, b.i, a.prev.i) === -1 || orient(data, a.i, a.next.i, b.i) === -1;
        }
        function middleInside(data, start, a, b) {
          var node = start,
              inside = false,
              px = (data[a] + data[b]) / 2,
              py = (data[a + 1] + data[b + 1]) / 2;
          do {
            var p1 = node.i,
                p2 = node.next.i;
            if (((data[p1 + 1] > py) !== (data[p2 + 1] > py)) && (px < (data[p2] - data[p1]) * (py - data[p1 + 1]) / (data[p2 + 1] - data[p1 + 1]) + data[p1]))
              inside = !inside;
            node = node.next;
          } while (node !== start);
          return inside;
        }
        function splitPolygon(a, b) {
          var a2 = new Node(a.i),
              b2 = new Node(b.i),
              an = a.next,
              bp = b.prev;
          a.next = b;
          b.prev = a;
          a2.next = an;
          an.prev = a2;
          b2.next = a2;
          a2.prev = b2;
          bp.next = b2;
          b2.prev = bp;
          return b2;
        }
        function insertNode(i, last) {
          var node = new Node(i);
          if (!last) {
            node.prev = node;
            node.next = node;
          } else {
            node.next = last.next;
            node.prev = last;
            last.next.prev = node;
            last.next = node;
          }
          return node;
        }
        function Node(i) {
          this.i = i;
          this.prev = null;
          this.next = null;
          this.z = null;
          this.prevZ = null;
          this.nextZ = null;
        }
      }, {}],
      11: [function(require, module, exports) {
        'use strict';
        var prefix = typeof Object.create !== 'function' ? '~' : false;
        function EE(fn, context, once) {
          this.fn = fn;
          this.context = context;
          this.once = once || false;
        }
        function EventEmitter() {}
        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype.listeners = function listeners(event, exists) {
          var evt = prefix ? prefix + event : event,
              available = this._events && this._events[evt];
          if (exists)
            return !!available;
          if (!available)
            return [];
          if (this._events[evt].fn)
            return [this._events[evt].fn];
          for (var i = 0,
              l = this._events[evt].length,
              ee = new Array(l); i < l; i++) {
            ee[i] = this._events[evt][i].fn;
          }
          return ee;
        };
        EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
          var evt = prefix ? prefix + event : event;
          if (!this._events || !this._events[evt])
            return false;
          var listeners = this._events[evt],
              len = arguments.length,
              args,
              i;
          if ('function' === typeof listeners.fn) {
            if (listeners.once)
              this.removeListener(event, listeners.fn, undefined, true);
            switch (len) {
              case 1:
                return listeners.fn.call(listeners.context), true;
              case 2:
                return listeners.fn.call(listeners.context, a1), true;
              case 3:
                return listeners.fn.call(listeners.context, a1, a2), true;
              case 4:
                return listeners.fn.call(listeners.context, a1, a2, a3), true;
              case 5:
                return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
              case 6:
                return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
            }
            for (i = 1, args = new Array(len - 1); i < len; i++) {
              args[i - 1] = arguments[i];
            }
            listeners.fn.apply(listeners.context, args);
          } else {
            var length = listeners.length,
                j;
            for (i = 0; i < length; i++) {
              if (listeners[i].once)
                this.removeListener(event, listeners[i].fn, undefined, true);
              switch (len) {
                case 1:
                  listeners[i].fn.call(listeners[i].context);
                  break;
                case 2:
                  listeners[i].fn.call(listeners[i].context, a1);
                  break;
                case 3:
                  listeners[i].fn.call(listeners[i].context, a1, a2);
                  break;
                default:
                  if (!args)
                    for (j = 1, args = new Array(len - 1); j < len; j++) {
                      args[j - 1] = arguments[j];
                    }
                  listeners[i].fn.apply(listeners[i].context, args);
              }
            }
          }
          return true;
        };
        EventEmitter.prototype.on = function on(event, fn, context) {
          var listener = new EE(fn, context || this),
              evt = prefix ? prefix + event : event;
          if (!this._events)
            this._events = prefix ? {} : Object.create(null);
          if (!this._events[evt])
            this._events[evt] = listener;
          else {
            if (!this._events[evt].fn)
              this._events[evt].push(listener);
            else
              this._events[evt] = [this._events[evt], listener];
          }
          return this;
        };
        EventEmitter.prototype.once = function once(event, fn, context) {
          var listener = new EE(fn, context || this, true),
              evt = prefix ? prefix + event : event;
          if (!this._events)
            this._events = prefix ? {} : Object.create(null);
          if (!this._events[evt])
            this._events[evt] = listener;
          else {
            if (!this._events[evt].fn)
              this._events[evt].push(listener);
            else
              this._events[evt] = [this._events[evt], listener];
          }
          return this;
        };
        EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
          var evt = prefix ? prefix + event : event;
          if (!this._events || !this._events[evt])
            return this;
          var listeners = this._events[evt],
              events = [];
          if (fn) {
            if (listeners.fn) {
              if (listeners.fn !== fn || (once && !listeners.once) || (context && listeners.context !== context)) {
                events.push(listeners);
              }
            } else {
              for (var i = 0,
                  length = listeners.length; i < length; i++) {
                if (listeners[i].fn !== fn || (once && !listeners[i].once) || (context && listeners[i].context !== context)) {
                  events.push(listeners[i]);
                }
              }
            }
          }
          if (events.length) {
            this._events[evt] = events.length === 1 ? events[0] : events;
          } else {
            delete this._events[evt];
          }
          return this;
        };
        EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
          if (!this._events)
            return this;
          if (event)
            delete this._events[prefix ? prefix + event : event];
          else
            this._events = prefix ? {} : Object.create(null);
          return this;
        };
        EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
        EventEmitter.prototype.addListener = EventEmitter.prototype.on;
        EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
          return this;
        };
        EventEmitter.prefixed = prefix;
        module.exports = EventEmitter;
      }, {}],
      12: [function(require, module, exports) {
        'use strict';
        function ToObject(val) {
          if (val == null) {
            throw new TypeError('Object.assign cannot be called with null or undefined');
          }
          return Object(val);
        }
        module.exports = Object.assign || function(target, source) {
          var from;
          var keys;
          var to = ToObject(target);
          for (var s = 1; s < arguments.length; s++) {
            from = arguments[s];
            keys = Object.keys(Object(from));
            for (var i = 0; i < keys.length; i++) {
              to[keys[i]] = from[keys[i]];
            }
          }
          return to;
        };
      }, {}],
      13: [function(require, module, exports) {
        (function(process) {
          (function() {
            var async = {};
            var root,
                previous_async;
            root = this;
            if (root != null) {
              previous_async = root.async;
            }
            async.noConflict = function() {
              root.async = previous_async;
              return async;
            };
            function only_once(fn) {
              var called = false;
              return function() {
                if (called)
                  throw new Error("Callback was already called.");
                called = true;
                fn.apply(root, arguments);
              };
            }
            var _toString = Object.prototype.toString;
            var _isArray = Array.isArray || function(obj) {
              return _toString.call(obj) === '[object Array]';
            };
            var _each = function(arr, iterator) {
              if (arr.forEach) {
                return arr.forEach(iterator);
              }
              for (var i = 0; i < arr.length; i += 1) {
                iterator(arr[i], i, arr);
              }
            };
            var _map = function(arr, iterator) {
              if (arr.map) {
                return arr.map(iterator);
              }
              var results = [];
              _each(arr, function(x, i, a) {
                results.push(iterator(x, i, a));
              });
              return results;
            };
            var _reduce = function(arr, iterator, memo) {
              if (arr.reduce) {
                return arr.reduce(iterator, memo);
              }
              _each(arr, function(x, i, a) {
                memo = iterator(memo, x, i, a);
              });
              return memo;
            };
            var _keys = function(obj) {
              if (Object.keys) {
                return Object.keys(obj);
              }
              var keys = [];
              for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                  keys.push(k);
                }
              }
              return keys;
            };
            if (typeof process === 'undefined' || !(process.nextTick)) {
              if (typeof setImmediate === 'function') {
                async.nextTick = function(fn) {
                  setImmediate(fn);
                };
                async.setImmediate = async.nextTick;
              } else {
                async.nextTick = function(fn) {
                  setTimeout(fn, 0);
                };
                async.setImmediate = async.nextTick;
              }
            } else {
              async.nextTick = process.nextTick;
              if (typeof setImmediate !== 'undefined') {
                async.setImmediate = function(fn) {
                  setImmediate(fn);
                };
              } else {
                async.setImmediate = async.nextTick;
              }
            }
            async.each = function(arr, iterator, callback) {
              callback = callback || function() {};
              if (!arr.length) {
                return callback();
              }
              var completed = 0;
              _each(arr, function(x) {
                iterator(x, only_once(done));
              });
              function done(err) {
                if (err) {
                  callback(err);
                  callback = function() {};
                } else {
                  completed += 1;
                  if (completed >= arr.length) {
                    callback();
                  }
                }
              }
            };
            async.forEach = async.each;
            async.eachSeries = function(arr, iterator, callback) {
              callback = callback || function() {};
              if (!arr.length) {
                return callback();
              }
              var completed = 0;
              var iterate = function() {
                iterator(arr[completed], function(err) {
                  if (err) {
                    callback(err);
                    callback = function() {};
                  } else {
                    completed += 1;
                    if (completed >= arr.length) {
                      callback();
                    } else {
                      iterate();
                    }
                  }
                });
              };
              iterate();
            };
            async.forEachSeries = async.eachSeries;
            async.eachLimit = function(arr, limit, iterator, callback) {
              var fn = _eachLimit(limit);
              fn.apply(null, [arr, iterator, callback]);
            };
            async.forEachLimit = async.eachLimit;
            var _eachLimit = function(limit) {
              return function(arr, iterator, callback) {
                callback = callback || function() {};
                if (!arr.length || limit <= 0) {
                  return callback();
                }
                var completed = 0;
                var started = 0;
                var running = 0;
                (function replenish() {
                  if (completed >= arr.length) {
                    return callback();
                  }
                  while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function(err) {
                      if (err) {
                        callback(err);
                        callback = function() {};
                      } else {
                        completed += 1;
                        running -= 1;
                        if (completed >= arr.length) {
                          callback();
                        } else {
                          replenish();
                        }
                      }
                    });
                  }
                })();
              };
            };
            var doParallel = function(fn) {
              return function() {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.each].concat(args));
              };
            };
            var doParallelLimit = function(limit, fn) {
              return function() {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [_eachLimit(limit)].concat(args));
              };
            };
            var doSeries = function(fn) {
              return function() {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.eachSeries].concat(args));
              };
            };
            var _asyncMap = function(eachfn, arr, iterator, callback) {
              arr = _map(arr, function(x, i) {
                return {
                  index: i,
                  value: x
                };
              });
              if (!callback) {
                eachfn(arr, function(x, callback) {
                  iterator(x.value, function(err) {
                    callback(err);
                  });
                });
              } else {
                var results = [];
                eachfn(arr, function(x, callback) {
                  iterator(x.value, function(err, v) {
                    results[x.index] = v;
                    callback(err);
                  });
                }, function(err) {
                  callback(err, results);
                });
              }
            };
            async.map = doParallel(_asyncMap);
            async.mapSeries = doSeries(_asyncMap);
            async.mapLimit = function(arr, limit, iterator, callback) {
              return _mapLimit(limit)(arr, iterator, callback);
            };
            var _mapLimit = function(limit) {
              return doParallelLimit(limit, _asyncMap);
            };
            async.reduce = function(arr, memo, iterator, callback) {
              async.eachSeries(arr, function(x, callback) {
                iterator(memo, x, function(err, v) {
                  memo = v;
                  callback(err);
                });
              }, function(err) {
                callback(err, memo);
              });
            };
            async.inject = async.reduce;
            async.foldl = async.reduce;
            async.reduceRight = function(arr, memo, iterator, callback) {
              var reversed = _map(arr, function(x) {
                return x;
              }).reverse();
              async.reduce(reversed, memo, iterator, callback);
            };
            async.foldr = async.reduceRight;
            var _filter = function(eachfn, arr, iterator, callback) {
              var results = [];
              arr = _map(arr, function(x, i) {
                return {
                  index: i,
                  value: x
                };
              });
              eachfn(arr, function(x, callback) {
                iterator(x.value, function(v) {
                  if (v) {
                    results.push(x);
                  }
                  callback();
                });
              }, function(err) {
                callback(_map(results.sort(function(a, b) {
                  return a.index - b.index;
                }), function(x) {
                  return x.value;
                }));
              });
            };
            async.filter = doParallel(_filter);
            async.filterSeries = doSeries(_filter);
            async.select = async.filter;
            async.selectSeries = async.filterSeries;
            var _reject = function(eachfn, arr, iterator, callback) {
              var results = [];
              arr = _map(arr, function(x, i) {
                return {
                  index: i,
                  value: x
                };
              });
              eachfn(arr, function(x, callback) {
                iterator(x.value, function(v) {
                  if (!v) {
                    results.push(x);
                  }
                  callback();
                });
              }, function(err) {
                callback(_map(results.sort(function(a, b) {
                  return a.index - b.index;
                }), function(x) {
                  return x.value;
                }));
              });
            };
            async.reject = doParallel(_reject);
            async.rejectSeries = doSeries(_reject);
            var _detect = function(eachfn, arr, iterator, main_callback) {
              eachfn(arr, function(x, callback) {
                iterator(x, function(result) {
                  if (result) {
                    main_callback(x);
                    main_callback = function() {};
                  } else {
                    callback();
                  }
                });
              }, function(err) {
                main_callback();
              });
            };
            async.detect = doParallel(_detect);
            async.detectSeries = doSeries(_detect);
            async.some = function(arr, iterator, main_callback) {
              async.each(arr, function(x, callback) {
                iterator(x, function(v) {
                  if (v) {
                    main_callback(true);
                    main_callback = function() {};
                  }
                  callback();
                });
              }, function(err) {
                main_callback(false);
              });
            };
            async.any = async.some;
            async.every = function(arr, iterator, main_callback) {
              async.each(arr, function(x, callback) {
                iterator(x, function(v) {
                  if (!v) {
                    main_callback(false);
                    main_callback = function() {};
                  }
                  callback();
                });
              }, function(err) {
                main_callback(true);
              });
            };
            async.all = async.every;
            async.sortBy = function(arr, iterator, callback) {
              async.map(arr, function(x, callback) {
                iterator(x, function(err, criteria) {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, {
                      value: x,
                      criteria: criteria
                    });
                  }
                });
              }, function(err, results) {
                if (err) {
                  return callback(err);
                } else {
                  var fn = function(left, right) {
                    var a = left.criteria,
                        b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                  };
                  callback(null, _map(results.sort(fn), function(x) {
                    return x.value;
                  }));
                }
              });
            };
            async.auto = function(tasks, callback) {
              callback = callback || function() {};
              var keys = _keys(tasks);
              var remainingTasks = keys.length;
              if (!remainingTasks) {
                return callback();
              }
              var results = {};
              var listeners = [];
              var addListener = function(fn) {
                listeners.unshift(fn);
              };
              var removeListener = function(fn) {
                for (var i = 0; i < listeners.length; i += 1) {
                  if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                  }
                }
              };
              var taskComplete = function() {
                remainingTasks--;
                _each(listeners.slice(0), function(fn) {
                  fn();
                });
              };
              addListener(function() {
                if (!remainingTasks) {
                  var theCallback = callback;
                  callback = function() {};
                  theCallback(null, results);
                }
              });
              _each(keys, function(k) {
                var task = _isArray(tasks[k]) ? tasks[k] : [tasks[k]];
                var taskCallback = function(err) {
                  var args = Array.prototype.slice.call(arguments, 1);
                  if (args.length <= 1) {
                    args = args[0];
                  }
                  if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                      safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    callback = function() {};
                  } else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                  }
                };
                var requires = task.slice(0, Math.abs(task.length - 1)) || [];
                var ready = function() {
                  return _reduce(requires, function(a, x) {
                    return (a && results.hasOwnProperty(x));
                  }, true) && !results.hasOwnProperty(k);
                };
                if (ready()) {
                  task[task.length - 1](taskCallback, results);
                } else {
                  var listener = function() {
                    if (ready()) {
                      removeListener(listener);
                      task[task.length - 1](taskCallback, results);
                    }
                  };
                  addListener(listener);
                }
              });
            };
            async.retry = function(times, task, callback) {
              var DEFAULT_TIMES = 5;
              var attempts = [];
              if (typeof times === 'function') {
                callback = task;
                task = times;
                times = DEFAULT_TIMES;
              }
              times = parseInt(times, 10) || DEFAULT_TIMES;
              var wrappedTask = function(wrappedCallback, wrappedResults) {
                var retryAttempt = function(task, finalAttempt) {
                  return function(seriesCallback) {
                    task(function(err, result) {
                      seriesCallback(!err || finalAttempt, {
                        err: err,
                        result: result
                      });
                    }, wrappedResults);
                  };
                };
                while (times) {
                  attempts.push(retryAttempt(task, !(times -= 1)));
                }
                async.series(attempts, function(done, data) {
                  data = data[data.length - 1];
                  (wrappedCallback || callback)(data.err, data.result);
                });
              };
              return callback ? wrappedTask() : wrappedTask;
            };
            async.waterfall = function(tasks, callback) {
              callback = callback || function() {};
              if (!_isArray(tasks)) {
                var err = new Error('First argument to waterfall must be an array of functions');
                return callback(err);
              }
              if (!tasks.length) {
                return callback();
              }
              var wrapIterator = function(iterator) {
                return function(err) {
                  if (err) {
                    callback.apply(null, arguments);
                    callback = function() {};
                  } else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                      args.push(wrapIterator(next));
                    } else {
                      args.push(callback);
                    }
                    async.setImmediate(function() {
                      iterator.apply(null, args);
                    });
                  }
                };
              };
              wrapIterator(async.iterator(tasks))();
            };
            var _parallel = function(eachfn, tasks, callback) {
              callback = callback || function() {};
              if (_isArray(tasks)) {
                eachfn.map(tasks, function(fn, callback) {
                  if (fn) {
                    fn(function(err) {
                      var args = Array.prototype.slice.call(arguments, 1);
                      if (args.length <= 1) {
                        args = args[0];
                      }
                      callback.call(null, err, args);
                    });
                  }
                }, callback);
              } else {
                var results = {};
                eachfn.each(_keys(tasks), function(k, callback) {
                  tasks[k](function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                      args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                  });
                }, function(err) {
                  callback(err, results);
                });
              }
            };
            async.parallel = function(tasks, callback) {
              _parallel({
                map: async.map,
                each: async.each
              }, tasks, callback);
            };
            async.parallelLimit = function(tasks, limit, callback) {
              _parallel({
                map: _mapLimit(limit),
                each: _eachLimit(limit)
              }, tasks, callback);
            };
            async.series = function(tasks, callback) {
              callback = callback || function() {};
              if (_isArray(tasks)) {
                async.mapSeries(tasks, function(fn, callback) {
                  if (fn) {
                    fn(function(err) {
                      var args = Array.prototype.slice.call(arguments, 1);
                      if (args.length <= 1) {
                        args = args[0];
                      }
                      callback.call(null, err, args);
                    });
                  }
                }, callback);
              } else {
                var results = {};
                async.eachSeries(_keys(tasks), function(k, callback) {
                  tasks[k](function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                      args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                  });
                }, function(err) {
                  callback(err, results);
                });
              }
            };
            async.iterator = function(tasks) {
              var makeCallback = function(index) {
                var fn = function() {
                  if (tasks.length) {
                    tasks[index].apply(null, arguments);
                  }
                  return fn.next();
                };
                fn.next = function() {
                  return (index < tasks.length - 1) ? makeCallback(index + 1) : null;
                };
                return fn;
              };
              return makeCallback(0);
            };
            async.apply = function(fn) {
              var args = Array.prototype.slice.call(arguments, 1);
              return function() {
                return fn.apply(null, args.concat(Array.prototype.slice.call(arguments)));
              };
            };
            var _concat = function(eachfn, arr, fn, callback) {
              var r = [];
              eachfn(arr, function(x, cb) {
                fn(x, function(err, y) {
                  r = r.concat(y || []);
                  cb(err);
                });
              }, function(err) {
                callback(err, r);
              });
            };
            async.concat = doParallel(_concat);
            async.concatSeries = doSeries(_concat);
            async.whilst = function(test, iterator, callback) {
              if (test()) {
                iterator(function(err) {
                  if (err) {
                    return callback(err);
                  }
                  async.whilst(test, iterator, callback);
                });
              } else {
                callback();
              }
            };
            async.doWhilst = function(iterator, test, callback) {
              iterator(function(err) {
                if (err) {
                  return callback(err);
                }
                var args = Array.prototype.slice.call(arguments, 1);
                if (test.apply(null, args)) {
                  async.doWhilst(iterator, test, callback);
                } else {
                  callback();
                }
              });
            };
            async.until = function(test, iterator, callback) {
              if (!test()) {
                iterator(function(err) {
                  if (err) {
                    return callback(err);
                  }
                  async.until(test, iterator, callback);
                });
              } else {
                callback();
              }
            };
            async.doUntil = function(iterator, test, callback) {
              iterator(function(err) {
                if (err) {
                  return callback(err);
                }
                var args = Array.prototype.slice.call(arguments, 1);
                if (!test.apply(null, args)) {
                  async.doUntil(iterator, test, callback);
                } else {
                  callback();
                }
              });
            };
            async.queue = function(worker, concurrency) {
              if (concurrency === undefined) {
                concurrency = 1;
              }
              function _insert(q, data, pos, callback) {
                if (!q.started) {
                  q.started = true;
                }
                if (!_isArray(data)) {
                  data = [data];
                }
                if (data.length == 0) {
                  return async.setImmediate(function() {
                    if (q.drain) {
                      q.drain();
                    }
                  });
                }
                _each(data, function(task) {
                  var item = {
                    data: task,
                    callback: typeof callback === 'function' ? callback : null
                  };
                  if (pos) {
                    q.tasks.unshift(item);
                  } else {
                    q.tasks.push(item);
                  }
                  if (q.saturated && q.tasks.length === q.concurrency) {
                    q.saturated();
                  }
                  async.setImmediate(q.process);
                });
              }
              var workers = 0;
              var q = {
                tasks: [],
                concurrency: concurrency,
                saturated: null,
                empty: null,
                drain: null,
                started: false,
                paused: false,
                push: function(data, callback) {
                  _insert(q, data, false, callback);
                },
                kill: function() {
                  q.drain = null;
                  q.tasks = [];
                },
                unshift: function(data, callback) {
                  _insert(q, data, true, callback);
                },
                process: function() {
                  if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                      q.empty();
                    }
                    workers += 1;
                    var next = function() {
                      workers -= 1;
                      if (task.callback) {
                        task.callback.apply(task, arguments);
                      }
                      if (q.drain && q.tasks.length + workers === 0) {
                        q.drain();
                      }
                      q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                  }
                },
                length: function() {
                  return q.tasks.length;
                },
                running: function() {
                  return workers;
                },
                idle: function() {
                  return q.tasks.length + workers === 0;
                },
                pause: function() {
                  if (q.paused === true) {
                    return;
                  }
                  q.paused = true;
                  q.process();
                },
                resume: function() {
                  if (q.paused === false) {
                    return;
                  }
                  q.paused = false;
                  q.process();
                }
              };
              return q;
            };
            async.priorityQueue = function(worker, concurrency) {
              function _compareTasks(a, b) {
                return a.priority - b.priority;
              }
              ;
              function _binarySearch(sequence, item, compare) {
                var beg = -1,
                    end = sequence.length - 1;
                while (beg < end) {
                  var mid = beg + ((end - beg + 1) >>> 1);
                  if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                  } else {
                    end = mid - 1;
                  }
                }
                return beg;
              }
              function _insert(q, data, priority, callback) {
                if (!q.started) {
                  q.started = true;
                }
                if (!_isArray(data)) {
                  data = [data];
                }
                if (data.length == 0) {
                  return async.setImmediate(function() {
                    if (q.drain) {
                      q.drain();
                    }
                  });
                }
                _each(data, function(task) {
                  var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : null
                  };
                  q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);
                  if (q.saturated && q.tasks.length === q.concurrency) {
                    q.saturated();
                  }
                  async.setImmediate(q.process);
                });
              }
              var q = async.queue(worker, concurrency);
              q.push = function(data, priority, callback) {
                _insert(q, data, priority, callback);
              };
              delete q.unshift;
              return q;
            };
            async.cargo = function(worker, payload) {
              var working = false,
                  tasks = [];
              var cargo = {
                tasks: tasks,
                payload: payload,
                saturated: null,
                empty: null,
                drain: null,
                drained: true,
                push: function(data, callback) {
                  if (!_isArray(data)) {
                    data = [data];
                  }
                  _each(data, function(task) {
                    tasks.push({
                      data: task,
                      callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                      cargo.saturated();
                    }
                  });
                  async.setImmediate(cargo.process);
                },
                process: function process() {
                  if (working)
                    return;
                  if (tasks.length === 0) {
                    if (cargo.drain && !cargo.drained)
                      cargo.drain();
                    cargo.drained = true;
                    return;
                  }
                  var ts = typeof payload === 'number' ? tasks.splice(0, payload) : tasks.splice(0, tasks.length);
                  var ds = _map(ts, function(task) {
                    return task.data;
                  });
                  if (cargo.empty)
                    cargo.empty();
                  working = true;
                  worker(ds, function() {
                    working = false;
                    var args = arguments;
                    _each(ts, function(data) {
                      if (data.callback) {
                        data.callback.apply(null, args);
                      }
                    });
                    process();
                  });
                },
                length: function() {
                  return tasks.length;
                },
                running: function() {
                  return working;
                }
              };
              return cargo;
            };
            var _console_fn = function(name) {
              return function(fn) {
                var args = Array.prototype.slice.call(arguments, 1);
                fn.apply(null, args.concat([function(err) {
                  var args = Array.prototype.slice.call(arguments, 1);
                  if (typeof console !== 'undefined') {
                    if (err) {
                      if (console.error) {
                        console.error(err);
                      }
                    } else if (console[name]) {
                      _each(args, function(x) {
                        console[name](x);
                      });
                    }
                  }
                }]));
              };
            };
            async.log = _console_fn('log');
            async.dir = _console_fn('dir');
            async.memoize = function(fn, hasher) {
              var memo = {};
              var queues = {};
              hasher = hasher || function(x) {
                return x;
              };
              var memoized = function() {
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                var key = hasher.apply(null, args);
                if (key in memo) {
                  async.nextTick(function() {
                    callback.apply(null, memo[key]);
                  });
                } else if (key in queues) {
                  queues[key].push(callback);
                } else {
                  queues[key] = [callback];
                  fn.apply(null, args.concat([function() {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0,
                        l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                  }]));
                }
              };
              memoized.memo = memo;
              memoized.unmemoized = fn;
              return memoized;
            };
            async.unmemoize = function(fn) {
              return function() {
                return (fn.unmemoized || fn).apply(null, arguments);
              };
            };
            async.times = function(count, iterator, callback) {
              var counter = [];
              for (var i = 0; i < count; i++) {
                counter.push(i);
              }
              return async.map(counter, iterator, callback);
            };
            async.timesSeries = function(count, iterator, callback) {
              var counter = [];
              for (var i = 0; i < count; i++) {
                counter.push(i);
              }
              return async.mapSeries(counter, iterator, callback);
            };
            async.seq = function() {
              var fns = arguments;
              return function() {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                async.reduce(fns, args, function(newargs, fn, cb) {
                  fn.apply(that, newargs.concat([function() {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                  }]));
                }, function(err, results) {
                  callback.apply(that, [err].concat(results));
                });
              };
            };
            async.compose = function() {
              return async.seq.apply(null, Array.prototype.reverse.call(arguments));
            };
            var _applyEach = function(eachfn, fns) {
              var go = function() {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                return eachfn(fns, function(fn, cb) {
                  fn.apply(that, args.concat([cb]));
                }, callback);
              };
              if (arguments.length > 2) {
                var args = Array.prototype.slice.call(arguments, 2);
                return go.apply(this, args);
              } else {
                return go;
              }
            };
            async.applyEach = doParallel(_applyEach);
            async.applyEachSeries = doSeries(_applyEach);
            async.forever = function(fn, callback) {
              function next(err) {
                if (err) {
                  if (callback) {
                    return callback(err);
                  }
                  throw err;
                }
                fn(next);
              }
              next();
            };
            if (typeof module !== 'undefined' && module.exports) {
              module.exports = async;
            } else if (typeof define !== 'undefined' && define.amd) {
              define([], function() {
                return async;
              });
            } else {
              root.async = async;
            }
          }());
        }).call(this, require('_process'));
      }, {"_process": 4}],
      14: [function(require, module, exports) {
        arguments[4][11][0].apply(exports, arguments);
      }, {"dup": 11}],
      15: [function(require, module, exports) {
        var async = require('async'),
            urlParser = require('url'),
            Resource = require('./Resource'),
            EventEmitter = require('eventemitter3');
        function Loader(baseUrl, concurrency) {
          EventEmitter.call(this);
          concurrency = concurrency || 10;
          this.baseUrl = baseUrl || '';
          this.progress = 0;
          this.loading = false;
          this._progressChunk = 0;
          this._beforeMiddleware = [];
          this._afterMiddleware = [];
          this._boundLoadResource = this._loadResource.bind(this);
          this._boundOnLoad = this._onLoad.bind(this);
          this._buffer = [];
          this._numToLoad = 0;
          this._queue = async.queue(this._boundLoadResource, concurrency);
          this.resources = {};
        }
        Loader.prototype = Object.create(EventEmitter.prototype);
        Loader.prototype.constructor = Loader;
        module.exports = Loader;
        Loader.prototype.add = Loader.prototype.enqueue = function(name, url, options, cb) {
          if (Array.isArray(name)) {
            for (var i = 0; i < name.length; ++i) {
              this.add(name[i]);
            }
            return this;
          }
          if (typeof name === 'object') {
            cb = url || name.callback || name.onComplete;
            options = name;
            url = name.url;
            name = name.name || name.key || name.url;
          }
          if (typeof url !== 'string') {
            cb = options;
            options = url;
            url = name;
          }
          if (typeof url !== 'string') {
            throw new Error('No url passed to add resource to loader.');
          }
          if (typeof options === 'function') {
            cb = options;
            options = null;
          }
          if (this.resources[name]) {
            throw new Error('Resource with name "' + name + '" already exists.');
          }
          url = this._handleBaseUrl(url);
          this.resources[name] = new Resource(name, url, options);
          if (typeof cb === 'function') {
            this.resources[name].once('afterMiddleware', cb);
          }
          this._numToLoad++;
          if (this._queue.started) {
            this._queue.push(this.resources[name]);
            this._progressChunk = (100 - this.progress) / (this._queue.length() + this._queue.running());
          } else {
            this._buffer.push(this.resources[name]);
            this._progressChunk = 100 / this._buffer.length;
          }
          return this;
        };
        Loader.prototype._handleBaseUrl = function(url) {
          var parsedUrl = urlParser.parse(url);
          if (parsedUrl.protocol || parsedUrl.pathname.indexOf('//') === 0) {
            return url;
          }
          if (this.baseUrl.length && this.baseUrl.lastIndexOf('/') !== this.baseUrl.length - 1 && url.lastIndexOf('/') !== url.length - 1) {
            return this.baseUrl + '/' + url;
          } else {
            return this.baseUrl + url;
          }
        };
        Loader.prototype.before = Loader.prototype.pre = function(fn) {
          this._beforeMiddleware.push(fn);
          return this;
        };
        Loader.prototype.after = Loader.prototype.use = function(fn) {
          this._afterMiddleware.push(fn);
          return this;
        };
        Loader.prototype.reset = function() {
          this.progress = 0;
          this.loading = false;
          this._progressChunk = 0;
          this._buffer.length = 0;
          this._numToLoad = 0;
          this._queue.kill();
          this._queue.started = false;
          this.resources = {};
        };
        Loader.prototype.load = function(cb) {
          if (typeof cb === 'function') {
            this.once('complete', cb);
          }
          if (this._queue.started) {
            return this;
          }
          this.emit('start', this);
          for (var i = 0; i < this._buffer.length; ++i) {
            this._queue.push(this._buffer[i]);
          }
          this._buffer.length = 0;
          return this;
        };
        Loader.prototype._loadResource = function(resource, dequeue) {
          var self = this;
          resource._dequeue = dequeue;
          this._runMiddleware(resource, this._beforeMiddleware, function() {
            resource.load(self._boundOnLoad);
          });
        };
        Loader.prototype._onComplete = function() {
          this.emit('complete', this, this.resources);
        };
        Loader.prototype._onLoad = function(resource) {
          this.progress += this._progressChunk;
          this.emit('progress', this, resource);
          if (resource.error) {
            this.emit('error', resource.error, this, resource);
          } else {
            this.emit('load', this, resource);
          }
          this._runMiddleware(resource, this._afterMiddleware, function() {
            resource.emit('afterMiddleware', resource);
            this._numToLoad--;
            if (this._numToLoad === 0) {
              this._onComplete();
            }
          });
          resource._dequeue();
        };
        Loader.prototype._runMiddleware = function(resource, fns, cb) {
          var self = this;
          async.eachSeries(fns, function(fn, next) {
            fn.call(self, resource, next);
          }, cb.bind(this, resource));
        };
        Loader.LOAD_TYPE = Resource.LOAD_TYPE;
        Loader.XHR_READY_STATE = Resource.XHR_READY_STATE;
        Loader.XHR_RESPONSE_TYPE = Resource.XHR_RESPONSE_TYPE;
      }, {
        "./Resource": 16,
        "async": 13,
        "eventemitter3": 14,
        "url": 9
      }],
      16: [function(require, module, exports) {
        var EventEmitter = require('eventemitter3'),
            _url = require('url'),
            useXdr = !!(window.XDomainRequest && !('withCredentials' in (new XMLHttpRequest()))),
            tempAnchor = null;
        function Resource(name, url, options) {
          EventEmitter.call(this);
          options = options || {};
          if (typeof name !== 'string' || typeof url !== 'string') {
            throw new Error('Both name and url are required for constructing a resource.');
          }
          this.name = name;
          this.url = url;
          this.isDataUrl = this.url.indexOf('data:') === 0;
          this.data = null;
          this.crossOrigin = options.crossOrigin === true ? 'anonymous' : null;
          this.loadType = options.loadType || this._determineLoadType();
          this.xhrType = options.xhrType;
          this.error = null;
          this.xhr = null;
          this.isJson = false;
          this.isXml = false;
          this.isImage = false;
          this.isAudio = false;
          this.isVideo = false;
          this._dequeue = null;
          this._boundComplete = this.complete.bind(this);
          this._boundOnError = this._onError.bind(this);
          this._boundOnProgress = this._onProgress.bind(this);
          this._boundXhrOnError = this._xhrOnError.bind(this);
          this._boundXhrOnAbort = this._xhrOnAbort.bind(this);
          this._boundXhrOnLoad = this._xhrOnLoad.bind(this);
          this._boundXdrOnTimeout = this._xdrOnTimeout.bind(this);
        }
        Resource.prototype = Object.create(EventEmitter.prototype);
        Resource.prototype.constructor = Resource;
        module.exports = Resource;
        Resource.prototype.complete = function() {
          if (this.data && this.data.removeEventListener) {
            this.data.removeEventListener('error', this._boundOnError);
            this.data.removeEventListener('load', this._boundComplete);
            this.data.removeEventListener('progress', this._boundOnProgress);
            this.data.removeEventListener('canplaythrough', this._boundComplete);
          }
          if (this.xhr) {
            if (this.xhr.removeEventListener) {
              this.xhr.removeEventListener('error', this._boundXhrOnError);
              this.xhr.removeEventListener('abort', this._boundXhrOnAbort);
              this.xhr.removeEventListener('progress', this._boundOnProgress);
              this.xhr.removeEventListener('load', this._boundXhrOnLoad);
            } else {
              this.xhr.onerror = null;
              this.xhr.ontimeout = null;
              this.xhr.onprogress = null;
              this.xhr.onload = null;
            }
          }
          this.emit('complete', this);
        };
        Resource.prototype.load = function(cb) {
          this.emit('start', this);
          if (cb) {
            this.once('complete', cb);
          }
          if (typeof this.crossOrigin !== 'string') {
            this.crossOrigin = this._determineCrossOrigin(this.url);
          }
          switch (this.loadType) {
            case Resource.LOAD_TYPE.IMAGE:
              this._loadImage();
              break;
            case Resource.LOAD_TYPE.AUDIO:
              this._loadElement('audio');
              break;
            case Resource.LOAD_TYPE.VIDEO:
              this._loadElement('video');
              break;
            case Resource.LOAD_TYPE.XHR:
            default:
              if (useXdr && this.crossOrigin) {
                this._loadXdr();
              } else {
                this._loadXhr();
              }
              break;
          }
        };
        Resource.prototype._loadImage = function() {
          this.data = new Image();
          if (this.crossOrigin) {
            this.data.crossOrigin = this.crossOrigin;
          }
          this.data.src = this.url;
          this.isImage = true;
          this.data.addEventListener('error', this._boundOnError, false);
          this.data.addEventListener('load', this._boundComplete, false);
          this.data.addEventListener('progress', this._boundOnProgress, false);
        };
        Resource.prototype._loadElement = function(type) {
          this.data = document.createElement(type);
          if (Array.isArray(this.url)) {
            for (var i = 0; i < this.url.length; ++i) {
              this.data.appendChild(this._createSource(type, this.url[i]));
            }
          } else {
            this.data.appendChild(this._createSource(type, this.url));
          }
          this['is' + type[0].toUpperCase() + type.substring(1)] = true;
          this.data.addEventListener('error', this._boundOnError, false);
          this.data.addEventListener('load', this._boundComplete, false);
          this.data.addEventListener('progress', this._boundOnProgress, false);
          this.data.addEventListener('canplaythrough', this._boundComplete, false);
          this.data.load();
        };
        Resource.prototype._loadXhr = function() {
          if (typeof this.xhrType !== 'string') {
            this.xhrType = this._determineXhrType();
          }
          var xhr = this.xhr = new XMLHttpRequest();
          xhr.open('GET', this.url, true);
          if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON || this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
            xhr.responseType = Resource.XHR_RESPONSE_TYPE.TEXT;
          } else {
            xhr.responseType = this.xhrType;
          }
          xhr.addEventListener('error', this._boundXhrOnError, false);
          xhr.addEventListener('abort', this._boundXhrOnAbort, false);
          xhr.addEventListener('progress', this._boundOnProgress, false);
          xhr.addEventListener('load', this._boundXhrOnLoad, false);
          xhr.send();
        };
        Resource.prototype._loadXdr = function() {
          if (typeof this.xhrType !== 'string') {
            this.xhrType = this._determineXhrType();
          }
          var xdr = this.xhr = new XDomainRequest();
          xdr.timeout = 5000;
          xdr.onerror = this._boundXhrOnError;
          xdr.ontimeout = this._boundXdrOnTimeout;
          xdr.onprogress = this._boundOnProgress;
          xdr.onload = this._boundXhrOnLoad;
          xdr.open('GET', this.url, true);
          setTimeout(function() {
            xdr.send();
          }, 0);
        };
        Resource.prototype._createSource = function(type, url, mime) {
          if (!mime) {
            mime = type + '/' + url.substr(url.lastIndexOf('.') + 1);
          }
          var source = document.createElement('source');
          source.src = url;
          source.type = mime;
          return source;
        };
        Resource.prototype._onError = function(event) {
          this.error = new Error('Failed to load element using ' + event.target.nodeName);
          this.complete();
        };
        Resource.prototype._onProgress = function(event) {
          if (event && event.lengthComputable) {
            this.emit('progress', this, event.loaded / event.total);
          }
        };
        Resource.prototype._xhrOnError = function() {
          this.error = new Error(reqType(this.xhr) + ' Request failed. ' + 'Status: ' + this.xhr.status + ', text: "' + this.xhr.statusText + '"');
          this.complete();
        };
        Resource.prototype._xhrOnAbort = function() {
          this.error = new Error(reqType(this.xhr) + ' Request was aborted by the user.');
          this.complete();
        };
        Resource.prototype._xdrOnTimeout = function() {
          this.error = new Error(reqType(this.xhr) + ' Request timed out.');
          this.complete();
        };
        Resource.prototype._xhrOnLoad = function() {
          var xhr = this.xhr,
              status = xhr.status !== undefined ? xhr.status : 200;
          if (status === 200 || status === 204 || (status === 0 && xhr.responseText.length > 0)) {
            if (this.xhrType === Resource.XHR_RESPONSE_TYPE.TEXT) {
              this.data = xhr.responseText;
            } else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON) {
              try {
                this.data = JSON.parse(xhr.responseText);
                this.isJson = true;
              } catch (e) {
                this.error = new Error('Error trying to parse loaded json:', e);
              }
            } else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
              try {
                if (window.DOMParser) {
                  var domparser = new DOMParser();
                  this.data = domparser.parseFromString(xhr.responseText, 'text/xml');
                } else {
                  var div = document.createElement('div');
                  div.innerHTML = xhr.responseText;
                  this.data = div;
                }
                this.isXml = true;
              } catch (e) {
                this.error = new Error('Error trying to parse loaded xml:', e);
              }
            } else {
              this.data = xhr.response || xhr.responseText;
            }
          } else {
            this.error = new Error('[' + xhr.status + ']' + xhr.statusText + ':' + xhr.responseURL);
          }
          this.complete();
        };
        function reqType(xhr) {
          return xhr.toString().replace('object ', '');
        }
        Resource.prototype._determineCrossOrigin = function(url, loc) {
          if (url.indexOf('data:') === 0) {
            return '';
          }
          loc = loc || window.location;
          if (!tempAnchor) {
            tempAnchor = document.createElement('a');
          }
          tempAnchor.href = url;
          url = _url.parse(tempAnchor.href);
          var samePort = (!url.port && loc.port === '') || (url.port === loc.port);
          if (url.hostname !== loc.hostname || !samePort || url.protocol !== loc.protocol) {
            return 'anonymous';
          }
          return '';
        };
        Resource.prototype._determineXhrType = function() {
          return Resource._xhrTypeMap[this._getExtension()] || Resource.XHR_RESPONSE_TYPE.TEXT;
        };
        Resource.prototype._determineLoadType = function() {
          return Resource._loadTypeMap[this._getExtension()] || Resource.LOAD_TYPE.XHR;
        };
        Resource.prototype._getExtension = function() {
          var url = this.url,
              ext;
          if (this.isDataUrl) {
            var slashIndex = url.indexOf('/');
            ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
          } else {
            ext = url.substring(url.lastIndexOf('.') + 1);
          }
          return ext;
        };
        Resource.prototype._getMimeFromXhrType = function(type) {
          switch (type) {
            case Resource.XHR_RESPONSE_TYPE.BUFFER:
              return 'application/octet-binary';
            case Resource.XHR_RESPONSE_TYPE.BLOB:
              return 'application/blob';
            case Resource.XHR_RESPONSE_TYPE.DOCUMENT:
              return 'application/xml';
            case Resource.XHR_RESPONSE_TYPE.JSON:
              return 'application/json';
            case Resource.XHR_RESPONSE_TYPE.DEFAULT:
            case Resource.XHR_RESPONSE_TYPE.TEXT:
            default:
              return 'text/plain';
          }
        };
        Resource.LOAD_TYPE = {
          XHR: 1,
          IMAGE: 2,
          AUDIO: 3,
          VIDEO: 4
        };
        Resource.XHR_READY_STATE = {
          UNSENT: 0,
          OPENED: 1,
          HEADERS_RECEIVED: 2,
          LOADING: 3,
          DONE: 4
        };
        Resource.XHR_RESPONSE_TYPE = {
          DEFAULT: 'text',
          BUFFER: 'arraybuffer',
          BLOB: 'blob',
          DOCUMENT: 'document',
          JSON: 'json',
          TEXT: 'text'
        };
        Resource._loadTypeMap = {
          'gif': Resource.LOAD_TYPE.IMAGE,
          'png': Resource.LOAD_TYPE.IMAGE,
          'bmp': Resource.LOAD_TYPE.IMAGE,
          'jpg': Resource.LOAD_TYPE.IMAGE,
          'jpeg': Resource.LOAD_TYPE.IMAGE,
          'tif': Resource.LOAD_TYPE.IMAGE,
          'tiff': Resource.LOAD_TYPE.IMAGE,
          'webp': Resource.LOAD_TYPE.IMAGE,
          'tga': Resource.LOAD_TYPE.IMAGE
        };
        Resource._xhrTypeMap = {
          'xhtml': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
          'html': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
          'htm': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
          'xml': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
          'tmx': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
          'tsx': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
          'svg': Resource.XHR_RESPONSE_TYPE.DOCUMENT,
          'gif': Resource.XHR_RESPONSE_TYPE.BLOB,
          'png': Resource.XHR_RESPONSE_TYPE.BLOB,
          'bmp': Resource.XHR_RESPONSE_TYPE.BLOB,
          'jpg': Resource.XHR_RESPONSE_TYPE.BLOB,
          'jpeg': Resource.XHR_RESPONSE_TYPE.BLOB,
          'tif': Resource.XHR_RESPONSE_TYPE.BLOB,
          'tiff': Resource.XHR_RESPONSE_TYPE.BLOB,
          'webp': Resource.XHR_RESPONSE_TYPE.BLOB,
          'tga': Resource.XHR_RESPONSE_TYPE.BLOB,
          'json': Resource.XHR_RESPONSE_TYPE.JSON,
          'text': Resource.XHR_RESPONSE_TYPE.TEXT,
          'txt': Resource.XHR_RESPONSE_TYPE.TEXT
        };
        Resource.setExtensionLoadType = function(extname, loadType) {
          setExtMap(Resource._loadTypeMap, extname, loadType);
        };
        Resource.setExtensionXhrType = function(extname, xhrType) {
          setExtMap(Resource._xhrTypeMap, extname, xhrType);
        };
        function setExtMap(map, extname, val) {
          if (extname && extname.indexOf('.') === 0) {
            extname = extname.substring(1);
          }
          if (!extname) {
            return;
          }
          map[extname] = val;
        }
      }, {
        "eventemitter3": 14,
        "url": 9
      }],
      17: [function(require, module, exports) {
        module.exports = {
          _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
          encodeBinary: function(input) {
            var output = "";
            var bytebuffer;
            var encodedCharIndexes = new Array(4);
            var inx = 0;
            var jnx = 0;
            var paddingBytes = 0;
            while (inx < input.length) {
              bytebuffer = new Array(3);
              for (jnx = 0; jnx < bytebuffer.length; jnx++) {
                if (inx < input.length) {
                  bytebuffer[jnx] = input.charCodeAt(inx++) & 0xff;
                } else {
                  bytebuffer[jnx] = 0;
                }
              }
              encodedCharIndexes[0] = bytebuffer[0] >> 2;
              encodedCharIndexes[1] = ((bytebuffer[0] & 0x3) << 4) | (bytebuffer[1] >> 4);
              encodedCharIndexes[2] = ((bytebuffer[1] & 0x0f) << 2) | (bytebuffer[2] >> 6);
              encodedCharIndexes[3] = bytebuffer[2] & 0x3f;
              paddingBytes = inx - (input.length - 1);
              switch (paddingBytes) {
                case 2:
                  encodedCharIndexes[3] = 64;
                  encodedCharIndexes[2] = 64;
                  break;
                case 1:
                  encodedCharIndexes[3] = 64;
                  break;
                default:
                  break;
              }
              for (jnx = 0; jnx < encodedCharIndexes.length; jnx++) {
                output += this._keyStr.charAt(encodedCharIndexes[jnx]);
              }
            }
            return output;
          }
        };
      }, {}],
      18: [function(require, module, exports) {
        module.exports = require('./Loader');
        module.exports.Resource = require('./Resource');
        module.exports.middleware = {
          caching: {memory: require('./middlewares/caching/memory')},
          parsing: {blob: require('./middlewares/parsing/blob')}
        };
      }, {
        "./Loader": 15,
        "./Resource": 16,
        "./middlewares/caching/memory": 19,
        "./middlewares/parsing/blob": 20
      }],
      19: [function(require, module, exports) {
        var cache = {};
        module.exports = function() {
          return function(resource, next) {
            if (cache[resource.url]) {
              resource.data = cache[resource.url];
              resource.complete();
            } else {
              resource.once('complete', function() {
                cache[this.url] = this.data;
              });
              next();
            }
          };
        };
      }, {}],
      20: [function(require, module, exports) {
        var Resource = require('../../Resource'),
            b64 = require('../../b64');
        window.URL = window.URL || window.webkitURL;
        module.exports = function() {
          return function(resource, next) {
            if (!resource.data) {
              return next();
            }
            if (resource.xhr && resource.xhrType === Resource.XHR_RESPONSE_TYPE.BLOB) {
              if (!window.Blob || typeof resource.data === 'string') {
                var type = resource.xhr.getResponseHeader('content-type');
                if (type && type.indexOf('image') === 0) {
                  resource.data = new Image();
                  resource.data.src = 'data:' + type + ';base64,' + b64.encodeBinary(resource.xhr.responseText);
                  resource.isImage = true;
                  resource.data.onload = function() {
                    resource.data.onload = null;
                    next();
                  };
                }
              } else if (resource.data.type.indexOf('image') === 0) {
                var src = URL.createObjectURL(resource.data);
                resource.blob = resource.data;
                resource.data = new Image();
                resource.data.src = src;
                resource.isImage = true;
                resource.data.onload = function() {
                  URL.revokeObjectURL(src);
                  resource.data.onload = null;
                  next();
                };
              }
            } else {
              next();
            }
          };
        };
      }, {
        "../../Resource": 16,
        "../../b64": 17
      }],
      21: [function(require, module, exports) {
        module.exports = {
          "name": "pixi.js",
          "version": "3.0.6",
          "description": "Pixi.js is a fast lightweight 2D library that works across all devices.",
          "author": "Mat Groves",
          "contributors": ["Chad Engler <chad@pantherdev.com>", "Richard Davey <rdavey@gmail.com>"],
          "main": "./src/index.js",
          "homepage": "http://goodboydigital.com/",
          "bugs": "https://github.com/GoodBoyDigital/pixi.js/issues",
          "license": "MIT",
          "repository": {
            "type": "git",
            "url": "https://github.com/GoodBoyDigital/pixi.js.git"
          },
          "scripts": {
            "test": "gulp && testem ci",
            "docs": "jsdoc -c ./gulp/util/jsdoc.conf.json -R README.md"
          },
          "dependencies": {
            "async": "^0.9.0",
            "brfs": "^1.4.0",
            "earcut": "^2.0.0",
            "eventemitter3": "^1.1.0",
            "object-assign": "^2.0.0",
            "resource-loader": "^1.6.0"
          },
          "devDependencies": {
            "browserify": "^9.0.8",
            "chai": "^2.2.0",
            "del": "^1.1.1",
            "gulp": "^3.8.11",
            "gulp-cached": "^1.0.4",
            "gulp-concat": "^2.5.2",
            "gulp-debug": "^2.0.1",
            "gulp-jshint": "^1.10.0",
            "gulp-mirror": "^0.4.0",
            "gulp-plumber": "^1.0.0",
            "gulp-rename": "^1.2.2",
            "gulp-sourcemaps": "^1.5.2",
            "gulp-uglify": "^1.2.0",
            "gulp-util": "^3.0.4",
            "jaguarjs-jsdoc": "git+https://github.com/davidshimjs/jaguarjs-jsdoc.git",
            "jsdoc": "^3.3.0-beta3",
            "jshint-summary": "^0.4.0",
            "minimist": "^1.1.1",
            "mocha": "^2.2.4",
            "require-dir": "^0.3.0",
            "run-sequence": "^1.0.2",
            "testem": "^0.8.2",
            "vinyl-buffer": "^1.0.0",
            "vinyl-source-stream": "^1.1.0",
            "watchify": "^3.1.2"
          },
          "browserify": {"transform": ["brfs"]}
        };
      }, {}],
      22: [function(require, module, exports) {
        var CONST = {
          VERSION: require('../../package.json!systemjs-json').version,
          PI_2: Math.PI * 2,
          RAD_TO_DEG: 180 / Math.PI,
          DEG_TO_RAD: Math.PI / 180,
          TARGET_FPMS: 0.06,
          RENDERER_TYPE: {
            UNKNOWN: 0,
            WEBGL: 1,
            CANVAS: 2
          },
          BLEND_MODES: {
            NORMAL: 0,
            ADD: 1,
            MULTIPLY: 2,
            SCREEN: 3,
            OVERLAY: 4,
            DARKEN: 5,
            LIGHTEN: 6,
            COLOR_DODGE: 7,
            COLOR_BURN: 8,
            HARD_LIGHT: 9,
            SOFT_LIGHT: 10,
            DIFFERENCE: 11,
            EXCLUSION: 12,
            HUE: 13,
            SATURATION: 14,
            COLOR: 15,
            LUMINOSITY: 16
          },
          SCALE_MODES: {
            DEFAULT: 0,
            LINEAR: 0,
            NEAREST: 1
          },
          RETINA_PREFIX: /@(.+)x/,
          RESOLUTION: 1,
          FILTER_RESOLUTION: 1,
          DEFAULT_RENDER_OPTIONS: {
            view: null,
            resolution: 1,
            antialias: false,
            forceFXAA: false,
            autoResize: false,
            transparent: false,
            backgroundColor: 0x000000,
            clearBeforeRender: true,
            preserveDrawingBuffer: false
          },
          SHAPES: {
            POLY: 0,
            RECT: 1,
            CIRC: 2,
            ELIP: 3,
            RREC: 4
          },
          SPRITE_BATCH_SIZE: 2000
        };
        module.exports = CONST;
      }, {"../../package.json": 21}],
      23: [function(require, module, exports) {
        var math = require('../math'),
            DisplayObject = require('./DisplayObject'),
            RenderTexture = require('../textures/RenderTexture'),
            _tempMatrix = new math.Matrix();
        function Container() {
          DisplayObject.call(this);
          this.children = [];
        }
        Container.prototype = Object.create(DisplayObject.prototype);
        Container.prototype.constructor = Container;
        module.exports = Container;
        Object.defineProperties(Container.prototype, {
          width: {
            get: function() {
              return this.scale.x * this.getLocalBounds().width;
            },
            set: function(value) {
              var width = this.getLocalBounds().width;
              if (width !== 0) {
                this.scale.x = value / width;
              } else {
                this.scale.x = 1;
              }
              this._width = value;
            }
          },
          height: {
            get: function() {
              return this.scale.y * this.getLocalBounds().height;
            },
            set: function(value) {
              var height = this.getLocalBounds().height;
              if (height !== 0) {
                this.scale.y = value / height;
              } else {
                this.scale.y = 1;
              }
              this._height = value;
            }
          }
        });
        Container.prototype.addChild = function(child) {
          return this.addChildAt(child, this.children.length);
        };
        Container.prototype.addChildAt = function(child, index) {
          if (child === this) {
            return child;
          }
          if (index >= 0 && index <= this.children.length) {
            if (child.parent) {
              child.parent.removeChild(child);
            }
            child.parent = this;
            this.children.splice(index, 0, child);
            return child;
          } else {
            throw new Error(child + 'addChildAt: The index ' + index + ' supplied is out of bounds ' + this.children.length);
          }
        };
        Container.prototype.swapChildren = function(child, child2) {
          if (child === child2) {
            return;
          }
          var index1 = this.getChildIndex(child);
          var index2 = this.getChildIndex(child2);
          if (index1 < 0 || index2 < 0) {
            throw new Error('swapChildren: Both the supplied DisplayObjects must be children of the caller.');
          }
          this.children[index1] = child2;
          this.children[index2] = child;
        };
        Container.prototype.getChildIndex = function(child) {
          var index = this.children.indexOf(child);
          if (index === -1) {
            throw new Error('The supplied DisplayObject must be a child of the caller');
          }
          return index;
        };
        Container.prototype.setChildIndex = function(child, index) {
          if (index < 0 || index >= this.children.length) {
            throw new Error('The supplied index is out of bounds');
          }
          var currentIndex = this.getChildIndex(child);
          this.children.splice(currentIndex, 1);
          this.children.splice(index, 0, child);
        };
        Container.prototype.getChildAt = function(index) {
          if (index < 0 || index >= this.children.length) {
            throw new Error('getChildAt: Supplied index ' + index + ' does not exist in the child list, or the supplied DisplayObject is not a child of the caller');
          }
          return this.children[index];
        };
        Container.prototype.removeChild = function(child) {
          var index = this.children.indexOf(child);
          if (index === -1) {
            return;
          }
          return this.removeChildAt(index);
        };
        Container.prototype.removeChildAt = function(index) {
          var child = this.getChildAt(index);
          child.parent = null;
          this.children.splice(index, 1);
          return child;
        };
        Container.prototype.removeChildren = function(beginIndex, endIndex) {
          var begin = beginIndex || 0;
          var end = typeof endIndex === 'number' ? endIndex : this.children.length;
          var range = end - begin;
          if (range > 0 && range <= end) {
            var removed = this.children.splice(begin, range);
            for (var i = 0; i < removed.length; ++i) {
              removed[i].parent = null;
            }
            return removed;
          } else if (range === 0 && this.children.length === 0) {
            return [];
          } else {
            throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
          }
        };
        Container.prototype.generateTexture = function(renderer, resolution, scaleMode) {
          var bounds = this.getLocalBounds();
          var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0, renderer, scaleMode, resolution);
          _tempMatrix.tx = -bounds.x;
          _tempMatrix.ty = -bounds.y;
          renderTexture.render(this, _tempMatrix);
          return renderTexture;
        };
        Container.prototype.updateTransform = function() {
          if (!this.visible) {
            return;
          }
          this.displayObjectUpdateTransform();
          for (var i = 0,
              j = this.children.length; i < j; ++i) {
            this.children[i].updateTransform();
          }
        };
        Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;
        Container.prototype.getBounds = function() {
          if (!this._currentBounds) {
            if (this.children.length === 0) {
              return math.Rectangle.EMPTY;
            }
            var minX = Infinity;
            var minY = Infinity;
            var maxX = -Infinity;
            var maxY = -Infinity;
            var childBounds;
            var childMaxX;
            var childMaxY;
            var childVisible = false;
            for (var i = 0,
                j = this.children.length; i < j; ++i) {
              var child = this.children[i];
              if (!child.visible) {
                continue;
              }
              childVisible = true;
              childBounds = this.children[i].getBounds();
              minX = minX < childBounds.x ? minX : childBounds.x;
              minY = minY < childBounds.y ? minY : childBounds.y;
              childMaxX = childBounds.width + childBounds.x;
              childMaxY = childBounds.height + childBounds.y;
              maxX = maxX > childMaxX ? maxX : childMaxX;
              maxY = maxY > childMaxY ? maxY : childMaxY;
            }
            if (!childVisible) {
              return math.Rectangle.EMPTY;
            }
            var bounds = this._bounds;
            bounds.x = minX;
            bounds.y = minY;
            bounds.width = maxX - minX;
            bounds.height = maxY - minY;
            this._currentBounds = bounds;
          }
          return this._currentBounds;
        };
        Container.prototype.containerGetBounds = Container.prototype.getBounds;
        Container.prototype.getLocalBounds = function() {
          var matrixCache = this.worldTransform;
          this.worldTransform = math.Matrix.IDENTITY;
          for (var i = 0,
              j = this.children.length; i < j; ++i) {
            this.children[i].updateTransform();
          }
          this.worldTransform = matrixCache;
          this._currentBounds = null;
          return this.getBounds(math.Matrix.IDENTITY);
        };
        Container.prototype.renderWebGL = function(renderer) {
          if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
          }
          var i,
              j;
          if (this._mask || this._filters) {
            renderer.currentRenderer.flush();
            if (this._filters) {
              renderer.filterManager.pushFilter(this, this._filters);
            }
            if (this._mask) {
              renderer.maskManager.pushMask(this, this._mask);
            }
            renderer.currentRenderer.start();
            this._renderWebGL(renderer);
            for (i = 0, j = this.children.length; i < j; i++) {
              this.children[i].renderWebGL(renderer);
            }
            renderer.currentRenderer.flush();
            if (this._mask) {
              renderer.maskManager.popMask(this, this._mask);
            }
            if (this._filters) {
              renderer.filterManager.popFilter();
            }
            renderer.currentRenderer.start();
          } else {
            this._renderWebGL(renderer);
            for (i = 0, j = this.children.length; i < j; ++i) {
              this.children[i].renderWebGL(renderer);
            }
          }
        };
        Container.prototype._renderWebGL = function(renderer) {};
        Container.prototype._renderCanvas = function(renderer) {};
        Container.prototype.renderCanvas = function(renderer) {
          if (!this.visible || this.alpha <= 0 || !this.renderable) {
            return;
          }
          if (this._mask) {
            renderer.maskManager.pushMask(this._mask, renderer);
          }
          this._renderCanvas(renderer);
          for (var i = 0,
              j = this.children.length; i < j; ++i) {
            this.children[i].renderCanvas(renderer);
          }
          if (this._mask) {
            renderer.maskManager.popMask(renderer);
          }
        };
        Container.prototype.destroy = function(destroyChildren) {
          DisplayObject.prototype.destroy.call(this);
          if (destroyChildren) {
            for (var i = 0,
                j = this.children.length; i < j; ++i) {
              this.children[i].destroy(destroyChildren);
            }
          }
          this.removeChildren();
          this.children = null;
        };
      }, {
        "../math": 32,
        "../textures/RenderTexture": 70,
        "./DisplayObject": 24
      }],
      24: [function(require, module, exports) {
        var math = require('../math'),
            RenderTexture = require('../textures/RenderTexture'),
            EventEmitter = require('eventemitter3'),
            CONST = require('../const'),
            _tempMatrix = new math.Matrix();
        function DisplayObject() {
          EventEmitter.call(this);
          this.position = new math.Point();
          this.scale = new math.Point(1, 1);
          this.pivot = new math.Point(0, 0);
          this.rotation = 0;
          this.alpha = 1;
          this.visible = true;
          this.renderable = true;
          this.parent = null;
          this.worldAlpha = 1;
          this.worldTransform = new math.Matrix();
          this.filterArea = null;
          this._sr = 0;
          this._cr = 1;
          this._bounds = new math.Rectangle(0, 0, 1, 1);
          this._currentBounds = null;
          this._mask = null;
          this._cacheAsBitmap = false;
          this._cachedObject = null;
        }
        DisplayObject.prototype = Object.create(EventEmitter.prototype);
        DisplayObject.prototype.constructor = DisplayObject;
        module.exports = DisplayObject;
        Object.defineProperties(DisplayObject.prototype, {
          x: {
            get: function() {
              return this.position.x;
            },
            set: function(value) {
              this.position.x = value;
            }
          },
          y: {
            get: function() {
              return this.position.y;
            },
            set: function(value) {
              this.position.y = value;
            }
          },
          worldVisible: {get: function() {
              var item = this;
              do {
                if (!item.visible) {
                  return false;
                }
                item = item.parent;
              } while (item);
              return true;
            }},
          mask: {
            get: function() {
              return this._mask;
            },
            set: function(value) {
              if (this._mask) {
                this._mask.renderable = true;
              }
              this._mask = value;
              if (this._mask) {
                this._mask.renderable = false;
              }
            }
          },
          filters: {
            get: function() {
              return this._filters && this._filters.slice();
            },
            set: function(value) {
              this._filters = value && value.slice();
            }
          }
        });
        DisplayObject.prototype.updateTransform = function() {
          var pt = this.parent.worldTransform;
          var wt = this.worldTransform;
          var a,
              b,
              c,
              d,
              tx,
              ty;
          if (this.rotation % CONST.PI_2) {
            if (this.rotation !== this.rotationCache) {
              this.rotationCache = this.rotation;
              this._sr = Math.sin(this.rotation);
              this._cr = Math.cos(this.rotation);
            }
            a = this._cr * this.scale.x;
            b = this._sr * this.scale.x;
            c = -this._sr * this.scale.y;
            d = this._cr * this.scale.y;
            tx = this.position.x;
            ty = this.position.y;
            if (this.pivot.x || this.pivot.y) {
              tx -= this.pivot.x * a + this.pivot.y * c;
              ty -= this.pivot.x * b + this.pivot.y * d;
            }
            wt.a = a * pt.a + b * pt.c;
            wt.b = a * pt.b + b * pt.d;
            wt.c = c * pt.a + d * pt.c;
            wt.d = c * pt.b + d * pt.d;
            wt.tx = tx * pt.a + ty * pt.c + pt.tx;
            wt.ty = tx * pt.b + ty * pt.d + pt.ty;
          } else {
            a = this.scale.x;
            d = this.scale.y;
            tx = this.position.x - this.pivot.x * a;
            ty = this.position.y - this.pivot.y * d;
            wt.a = a * pt.a;
            wt.b = a * pt.b;
            wt.c = d * pt.c;
            wt.d = d * pt.d;
            wt.tx = tx * pt.a + ty * pt.c + pt.tx;
            wt.ty = tx * pt.b + ty * pt.d + pt.ty;
          }
          this.worldAlpha = this.alpha * this.parent.worldAlpha;
          this._currentBounds = null;
        };
        DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;
        DisplayObject.prototype.getBounds = function(matrix) {
          return math.Rectangle.EMPTY;
        };
        DisplayObject.prototype.getLocalBounds = function() {
          return this.getBounds(math.Matrix.IDENTITY);
        };
        DisplayObject.prototype.toGlobal = function(position) {
          this.displayObjectUpdateTransform();
          return this.worldTransform.apply(position);
        };
        DisplayObject.prototype.toLocal = function(position, from) {
          if (from) {
            position = from.toGlobal(position);
          }
          this.displayObjectUpdateTransform();
          return this.worldTransform.applyInverse(position);
        };
        DisplayObject.prototype.renderWebGL = function(renderer) {};
        DisplayObject.prototype.renderCanvas = function(renderer) {};
        DisplayObject.prototype.generateTexture = function(renderer, scaleMode, resolution) {
          var bounds = this.getLocalBounds();
          var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0, scaleMode, resolution);
          _tempMatrix.tx = -bounds.x;
          _tempMatrix.ty = -bounds.y;
          renderTexture.render(this, _tempMatrix);
          return renderTexture;
        };
        DisplayObject.prototype.destroy = function() {
          this.position = null;
          this.scale = null;
          this.pivot = null;
          this.parent = null;
          this._bounds = null;
          this._currentBounds = null;
          this._mask = null;
          this.worldTransform = null;
          this.filterArea = null;
        };
      }, {
        "../const": 22,
        "../math": 32,
        "../textures/RenderTexture": 70,
        "eventemitter3": 11
      }],
      25: [function(require, module, exports) {
        var Container = require('../display/Container'),
            Texture = require('../textures/Texture'),
            CanvasBuffer = require('../renderers/canvas/utils/CanvasBuffer'),
            CanvasGraphics = require('../renderers/canvas/utils/CanvasGraphics'),
            GraphicsData = require('./GraphicsData'),
            math = require('../math'),
            CONST = require('../const'),
            tempPoint = new math.Point();
        function Graphics() {
          Container.call(this);
          this.fillAlpha = 1;
          this.lineWidth = 0;
          this.lineColor = 0;
          this.graphicsData = [];
          this.tint = 0xFFFFFF;
          this._prevTint = 0xFFFFFF;
          this.blendMode = CONST.BLEND_MODES.NORMAL;
          this.currentPath = null;
          this._webGL = {};
          this.isMask = false;
          this.boundsPadding = 0;
          this._localBounds = new math.Rectangle(0, 0, 1, 1);
          this.dirty = true;
          this.glDirty = false;
          this.boundsDirty = true;
          this.cachedSpriteDirty = false;
        }
        Graphics.prototype = Object.create(Container.prototype);
        Graphics.prototype.constructor = Graphics;
        module.exports = Graphics;
        Object.defineProperties(Graphics.prototype, {});
        Graphics.prototype.clone = function() {
          var clone = new Graphics();
          clone.renderable = this.renderable;
          clone.fillAlpha = this.fillAlpha;
          clone.lineWidth = this.lineWidth;
          clone.lineColor = this.lineColor;
          clone.tint = this.tint;
          clone.blendMode = this.blendMode;
          clone.isMask = this.isMask;
          clone.boundsPadding = this.boundsPadding;
          clone.dirty = this.dirty;
          clone.glDirty = this.glDirty;
          clone.cachedSpriteDirty = this.cachedSpriteDirty;
          for (var i = 0; i < this.graphicsData.length; ++i) {
            clone.graphicsData.push(this.graphicsData[i].clone());
          }
          clone.currentPath = clone.graphicsData[clone.graphicsData.length - 1];
          clone.updateLocalBounds();
          return clone;
        };
        Graphics.prototype.lineStyle = function(lineWidth, color, alpha) {
          this.lineWidth = lineWidth || 0;
          this.lineColor = color || 0;
          this.lineAlpha = (alpha === undefined) ? 1 : alpha;
          if (this.currentPath) {
            if (this.currentPath.shape.points.length) {
              this.drawShape(new math.Polygon(this.currentPath.shape.points.slice(-2)));
            } else {
              this.currentPath.lineWidth = this.lineWidth;
              this.currentPath.lineColor = this.lineColor;
              this.currentPath.lineAlpha = this.lineAlpha;
            }
          }
          return this;
        };
        Graphics.prototype.moveTo = function(x, y) {
          this.drawShape(new math.Polygon([x, y]));
          return this;
        };
        Graphics.prototype.lineTo = function(x, y) {
          this.currentPath.shape.points.push(x, y);
          this.dirty = true;
          return this;
        };
        Graphics.prototype.quadraticCurveTo = function(cpX, cpY, toX, toY) {
          if (this.currentPath) {
            if (this.currentPath.shape.points.length === 0) {
              this.currentPath.shape.points = [0, 0];
            }
          } else {
            this.moveTo(0, 0);
          }
          var xa,
              ya,
              n = 20,
              points = this.currentPath.shape.points;
          if (points.length === 0) {
            this.moveTo(0, 0);
          }
          var fromX = points[points.length - 2];
          var fromY = points[points.length - 1];
          var j = 0;
          for (var i = 1; i <= n; ++i) {
            j = i / n;
            xa = fromX + ((cpX - fromX) * j);
            ya = fromY + ((cpY - fromY) * j);
            points.push(xa + (((cpX + ((toX - cpX) * j)) - xa) * j), ya + (((cpY + ((toY - cpY) * j)) - ya) * j));
          }
          this.dirty = this.boundsDirty = true;
          return this;
        };
        Graphics.prototype.bezierCurveTo = function(cpX, cpY, cpX2, cpY2, toX, toY) {
          if (this.currentPath) {
            if (this.currentPath.shape.points.length === 0) {
              this.currentPath.shape.points = [0, 0];
            }
          } else {
            this.moveTo(0, 0);
          }
          var n = 20,
              dt,
              dt2,
              dt3,
              t2,
              t3,
              points = this.currentPath.shape.points;
          var fromX = points[points.length - 2];
          var fromY = points[points.length - 1];
          var j = 0;
          for (var i = 1; i <= n; ++i) {
            j = i / n;
            dt = (1 - j);
            dt2 = dt * dt;
            dt3 = dt2 * dt;
            t2 = j * j;
            t3 = t2 * j;
            points.push(dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX, dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
          }
          this.dirty = this.boundsDirty = true;
          return this;
        };
        Graphics.prototype.arcTo = function(x1, y1, x2, y2, radius) {
          if (this.currentPath) {
            if (this.currentPath.shape.points.length === 0) {
              this.currentPath.shape.points.push(x1, y1);
            }
          } else {
            this.moveTo(x1, y1);
          }
          var points = this.currentPath.shape.points,
              fromX = points[points.length - 2],
              fromY = points[points.length - 1],
              a1 = fromY - y1,
              b1 = fromX - x1,
              a2 = y2 - y1,
              b2 = x2 - x1,
              mm = Math.abs(a1 * b2 - b1 * a2);
          if (mm < 1.0e-8 || radius === 0) {
            if (points[points.length - 2] !== x1 || points[points.length - 1] !== y1) {
              points.push(x1, y1);
            }
          } else {
            var dd = a1 * a1 + b1 * b1,
                cc = a2 * a2 + b2 * b2,
                tt = a1 * a2 + b1 * b2,
                k1 = radius * Math.sqrt(dd) / mm,
                k2 = radius * Math.sqrt(cc) / mm,
                j1 = k1 * tt / dd,
                j2 = k2 * tt / cc,
                cx = k1 * b2 + k2 * b1,
                cy = k1 * a2 + k2 * a1,
                px = b1 * (k2 + j1),
                py = a1 * (k2 + j1),
                qx = b2 * (k1 + j2),
                qy = a2 * (k1 + j2),
                startAngle = Math.atan2(py - cy, px - cx),
                endAngle = Math.atan2(qy - cy, qx - cx);
            this.arc(cx + x1, cy + y1, radius, startAngle, endAngle, b1 * a2 > b2 * a1);
          }
          this.dirty = this.boundsDirty = true;
          return this;
        };
        Graphics.prototype.arc = function(cx, cy, radius, startAngle, endAngle, anticlockwise) {
          anticlockwise = anticlockwise || false;
          if (startAngle === endAngle) {
            return this;
          }
          if (!anticlockwise && endAngle <= startAngle) {
            endAngle += Math.PI * 2;
          } else if (anticlockwise && startAngle <= endAngle) {
            startAngle += Math.PI * 2;
          }
          var sweep = anticlockwise ? (startAngle - endAngle) * -1 : (endAngle - startAngle);
          var segs = Math.ceil(Math.abs(sweep) / (Math.PI * 2)) * 40;
          if (sweep === 0) {
            return this;
          }
          var startX = cx + Math.cos(startAngle) * radius;
          var startY = cy + Math.sin(startAngle) * radius;
          if (this.currentPath) {
            if (anticlockwise && this.filling) {
              this.currentPath.shape.points.push(cx, cy);
            } else {
              this.currentPath.shape.points.push(startX, startY);
            }
          } else {
            if (anticlockwise && this.filling) {
              this.moveTo(cx, cy);
            } else {
              this.moveTo(startX, startY);
            }
          }
          var points = this.currentPath.shape.points;
          var theta = sweep / (segs * 2);
          var theta2 = theta * 2;
          var cTheta = Math.cos(theta);
          var sTheta = Math.sin(theta);
          var segMinus = segs - 1;
          var remainder = (segMinus % 1) / segMinus;
          for (var i = 0; i <= segMinus; i++) {
            var real = i + remainder * i;
            var angle = ((theta) + startAngle + (theta2 * real));
            var c = Math.cos(angle);
            var s = -Math.sin(angle);
            points.push(((cTheta * c) + (sTheta * s)) * radius + cx, ((cTheta * -s) + (sTheta * c)) * radius + cy);
          }
          this.dirty = this.boundsDirty = true;
          return this;
        };
        Graphics.prototype.beginFill = function(color, alpha) {
          this.filling = true;
          this.fillColor = color || 0;
          this.fillAlpha = (alpha === undefined) ? 1 : alpha;
          if (this.currentPath) {
            if (this.currentPath.shape.points.length <= 2) {
              this.currentPath.fill = this.filling;
              this.currentPath.fillColor = this.fillColor;
              this.currentPath.fillAlpha = this.fillAlpha;
            }
          }
          return this;
        };
        Graphics.prototype.endFill = function() {
          this.filling = false;
          this.fillColor = null;
          this.fillAlpha = 1;
          return this;
        };
        Graphics.prototype.drawRect = function(x, y, width, height) {
          this.drawShape(new math.Rectangle(x, y, width, height));
          return this;
        };
        Graphics.prototype.drawRoundedRect = function(x, y, width, height, radius) {
          this.drawShape(new math.RoundedRectangle(x, y, width, height, radius));
          return this;
        };
        Graphics.prototype.drawCircle = function(x, y, radius) {
          this.drawShape(new math.Circle(x, y, radius));
          return this;
        };
        Graphics.prototype.drawEllipse = function(x, y, width, height) {
          this.drawShape(new math.Ellipse(x, y, width, height));
          return this;
        };
        Graphics.prototype.drawPolygon = function(path) {
          var points = path;
          if (!Array.isArray(points)) {
            points = new Array(arguments.length);
            for (var i = 0; i < points.length; ++i) {
              points[i] = arguments[i];
            }
          }
          this.drawShape(new math.Polygon(points));
          return this;
        };
        Graphics.prototype.clear = function() {
          this.lineWidth = 0;
          this.filling = false;
          this.dirty = true;
          this.clearDirty = true;
          this.graphicsData = [];
          return this;
        };
        Graphics.prototype.generateTexture = function(renderer, resolution, scaleMode) {
          resolution = resolution || 1;
          var bounds = this.getLocalBounds();
          var canvasBuffer = new CanvasBuffer(bounds.width * resolution, bounds.height * resolution);
          var texture = Texture.fromCanvas(canvasBuffer.canvas, scaleMode);
          texture.baseTexture.resolution = resolution;
          canvasBuffer.context.scale(resolution, resolution);
          canvasBuffer.context.translate(-bounds.x, -bounds.y);
          CanvasGraphics.renderGraphics(this, canvasBuffer.context);
          return texture;
        };
        Graphics.prototype._renderWebGL = function(renderer) {
          if (this.glDirty) {
            this.dirty = true;
            this.glDirty = false;
          }
          renderer.setObjectRenderer(renderer.plugins.graphics);
          renderer.plugins.graphics.render(this);
        };
        Graphics.prototype._renderCanvas = function(renderer) {
          if (this.isMask === true) {
            return;
          }
          if (this._prevTint !== this.tint) {
            this.dirty = true;
            this._prevTint = this.tint;
          }
          var context = renderer.context;
          var transform = this.worldTransform;
          if (this.blendMode !== renderer.currentBlendMode) {
            renderer.currentBlendMode = this.blendMode;
            context.globalCompositeOperation = renderer.blendModes[renderer.currentBlendMode];
          }
          var resolution = renderer.resolution;
          context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution);
          CanvasGraphics.renderGraphics(this, context);
        };
        Graphics.prototype.getBounds = function(matrix) {
          if (!this._currentBounds) {
            if (!this.renderable) {
              return math.Rectangle.EMPTY;
            }
            if (this.boundsDirty) {
              this.updateLocalBounds();
              this.glDirty = true;
              this.cachedSpriteDirty = true;
              this.boundsDirty = false;
            }
            var bounds = this._localBounds;
            var w0 = bounds.x;
            var w1 = bounds.width + bounds.x;
            var h0 = bounds.y;
            var h1 = bounds.height + bounds.y;
            var worldTransform = matrix || this.worldTransform;
            var a = worldTransform.a;
            var b = worldTransform.b;
            var c = worldTransform.c;
            var d = worldTransform.d;
            var tx = worldTransform.tx;
            var ty = worldTransform.ty;
            var x1 = a * w1 + c * h1 + tx;
            var y1 = d * h1 + b * w1 + ty;
            var x2 = a * w0 + c * h1 + tx;
            var y2 = d * h1 + b * w0 + ty;
            var x3 = a * w0 + c * h0 + tx;
            var y3 = d * h0 + b * w0 + ty;
            var x4 = a * w1 + c * h0 + tx;
            var y4 = d * h0 + b * w1 + ty;
            var maxX = x1;
            var maxY = y1;
            var minX = x1;
            var minY = y1;
            minX = x2 < minX ? x2 : minX;
            minX = x3 < minX ? x3 : minX;
            minX = x4 < minX ? x4 : minX;
            minY = y2 < minY ? y2 : minY;
            minY = y3 < minY ? y3 : minY;
            minY = y4 < minY ? y4 : minY;
            maxX = x2 > maxX ? x2 : maxX;
            maxX = x3 > maxX ? x3 : maxX;
            maxX = x4 > maxX ? x4 : maxX;
            maxY = y2 > maxY ? y2 : maxY;
            maxY = y3 > maxY ? y3 : maxY;
            maxY = y4 > maxY ? y4 : maxY;
            this._bounds.x = minX;
            this._bounds.width = maxX - minX;
            this._bounds.y = minY;
            this._bounds.height = maxY - minY;
            this._currentBounds = this._bounds;
          }
          return this._currentBounds;
        };
        Graphics.prototype.containsPoint = function(point) {
          this.worldTransform.applyInverse(point, tempPoint);
          var graphicsData = this.graphicsData;
          for (var i = 0; i < graphicsData.length; i++) {
            var data = graphicsData[i];
            if (!data.fill) {
              continue;
            }
            if (data.shape) {
              if (data.shape.contains(tempPoint.x, tempPoint.y)) {
                return true;
              }
            }
          }
          return false;
        };
        Graphics.prototype.updateLocalBounds = function() {
          var minX = Infinity;
          var maxX = -Infinity;
          var minY = Infinity;
          var maxY = -Infinity;
          if (this.graphicsData.length) {
            var shape,
                points,
                x,
                y,
                w,
                h;
            for (var i = 0; i < this.graphicsData.length; i++) {
              var data = this.graphicsData[i];
              var type = data.type;
              var lineWidth = data.lineWidth;
              shape = data.shape;
              if (type === CONST.SHAPES.RECT || type === CONST.SHAPES.RREC) {
                x = shape.x - lineWidth / 2;
                y = shape.y - lineWidth / 2;
                w = shape.width + lineWidth;
                h = shape.height + lineWidth;
                minX = x < minX ? x : minX;
                maxX = x + w > maxX ? x + w : maxX;
                minY = y < minY ? y : minY;
                maxY = y + h > maxY ? y + h : maxY;
              } else if (type === CONST.SHAPES.CIRC) {
                x = shape.x;
                y = shape.y;
                w = shape.radius + lineWidth / 2;
                h = shape.radius + lineWidth / 2;
                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;
                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
              } else if (type === CONST.SHAPES.ELIP) {
                x = shape.x;
                y = shape.y;
                w = shape.width + lineWidth / 2;
                h = shape.height + lineWidth / 2;
                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;
                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
              } else {
                points = shape.points;
                for (var j = 0; j < points.length; j += 2) {
                  x = points[j];
                  y = points[j + 1];
                  minX = x - lineWidth < minX ? x - lineWidth : minX;
                  maxX = x + lineWidth > maxX ? x + lineWidth : maxX;
                  minY = y - lineWidth < minY ? y - lineWidth : minY;
                  maxY = y + lineWidth > maxY ? y + lineWidth : maxY;
                }
              }
            }
          } else {
            minX = 0;
            maxX = 0;
            minY = 0;
            maxY = 0;
          }
          var padding = this.boundsPadding;
          this._localBounds.x = minX - padding;
          this._localBounds.width = (maxX - minX) + padding * 2;
          this._localBounds.y = minY - padding;
          this._localBounds.height = (maxY - minY) + padding * 2;
        };
        Graphics.prototype.drawShape = function(shape) {
          if (this.currentPath) {
            if (this.currentPath.shape.points.length <= 2) {
              this.graphicsData.pop();
            }
          }
          this.currentPath = null;
          var data = new GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, shape);
          this.graphicsData.push(data);
          if (data.type === CONST.SHAPES.POLY) {
            data.shape.closed = this.filling;
            this.currentPath = data;
          }
          this.dirty = this.boundsDirty = true;
          return data;
        };
        Graphics.prototype.destroy = function() {
          Container.prototype.destroy.apply(this, arguments);
          for (var i = 0; i < this.graphicsData.length; ++i) {
            this.graphicsData[i].destroy();
          }
          for (var id in this._webgl) {
            for (var j = 0; j < this._webgl[id].data.length; ++j) {
              this._webgl[id].data[j].destroy();
            }
          }
          this.graphicsData = null;
          this.currentPath = null;
          this._webgl = null;
          this._localBounds = null;
        };
      }, {
        "../const": 22,
        "../display/Container": 23,
        "../math": 32,
        "../renderers/canvas/utils/CanvasBuffer": 44,
        "../renderers/canvas/utils/CanvasGraphics": 45,
        "../textures/Texture": 71,
        "./GraphicsData": 26
      }],
      26: [function(require, module, exports) {
        function GraphicsData(lineWidth, lineColor, lineAlpha, fillColor, fillAlpha, fill, shape) {
          this.lineWidth = lineWidth;
          this.lineColor = lineColor;
          this.lineAlpha = lineAlpha;
          this._lineTint = lineColor;
          this.fillColor = fillColor;
          this.fillAlpha = fillAlpha;
          this._fillTint = fillColor;
          this.fill = fill;
          this.shape = shape;
          this.type = shape.type;
        }
        GraphicsData.prototype.constructor = GraphicsData;
        module.exports = GraphicsData;
        GraphicsData.prototype.clone = function() {
          return new GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.fill, this.shape);
        };
        GraphicsData.prototype.destroy = function() {
          this.shape = null;
        };
      }, {}],
      27: [function(require, module, exports) {
        var utils = require('../../utils'),
            math = require('../../math'),
            CONST = require('../../const'),
            ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
            WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
            WebGLGraphicsData = require('./WebGLGraphicsData'),
            earcut = require('earcut');
        function GraphicsRenderer(renderer) {
          ObjectRenderer.call(this, renderer);
          this.graphicsDataPool = [];
          this.primitiveShader = null;
          this.complexPrimitiveShader = null;
        }
        GraphicsRenderer.prototype = Object.create(ObjectRenderer.prototype);
        GraphicsRenderer.prototype.constructor = GraphicsRenderer;
        module.exports = GraphicsRenderer;
        WebGLRenderer.registerPlugin('graphics', GraphicsRenderer);
        GraphicsRenderer.prototype.onContextChange = function() {};
        GraphicsRenderer.prototype.destroy = function() {
          ObjectRenderer.prototype.destroy.call(this);
          for (var i = 0; i < this.graphicsDataPool.length; ++i) {
            this.graphicsDataPool[i].destroy();
          }
          this.graphicsDataPool = null;
        };
        GraphicsRenderer.prototype.render = function(graphics) {
          var renderer = this.renderer;
          var gl = renderer.gl;
          var shader = renderer.shaderManager.plugins.primitiveShader,
              webGLData;
          if (graphics.dirty) {
            this.updateGraphics(graphics, gl);
          }
          var webGL = graphics._webGL[gl.id];
          renderer.blendModeManager.setBlendMode(graphics.blendMode);
          for (var i = 0; i < webGL.data.length; i++) {
            if (webGL.data[i].mode === 1) {
              webGLData = webGL.data[i];
              renderer.stencilManager.pushStencil(graphics, webGLData, renderer);
              gl.uniform1f(renderer.shaderManager.complexPrimitiveShader.uniforms.alpha._location, graphics.worldAlpha * webGLData.alpha);
              gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
              renderer.stencilManager.popStencil(graphics, webGLData, renderer);
            } else {
              webGLData = webGL.data[i];
              shader = renderer.shaderManager.primitiveShader;
              renderer.shaderManager.setShader(shader);
              gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));
              gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, renderer.currentRenderTarget.projectionMatrix.toArray(true));
              gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));
              gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);
              gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
              gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
              gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
              gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
            }
          }
        };
        GraphicsRenderer.prototype.updateGraphics = function(graphics) {
          var gl = this.renderer.gl;
          var webGL = graphics._webGL[gl.id];
          if (!webGL) {
            webGL = graphics._webGL[gl.id] = {
              lastIndex: 0,
              data: [],
              gl: gl
            };
          }
          graphics.dirty = false;
          var i;
          if (graphics.clearDirty) {
            graphics.clearDirty = false;
            for (i = 0; i < webGL.data.length; i++) {
              var graphicsData = webGL.data[i];
              graphicsData.reset();
              this.graphicsDataPool.push(graphicsData);
            }
            webGL.data = [];
            webGL.lastIndex = 0;
          }
          var webGLData;
          for (i = webGL.lastIndex; i < graphics.graphicsData.length; i++) {
            var data = graphics.graphicsData[i];
            if (data.type === CONST.SHAPES.POLY) {
              data.points = data.shape.points.slice();
              if (data.shape.closed) {
                if (data.points[0] !== data.points[data.points.length - 2] || data.points[1] !== data.points[data.points.length - 1]) {
                  data.points.push(data.points[0], data.points[1]);
                }
              }
              if (data.fill) {
                if (data.points.length >= 6) {
                  if (data.points.length < 6 * 2) {
                    webGLData = this.switchMode(webGL, 0);
                    var canDrawUsingSimple = this.buildPoly(data, webGLData);
                    if (!canDrawUsingSimple) {
                      webGLData = this.switchMode(webGL, 1);
                      this.buildComplexPoly(data, webGLData);
                    }
                  } else {
                    webGLData = this.switchMode(webGL, 1);
                    this.buildComplexPoly(data, webGLData);
                  }
                }
              }
              if (data.lineWidth > 0) {
                webGLData = this.switchMode(webGL, 0);
                this.buildLine(data, webGLData);
              }
            } else {
              webGLData = this.switchMode(webGL, 0);
              if (data.type === CONST.SHAPES.RECT) {
                this.buildRectangle(data, webGLData);
              } else if (data.type === CONST.SHAPES.CIRC || data.type === CONST.SHAPES.ELIP) {
                this.buildCircle(data, webGLData);
              } else if (data.type === CONST.SHAPES.RREC) {
                this.buildRoundedRectangle(data, webGLData);
              }
            }
            webGL.lastIndex++;
          }
          for (i = 0; i < webGL.data.length; i++) {
            webGLData = webGL.data[i];
            if (webGLData.dirty) {
              webGLData.upload();
            }
          }
        };
        GraphicsRenderer.prototype.switchMode = function(webGL, type) {
          var webGLData;
          if (!webGL.data.length) {
            webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(webGL.gl);
            webGLData.mode = type;
            webGL.data.push(webGLData);
          } else {
            webGLData = webGL.data[webGL.data.length - 1];
            if ((webGLData.points.length > 320000) || webGLData.mode !== type || type === 1) {
              webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(webGL.gl);
              webGLData.mode = type;
              webGL.data.push(webGLData);
            }
          }
          webGLData.dirty = true;
          return webGLData;
        };
        GraphicsRenderer.prototype.buildRectangle = function(graphicsData, webGLData) {
          var rectData = graphicsData.shape;
          var x = rectData.x;
          var y = rectData.y;
          var width = rectData.width;
          var height = rectData.height;
          if (graphicsData.fill) {
            var color = utils.hex2rgb(graphicsData.fillColor);
            var alpha = graphicsData.fillAlpha;
            var r = color[0] * alpha;
            var g = color[1] * alpha;
            var b = color[2] * alpha;
            var verts = webGLData.points;
            var indices = webGLData.indices;
            var vertPos = verts.length / 6;
            verts.push(x, y);
            verts.push(r, g, b, alpha);
            verts.push(x + width, y);
            verts.push(r, g, b, alpha);
            verts.push(x, y + height);
            verts.push(r, g, b, alpha);
            verts.push(x + width, y + height);
            verts.push(r, g, b, alpha);
            indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3);
          }
          if (graphicsData.lineWidth) {
            var tempPoints = graphicsData.points;
            graphicsData.points = [x, y, x + width, y, x + width, y + height, x, y + height, x, y];
            this.buildLine(graphicsData, webGLData);
            graphicsData.points = tempPoints;
          }
        };
        GraphicsRenderer.prototype.buildRoundedRectangle = function(graphicsData, webGLData) {
          var rrectData = graphicsData.shape;
          var x = rrectData.x;
          var y = rrectData.y;
          var width = rrectData.width;
          var height = rrectData.height;
          var radius = rrectData.radius;
          var recPoints = [];
          recPoints.push(x, y + radius);
          this.quadraticBezierCurve(x, y + height - radius, x, y + height, x + radius, y + height, recPoints);
          this.quadraticBezierCurve(x + width - radius, y + height, x + width, y + height, x + width, y + height - radius, recPoints);
          this.quadraticBezierCurve(x + width, y + radius, x + width, y, x + width - radius, y, recPoints);
          this.quadraticBezierCurve(x + radius, y, x, y, x, y + radius + 0.0000000001, recPoints);
          if (graphicsData.fill) {
            var color = utils.hex2rgb(graphicsData.fillColor);
            var alpha = graphicsData.fillAlpha;
            var r = color[0] * alpha;
            var g = color[1] * alpha;
            var b = color[2] * alpha;
            var verts = webGLData.points;
            var indices = webGLData.indices;
            var vecPos = verts.length / 6;
            var triangles = earcut(recPoints, null, 2);
            var i = 0;
            for (i = 0; i < triangles.length; i += 3) {
              indices.push(triangles[i] + vecPos);
              indices.push(triangles[i] + vecPos);
              indices.push(triangles[i + 1] + vecPos);
              indices.push(triangles[i + 2] + vecPos);
              indices.push(triangles[i + 2] + vecPos);
            }
            for (i = 0; i < recPoints.length; i++) {
              verts.push(recPoints[i], recPoints[++i], r, g, b, alpha);
            }
          }
          if (graphicsData.lineWidth) {
            var tempPoints = graphicsData.points;
            graphicsData.points = recPoints;
            this.buildLine(graphicsData, webGLData);
            graphicsData.points = tempPoints;
          }
        };
        GraphicsRenderer.prototype.quadraticBezierCurve = function(fromX, fromY, cpX, cpY, toX, toY, out) {
          var xa,
              ya,
              xb,
              yb,
              x,
              y,
              n = 20,
              points = out || [];
          function getPt(n1, n2, perc) {
            var diff = n2 - n1;
            return n1 + (diff * perc);
          }
          var j = 0;
          for (var i = 0; i <= n; i++) {
            j = i / n;
            xa = getPt(fromX, cpX, j);
            ya = getPt(fromY, cpY, j);
            xb = getPt(cpX, toX, j);
            yb = getPt(cpY, toY, j);
            x = getPt(xa, xb, j);
            y = getPt(ya, yb, j);
            points.push(x, y);
          }
          return points;
        };
        GraphicsRenderer.prototype.buildCircle = function(graphicsData, webGLData) {
          var circleData = graphicsData.shape;
          var x = circleData.x;
          var y = circleData.y;
          var width;
          var height;
          if (graphicsData.type === CONST.SHAPES.CIRC) {
            width = circleData.radius;
            height = circleData.radius;
          } else {
            width = circleData.width;
            height = circleData.height;
          }
          var totalSegs = 40;
          var seg = (Math.PI * 2) / totalSegs;
          var i = 0;
          if (graphicsData.fill) {
            var color = utils.hex2rgb(graphicsData.fillColor);
            var alpha = graphicsData.fillAlpha;
            var r = color[0] * alpha;
            var g = color[1] * alpha;
            var b = color[2] * alpha;
            var verts = webGLData.points;
            var indices = webGLData.indices;
            var vecPos = verts.length / 6;
            indices.push(vecPos);
            for (i = 0; i < totalSegs + 1; i++) {
              verts.push(x, y, r, g, b, alpha);
              verts.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height, r, g, b, alpha);
              indices.push(vecPos++, vecPos++);
            }
            indices.push(vecPos - 1);
          }
          if (graphicsData.lineWidth) {
            var tempPoints = graphicsData.points;
            graphicsData.points = [];
            for (i = 0; i < totalSegs + 1; i++) {
              graphicsData.points.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height);
            }
            this.buildLine(graphicsData, webGLData);
            graphicsData.points = tempPoints;
          }
        };
        GraphicsRenderer.prototype.buildLine = function(graphicsData, webGLData) {
          var i = 0;
          var points = graphicsData.points;
          if (points.length === 0) {
            return;
          }
          if (graphicsData.lineWidth % 2) {
            for (i = 0; i < points.length; i++) {
              points[i] += 0.5;
            }
          }
          var firstPoint = new math.Point(points[0], points[1]);
          var lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);
          if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y) {
            points = points.slice();
            points.pop();
            points.pop();
            lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);
            var midPointX = lastPoint.x + (firstPoint.x - lastPoint.x) * 0.5;
            var midPointY = lastPoint.y + (firstPoint.y - lastPoint.y) * 0.5;
            points.unshift(midPointX, midPointY);
            points.push(midPointX, midPointY);
          }
          var verts = webGLData.points;
          var indices = webGLData.indices;
          var length = points.length / 2;
          var indexCount = points.length;
          var indexStart = verts.length / 6;
          var width = graphicsData.lineWidth / 2;
          var color = utils.hex2rgb(graphicsData.lineColor);
          var alpha = graphicsData.lineAlpha;
          var r = color[0] * alpha;
          var g = color[1] * alpha;
          var b = color[2] * alpha;
          var px,
              py,
              p1x,
              p1y,
              p2x,
              p2y,
              p3x,
              p3y;
          var perpx,
              perpy,
              perp2x,
              perp2y,
              perp3x,
              perp3y;
          var a1,
              b1,
              c1,
              a2,
              b2,
              c2;
          var denom,
              pdist,
              dist;
          p1x = points[0];
          p1y = points[1];
          p2x = points[2];
          p2y = points[3];
          perpx = -(p1y - p2y);
          perpy = p1x - p2x;
          dist = Math.sqrt(perpx * perpx + perpy * perpy);
          perpx /= dist;
          perpy /= dist;
          perpx *= width;
          perpy *= width;
          verts.push(p1x - perpx, p1y - perpy, r, g, b, alpha);
          verts.push(p1x + perpx, p1y + perpy, r, g, b, alpha);
          for (i = 1; i < length - 1; i++) {
            p1x = points[(i - 1) * 2];
            p1y = points[(i - 1) * 2 + 1];
            p2x = points[(i) * 2];
            p2y = points[(i) * 2 + 1];
            p3x = points[(i + 1) * 2];
            p3y = points[(i + 1) * 2 + 1];
            perpx = -(p1y - p2y);
            perpy = p1x - p2x;
            dist = Math.sqrt(perpx * perpx + perpy * perpy);
            perpx /= dist;
            perpy /= dist;
            perpx *= width;
            perpy *= width;
            perp2x = -(p2y - p3y);
            perp2y = p2x - p3x;
            dist = Math.sqrt(perp2x * perp2x + perp2y * perp2y);
            perp2x /= dist;
            perp2y /= dist;
            perp2x *= width;
            perp2y *= width;
            a1 = (-perpy + p1y) - (-perpy + p2y);
            b1 = (-perpx + p2x) - (-perpx + p1x);
            c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
            a2 = (-perp2y + p3y) - (-perp2y + p2y);
            b2 = (-perp2x + p2x) - (-perp2x + p3x);
            c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);
            denom = a1 * b2 - a2 * b1;
            if (Math.abs(denom) < 0.1) {
              denom += 10.1;
              verts.push(p2x - perpx, p2y - perpy, r, g, b, alpha);
              verts.push(p2x + perpx, p2y + perpy, r, g, b, alpha);
              continue;
            }
            px = (b1 * c2 - b2 * c1) / denom;
            py = (a2 * c1 - a1 * c2) / denom;
            pdist = (px - p2x) * (px - p2x) + (py - p2y) + (py - p2y);
            if (pdist > 140 * 140) {
              perp3x = perpx - perp2x;
              perp3y = perpy - perp2y;
              dist = Math.sqrt(perp3x * perp3x + perp3y * perp3y);
              perp3x /= dist;
              perp3y /= dist;
              perp3x *= width;
              perp3y *= width;
              verts.push(p2x - perp3x, p2y - perp3y);
              verts.push(r, g, b, alpha);
              verts.push(p2x + perp3x, p2y + perp3y);
              verts.push(r, g, b, alpha);
              verts.push(p2x - perp3x, p2y - perp3y);
              verts.push(r, g, b, alpha);
              indexCount++;
            } else {
              verts.push(px, py);
              verts.push(r, g, b, alpha);
              verts.push(p2x - (px - p2x), p2y - (py - p2y));
              verts.push(r, g, b, alpha);
            }
          }
          p1x = points[(length - 2) * 2];
          p1y = points[(length - 2) * 2 + 1];
          p2x = points[(length - 1) * 2];
          p2y = points[(length - 1) * 2 + 1];
          perpx = -(p1y - p2y);
          perpy = p1x - p2x;
          dist = Math.sqrt(perpx * perpx + perpy * perpy);
          perpx /= dist;
          perpy /= dist;
          perpx *= width;
          perpy *= width;
          verts.push(p2x - perpx, p2y - perpy);
          verts.push(r, g, b, alpha);
          verts.push(p2x + perpx, p2y + perpy);
          verts.push(r, g, b, alpha);
          indices.push(indexStart);
          for (i = 0; i < indexCount; i++) {
            indices.push(indexStart++);
          }
          indices.push(indexStart - 1);
        };
        GraphicsRenderer.prototype.buildComplexPoly = function(graphicsData, webGLData) {
          var points = graphicsData.points.slice();
          if (points.length < 6) {
            return;
          }
          var indices = webGLData.indices;
          webGLData.points = points;
          webGLData.alpha = graphicsData.fillAlpha;
          webGLData.color = utils.hex2rgb(graphicsData.fillColor);
          var minX = Infinity;
          var maxX = -Infinity;
          var minY = Infinity;
          var maxY = -Infinity;
          var x,
              y;
          for (var i = 0; i < points.length; i += 2) {
            x = points[i];
            y = points[i + 1];
            minX = x < minX ? x : minX;
            maxX = x > maxX ? x : maxX;
            minY = y < minY ? y : minY;
            maxY = y > maxY ? y : maxY;
          }
          points.push(minX, minY, maxX, minY, maxX, maxY, minX, maxY);
          var length = points.length / 2;
          for (i = 0; i < length; i++) {
            indices.push(i);
          }
        };
        GraphicsRenderer.prototype.buildPoly = function(graphicsData, webGLData) {
          var points = graphicsData.points;
          if (points.length < 6) {
            return;
          }
          var verts = webGLData.points;
          var indices = webGLData.indices;
          var length = points.length / 2;
          var color = utils.hex2rgb(graphicsData.fillColor);
          var alpha = graphicsData.fillAlpha;
          var r = color[0] * alpha;
          var g = color[1] * alpha;
          var b = color[2] * alpha;
          var triangles = earcut(points, null, 2);
          if (!triangles) {
            return false;
          }
          var vertPos = verts.length / 6;
          var i = 0;
          for (i = 0; i < triangles.length; i += 3) {
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i + 1] + vertPos);
            indices.push(triangles[i + 2] + vertPos);
            indices.push(triangles[i + 2] + vertPos);
          }
          for (i = 0; i < length; i++) {
            verts.push(points[i * 2], points[i * 2 + 1], r, g, b, alpha);
          }
          return true;
        };
      }, {
        "../../const": 22,
        "../../math": 32,
        "../../renderers/webgl/WebGLRenderer": 48,
        "../../renderers/webgl/utils/ObjectRenderer": 62,
        "../../utils": 76,
        "./WebGLGraphicsData": 28,
        "earcut": 10
      }],
      28: [function(require, module, exports) {
        function WebGLGraphicsData(gl) {
          this.gl = gl;
          this.color = [0, 0, 0];
          this.points = [];
          this.indices = [];
          this.buffer = gl.createBuffer();
          this.indexBuffer = gl.createBuffer();
          this.mode = 1;
          this.alpha = 1;
          this.dirty = true;
          this.glPoints = null;
          this.glIndices = null;
        }
        WebGLGraphicsData.prototype.constructor = WebGLGraphicsData;
        module.exports = WebGLGraphicsData;
        WebGLGraphicsData.prototype.reset = function() {
          this.points.length = 0;
          this.indices.length = 0;
        };
        WebGLGraphicsData.prototype.upload = function() {
          var gl = this.gl;
          this.glPoints = new Float32Array(this.points);
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
          gl.bufferData(gl.ARRAY_BUFFER, this.glPoints, gl.STATIC_DRAW);
          this.glIndices = new Uint16Array(this.indices);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.glIndices, gl.STATIC_DRAW);
          this.dirty = false;
        };
        WebGLGraphicsData.prototype.destroy = function() {
          this.gl = null;
          this.color = null;
          this.points = null;
          this.indices = null;
          this.gl.deleteBuffer(this.buffer);
          this.gl.deleteBuffer(this.indexBuffer);
          this.buffer = null;
          this.indexBuffer = null;
          this.glPoints = null;
          this.glIndices = null;
        };
      }, {}],
      29: [function(require, module, exports) {
        var core = module.exports = Object.assign(require('./const'), require('./math'), {
          utils: require('./utils'),
          math: require('./math'),
          ticker: require('./ticker'),
          DisplayObject: require('./display/DisplayObject'),
          Container: require('./display/Container'),
          Sprite: require('./sprites/Sprite'),
          ParticleContainer: require('./particles/ParticleContainer'),
          SpriteRenderer: require('./sprites/webgl/SpriteRenderer'),
          ParticleRenderer: require('./particles/webgl/ParticleRenderer'),
          Text: require('./text/Text'),
          Graphics: require('./graphics/Graphics'),
          GraphicsData: require('./graphics/GraphicsData'),
          GraphicsRenderer: require('./graphics/webgl/GraphicsRenderer'),
          Texture: require('./textures/Texture'),
          BaseTexture: require('./textures/BaseTexture'),
          RenderTexture: require('./textures/RenderTexture'),
          VideoBaseTexture: require('./textures/VideoBaseTexture'),
          TextureUvs: require('./textures/TextureUvs'),
          CanvasRenderer: require('./renderers/canvas/CanvasRenderer'),
          CanvasGraphics: require('./renderers/canvas/utils/CanvasGraphics'),
          CanvasBuffer: require('./renderers/canvas/utils/CanvasBuffer'),
          WebGLRenderer: require('./renderers/webgl/WebGLRenderer'),
          ShaderManager: require('./renderers/webgl/managers/ShaderManager'),
          Shader: require('./renderers/webgl/shaders/Shader'),
          ObjectRenderer: require('./renderers/webgl/utils/ObjectRenderer'),
          RenderTarget: require('./renderers/webgl/utils/RenderTarget'),
          AbstractFilter: require('./renderers/webgl/filters/AbstractFilter'),
          autoDetectRenderer: function(width, height, options, noWebGL) {
            width = width || 800;
            height = height || 600;
            if (!noWebGL && core.utils.isWebGLSupported()) {
              return new core.WebGLRenderer(width, height, options);
            }
            return new core.CanvasRenderer(width, height, options);
          }
        });
      }, {
        "./const": 22,
        "./display/Container": 23,
        "./display/DisplayObject": 24,
        "./graphics/Graphics": 25,
        "./graphics/GraphicsData": 26,
        "./graphics/webgl/GraphicsRenderer": 27,
        "./math": 32,
        "./particles/ParticleContainer": 38,
        "./particles/webgl/ParticleRenderer": 40,
        "./renderers/canvas/CanvasRenderer": 43,
        "./renderers/canvas/utils/CanvasBuffer": 44,
        "./renderers/canvas/utils/CanvasGraphics": 45,
        "./renderers/webgl/WebGLRenderer": 48,
        "./renderers/webgl/filters/AbstractFilter": 49,
        "./renderers/webgl/managers/ShaderManager": 55,
        "./renderers/webgl/shaders/Shader": 60,
        "./renderers/webgl/utils/ObjectRenderer": 62,
        "./renderers/webgl/utils/RenderTarget": 64,
        "./sprites/Sprite": 66,
        "./sprites/webgl/SpriteRenderer": 67,
        "./text/Text": 68,
        "./textures/BaseTexture": 69,
        "./textures/RenderTexture": 70,
        "./textures/Texture": 71,
        "./textures/TextureUvs": 72,
        "./textures/VideoBaseTexture": 73,
        "./ticker": 75,
        "./utils": 76
      }],
      30: [function(require, module, exports) {
        var Point = require('./Point');
        function Matrix() {
          this.a = 1;
          this.b = 0;
          this.c = 0;
          this.d = 1;
          this.tx = 0;
          this.ty = 0;
        }
        Matrix.prototype.constructor = Matrix;
        module.exports = Matrix;
        Matrix.prototype.fromArray = function(array) {
          this.a = array[0];
          this.b = array[1];
          this.c = array[3];
          this.d = array[4];
          this.tx = array[2];
          this.ty = array[5];
        };
        Matrix.prototype.toArray = function(transpose) {
          if (!this.array) {
            this.array = new Float32Array(9);
          }
          var array = this.array;
          if (transpose) {
            array[0] = this.a;
            array[1] = this.b;
            array[2] = 0;
            array[3] = this.c;
            array[4] = this.d;
            array[5] = 0;
            array[6] = this.tx;
            array[7] = this.ty;
            array[8] = 1;
          } else {
            array[0] = this.a;
            array[1] = this.c;
            array[2] = this.tx;
            array[3] = this.b;
            array[4] = this.d;
            array[5] = this.ty;
            array[6] = 0;
            array[7] = 0;
            array[8] = 1;
          }
          return array;
        };
        Matrix.prototype.apply = function(pos, newPos) {
          newPos = newPos || new Point();
          var x = pos.x;
          var y = pos.y;
          newPos.x = this.a * x + this.c * y + this.tx;
          newPos.y = this.b * x + this.d * y + this.ty;
          return newPos;
        };
        Matrix.prototype.applyInverse = function(pos, newPos) {
          newPos = newPos || new Point();
          var id = 1 / (this.a * this.d + this.c * -this.b);
          var x = pos.x;
          var y = pos.y;
          newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
          newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;
          return newPos;
        };
        Matrix.prototype.translate = function(x, y) {
          this.tx += x;
          this.ty += y;
          return this;
        };
        Matrix.prototype.scale = function(x, y) {
          this.a *= x;
          this.d *= y;
          this.c *= x;
          this.b *= y;
          this.tx *= x;
          this.ty *= y;
          return this;
        };
        Matrix.prototype.rotate = function(angle) {
          var cos = Math.cos(angle);
          var sin = Math.sin(angle);
          var a1 = this.a;
          var c1 = this.c;
          var tx1 = this.tx;
          this.a = a1 * cos - this.b * sin;
          this.b = a1 * sin + this.b * cos;
          this.c = c1 * cos - this.d * sin;
          this.d = c1 * sin + this.d * cos;
          this.tx = tx1 * cos - this.ty * sin;
          this.ty = tx1 * sin + this.ty * cos;
          return this;
        };
        Matrix.prototype.append = function(matrix) {
          var a1 = this.a;
          var b1 = this.b;
          var c1 = this.c;
          var d1 = this.d;
          this.a = matrix.a * a1 + matrix.b * c1;
          this.b = matrix.a * b1 + matrix.b * d1;
          this.c = matrix.c * a1 + matrix.d * c1;
          this.d = matrix.c * b1 + matrix.d * d1;
          this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
          this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;
          return this;
        };
        Matrix.prototype.prepend = function(matrix) {
          var tx1 = this.tx;
          if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
            var a1 = this.a;
            var c1 = this.c;
            this.a = a1 * matrix.a + this.b * matrix.c;
            this.b = a1 * matrix.b + this.b * matrix.d;
            this.c = c1 * matrix.a + this.d * matrix.c;
            this.d = c1 * matrix.b + this.d * matrix.d;
          }
          this.tx = tx1 * matrix.a + this.ty * matrix.c + matrix.tx;
          this.ty = tx1 * matrix.b + this.ty * matrix.d + matrix.ty;
          return this;
        };
        Matrix.prototype.invert = function() {
          var a1 = this.a;
          var b1 = this.b;
          var c1 = this.c;
          var d1 = this.d;
          var tx1 = this.tx;
          var n = a1 * d1 - b1 * c1;
          this.a = d1 / n;
          this.b = -b1 / n;
          this.c = -c1 / n;
          this.d = a1 / n;
          this.tx = (c1 * this.ty - d1 * tx1) / n;
          this.ty = -(a1 * this.ty - b1 * tx1) / n;
          return this;
        };
        Matrix.prototype.identity = function() {
          this.a = 1;
          this.b = 0;
          this.c = 0;
          this.d = 1;
          this.tx = 0;
          this.ty = 0;
          return this;
        };
        Matrix.prototype.clone = function() {
          var matrix = new Matrix();
          matrix.a = this.a;
          matrix.b = this.b;
          matrix.c = this.c;
          matrix.d = this.d;
          matrix.tx = this.tx;
          matrix.ty = this.ty;
          return matrix;
        };
        Matrix.prototype.copy = function(matrix) {
          matrix.a = this.a;
          matrix.b = this.b;
          matrix.c = this.c;
          matrix.d = this.d;
          matrix.tx = this.tx;
          matrix.ty = this.ty;
          return matrix;
        };
        Matrix.IDENTITY = new Matrix();
        Matrix.TEMP_MATRIX = new Matrix();
      }, {"./Point": 31}],
      31: [function(require, module, exports) {
        function Point(x, y) {
          this.x = x || 0;
          this.y = y || 0;
        }
        Point.prototype.constructor = Point;
        module.exports = Point;
        Point.prototype.clone = function() {
          return new Point(this.x, this.y);
        };
        Point.prototype.copy = function(p) {
          this.set(p.x, p.y);
        };
        Point.prototype.equals = function(p) {
          return (p.x === this.x) && (p.y === this.y);
        };
        Point.prototype.set = function(x, y) {
          this.x = x || 0;
          this.y = y || ((y !== 0) ? this.x : 0);
        };
      }, {}],
      32: [function(require, module, exports) {
        module.exports = {
          Point: require('./Point'),
          Matrix: require('./Matrix'),
          Circle: require('./shapes/Circle'),
          Ellipse: require('./shapes/Ellipse'),
          Polygon: require('./shapes/Polygon'),
          Rectangle: require('./shapes/Rectangle'),
          RoundedRectangle: require('./shapes/RoundedRectangle')
        };
      }, {
        "./Matrix": 30,
        "./Point": 31,
        "./shapes/Circle": 33,
        "./shapes/Ellipse": 34,
        "./shapes/Polygon": 35,
        "./shapes/Rectangle": 36,
        "./shapes/RoundedRectangle": 37
      }],
      33: [function(require, module, exports) {
        var Rectangle = require('./Rectangle'),
            CONST = require('../../const');
        function Circle(x, y, radius) {
          this.x = x || 0;
          this.y = y || 0;
          this.radius = radius || 0;
          this.type = CONST.SHAPES.CIRC;
        }
        Circle.prototype.constructor = Circle;
        module.exports = Circle;
        Circle.prototype.clone = function() {
          return new Circle(this.x, this.y, this.radius);
        };
        Circle.prototype.contains = function(x, y) {
          if (this.radius <= 0) {
            return false;
          }
          var dx = (this.x - x),
              dy = (this.y - y),
              r2 = this.radius * this.radius;
          dx *= dx;
          dy *= dy;
          return (dx + dy <= r2);
        };
        Circle.prototype.getBounds = function() {
          return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        };
      }, {
        "../../const": 22,
        "./Rectangle": 36
      }],
      34: [function(require, module, exports) {
        var Rectangle = require('./Rectangle'),
            CONST = require('../../const');
        function Ellipse(x, y, width, height) {
          this.x = x || 0;
          this.y = y || 0;
          this.width = width || 0;
          this.height = height || 0;
          this.type = CONST.SHAPES.ELIP;
        }
        Ellipse.prototype.constructor = Ellipse;
        module.exports = Ellipse;
        Ellipse.prototype.clone = function() {
          return new Ellipse(this.x, this.y, this.width, this.height);
        };
        Ellipse.prototype.contains = function(x, y) {
          if (this.width <= 0 || this.height <= 0) {
            return false;
          }
          var normx = ((x - this.x) / this.width),
              normy = ((y - this.y) / this.height);
          normx *= normx;
          normy *= normy;
          return (normx + normy <= 1);
        };
        Ellipse.prototype.getBounds = function() {
          return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
        };
      }, {
        "../../const": 22,
        "./Rectangle": 36
      }],
      35: [function(require, module, exports) {
        var Point = require('../Point'),
            CONST = require('../../const');
        function Polygon(points_) {
          var points = points_;
          if (!Array.isArray(points)) {
            points = new Array(arguments.length);
            for (var a = 0; a < points.length; ++a) {
              points[a] = arguments[a];
            }
          }
          if (points[0] instanceof Point) {
            var p = [];
            for (var i = 0,
                il = points.length; i < il; i++) {
              p.push(points[i].x, points[i].y);
            }
            points = p;
          }
          this.closed = true;
          this.points = points;
          this.type = CONST.SHAPES.POLY;
        }
        Polygon.prototype.constructor = Polygon;
        module.exports = Polygon;
        Polygon.prototype.clone = function() {
          return new Polygon(this.points.slice());
        };
        Polygon.prototype.contains = function(x, y) {
          var inside = false;
          var length = this.points.length / 2;
          for (var i = 0,
              j = length - 1; i < length; j = i++) {
            var xi = this.points[i * 2],
                yi = this.points[i * 2 + 1],
                xj = this.points[j * 2],
                yj = this.points[j * 2 + 1],
                intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
              inside = !inside;
            }
          }
          return inside;
        };
      }, {
        "../../const": 22,
        "../Point": 31
      }],
      36: [function(require, module, exports) {
        var CONST = require('../../const');
        function Rectangle(x, y, width, height) {
          this.x = x || 0;
          this.y = y || 0;
          this.width = width || 0;
          this.height = height || 0;
          this.type = CONST.SHAPES.RECT;
        }
        Rectangle.prototype.constructor = Rectangle;
        module.exports = Rectangle;
        Rectangle.EMPTY = new Rectangle(0, 0, 0, 0);
        Rectangle.prototype.clone = function() {
          return new Rectangle(this.x, this.y, this.width, this.height);
        };
        Rectangle.prototype.contains = function(x, y) {
          if (this.width <= 0 || this.height <= 0) {
            return false;
          }
          if (x >= this.x && x < this.x + this.width) {
            if (y >= this.y && y < this.y + this.height) {
              return true;
            }
          }
          return false;
        };
      }, {"../../const": 22}],
      37: [function(require, module, exports) {
        var CONST = require('../../const');
        function RoundedRectangle(x, y, width, height, radius) {
          this.x = x || 0;
          this.y = y || 0;
          this.width = width || 0;
          this.height = height || 0;
          this.radius = radius || 20;
          this.type = CONST.SHAPES.RREC;
        }
        RoundedRectangle.prototype.constructor = RoundedRectangle;
        module.exports = RoundedRectangle;
        RoundedRectangle.prototype.clone = function() {
          return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
        };
        RoundedRectangle.prototype.contains = function(x, y) {
          if (this.width <= 0 || this.height <= 0) {
            return false;
          }
          if (x >= this.x && x <= this.x + this.width) {
            if (y >= this.y && y <= this.y + this.height) {
              return true;
            }
          }
          return false;
        };
      }, {"../../const": 22}],
      38: [function(require, module, exports) {
        var Container = require('../display/Container'),
            CONST = require('../const');
        function ParticleContainer(size, properties) {
          Container.call(this);
          this._properties = [false, true, false, false, false];
          this._size = size || 15000;
          this._buffers = null;
          this._updateStatic = false;
          this.interactiveChildren = false;
          this.blendMode = CONST.BLEND_MODES.NORMAL;
          this.roundPixels = true;
          this.setProperties(properties);
        }
        ParticleContainer.prototype = Object.create(Container.prototype);
        ParticleContainer.prototype.constructor = ParticleContainer;
        module.exports = ParticleContainer;
        ParticleContainer.prototype.setProperties = function(properties) {
          if (properties) {
            this._properties[0] = 'scale' in properties ? !!properties.scale : this._properties[0];
            this._properties[1] = 'position' in properties ? !!properties.position : this._properties[1];
            this._properties[2] = 'rotation' in properties ? !!properties.rotation : this._properties[2];
            this._properties[3] = 'uvs' in properties ? !!properties.uvs : this._properties[3];
            this._properties[4] = 'alpha' in properties ? !!properties.alpha : this._properties[4];
          }
        };
        ParticleContainer.prototype.updateTransform = function() {
          this.displayObjectUpdateTransform();
        };
        ParticleContainer.prototype.renderWebGL = function(renderer) {
          if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable) {
            return;
          }
          renderer.setObjectRenderer(renderer.plugins.particle);
          renderer.plugins.particle.render(this);
        };
        ParticleContainer.prototype.addChildAt = function(child, index) {
          if (child === this) {
            return child;
          }
          if (index >= 0 && index <= this.children.length) {
            if (child.parent) {
              child.parent.removeChild(child);
            }
            child.parent = this;
            this.children.splice(index, 0, child);
            this._updateStatic = true;
            return child;
          } else {
            throw new Error(child + 'addChildAt: The index ' + index + ' supplied is out of bounds ' + this.children.length);
          }
        };
        ParticleContainer.prototype.removeChildAt = function(index) {
          var child = this.getChildAt(index);
          child.parent = null;
          this.children.splice(index, 1);
          this._updateStatic = true;
          return child;
        };
        ParticleContainer.prototype.renderCanvas = function(renderer) {
          if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable) {
            return;
          }
          var context = renderer.context;
          var transform = this.worldTransform;
          var isRotated = true;
          var positionX = 0;
          var positionY = 0;
          var finalWidth = 0;
          var finalHeight = 0;
          context.globalAlpha = this.worldAlpha;
          this.displayObjectUpdateTransform();
          for (var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];
            if (!child.visible) {
              continue;
            }
            var frame = child.texture.frame;
            context.globalAlpha = this.worldAlpha * child.alpha;
            if (child.rotation % (Math.PI * 2) === 0) {
              if (isRotated) {
                context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
                isRotated = false;
              }
              positionX = ((child.anchor.x) * (-frame.width * child.scale.x) + child.position.x + 0.5);
              positionY = ((child.anchor.y) * (-frame.height * child.scale.y) + child.position.y + 0.5);
              finalWidth = frame.width * child.scale.x;
              finalHeight = frame.height * child.scale.y;
            } else {
              if (!isRotated) {
                isRotated = true;
              }
              child.displayObjectUpdateTransform();
              var childTransform = child.worldTransform;
              if (renderer.roundPixels) {
                context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, childTransform.tx | 0, childTransform.ty | 0);
              } else {
                context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, childTransform.tx, childTransform.ty);
              }
              positionX = ((child.anchor.x) * (-frame.width) + 0.5);
              positionY = ((child.anchor.y) * (-frame.height) + 0.5);
              finalWidth = frame.width;
              finalHeight = frame.height;
            }
            context.drawImage(child.texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, positionX, positionY, finalWidth, finalHeight);
          }
        };
        ParticleContainer.prototype.destroy = function() {
          Container.prototype.destroy.apply(this, arguments);
          if (this._buffers) {
            for (var i = 0; i < this._buffers.length; ++i) {
              this._buffers.destroy();
            }
          }
          this._properties = null;
          this._buffers = null;
        };
      }, {
        "../const": 22,
        "../display/Container": 23
      }],
      39: [function(require, module, exports) {
        function ParticleBuffer(gl, properties, size) {
          this.gl = gl;
          this.vertSize = 2;
          this.vertByteSize = this.vertSize * 4;
          this.size = size;
          this.dynamicProperties = [];
          this.staticProperties = [];
          for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            if (property.dynamic) {
              this.dynamicProperties.push(property);
            } else {
              this.staticProperties.push(property);
            }
          }
          this.staticStride = 0;
          this.staticBuffer = null;
          this.staticData = null;
          this.dynamicStride = 0;
          this.dynamicBuffer = null;
          this.dynamicData = null;
          this.initBuffers();
        }
        ParticleBuffer.prototype.constructor = ParticleBuffer;
        module.exports = ParticleBuffer;
        ParticleBuffer.prototype.initBuffers = function() {
          var gl = this.gl;
          var i;
          var property;
          var dynamicOffset = 0;
          this.dynamicStride = 0;
          for (i = 0; i < this.dynamicProperties.length; i++) {
            property = this.dynamicProperties[i];
            property.offset = dynamicOffset;
            dynamicOffset += property.size;
            this.dynamicStride += property.size;
          }
          this.dynamicData = new Float32Array(this.size * this.dynamicStride * 4);
          this.dynamicBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, this.dynamicData, gl.DYNAMIC_DRAW);
          var staticOffset = 0;
          this.staticStride = 0;
          for (i = 0; i < this.staticProperties.length; i++) {
            property = this.staticProperties[i];
            property.offset = staticOffset;
            staticOffset += property.size;
            this.staticStride += property.size;
          }
          this.staticData = new Float32Array(this.size * this.staticStride * 4);
          this.staticBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, this.staticData, gl.DYNAMIC_DRAW);
        };
        ParticleBuffer.prototype.uploadDynamic = function(children, startIndex, amount) {
          var gl = this.gl;
          for (var i = 0; i < this.dynamicProperties.length; i++) {
            var property = this.dynamicProperties[i];
            property.uploadFunction(children, startIndex, amount, this.dynamicData, this.dynamicStride, property.offset);
          }
          gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dynamicData);
        };
        ParticleBuffer.prototype.uploadStatic = function(children, startIndex, amount) {
          var gl = this.gl;
          for (var i = 0; i < this.staticProperties.length; i++) {
            var property = this.staticProperties[i];
            property.uploadFunction(children, startIndex, amount, this.staticData, this.staticStride, property.offset);
          }
          gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.staticData);
        };
        ParticleBuffer.prototype.bind = function() {
          var gl = this.gl;
          var i,
              property;
          gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
          for (i = 0; i < this.dynamicProperties.length; i++) {
            property = this.dynamicProperties[i];
            gl.vertexAttribPointer(property.attribute, property.size, gl.FLOAT, false, this.dynamicStride * 4, property.offset * 4);
          }
          gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
          for (i = 0; i < this.staticProperties.length; i++) {
            property = this.staticProperties[i];
            gl.vertexAttribPointer(property.attribute, property.size, gl.FLOAT, false, this.staticStride * 4, property.offset * 4);
          }
        };
        ParticleBuffer.prototype.destroy = function() {
          this.dynamicProperties = null;
          this.dynamicData = null;
          this.gl.deleteBuffer(this.dynamicBuffer);
          this.staticProperties = null;
          this.staticData = null;
          this.gl.deleteBuffer(this.staticBuffer);
        };
      }, {}],
      40: [function(require, module, exports) {
        var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
            WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
            ParticleShader = require('./ParticleShader'),
            ParticleBuffer = require('./ParticleBuffer'),
            math = require('../../math');
        function ParticleRenderer(renderer) {
          ObjectRenderer.call(this, renderer);
          this.size = 15000;
          var numIndices = this.size * 6;
          this.indices = new Uint16Array(numIndices);
          for (var i = 0,
              j = 0; i < numIndices; i += 6, j += 4) {
            this.indices[i + 0] = j + 0;
            this.indices[i + 1] = j + 1;
            this.indices[i + 2] = j + 2;
            this.indices[i + 3] = j + 0;
            this.indices[i + 4] = j + 2;
            this.indices[i + 5] = j + 3;
          }
          this.shader = null;
          this.indexBuffer = null;
          this.properties = null;
          this.tempMatrix = new math.Matrix();
        }
        ParticleRenderer.prototype = Object.create(ObjectRenderer.prototype);
        ParticleRenderer.prototype.constructor = ParticleRenderer;
        module.exports = ParticleRenderer;
        WebGLRenderer.registerPlugin('particle', ParticleRenderer);
        ParticleRenderer.prototype.onContextChange = function() {
          var gl = this.renderer.gl;
          this.shader = new ParticleShader(this.renderer.shaderManager);
          this.indexBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
          this.properties = [{
            attribute: this.shader.attributes.aVertexPosition,
            dynamic: false,
            size: 2,
            uploadFunction: this.uploadVertices,
            offset: 0
          }, {
            attribute: this.shader.attributes.aPositionCoord,
            dynamic: true,
            size: 2,
            uploadFunction: this.uploadPosition,
            offset: 0
          }, {
            attribute: this.shader.attributes.aRotation,
            dynamic: false,
            size: 1,
            uploadFunction: this.uploadRotation,
            offset: 0
          }, {
            attribute: this.shader.attributes.aTextureCoord,
            dynamic: false,
            size: 2,
            uploadFunction: this.uploadUvs,
            offset: 0
          }, {
            attribute: this.shader.attributes.aColor,
            dynamic: false,
            size: 1,
            uploadFunction: this.uploadAlpha,
            offset: 0
          }];
        };
        ParticleRenderer.prototype.start = function() {
          var gl = this.renderer.gl;
          gl.activeTexture(gl.TEXTURE0);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
          var shader = this.shader;
          this.renderer.shaderManager.setShader(shader);
        };
        ParticleRenderer.prototype.render = function(container) {
          var children = container.children,
              totalChildren = children.length,
              maxSize = container._size;
          if (totalChildren === 0) {
            return;
          } else if (totalChildren > maxSize) {
            totalChildren = maxSize;
          }
          if (!container._buffers) {
            container._buffers = this.generateBuffers(container);
          }
          this.renderer.blendModeManager.setBlendMode(container.blendMode);
          var gl = this.renderer.gl;
          var m = container.worldTransform.copy(this.tempMatrix);
          m.prepend(this.renderer.currentRenderTarget.projectionMatrix);
          gl.uniformMatrix3fv(this.shader.uniforms.projectionMatrix._location, false, m.toArray(true));
          gl.uniform1f(this.shader.uniforms.uAlpha._location, container.worldAlpha);
          var uploadStatic = container._updateStatic;
          var baseTexture = children[0]._texture.baseTexture;
          if (!baseTexture._glTextures[gl.id]) {
            if (!this.renderer.updateTexture(baseTexture)) {
              return;
            }
            if (!this.properties[0].dynamic || !this.properties[3].dynamic) {
              uploadStatic = true;
            }
          } else {
            gl.bindTexture(gl.TEXTURE_2D, baseTexture._glTextures[gl.id]);
          }
          var j = 0;
          for (var i = 0; i < totalChildren; i += this.size) {
            var amount = (totalChildren - i);
            if (amount > this.size) {
              amount = this.size;
            }
            var buffer = container._buffers[j++];
            buffer.uploadDynamic(children, i, amount);
            if (uploadStatic) {
              buffer.uploadStatic(children, i, amount);
            }
            buffer.bind(this.shader);
            gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
            this.renderer.drawCount++;
          }
          container._updateStatic = false;
        };
        ParticleRenderer.prototype.generateBuffers = function(container) {
          var gl = this.renderer.gl,
              buffers = [],
              size = container._size,
              i;
          for (i = 0; i < container._properties.length; i++) {
            this.properties[i].dynamic = container._properties[i];
          }
          for (i = 0; i < size; i += this.size) {
            buffers.push(new ParticleBuffer(gl, this.properties, this.size, this.shader));
          }
          return buffers;
        };
        ParticleRenderer.prototype.uploadVertices = function(children, startIndex, amount, array, stride, offset) {
          var sprite,
              texture,
              trim,
              sx,
              sy,
              w0,
              w1,
              h0,
              h1;
          for (var i = 0; i < amount; i++) {
            sprite = children[startIndex + i];
            texture = sprite._texture;
            sx = sprite.scale.x;
            sy = sprite.scale.y;
            if (texture.trim) {
              trim = texture.trim;
              w1 = trim.x - sprite.anchor.x * trim.width;
              w0 = w1 + texture.crop.width;
              h1 = trim.y - sprite.anchor.y * trim.height;
              h0 = h1 + texture.crop.height;
            } else {
              w0 = (texture._frame.width) * (1 - sprite.anchor.x);
              w1 = (texture._frame.width) * -sprite.anchor.x;
              h0 = texture._frame.height * (1 - sprite.anchor.y);
              h1 = texture._frame.height * -sprite.anchor.y;
            }
            array[offset] = w1 * sx;
            array[offset + 1] = h1 * sy;
            array[offset + stride] = w0 * sx;
            array[offset + stride + 1] = h1 * sy;
            array[offset + stride * 2] = w0 * sx;
            array[offset + stride * 2 + 1] = h0 * sy;
            array[offset + stride * 3] = w1 * sx;
            array[offset + stride * 3 + 1] = h0 * sy;
            offset += stride * 4;
          }
        };
        ParticleRenderer.prototype.uploadPosition = function(children, startIndex, amount, array, stride, offset) {
          for (var i = 0; i < amount; i++) {
            var spritePosition = children[startIndex + i].position;
            array[offset] = spritePosition.x;
            array[offset + 1] = spritePosition.y;
            array[offset + stride] = spritePosition.x;
            array[offset + stride + 1] = spritePosition.y;
            array[offset + stride * 2] = spritePosition.x;
            array[offset + stride * 2 + 1] = spritePosition.y;
            array[offset + stride * 3] = spritePosition.x;
            array[offset + stride * 3 + 1] = spritePosition.y;
            offset += stride * 4;
          }
        };
        ParticleRenderer.prototype.uploadRotation = function(children, startIndex, amount, array, stride, offset) {
          for (var i = 0; i < amount; i++) {
            var spriteRotation = children[startIndex + i].rotation;
            array[offset] = spriteRotation;
            array[offset + stride] = spriteRotation;
            array[offset + stride * 2] = spriteRotation;
            array[offset + stride * 3] = spriteRotation;
            offset += stride * 4;
          }
        };
        ParticleRenderer.prototype.uploadUvs = function(children, startIndex, amount, array, stride, offset) {
          for (var i = 0; i < amount; i++) {
            var textureUvs = children[startIndex + i]._texture._uvs;
            if (textureUvs) {
              array[offset] = textureUvs.x0;
              array[offset + 1] = textureUvs.y0;
              array[offset + stride] = textureUvs.x1;
              array[offset + stride + 1] = textureUvs.y1;
              array[offset + stride * 2] = textureUvs.x2;
              array[offset + stride * 2 + 1] = textureUvs.y2;
              array[offset + stride * 3] = textureUvs.x3;
              array[offset + stride * 3 + 1] = textureUvs.y3;
              offset += stride * 4;
            } else {
              array[offset] = 0;
              array[offset + 1] = 0;
              array[offset + stride] = 0;
              array[offset + stride + 1] = 0;
              array[offset + stride * 2] = 0;
              array[offset + stride * 2 + 1] = 0;
              array[offset + stride * 3] = 0;
              array[offset + stride * 3 + 1] = 0;
              offset += stride * 4;
            }
          }
        };
        ParticleRenderer.prototype.uploadAlpha = function(children, startIndex, amount, array, stride, offset) {
          for (var i = 0; i < amount; i++) {
            var spriteAlpha = children[startIndex + i].alpha;
            array[offset] = spriteAlpha;
            array[offset + stride] = spriteAlpha;
            array[offset + stride * 2] = spriteAlpha;
            array[offset + stride * 3] = spriteAlpha;
            offset += stride * 4;
          }
        };
        ParticleRenderer.prototype.destroy = function() {
          if (this.renderer.gl) {
            this.renderer.gl.deleteBuffer(this.indexBuffer);
          }
          ObjectRenderer.prototype.destroy.apply(this, arguments);
          this.shader.destroy();
          this.indices = null;
          this.tempMatrix = null;
        };
      }, {
        "../../math": 32,
        "../../renderers/webgl/WebGLRenderer": 48,
        "../../renderers/webgl/utils/ObjectRenderer": 62,
        "./ParticleBuffer": 39,
        "./ParticleShader": 41
      }],
      41: [function(require, module, exports) {
        var TextureShader = require('../../renderers/webgl/shaders/TextureShader');
        function ParticleShader(shaderManager) {
          TextureShader.call(this, shaderManager, ['attribute vec2 aVertexPosition;', 'attribute vec2 aTextureCoord;', 'attribute float aColor;', 'attribute vec2 aPositionCoord;', 'attribute vec2 aScale;', 'attribute float aRotation;', 'uniform mat3 projectionMatrix;', 'varying vec2 vTextureCoord;', 'varying float vColor;', 'void main(void){', '   vec2 v = aVertexPosition;', '   v.x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);', '   v.y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);', '   v = v + aPositionCoord;', '   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);', '   vTextureCoord = aTextureCoord;', '   vColor = aColor;', '}'].join('\n'), ['precision lowp float;', 'varying vec2 vTextureCoord;', 'varying float vColor;', 'uniform sampler2D uSampler;', 'uniform float uAlpha;', 'void main(void){', '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor * uAlpha ;', '}'].join('\n'), {uAlpha: {
              type: '1f',
              value: 1
            }}, {
            aPositionCoord: 0,
            aRotation: 0
          });
        }
        ParticleShader.prototype = Object.create(TextureShader.prototype);
        ParticleShader.prototype.constructor = ParticleShader;
        module.exports = ParticleShader;
      }, {"../../renderers/webgl/shaders/TextureShader": 61}],
      42: [function(require, module, exports) {
        var utils = require('../utils'),
            math = require('../math'),
            CONST = require('../const'),
            EventEmitter = require('eventemitter3');
        function SystemRenderer(system, width, height, options) {
          EventEmitter.call(this);
          utils.sayHello(system);
          if (options) {
            for (var i in CONST.DEFAULT_RENDER_OPTIONS) {
              if (typeof options[i] === 'undefined') {
                options[i] = CONST.DEFAULT_RENDER_OPTIONS[i];
              }
            }
          } else {
            options = CONST.DEFAULT_RENDER_OPTIONS;
          }
          this.type = CONST.RENDERER_TYPE.UNKNOWN;
          this.width = width || 800;
          this.height = height || 600;
          this.view = options.view || document.createElement('canvas');
          this.resolution = options.resolution;
          this.transparent = options.transparent;
          this.autoResize = options.autoResize || false;
          this.blendModes = null;
          this.preserveDrawingBuffer = options.preserveDrawingBuffer;
          this.clearBeforeRender = options.clearBeforeRender;
          this._backgroundColor = 0x000000;
          this._backgroundColorRgb = [0, 0, 0];
          this._backgroundColorString = '#000000';
          this.backgroundColor = options.backgroundColor || this._backgroundColor;
          this._tempDisplayObjectParent = {
            worldTransform: new math.Matrix(),
            worldAlpha: 1,
            children: []
          };
          this._lastObjectRendered = this._tempDisplayObjectParent;
        }
        SystemRenderer.prototype = Object.create(EventEmitter.prototype);
        SystemRenderer.prototype.constructor = SystemRenderer;
        module.exports = SystemRenderer;
        Object.defineProperties(SystemRenderer.prototype, {backgroundColor: {
            get: function() {
              return this._backgroundColor;
            },
            set: function(val) {
              this._backgroundColor = val;
              this._backgroundColorString = utils.hex2string(val);
              utils.hex2rgb(val, this._backgroundColorRgb);
            }
          }});
        SystemRenderer.prototype.resize = function(width, height) {
          this.width = width * this.resolution;
          this.height = height * this.resolution;
          this.view.width = this.width;
          this.view.height = this.height;
          if (this.autoResize) {
            this.view.style.width = this.width / this.resolution + 'px';
            this.view.style.height = this.height / this.resolution + 'px';
          }
        };
        SystemRenderer.prototype.destroy = function(removeView) {
          if (removeView && this.view.parent) {
            this.view.parent.removeChild(this.view);
          }
          this.type = CONST.RENDERER_TYPE.UNKNOWN;
          this.width = 0;
          this.height = 0;
          this.view = null;
          this.resolution = 0;
          this.transparent = false;
          this.autoResize = false;
          this.blendModes = null;
          this.preserveDrawingBuffer = false;
          this.clearBeforeRender = false;
          this._backgroundColor = 0;
          this._backgroundColorRgb = null;
          this._backgroundColorString = null;
        };
      }, {
        "../const": 22,
        "../math": 32,
        "../utils": 76,
        "eventemitter3": 11
      }],
      43: [function(require, module, exports) {
        var SystemRenderer = require('../SystemRenderer'),
            CanvasMaskManager = require('./utils/CanvasMaskManager'),
            utils = require('../../utils'),
            math = require('../../math'),
            CONST = require('../../const');
        function CanvasRenderer(width, height, options) {
          SystemRenderer.call(this, 'Canvas', width, height, options);
          this.type = CONST.RENDERER_TYPE.CANVAS;
          this.context = this.view.getContext('2d', {alpha: this.transparent});
          this.refresh = true;
          this.maskManager = new CanvasMaskManager();
          this.roundPixels = false;
          this.currentScaleMode = CONST.SCALE_MODES.DEFAULT;
          this.currentBlendMode = CONST.BLEND_MODES.NORMAL;
          this.smoothProperty = 'imageSmoothingEnabled';
          if (!this.context.imageSmoothingEnabled) {
            if (this.context.webkitImageSmoothingEnabled) {
              this.smoothProperty = 'webkitImageSmoothingEnabled';
            } else if (this.context.mozImageSmoothingEnabled) {
              this.smoothProperty = 'mozImageSmoothingEnabled';
            } else if (this.context.oImageSmoothingEnabled) {
              this.smoothProperty = 'oImageSmoothingEnabled';
            } else if (this.context.msImageSmoothingEnabled) {
              this.smoothProperty = 'msImageSmoothingEnabled';
            }
          }
          this.initPlugins();
          this._mapBlendModes();
          this._tempDisplayObjectParent = {
            worldTransform: new math.Matrix(),
            worldAlpha: 1
          };
          this.resize(width, height);
        }
        CanvasRenderer.prototype = Object.create(SystemRenderer.prototype);
        CanvasRenderer.prototype.constructor = CanvasRenderer;
        module.exports = CanvasRenderer;
        utils.pluginTarget.mixin(CanvasRenderer);
        CanvasRenderer.prototype.render = function(object) {
          var cacheParent = object.parent;
          this._lastObjectRendered = object;
          object.parent = this._tempDisplayObjectParent;
          object.updateTransform();
          object.parent = cacheParent;
          this.context.setTransform(1, 0, 0, 1, 0, 0);
          this.context.globalAlpha = 1;
          this.currentBlendMode = CONST.BLEND_MODES.NORMAL;
          this.context.globalCompositeOperation = this.blendModes[CONST.BLEND_MODES.NORMAL];
          if (navigator.isCocoonJS && this.view.screencanvas) {
            this.context.fillStyle = 'black';
            this.context.clear();
          }
          if (this.clearBeforeRender) {
            if (this.transparent) {
              this.context.clearRect(0, 0, this.width, this.height);
            } else {
              this.context.fillStyle = this._backgroundColorString;
              this.context.fillRect(0, 0, this.width, this.height);
            }
          }
          this.renderDisplayObject(object, this.context);
        };
        CanvasRenderer.prototype.destroy = function(removeView) {
          this.destroyPlugins();
          SystemRenderer.prototype.destroy.call(this, removeView);
          this.context = null;
          this.refresh = true;
          this.maskManager.destroy();
          this.maskManager = null;
          this.roundPixels = false;
          this.currentScaleMode = 0;
          this.currentBlendMode = 0;
          this.smoothProperty = null;
        };
        CanvasRenderer.prototype.renderDisplayObject = function(displayObject, context) {
          var tempContext = this.context;
          this.context = context;
          displayObject.renderCanvas(this);
          this.context = tempContext;
        };
        CanvasRenderer.prototype._mapBlendModes = function() {
          if (!this.blendModes) {
            this.blendModes = {};
            if (utils.canUseNewCanvasBlendModes()) {
              this.blendModes[CONST.BLEND_MODES.NORMAL] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.ADD] = 'lighter';
              this.blendModes[CONST.BLEND_MODES.MULTIPLY] = 'multiply';
              this.blendModes[CONST.BLEND_MODES.SCREEN] = 'screen';
              this.blendModes[CONST.BLEND_MODES.OVERLAY] = 'overlay';
              this.blendModes[CONST.BLEND_MODES.DARKEN] = 'darken';
              this.blendModes[CONST.BLEND_MODES.LIGHTEN] = 'lighten';
              this.blendModes[CONST.BLEND_MODES.COLOR_DODGE] = 'color-dodge';
              this.blendModes[CONST.BLEND_MODES.COLOR_BURN] = 'color-burn';
              this.blendModes[CONST.BLEND_MODES.HARD_LIGHT] = 'hard-light';
              this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT] = 'soft-light';
              this.blendModes[CONST.BLEND_MODES.DIFFERENCE] = 'difference';
              this.blendModes[CONST.BLEND_MODES.EXCLUSION] = 'exclusion';
              this.blendModes[CONST.BLEND_MODES.HUE] = 'hue';
              this.blendModes[CONST.BLEND_MODES.SATURATION] = 'saturate';
              this.blendModes[CONST.BLEND_MODES.COLOR] = 'color';
              this.blendModes[CONST.BLEND_MODES.LUMINOSITY] = 'luminosity';
            } else {
              this.blendModes[CONST.BLEND_MODES.NORMAL] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.ADD] = 'lighter';
              this.blendModes[CONST.BLEND_MODES.MULTIPLY] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.SCREEN] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.OVERLAY] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.DARKEN] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.LIGHTEN] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.COLOR_DODGE] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.COLOR_BURN] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.HARD_LIGHT] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.DIFFERENCE] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.EXCLUSION] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.HUE] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.SATURATION] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.COLOR] = 'source-over';
              this.blendModes[CONST.BLEND_MODES.LUMINOSITY] = 'source-over';
            }
          }
        };
      }, {
        "../../const": 22,
        "../../math": 32,
        "../../utils": 76,
        "../SystemRenderer": 42,
        "./utils/CanvasMaskManager": 46
      }],
      44: [function(require, module, exports) {
        function CanvasBuffer(width, height) {
          this.canvas = document.createElement('canvas');
          this.context = this.canvas.getContext('2d');
          this.canvas.width = width;
          this.canvas.height = height;
        }
        CanvasBuffer.prototype.constructor = CanvasBuffer;
        module.exports = CanvasBuffer;
        Object.defineProperties(CanvasBuffer.prototype, {
          width: {
            get: function() {
              return this.canvas.width;
            },
            set: function(val) {
              this.canvas.width = val;
            }
          },
          height: {
            get: function() {
              return this.canvas.height;
            },
            set: function(val) {
              this.canvas.height = val;
            }
          }
        });
        CanvasBuffer.prototype.clear = function() {
          this.context.setTransform(1, 0, 0, 1, 0, 0);
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        CanvasBuffer.prototype.resize = function(width, height) {
          this.canvas.width = width;
          this.canvas.height = height;
        };
        CanvasBuffer.prototype.destroy = function() {
          this.context = null;
          this.canvas = null;
        };
      }, {}],
      45: [function(require, module, exports) {
        var CONST = require('../../../const');
        var CanvasGraphics = {};
        module.exports = CanvasGraphics;
        CanvasGraphics.renderGraphics = function(graphics, context) {
          var worldAlpha = graphics.worldAlpha;
          if (graphics.dirty) {
            this.updateGraphicsTint(graphics);
            graphics.dirty = false;
          }
          for (var i = 0; i < graphics.graphicsData.length; i++) {
            var data = graphics.graphicsData[i];
            var shape = data.shape;
            var fillColor = data._fillTint;
            var lineColor = data._lineTint;
            context.lineWidth = data.lineWidth;
            if (data.type === CONST.SHAPES.POLY) {
              context.beginPath();
              var points = shape.points;
              context.moveTo(points[0], points[1]);
              for (var j = 1; j < points.length / 2; j++) {
                context.lineTo(points[j * 2], points[j * 2 + 1]);
              }
              if (shape.closed) {
                context.lineTo(points[0], points[1]);
              }
              if (points[0] === points[points.length - 2] && points[1] === points[points.length - 1]) {
                context.closePath();
              }
              if (data.fill) {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                context.fill();
              }
              if (data.lineWidth) {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                context.stroke();
              }
            } else if (data.type === CONST.SHAPES.RECT) {
              if (data.fillColor || data.fillColor === 0) {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                context.fillRect(shape.x, shape.y, shape.width, shape.height);
              }
              if (data.lineWidth) {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                context.strokeRect(shape.x, shape.y, shape.width, shape.height);
              }
            } else if (data.type === CONST.SHAPES.CIRC) {
              context.beginPath();
              context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
              context.closePath();
              if (data.fill) {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                context.fill();
              }
              if (data.lineWidth) {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                context.stroke();
              }
            } else if (data.type === CONST.SHAPES.ELIP) {
              var w = shape.width * 2;
              var h = shape.height * 2;
              var x = shape.x - w / 2;
              var y = shape.y - h / 2;
              context.beginPath();
              var kappa = 0.5522848,
                  ox = (w / 2) * kappa,
                  oy = (h / 2) * kappa,
                  xe = x + w,
                  ye = y + h,
                  xm = x + w / 2,
                  ym = y + h / 2;
              context.moveTo(x, ym);
              context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
              context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
              context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
              context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
              context.closePath();
              if (data.fill) {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                context.fill();
              }
              if (data.lineWidth) {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                context.stroke();
              }
            } else if (data.type === CONST.SHAPES.RREC) {
              var rx = shape.x;
              var ry = shape.y;
              var width = shape.width;
              var height = shape.height;
              var radius = shape.radius;
              var maxRadius = Math.min(width, height) / 2 | 0;
              radius = radius > maxRadius ? maxRadius : radius;
              context.beginPath();
              context.moveTo(rx, ry + radius);
              context.lineTo(rx, ry + height - radius);
              context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
              context.lineTo(rx + width - radius, ry + height);
              context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
              context.lineTo(rx + width, ry + radius);
              context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
              context.lineTo(rx + radius, ry);
              context.quadraticCurveTo(rx, ry, rx, ry + radius);
              context.closePath();
              if (data.fillColor || data.fillColor === 0) {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                context.fill();
              }
              if (data.lineWidth) {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                context.stroke();
              }
            }
          }
        };
        CanvasGraphics.renderGraphicsMask = function(graphics, context) {
          var len = graphics.graphicsData.length;
          if (len === 0) {
            return;
          }
          context.beginPath();
          for (var i = 0; i < len; i++) {
            var data = graphics.graphicsData[i];
            var shape = data.shape;
            if (data.type === CONST.SHAPES.POLY) {
              var points = shape.points;
              context.moveTo(points[0], points[1]);
              for (var j = 1; j < points.length / 2; j++) {
                context.lineTo(points[j * 2], points[j * 2 + 1]);
              }
              if (points[0] === points[points.length - 2] && points[1] === points[points.length - 1]) {
                context.closePath();
              }
            } else if (data.type === CONST.SHAPES.RECT) {
              context.rect(shape.x, shape.y, shape.width, shape.height);
              context.closePath();
            } else if (data.type === CONST.SHAPES.CIRC) {
              context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
              context.closePath();
            } else if (data.type === CONST.SHAPES.ELIP) {
              var w = shape.width * 2;
              var h = shape.height * 2;
              var x = shape.x - w / 2;
              var y = shape.y - h / 2;
              var kappa = 0.5522848,
                  ox = (w / 2) * kappa,
                  oy = (h / 2) * kappa,
                  xe = x + w,
                  ye = y + h,
                  xm = x + w / 2,
                  ym = y + h / 2;
              context.moveTo(x, ym);
              context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
              context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
              context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
              context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
              context.closePath();
            } else if (data.type === CONST.SHAPES.RREC) {
              var rx = shape.x;
              var ry = shape.y;
              var width = shape.width;
              var height = shape.height;
              var radius = shape.radius;
              var maxRadius = Math.min(width, height) / 2 | 0;
              radius = radius > maxRadius ? maxRadius : radius;
              context.moveTo(rx, ry + radius);
              context.lineTo(rx, ry + height - radius);
              context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
              context.lineTo(rx + width - radius, ry + height);
              context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
              context.lineTo(rx + width, ry + radius);
              context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
              context.lineTo(rx + radius, ry);
              context.quadraticCurveTo(rx, ry, rx, ry + radius);
              context.closePath();
            }
          }
        };
        CanvasGraphics.updateGraphicsTint = function(graphics) {
          if (graphics.tint === 0xFFFFFF) {
            return;
          }
          var tintR = (graphics.tint >> 16 & 0xFF) / 255;
          var tintG = (graphics.tint >> 8 & 0xFF) / 255;
          var tintB = (graphics.tint & 0xFF) / 255;
          for (var i = 0; i < graphics.graphicsData.length; i++) {
            var data = graphics.graphicsData[i];
            var fillColor = data.fillColor | 0;
            var lineColor = data.lineColor | 0;
            data._fillTint = (((fillColor >> 16 & 0xFF) / 255 * tintR * 255 << 16) + ((fillColor >> 8 & 0xFF) / 255 * tintG * 255 << 8) + (fillColor & 0xFF) / 255 * tintB * 255);
            data._lineTint = (((lineColor >> 16 & 0xFF) / 255 * tintR * 255 << 16) + ((lineColor >> 8 & 0xFF) / 255 * tintG * 255 << 8) + (lineColor & 0xFF) / 255 * tintB * 255);
          }
        };
      }, {"../../../const": 22}],
      46: [function(require, module, exports) {
        var CanvasGraphics = require('./CanvasGraphics');
        function CanvasMaskManager() {}
        CanvasMaskManager.prototype.constructor = CanvasMaskManager;
        module.exports = CanvasMaskManager;
        CanvasMaskManager.prototype.pushMask = function(maskData, renderer) {
          renderer.context.save();
          var cacheAlpha = maskData.alpha;
          var transform = maskData.worldTransform;
          var resolution = renderer.resolution;
          renderer.context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution);
          if (!maskData.texture) {
            CanvasGraphics.renderGraphicsMask(maskData, renderer.context);
            renderer.context.clip();
          }
          maskData.worldAlpha = cacheAlpha;
        };
        CanvasMaskManager.prototype.popMask = function(renderer) {
          renderer.context.restore();
        };
        CanvasMaskManager.prototype.destroy = function() {};
      }, {"./CanvasGraphics": 45}],
      47: [function(require, module, exports) {
        var utils = require('../../../utils');
        var CanvasTinter = {};
        module.exports = CanvasTinter;
        CanvasTinter.getTintedTexture = function(sprite, color) {
          var texture = sprite.texture;
          color = CanvasTinter.roundColor(color);
          var stringColor = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
          texture.tintCache = texture.tintCache || {};
          if (texture.tintCache[stringColor]) {
            return texture.tintCache[stringColor];
          }
          var canvas = CanvasTinter.canvas || document.createElement('canvas');
          CanvasTinter.tintMethod(texture, color, canvas);
          if (CanvasTinter.convertTintToImage) {
            var tintImage = new Image();
            tintImage.src = canvas.toDataURL();
            texture.tintCache[stringColor] = tintImage;
          } else {
            texture.tintCache[stringColor] = canvas;
            CanvasTinter.canvas = null;
          }
          return canvas;
        };
        CanvasTinter.tintWithMultiply = function(texture, color, canvas) {
          var context = canvas.getContext('2d');
          var crop = texture.crop;
          canvas.width = crop.width;
          canvas.height = crop.height;
          context.fillStyle = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
          context.fillRect(0, 0, crop.width, crop.height);
          context.globalCompositeOperation = 'multiply';
          context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
          context.globalCompositeOperation = 'destination-atop';
          context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
        };
        CanvasTinter.tintWithOverlay = function(texture, color, canvas) {
          var context = canvas.getContext('2d');
          var crop = texture.crop;
          canvas.width = crop.width;
          canvas.height = crop.height;
          context.globalCompositeOperation = 'copy';
          context.fillStyle = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
          context.fillRect(0, 0, crop.width, crop.height);
          context.globalCompositeOperation = 'destination-atop';
          context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
        };
        CanvasTinter.tintWithPerPixel = function(texture, color, canvas) {
          var context = canvas.getContext('2d');
          var crop = texture.crop;
          canvas.width = crop.width;
          canvas.height = crop.height;
          context.globalCompositeOperation = 'copy';
          context.drawImage(texture.baseTexture.source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
          var rgbValues = utils.hex2rgb(color);
          var r = rgbValues[0],
              g = rgbValues[1],
              b = rgbValues[2];
          var pixelData = context.getImageData(0, 0, crop.width, crop.height);
          var pixels = pixelData.data;
          for (var i = 0; i < pixels.length; i += 4) {
            pixels[i + 0] *= r;
            pixels[i + 1] *= g;
            pixels[i + 2] *= b;
          }
          context.putImageData(pixelData, 0, 0);
        };
        CanvasTinter.roundColor = function(color) {
          var step = CanvasTinter.cacheStepsPerColorChannel;
          var rgbValues = utils.hex2rgb(color);
          rgbValues[0] = Math.min(255, (rgbValues[0] / step) * step);
          rgbValues[1] = Math.min(255, (rgbValues[1] / step) * step);
          rgbValues[2] = Math.min(255, (rgbValues[2] / step) * step);
          return utils.rgb2hex(rgbValues);
        };
        CanvasTinter.cacheStepsPerColorChannel = 8;
        CanvasTinter.convertTintToImage = false;
        CanvasTinter.canUseMultiply = utils.canUseNewCanvasBlendModes();
        CanvasTinter.tintMethod = CanvasTinter.canUseMultiply ? CanvasTinter.tintWithMultiply : CanvasTinter.tintWithPerPixel;
      }, {"../../../utils": 76}],
      48: [function(require, module, exports) {
        var SystemRenderer = require('../SystemRenderer'),
            ShaderManager = require('./managers/ShaderManager'),
            MaskManager = require('./managers/MaskManager'),
            StencilManager = require('./managers/StencilManager'),
            FilterManager = require('./managers/FilterManager'),
            BlendModeManager = require('./managers/BlendModeManager'),
            RenderTarget = require('./utils/RenderTarget'),
            ObjectRenderer = require('./utils/ObjectRenderer'),
            FXAAFilter = require('./filters/FXAAFilter'),
            utils = require('../../utils'),
            CONST = require('../../const');
        function WebGLRenderer(width, height, options) {
          options = options || {};
          SystemRenderer.call(this, 'WebGL', width, height, options);
          this.type = CONST.RENDERER_TYPE.WEBGL;
          this.handleContextLost = this.handleContextLost.bind(this);
          this.handleContextRestored = this.handleContextRestored.bind(this);
          this.view.addEventListener('webglcontextlost', this.handleContextLost, false);
          this.view.addEventListener('webglcontextrestored', this.handleContextRestored, false);
          this._useFXAA = !!options.forceFXAA && options.antialias;
          this._FXAAFilter = null;
          this._contextOptions = {
            alpha: this.transparent,
            antialias: options.antialias,
            premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
            stencil: true,
            preserveDrawingBuffer: options.preserveDrawingBuffer
          };
          this.drawCount = 0;
          this.shaderManager = new ShaderManager(this);
          this.maskManager = new MaskManager(this);
          this.stencilManager = new StencilManager(this);
          this.filterManager = new FilterManager(this);
          this.blendModeManager = new BlendModeManager(this);
          this.currentRenderTarget = null;
          this.currentRenderer = new ObjectRenderer(this);
          this.initPlugins();
          this._createContext();
          this._initContext();
          this._mapBlendModes();
          this._renderTargetStack = [];
        }
        WebGLRenderer.prototype = Object.create(SystemRenderer.prototype);
        WebGLRenderer.prototype.constructor = WebGLRenderer;
        module.exports = WebGLRenderer;
        utils.pluginTarget.mixin(WebGLRenderer);
        WebGLRenderer.glContextId = 0;
        WebGLRenderer.prototype._createContext = function() {
          var gl = this.view.getContext('webgl', this._contextOptions) || this.view.getContext('experimental-webgl', this._contextOptions);
          this.gl = gl;
          if (!gl) {
            throw new Error('This browser does not support webGL. Try using the canvas renderer');
          }
          this.glContextId = WebGLRenderer.glContextId++;
          gl.id = this.glContextId;
          gl.renderer = this;
        };
        WebGLRenderer.prototype._initContext = function() {
          var gl = this.gl;
          gl.disable(gl.DEPTH_TEST);
          gl.disable(gl.CULL_FACE);
          gl.enable(gl.BLEND);
          this.renderTarget = new RenderTarget(gl, this.width, this.height, null, this.resolution, true);
          this.setRenderTarget(this.renderTarget);
          this.emit('context', gl);
          this.resize(this.width, this.height);
          if (!this._useFXAA) {
            this._useFXAA = (this._contextOptions.antialias && !gl.getContextAttributes().antialias);
          }
          if (this._useFXAA) {
            window.console.warn('FXAA antialiasing being used instead of native antialiasing');
            this._FXAAFilter = [new FXAAFilter()];
          }
        };
        WebGLRenderer.prototype.render = function(object) {
          if (this.gl.isContextLost()) {
            return;
          }
          this.drawCount = 0;
          this._lastObjectRendered = object;
          if (this._useFXAA) {
            this._FXAAFilter[0].uniforms.resolution.value.x = this.width;
            this._FXAAFilter[0].uniforms.resolution.value.y = this.height;
            object.filterArea = this.renderTarget.size;
            object.filters = this._FXAAFilter;
          }
          var cacheParent = object.parent;
          object.parent = this._tempDisplayObjectParent;
          object.updateTransform();
          object.parent = cacheParent;
          var gl = this.gl;
          this.setRenderTarget(this.renderTarget);
          if (this.clearBeforeRender) {
            if (this.transparent) {
              gl.clearColor(0, 0, 0, 0);
            } else {
              gl.clearColor(this._backgroundColorRgb[0], this._backgroundColorRgb[1], this._backgroundColorRgb[2], 1);
            }
            gl.clear(gl.COLOR_BUFFER_BIT);
          }
          this.renderDisplayObject(object, this.renderTarget);
        };
        WebGLRenderer.prototype.renderDisplayObject = function(displayObject, renderTarget, clear) {
          this.setRenderTarget(renderTarget);
          if (clear) {
            renderTarget.clear();
          }
          this.filterManager.setFilterStack(renderTarget.filterStack);
          displayObject.renderWebGL(this);
          this.currentRenderer.flush();
        };
        WebGLRenderer.prototype.setObjectRenderer = function(objectRenderer) {
          if (this.currentRenderer === objectRenderer) {
            return;
          }
          this.currentRenderer.stop();
          this.currentRenderer = objectRenderer;
          this.currentRenderer.start();
        };
        WebGLRenderer.prototype.setRenderTarget = function(renderTarget) {
          if (this.currentRenderTarget === renderTarget) {
            return;
          }
          this.currentRenderTarget = renderTarget;
          this.currentRenderTarget.activate();
          this.stencilManager.setMaskStack(renderTarget.stencilMaskStack);
        };
        WebGLRenderer.prototype.resize = function(width, height) {
          SystemRenderer.prototype.resize.call(this, width, height);
          this.filterManager.resize(width, height);
          this.renderTarget.resize(width, height);
          if (this.currentRenderTarget === this.renderTarget) {
            this.renderTarget.activate();
            this.gl.viewport(0, 0, this.width, this.height);
          }
        };
        WebGLRenderer.prototype.updateTexture = function(texture) {
          texture = texture.baseTexture || texture;
          if (!texture.hasLoaded) {
            return;
          }
          var gl = this.gl;
          if (!texture._glTextures[gl.id]) {
            texture._glTextures[gl.id] = gl.createTexture();
            texture.on('update', this.updateTexture, this);
            texture.on('dispose', this.destroyTexture, this);
          }
          gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
          if (texture.mipmap && texture.isPowerOfTwo) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
          } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
          }
          if (!texture.isPowerOfTwo) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
          }
          return texture._glTextures[gl.id];
        };
        WebGLRenderer.prototype.destroyTexture = function(texture) {
          texture = texture.baseTexture || texture;
          if (!texture.hasLoaded) {
            return;
          }
          if (texture._glTextures[this.gl.id]) {
            this.gl.deleteTexture(texture._glTextures[this.gl.id]);
          }
        };
        WebGLRenderer.prototype.handleContextLost = function(event) {
          event.preventDefault();
        };
        WebGLRenderer.prototype.handleContextRestored = function() {
          this._initContext();
          for (var key in utils.BaseTextureCache) {
            utils.BaseTextureCache[key]._glTextures.length = 0;
          }
        };
        WebGLRenderer.prototype.destroy = function(removeView) {
          this.destroyPlugins();
          this.view.removeEventListener('webglcontextlost', this.handleContextLost);
          this.view.removeEventListener('webglcontextrestored', this.handleContextRestored);
          SystemRenderer.prototype.destroy.call(this, removeView);
          this.uuid = 0;
          this.shaderManager.destroy();
          this.maskManager.destroy();
          this.stencilManager.destroy();
          this.filterManager.destroy();
          this.shaderManager = null;
          this.maskManager = null;
          this.filterManager = null;
          this.blendModeManager = null;
          this.handleContextLost = null;
          this.handleContextRestored = null;
          this._contextOptions = null;
          this.drawCount = 0;
          this.gl = null;
        };
        WebGLRenderer.prototype._mapBlendModes = function() {
          var gl = this.gl;
          if (!this.blendModes) {
            this.blendModes = {};
            this.blendModes[CONST.BLEND_MODES.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.ADD] = [gl.SRC_ALPHA, gl.DST_ALPHA];
            this.blendModes[CONST.BLEND_MODES.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.SCREEN] = [gl.SRC_ALPHA, gl.ONE];
            this.blendModes[CONST.BLEND_MODES.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[CONST.BLEND_MODES.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
          }
        };
      }, {
        "../../const": 22,
        "../../utils": 76,
        "../SystemRenderer": 42,
        "./filters/FXAAFilter": 50,
        "./managers/BlendModeManager": 52,
        "./managers/FilterManager": 53,
        "./managers/MaskManager": 54,
        "./managers/ShaderManager": 55,
        "./managers/StencilManager": 56,
        "./utils/ObjectRenderer": 62,
        "./utils/RenderTarget": 64
      }],
      49: [function(require, module, exports) {
        var DefaultShader = require('../shaders/TextureShader');
        function AbstractFilter(vertexSrc, fragmentSrc, uniforms) {
          this.shaders = [];
          this.padding = 0;
          this.uniforms = uniforms || {};
          this.vertexSrc = vertexSrc || DefaultShader.defaultVertexSrc;
          this.fragmentSrc = fragmentSrc || DefaultShader.defaultFragmentSrc;
        }
        AbstractFilter.prototype.constructor = AbstractFilter;
        module.exports = AbstractFilter;
        AbstractFilter.prototype.getShader = function(renderer) {
          var gl = renderer.gl;
          var shader = this.shaders[gl.id];
          if (!shader) {
            shader = new DefaultShader(renderer.shaderManager, this.vertexSrc, this.fragmentSrc, this.uniforms, this.attributes);
            this.shaders[gl.id] = shader;
          }
          return shader;
        };
        AbstractFilter.prototype.applyFilter = function(renderer, input, output, clear) {
          var shader = this.getShader(renderer);
          renderer.filterManager.applyFilter(shader, input, output, clear);
        };
        AbstractFilter.prototype.syncUniform = function(uniform) {
          for (var i = 0,
              j = this.shaders.length; i < j; ++i) {
            this.shaders[i].syncUniform(uniform);
          }
        };
      }, {"../shaders/TextureShader": 61}],
      50: [function(require, module, exports) {
        var AbstractFilter = require('./AbstractFilter');
        function FXAAFilter() {
          AbstractFilter.call(this, "\nprecision mediump float;\n\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform vec2 resolution;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvarying vec2 vResolution;\n\n//texcoords computed in vertex step\n//to avoid dependent texture reads\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\n\nvoid texcoords(vec2 fragCoord, vec2 resolution,\n            out vec2 v_rgbNW, out vec2 v_rgbNE,\n            out vec2 v_rgbSW, out vec2 v_rgbSE,\n            out vec2 v_rgbM) {\n    vec2 inverseVP = 1.0 / resolution.xy;\n    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n    v_rgbM = vec2(fragCoord * inverseVP);\n}\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n   vResolution = resolution;\n\n   //compute the texture coords and send them to varyings\n   texcoords(aTextureCoord * resolution, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n}\n", "precision lowp float;\n\n\n/**\nBasic FXAA implementation based on the code on geeks3d.com with the\nmodification that the texture2DLod stuff was removed since it's\nunsupported by WebGL.\n\n--\n\nFrom:\nhttps://github.com/mitsuhiko/webgl-meincraft\n\nCopyright (c) 2011 by Armin Ronacher.\n\nSome rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are\nmet:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n\n    * Redistributions in binary form must reproduce the above\n      copyright notice, this list of conditions and the following\n      disclaimer in the documentation and/or other materials provided\n      with the distribution.\n\n    * The names of the contributors may not be used to endorse or\n      promote products derived from this software without specific\n      prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\nOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\nSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\nLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\nDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\nTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\n#ifndef FXAA_REDUCE_MIN\n    #define FXAA_REDUCE_MIN   (1.0/ 128.0)\n#endif\n#ifndef FXAA_REDUCE_MUL\n    #define FXAA_REDUCE_MUL   (1.0 / 8.0)\n#endif\n#ifndef FXAA_SPAN_MAX\n    #define FXAA_SPAN_MAX     8.0\n#endif\n\n//optimized version for mobile, where dependent\n//texture reads can be a bottleneck\nvec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,\n            vec2 v_rgbNW, vec2 v_rgbNE,\n            vec2 v_rgbSW, vec2 v_rgbSE,\n            vec2 v_rgbM) {\n    vec4 color;\n    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);\n    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;\n    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;\n    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;\n    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;\n    vec4 texColor = texture2D(tex, v_rgbM);\n    vec3 rgbM  = texColor.xyz;\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n    mediump vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\n    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n              dir * rcpDirMin)) * inverseVP;\n\n    vec3 rgbA = 0.5 * (\n        texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * 0.5 + 0.25 * (\n        texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n\n    float lumaB = dot(rgbB, luma);\n    if ((lumaB < lumaMin) || (lumaB > lumaMax))\n        color = vec4(rgbA, texColor.a);\n    else\n        color = vec4(rgbB, texColor.a);\n    return color;\n}\n\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vResolution;\n\n//texcoords computed in vertex step\n//to avoid dependent texture reads\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nuniform sampler2D uSampler;\n\n\nvoid main(void){\n\n    gl_FragColor = fxaa(uSampler, vTextureCoord * vResolution, vResolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n\n}\n", {resolution: {
              type: 'v2',
              value: {
                x: 1,
                y: 1
              }
            }});
        }
        FXAAFilter.prototype = Object.create(AbstractFilter.prototype);
        FXAAFilter.prototype.constructor = FXAAFilter;
        module.exports = FXAAFilter;
        FXAAFilter.prototype.applyFilter = function(renderer, input, output) {
          var filterManager = renderer.filterManager;
          var shader = this.getShader(renderer);
          filterManager.applyFilter(shader, input, output);
        };
      }, {"./AbstractFilter": 49}],
      51: [function(require, module, exports) {
        var AbstractFilter = require('./AbstractFilter'),
            math = require('../../../math');
        function SpriteMaskFilter(sprite) {
          var maskMatrix = new math.Matrix();
          AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n    vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\nuniform float alpha;\nuniform sampler2D mask;\n\nvoid main(void)\n{\n    // check clip! this will stop the mask bleeding out from the edges\n    vec2 text = abs( vMaskCoord - 0.5 );\n    text = step(0.5, text);\n    float clip = 1.0 - max(text.y, text.x);\n    vec4 original = texture2D(uSampler, vTextureCoord);\n    vec4 masky = texture2D(mask, vMaskCoord);\n    original *= (masky.r * masky.a * alpha * clip);\n    gl_FragColor = original;\n}\n", {
            mask: {
              type: 'sampler2D',
              value: sprite._texture
            },
            alpha: {
              type: 'f',
              value: 1
            },
            otherMatrix: {
              type: 'mat3',
              value: maskMatrix.toArray(true)
            }
          });
          this.maskSprite = sprite;
          this.maskMatrix = maskMatrix;
        }
        SpriteMaskFilter.prototype = Object.create(AbstractFilter.prototype);
        SpriteMaskFilter.prototype.constructor = SpriteMaskFilter;
        module.exports = SpriteMaskFilter;
        SpriteMaskFilter.prototype.applyFilter = function(renderer, input, output) {
          var filterManager = renderer.filterManager;
          this.uniforms.mask.value = this.maskSprite._texture;
          filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);
          this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);
          this.uniforms.alpha.value = this.maskSprite.worldAlpha;
          var shader = this.getShader(renderer);
          filterManager.applyFilter(shader, input, output);
        };
        Object.defineProperties(SpriteMaskFilter.prototype, {
          map: {
            get: function() {
              return this.uniforms.mask.value;
            },
            set: function(value) {
              this.uniforms.mask.value = value;
            }
          },
          offset: {
            get: function() {
              return this.uniforms.offset.value;
            },
            set: function(value) {
              this.uniforms.offset.value = value;
            }
          }
        });
      }, {
        "../../../math": 32,
        "./AbstractFilter": 49
      }],
      52: [function(require, module, exports) {
        var WebGLManager = require('./WebGLManager');
        function BlendModeManager(renderer) {
          WebGLManager.call(this, renderer);
          this.currentBlendMode = 99999;
        }
        BlendModeManager.prototype = Object.create(WebGLManager.prototype);
        BlendModeManager.prototype.constructor = BlendModeManager;
        module.exports = BlendModeManager;
        BlendModeManager.prototype.setBlendMode = function(blendMode) {
          if (this.currentBlendMode === blendMode) {
            return false;
          }
          this.currentBlendMode = blendMode;
          var mode = this.renderer.blendModes[this.currentBlendMode];
          this.renderer.gl.blendFunc(mode[0], mode[1]);
          return true;
        };
      }, {"./WebGLManager": 57}],
      53: [function(require, module, exports) {
        var WebGLManager = require('./WebGLManager'),
            RenderTarget = require('../utils/RenderTarget'),
            CONST = require('../../../const'),
            Quad = require('../utils/Quad'),
            math = require('../../../math');
        function FilterManager(renderer) {
          WebGLManager.call(this, renderer);
          this.filterStack = [];
          this.filterStack.push({
            renderTarget: renderer.currentRenderTarget,
            filter: [],
            bounds: null
          });
          this.texturePool = [];
          this.textureSize = new math.Rectangle(0, 0, renderer.width, renderer.height);
          this.currentFrame = null;
        }
        FilterManager.prototype = Object.create(WebGLManager.prototype);
        FilterManager.prototype.constructor = FilterManager;
        module.exports = FilterManager;
        FilterManager.prototype.onContextChange = function() {
          this.texturePool.length = 0;
          var gl = this.renderer.gl;
          this.quad = new Quad(gl);
        };
        FilterManager.prototype.setFilterStack = function(filterStack) {
          this.filterStack = filterStack;
        };
        FilterManager.prototype.pushFilter = function(target, filters) {
          var bounds = target.filterArea ? target.filterArea.clone() : target.getBounds();
          bounds.x = bounds.x | 0;
          bounds.y = bounds.y | 0;
          bounds.width = bounds.width | 0;
          bounds.height = bounds.height | 0;
          var padding = filters[0].padding | 0;
          bounds.x -= padding;
          bounds.y -= padding;
          bounds.width += padding * 2;
          bounds.height += padding * 2;
          if (this.renderer.currentRenderTarget.transform) {
            var transform = this.renderer.currentRenderTarget.transform;
            bounds.x += transform.tx;
            bounds.y += transform.ty;
            this.capFilterArea(bounds);
            bounds.x -= transform.tx;
            bounds.y -= transform.ty;
          } else {
            this.capFilterArea(bounds);
          }
          if (bounds.width > 0 && bounds.height > 0) {
            this.currentFrame = bounds;
            var texture = this.getRenderTarget();
            this.renderer.setRenderTarget(texture);
            texture.clear();
            this.filterStack.push({
              renderTarget: texture,
              filter: filters
            });
          } else {
            this.filterStack.push({
              renderTarget: null,
              filter: filters
            });
          }
        };
        FilterManager.prototype.popFilter = function() {
          var filterData = this.filterStack.pop();
          var previousFilterData = this.filterStack[this.filterStack.length - 1];
          var input = filterData.renderTarget;
          if (!filterData.renderTarget) {
            return;
          }
          var output = previousFilterData.renderTarget;
          var gl = this.renderer.gl;
          this.currentFrame = input.frame;
          this.quad.map(this.textureSize, input.frame);
          gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.vertexBuffer);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quad.indexBuffer);
          var filters = filterData.filter;
          gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
          gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 2 * 4 * 4);
          gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aColor, 4, gl.FLOAT, false, 0, 4 * 4 * 4);
          this.renderer.blendModeManager.setBlendMode(CONST.BLEND_MODES.NORMAL);
          if (filters.length === 1) {
            if (filters[0].uniforms.dimensions) {
              filters[0].uniforms.dimensions.value[0] = this.renderer.width;
              filters[0].uniforms.dimensions.value[1] = this.renderer.height;
              filters[0].uniforms.dimensions.value[2] = this.quad.vertices[0];
              filters[0].uniforms.dimensions.value[3] = this.quad.vertices[5];
            }
            filters[0].applyFilter(this.renderer, input, output);
            this.returnRenderTarget(input);
          } else {
            var flipTexture = input;
            var flopTexture = this.getRenderTarget(true);
            for (var i = 0; i < filters.length - 1; i++) {
              var filter = filters[i];
              if (filter.uniforms.dimensions) {
                filter.uniforms.dimensions.value[0] = this.renderer.width;
                filter.uniforms.dimensions.value[1] = this.renderer.height;
                filter.uniforms.dimensions.value[2] = this.quad.vertices[0];
                filter.uniforms.dimensions.value[3] = this.quad.vertices[5];
              }
              filter.applyFilter(this.renderer, flipTexture, flopTexture);
              var temp = flipTexture;
              flipTexture = flopTexture;
              flopTexture = temp;
            }
            filters[filters.length - 1].applyFilter(this.renderer, flipTexture, output);
            this.returnRenderTarget(flipTexture);
            this.returnRenderTarget(flopTexture);
          }
          return filterData.filter;
        };
        FilterManager.prototype.getRenderTarget = function(clear) {
          var renderTarget = this.texturePool.pop() || new RenderTarget(this.renderer.gl, this.textureSize.width, this.textureSize.height, CONST.SCALE_MODES.LINEAR, this.renderer.resolution * CONST.FILTER_RESOLUTION);
          renderTarget.frame = this.currentFrame;
          if (clear) {
            renderTarget.clear(true);
          }
          return renderTarget;
        };
        FilterManager.prototype.returnRenderTarget = function(renderTarget) {
          this.texturePool.push(renderTarget);
        };
        FilterManager.prototype.applyFilter = function(shader, inputTarget, outputTarget, clear) {
          var gl = this.renderer.gl;
          this.renderer.setRenderTarget(outputTarget);
          if (clear) {
            outputTarget.clear();
          }
          this.renderer.shaderManager.setShader(shader);
          shader.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(true);
          shader.syncUniforms();
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, inputTarget.texture);
          gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        };
        FilterManager.prototype.calculateMappedMatrix = function(filterArea, sprite, outputMatrix) {
          var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
              texture = sprite._texture.baseTexture;
          var mappedMatrix = outputMatrix.identity();
          var ratio = this.textureSize.height / this.textureSize.width;
          mappedMatrix.translate(filterArea.x / this.textureSize.width, filterArea.y / this.textureSize.height);
          mappedMatrix.scale(1, ratio);
          var translateScaleX = (this.textureSize.width / texture.width);
          var translateScaleY = (this.textureSize.height / texture.height);
          worldTransform.tx /= texture.width * translateScaleX;
          worldTransform.ty /= texture.width * translateScaleX;
          worldTransform.invert();
          mappedMatrix.prepend(worldTransform);
          mappedMatrix.scale(1, 1 / ratio);
          mappedMatrix.scale(translateScaleX, translateScaleY);
          mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);
          return mappedMatrix;
        };
        FilterManager.prototype.capFilterArea = function(filterArea) {
          if (filterArea.x < 0) {
            filterArea.width += filterArea.x;
            filterArea.x = 0;
          }
          if (filterArea.y < 0) {
            filterArea.height += filterArea.y;
            filterArea.y = 0;
          }
          if (filterArea.x + filterArea.width > this.textureSize.width) {
            filterArea.width = this.textureSize.width - filterArea.x;
          }
          if (filterArea.y + filterArea.height > this.textureSize.height) {
            filterArea.height = this.textureSize.height - filterArea.y;
          }
        };
        FilterManager.prototype.resize = function(width, height) {
          this.textureSize.width = width;
          this.textureSize.height = height;
          for (var i = 0; i < this.texturePool.length; i++) {
            this.texturePool[i].resize(width, height);
          }
        };
        FilterManager.prototype.destroy = function() {
          this.filterStack = null;
          this.offsetY = 0;
          for (var i = 0; i < this.texturePool.length; i++) {
            this.texturePool[i].destroy();
          }
          this.texturePool = null;
        };
      }, {
        "../../../const": 22,
        "../../../math": 32,
        "../utils/Quad": 63,
        "../utils/RenderTarget": 64,
        "./WebGLManager": 57
      }],
      54: [function(require, module, exports) {
        var WebGLManager = require('./WebGLManager'),
            AlphaMaskFilter = require('../filters/SpriteMaskFilter');
        function MaskManager(renderer) {
          WebGLManager.call(this, renderer);
          this.stencilStack = [];
          this.reverse = true;
          this.count = 0;
          this.alphaMaskPool = [];
        }
        MaskManager.prototype = Object.create(WebGLManager.prototype);
        MaskManager.prototype.constructor = MaskManager;
        module.exports = MaskManager;
        MaskManager.prototype.pushMask = function(target, maskData) {
          if (maskData.texture) {
            this.pushSpriteMask(target, maskData);
          } else {
            this.pushStencilMask(target, maskData);
          }
        };
        MaskManager.prototype.popMask = function(target, maskData) {
          if (maskData.texture) {
            this.popSpriteMask(target, maskData);
          } else {
            this.popStencilMask(target, maskData);
          }
        };
        MaskManager.prototype.pushSpriteMask = function(target, maskData) {
          var alphaMaskFilter = this.alphaMaskPool.pop();
          if (!alphaMaskFilter) {
            alphaMaskFilter = [new AlphaMaskFilter(maskData)];
          }
          alphaMaskFilter[0].maskSprite = maskData;
          this.renderer.filterManager.pushFilter(target, alphaMaskFilter);
        };
        MaskManager.prototype.popSpriteMask = function() {
          var filters = this.renderer.filterManager.popFilter();
          this.alphaMaskPool.push(filters);
        };
        MaskManager.prototype.pushStencilMask = function(target, maskData) {
          this.renderer.stencilManager.pushMask(maskData);
        };
        MaskManager.prototype.popStencilMask = function(target, maskData) {
          this.renderer.stencilManager.popMask(maskData);
        };
      }, {
        "../filters/SpriteMaskFilter": 51,
        "./WebGLManager": 57
      }],
      55: [function(require, module, exports) {
        var WebGLManager = require('./WebGLManager'),
            TextureShader = require('../shaders/TextureShader'),
            ComplexPrimitiveShader = require('../shaders/ComplexPrimitiveShader'),
            PrimitiveShader = require('../shaders/PrimitiveShader'),
            utils = require('../../../utils');
        function ShaderManager(renderer) {
          WebGLManager.call(this, renderer);
          this.maxAttibs = 10;
          this.attribState = [];
          this.tempAttribState = [];
          for (var i = 0; i < this.maxAttibs; i++) {
            this.attribState[i] = false;
          }
          this.stack = [];
          this._currentId = -1;
          this.currentShader = null;
        }
        ShaderManager.prototype = Object.create(WebGLManager.prototype);
        ShaderManager.prototype.constructor = ShaderManager;
        utils.pluginTarget.mixin(ShaderManager);
        module.exports = ShaderManager;
        ShaderManager.prototype.onContextChange = function() {
          this.initPlugins();
          var gl = this.renderer.gl;
          this.maxAttibs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
          this.attribState = [];
          for (var i = 0; i < this.maxAttibs; i++) {
            this.attribState[i] = false;
          }
          this.defaultShader = new TextureShader(this);
          this.primitiveShader = new PrimitiveShader(this);
          this.complexPrimitiveShader = new ComplexPrimitiveShader(this);
        };
        ShaderManager.prototype.setAttribs = function(attribs) {
          var i;
          for (i = 0; i < this.tempAttribState.length; i++) {
            this.tempAttribState[i] = false;
          }
          for (var a in attribs) {
            this.tempAttribState[attribs[a]] = true;
          }
          var gl = this.renderer.gl;
          for (i = 0; i < this.attribState.length; i++) {
            if (this.attribState[i] !== this.tempAttribState[i]) {
              this.attribState[i] = this.tempAttribState[i];
              if (this.attribState[i]) {
                gl.enableVertexAttribArray(i);
              } else {
                gl.disableVertexAttribArray(i);
              }
            }
          }
        };
        ShaderManager.prototype.setShader = function(shader) {
          if (this._currentId === shader.uuid) {
            return false;
          }
          this._currentId = shader.uuid;
          this.currentShader = shader;
          this.renderer.gl.useProgram(shader.program);
          this.setAttribs(shader.attributes);
          return true;
        };
        ShaderManager.prototype.destroy = function() {
          WebGLManager.prototype.destroy.call(this);
          this.destroyPlugins();
          this.attribState = null;
          this.tempAttribState = null;
        };
      }, {
        "../../../utils": 76,
        "../shaders/ComplexPrimitiveShader": 58,
        "../shaders/PrimitiveShader": 59,
        "../shaders/TextureShader": 61,
        "./WebGLManager": 57
      }],
      56: [function(require, module, exports) {
        var WebGLManager = require('./WebGLManager'),
            utils = require('../../../utils');
        function WebGLMaskManager(renderer) {
          WebGLManager.call(this, renderer);
          this.stencilMaskStack = null;
        }
        WebGLMaskManager.prototype = Object.create(WebGLManager.prototype);
        WebGLMaskManager.prototype.constructor = WebGLMaskManager;
        module.exports = WebGLMaskManager;
        WebGLMaskManager.prototype.setMaskStack = function(stencilMaskStack) {
          this.stencilMaskStack = stencilMaskStack;
          var gl = this.renderer.gl;
          if (stencilMaskStack.stencilStack.length === 0) {
            gl.disable(gl.STENCIL_TEST);
          } else {
            gl.enable(gl.STENCIL_TEST);
          }
        };
        WebGLMaskManager.prototype.pushStencil = function(graphics, webGLData) {
          this.renderer.currentRenderTarget.attachStencilBuffer();
          var gl = this.renderer.gl,
              sms = this.stencilMaskStack;
          this.bindGraphics(graphics, webGLData, this.renderer);
          if (sms.stencilStack.length === 0) {
            gl.enable(gl.STENCIL_TEST);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            sms.reverse = true;
            sms.count = 0;
          }
          sms.stencilStack.push(webGLData);
          var level = sms.count;
          gl.colorMask(false, false, false, false);
          gl.stencilFunc(gl.ALWAYS, 0, 0xFF);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
          if (webGLData.mode === 1) {
            gl.drawElements(gl.TRIANGLE_FAN, webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0);
            if (sms.reverse) {
              gl.stencilFunc(gl.EQUAL, 0xFF - level, 0xFF);
              gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
            } else {
              gl.stencilFunc(gl.EQUAL, level, 0xFF);
              gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
            }
            gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
            if (sms.reverse) {
              gl.stencilFunc(gl.EQUAL, 0xFF - (level + 1), 0xFF);
            } else {
              gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
            }
            sms.reverse = !sms.reverse;
          } else {
            if (!sms.reverse) {
              gl.stencilFunc(gl.EQUAL, 0xFF - level, 0xFF);
              gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
            } else {
              gl.stencilFunc(gl.EQUAL, level, 0xFF);
              gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
            }
            gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
            if (!sms.reverse) {
              gl.stencilFunc(gl.EQUAL, 0xFF - (level + 1), 0xFF);
            } else {
              gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
            }
          }
          gl.colorMask(true, true, true, true);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
          sms.count++;
        };
        WebGLMaskManager.prototype.bindGraphics = function(graphics, webGLData) {
          this._currentGraphics = graphics;
          var gl = this.renderer.gl;
          var shader;
          if (webGLData.mode === 1) {
            shader = this.renderer.shaderManager.complexPrimitiveShader;
            this.renderer.shaderManager.setShader(shader);
            gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));
            gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, this.renderer.currentRenderTarget.projectionMatrix.toArray(true));
            gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));
            gl.uniform3fv(shader.uniforms.color._location, webGLData.color);
            gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);
            gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 2, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
          } else {
            shader = this.renderer.shaderManager.primitiveShader;
            this.renderer.shaderManager.setShader(shader);
            gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));
            gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, this.renderer.currentRenderTarget.projectionMatrix.toArray(true));
            gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));
            gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);
            gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
            gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
          }
        };
        WebGLMaskManager.prototype.popStencil = function(graphics, webGLData) {
          var gl = this.renderer.gl,
              sms = this.stencilMaskStack;
          sms.stencilStack.pop();
          sms.count--;
          if (sms.stencilStack.length === 0) {
            gl.disable(gl.STENCIL_TEST);
          } else {
            var level = sms.count;
            this.bindGraphics(graphics, webGLData, this.renderer);
            gl.colorMask(false, false, false, false);
            if (webGLData.mode === 1) {
              sms.reverse = !sms.reverse;
              if (sms.reverse) {
                gl.stencilFunc(gl.EQUAL, 0xFF - (level + 1), 0xFF);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
              } else {
                gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
              }
              gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
              gl.stencilFunc(gl.ALWAYS, 0, 0xFF);
              gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
              gl.drawElements(gl.TRIANGLE_FAN, webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0);
              if (!sms.reverse) {
                gl.stencilFunc(gl.EQUAL, 0xFF - (level), 0xFF);
              } else {
                gl.stencilFunc(gl.EQUAL, level, 0xFF);
              }
            } else {
              if (!sms.reverse) {
                gl.stencilFunc(gl.EQUAL, 0xFF - (level + 1), 0xFF);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
              } else {
                gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
              }
              gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
              if (!sms.reverse) {
                gl.stencilFunc(gl.EQUAL, 0xFF - (level), 0xFF);
              } else {
                gl.stencilFunc(gl.EQUAL, level, 0xFF);
              }
            }
            gl.colorMask(true, true, true, true);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
          }
        };
        WebGLMaskManager.prototype.destroy = function() {
          WebGLManager.prototype.destroy.call(this);
          this.stencilMaskStack.stencilStack = null;
        };
        WebGLMaskManager.prototype.pushMask = function(maskData) {
          this.renderer.setObjectRenderer(this.renderer.plugins.graphics);
          if (maskData.dirty) {
            this.renderer.plugins.graphics.updateGraphics(maskData, this.renderer.gl);
          }
          if (!maskData._webGL[this.renderer.gl.id].data.length) {
            return;
          }
          this.pushStencil(maskData, maskData._webGL[this.renderer.gl.id].data[0], this.renderer);
        };
        WebGLMaskManager.prototype.popMask = function(maskData) {
          this.renderer.setObjectRenderer(this.renderer.plugins.graphics);
          this.popStencil(maskData, maskData._webGL[this.renderer.gl.id].data[0], this.renderer);
        };
      }, {
        "../../../utils": 76,
        "./WebGLManager": 57
      }],
      57: [function(require, module, exports) {
        function WebGLManager(renderer) {
          this.renderer = renderer;
          this.renderer.on('context', this.onContextChange, this);
        }
        WebGLManager.prototype.constructor = WebGLManager;
        module.exports = WebGLManager;
        WebGLManager.prototype.onContextChange = function() {};
        WebGLManager.prototype.destroy = function() {
          this.renderer.off('context', this.onContextChange, this);
          this.renderer = null;
        };
      }, {}],
      58: [function(require, module, exports) {
        var Shader = require('./Shader');
        function ComplexPrimitiveShader(shaderManager) {
          Shader.call(this, shaderManager, ['attribute vec2 aVertexPosition;', 'uniform mat3 translationMatrix;', 'uniform mat3 projectionMatrix;', 'uniform vec3 tint;', 'uniform float alpha;', 'uniform vec3 color;', 'varying vec4 vColor;', 'void main(void){', '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);', '   vColor = vec4(color * alpha * tint, alpha);', '}'].join('\n'), ['precision mediump float;', 'varying vec4 vColor;', 'void main(void){', '   gl_FragColor = vColor;', '}'].join('\n'), {
            tint: {
              type: '3f',
              value: [0, 0, 0]
            },
            alpha: {
              type: '1f',
              value: 0
            },
            color: {
              type: '3f',
              value: [0, 0, 0]
            },
            translationMatrix: {
              type: 'mat3',
              value: new Float32Array(9)
            },
            projectionMatrix: {
              type: 'mat3',
              value: new Float32Array(9)
            }
          }, {aVertexPosition: 0});
        }
        ComplexPrimitiveShader.prototype = Object.create(Shader.prototype);
        ComplexPrimitiveShader.prototype.constructor = ComplexPrimitiveShader;
        module.exports = ComplexPrimitiveShader;
      }, {"./Shader": 60}],
      59: [function(require, module, exports) {
        var Shader = require('./Shader');
        function PrimitiveShader(shaderManager) {
          Shader.call(this, shaderManager, ['attribute vec2 aVertexPosition;', 'attribute vec4 aColor;', 'uniform mat3 translationMatrix;', 'uniform mat3 projectionMatrix;', 'uniform float alpha;', 'uniform float flipY;', 'uniform vec3 tint;', 'varying vec4 vColor;', 'void main(void){', '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);', '   vColor = aColor * vec4(tint * alpha, alpha);', '}'].join('\n'), ['precision mediump float;', 'varying vec4 vColor;', 'void main(void){', '   gl_FragColor = vColor;', '}'].join('\n'), {
            tint: {
              type: '3f',
              value: [0, 0, 0]
            },
            alpha: {
              type: '1f',
              value: 0
            },
            translationMatrix: {
              type: 'mat3',
              value: new Float32Array(9)
            },
            projectionMatrix: {
              type: 'mat3',
              value: new Float32Array(9)
            }
          }, {
            aVertexPosition: 0,
            aColor: 0
          });
        }
        PrimitiveShader.prototype = Object.create(Shader.prototype);
        PrimitiveShader.prototype.constructor = PrimitiveShader;
        module.exports = PrimitiveShader;
      }, {"./Shader": 60}],
      60: [function(require, module, exports) {
        var utils = require('../../../utils');
        function Shader(shaderManager, vertexSrc, fragmentSrc, uniforms, attributes) {
          if (!vertexSrc || !fragmentSrc) {
            throw new Error('Pixi.js Error. Shader requires vertexSrc and fragmentSrc');
          }
          this.uuid = utils.uuid();
          this.gl = shaderManager.renderer.gl;
          this.shaderManager = shaderManager;
          this.program = null;
          this.uniforms = uniforms || {};
          this.attributes = attributes || {};
          this.textureCount = 1;
          this.vertexSrc = vertexSrc;
          this.fragmentSrc = fragmentSrc;
          this.init();
        }
        Shader.prototype.constructor = Shader;
        module.exports = Shader;
        Shader.prototype.init = function() {
          this.compile();
          this.gl.useProgram(this.program);
          this.cacheUniformLocations(Object.keys(this.uniforms));
          this.cacheAttributeLocations(Object.keys(this.attributes));
        };
        Shader.prototype.cacheUniformLocations = function(keys) {
          for (var i = 0; i < keys.length; ++i) {
            this.uniforms[keys[i]]._location = this.gl.getUniformLocation(this.program, keys[i]);
          }
        };
        Shader.prototype.cacheAttributeLocations = function(keys) {
          for (var i = 0; i < keys.length; ++i) {
            this.attributes[keys[i]] = this.gl.getAttribLocation(this.program, keys[i]);
          }
        };
        Shader.prototype.compile = function() {
          var gl = this.gl;
          var glVertShader = this._glCompile(gl.VERTEX_SHADER, this.vertexSrc);
          var glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this.fragmentSrc);
          var program = gl.createProgram();
          gl.attachShader(program, glVertShader);
          gl.attachShader(program, glFragShader);
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Pixi.js Error: Could not initialize shader.');
            console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS));
            console.error('gl.getError()', gl.getError());
            if (gl.getProgramInfoLog(program) !== '') {
              console.warn('Pixi.js Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(program));
            }
            gl.deleteProgram(program);
            program = null;
          }
          gl.deleteShader(glVertShader);
          gl.deleteShader(glFragShader);
          return (this.program = program);
        };
        Shader.prototype.syncUniform = function(uniform) {
          var location = uniform._location,
              value = uniform.value,
              gl = this.gl,
              i,
              il;
          switch (uniform.type) {
            case 'i':
            case '1i':
              gl.uniform1i(location, value);
              break;
            case 'f':
            case '1f':
              gl.uniform1f(location, value);
              break;
            case '2f':
              gl.uniform2f(location, value[0], value[1]);
              break;
            case '3f':
              gl.uniform3f(location, value[0], value[1], value[2]);
              break;
            case '4f':
              gl.uniform4f(location, value[0], value[1], value[2], value[3]);
              break;
            case 'v2':
              gl.uniform2f(location, value.x, value.y);
              break;
            case 'v3':
              gl.uniform3f(location, value.x, value.y, value.z);
              break;
            case 'v4':
              gl.uniform4f(location, value.x, value.y, value.z, value.w);
              break;
            case '1iv':
              gl.uniform1iv(location, value);
              break;
            case '2iv':
              gl.uniform2iv(location, value);
              break;
            case '3iv':
              gl.uniform3iv(location, value);
              break;
            case '4iv':
              gl.uniform4iv(location, value);
              break;
            case '1fv':
              gl.uniform1fv(location, value);
              break;
            case '2fv':
              gl.uniform2fv(location, value);
              break;
            case '3fv':
              gl.uniform3fv(location, value);
              break;
            case '4fv':
              gl.uniform4fv(location, value);
              break;
            case 'm2':
            case 'mat2':
            case 'Matrix2fv':
              gl.uniformMatrix2fv(location, uniform.transpose, value);
              break;
            case 'm3':
            case 'mat3':
            case 'Matrix3fv':
              gl.uniformMatrix3fv(location, uniform.transpose, value);
              break;
            case 'm4':
            case 'mat4':
            case 'Matrix4fv':
              gl.uniformMatrix4fv(location, uniform.transpose, value);
              break;
            case 'c':
              if (typeof value === 'number') {
                value = utils.hex2rgb(value);
              }
              gl.uniform3f(location, value[0], value[1], value[2]);
              break;
            case 'iv1':
              gl.uniform1iv(location, value);
              break;
            case 'iv':
              gl.uniform3iv(location, value);
              break;
            case 'fv1':
              gl.uniform1fv(location, value);
              break;
            case 'fv':
              gl.uniform3fv(location, value);
              break;
            case 'v2v':
              if (!uniform._array) {
                uniform._array = new Float32Array(2 * value.length);
              }
              for (i = 0, il = value.length; i < il; ++i) {
                uniform._array[i * 2] = value[i].x;
                uniform._array[i * 2 + 1] = value[i].y;
              }
              gl.uniform2fv(location, uniform._array);
              break;
            case 'v3v':
              if (!uniform._array) {
                uniform._array = new Float32Array(3 * value.length);
              }
              for (i = 0, il = value.length; i < il; ++i) {
                uniform._array[i * 3] = value[i].x;
                uniform._array[i * 3 + 1] = value[i].y;
                uniform._array[i * 3 + 2] = value[i].z;
              }
              gl.uniform3fv(location, uniform._array);
              break;
            case 'v4v':
              if (!uniform._array) {
                uniform._array = new Float32Array(4 * value.length);
              }
              for (i = 0, il = value.length; i < il; ++i) {
                uniform._array[i * 4] = value[i].x;
                uniform._array[i * 4 + 1] = value[i].y;
                uniform._array[i * 4 + 2] = value[i].z;
                uniform._array[i * 4 + 3] = value[i].w;
              }
              gl.uniform4fv(location, uniform._array);
              break;
            case 't':
            case 'sampler2D':
              if (!uniform.value || !uniform.value.baseTexture.hasLoaded) {
                break;
              }
              gl.activeTexture(gl['TEXTURE' + this.textureCount]);
              var texture = uniform.value.baseTexture._glTextures[gl.id];
              if (!texture) {
                this.initSampler2D(uniform);
                texture = uniform.value.baseTexture._glTextures[gl.id];
              }
              gl.bindTexture(gl.TEXTURE_2D, texture);
              gl.uniform1i(uniform._location, this.textureCount);
              this.textureCount++;
              break;
            default:
              console.warn('Pixi.js Shader Warning: Unknown uniform type: ' + uniform.type);
          }
        };
        Shader.prototype.syncUniforms = function() {
          this.textureCount = 1;
          for (var key in this.uniforms) {
            this.syncUniform(this.uniforms[key]);
          }
        };
        Shader.prototype.initSampler2D = function(uniform) {
          var gl = this.gl;
          var texture = uniform.value.baseTexture;
          if (!texture.hasLoaded) {
            return;
          }
          if (uniform.textureData) {
            var data = uniform.textureData;
            texture._glTextures[gl.id] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
            gl.texImage2D(gl.TEXTURE_2D, 0, data.luminance ? gl.LUMINANCE : gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, data.magFilter ? data.magFilter : gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, data.wrapS ? data.wrapS : gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, data.wrapS ? data.wrapS : gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, data.wrapT ? data.wrapT : gl.CLAMP_TO_EDGE);
          } else {
            this.shaderManager.renderer.updateTexture(texture);
          }
        };
        Shader.prototype.destroy = function() {
          this.gl.deleteProgram(this.program);
          this.gl = null;
          this.uniforms = null;
          this.attributes = null;
          this.vertexSrc = null;
          this.fragmentSrc = null;
        };
        Shader.prototype._glCompile = function(type, src) {
          var shader = this.gl.createShader(type);
          this.gl.shaderSource(shader, src);
          this.gl.compileShader(shader);
          if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader));
            return null;
          }
          return shader;
        };
      }, {"../../../utils": 76}],
      61: [function(require, module, exports) {
        var Shader = require('./Shader');
        function TextureShader(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes) {
          var uniforms = {
            uSampler: {
              type: 'sampler2D',
              value: 0
            },
            projectionMatrix: {
              type: 'mat3',
              value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1])
            }
          };
          if (customUniforms) {
            for (var u in customUniforms) {
              uniforms[u] = customUniforms[u];
            }
          }
          var attributes = {
            aVertexPosition: 0,
            aTextureCoord: 0,
            aColor: 0
          };
          if (customAttributes) {
            for (var a in customAttributes) {
              attributes[a] = customAttributes[a];
            }
          }
          vertexSrc = vertexSrc || TextureShader.defaultVertexSrc;
          fragmentSrc = fragmentSrc || TextureShader.defaultFragmentSrc;
          Shader.call(this, shaderManager, vertexSrc, fragmentSrc, uniforms, attributes);
        }
        TextureShader.prototype = Object.create(Shader.prototype);
        TextureShader.prototype.constructor = TextureShader;
        module.exports = TextureShader;
        TextureShader.defaultVertexSrc = ['precision lowp float;', 'attribute vec2 aVertexPosition;', 'attribute vec2 aTextureCoord;', 'attribute vec4 aColor;', 'uniform mat3 projectionMatrix;', 'varying vec2 vTextureCoord;', 'varying vec4 vColor;', 'void main(void){', '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);', '   vTextureCoord = aTextureCoord;', '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);', '}'].join('\n');
        TextureShader.defaultFragmentSrc = ['precision lowp float;', 'varying vec2 vTextureCoord;', 'varying vec4 vColor;', 'uniform sampler2D uSampler;', 'void main(void){', '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;', '}'].join('\n');
      }, {"./Shader": 60}],
      62: [function(require, module, exports) {
        var WebGLManager = require('../managers/WebGLManager');
        function ObjectRenderer(renderer) {
          WebGLManager.call(this, renderer);
        }
        ObjectRenderer.prototype = Object.create(WebGLManager.prototype);
        ObjectRenderer.prototype.constructor = ObjectRenderer;
        module.exports = ObjectRenderer;
        ObjectRenderer.prototype.start = function() {};
        ObjectRenderer.prototype.stop = function() {
          this.flush();
        };
        ObjectRenderer.prototype.flush = function() {};
        ObjectRenderer.prototype.render = function(object) {};
      }, {"../managers/WebGLManager": 57}],
      63: [function(require, module, exports) {
        function Quad(gl) {
          this.gl = gl;
          this.vertices = new Float32Array([0, 0, 200, 0, 200, 200, 0, 200]);
          this.uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
          this.colors = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
          this.indices = new Uint16Array([0, 1, 2, 0, 3, 2]);
          this.vertexBuffer = gl.createBuffer();
          this.indexBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, (8 + 8 + 16) * 4, gl.DYNAMIC_DRAW);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
          this.upload();
        }
        Quad.prototype.constructor = Quad;
        Quad.prototype.map = function(rect, rect2) {
          var x = 0;
          var y = 0;
          this.uvs[0] = x;
          this.uvs[1] = y;
          this.uvs[2] = x + rect2.width / rect.width;
          this.uvs[3] = y;
          this.uvs[4] = x + rect2.width / rect.width;
          this.uvs[5] = y + rect2.height / rect.height;
          this.uvs[6] = x;
          this.uvs[7] = y + rect2.height / rect.height;
          x = rect2.x;
          y = rect2.y;
          this.vertices[0] = x;
          this.vertices[1] = y;
          this.vertices[2] = x + rect2.width;
          this.vertices[3] = y;
          this.vertices[4] = x + rect2.width;
          this.vertices[5] = y + rect2.height;
          this.vertices[6] = x;
          this.vertices[7] = y + rect2.height;
          this.upload();
        };
        Quad.prototype.upload = function() {
          var gl = this.gl;
          gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
          gl.bufferSubData(gl.ARRAY_BUFFER, 8 * 4, this.uvs);
          gl.bufferSubData(gl.ARRAY_BUFFER, (8 + 8) * 4, this.colors);
        };
        module.exports = Quad;
      }, {}],
      64: [function(require, module, exports) {
        var math = require('../../../math'),
            utils = require('../../../utils'),
            CONST = require('../../../const'),
            StencilMaskStack = require('./StencilMaskStack');
        var RenderTarget = function(gl, width, height, scaleMode, resolution, root) {
          this.gl = gl;
          this.frameBuffer = null;
          this.texture = null;
          this.size = new math.Rectangle(0, 0, 1, 1);
          this.resolution = resolution || CONST.RESOLUTION;
          this.projectionMatrix = new math.Matrix();
          this.transform = null;
          this.frame = null;
          this.stencilBuffer = null;
          this.stencilMaskStack = new StencilMaskStack();
          this.filterStack = [{
            renderTarget: this,
            filter: [],
            bounds: this.size
          }];
          this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
          this.root = root;
          if (!this.root) {
            this.frameBuffer = gl.createFramebuffer();
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
            var isPowerOfTwo = utils.isPowerOfTwo(width, height);
            if (!isPowerOfTwo) {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            } else {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
          }
          this.resize(width, height);
        };
        RenderTarget.prototype.constructor = RenderTarget;
        module.exports = RenderTarget;
        RenderTarget.prototype.clear = function(bind) {
          var gl = this.gl;
          if (bind) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
          }
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        };
        RenderTarget.prototype.attachStencilBuffer = function() {
          if (this.stencilBuffer) {
            return;
          }
          if (!this.root) {
            var gl = this.gl;
            this.stencilBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencilBuffer);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.stencilBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.size.width * this.resolution, this.size.height * this.resolution);
          }
        };
        RenderTarget.prototype.activate = function() {
          var gl = this.gl;
          gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
          var projectionFrame = this.frame || this.size;
          this.calculateProjection(projectionFrame);
          if (this.transform) {
            this.projectionMatrix.append(this.transform);
          }
          gl.viewport(0, 0, projectionFrame.width * this.resolution, projectionFrame.height * this.resolution);
        };
        RenderTarget.prototype.calculateProjection = function(projectionFrame) {
          var pm = this.projectionMatrix;
          pm.identity();
          if (!this.root) {
            pm.a = 1 / projectionFrame.width * 2;
            pm.d = 1 / projectionFrame.height * 2;
            pm.tx = -1 - projectionFrame.x * pm.a;
            pm.ty = -1 - projectionFrame.y * pm.d;
          } else {
            pm.a = 1 / projectionFrame.width * 2;
            pm.d = -1 / projectionFrame.height * 2;
            pm.tx = -1 - projectionFrame.x * pm.a;
            pm.ty = 1 - projectionFrame.y * pm.d;
          }
        };
        RenderTarget.prototype.resize = function(width, height) {
          width = width | 0;
          height = height | 0;
          if (this.size.width === width && this.size.height === height) {
            return;
          }
          this.size.width = width;
          this.size.height = height;
          if (!this.root) {
            var gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width * this.resolution, height * this.resolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            if (this.stencilBuffer) {
              gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencilBuffer);
              gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width * this.resolution, height * this.resolution);
            }
          }
          var projectionFrame = this.frame || this.size;
          this.calculateProjection(projectionFrame);
        };
        RenderTarget.prototype.destroy = function() {
          var gl = this.gl;
          gl.deleteFramebuffer(this.frameBuffer);
          gl.deleteTexture(this.texture);
          this.frameBuffer = null;
          this.texture = null;
        };
      }, {
        "../../../const": 22,
        "../../../math": 32,
        "../../../utils": 76,
        "./StencilMaskStack": 65
      }],
      65: [function(require, module, exports) {
        function StencilMaskStack() {
          this.stencilStack = [];
          this.reverse = true;
          this.count = 0;
        }
        StencilMaskStack.prototype.constructor = StencilMaskStack;
        module.exports = StencilMaskStack;
      }, {}],
      66: [function(require, module, exports) {
        var math = require('../math'),
            Texture = require('../textures/Texture'),
            Container = require('../display/Container'),
            CanvasTinter = require('../renderers/canvas/utils/CanvasTinter'),
            utils = require('../utils'),
            CONST = require('../const'),
            tempPoint = new math.Point();
        function Sprite(texture) {
          Container.call(this);
          this.anchor = new math.Point();
          this._texture = null;
          this._width = 0;
          this._height = 0;
          this.tint = 0xFFFFFF;
          this.blendMode = CONST.BLEND_MODES.NORMAL;
          this.shader = null;
          this.cachedTint = 0xFFFFFF;
          this.texture = texture || Texture.EMPTY;
        }
        Sprite.prototype = Object.create(Container.prototype);
        Sprite.prototype.constructor = Sprite;
        module.exports = Sprite;
        Object.defineProperties(Sprite.prototype, {
          width: {
            get: function() {
              return this.scale.x * this.texture._frame.width;
            },
            set: function(value) {
              this.scale.x = value / this.texture._frame.width;
              this._width = value;
            }
          },
          height: {
            get: function() {
              return this.scale.y * this.texture._frame.height;
            },
            set: function(value) {
              this.scale.y = value / this.texture._frame.height;
              this._height = value;
            }
          },
          texture: {
            get: function() {
              return this._texture;
            },
            set: function(value) {
              if (this._texture === value) {
                return;
              }
              this._texture = value;
              this.cachedTint = 0xFFFFFF;
              if (value) {
                if (value.baseTexture.hasLoaded) {
                  this._onTextureUpdate();
                } else {
                  value.once('update', this._onTextureUpdate, this);
                }
              }
            }
          }
        });
        Sprite.prototype._onTextureUpdate = function() {
          if (this._width) {
            this.scale.x = this._width / this.texture.frame.width;
          }
          if (this._height) {
            this.scale.y = this._height / this.texture.frame.height;
          }
        };
        Sprite.prototype._renderWebGL = function(renderer) {
          renderer.setObjectRenderer(renderer.plugins.sprite);
          renderer.plugins.sprite.render(this);
        };
        Sprite.prototype.getBounds = function(matrix) {
          if (!this._currentBounds) {
            var width = this._texture._frame.width;
            var height = this._texture._frame.height;
            var w0 = width * (1 - this.anchor.x);
            var w1 = width * -this.anchor.x;
            var h0 = height * (1 - this.anchor.y);
            var h1 = height * -this.anchor.y;
            var worldTransform = matrix || this.worldTransform;
            var a = worldTransform.a;
            var b = worldTransform.b;
            var c = worldTransform.c;
            var d = worldTransform.d;
            var tx = worldTransform.tx;
            var ty = worldTransform.ty;
            var minX,
                maxX,
                minY,
                maxY;
            if (b === 0 && c === 0) {
              if (a < 0) {
                a *= -1;
              }
              if (d < 0) {
                d *= -1;
              }
              minX = a * w1 + tx;
              maxX = a * w0 + tx;
              minY = d * h1 + ty;
              maxY = d * h0 + ty;
            } else {
              var x1 = a * w1 + c * h1 + tx;
              var y1 = d * h1 + b * w1 + ty;
              var x2 = a * w0 + c * h1 + tx;
              var y2 = d * h1 + b * w0 + ty;
              var x3 = a * w0 + c * h0 + tx;
              var y3 = d * h0 + b * w0 + ty;
              var x4 = a * w1 + c * h0 + tx;
              var y4 = d * h0 + b * w1 + ty;
              minX = x1;
              minX = x2 < minX ? x2 : minX;
              minX = x3 < minX ? x3 : minX;
              minX = x4 < minX ? x4 : minX;
              minY = y1;
              minY = y2 < minY ? y2 : minY;
              minY = y3 < minY ? y3 : minY;
              minY = y4 < minY ? y4 : minY;
              maxX = x1;
              maxX = x2 > maxX ? x2 : maxX;
              maxX = x3 > maxX ? x3 : maxX;
              maxX = x4 > maxX ? x4 : maxX;
              maxY = y1;
              maxY = y2 > maxY ? y2 : maxY;
              maxY = y3 > maxY ? y3 : maxY;
              maxY = y4 > maxY ? y4 : maxY;
            }
            if (this.children.length) {
              var childBounds = this.containerGetBounds();
              w0 = childBounds.x;
              w1 = childBounds.x + childBounds.width;
              h0 = childBounds.y;
              h1 = childBounds.y + childBounds.height;
              minX = (minX < w0) ? minX : w0;
              minY = (minY < h0) ? minY : h0;
              maxX = (maxX > w1) ? maxX : w1;
              maxY = (maxY > h1) ? maxY : h1;
            }
            var bounds = this._bounds;
            bounds.x = minX;
            bounds.width = maxX - minX;
            bounds.y = minY;
            bounds.height = maxY - minY;
            this._currentBounds = bounds;
          }
          return this._currentBounds;
        };
        Sprite.prototype.getLocalBounds = function() {
          this._bounds.x = -this._texture._frame.width * this.anchor.x;
          this._bounds.y = -this._texture._frame.height * this.anchor.y;
          this._bounds.width = this._texture._frame.width;
          this._bounds.height = this._texture._frame.height;
          return this._bounds;
        };
        Sprite.prototype.containsPoint = function(point) {
          this.worldTransform.applyInverse(point, tempPoint);
          var width = this._texture._frame.width;
          var height = this._texture._frame.height;
          var x1 = -width * this.anchor.x;
          var y1;
          if (tempPoint.x > x1 && tempPoint.x < x1 + width) {
            y1 = -height * this.anchor.y;
            if (tempPoint.y > y1 && tempPoint.y < y1 + height) {
              return true;
            }
          }
          return false;
        };
        Sprite.prototype._renderCanvas = function(renderer) {
          if (this.texture.crop.width <= 0 || this.texture.crop.height <= 0) {
            return;
          }
          if (this.blendMode !== renderer.currentBlendMode) {
            renderer.currentBlendMode = this.blendMode;
            renderer.context.globalCompositeOperation = renderer.blendModes[renderer.currentBlendMode];
          }
          if (this.texture.valid) {
            var texture = this._texture,
                wt = this.worldTransform,
                dx,
                dy,
                width,
                height;
            renderer.context.globalAlpha = this.worldAlpha;
            if (renderer.smoothProperty && renderer.currentScaleMode !== texture.baseTexture.scaleMode) {
              renderer.currentScaleMode = texture.baseTexture.scaleMode;
              renderer.context[renderer.smoothProperty] = (renderer.currentScaleMode === CONST.SCALE_MODES.LINEAR);
            }
            if (texture.rotate) {
              var a = wt.a;
              var b = wt.b;
              wt.a = -wt.c;
              wt.b = -wt.d;
              wt.c = a;
              wt.d = b;
              width = texture.crop.height;
              height = texture.crop.width;
              dx = (texture.trim) ? texture.trim.y - this.anchor.y * texture.trim.height : this.anchor.y * -texture._frame.height;
              dy = (texture.trim) ? texture.trim.x - this.anchor.x * texture.trim.width : this.anchor.x * -texture._frame.width;
            } else {
              width = texture.crop.width;
              height = texture.crop.height;
              dx = (texture.trim) ? texture.trim.x - this.anchor.x * texture.trim.width : this.anchor.x * -texture._frame.width;
              dy = (texture.trim) ? texture.trim.y - this.anchor.y * texture.trim.height : this.anchor.y * -texture._frame.height;
            }
            if (renderer.roundPixels) {
              renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, (wt.tx * renderer.resolution) | 0, (wt.ty * renderer.resolution) | 0);
              dx = dx | 0;
              dy = dy | 0;
            } else {
              renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderer.resolution, wt.ty * renderer.resolution);
            }
            var resolution = texture.baseTexture.resolution;
            if (this.tint !== 0xFFFFFF) {
              if (this.cachedTint !== this.tint) {
                this.cachedTint = this.tint;
                this.tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
              }
              renderer.context.drawImage(this.tintedTexture, 0, 0, width * resolution, height * resolution, dx * renderer.resolution, dy * renderer.resolution, width * renderer.resolution, height * renderer.resolution);
            } else {
              renderer.context.drawImage(texture.baseTexture.source, texture.crop.x * resolution, texture.crop.y * resolution, width * resolution, height * resolution, dx * renderer.resolution, dy * renderer.resolution, width * renderer.resolution, height * renderer.resolution);
            }
          }
        };
        Sprite.prototype.destroy = function(destroyTexture, destroyBaseTexture) {
          Container.prototype.destroy.call(this);
          this.anchor = null;
          if (destroyTexture) {
            this._texture.destroy(destroyBaseTexture);
          }
          this._texture = null;
          this.shader = null;
        };
        Sprite.fromFrame = function(frameId) {
          var texture = utils.TextureCache[frameId];
          if (!texture) {
            throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
          }
          return new Sprite(texture);
        };
        Sprite.fromImage = function(imageId, crossorigin, scaleMode) {
          return new Sprite(Texture.fromImage(imageId, crossorigin, scaleMode));
        };
      }, {
        "../const": 22,
        "../display/Container": 23,
        "../math": 32,
        "../renderers/canvas/utils/CanvasTinter": 47,
        "../textures/Texture": 71,
        "../utils": 76
      }],
      67: [function(require, module, exports) {
        var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
            WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
            CONST = require('../../const');
        function SpriteRenderer(renderer) {
          ObjectRenderer.call(this, renderer);
          this.vertSize = 5;
          this.vertByteSize = this.vertSize * 4;
          this.size = CONST.SPRITE_BATCH_SIZE;
          var numVerts = this.size * 4 * this.vertByteSize;
          var numIndices = this.size * 6;
          this.vertices = new ArrayBuffer(numVerts);
          this.positions = new Float32Array(this.vertices);
          this.colors = new Uint32Array(this.vertices);
          this.indices = new Uint16Array(numIndices);
          this.lastIndexCount = 0;
          for (var i = 0,
              j = 0; i < numIndices; i += 6, j += 4) {
            this.indices[i + 0] = j + 0;
            this.indices[i + 1] = j + 1;
            this.indices[i + 2] = j + 2;
            this.indices[i + 3] = j + 0;
            this.indices[i + 4] = j + 2;
            this.indices[i + 5] = j + 3;
          }
          this.drawing = false;
          this.currentBatchSize = 0;
          this.currentBaseTexture = null;
          this.textures = [];
          this.blendModes = [];
          this.shaders = [];
          this.sprites = [];
          this.shader = null;
        }
        SpriteRenderer.prototype = Object.create(ObjectRenderer.prototype);
        SpriteRenderer.prototype.constructor = SpriteRenderer;
        module.exports = SpriteRenderer;
        WebGLRenderer.registerPlugin('sprite', SpriteRenderer);
        SpriteRenderer.prototype.onContextChange = function() {
          var gl = this.renderer.gl;
          this.shader = this.renderer.shaderManager.defaultShader;
          this.vertexBuffer = gl.createBuffer();
          this.indexBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
          this.currentBlendMode = 99999;
        };
        SpriteRenderer.prototype.render = function(sprite) {
          var texture = sprite._texture;
          if (this.currentBatchSize >= this.size) {
            this.flush();
            this.currentBaseTexture = texture.baseTexture;
          }
          var uvs = texture._uvs;
          if (!uvs) {
            return;
          }
          var aX = sprite.anchor.x;
          var aY = sprite.anchor.y;
          var w0,
              w1,
              h0,
              h1;
          if (texture.trim) {
            var trim = texture.trim;
            w1 = trim.x - aX * trim.width;
            w0 = w1 + texture.crop.width;
            h1 = trim.y - aY * trim.height;
            h0 = h1 + texture.crop.height;
          } else {
            w0 = (texture._frame.width) * (1 - aX);
            w1 = (texture._frame.width) * -aX;
            h0 = texture._frame.height * (1 - aY);
            h1 = texture._frame.height * -aY;
          }
          var index = this.currentBatchSize * this.vertByteSize;
          var worldTransform = sprite.worldTransform;
          var a = worldTransform.a;
          var b = worldTransform.b;
          var c = worldTransform.c;
          var d = worldTransform.d;
          var tx = worldTransform.tx;
          var ty = worldTransform.ty;
          var colors = this.colors;
          var positions = this.positions;
          if (this.renderer.roundPixels) {
            positions[index] = a * w1 + c * h1 + tx | 0;
            positions[index + 1] = d * h1 + b * w1 + ty | 0;
            positions[index + 5] = a * w0 + c * h1 + tx | 0;
            positions[index + 6] = d * h1 + b * w0 + ty | 0;
            positions[index + 10] = a * w0 + c * h0 + tx | 0;
            positions[index + 11] = d * h0 + b * w0 + ty | 0;
            positions[index + 15] = a * w1 + c * h0 + tx | 0;
            positions[index + 16] = d * h0 + b * w1 + ty | 0;
          } else {
            positions[index] = a * w1 + c * h1 + tx;
            positions[index + 1] = d * h1 + b * w1 + ty;
            positions[index + 5] = a * w0 + c * h1 + tx;
            positions[index + 6] = d * h1 + b * w0 + ty;
            positions[index + 10] = a * w0 + c * h0 + tx;
            positions[index + 11] = d * h0 + b * w0 + ty;
            positions[index + 15] = a * w1 + c * h0 + tx;
            positions[index + 16] = d * h0 + b * w1 + ty;
          }
          positions[index + 2] = uvs.x0;
          positions[index + 3] = uvs.y0;
          positions[index + 7] = uvs.x1;
          positions[index + 8] = uvs.y1;
          positions[index + 12] = uvs.x2;
          positions[index + 13] = uvs.y2;
          positions[index + 17] = uvs.x3;
          positions[index + 18] = uvs.y3;
          var tint = sprite.tint;
          colors[index + 4] = colors[index + 9] = colors[index + 14] = colors[index + 19] = (tint >> 16) + (tint & 0xff00) + ((tint & 0xff) << 16) + (sprite.worldAlpha * 255 << 24);
          this.sprites[this.currentBatchSize++] = sprite;
        };
        SpriteRenderer.prototype.flush = function() {
          if (this.currentBatchSize === 0) {
            return;
          }
          var gl = this.renderer.gl;
          var shader;
          if (this.currentBatchSize > (this.size * 0.5)) {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
          } else {
            var view = this.positions.subarray(0, this.currentBatchSize * this.vertByteSize);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
          }
          var nextTexture,
              nextBlendMode,
              nextShader;
          var batchSize = 0;
          var start = 0;
          var currentBaseTexture = null;
          var currentBlendMode = this.renderer.blendModeManager.currentBlendMode;
          var currentShader = null;
          var blendSwap = false;
          var shaderSwap = false;
          var sprite;
          for (var i = 0,
              j = this.currentBatchSize; i < j; i++) {
            sprite = this.sprites[i];
            nextTexture = sprite._texture.baseTexture;
            nextBlendMode = sprite.blendMode;
            nextShader = sprite.shader || this.shader;
            blendSwap = currentBlendMode !== nextBlendMode;
            shaderSwap = currentShader !== nextShader;
            if (currentBaseTexture !== nextTexture || blendSwap || shaderSwap) {
              this.renderBatch(currentBaseTexture, batchSize, start);
              start = i;
              batchSize = 0;
              currentBaseTexture = nextTexture;
              if (blendSwap) {
                currentBlendMode = nextBlendMode;
                this.renderer.blendModeManager.setBlendMode(currentBlendMode);
              }
              if (shaderSwap) {
                currentShader = nextShader;
                shader = currentShader.shaders ? currentShader.shaders[gl.id] : currentShader;
                if (!shader) {
                  shader = currentShader.getShader(this.renderer);
                }
                this.renderer.shaderManager.setShader(shader);
                shader.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(true);
                shader.syncUniforms();
                gl.activeTexture(gl.TEXTURE0);
              }
            }
            batchSize++;
          }
          this.renderBatch(currentBaseTexture, batchSize, start);
          this.currentBatchSize = 0;
        };
        SpriteRenderer.prototype.renderBatch = function(texture, size, startIndex) {
          if (size === 0) {
            return;
          }
          var gl = this.renderer.gl;
          if (!texture._glTextures[gl.id]) {
            this.renderer.updateTexture(texture);
          } else {
            gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
          }
          gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, startIndex * 6 * 2);
          this.renderer.drawCount++;
        };
        SpriteRenderer.prototype.start = function() {
          var gl = this.renderer.gl;
          gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
          var stride = this.vertByteSize;
          gl.vertexAttribPointer(this.shader.attributes.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
          gl.vertexAttribPointer(this.shader.attributes.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);
          gl.vertexAttribPointer(this.shader.attributes.aColor, 4, gl.UNSIGNED_BYTE, true, stride, 4 * 4);
        };
        SpriteRenderer.prototype.destroy = function() {
          this.renderer.gl.deleteBuffer(this.vertexBuffer);
          this.renderer.gl.deleteBuffer(this.indexBuffer);
          this.shader.destroy();
          this.renderer = null;
          this.vertices = null;
          this.positions = null;
          this.colors = null;
          this.indices = null;
          this.vertexBuffer = null;
          this.indexBuffer = null;
          this.currentBaseTexture = null;
          this.drawing = false;
          this.textures = null;
          this.blendModes = null;
          this.shaders = null;
          this.sprites = null;
          this.shader = null;
        };
      }, {
        "../../const": 22,
        "../../renderers/webgl/WebGLRenderer": 48,
        "../../renderers/webgl/utils/ObjectRenderer": 62
      }],
      68: [function(require, module, exports) {
        var Sprite = require('../sprites/Sprite'),
            Texture = require('../textures/Texture'),
            math = require('../math'),
            utils = require('../utils'),
            CONST = require('../const');
        function Text(text, style, resolution) {
          this.canvas = document.createElement('canvas');
          this.context = this.canvas.getContext('2d');
          this.resolution = resolution || CONST.RESOLUTION;
          this._text = null;
          this._style = null;
          var texture = Texture.fromCanvas(this.canvas);
          texture.trim = new math.Rectangle();
          Sprite.call(this, texture);
          this.text = text;
          this.style = style;
        }
        Text.prototype = Object.create(Sprite.prototype);
        Text.prototype.constructor = Text;
        module.exports = Text;
        Text.fontPropertiesCache = {};
        Text.fontPropertiesCanvas = document.createElement('canvas');
        Text.fontPropertiesContext = Text.fontPropertiesCanvas.getContext('2d');
        Object.defineProperties(Text.prototype, {
          width: {
            get: function() {
              if (this.dirty) {
                this.updateText();
              }
              return this.scale.x * this._texture._frame.width;
            },
            set: function(value) {
              this.scale.x = value / this._texture._frame.width;
              this._width = value;
            }
          },
          height: {
            get: function() {
              if (this.dirty) {
                this.updateText();
              }
              return this.scale.y * this._texture._frame.height;
            },
            set: function(value) {
              this.scale.y = value / this._texture._frame.height;
              this._height = value;
            }
          },
          style: {
            get: function() {
              return this._style;
            },
            set: function(style) {
              style = style || {};
              if (typeof style.fill === 'number') {
                style.fill = utils.hex2string(style.fill);
              }
              if (typeof style.stroke === 'number') {
                style.stroke = utils.hex2string(style.stroke);
              }
              if (typeof style.dropShadowColor === 'number') {
                style.dropShadowColor = utils.hex2string(style.dropShadowColor);
              }
              style.font = style.font || 'bold 20pt Arial';
              style.fill = style.fill || 'black';
              style.align = style.align || 'left';
              style.stroke = style.stroke || 'black';
              style.strokeThickness = style.strokeThickness || 0;
              style.wordWrap = style.wordWrap || false;
              style.wordWrapWidth = style.wordWrapWidth || 100;
              style.dropShadow = style.dropShadow || false;
              style.dropShadowColor = style.dropShadowColor || '#000000';
              style.dropShadowAngle = style.dropShadowAngle || Math.PI / 6;
              style.dropShadowDistance = style.dropShadowDistance || 5;
              style.padding = style.padding || 0;
              style.textBaseline = style.textBaseline || 'alphabetic';
              style.lineJoin = style.lineJoin || 'miter';
              style.miterLimit = style.miterLimit || 10;
              this._style = style;
              this.dirty = true;
            }
          },
          text: {
            get: function() {
              return this._text;
            },
            set: function(text) {
              text = text.toString() || ' ';
              if (this._text === text) {
                return;
              }
              this._text = text;
              this.dirty = true;
            }
          }
        });
        Text.prototype.updateText = function() {
          var style = this._style;
          this.context.font = style.font;
          var outputText = style.wordWrap ? this.wordWrap(this._text) : this._text;
          var lines = outputText.split(/(?:\r\n|\r|\n)/);
          var lineWidths = new Array(lines.length);
          var maxLineWidth = 0;
          var fontProperties = this.determineFontProperties(style.font);
          for (var i = 0; i < lines.length; i++) {
            var lineWidth = this.context.measureText(lines[i]).width;
            lineWidths[i] = lineWidth;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
          }
          var width = maxLineWidth + style.strokeThickness;
          if (style.dropShadow) {
            width += style.dropShadowDistance;
          }
          this.canvas.width = (width + this.context.lineWidth) * this.resolution;
          var lineHeight = this.style.lineHeight || fontProperties.fontSize + style.strokeThickness;
          var height = lineHeight * lines.length;
          if (style.dropShadow) {
            height += style.dropShadowDistance;
          }
          this.canvas.height = (height + this._style.padding * 2) * this.resolution;
          this.context.scale(this.resolution, this.resolution);
          if (navigator.isCocoonJS) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          }
          this.context.font = style.font;
          this.context.strokeStyle = style.stroke;
          this.context.lineWidth = style.strokeThickness;
          this.context.textBaseline = style.textBaseline;
          this.context.lineJoin = style.lineJoin;
          this.context.miterLimit = style.miterLimit;
          var linePositionX;
          var linePositionY;
          if (style.dropShadow) {
            this.context.fillStyle = style.dropShadowColor;
            var xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
            var yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;
            for (i = 0; i < lines.length; i++) {
              linePositionX = style.strokeThickness / 2;
              linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;
              if (style.align === 'right') {
                linePositionX += maxLineWidth - lineWidths[i];
              } else if (style.align === 'center') {
                linePositionX += (maxLineWidth - lineWidths[i]) / 2;
              }
              if (style.fill) {
                this.context.fillText(lines[i], linePositionX + xShadowOffset, linePositionY + yShadowOffset + this._style.padding);
              }
            }
          }
          this.context.fillStyle = style.fill;
          for (i = 0; i < lines.length; i++) {
            linePositionX = style.strokeThickness / 2;
            linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;
            if (style.align === 'right') {
              linePositionX += maxLineWidth - lineWidths[i];
            } else if (style.align === 'center') {
              linePositionX += (maxLineWidth - lineWidths[i]) / 2;
            }
            if (style.stroke && style.strokeThickness) {
              this.context.strokeText(lines[i], linePositionX, linePositionY + this._style.padding);
            }
            if (style.fill) {
              this.context.fillText(lines[i], linePositionX, linePositionY + this._style.padding);
            }
          }
          this.updateTexture();
        };
        Text.prototype.updateTexture = function() {
          var texture = this._texture;
          texture.baseTexture.hasLoaded = true;
          texture.baseTexture.resolution = this.resolution;
          texture.baseTexture.width = this.canvas.width / this.resolution;
          texture.baseTexture.height = this.canvas.height / this.resolution;
          texture.crop.width = texture._frame.width = this.canvas.width / this.resolution;
          texture.crop.height = texture._frame.height = this.canvas.height / this.resolution;
          texture.trim.x = 0;
          texture.trim.y = -this._style.padding;
          texture.trim.width = texture._frame.width;
          texture.trim.height = texture._frame.height - this._style.padding * 2;
          this._width = this.canvas.width / this.resolution;
          this._height = this.canvas.height / this.resolution;
          texture.baseTexture.emit('update', texture.baseTexture);
          this.dirty = false;
        };
        Text.prototype.renderWebGL = function(renderer) {
          if (this.dirty) {
            this.updateText();
          }
          Sprite.prototype.renderWebGL.call(this, renderer);
        };
        Text.prototype._renderCanvas = function(renderer) {
          if (this.dirty) {
            this.updateText();
          }
          Sprite.prototype._renderCanvas.call(this, renderer);
        };
        Text.prototype.determineFontProperties = function(fontStyle) {
          var properties = Text.fontPropertiesCache[fontStyle];
          if (!properties) {
            properties = {};
            var canvas = Text.fontPropertiesCanvas;
            var context = Text.fontPropertiesContext;
            context.font = fontStyle;
            var width = Math.ceil(context.measureText('|MÉq').width);
            var baseline = Math.ceil(context.measureText('M').width);
            var height = 2 * baseline;
            baseline = baseline * 1.4 | 0;
            canvas.width = width;
            canvas.height = height;
            context.fillStyle = '#f00';
            context.fillRect(0, 0, width, height);
            context.font = fontStyle;
            context.textBaseline = 'alphabetic';
            context.fillStyle = '#000';
            context.fillText('|MÉq', 0, baseline);
            var imagedata = context.getImageData(0, 0, width, height).data;
            var pixels = imagedata.length;
            var line = width * 4;
            var i,
                j;
            var idx = 0;
            var stop = false;
            for (i = 0; i < baseline; i++) {
              for (j = 0; j < line; j += 4) {
                if (imagedata[idx + j] !== 255) {
                  stop = true;
                  break;
                }
              }
              if (!stop) {
                idx += line;
              } else {
                break;
              }
            }
            properties.ascent = baseline - i;
            idx = pixels - line;
            stop = false;
            for (i = height; i > baseline; i--) {
              for (j = 0; j < line; j += 4) {
                if (imagedata[idx + j] !== 255) {
                  stop = true;
                  break;
                }
              }
              if (!stop) {
                idx -= line;
              } else {
                break;
              }
            }
            properties.descent = i - baseline;
            properties.fontSize = properties.ascent + properties.descent;
            Text.fontPropertiesCache[fontStyle] = properties;
          }
          return properties;
        };
        Text.prototype.wordWrap = function(text) {
          var result = '';
          var lines = text.split('\n');
          var wordWrapWidth = this._style.wordWrapWidth;
          for (var i = 0; i < lines.length; i++) {
            var spaceLeft = wordWrapWidth;
            var words = lines[i].split(' ');
            for (var j = 0; j < words.length; j++) {
              var wordWidth = this.context.measureText(words[j]).width;
              var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
              if (j === 0 || wordWidthWithSpace > spaceLeft) {
                if (j > 0) {
                  result += '\n';
                }
                result += words[j];
                spaceLeft = wordWrapWidth - wordWidth;
              } else {
                spaceLeft -= wordWidthWithSpace;
                result += ' ' + words[j];
              }
            }
            if (i < lines.length - 1) {
              result += '\n';
            }
          }
          return result;
        };
        Text.prototype.getBounds = function(matrix) {
          if (this.dirty) {
            this.updateText();
          }
          return Sprite.prototype.getBounds.call(this, matrix);
        };
        Text.prototype.destroy = function(destroyBaseTexture) {
          this.context = null;
          this.canvas = null;
          this._style = null;
          this._texture.destroy(destroyBaseTexture === undefined ? true : destroyBaseTexture);
        };
      }, {
        "../const": 22,
        "../math": 32,
        "../sprites/Sprite": 66,
        "../textures/Texture": 71,
        "../utils": 76
      }],
      69: [function(require, module, exports) {
        var utils = require('../utils'),
            CONST = require('../const'),
            EventEmitter = require('eventemitter3');
        function BaseTexture(source, scaleMode, resolution) {
          EventEmitter.call(this);
          this.uuid = utils.uuid();
          this.resolution = resolution || 1;
          this.width = 100;
          this.height = 100;
          this.realWidth = 100;
          this.realHeight = 100;
          this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
          this.hasLoaded = false;
          this.isLoading = false;
          this.source = null;
          this.premultipliedAlpha = true;
          this.imageUrl = null;
          this.isPowerOfTwo = false;
          this.mipmap = false;
          this._glTextures = [];
          if (source) {
            this.loadSource(source);
          }
        }
        BaseTexture.prototype = Object.create(EventEmitter.prototype);
        BaseTexture.prototype.constructor = BaseTexture;
        module.exports = BaseTexture;
        BaseTexture.prototype.update = function() {
          this.realWidth = this.source.naturalWidth || this.source.width;
          this.realHeight = this.source.naturalHeight || this.source.height;
          this.width = this.realWidth / this.resolution;
          this.height = this.realHeight / this.resolution;
          this.isPowerOfTwo = utils.isPowerOfTwo(this.realWidth, this.realHeight);
          this.emit('update', this);
        };
        BaseTexture.prototype.loadSource = function(source) {
          var wasLoading = this.isLoading;
          this.hasLoaded = false;
          this.isLoading = false;
          if (wasLoading && this.source) {
            this.source.onload = null;
            this.source.onerror = null;
          }
          this.source = source;
          if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height) {
            this._sourceLoaded();
          } else if (!source.getContext) {
            this.isLoading = true;
            var scope = this;
            source.onload = function() {
              source.onload = null;
              source.onerror = null;
              if (!scope.isLoading) {
                return;
              }
              scope.isLoading = false;
              scope._sourceLoaded();
              scope.emit('loaded', scope);
            };
            source.onerror = function() {
              source.onload = null;
              source.onerror = null;
              if (!scope.isLoading) {
                return;
              }
              scope.isLoading = false;
              scope.emit('error', scope);
            };
            if (source.complete && source.src) {
              this.isLoading = false;
              source.onload = null;
              source.onerror = null;
              if (source.width && source.height) {
                this._sourceLoaded();
                if (wasLoading) {
                  this.emit('loaded', this);
                }
              } else {
                if (wasLoading) {
                  this.emit('error', this);
                }
              }
            }
          }
        };
        BaseTexture.prototype._sourceLoaded = function() {
          this.hasLoaded = true;
          this.update();
        };
        BaseTexture.prototype.destroy = function() {
          if (this.imageUrl) {
            delete utils.BaseTextureCache[this.imageUrl];
            delete utils.TextureCache[this.imageUrl];
            this.imageUrl = null;
            if (!navigator.isCocoonJS) {
              this.source.src = '';
            }
          } else if (this.source && this.source._pixiId) {
            delete utils.BaseTextureCache[this.source._pixiId];
          }
          this.source = null;
          this.dispose();
        };
        BaseTexture.prototype.dispose = function() {
          this.emit('dispose', this);
          this._glTextures.length = 0;
        };
        BaseTexture.prototype.updateSourceImage = function(newSrc) {
          this.source.src = newSrc;
          this.loadSource(this.source);
        };
        BaseTexture.fromImage = function(imageUrl, crossorigin, scaleMode) {
          var baseTexture = utils.BaseTextureCache[imageUrl];
          if (crossorigin === undefined && imageUrl.indexOf('data:') !== 0) {
            crossorigin = true;
          }
          if (!baseTexture) {
            var image = new Image();
            if (crossorigin) {
              image.crossOrigin = '';
            }
            baseTexture = new BaseTexture(image, scaleMode);
            baseTexture.imageUrl = imageUrl;
            image.src = imageUrl;
            utils.BaseTextureCache[imageUrl] = baseTexture;
            baseTexture.resolution = utils.getResolutionOfUrl(imageUrl);
          }
          return baseTexture;
        };
        BaseTexture.fromCanvas = function(canvas, scaleMode) {
          if (!canvas._pixiId) {
            canvas._pixiId = 'canvas_' + utils.uuid();
          }
          var baseTexture = utils.BaseTextureCache[canvas._pixiId];
          if (!baseTexture) {
            baseTexture = new BaseTexture(canvas, scaleMode);
            utils.BaseTextureCache[canvas._pixiId] = baseTexture;
          }
          return baseTexture;
        };
      }, {
        "../const": 22,
        "../utils": 76,
        "eventemitter3": 11
      }],
      70: [function(require, module, exports) {
        var BaseTexture = require('./BaseTexture'),
            Texture = require('./Texture'),
            RenderTarget = require('../renderers/webgl/utils/RenderTarget'),
            FilterManager = require('../renderers/webgl/managers/FilterManager'),
            CanvasBuffer = require('../renderers/canvas/utils/CanvasBuffer'),
            math = require('../math'),
            CONST = require('../const'),
            tempMatrix = new math.Matrix();
        function RenderTexture(renderer, width, height, scaleMode, resolution) {
          if (!renderer) {
            throw new Error('Unable to create RenderTexture, you must pass a renderer into the constructor.');
          }
          width = width || 100;
          height = height || 100;
          resolution = resolution || CONST.RESOLUTION;
          var baseTexture = new BaseTexture();
          baseTexture.width = width;
          baseTexture.height = height;
          baseTexture.resolution = resolution;
          baseTexture.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
          baseTexture.hasLoaded = true;
          Texture.call(this, baseTexture, new math.Rectangle(0, 0, width, height));
          this.width = width;
          this.height = height;
          this.resolution = resolution;
          this.render = null;
          this.renderer = renderer;
          if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
            var gl = this.renderer.gl;
            this.textureBuffer = new RenderTarget(gl, this.width, this.height, baseTexture.scaleMode, this.resolution);
            this.baseTexture._glTextures[gl.id] = this.textureBuffer.texture;
            this.filterManager = new FilterManager(this.renderer);
            this.filterManager.onContextChange();
            this.filterManager.resize(width, height);
            this.render = this.renderWebGL;
            this.renderer.currentRenderer.start();
            this.renderer.currentRenderTarget.activate();
          } else {
            this.render = this.renderCanvas;
            this.textureBuffer = new CanvasBuffer(this.width * this.resolution, this.height * this.resolution);
            this.baseTexture.source = this.textureBuffer.canvas;
          }
          this.valid = true;
          this._updateUvs();
        }
        RenderTexture.prototype = Object.create(Texture.prototype);
        RenderTexture.prototype.constructor = RenderTexture;
        module.exports = RenderTexture;
        RenderTexture.prototype.resize = function(width, height, updateBase) {
          if (width === this.width && height === this.height) {
            return;
          }
          this.valid = (width > 0 && height > 0);
          this.width = this._frame.width = this.crop.width = width;
          this.height = this._frame.height = this.crop.height = height;
          if (updateBase) {
            this.baseTexture.width = this.width;
            this.baseTexture.height = this.height;
          }
          if (!this.valid) {
            return;
          }
          this.textureBuffer.resize(this.width, this.height);
          if (this.filterManager) {
            this.filterManager.resize(this.width, this.height);
          }
        };
        RenderTexture.prototype.clear = function() {
          if (!this.valid) {
            return;
          }
          if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
            this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
          }
          this.textureBuffer.clear();
        };
        RenderTexture.prototype.renderWebGL = function(displayObject, matrix, clear, updateTransform) {
          if (!this.valid) {
            return;
          }
          updateTransform = (updateTransform !== undefined) ? updateTransform : true;
          this.textureBuffer.transform = matrix;
          this.textureBuffer.activate();
          displayObject.worldAlpha = displayObject.alpha;
          if (updateTransform) {
            displayObject.worldTransform.identity();
            displayObject.currentBounds = null;
            var children = displayObject.children;
            var i,
                j;
            for (i = 0, j = children.length; i < j; ++i) {
              children[i].updateTransform();
            }
          }
          var temp = this.renderer.filterManager;
          this.renderer.filterManager = this.filterManager;
          this.renderer.renderDisplayObject(displayObject, this.textureBuffer, clear);
          this.renderer.filterManager = temp;
        };
        RenderTexture.prototype.renderCanvas = function(displayObject, matrix, clear, updateTransform) {
          if (!this.valid) {
            return;
          }
          updateTransform = !!updateTransform;
          var cachedWt = displayObject.worldTransform;
          var wt = tempMatrix;
          wt.identity();
          if (matrix) {
            wt.append(matrix);
          }
          displayObject.worldTransform = wt;
          displayObject.worldAlpha = 1;
          var children = displayObject.children;
          var i,
              j;
          for (i = 0, j = children.length; i < j; ++i) {
            children[i].updateTransform();
          }
          if (clear) {
            this.textureBuffer.clear();
          }
          displayObject.worldTransform = cachedWt;
          var context = this.textureBuffer.context;
          var realResolution = this.renderer.resolution;
          this.renderer.resolution = this.resolution;
          this.renderer.renderDisplayObject(displayObject, context);
          this.renderer.resolution = realResolution;
        };
        RenderTexture.prototype.destroy = function() {
          Texture.prototype.destroy.call(this, true);
          this.textureBuffer.destroy();
          if (this.filterManager) {
            this.filterManager.destroy();
          }
          this.renderer = null;
        };
        RenderTexture.prototype.getImage = function() {
          var image = new Image();
          image.src = this.getBase64();
          return image;
        };
        RenderTexture.prototype.getBase64 = function() {
          return this.getCanvas().toDataURL();
        };
        RenderTexture.prototype.getCanvas = function() {
          if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
            var gl = this.renderer.gl;
            var width = this.textureBuffer.size.width;
            var height = this.textureBuffer.size.height;
            var webGLPixels = new Uint8Array(4 * width * height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            var tempCanvas = new CanvasBuffer(width, height);
            var canvasData = tempCanvas.context.getImageData(0, 0, width, height);
            canvasData.data.set(webGLPixels);
            tempCanvas.context.putImageData(canvasData, 0, 0);
            return tempCanvas.canvas;
          } else {
            return this.textureBuffer.canvas;
          }
        };
        RenderTexture.prototype.getPixels = function() {
          var width,
              height;
          if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
            var gl = this.renderer.gl;
            width = this.textureBuffer.size.width;
            height = this.textureBuffer.size.height;
            var webGLPixels = new Uint8Array(4 * width * height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return webGLPixels;
          } else {
            width = this.textureBuffer.canvas.width;
            height = this.textureBuffer.canvas.height;
            return this.textureBuffer.canvas.getContext('2d').getImageData(0, 0, width, height).data;
          }
        };
        RenderTexture.prototype.getPixel = function(x, y) {
          if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL) {
            var gl = this.renderer.gl;
            var webGLPixels = new Uint8Array(4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
            gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return webGLPixels;
          } else {
            return this.textureBuffer.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
          }
        };
      }, {
        "../const": 22,
        "../math": 32,
        "../renderers/canvas/utils/CanvasBuffer": 44,
        "../renderers/webgl/managers/FilterManager": 53,
        "../renderers/webgl/utils/RenderTarget": 64,
        "./BaseTexture": 69,
        "./Texture": 71
      }],
      71: [function(require, module, exports) {
        var BaseTexture = require('./BaseTexture'),
            VideoBaseTexture = require('./VideoBaseTexture'),
            TextureUvs = require('./TextureUvs'),
            EventEmitter = require('eventemitter3'),
            math = require('../math'),
            utils = require('../utils');
        function Texture(baseTexture, frame, crop, trim, rotate) {
          EventEmitter.call(this);
          this.noFrame = false;
          if (!frame) {
            this.noFrame = true;
            frame = new math.Rectangle(0, 0, 1, 1);
          }
          if (baseTexture instanceof Texture) {
            baseTexture = baseTexture.baseTexture;
          }
          this.baseTexture = baseTexture;
          this._frame = frame;
          this.trim = trim;
          this.valid = false;
          this.requiresUpdate = false;
          this._uvs = null;
          this.width = 0;
          this.height = 0;
          this.crop = crop || frame;
          this.rotate = !!rotate;
          if (baseTexture.hasLoaded) {
            if (this.noFrame) {
              frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);
              baseTexture.on('update', this.onBaseTextureUpdated, this);
            }
            this.frame = frame;
          } else {
            baseTexture.once('loaded', this.onBaseTextureLoaded, this);
          }
        }
        Texture.prototype = Object.create(EventEmitter.prototype);
        Texture.prototype.constructor = Texture;
        module.exports = Texture;
        Object.defineProperties(Texture.prototype, {frame: {
            get: function() {
              return this._frame;
            },
            set: function(frame) {
              this._frame = frame;
              this.noFrame = false;
              this.width = frame.width;
              this.height = frame.height;
              if (!this.trim && !this.rotate && (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height)) {
                throw new Error('Texture Error: frame does not fit inside the base Texture dimensions ' + this);
              }
              this.valid = frame && frame.width && frame.height && this.baseTexture.hasLoaded;
              if (this.trim) {
                this.width = this.trim.width;
                this.height = this.trim.height;
                this._frame.width = this.trim.width;
                this._frame.height = this.trim.height;
              } else {
                this.crop = frame;
              }
              if (this.valid) {
                this._updateUvs();
              }
            }
          }});
        Texture.prototype.update = function() {
          this.baseTexture.update();
        };
        Texture.prototype.onBaseTextureLoaded = function(baseTexture) {
          if (this.noFrame) {
            this.frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);
          } else {
            this.frame = this._frame;
          }
          this.emit('update', this);
        };
        Texture.prototype.onBaseTextureUpdated = function(baseTexture) {
          this._frame.width = baseTexture.width;
          this._frame.height = baseTexture.height;
          this.emit('update', this);
        };
        Texture.prototype.destroy = function(destroyBase) {
          if (this.baseTexture) {
            if (destroyBase) {
              this.baseTexture.destroy();
            }
            this.baseTexture.off('update', this.onBaseTextureUpdated, this);
            this.baseTexture.off('loaded', this.onBaseTextureLoaded, this);
            this.baseTexture = null;
          }
          this._frame = null;
          this._uvs = null;
          this.trim = null;
          this.crop = null;
          this.valid = false;
        };
        Texture.prototype.clone = function() {
          return new Texture(this.baseTexture, this.frame, this.crop, this.trim, this.rotate);
        };
        Texture.prototype._updateUvs = function() {
          if (!this._uvs) {
            this._uvs = new TextureUvs();
          }
          this._uvs.set(this.crop, this.baseTexture, this.rotate);
        };
        Texture.fromImage = function(imageUrl, crossorigin, scaleMode) {
          var texture = utils.TextureCache[imageUrl];
          if (!texture) {
            texture = new Texture(BaseTexture.fromImage(imageUrl, crossorigin, scaleMode));
            utils.TextureCache[imageUrl] = texture;
          }
          return texture;
        };
        Texture.fromFrame = function(frameId) {
          var texture = utils.TextureCache[frameId];
          if (!texture) {
            throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
          }
          return texture;
        };
        Texture.fromCanvas = function(canvas, scaleMode) {
          return new Texture(BaseTexture.fromCanvas(canvas, scaleMode));
        };
        Texture.fromVideo = function(video, scaleMode) {
          if (typeof video === 'string') {
            return Texture.fromVideoUrl(video, scaleMode);
          } else {
            return new Texture(VideoBaseTexture.fromVideo(video, scaleMode));
          }
        };
        Texture.fromVideoUrl = function(videoUrl, scaleMode) {
          return new Texture(VideoBaseTexture.fromUrl(videoUrl, scaleMode));
        };
        Texture.addTextureToCache = function(texture, id) {
          utils.TextureCache[id] = texture;
        };
        Texture.removeTextureFromCache = function(id) {
          var texture = utils.TextureCache[id];
          delete utils.TextureCache[id];
          delete utils.BaseTextureCache[id];
          return texture;
        };
        Texture.EMPTY = new Texture(new BaseTexture());
      }, {
        "../math": 32,
        "../utils": 76,
        "./BaseTexture": 69,
        "./TextureUvs": 72,
        "./VideoBaseTexture": 73,
        "eventemitter3": 11
      }],
      72: [function(require, module, exports) {
        function TextureUvs() {
          this.x0 = 0;
          this.y0 = 0;
          this.x1 = 1;
          this.y1 = 0;
          this.x2 = 1;
          this.y2 = 1;
          this.x3 = 0;
          this.y3 = 1;
        }
        module.exports = TextureUvs;
        TextureUvs.prototype.set = function(frame, baseFrame, rotate) {
          var tw = baseFrame.width;
          var th = baseFrame.height;
          if (rotate) {
            this.x0 = (frame.x + frame.height) / tw;
            this.y0 = frame.y / th;
            this.x1 = (frame.x + frame.height) / tw;
            this.y1 = (frame.y + frame.width) / th;
            this.x2 = frame.x / tw;
            this.y2 = (frame.y + frame.width) / th;
            this.x3 = frame.x / tw;
            this.y3 = frame.y / th;
          } else {
            this.x0 = frame.x / tw;
            this.y0 = frame.y / th;
            this.x1 = (frame.x + frame.width) / tw;
            this.y1 = frame.y / th;
            this.x2 = (frame.x + frame.width) / tw;
            this.y2 = (frame.y + frame.height) / th;
            this.x3 = frame.x / tw;
            this.y3 = (frame.y + frame.height) / th;
          }
        };
      }, {}],
      73: [function(require, module, exports) {
        var BaseTexture = require('./BaseTexture'),
            utils = require('../utils');
        function VideoBaseTexture(source, scaleMode) {
          if (!source) {
            throw new Error('No video source element specified.');
          }
          if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height) {
            source.complete = true;
          }
          BaseTexture.call(this, source, scaleMode);
          this.autoUpdate = false;
          this._onUpdate = this._onUpdate.bind(this);
          this._onCanPlay = this._onCanPlay.bind(this);
          if (!source.complete) {
            source.addEventListener('canplay', this._onCanPlay);
            source.addEventListener('canplaythrough', this._onCanPlay);
            source.addEventListener('play', this._onPlayStart.bind(this));
            source.addEventListener('pause', this._onPlayStop.bind(this));
          }
          this.__loaded = false;
        }
        VideoBaseTexture.prototype = Object.create(BaseTexture.prototype);
        VideoBaseTexture.prototype.constructor = VideoBaseTexture;
        module.exports = VideoBaseTexture;
        VideoBaseTexture.prototype._onUpdate = function() {
          if (this.autoUpdate) {
            window.requestAnimationFrame(this._onUpdate);
            this.update();
          }
        };
        VideoBaseTexture.prototype._onPlayStart = function() {
          if (!this.autoUpdate) {
            window.requestAnimationFrame(this._onUpdate);
            this.autoUpdate = true;
          }
        };
        VideoBaseTexture.prototype._onPlayStop = function() {
          this.autoUpdate = false;
        };
        VideoBaseTexture.prototype._onCanPlay = function() {
          this.hasLoaded = true;
          if (this.source) {
            this.source.removeEventListener('canplay', this._onCanPlay);
            this.source.removeEventListener('canplaythrough', this._onCanPlay);
            this.width = this.source.videoWidth;
            this.height = this.source.videoHeight;
            this.source.play();
            if (!this.__loaded) {
              this.__loaded = true;
              this.emit('loaded', this);
            }
          }
        };
        VideoBaseTexture.prototype.destroy = function() {
          if (this.source && this.source._pixiId) {
            delete utils.BaseTextureCache[this.source._pixiId];
            delete this.source._pixiId;
          }
          BaseTexture.prototype.destroy.call(this);
        };
        VideoBaseTexture.fromVideo = function(video, scaleMode) {
          if (!video._pixiId) {
            video._pixiId = 'video_' + utils.uuid();
          }
          var baseTexture = utils.BaseTextureCache[video._pixiId];
          if (!baseTexture) {
            baseTexture = new VideoBaseTexture(video, scaleMode);
            utils.BaseTextureCache[video._pixiId] = baseTexture;
          }
          return baseTexture;
        };
        VideoBaseTexture.fromUrl = function(videoSrc, scaleMode) {
          var video = document.createElement('video');
          if (Array.isArray(videoSrc)) {
            for (var i = 0; i < videoSrc.length; ++i) {
              video.appendChild(createSource(videoSrc.src || videoSrc, videoSrc.mime));
            }
          } else {
            video.appendChild(createSource(videoSrc.src || videoSrc, videoSrc.mime));
          }
          video.load();
          video.play();
          return VideoBaseTexture.fromVideo(video, scaleMode);
        };
        VideoBaseTexture.fromUrls = VideoBaseTexture.fromUrl;
        function createSource(path, type) {
          if (!type) {
            type = 'video/' + path.substr(path.lastIndexOf('.') + 1);
          }
          var source = document.createElement('source');
          source.src = path;
          source.type = type;
          return source;
        }
      }, {
        "../utils": 76,
        "./BaseTexture": 69
      }],
      74: [function(require, module, exports) {
        var CONST = require('../const'),
            EventEmitter = require('eventemitter3'),
            TICK = 'tick';
        function Ticker() {
          var _this = this;
          this._tick = function _tick(time) {
            _this._requestId = null;
            if (_this.started) {
              _this.update(time);
              if (_this.started && _this._requestId === null && _this._emitter.listeners(TICK, true)) {
                _this._requestId = requestAnimationFrame(_this._tick);
              }
            }
          };
          this._emitter = new EventEmitter();
          this._requestId = null;
          this._maxElapsedMS = 100;
          this.autoStart = false;
          this.deltaTime = 1;
          this.elapsedMS = 1 / CONST.TARGET_FPMS;
          this.lastTime = 0;
          this.speed = 1;
          this.started = false;
        }
        Object.defineProperties(Ticker.prototype, {
          FPS: {get: function() {
              return 1000 / this.elapsedMS;
            }},
          minFPS: {
            get: function() {
              return 1000 / this._maxElapsedMS;
            },
            set: function(fps) {
              var minFPMS = Math.min(Math.max(0, fps) / 1000, CONST.TARGET_FPMS);
              this._maxElapsedMS = 1 / minFPMS;
            }
          }
        });
        Ticker.prototype._requestIfNeeded = function _requestIfNeeded() {
          if (this._requestId === null && this._emitter.listeners(TICK, true)) {
            this.lastTime = performance.now();
            this._requestId = requestAnimationFrame(this._tick);
          }
        };
        Ticker.prototype._cancelIfNeeded = function _cancelIfNeeded() {
          if (this._requestId !== null) {
            cancelAnimationFrame(this._requestId);
            this._requestId = null;
          }
        };
        Ticker.prototype._startIfPossible = function _startIfPossible() {
          if (this.started) {
            this._requestIfNeeded();
          } else if (this.autoStart) {
            this.start();
          }
        };
        Ticker.prototype.add = function add(fn, context) {
          this._emitter.on(TICK, fn, context);
          this._startIfPossible();
          return this;
        };
        Ticker.prototype.addOnce = function addOnce(fn, context) {
          this._emitter.once(TICK, fn, context);
          this._startIfPossible();
          return this;
        };
        Ticker.prototype.remove = function remove(fn, context) {
          this._emitter.off(TICK, fn, context);
          if (!this._emitter.listeners(TICK, true)) {
            this._cancelIfNeeded();
          }
          return this;
        };
        Ticker.prototype.start = function start() {
          if (!this.started) {
            this.started = true;
            this._requestIfNeeded();
          }
        };
        Ticker.prototype.stop = function stop() {
          if (this.started) {
            this.started = false;
            this._cancelIfNeeded();
          }
        };
        Ticker.prototype.update = function update(currentTime) {
          var elapsedMS;
          currentTime = currentTime || performance.now();
          elapsedMS = this.elapsedMS = currentTime - this.lastTime;
          if (elapsedMS > this._maxElapsedMS) {
            elapsedMS = this._maxElapsedMS;
          }
          this.deltaTime = elapsedMS * CONST.TARGET_FPMS * this.speed;
          this._emitter.emit(TICK, this.deltaTime);
          this.lastTime = currentTime;
        };
        module.exports = Ticker;
      }, {
        "../const": 22,
        "eventemitter3": 11
      }],
      75: [function(require, module, exports) {
        var Ticker = require('./Ticker');
        var shared = new Ticker();
        shared.autoStart = true;
        module.exports = {
          shared: shared,
          Ticker: Ticker
        };
      }, {"./Ticker": 74}],
      76: [function(require, module, exports) {
        var CONST = require('../const');
        var utils = module.exports = {
          _uid: 0,
          _saidHello: false,
          pluginTarget: require('./pluginTarget'),
          async: require('async'),
          uuid: function() {
            return ++utils._uid;
          },
          hex2rgb: function(hex, out) {
            out = out || [];
            out[0] = (hex >> 16 & 0xFF) / 255;
            out[1] = (hex >> 8 & 0xFF) / 255;
            out[2] = (hex & 0xFF) / 255;
            return out;
          },
          hex2string: function(hex) {
            hex = hex.toString(16);
            hex = '000000'.substr(0, 6 - hex.length) + hex;
            return '#' + hex;
          },
          rgb2hex: function(rgb) {
            return ((rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + rgb[2] * 255);
          },
          canUseNewCanvasBlendModes: function() {
            if (typeof document === 'undefined') {
              return false;
            }
            var pngHead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
            var pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
            var magenta = new Image();
            magenta.src = pngHead + 'AP804Oa6' + pngEnd;
            var yellow = new Image();
            yellow.src = pngHead + '/wCKxvRF' + pngEnd;
            var canvas = document.createElement('canvas');
            canvas.width = 6;
            canvas.height = 1;
            var context = canvas.getContext('2d');
            context.globalCompositeOperation = 'multiply';
            context.drawImage(magenta, 0, 0);
            context.drawImage(yellow, 2, 0);
            var data = context.getImageData(2, 0, 1, 1).data;
            return (data[0] === 255 && data[1] === 0 && data[2] === 0);
          },
          getNextPowerOfTwo: function(number) {
            if (number > 0 && (number & (number - 1)) === 0) {
              return number;
            } else {
              var result = 1;
              while (result < number) {
                result <<= 1;
              }
              return result;
            }
          },
          isPowerOfTwo: function(width, height) {
            return (width > 0 && (width & (width - 1)) === 0 && height > 0 && (height & (height - 1)) === 0);
          },
          getResolutionOfUrl: function(url) {
            var resolution = CONST.RETINA_PREFIX.exec(url);
            if (resolution) {
              return parseFloat(resolution[1]);
            }
            return 1;
          },
          sayHello: function(type) {
            if (utils._saidHello) {
              return;
            }
            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
              var args = ['\n %c %c %c Pixi.js ' + CONST.VERSION + ' - ✰ ' + type + ' ✰  %c ' + ' %c ' + ' http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n', 'background: #ff66a5; padding:5px 0;', 'background: #ff66a5; padding:5px 0;', 'color: #ff66a5; background: #030307; padding:5px 0;', 'background: #ff66a5; padding:5px 0;', 'background: #ffc3dc; padding:5px 0;', 'background: #ff66a5; padding:5px 0;', 'color: #ff2424; background: #fff; padding:5px 0;', 'color: #ff2424; background: #fff; padding:5px 0;', 'color: #ff2424; background: #fff; padding:5px 0;'];
              window.console.log.apply(console, args);
            } else if (window.console) {
              window.console.log('Pixi.js ' + CONST.VERSION + ' - ' + type + ' - http://www.pixijs.com/');
            }
            utils._saidHello = true;
          },
          isWebGLSupported: function() {
            var contextOptions = {stencil: true};
            try {
              if (!window.WebGLRenderingContext) {
                return false;
              }
              var canvas = document.createElement('canvas'),
                  gl = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);
              return !!(gl && gl.getContextAttributes().stencil);
            } catch (e) {
              return false;
            }
          },
          TextureCache: {},
          BaseTextureCache: {}
        };
      }, {
        "../const": 22,
        "./pluginTarget": 77,
        "async": 2
      }],
      77: [function(require, module, exports) {
        function pluginTarget(obj) {
          obj.__plugins = {};
          obj.registerPlugin = function(pluginName, ctor) {
            obj.__plugins[pluginName] = ctor;
          };
          obj.prototype.initPlugins = function() {
            this.plugins = this.plugins || {};
            for (var o in obj.__plugins) {
              this.plugins[o] = new (obj.__plugins[o])(this);
            }
          };
          obj.prototype.destroyPlugins = function() {
            for (var o in this.plugins) {
              this.plugins[o].destroy();
              this.plugins[o] = null;
            }
            this.plugins = null;
          };
        }
        module.exports = {mixin: function mixin(obj) {
            pluginTarget(obj);
          }};
      }, {}],
      78: [function(require, module, exports) {
        var core = require('./core'),
            mesh = require('./mesh'),
            extras = require('./extras'),
            utils = require('./core/utils');
        core.SpriteBatch = function() {
          throw new ReferenceError('SpriteBatch does not exist any more, please use the new ParticleContainer instead.');
        };
        core.AssetLoader = function() {
          throw new ReferenceError('The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.');
        };
        Object.defineProperties(core, {
          Stage: {get: function() {
              console.warn('You do not need to use a PIXI Stage any more, you can simply render any container.');
              return core.Container;
            }},
          DisplayObjectContainer: {get: function() {
              console.warn('DisplayObjectContainer has been shortened to Container, please use Container from now on.');
              return core.Container;
            }},
          Strip: {get: function() {
              console.warn('The Strip class has been renamed to Mesh and moved to mesh.Mesh, please use mesh.Mesh from now on.');
              return mesh.Mesh;
            }},
          Rope: {get: function() {
              console.warn('The Rope class has been moved to mesh.Rope, please use mesh.Rope from now on.');
              return mesh.Rope;
            }},
          MovieClip: {get: function() {
              console.warn('The MovieClip class has been moved to extras.MovieClip, please use extras.MovieClip from now on.');
              return extras.MovieClip;
            }},
          TilingSprite: {get: function() {
              console.warn('The TilingSprite class has been moved to extras.TilingSprite, please use extras.TilingSprite from now on.');
              return extras.TilingSprite;
            }},
          BitmapText: {get: function() {
              console.warn('The BitmapText class has been moved to extras.BitmapText, please use extras.BitmapText from now on.');
              return extras.BitmapText;
            }},
          blendModes: {get: function() {
              console.warn('The blendModes has been moved to BLEND_MODES, please use BLEND_MODES from now on.');
              return core.BLEND_MODES;
            }},
          scaleModes: {get: function() {
              console.warn('The scaleModes has been moved to SCALE_MODES, please use SCALE_MODES from now on.');
              return core.SCALE_MODES;
            }},
          BaseTextureCache: {get: function() {
              console.warn('The BaseTextureCache class has been moved to utils.BaseTextureCache, please use utils.BaseTextureCache from now on.');
              return utils.BaseTextureCache;
            }},
          TextureCache: {get: function() {
              console.warn('The TextureCache class has been moved to utils.TextureCache, please use utils.TextureCache from now on.');
              return utils.TextureCache;
            }}
        });
        core.Sprite.prototype.setTexture = function(texture) {
          this.texture = texture;
          console.warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
        };
        extras.BitmapText.prototype.setText = function(text) {
          this.text = text;
          console.warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
        };
        core.Text.prototype.setText = function(text) {
          this.text = text;
          console.warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
        };
        core.Text.prototype.setStyle = function(style) {
          this.style = style;
          console.warn('setStyle is now deprecated, please use the style property, e.g : myText.style = style;');
        };
        core.Texture.prototype.setFrame = function(frame) {
          this.frame = frame;
          console.warn('setFrame is now deprecated, please use the frame property, e.g : myTexture.frame = frame;');
        };
      }, {
        "./core": 29,
        "./core/utils": 76,
        "./extras": 85,
        "./mesh": 126
      }],
      79: [function(require, module, exports) {
        var core = require('../core');
        function BitmapText(text, style) {
          core.Container.call(this);
          style = style || {};
          this.textWidth = 0;
          this.textHeight = 0;
          this._glyphs = [];
          this._font = {
            tint: style.tint !== undefined ? style.tint : 0xFFFFFF,
            align: style.align || 'left',
            name: null,
            size: 0
          };
          this.font = style.font;
          this._text = text;
          this.maxWidth = 0;
          this.dirty = false;
          this.updateText();
        }
        BitmapText.prototype = Object.create(core.Container.prototype);
        BitmapText.prototype.constructor = BitmapText;
        module.exports = BitmapText;
        Object.defineProperties(BitmapText.prototype, {
          tint: {
            get: function() {
              return this._font.tint;
            },
            set: function(value) {
              this._font.tint = (typeof value === 'number' && value >= 0) ? value : 0xFFFFFF;
              this.dirty = true;
            }
          },
          align: {
            get: function() {
              return this._font.align;
            },
            set: function(value) {
              this._font.align = value || 'left';
              this.dirty = true;
            }
          },
          font: {
            get: function() {
              return this._font;
            },
            set: function(value) {
              if (!value) {
                return;
              }
              if (typeof value === 'string') {
                value = value.split(' ');
                this._font.name = value.length === 1 ? value[0] : value.slice(1).join(' ');
                this._font.size = value.length >= 2 ? parseInt(value[0], 10) : BitmapText.fonts[this._font.name].size;
              } else {
                this._font.name = value.name;
                this._font.size = typeof value.size === 'number' ? value.size : parseInt(value.size, 10);
              }
              this.dirty = true;
            }
          },
          text: {
            get: function() {
              return this._text;
            },
            set: function(value) {
              value = value.toString() || ' ';
              if (this._text === value) {
                return;
              }
              this._text = value;
              this.dirty = true;
            }
          }
        });
        BitmapText.prototype.updateText = function() {
          var data = BitmapText.fonts[this._font.name];
          var pos = new core.math.Point();
          var prevCharCode = null;
          var chars = [];
          var lastLineWidth = 0;
          var maxLineWidth = 0;
          var lineWidths = [];
          var line = 0;
          var scale = this._font.size / data.size;
          var lastSpace = -1;
          for (var i = 0; i < this.text.length; i++) {
            var charCode = this.text.charCodeAt(i);
            lastSpace = /(\s)/.test(this.text.charAt(i)) ? i : lastSpace;
            if (/(?:\r\n|\r|\n)/.test(this.text.charAt(i))) {
              lineWidths.push(lastLineWidth);
              maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
              line++;
              pos.x = 0;
              pos.y += data.lineHeight;
              prevCharCode = null;
              continue;
            }
            if (lastSpace !== -1 && this.maxWidth > 0 && pos.x * scale > this.maxWidth) {
              chars.splice(lastSpace, i - lastSpace);
              i = lastSpace;
              lastSpace = -1;
              lineWidths.push(lastLineWidth);
              maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
              line++;
              pos.x = 0;
              pos.y += data.lineHeight;
              prevCharCode = null;
              continue;
            }
            var charData = data.chars[charCode];
            if (!charData) {
              continue;
            }
            if (prevCharCode && charData.kerning[prevCharCode]) {
              pos.x += charData.kerning[prevCharCode];
            }
            chars.push({
              texture: charData.texture,
              line: line,
              charCode: charCode,
              position: new core.math.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)
            });
            lastLineWidth = pos.x + (charData.texture.width + charData.xOffset);
            pos.x += charData.xAdvance;
            prevCharCode = charCode;
          }
          lineWidths.push(lastLineWidth);
          maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
          var lineAlignOffsets = [];
          for (i = 0; i <= line; i++) {
            var alignOffset = 0;
            if (this._font.align === 'right') {
              alignOffset = maxLineWidth - lineWidths[i];
            } else if (this._font.align === 'center') {
              alignOffset = (maxLineWidth - lineWidths[i]) / 2;
            }
            lineAlignOffsets.push(alignOffset);
          }
          var lenChars = chars.length;
          var tint = this.tint;
          for (i = 0; i < lenChars; i++) {
            var c = this._glyphs[i];
            if (c) {
              c.texture = chars[i].texture;
            } else {
              c = new core.Sprite(chars[i].texture);
              this._glyphs.push(c);
            }
            c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
            c.position.y = chars[i].position.y * scale;
            c.scale.x = c.scale.y = scale;
            c.tint = tint;
            if (!c.parent) {
              this.addChild(c);
            }
          }
          for (i = lenChars; i < this._glyphs.length; ++i) {
            this.removeChild(this._glyphs[i]);
          }
          this.textWidth = maxLineWidth * scale;
          this.textHeight = (pos.y + data.lineHeight) * scale;
        };
        BitmapText.prototype.updateTransform = function() {
          this.validate();
          this.containerUpdateTransform();
        };
        BitmapText.prototype.getLocalBounds = function() {
          this.validate();
          return core.Container.prototype.getLocalBounds.call(this);
        };
        BitmapText.prototype.validate = function() {
          if (this.dirty) {
            this.updateText();
            this.dirty = false;
          }
        };
        BitmapText.fonts = {};
      }, {"../core": 29}],
      80: [function(require, module, exports) {
        var core = require('../core');
        function MovieClip(textures) {
          core.Sprite.call(this, textures[0]);
          this._textures = textures;
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
              this._textures = value;
              this.texture = this._textures[Math.floor(this._currentTime) % this._textures.length];
            }
          },
          currentFrame: {get: function() {
              return Math.floor(this._currentTime) % this._textures.length;
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
          var round = Math.floor(this._currentTime);
          this._texture = this._textures[round % this._textures.length];
        };
        MovieClip.prototype.gotoAndPlay = function(frameNumber) {
          this._currentTime = frameNumber;
          this.play();
        };
        MovieClip.prototype.update = function(deltaTime) {
          this._currentTime += this.animationSpeed * deltaTime;
          var floor = Math.floor(this._currentTime);
          if (floor < 0) {
            if (this.loop) {
              this._texture = this._textures[this._textures.length - 1 + floor % this._textures.length];
            } else {
              this.gotoAndStop(0);
              if (this.onComplete) {
                this.onComplete();
              }
            }
          } else if (this.loop || floor < this._textures.length) {
            this._texture = this._textures[floor % this._textures.length];
          } else if (floor >= this._textures.length) {
            this.gotoAndStop(this.textures.length - 1);
            if (this.onComplete) {
              this.onComplete();
            }
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
      }, {"../core": 29}],
      81: [function(require, module, exports) {
        var core = require('../core'),
            tempPoint = new core.Point();
        function TilingSprite(texture, width, height) {
          core.Sprite.call(this, texture);
          this.tileScale = new core.math.Point(1, 1);
          this.tilePosition = new core.math.Point(0, 0);
          this._width = width || 100;
          this._height = height || 100;
          this._uvs = new core.TextureUvs();
          this._canvasPattern = null;
          this.shader = new core.AbstractFilter(['precision lowp float;', 'attribute vec2 aVertexPosition;', 'attribute vec2 aTextureCoord;', 'attribute vec4 aColor;', 'uniform mat3 projectionMatrix;', 'uniform vec4 uFrame;', 'uniform vec4 uTransform;', 'varying vec2 vTextureCoord;', 'varying vec4 vColor;', 'void main(void){', '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);', '   vec2 coord = aTextureCoord;', '   coord -= uTransform.xy;', '   coord /= uTransform.zw;', '   coord /= uFrame.zw;', '   vTextureCoord = coord;', '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);', '}'].join('\n'), ['precision lowp float;', 'varying vec2 vTextureCoord;', 'varying vec4 vColor;', 'uniform sampler2D uSampler;', 'uniform vec4 uFrame;', 'void main(void){', '   vec2 coord = fract(vTextureCoord);', '   coord *= uFrame.zw;', '   coord += uFrame.xy;', '   gl_FragColor =  texture2D(uSampler, coord) * vColor ;', '}'].join('\n'), {
            uFrame: {
              type: '4fv',
              value: [0, 0, 1, 1]
            },
            uTransform: {
              type: '4fv',
              value: [0, 0, 1, 1]
            }
          });
        }
        TilingSprite.prototype = Object.create(core.Sprite.prototype);
        TilingSprite.prototype.constructor = TilingSprite;
        module.exports = TilingSprite;
        Object.defineProperties(TilingSprite.prototype, {
          width: {
            get: function() {
              return this._width;
            },
            set: function(value) {
              this._width = value;
            }
          },
          height: {
            get: function() {
              return this._height;
            },
            set: function(value) {
              this._height = value;
            }
          }
        });
        TilingSprite.prototype._onTextureUpdate = function() {
          return;
        };
        TilingSprite.prototype._renderWebGL = function(renderer) {
          var texture = this._texture;
          if (!texture || !texture._uvs) {
            return;
          }
          var tempUvs = texture._uvs,
              tempWidth = texture._frame.width,
              tempHeight = texture._frame.height,
              tw = texture.baseTexture.width,
              th = texture.baseTexture.height;
          texture._uvs = this._uvs;
          texture._frame.width = this.width;
          texture._frame.height = this.height;
          this.shader.uniforms.uFrame.value[0] = tempUvs.x0;
          this.shader.uniforms.uFrame.value[1] = tempUvs.y0;
          this.shader.uniforms.uFrame.value[2] = tempUvs.x1 - tempUvs.x0;
          this.shader.uniforms.uFrame.value[3] = tempUvs.y2 - tempUvs.y0;
          this.shader.uniforms.uTransform.value[0] = (this.tilePosition.x % (tempWidth * this.tileScale.x)) / this._width;
          this.shader.uniforms.uTransform.value[1] = (this.tilePosition.y % (tempHeight * this.tileScale.y)) / this._height;
          this.shader.uniforms.uTransform.value[2] = (tw / this._width) * this.tileScale.x;
          this.shader.uniforms.uTransform.value[3] = (th / this._height) * this.tileScale.y;
          renderer.setObjectRenderer(renderer.plugins.sprite);
          renderer.plugins.sprite.render(this);
          texture._uvs = tempUvs;
          texture._frame.width = tempWidth;
          texture._frame.height = tempHeight;
        };
        TilingSprite.prototype._renderCanvas = function(renderer) {
          var texture = this._texture;
          if (!texture.baseTexture.hasLoaded) {
            return;
          }
          var context = renderer.context,
              transform = this.worldTransform,
              resolution = renderer.resolution,
              baseTexture = texture.baseTexture,
              modX = this.tilePosition.x % (texture._frame.width * this.tileScale.x),
              modY = this.tilePosition.y % (texture._frame.height * this.tileScale.y);
          if (!this._canvasPattern) {
            var tempCanvas = new core.CanvasBuffer(texture._frame.width, texture._frame.height);
            tempCanvas.context.drawImage(baseTexture.source, -texture._frame.x, -texture._frame.y);
            this._canvasPattern = tempCanvas.context.createPattern(tempCanvas.canvas, 'repeat');
          }
          context.globalAlpha = this.worldAlpha;
          context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution);
          context.scale(this.tileScale.x, this.tileScale.y);
          context.translate(modX + (this.anchor.x * -this._width), modY + (this.anchor.y * -this._height));
          if (this.blendMode !== renderer.currentBlendMode) {
            renderer.currentBlendMode = this.blendMode;
            context.globalCompositeOperation = renderer.blendModes[renderer.currentBlendMode];
          }
          context.fillStyle = this._canvasPattern;
          context.fillRect(-modX, -modY, this._width / this.tileScale.x, this._height / this.tileScale.y);
        };
        TilingSprite.prototype.getBounds = function() {
          var width = this._width;
          var height = this._height;
          var w0 = width * (1 - this.anchor.x);
          var w1 = width * -this.anchor.x;
          var h0 = height * (1 - this.anchor.y);
          var h1 = height * -this.anchor.y;
          var worldTransform = this.worldTransform;
          var a = worldTransform.a;
          var b = worldTransform.b;
          var c = worldTransform.c;
          var d = worldTransform.d;
          var tx = worldTransform.tx;
          var ty = worldTransform.ty;
          var x1 = a * w1 + c * h1 + tx;
          var y1 = d * h1 + b * w1 + ty;
          var x2 = a * w0 + c * h1 + tx;
          var y2 = d * h1 + b * w0 + ty;
          var x3 = a * w0 + c * h0 + tx;
          var y3 = d * h0 + b * w0 + ty;
          var x4 = a * w1 + c * h0 + tx;
          var y4 = d * h0 + b * w1 + ty;
          var minX,
              maxX,
              minY,
              maxY;
          minX = x1;
          minX = x2 < minX ? x2 : minX;
          minX = x3 < minX ? x3 : minX;
          minX = x4 < minX ? x4 : minX;
          minY = y1;
          minY = y2 < minY ? y2 : minY;
          minY = y3 < minY ? y3 : minY;
          minY = y4 < minY ? y4 : minY;
          maxX = x1;
          maxX = x2 > maxX ? x2 : maxX;
          maxX = x3 > maxX ? x3 : maxX;
          maxX = x4 > maxX ? x4 : maxX;
          maxY = y1;
          maxY = y2 > maxY ? y2 : maxY;
          maxY = y3 > maxY ? y3 : maxY;
          maxY = y4 > maxY ? y4 : maxY;
          var bounds = this._bounds;
          bounds.x = minX;
          bounds.width = maxX - minX;
          bounds.y = minY;
          bounds.height = maxY - minY;
          this._currentBounds = bounds;
          return bounds;
        };
        TilingSprite.prototype.containsPoint = function(point) {
          this.worldTransform.applyInverse(point, tempPoint);
          var width = this._width;
          var height = this._height;
          var x1 = -width * this.anchor.x;
          var y1;
          if (tempPoint.x > x1 && tempPoint.x < x1 + width) {
            y1 = -height * this.anchor.y;
            if (tempPoint.y > y1 && tempPoint.y < y1 + height) {
              return true;
            }
          }
          return false;
        };
        TilingSprite.prototype.destroy = function() {
          core.Sprite.prototype.destroy.call(this);
          this.tileScale = null;
          this._tileScaleOffset = null;
          this.tilePosition = null;
          this._uvs = null;
        };
        TilingSprite.fromFrame = function(frameId, width, height) {
          var texture = core.utils.TextureCache[frameId];
          if (!texture) {
            throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ' + this);
          }
          return new TilingSprite(texture, width, height);
        };
        TilingSprite.fromImage = function(imageId, width, height, crossorigin, scaleMode) {
          return new TilingSprite(core.Texture.fromImage(imageId, crossorigin, scaleMode), width, height);
        };
      }, {"../core": 29}],
      82: [function(require, module, exports) {
        var core = require('../core'),
            DisplayObject = core.DisplayObject,
            _tempMatrix = new core.Matrix();
        DisplayObject.prototype._cacheAsBitmap = false;
        DisplayObject.prototype._originalRenderWebGL = null;
        DisplayObject.prototype._originalRenderCanvas = null;
        DisplayObject.prototype._originalUpdateTransform = null;
        DisplayObject.prototype._originalHitTest = null;
        DisplayObject.prototype._originalDestroy = null;
        DisplayObject.prototype._cachedSprite = null;
        Object.defineProperties(DisplayObject.prototype, {cacheAsBitmap: {
            get: function() {
              return this._cacheAsBitmap;
            },
            set: function(value) {
              if (this._cacheAsBitmap === value) {
                return;
              }
              this._cacheAsBitmap = value;
              if (value) {
                this._originalRenderWebGL = this.renderWebGL;
                this._originalRenderCanvas = this.renderCanvas;
                this._originalUpdateTransform = this.updateTransform;
                this._originalGetBounds = this.getBounds;
                this._originalDestroy = this.destroy;
                this._originalContainsPoint = this.containsPoint;
                this.renderWebGL = this._renderCachedWebGL;
                this.renderCanvas = this._renderCachedCanvas;
                this.destroy = this._cacheAsBitmapDestroy;
              } else {
                if (this._cachedSprite) {
                  this._destroyCachedDisplayObject();
                }
                this.renderWebGL = this._originalRenderWebGL;
                this.renderCanvas = this._originalRenderCanvas;
                this.getBounds = this._originalGetBounds;
                this.destroy = this._originalDestroy;
                this.updateTransform = this._originalUpdateTransform;
                this.containsPoint = this._originalContainsPoint;
              }
            }
          }});
        DisplayObject.prototype._renderCachedWebGL = function(renderer) {
          if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
          }
          this._initCachedDisplayObject(renderer);
          renderer.setObjectRenderer(renderer.plugins.sprite);
          renderer.plugins.sprite.render(this._cachedSprite);
        };
        DisplayObject.prototype._initCachedDisplayObject = function(renderer) {
          if (this._cachedSprite) {
            return;
          }
          renderer.currentRenderer.flush();
          var bounds = this.getLocalBounds().clone();
          if (this._filters) {
            var padding = this._filters[0].padding;
            bounds.x -= padding;
            bounds.y -= padding;
            bounds.width += padding * 2;
            bounds.height += padding * 2;
          }
          var cachedRenderTarget = renderer.currentRenderTarget;
          var stack = renderer.filterManager.filterStack;
          var renderTexture = new core.RenderTexture(renderer, bounds.width | 0, bounds.height | 0);
          var m = _tempMatrix;
          m.tx = -bounds.x;
          m.ty = -bounds.y;
          this.renderWebGL = this._originalRenderWebGL;
          renderTexture.render(this, m, true, true);
          renderer.setRenderTarget(cachedRenderTarget);
          renderer.filterManager.filterStack = stack;
          this.renderWebGL = this._renderCachedWebGL;
          this.updateTransform = this.displayObjectUpdateTransform;
          this.getBounds = this._getCachedBounds;
          this._cachedSprite = new core.Sprite(renderTexture);
          this._cachedSprite.worldTransform = this.worldTransform;
          this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
          this._cachedSprite.anchor.y = -(bounds.y / bounds.height);
          this.updateTransform();
          this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
        };
        DisplayObject.prototype._renderCachedCanvas = function(renderer) {
          if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
          }
          this._initCachedDisplayObjectCanvas(renderer);
          this._cachedSprite.worldAlpha = this.worldAlpha;
          this._cachedSprite.renderCanvas(renderer);
        };
        DisplayObject.prototype._initCachedDisplayObjectCanvas = function(renderer) {
          if (this._cachedSprite) {
            return;
          }
          var bounds = this.getLocalBounds();
          var cachedRenderTarget = renderer.context;
          var renderTexture = new core.RenderTexture(renderer, bounds.width | 0, bounds.height | 0);
          var m = _tempMatrix;
          m.tx = -bounds.x;
          m.ty = -bounds.y;
          this.renderCanvas = this._originalRenderCanvas;
          renderTexture.render(this, m, true);
          renderer.context = cachedRenderTarget;
          this.renderCanvas = this._renderCachedCanvas;
          this.updateTransform = this.displayObjectUpdateTransform;
          this.getBounds = this._getCachedBounds;
          this._cachedSprite = new core.Sprite(renderTexture);
          this._cachedSprite.worldTransform = this.worldTransform;
          this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
          this._cachedSprite.anchor.y = -(bounds.y / bounds.height);
          this.updateTransform();
          this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
        };
        DisplayObject.prototype._getCachedBounds = function() {
          this._cachedSprite._currentBounds = null;
          return this._cachedSprite.getBounds();
        };
        DisplayObject.prototype._destroyCachedDisplayObject = function() {
          this._cachedSprite._texture.destroy();
          this._cachedSprite = null;
        };
        DisplayObject.prototype._cacheAsBitmapDestroy = function() {
          this.cacheAsBitmap = false;
          this._originalDestroy();
        };
      }, {"../core": 29}],
      83: [function(require, module, exports) {
        var core = require('../core');
        core.DisplayObject.prototype.name = null;
        core.Container.prototype.getChildByName = function(name) {
          for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].name === name) {
              return this.children[i];
            }
          }
          return null;
        };
      }, {"../core": 29}],
      84: [function(require, module, exports) {
        var core = require('../core');
        core.DisplayObject.prototype.getGlobalPosition = function(point) {
          point = point || new core.Point();
          if (this.parent) {
            this.displayObjectUpdateTransform();
            point.x = this.worldTransform.tx;
            point.y = this.worldTransform.ty;
          } else {
            point.x = this.position.x;
            point.y = this.position.y;
          }
          return point;
        };
      }, {"../core": 29}],
      85: [function(require, module, exports) {
        require('./cacheAsBitmap');
        require('./getChildByName');
        require('./getGlobalPosition');
        module.exports = {
          MovieClip: require('./MovieClip'),
          TilingSprite: require('./TilingSprite'),
          BitmapText: require('./BitmapText')
        };
      }, {
        "./BitmapText": 79,
        "./MovieClip": 80,
        "./TilingSprite": 81,
        "./cacheAsBitmap": 82,
        "./getChildByName": 83,
        "./getGlobalPosition": 84
      }],
      86: [function(require, module, exports) {
        var core = require('../../core');
        function AsciiFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nuniform vec4 dimensions;\nuniform float pixelSize;\nuniform sampler2D uSampler;\n\nfloat character(float n, vec2 p)\n{\n    p = floor(p*vec2(4.0, -4.0) + 2.5);\n    if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y)\n    {\n        if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;\n    }\n    return 0.0;\n}\n\nvoid main()\n{\n    vec2 uv = gl_FragCoord.xy;\n\n    vec3 col = texture2D(uSampler, floor( uv / pixelSize ) * pixelSize / dimensions.xy).rgb;\n\n    float gray = (col.r + col.g + col.b) / 3.0;\n\n    float n =  65536.0;             // .\n    if (gray > 0.2) n = 65600.0;    // :\n    if (gray > 0.3) n = 332772.0;   // *\n    if (gray > 0.4) n = 15255086.0; // o\n    if (gray > 0.5) n = 23385164.0; // &\n    if (gray > 0.6) n = 15252014.0; // 8\n    if (gray > 0.7) n = 13199452.0; // @\n    if (gray > 0.8) n = 11512810.0; // #\n\n    vec2 p = mod( uv / ( pixelSize * 0.5 ), 2.0) - vec2(1.0);\n    col = col * character(n, p);\n\n    gl_FragColor = vec4(col, 1.0);\n}\n", {
            dimensions: {
              type: '4fv',
              value: new Float32Array([0, 0, 0, 0])
            },
            pixelSize: {
              type: '1f',
              value: 8
            }
          });
        }
        AsciiFilter.prototype = Object.create(core.AbstractFilter.prototype);
        AsciiFilter.prototype.constructor = AsciiFilter;
        module.exports = AsciiFilter;
        Object.defineProperties(AsciiFilter.prototype, {size: {
            get: function() {
              return this.uniforms.pixelSize.value;
            },
            set: function(value) {
              this.uniforms.pixelSize.value = value;
            }
          }});
      }, {"../../core": 29}],
      87: [function(require, module, exports) {
        var core = require('../../core'),
            BlurXFilter = require('../blur/BlurXFilter'),
            BlurYFilter = require('../blur/BlurYFilter');
        function BloomFilter() {
          core.AbstractFilter.call(this);
          this.blurXFilter = new BlurXFilter();
          this.blurYFilter = new BlurYFilter();
          this.defaultFilter = new core.AbstractFilter();
        }
        BloomFilter.prototype = Object.create(core.AbstractFilter.prototype);
        BloomFilter.prototype.constructor = BloomFilter;
        module.exports = BloomFilter;
        BloomFilter.prototype.applyFilter = function(renderer, input, output) {
          var renderTarget = renderer.filterManager.getRenderTarget(true);
          this.defaultFilter.applyFilter(renderer, input, output);
          this.blurXFilter.applyFilter(renderer, input, renderTarget);
          renderer.blendModeManager.setBlendMode(core.BLEND_MODES.SCREEN);
          this.blurYFilter.applyFilter(renderer, renderTarget, output);
          renderer.blendModeManager.setBlendMode(core.BLEND_MODES.NORMAL);
          renderer.filterManager.returnRenderTarget(renderTarget);
        };
        Object.defineProperties(BloomFilter.prototype, {
          blur: {
            get: function() {
              return this.blurXFilter.blur;
            },
            set: function(value) {
              this.blurXFilter.blur = this.blurYFilter.blur = value;
            }
          },
          blurX: {
            get: function() {
              return this.blurXFilter.blur;
            },
            set: function(value) {
              this.blurXFilter.blur = value;
            }
          },
          blurY: {
            get: function() {
              return this.blurYFilter.blur;
            },
            set: function(value) {
              this.blurYFilter.blur = value;
            }
          }
        });
      }, {
        "../../core": 29,
        "../blur/BlurXFilter": 90,
        "../blur/BlurYFilter": 91
      }],
      88: [function(require, module, exports) {
        var core = require('../../core');
        function BlurDirFilter(dirX, dirY) {
          core.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform float dirX;\nuniform float dirY;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[3];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[0] = aTextureCoord + vec2( (0.004 * strength) * dirX, (0.004 * strength) * dirY );\n    vBlurTexCoords[1] = aTextureCoord + vec2( (0.008 * strength) * dirX, (0.008 * strength) * dirY );\n    vBlurTexCoords[2] = aTextureCoord + vec2( (0.012 * strength) * dirX, (0.012 * strength) * dirY );\n\n    vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[3];\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = vec4(0.0);\n\n    gl_FragColor += texture2D(uSampler, vTextureCoord     ) * 0.3989422804014327;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0]) * 0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1]) * 0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2]) * 0.004431848411938341;\n}\n", {
            strength: {
              type: '1f',
              value: 1
            },
            dirX: {
              type: '1f',
              value: dirX || 0
            },
            dirY: {
              type: '1f',
              value: dirY || 0
            }
          });
          this.defaultFilter = new core.AbstractFilter();
          this.passes = 1;
          this.dirX = dirX || 0;
          this.dirY = dirY || 0;
          this.strength = 4;
        }
        BlurDirFilter.prototype = Object.create(core.AbstractFilter.prototype);
        BlurDirFilter.prototype.constructor = BlurDirFilter;
        module.exports = BlurDirFilter;
        BlurDirFilter.prototype.applyFilter = function(renderer, input, output, clear) {
          var shader = this.getShader(renderer);
          this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.width / input.size.width);
          if (this.passes === 1) {
            renderer.filterManager.applyFilter(shader, input, output, clear);
          } else {
            var renderTarget = renderer.filterManager.getRenderTarget(true);
            renderer.filterManager.applyFilter(shader, input, renderTarget, clear);
            for (var i = 0; i < this.passes - 2; i++) {
              renderer.filterManager.applyFilter(shader, renderTarget, renderTarget, clear);
            }
            renderer.filterManager.applyFilter(shader, renderTarget, output, clear);
            renderer.filterManager.returnRenderTarget(renderTarget);
          }
        };
        Object.defineProperties(BlurDirFilter.prototype, {
          blur: {
            get: function() {
              return this.strength;
            },
            set: function(value) {
              this.padding = value * 0.5;
              this.strength = value;
            }
          },
          dirX: {
            get: function() {
              return this.dirX;
            },
            set: function(value) {
              this.uniforms.dirX.value = value;
            }
          },
          dirY: {
            get: function() {
              return this.dirY;
            },
            set: function(value) {
              this.uniforms.dirY.value = value;
            }
          }
        });
      }, {"../../core": 29}],
      89: [function(require, module, exports) {
        var core = require('../../core'),
            BlurXFilter = require('./BlurXFilter'),
            BlurYFilter = require('./BlurYFilter');
        function BlurFilter() {
          core.AbstractFilter.call(this);
          this.blurXFilter = new BlurXFilter();
          this.blurYFilter = new BlurYFilter();
        }
        BlurFilter.prototype = Object.create(core.AbstractFilter.prototype);
        BlurFilter.prototype.constructor = BlurFilter;
        module.exports = BlurFilter;
        BlurFilter.prototype.applyFilter = function(renderer, input, output) {
          var renderTarget = renderer.filterManager.getRenderTarget(true);
          this.blurXFilter.applyFilter(renderer, input, renderTarget);
          this.blurYFilter.applyFilter(renderer, renderTarget, output);
          renderer.filterManager.returnRenderTarget(renderTarget);
        };
        Object.defineProperties(BlurFilter.prototype, {
          blur: {
            get: function() {
              return this.blurXFilter.blur;
            },
            set: function(value) {
              this.padding = Math.abs(value) * 0.5;
              this.blurXFilter.blur = this.blurYFilter.blur = value;
            }
          },
          passes: {
            get: function() {
              return this.blurXFilter.passes;
            },
            set: function(value) {
              this.blurXFilter.passes = this.blurYFilter.passes = value;
            }
          },
          blurX: {
            get: function() {
              return this.blurXFilter.blur;
            },
            set: function(value) {
              this.blurXFilter.blur = value;
            }
          },
          blurY: {
            get: function() {
              return this.blurYFilter.blur;
            },
            set: function(value) {
              this.blurYFilter.blur = value;
            }
          }
        });
      }, {
        "../../core": 29,
        "./BlurXFilter": 90,
        "./BlurYFilter": 91
      }],
      90: [function(require, module, exports) {
        var core = require('../../core');
        function BlurXFilter() {
          core.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[6];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[ 0] = aTextureCoord + vec2(-0.012 * strength, 0.0);\n    vBlurTexCoords[ 1] = aTextureCoord + vec2(-0.008 * strength, 0.0);\n    vBlurTexCoords[ 2] = aTextureCoord + vec2(-0.004 * strength, 0.0);\n    vBlurTexCoords[ 3] = aTextureCoord + vec2( 0.004 * strength, 0.0);\n    vBlurTexCoords[ 4] = aTextureCoord + vec2( 0.008 * strength, 0.0);\n    vBlurTexCoords[ 5] = aTextureCoord + vec2( 0.012 * strength, 0.0);\n\n    vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[6];\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = vec4(0.0);\n\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;\n}\n", {strength: {
              type: '1f',
              value: 1
            }});
          this.passes = 1;
          this.strength = 4;
        }
        BlurXFilter.prototype = Object.create(core.AbstractFilter.prototype);
        BlurXFilter.prototype.constructor = BlurXFilter;
        module.exports = BlurXFilter;
        BlurXFilter.prototype.applyFilter = function(renderer, input, output, clear) {
          var shader = this.getShader(renderer);
          this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.width / input.size.width);
          if (this.passes === 1) {
            renderer.filterManager.applyFilter(shader, input, output, clear);
          } else {
            var renderTarget = renderer.filterManager.getRenderTarget(true);
            var flip = input;
            var flop = renderTarget;
            for (var i = 0; i < this.passes - 1; i++) {
              renderer.filterManager.applyFilter(shader, flip, flop, true);
              var temp = flop;
              flop = flip;
              flip = temp;
            }
            renderer.filterManager.applyFilter(shader, flip, output, clear);
            renderer.filterManager.returnRenderTarget(renderTarget);
          }
        };
        Object.defineProperties(BlurXFilter.prototype, {blur: {
            get: function() {
              return this.strength;
            },
            set: function(value) {
              this.padding = Math.abs(value) * 0.5;
              this.strength = value;
            }
          }});
      }, {"../../core": 29}],
      91: [function(require, module, exports) {
        var core = require('../../core');
        function BlurYFilter() {
          core.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[6];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[ 0] = aTextureCoord + vec2(0.0, -0.012 * strength);\n    vBlurTexCoords[ 1] = aTextureCoord + vec2(0.0, -0.008 * strength);\n    vBlurTexCoords[ 2] = aTextureCoord + vec2(0.0, -0.004 * strength);\n    vBlurTexCoords[ 3] = aTextureCoord + vec2(0.0,  0.004 * strength);\n    vBlurTexCoords[ 4] = aTextureCoord + vec2(0.0,  0.008 * strength);\n    vBlurTexCoords[ 5] = aTextureCoord + vec2(0.0,  0.012 * strength);\n\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[6];\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = vec4(0.0);\n\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;\n}\n", {strength: {
              type: '1f',
              value: 1
            }});
          this.passes = 1;
          this.strength = 4;
        }
        BlurYFilter.prototype = Object.create(core.AbstractFilter.prototype);
        BlurYFilter.prototype.constructor = BlurYFilter;
        module.exports = BlurYFilter;
        BlurYFilter.prototype.applyFilter = function(renderer, input, output, clear) {
          var shader = this.getShader(renderer);
          this.uniforms.strength.value = Math.abs(this.strength) / 4 / this.passes * (input.frame.height / input.size.height);
          if (this.passes === 1) {
            renderer.filterManager.applyFilter(shader, input, output, clear);
          } else {
            var renderTarget = renderer.filterManager.getRenderTarget(true);
            var flip = input;
            var flop = renderTarget;
            for (var i = 0; i < this.passes - 1; i++) {
              renderer.filterManager.applyFilter(shader, flip, flop, true);
              var temp = flop;
              flop = flip;
              flip = temp;
            }
            renderer.filterManager.applyFilter(shader, flip, output, clear);
            renderer.filterManager.returnRenderTarget(renderTarget);
          }
        };
        Object.defineProperties(BlurYFilter.prototype, {blur: {
            get: function() {
              return this.strength;
            },
            set: function(value) {
              this.padding = Math.abs(value) * 0.5;
              this.strength = value;
            }
          }});
      }, {"../../core": 29}],
      92: [function(require, module, exports) {
        var core = require('../../core');
        function SmartBlurFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 delta;\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n    for (float t = -30.0; t <= 30.0; t++)\n    {\n        float percent = (t + offset - 0.5) / 30.0;\n        float weight = 1.0 - abs(percent);\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta * percent);\n        sample.rgb *= sample.a;\n        color += sample * weight;\n        total += weight;\n    }\n\n    gl_FragColor = color / total;\n    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n}\n", {delta: {
              type: 'v2',
              value: {
                x: 0.1,
                y: 0.0
              }
            }});
        }
        SmartBlurFilter.prototype = Object.create(core.AbstractFilter.prototype);
        SmartBlurFilter.prototype.constructor = SmartBlurFilter;
        module.exports = SmartBlurFilter;
      }, {"../../core": 29}],
      93: [function(require, module, exports) {
        var core = require('../../core');
        function ColorMatrixFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float m[25];\n\nvoid main(void)\n{\n\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    gl_FragColor.r = (m[0] * c.r);\n        gl_FragColor.r += (m[1] * c.g);\n        gl_FragColor.r += (m[2] * c.b);\n        gl_FragColor.r += (m[3] * c.a);\n        gl_FragColor.r += m[4];\n\n    gl_FragColor.g = (m[5] * c.r);\n        gl_FragColor.g += (m[6] * c.g);\n        gl_FragColor.g += (m[7] * c.b);\n        gl_FragColor.g += (m[8] * c.a);\n        gl_FragColor.g += m[9];\n\n     gl_FragColor.b = (m[10] * c.r);\n        gl_FragColor.b += (m[11] * c.g);\n        gl_FragColor.b += (m[12] * c.b);\n        gl_FragColor.b += (m[13] * c.a);\n        gl_FragColor.b += m[14];\n\n     gl_FragColor.a = (m[15] * c.r);\n        gl_FragColor.a += (m[16] * c.g);\n        gl_FragColor.a += (m[17] * c.b);\n        gl_FragColor.a += (m[18] * c.a);\n        gl_FragColor.a += m[19];\n\n}\n", {m: {
              type: '1fv',
              value: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
            }});
        }
        ColorMatrixFilter.prototype = Object.create(core.AbstractFilter.prototype);
        ColorMatrixFilter.prototype.constructor = ColorMatrixFilter;
        module.exports = ColorMatrixFilter;
        ColorMatrixFilter.prototype._loadMatrix = function(matrix, multiply) {
          multiply = !!multiply;
          var newMatrix = matrix;
          if (multiply) {
            this._multiply(newMatrix, this.uniforms.m.value, matrix);
            newMatrix = this._colorMatrix(newMatrix);
          }
          this.uniforms.m.value = newMatrix;
        };
        ColorMatrixFilter.prototype._multiply = function(out, a, b) {
          out[0] = (a[0] * b[0]) + (a[1] * b[5]) + (a[2] * b[10]) + (a[3] * b[15]);
          out[1] = (a[0] * b[1]) + (a[1] * b[6]) + (a[2] * b[11]) + (a[3] * b[16]);
          out[2] = (a[0] * b[2]) + (a[1] * b[7]) + (a[2] * b[12]) + (a[3] * b[17]);
          out[3] = (a[0] * b[3]) + (a[1] * b[8]) + (a[2] * b[13]) + (a[3] * b[18]);
          out[4] = (a[0] * b[4]) + (a[1] * b[9]) + (a[2] * b[14]) + (a[3] * b[19]);
          out[5] = (a[5] * b[0]) + (a[6] * b[5]) + (a[7] * b[10]) + (a[8] * b[15]);
          out[6] = (a[5] * b[1]) + (a[6] * b[6]) + (a[7] * b[11]) + (a[8] * b[16]);
          out[7] = (a[5] * b[2]) + (a[6] * b[7]) + (a[7] * b[12]) + (a[8] * b[17]);
          out[8] = (a[5] * b[3]) + (a[6] * b[8]) + (a[7] * b[13]) + (a[8] * b[18]);
          out[9] = (a[5] * b[4]) + (a[6] * b[9]) + (a[7] * b[14]) + (a[8] * b[19]);
          out[10] = (a[10] * b[0]) + (a[11] * b[5]) + (a[12] * b[10]) + (a[13] * b[15]);
          out[11] = (a[10] * b[1]) + (a[11] * b[6]) + (a[12] * b[11]) + (a[13] * b[16]);
          out[12] = (a[10] * b[2]) + (a[11] * b[7]) + (a[12] * b[12]) + (a[13] * b[17]);
          out[13] = (a[10] * b[3]) + (a[11] * b[8]) + (a[12] * b[13]) + (a[13] * b[18]);
          out[14] = (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]);
          out[15] = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15]);
          out[16] = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16]);
          out[17] = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17]);
          out[18] = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18]);
          out[19] = (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]);
          return out;
        };
        ColorMatrixFilter.prototype._colorMatrix = function(matrix) {
          var m = new Float32Array(matrix);
          m[4] /= 255;
          m[9] /= 255;
          m[14] /= 255;
          m[19] /= 255;
          return m;
        };
        ColorMatrixFilter.prototype.brightness = function(b, multiply) {
          var matrix = [b, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.greyscale = function(scale, multiply) {
          var matrix = [scale, scale, scale, 0, 0, scale, scale, scale, 0, 0, scale, scale, scale, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.grayscale = ColorMatrixFilter.prototype.greyscale;
        ColorMatrixFilter.prototype.blackAndWhite = function(multiply) {
          var matrix = [0.3, 0.6, 0.1, 0, 0, 0.3, 0.6, 0.1, 0, 0, 0.3, 0.6, 0.1, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.hue = function(rotation, multiply) {
          rotation = (rotation || 0) / 180 * Math.PI;
          var cos = Math.cos(rotation),
              sin = Math.sin(rotation);
          var lumR = 0.213,
              lumG = 0.715,
              lumB = 0.072;
          var matrix = [lumR + cos * (1 - lumR) + sin * (-lumR), lumG + cos * (-lumG) + sin * (-lumG), lumB + cos * (-lumB) + sin * (1 - lumB), 0, 0, lumR + cos * (-lumR) + sin * (0.143), lumG + cos * (1 - lumG) + sin * (0.140), lumB + cos * (-lumB) + sin * (-0.283), 0, 0, lumR + cos * (-lumR) + sin * (-(1 - lumR)), lumG + cos * (-lumG) + sin * (lumG), lumB + cos * (1 - lumB) + sin * (lumB), 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.contrast = function(amount, multiply) {
          var v = (amount || 0) + 1;
          var o = -128 * (v - 1);
          var matrix = [v, 0, 0, 0, o, 0, v, 0, 0, o, 0, 0, v, 0, o, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.saturate = function(amount, multiply) {
          var x = (amount || 0) * 2 / 3 + 1;
          var y = ((x - 1) * -0.5);
          var matrix = [x, y, y, 0, 0, y, x, y, 0, 0, y, y, x, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.desaturate = function(multiply) {
          this.saturate(-1);
        };
        ColorMatrixFilter.prototype.negative = function(multiply) {
          var matrix = [0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.sepia = function(multiply) {
          var matrix = [0.393, 0.7689999, 0.18899999, 0, 0, 0.349, 0.6859999, 0.16799999, 0, 0, 0.272, 0.5339999, 0.13099999, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.technicolor = function(multiply) {
          var matrix = [1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 11.793603434377337, -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -70.35205161461398, -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.polaroid = function(multiply) {
          var matrix = [1.438, -0.062, -0.062, 0, 0, -0.122, 1.378, -0.122, 0, 0, -0.016, -0.016, 1.483, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.toBGR = function(multiply) {
          var matrix = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.kodachrome = function(multiply) {
          var matrix = [1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 63.72958762196502, -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 24.732407896706203, -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.browni = function(multiply) {
          var matrix = [0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 47.43192855600873, -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -36.96841498319127, 0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -7.562075277591283, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.vintage = function(multiply) {
          var matrix = [0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 9.651285835294123, 0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 7.462829176470591, 0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 5.159190588235296, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.colorTone = function(desaturation, toned, lightColor, darkColor, multiply) {
          desaturation = desaturation || 0.2;
          toned = toned || 0.15;
          lightColor = lightColor || 0xFFE580;
          darkColor = darkColor || 0x338000;
          var lR = ((lightColor >> 16) & 0xFF) / 255;
          var lG = ((lightColor >> 8) & 0xFF) / 255;
          var lB = (lightColor & 0xFF) / 255;
          var dR = ((darkColor >> 16) & 0xFF) / 255;
          var dG = ((darkColor >> 8) & 0xFF) / 255;
          var dB = (darkColor & 0xFF) / 255;
          var matrix = [0.3, 0.59, 0.11, 0, 0, lR, lG, lB, desaturation, 0, dR, dG, dB, toned, 0, lR - dR, lG - dG, lB - dB, 0, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.night = function(intensity, multiply) {
          intensity = intensity || 0.1;
          var matrix = [intensity * (-2.0), -intensity, 0, 0, 0, -intensity, 0, intensity, 0, 0, 0, intensity, intensity * 2.0, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.predator = function(amount, multiply) {
          var matrix = [11.224130630493164 * amount, -4.794486999511719 * amount, -2.8746118545532227 * amount, 0 * amount, 0.40342438220977783 * amount, -3.6330697536468506 * amount, 9.193157196044922 * amount, -2.951810836791992 * amount, 0 * amount, -1.316135048866272 * amount, -3.2184197902679443 * amount, -4.2375030517578125 * amount, 7.476448059082031 * amount, 0 * amount, 0.8044459223747253 * amount, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.lsd = function(multiply) {
          var matrix = [2, -0.4, 0.5, 0, 0, -0.5, 2, -0.4, 0, 0, -0.4, -0.5, 3, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, multiply);
        };
        ColorMatrixFilter.prototype.reset = function() {
          var matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
          this._loadMatrix(matrix, false);
        };
        Object.defineProperties(ColorMatrixFilter.prototype, {matrix: {
            get: function() {
              return this.uniforms.m.value;
            },
            set: function(value) {
              this.uniforms.m.value = value;
            }
          }});
      }, {"../../core": 29}],
      94: [function(require, module, exports) {
        var core = require('../../core');
        function ColorStepFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float step;\n\nvoid main(void)\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    color = floor(color * step) / step;\n\n    gl_FragColor = color;\n}\n", {step: {
              type: '1f',
              value: 5
            }});
        }
        ColorStepFilter.prototype = Object.create(core.AbstractFilter.prototype);
        ColorStepFilter.prototype.constructor = ColorStepFilter;
        module.exports = ColorStepFilter;
        Object.defineProperties(ColorStepFilter.prototype, {step: {
            get: function() {
              return this.uniforms.step.value;
            },
            set: function(value) {
              this.uniforms.step.value = value;
            }
          }});
      }, {"../../core": 29}],
      95: [function(require, module, exports) {
        var core = require('../../core');
        function ConvolutionFilter(matrix, width, height) {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying mediump vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 texelSize;\nuniform float matrix[9];\n\nvoid main(void)\n{\n   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left\n   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center\n   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right\n\n   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left\n   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center\n   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right\n\n   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left\n   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center\n   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right\n\n   gl_FragColor =\n       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +\n       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +\n       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];\n\n   gl_FragColor.a = c22.a;\n}\n", {
            matrix: {
              type: '1fv',
              value: new Float32Array(matrix)
            },
            texelSize: {
              type: 'v2',
              value: {
                x: 1 / width,
                y: 1 / height
              }
            }
          });
        }
        ConvolutionFilter.prototype = Object.create(core.AbstractFilter.prototype);
        ConvolutionFilter.prototype.constructor = ConvolutionFilter;
        module.exports = ConvolutionFilter;
        Object.defineProperties(ConvolutionFilter.prototype, {
          matrix: {
            get: function() {
              return this.uniforms.matrix.value;
            },
            set: function(value) {
              this.uniforms.matrix.value = new Float32Array(value);
            }
          },
          width: {
            get: function() {
              return 1 / this.uniforms.texelSize.value.x;
            },
            set: function(value) {
              this.uniforms.texelSize.value.x = 1 / value;
            }
          },
          height: {
            get: function() {
              return 1 / this.uniforms.texelSize.value.y;
            },
            set: function(value) {
              this.uniforms.texelSize.value.y = 1 / value;
            }
          }
        });
      }, {"../../core": 29}],
      96: [function(require, module, exports) {
        var core = require('../../core');
        function CrossHatchFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);\n\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n\n    if (lum < 1.00)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.75)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.50)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.3)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n}\n");
        }
        CrossHatchFilter.prototype = Object.create(core.AbstractFilter.prototype);
        CrossHatchFilter.prototype.constructor = CrossHatchFilter;
        module.exports = CrossHatchFilter;
      }, {"../../core": 29}],
      97: [function(require, module, exports) {
        var core = require('../../core');
        function DisplacementFilter(sprite) {
          var maskMatrix = new core.math.Matrix();
          sprite.renderable = false;
          core.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMapCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvoid main(void)\n{\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n   vMapCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vMapCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec2 scale;\n\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nvoid main(void)\n{\n   vec4 original =  texture2D(uSampler, vTextureCoord);\n   vec4 map =  texture2D(mapSampler, vMapCoord);\n\n   map -= 0.5;\n   map.xy *= scale;\n\n   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y));\n}\n", {
            mapSampler: {
              type: 'sampler2D',
              value: sprite.texture
            },
            otherMatrix: {
              type: 'mat3',
              value: maskMatrix.toArray(true)
            },
            scale: {
              type: 'v2',
              value: {
                x: 1,
                y: 1
              }
            }
          });
          this.maskSprite = sprite;
          this.maskMatrix = maskMatrix;
          this.scale = new core.math.Point(20, 20);
        }
        DisplacementFilter.prototype = Object.create(core.AbstractFilter.prototype);
        DisplacementFilter.prototype.constructor = DisplacementFilter;
        module.exports = DisplacementFilter;
        DisplacementFilter.prototype.applyFilter = function(renderer, input, output) {
          var filterManager = renderer.filterManager;
          filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);
          this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);
          this.uniforms.scale.value.x = this.scale.x * (1 / input.frame.width);
          this.uniforms.scale.value.y = this.scale.y * (1 / input.frame.height);
          var shader = this.getShader(renderer);
          filterManager.applyFilter(shader, input, output);
        };
        Object.defineProperties(DisplacementFilter.prototype, {map: {
            get: function() {
              return this.uniforms.mapSampler.value;
            },
            set: function(value) {
              this.uniforms.mapSampler.value = value;
            }
          }});
      }, {"../../core": 29}],
      98: [function(require, module, exports) {
        var core = require('../../core');
        function DotScreenFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec4 dimensions;\nuniform sampler2D uSampler;\n\nuniform float angle;\nuniform float scale;\n\nfloat pattern()\n{\n   float s = sin(angle), c = cos(angle);\n   vec2 tex = vTextureCoord * dimensions.xy;\n   vec2 point = vec2(\n       c * tex.x - s * tex.y,\n       s * tex.x + c * tex.y\n   ) * scale;\n   return (sin(point.x) * sin(point.y)) * 4.0;\n}\n\nvoid main()\n{\n   vec4 color = texture2D(uSampler, vTextureCoord);\n   float average = (color.r + color.g + color.b) / 3.0;\n   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n}\n", {
            scale: {
              type: '1f',
              value: 1
            },
            angle: {
              type: '1f',
              value: 5
            },
            dimensions: {
              type: '4fv',
              value: [0, 0, 0, 0]
            }
          });
        }
        DotScreenFilter.prototype = Object.create(core.AbstractFilter.prototype);
        DotScreenFilter.prototype.constructor = DotScreenFilter;
        module.exports = DotScreenFilter;
        Object.defineProperties(DotScreenFilter.prototype, {
          scale: {
            get: function() {
              return this.uniforms.scale.value;
            },
            set: function(value) {
              this.uniforms.scale.value = value;
            }
          },
          angle: {
            get: function() {
              return this.uniforms.angle.value;
            },
            set: function(value) {
              this.uniforms.angle.value = value;
            }
          }
        });
      }, {"../../core": 29}],
      99: [function(require, module, exports) {
        var core = require('../../core');
        function BlurYTintFilter() {
          core.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform vec2 offset;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[6];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition+offset), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[ 0] = aTextureCoord + vec2(0.0, -0.012 * strength);\n    vBlurTexCoords[ 1] = aTextureCoord + vec2(0.0, -0.008 * strength);\n    vBlurTexCoords[ 2] = aTextureCoord + vec2(0.0, -0.004 * strength);\n    vBlurTexCoords[ 3] = aTextureCoord + vec2(0.0,  0.004 * strength);\n    vBlurTexCoords[ 4] = aTextureCoord + vec2(0.0,  0.008 * strength);\n    vBlurTexCoords[ 5] = aTextureCoord + vec2(0.0,  0.012 * strength);\n\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[6];\nvarying vec4 vColor;\n\nuniform vec3 color;\nuniform float alpha;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec4 sum = vec4(0.0);\n\n    sum += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;\n    sum += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;\n    sum += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;\n    sum += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;\n    sum += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;\n    sum += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;\n    sum += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;\n\n    gl_FragColor = vec4( color.rgb * sum.a * alpha, sum.a * alpha );\n}\n", {
            blur: {
              type: '1f',
              value: 1 / 512
            },
            color: {
              type: 'c',
              value: [0, 0, 0]
            },
            alpha: {
              type: '1f',
              value: 0.7
            },
            offset: {
              type: '2f',
              value: [5, 5]
            },
            strength: {
              type: '1f',
              value: 1
            }
          });
          this.passes = 1;
          this.strength = 4;
        }
        BlurYTintFilter.prototype = Object.create(core.AbstractFilter.prototype);
        BlurYTintFilter.prototype.constructor = BlurYTintFilter;
        module.exports = BlurYTintFilter;
        BlurYTintFilter.prototype.applyFilter = function(renderer, input, output, clear) {
          var shader = this.getShader(renderer);
          this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.height / input.size.height);
          if (this.passes === 1) {
            renderer.filterManager.applyFilter(shader, input, output, clear);
          } else {
            var renderTarget = renderer.filterManager.getRenderTarget(true);
            var flip = input;
            var flop = renderTarget;
            for (var i = 0; i < this.passes - 1; i++) {
              renderer.filterManager.applyFilter(shader, flip, flop, clear);
              var temp = flop;
              flop = flip;
              flip = temp;
            }
            renderer.filterManager.applyFilter(shader, flip, output, clear);
            renderer.filterManager.returnRenderTarget(renderTarget);
          }
        };
        Object.defineProperties(BlurYTintFilter.prototype, {blur: {
            get: function() {
              return this.strength;
            },
            set: function(value) {
              this.padding = value * 0.5;
              this.strength = value;
            }
          }});
      }, {"../../core": 29}],
      100: [function(require, module, exports) {
        var core = require('../../core'),
            BlurXFilter = require('../blur/BlurXFilter'),
            BlurYTintFilter = require('./BlurYTintFilter');
        function DropShadowFilter() {
          core.AbstractFilter.call(this);
          this.blurXFilter = new BlurXFilter();
          this.blurYTintFilter = new BlurYTintFilter();
          this.defaultFilter = new core.AbstractFilter();
          this.padding = 30;
          this._dirtyPosition = true;
          this._angle = 45 * Math.PI / 180;
          this._distance = 10;
          this.alpha = 0.75;
          this.hideObject = false;
          this.blendMode = core.BLEND_MODES.MULTIPLY;
        }
        DropShadowFilter.prototype = Object.create(core.AbstractFilter.prototype);
        DropShadowFilter.prototype.constructor = DropShadowFilter;
        module.exports = DropShadowFilter;
        DropShadowFilter.prototype.applyFilter = function(renderer, input, output) {
          var renderTarget = renderer.filterManager.getRenderTarget(true);
          if (this._dirtyPosition) {
            this._dirtyPosition = false;
            this.blurYTintFilter.uniforms.offset.value[0] = Math.sin(this._angle) * this._distance;
            this.blurYTintFilter.uniforms.offset.value[1] = Math.cos(this._angle) * this._distance;
          }
          this.blurXFilter.applyFilter(renderer, input, renderTarget);
          renderer.blendModeManager.setBlendMode(this.blendMode);
          this.blurYTintFilter.applyFilter(renderer, renderTarget, output);
          renderer.blendModeManager.setBlendMode(core.BLEND_MODES.NORMAL);
          if (!this.hideObject) {
            this.defaultFilter.applyFilter(renderer, input, output);
          }
          renderer.filterManager.returnRenderTarget(renderTarget);
        };
        Object.defineProperties(DropShadowFilter.prototype, {
          blur: {
            get: function() {
              return this.blurXFilter.blur;
            },
            set: function(value) {
              this.blurXFilter.blur = this.blurYTintFilter.blur = value;
            }
          },
          blurX: {
            get: function() {
              return this.blurXFilter.blur;
            },
            set: function(value) {
              this.blurXFilter.blur = value;
            }
          },
          blurY: {
            get: function() {
              return this.blurYTintFilter.blur;
            },
            set: function(value) {
              this.blurYTintFilter.blur = value;
            }
          },
          color: {
            get: function() {
              return core.utils.rgb2hex(this.blurYTintFilter.uniforms.color.value);
            },
            set: function(value) {
              this.blurYTintFilter.uniforms.color.value = core.utils.hex2rgb(value);
            }
          },
          alpha: {
            get: function() {
              return this.blurYTintFilter.uniforms.alpha.value;
            },
            set: function(value) {
              this.blurYTintFilter.uniforms.alpha.value = value;
            }
          },
          distance: {
            get: function() {
              return this._distance;
            },
            set: function(value) {
              this._dirtyPosition = true;
              this._distance = value;
            }
          },
          angle: {
            get: function() {
              return this._angle;
            },
            set: function(value) {
              this._dirtyPosition = true;
              this._angle = value;
            }
          }
        });
      }, {
        "../../core": 29,
        "../blur/BlurXFilter": 90,
        "./BlurYTintFilter": 99
      }],
      101: [function(require, module, exports) {
        var core = require('../../core');
        function GrayFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\nuniform float gray;\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);\n}\n", {gray: {
              type: '1f',
              value: 1
            }});
        }
        GrayFilter.prototype = Object.create(core.AbstractFilter.prototype);
        GrayFilter.prototype.constructor = GrayFilter;
        module.exports = GrayFilter;
        Object.defineProperties(GrayFilter.prototype, {gray: {
            get: function() {
              return this.uniforms.gray.value;
            },
            set: function(value) {
              this.uniforms.gray.value = value;
            }
          }});
      }, {"../../core": 29}],
      102: [function(require, module, exports) {
        module.exports = {
          AbstractFilter: require('../core/renderers/webgl/filters/AbstractFilter'),
          FXAAFilter: require('../core/renderers/webgl/filters/FXAAFilter'),
          SpriteMaskFilter: require('../core/renderers/webgl/filters/SpriteMaskFilter'),
          AsciiFilter: require('./ascii/AsciiFilter'),
          BloomFilter: require('./bloom/BloomFilter'),
          BlurFilter: require('./blur/BlurFilter'),
          BlurXFilter: require('./blur/BlurXFilter'),
          BlurYFilter: require('./blur/BlurYFilter'),
          BlurDirFilter: require('./blur/BlurDirFilter'),
          ColorMatrixFilter: require('./color/ColorMatrixFilter'),
          ColorStepFilter: require('./color/ColorStepFilter'),
          ConvolutionFilter: require('./convolution/ConvolutionFilter'),
          CrossHatchFilter: require('./crosshatch/CrossHatchFilter'),
          DisplacementFilter: require('./displacement/DisplacementFilter'),
          DotScreenFilter: require('./dot/DotScreenFilter'),
          GrayFilter: require('./gray/GrayFilter'),
          DropShadowFilter: require('./dropshadow/DropShadowFilter'),
          InvertFilter: require('./invert/InvertFilter'),
          NoiseFilter: require('./noise/NoiseFilter'),
          NormalMapFilter: require('./normal/NormalMapFilter'),
          PixelateFilter: require('./pixelate/PixelateFilter'),
          RGBSplitFilter: require('./rgb/RGBSplitFilter'),
          ShockwaveFilter: require('./shockwave/ShockwaveFilter'),
          SepiaFilter: require('./sepia/SepiaFilter'),
          SmartBlurFilter: require('./blur/SmartBlurFilter'),
          TiltShiftFilter: require('./tiltshift/TiltShiftFilter'),
          TiltShiftXFilter: require('./tiltshift/TiltShiftXFilter'),
          TiltShiftYFilter: require('./tiltshift/TiltShiftYFilter'),
          TwistFilter: require('./twist/TwistFilter')
        };
      }, {
        "../core/renderers/webgl/filters/AbstractFilter": 49,
        "../core/renderers/webgl/filters/FXAAFilter": 50,
        "../core/renderers/webgl/filters/SpriteMaskFilter": 51,
        "./ascii/AsciiFilter": 86,
        "./bloom/BloomFilter": 87,
        "./blur/BlurDirFilter": 88,
        "./blur/BlurFilter": 89,
        "./blur/BlurXFilter": 90,
        "./blur/BlurYFilter": 91,
        "./blur/SmartBlurFilter": 92,
        "./color/ColorMatrixFilter": 93,
        "./color/ColorStepFilter": 94,
        "./convolution/ConvolutionFilter": 95,
        "./crosshatch/CrossHatchFilter": 96,
        "./displacement/DisplacementFilter": 97,
        "./dot/DotScreenFilter": 98,
        "./dropshadow/DropShadowFilter": 100,
        "./gray/GrayFilter": 101,
        "./invert/InvertFilter": 103,
        "./noise/NoiseFilter": 104,
        "./normal/NormalMapFilter": 105,
        "./pixelate/PixelateFilter": 106,
        "./rgb/RGBSplitFilter": 107,
        "./sepia/SepiaFilter": 108,
        "./shockwave/ShockwaveFilter": 109,
        "./tiltshift/TiltShiftFilter": 111,
        "./tiltshift/TiltShiftXFilter": 112,
        "./tiltshift/TiltShiftYFilter": 113,
        "./twist/TwistFilter": 114
      }],
      103: [function(require, module, exports) {
        var core = require('../../core');
        function InvertFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform float invert;\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n\n    gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);\n}\n", {invert: {
              type: '1f',
              value: 1
            }});
        }
        InvertFilter.prototype = Object.create(core.AbstractFilter.prototype);
        InvertFilter.prototype.constructor = InvertFilter;
        module.exports = InvertFilter;
        Object.defineProperties(InvertFilter.prototype, {invert: {
            get: function() {
              return this.uniforms.invert.value;
            },
            set: function(value) {
              this.uniforms.invert.value = value;
            }
          }});
      }, {"../../core": 29}],
      104: [function(require, module, exports) {
        var core = require('../../core');
        function NoiseFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform float noise;\nuniform sampler2D uSampler;\n\nfloat rand(vec2 co)\n{\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main()\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    float diff = (rand(vTextureCoord) - 0.5) * noise;\n\n    color.r += diff;\n    color.g += diff;\n    color.b += diff;\n\n    gl_FragColor = color;\n}\n", {noise: {
              type: '1f',
              value: 0.5
            }});
        }
        NoiseFilter.prototype = Object.create(core.AbstractFilter.prototype);
        NoiseFilter.prototype.constructor = NoiseFilter;
        module.exports = NoiseFilter;
        Object.defineProperties(NoiseFilter.prototype, {noise: {
            get: function() {
              return this.uniforms.noise.value;
            },
            set: function(value) {
              this.uniforms.noise.value = value;
            }
          }});
      }, {"../../core": 29}],
      105: [function(require, module, exports) {
        var core = require('../../core');
        function NormalMapFilter(texture) {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D displacementMap;\nuniform sampler2D uSampler;\n\nuniform vec4 dimensions;\n\nconst vec2 Resolution = vec2(1.0,1.0);      //resolution of screen\nuniform vec3 LightPos;    //light position, normalized\nconst vec4 LightColor = vec4(1.0, 1.0, 1.0, 1.0);      //light RGBA -- alpha is intensity\nconst vec4 AmbientColor = vec4(1.0, 1.0, 1.0, 0.5);    //ambient RGBA -- alpha is intensity\nconst vec3 Falloff = vec3(0.0, 1.0, 0.2);         //attenuation coefficients\n\nuniform vec3 LightDir; // = vec3(1.0, 0.0, 1.0);\n\nuniform vec2 mapDimensions; // = vec2(256.0, 256.0);\n\n\nvoid main(void)\n{\n    vec2 mapCords = vTextureCoord.xy;\n\n    vec4 color = texture2D(uSampler, vTextureCoord.st);\n    vec3 nColor = texture2D(displacementMap, vTextureCoord.st).rgb;\n\n\n    mapCords *= vec2(dimensions.x/512.0, dimensions.y/512.0);\n\n    mapCords.y *= -1.0;\n    mapCords.y += 1.0;\n\n    // RGBA of our diffuse color\n    vec4 DiffuseColor = texture2D(uSampler, vTextureCoord);\n\n    // RGB of our normal map\n    vec3 NormalMap = texture2D(displacementMap, mapCords).rgb;\n\n    // The delta position of light\n    // vec3 LightDir = vec3(LightPos.xy - (gl_FragCoord.xy / Resolution.xy), LightPos.z);\n    vec3 LightDir = vec3(LightPos.xy - (mapCords.xy), LightPos.z);\n\n    // Correct for aspect ratio\n    // LightDir.x *= Resolution.x / Resolution.y;\n\n    // Determine distance (used for attenuation) BEFORE we normalize our LightDir\n    float D = length(LightDir);\n\n    // normalize our vectors\n    vec3 N = normalize(NormalMap * 2.0 - 1.0);\n    vec3 L = normalize(LightDir);\n\n    // Pre-multiply light color with intensity\n    // Then perform 'N dot L' to determine our diffuse term\n    vec3 Diffuse = (LightColor.rgb * LightColor.a) * max(dot(N, L), 0.0);\n\n    // pre-multiply ambient color with intensity\n    vec3 Ambient = AmbientColor.rgb * AmbientColor.a;\n\n    // calculate attenuation\n    float Attenuation = 1.0 / ( Falloff.x + (Falloff.y*D) + (Falloff.z*D*D) );\n\n    // the calculation which brings it all together\n    vec3 Intensity = Ambient + Diffuse * Attenuation;\n    vec3 FinalColor = DiffuseColor.rgb * Intensity;\n    gl_FragColor = vColor * vec4(FinalColor, DiffuseColor.a);\n\n    // gl_FragColor = vec4(1.0, 0.0, 0.0, Attenuation); // vColor * vec4(FinalColor, DiffuseColor.a);\n\n/*\n    // normalise color\n    vec3 normal = normalize(nColor * 2.0 - 1.0);\n\n    vec3 deltaPos = vec3( (light.xy - gl_FragCoord.xy) / resolution.xy, light.z );\n\n    float lambert = clamp(dot(normal, lightDir), 0.0, 1.0);\n\n    float d = sqrt(dot(deltaPos, deltaPos));\n    float att = 1.0 / ( attenuation.x + (attenuation.y*d) + (attenuation.z*d*d) );\n\n    vec3 result = (ambientColor * ambientIntensity) + (lightColor.rgb * lambert) * att;\n    result *= color.rgb;\n\n    gl_FragColor = vec4(result, 1.0);\n*/\n}\n", {
            displacementMap: {
              type: 'sampler2D',
              value: texture
            },
            scale: {
              type: '2f',
              value: {
                x: 15,
                y: 15
              }
            },
            offset: {
              type: '2f',
              value: {
                x: 0,
                y: 0
              }
            },
            mapDimensions: {
              type: '2f',
              value: {
                x: 1,
                y: 1
              }
            },
            dimensions: {
              type: '4f',
              value: [0, 0, 0, 0]
            },
            LightPos: {
              type: '3f',
              value: [0, 1, 0]
            }
          });
          texture.baseTexture._powerOf2 = true;
          if (texture.baseTexture.hasLoaded) {
            this.onTextureLoaded();
          } else {
            texture.baseTexture.once('loaded', this.onTextureLoaded, this);
          }
        }
        NormalMapFilter.prototype = Object.create(core.AbstractFilter.prototype);
        NormalMapFilter.prototype.constructor = NormalMapFilter;
        module.exports = NormalMapFilter;
        NormalMapFilter.prototype.onTextureLoaded = function() {
          this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width;
          this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;
        };
        Object.defineProperties(NormalMapFilter.prototype, {
          map: {
            get: function() {
              return this.uniforms.displacementMap.value;
            },
            set: function(value) {
              this.uniforms.displacementMap.value = value;
            }
          },
          scale: {
            get: function() {
              return this.uniforms.scale.value;
            },
            set: function(value) {
              this.uniforms.scale.value = value;
            }
          },
          offset: {
            get: function() {
              return this.uniforms.offset.value;
            },
            set: function(value) {
              this.uniforms.offset.value = value;
            }
          }
        });
      }, {"../../core": 29}],
      106: [function(require, module, exports) {
        var core = require('../../core');
        function PixelateFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform vec4 dimensions;\nuniform vec2 pixelSize;\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec2 coord = vTextureCoord;\n\n    vec2 size = dimensions.xy / pixelSize;\n\n    vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;\n\n    gl_FragColor = texture2D(uSampler, color);\n}\n", {
            dimensions: {
              type: '4fv',
              value: new Float32Array([0, 0, 0, 0])
            },
            pixelSize: {
              type: 'v2',
              value: {
                x: 10,
                y: 10
              }
            }
          });
        }
        PixelateFilter.prototype = Object.create(core.AbstractFilter.prototype);
        PixelateFilter.prototype.constructor = PixelateFilter;
        module.exports = PixelateFilter;
        Object.defineProperties(PixelateFilter.prototype, {size: {
            get: function() {
              return this.uniforms.pixelSize.value;
            },
            set: function(value) {
              this.uniforms.pixelSize.value = value;
            }
          }});
      }, {"../../core": 29}],
      107: [function(require, module, exports) {
        var core = require('../../core');
        function RGBSplitFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 dimensions;\nuniform vec2 red;\nuniform vec2 green;\nuniform vec2 blue;\n\nvoid main(void)\n{\n   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;\n   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;\n   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;\n   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;\n}\n", {
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
      }, {"../../core": 29}],
      108: [function(require, module, exports) {
        var core = require('../../core');
        function SepiaFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float sepia;\n\nconst mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);\n}\n", {sepia: {
              type: '1f',
              value: 1
            }});
        }
        SepiaFilter.prototype = Object.create(core.AbstractFilter.prototype);
        SepiaFilter.prototype.constructor = SepiaFilter;
        module.exports = SepiaFilter;
        Object.defineProperties(SepiaFilter.prototype, {sepia: {
            get: function() {
              return this.uniforms.sepia.value;
            },
            set: function(value) {
              this.uniforms.sepia.value = value;
            }
          }});
      }, {"../../core": 29}],
      109: [function(require, module, exports) {
        var core = require('../../core');
        function ShockwaveFilter() {
          core.AbstractFilter.call(this, null, "precision lowp float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nuniform vec2 center;\nuniform vec3 params; // 10.0, 0.8, 0.1\nuniform float time;\n\nvoid main()\n{\n    vec2 uv = vTextureCoord;\n    vec2 texCoord = uv;\n\n    float dist = distance(uv, center);\n\n    if ( (dist <= (time + params.z)) && (dist >= (time - params.z)) )\n    {\n        float diff = (dist - time);\n        float powDiff = 1.0 - pow(abs(diff*params.x), params.y);\n\n        float diffTime = diff  * powDiff;\n        vec2 diffUV = normalize(uv - center);\n        texCoord = uv + (diffUV * diffTime);\n    }\n\n    gl_FragColor = texture2D(uSampler, texCoord);\n}\n", {
            center: {
              type: 'v2',
              value: {
                x: 0.5,
                y: 0.5
              }
            },
            params: {
              type: 'v3',
              value: {
                x: 10,
                y: 0.8,
                z: 0.1
              }
            },
            time: {
              type: '1f',
              value: 0
            }
          });
        }
        ShockwaveFilter.prototype = Object.create(core.AbstractFilter.prototype);
        ShockwaveFilter.prototype.constructor = ShockwaveFilter;
        module.exports = ShockwaveFilter;
        Object.defineProperties(ShockwaveFilter.prototype, {
          center: {
            get: function() {
              return this.uniforms.center.value;
            },
            set: function(value) {
              this.uniforms.center.value = value;
            }
          },
          params: {
            get: function() {
              return this.uniforms.params.value;
            },
            set: function(value) {
              this.uniforms.params.value = value;
            }
          },
          time: {
            get: function() {
              return this.uniforms.time.value;
            },
            set: function(value) {
              this.uniforms.time.value = value;
            }
          }
        });
      }, {"../../core": 29}],
      110: [function(require, module, exports) {
        var core = require('../../core');
        function TiltShiftAxisFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float blur;\nuniform float gradientBlur;\nuniform vec2 start;\nuniform vec2 end;\nuniform vec2 delta;\nuniform vec2 texSize;\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;\n\n    for (float t = -30.0; t <= 30.0; t++)\n    {\n        float percent = (t + offset - 0.5) / 30.0;\n        float weight = 1.0 - abs(percent);\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);\n        sample.rgb *= sample.a;\n        color += sample * weight;\n        total += weight;\n    }\n\n    gl_FragColor = color / total;\n    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n}\n", {
            blur: {
              type: '1f',
              value: 100
            },
            gradientBlur: {
              type: '1f',
              value: 600
            },
            start: {
              type: 'v2',
              value: {
                x: 0,
                y: window.innerHeight / 2
              }
            },
            end: {
              type: 'v2',
              value: {
                x: 600,
                y: window.innerHeight / 2
              }
            },
            delta: {
              type: 'v2',
              value: {
                x: 30,
                y: 30
              }
            },
            texSize: {
              type: 'v2',
              value: {
                x: window.innerWidth,
                y: window.innerHeight
              }
            }
          });
          this.updateDelta();
        }
        TiltShiftAxisFilter.prototype = Object.create(core.AbstractFilter.prototype);
        TiltShiftAxisFilter.prototype.constructor = TiltShiftAxisFilter;
        module.exports = TiltShiftAxisFilter;
        TiltShiftAxisFilter.prototype.updateDelta = function() {
          this.uniforms.delta.value.x = 0;
          this.uniforms.delta.value.y = 0;
        };
        Object.defineProperties(TiltShiftAxisFilter.prototype, {
          blur: {
            get: function() {
              return this.uniforms.blur.value;
            },
            set: function(value) {
              this.uniforms.blur.value = value;
            }
          },
          gradientBlur: {
            get: function() {
              return this.uniforms.gradientBlur.value;
            },
            set: function(value) {
              this.uniforms.gradientBlur.value = value;
            }
          },
          start: {
            get: function() {
              return this.uniforms.start.value;
            },
            set: function(value) {
              this.uniforms.start.value = value;
              this.updateDelta();
            }
          },
          end: {
            get: function() {
              return this.uniforms.end.value;
            },
            set: function(value) {
              this.uniforms.end.value = value;
              this.updateDelta();
            }
          }
        });
      }, {"../../core": 29}],
      111: [function(require, module, exports) {
        var core = require('../../core'),
            TiltShiftXFilter = require('./TiltShiftXFilter'),
            TiltShiftYFilter = require('./TiltShiftYFilter');
        function TiltShiftFilter() {
          core.AbstractFilter.call(this);
          this.tiltShiftXFilter = new TiltShiftXFilter();
          this.tiltShiftYFilter = new TiltShiftYFilter();
        }
        TiltShiftFilter.prototype = Object.create(core.AbstractFilter.prototype);
        TiltShiftFilter.prototype.constructor = TiltShiftFilter;
        module.exports = TiltShiftFilter;
        TiltShiftFilter.prototype.applyFilter = function(renderer, input, output) {
          var renderTarget = renderer.filterManager.getRenderTarget(true);
          this.tiltShiftXFilter.applyFilter(renderer, input, renderTarget);
          this.tiltShiftYFilter.applyFilter(renderer, renderTarget, output);
          renderer.filterManager.returnRenderTarget(renderTarget);
        };
        Object.defineProperties(TiltShiftFilter.prototype, {
          blur: {
            get: function() {
              return this.tiltShiftXFilter.blur;
            },
            set: function(value) {
              this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = value;
            }
          },
          gradientBlur: {
            get: function() {
              return this.tiltShiftXFilter.gradientBlur;
            },
            set: function(value) {
              this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = value;
            }
          },
          start: {
            get: function() {
              return this.tiltShiftXFilter.start;
            },
            set: function(value) {
              this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = value;
            }
          },
          end: {
            get: function() {
              return this.tiltShiftXFilter.end;
            },
            set: function(value) {
              this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = value;
            }
          }
        });
      }, {
        "../../core": 29,
        "./TiltShiftXFilter": 112,
        "./TiltShiftYFilter": 113
      }],
      112: [function(require, module, exports) {
        var TiltShiftAxisFilter = require('./TiltShiftAxisFilter');
        function TiltShiftXFilter() {
          TiltShiftAxisFilter.call(this);
        }
        TiltShiftXFilter.prototype = Object.create(TiltShiftAxisFilter.prototype);
        TiltShiftXFilter.prototype.constructor = TiltShiftXFilter;
        module.exports = TiltShiftXFilter;
        TiltShiftXFilter.prototype.updateDelta = function() {
          var dx = this.uniforms.end.value.x - this.uniforms.start.value.x;
          var dy = this.uniforms.end.value.y - this.uniforms.start.value.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          this.uniforms.delta.value.x = dx / d;
          this.uniforms.delta.value.y = dy / d;
        };
      }, {"./TiltShiftAxisFilter": 110}],
      113: [function(require, module, exports) {
        var TiltShiftAxisFilter = require('./TiltShiftAxisFilter');
        function TiltShiftYFilter() {
          TiltShiftAxisFilter.call(this);
        }
        TiltShiftYFilter.prototype = Object.create(TiltShiftAxisFilter.prototype);
        TiltShiftYFilter.prototype.constructor = TiltShiftYFilter;
        module.exports = TiltShiftYFilter;
        TiltShiftYFilter.prototype.updateDelta = function() {
          var dx = this.uniforms.end.value.x - this.uniforms.start.value.x;
          var dy = this.uniforms.end.value.y - this.uniforms.start.value.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          this.uniforms.delta.value.x = -dy / d;
          this.uniforms.delta.value.y = dx / d;
        };
      }, {"./TiltShiftAxisFilter": 110}],
      114: [function(require, module, exports) {
        var core = require('../../core');
        function TwistFilter() {
          core.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float radius;\nuniform float angle;\nuniform vec2 offset;\n\nvoid main(void)\n{\n   vec2 coord = vTextureCoord - offset;\n   float dist = length(coord);\n\n   if (dist < radius)\n   {\n       float ratio = (radius - dist) / radius;\n       float angleMod = ratio * ratio * angle;\n       float s = sin(angleMod);\n       float c = cos(angleMod);\n       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);\n   }\n\n   gl_FragColor = texture2D(uSampler, coord+offset);\n}\n", {
            radius: {
              type: '1f',
              value: 0.5
            },
            angle: {
              type: '1f',
              value: 5
            },
            offset: {
              type: 'v2',
              value: {
                x: 0.5,
                y: 0.5
              }
            }
          });
        }
        TwistFilter.prototype = Object.create(core.AbstractFilter.prototype);
        TwistFilter.prototype.constructor = TwistFilter;
        module.exports = TwistFilter;
        Object.defineProperties(TwistFilter.prototype, {
          offset: {
            get: function() {
              return this.uniforms.offset.value;
            },
            set: function(value) {
              this.uniforms.offset.value = value;
            }
          },
          radius: {
            get: function() {
              return this.uniforms.radius.value;
            },
            set: function(value) {
              this.uniforms.radius.value = value;
            }
          },
          angle: {
            get: function() {
              return this.uniforms.angle.value;
            },
            set: function(value) {
              this.uniforms.angle.value = value;
            }
          }
        });
      }, {"../../core": 29}],
      115: [function(require, module, exports) {
        var core = require('../core');
        function InteractionData() {
          this.global = new core.Point();
          this.target = null;
          this.originalEvent = null;
        }
        InteractionData.prototype.constructor = InteractionData;
        module.exports = InteractionData;
        InteractionData.prototype.getLocalPosition = function(displayObject, point, globalPos) {
          var worldTransform = displayObject.worldTransform;
          var global = globalPos ? globalPos : this.global;
          var a00 = worldTransform.a,
              a01 = worldTransform.c,
              a02 = worldTransform.tx,
              a10 = worldTransform.b,
              a11 = worldTransform.d,
              a12 = worldTransform.ty,
              id = 1 / (a00 * a11 + a01 * -a10);
          point = point || new core.math.Point();
          point.x = a11 * id * global.x + -a01 * id * global.x + (a12 * a01 - a02 * a11) * id;
          point.y = a00 * id * global.y + -a10 * id * global.y + (-a12 * a00 + a02 * a10) * id;
          return point;
        };
      }, {"../core": 29}],
      116: [function(require, module, exports) {
        var core = require('../core'),
            InteractionData = require('./InteractionData');
        Object.assign(core.DisplayObject.prototype, require('./interactiveTarget'));
        function InteractionManager(renderer, options) {
          options = options || {};
          this.renderer = renderer;
          this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;
          this.interactionFrequency = options.interactionFrequency || 10;
          this.mouse = new InteractionData();
          this.eventData = {
            stopped: false,
            target: null,
            type: null,
            data: this.mouse,
            stopPropagation: function() {
              this.stopped = true;
            }
          };
          this.interactiveDataPool = [];
          this.interactionDOMElement = null;
          this.eventsAdded = false;
          this.onMouseUp = this.onMouseUp.bind(this);
          this.processMouseUp = this.processMouseUp.bind(this);
          this.onMouseDown = this.onMouseDown.bind(this);
          this.processMouseDown = this.processMouseDown.bind(this);
          this.onMouseMove = this.onMouseMove.bind(this);
          this.processMouseMove = this.processMouseMove.bind(this);
          this.onMouseOut = this.onMouseOut.bind(this);
          this.processMouseOverOut = this.processMouseOverOut.bind(this);
          this.onTouchStart = this.onTouchStart.bind(this);
          this.processTouchStart = this.processTouchStart.bind(this);
          this.onTouchEnd = this.onTouchEnd.bind(this);
          this.processTouchEnd = this.processTouchEnd.bind(this);
          this.onTouchMove = this.onTouchMove.bind(this);
          this.processTouchMove = this.processTouchMove.bind(this);
          this.last = 0;
          this.currentCursorStyle = 'inherit';
          this._tempPoint = new core.Point();
          this.resolution = 1;
          this.setTargetElement(this.renderer.view, this.renderer.resolution);
        }
        InteractionManager.prototype.constructor = InteractionManager;
        module.exports = InteractionManager;
        InteractionManager.prototype.setTargetElement = function(element, resolution) {
          this.removeEvents();
          this.interactionDOMElement = element;
          this.resolution = resolution || 1;
          this.addEvents();
        };
        InteractionManager.prototype.addEvents = function() {
          if (!this.interactionDOMElement) {
            return;
          }
          core.ticker.shared.add(this.update, this);
          if (window.navigator.msPointerEnabled) {
            this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
            this.interactionDOMElement.style['-ms-touch-action'] = 'none';
          }
          window.document.addEventListener('mousemove', this.onMouseMove, true);
          this.interactionDOMElement.addEventListener('mousedown', this.onMouseDown, true);
          this.interactionDOMElement.addEventListener('mouseout', this.onMouseOut, true);
          this.interactionDOMElement.addEventListener('touchstart', this.onTouchStart, true);
          this.interactionDOMElement.addEventListener('touchend', this.onTouchEnd, true);
          this.interactionDOMElement.addEventListener('touchmove', this.onTouchMove, true);
          window.addEventListener('mouseup', this.onMouseUp, true);
          this.eventsAdded = true;
        };
        InteractionManager.prototype.removeEvents = function() {
          if (!this.interactionDOMElement) {
            return;
          }
          core.ticker.shared.remove(this.update);
          if (window.navigator.msPointerEnabled) {
            this.interactionDOMElement.style['-ms-content-zooming'] = '';
            this.interactionDOMElement.style['-ms-touch-action'] = '';
          }
          window.document.removeEventListener('mousemove', this.onMouseMove, true);
          this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
          this.interactionDOMElement.removeEventListener('mouseout', this.onMouseOut, true);
          this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
          this.interactionDOMElement.removeEventListener('touchend', this.onTouchEnd, true);
          this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);
          this.interactionDOMElement = null;
          window.removeEventListener('mouseup', this.onMouseUp, true);
          this.eventsAdded = false;
        };
        InteractionManager.prototype.update = function(deltaTime) {
          this._deltaTime += deltaTime;
          if (this._deltaTime < this.interactionFrequency) {
            return;
          }
          this._deltaTime = 0;
          if (!this.interactionDOMElement) {
            return;
          }
          if (this.didMove) {
            this.didMove = false;
            return;
          }
          this.cursor = 'inherit';
          this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, true);
          if (this.currentCursorStyle !== this.cursor) {
            this.currentCursorStyle = this.cursor;
            this.interactionDOMElement.style.cursor = this.cursor;
          }
        };
        InteractionManager.prototype.dispatchEvent = function(displayObject, eventString, eventData) {
          if (!eventData.stopped) {
            eventData.target = displayObject;
            eventData.type = eventString;
            displayObject.emit(eventString, eventData);
            if (displayObject[eventString]) {
              displayObject[eventString](eventData);
            }
          }
        };
        InteractionManager.prototype.mapPositionToPoint = function(point, x, y) {
          var rect = this.interactionDOMElement.getBoundingClientRect();
          point.x = ((x - rect.left) * (this.interactionDOMElement.width / rect.width)) / this.resolution;
          point.y = ((y - rect.top) * (this.interactionDOMElement.height / rect.height)) / this.resolution;
        };
        InteractionManager.prototype.processInteractive = function(point, displayObject, func, hitTest, interactive) {
          if (!displayObject.visible) {
            return false;
          }
          var children = displayObject.children;
          var hit = false;
          interactive = interactive || displayObject.interactive;
          if (displayObject.interactiveChildren) {
            for (var i = children.length - 1; i >= 0; i--) {
              if (!hit && hitTest) {
                hit = this.processInteractive(point, children[i], func, true, interactive);
              } else {
                this.processInteractive(point, children[i], func, false, false);
              }
            }
          }
          if (interactive) {
            if (hitTest) {
              if (displayObject.hitArea) {
                displayObject.worldTransform.applyInverse(point, this._tempPoint);
                hit = displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y);
              } else if (displayObject.containsPoint) {
                hit = displayObject.containsPoint(point);
              }
            }
            if (displayObject.interactive) {
              func(displayObject, hit);
            }
          }
          return hit;
        };
        InteractionManager.prototype.onMouseDown = function(event) {
          this.mouse.originalEvent = event;
          this.eventData.data = this.mouse;
          this.eventData.stopped = false;
          this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
          if (this.autoPreventDefault) {
            this.mouse.originalEvent.preventDefault();
          }
          this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, true);
        };
        InteractionManager.prototype.processMouseDown = function(displayObject, hit) {
          var e = this.mouse.originalEvent;
          var isRightButton = e.button === 2 || e.which === 3;
          if (hit) {
            displayObject[isRightButton ? '_isRightDown' : '_isLeftDown'] = true;
            this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', this.eventData);
          }
        };
        InteractionManager.prototype.onMouseUp = function(event) {
          this.mouse.originalEvent = event;
          this.eventData.data = this.mouse;
          this.eventData.stopped = false;
          this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
          this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseUp, true);
        };
        InteractionManager.prototype.processMouseUp = function(displayObject, hit) {
          var e = this.mouse.originalEvent;
          var isRightButton = e.button === 2 || e.which === 3;
          var isDown = isRightButton ? '_isRightDown' : '_isLeftDown';
          if (hit) {
            this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', this.eventData);
            if (displayObject[isDown]) {
              displayObject[isDown] = false;
              this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', this.eventData);
            }
          } else {
            if (displayObject[isDown]) {
              displayObject[isDown] = false;
              this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', this.eventData);
            }
          }
        };
        InteractionManager.prototype.onMouseMove = function(event) {
          this.mouse.originalEvent = event;
          this.eventData.data = this.mouse;
          this.eventData.stopped = false;
          this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
          this.didMove = true;
          this.cursor = 'inherit';
          this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, true);
          if (this.currentCursorStyle !== this.cursor) {
            this.currentCursorStyle = this.cursor;
            this.interactionDOMElement.style.cursor = this.cursor;
          }
        };
        InteractionManager.prototype.processMouseMove = function(displayObject, hit) {
          this.dispatchEvent(displayObject, 'mousemove', this.eventData);
          this.processMouseOverOut(displayObject, hit);
        };
        InteractionManager.prototype.onMouseOut = function(event) {
          this.mouse.originalEvent = event;
          this.eventData.stopped = false;
          this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
          this.interactionDOMElement.style.cursor = 'inherit';
          this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);
          this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, false);
        };
        InteractionManager.prototype.processMouseOverOut = function(displayObject, hit) {
          if (hit) {
            if (!displayObject._over) {
              displayObject._over = true;
              this.dispatchEvent(displayObject, 'mouseover', this.eventData);
            }
            if (displayObject.buttonMode) {
              this.cursor = displayObject.defaultCursor;
            }
          } else {
            if (displayObject._over) {
              displayObject._over = false;
              this.dispatchEvent(displayObject, 'mouseout', this.eventData);
            }
          }
        };
        InteractionManager.prototype.onTouchStart = function(event) {
          if (this.autoPreventDefault) {
            event.preventDefault();
          }
          var changedTouches = event.changedTouches;
          var cLength = changedTouches.length;
          for (var i = 0; i < cLength; i++) {
            var touchEvent = changedTouches[i];
            var touchData = this.getTouchData(touchEvent);
            touchData.originalEvent = event;
            this.eventData.data = touchData;
            this.eventData.stopped = false;
            this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchStart, true);
            this.returnTouchData(touchData);
          }
        };
        InteractionManager.prototype.processTouchStart = function(displayObject, hit) {
          if (hit) {
            displayObject._touchDown = true;
            this.dispatchEvent(displayObject, 'touchstart', this.eventData);
          }
        };
        InteractionManager.prototype.onTouchEnd = function(event) {
          if (this.autoPreventDefault) {
            event.preventDefault();
          }
          var changedTouches = event.changedTouches;
          var cLength = changedTouches.length;
          for (var i = 0; i < cLength; i++) {
            var touchEvent = changedTouches[i];
            var touchData = this.getTouchData(touchEvent);
            touchData.originalEvent = event;
            this.eventData.data = touchData;
            this.eventData.stopped = false;
            this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchEnd, true);
            this.returnTouchData(touchData);
          }
        };
        InteractionManager.prototype.processTouchEnd = function(displayObject, hit) {
          if (hit) {
            this.dispatchEvent(displayObject, 'touchend', this.eventData);
            if (displayObject._touchDown) {
              displayObject._touchDown = false;
              this.dispatchEvent(displayObject, 'tap', this.eventData);
            }
          } else {
            if (displayObject._touchDown) {
              displayObject._touchDown = false;
              this.dispatchEvent(displayObject, 'touchendoutside', this.eventData);
            }
          }
        };
        InteractionManager.prototype.onTouchMove = function(event) {
          if (this.autoPreventDefault) {
            event.preventDefault();
          }
          var changedTouches = event.changedTouches;
          var cLength = changedTouches.length;
          for (var i = 0; i < cLength; i++) {
            var touchEvent = changedTouches[i];
            var touchData = this.getTouchData(touchEvent);
            touchData.originalEvent = event;
            this.eventData.data = touchData;
            this.eventData.stopped = false;
            this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchMove, false);
            this.returnTouchData(touchData);
          }
        };
        InteractionManager.prototype.processTouchMove = function(displayObject, hit) {
          hit = hit;
          this.dispatchEvent(displayObject, 'touchmove', this.eventData);
        };
        InteractionManager.prototype.getTouchData = function(touchEvent) {
          var touchData = this.interactiveDataPool.pop();
          if (!touchData) {
            touchData = new InteractionData();
          }
          touchData.identifier = touchEvent.identifier;
          this.mapPositionToPoint(touchData.global, touchEvent.clientX, touchEvent.clientY);
          if (navigator.isCocoonJS) {
            touchData.global.x = touchData.global.x / this.resolution;
            touchData.global.y = touchData.global.y / this.resolution;
          }
          touchEvent.globalX = touchData.global.x;
          touchEvent.globalY = touchData.global.y;
          return touchData;
        };
        InteractionManager.prototype.returnTouchData = function(touchData) {
          this.interactiveDataPool.push(touchData);
        };
        InteractionManager.prototype.destroy = function() {
          this.removeEvents();
          this.renderer = null;
          this.mouse = null;
          this.eventData = null;
          this.interactiveDataPool = null;
          this.interactionDOMElement = null;
          this.onMouseUp = null;
          this.processMouseUp = null;
          this.onMouseDown = null;
          this.processMouseDown = null;
          this.onMouseMove = null;
          this.processMouseMove = null;
          this.onMouseOut = null;
          this.processMouseOverOut = null;
          this.onTouchStart = null;
          this.processTouchStart = null;
          this.onTouchEnd = null;
          this.processTouchEnd = null;
          this.onTouchMove = null;
          this.processTouchMove = null;
          this._tempPoint = null;
        };
        core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
        core.CanvasRenderer.registerPlugin('interaction', InteractionManager);
      }, {
        "../core": 29,
        "./InteractionData": 115,
        "./interactiveTarget": 118
      }],
      117: [function(require, module, exports) {
        module.exports = {
          InteractionData: require('./InteractionData'),
          InteractionManager: require('./InteractionManager'),
          interactiveTarget: require('./interactiveTarget')
        };
      }, {
        "./InteractionData": 115,
        "./InteractionManager": 116,
        "./interactiveTarget": 118
      }],
      118: [function(require, module, exports) {
        var interactiveTarget = {
          interactive: false,
          buttonMode: false,
          interactiveChildren: true,
          defaultCursor: 'pointer',
          _over: false,
          _touchDown: false
        };
        module.exports = interactiveTarget;
      }, {}],
      119: [function(require, module, exports) {
        var Resource = require('resource-loader').Resource,
            core = require('../core'),
            utils = require('../core/utils'),
            extras = require('../extras'),
            path = require('path');
        function parse(resource, texture) {
          var data = {};
          var info = resource.data.getElementsByTagName('info')[0];
          var common = resource.data.getElementsByTagName('common')[0];
          data.font = info.getAttribute('face');
          data.size = parseInt(info.getAttribute('size'), 10);
          data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
          data.chars = {};
          var letters = resource.data.getElementsByTagName('char');
          for (var i = 0; i < letters.length; i++) {
            var charCode = parseInt(letters[i].getAttribute('id'), 10);
            var textureRect = new core.math.Rectangle(parseInt(letters[i].getAttribute('x'), 10) + texture.frame.x, parseInt(letters[i].getAttribute('y'), 10) + texture.frame.y, parseInt(letters[i].getAttribute('width'), 10), parseInt(letters[i].getAttribute('height'), 10));
            data.chars[charCode] = {
              xOffset: parseInt(letters[i].getAttribute('xoffset'), 10),
              yOffset: parseInt(letters[i].getAttribute('yoffset'), 10),
              xAdvance: parseInt(letters[i].getAttribute('xadvance'), 10),
              kerning: {},
              texture: new core.Texture(texture.baseTexture, textureRect)
            };
          }
          var kernings = resource.data.getElementsByTagName('kerning');
          for (i = 0; i < kernings.length; i++) {
            var first = parseInt(kernings[i].getAttribute('first'), 10);
            var second = parseInt(kernings[i].getAttribute('second'), 10);
            var amount = parseInt(kernings[i].getAttribute('amount'), 10);
            data.chars[second].kerning[first] = amount;
          }
          resource.bitmapFont = data;
          extras.BitmapText.fonts[data.font] = data;
        }
        module.exports = function() {
          return function(resource, next) {
            if (!resource.data || !resource.isXml) {
              return next();
            }
            if (resource.data.getElementsByTagName('page').length === 0 || resource.data.getElementsByTagName('info').length === 0 || resource.data.getElementsByTagName('info')[0].getAttribute('face') === null) {
              return next();
            }
            var xmlUrl = path.dirname(resource.url);
            if (xmlUrl === '.') {
              xmlUrl = '';
            }
            if (this.baseUrl && xmlUrl) {
              if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/') {
                xmlUrl += '/';
              }
              xmlUrl = xmlUrl.replace(this.baseUrl, '');
            }
            if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/') {
              xmlUrl += '/';
            }
            var textureUrl = xmlUrl + resource.data.getElementsByTagName('page')[0].getAttribute('file');
            if (utils.TextureCache[textureUrl]) {
              parse(resource, utils.TextureCache[textureUrl]);
              next();
            } else {
              var loadOptions = {
                crossOrigin: resource.crossOrigin,
                loadType: Resource.LOAD_TYPE.IMAGE
              };
              this.add(resource.name + '_image', textureUrl, loadOptions, function(res) {
                parse(resource, res.texture);
                next();
              });
            }
          };
        };
      }, {
        "../core": 29,
        "../core/utils": 76,
        "../extras": 85,
        "path": 3,
        "resource-loader": 18
      }],
      120: [function(require, module, exports) {
        module.exports = {
          Loader: require('./loader'),
          bitmapFontParser: require('./bitmapFontParser'),
          spritesheetParser: require('./spritesheetParser'),
          textureParser: require('./textureParser'),
          Resource: require('resource-loader').Resource
        };
      }, {
        "./bitmapFontParser": 119,
        "./loader": 121,
        "./spritesheetParser": 122,
        "./textureParser": 123,
        "resource-loader": 18
      }],
      121: [function(require, module, exports) {
        var ResourceLoader = require('resource-loader'),
            textureParser = require('./textureParser'),
            spritesheetParser = require('./spritesheetParser'),
            bitmapFontParser = require('./bitmapFontParser');
        function Loader(baseUrl, concurrency) {
          ResourceLoader.call(this, baseUrl, concurrency);
          for (var i = 0; i < Loader._pixiMiddleware.length; ++i) {
            this.use(Loader._pixiMiddleware[i]());
          }
        }
        Loader.prototype = Object.create(ResourceLoader.prototype);
        Loader.prototype.constructor = Loader;
        module.exports = Loader;
        Loader._pixiMiddleware = [ResourceLoader.middleware.parsing.blob, textureParser, spritesheetParser, bitmapFontParser];
        Loader.addPixiMiddleware = function(fn) {
          Loader._pixiMiddleware.push(fn);
        };
        var Resource = ResourceLoader.Resource;
        Resource.setExtensionXhrType('fnt', Resource.XHR_RESPONSE_TYPE.DOCUMENT);
      }, {
        "./bitmapFontParser": 119,
        "./spritesheetParser": 122,
        "./textureParser": 123,
        "resource-loader": 18
      }],
      122: [function(require, module, exports) {
        var Resource = require('resource-loader').Resource,
            path = require('path'),
            core = require('../core');
        module.exports = function() {
          return function(resource, next) {
            if (!resource.data || !resource.isJson || !resource.data.frames) {
              return next();
            }
            var loadOptions = {
              crossOrigin: resource.crossOrigin,
              loadType: Resource.LOAD_TYPE.IMAGE
            };
            var route = path.dirname(resource.url.replace(this.baseUrl, ''));
            var resolution = core.utils.getResolutionOfUrl(resource.url);
            this.add(resource.name + '_image', route + '/' + resource.data.meta.image, loadOptions, function(res) {
              resource.textures = {};
              var frames = resource.data.frames;
              for (var i in frames) {
                var rect = frames[i].frame;
                if (rect) {
                  var size = null;
                  var trim = null;
                  if (frames[i].rotated) {
                    size = new core.math.Rectangle(rect.x, rect.y, rect.h, rect.w);
                  } else {
                    size = new core.math.Rectangle(rect.x, rect.y, rect.w, rect.h);
                  }
                  if (frames[i].trimmed) {
                    trim = new core.math.Rectangle(frames[i].spriteSourceSize.x / resolution, frames[i].spriteSourceSize.y / resolution, frames[i].sourceSize.w / resolution, frames[i].sourceSize.h / resolution);
                  }
                  if (frames[i].rotated) {
                    var temp = size.width;
                    size.width = size.height;
                    size.height = temp;
                  }
                  size.x /= resolution;
                  size.y /= resolution;
                  size.width /= resolution;
                  size.height /= resolution;
                  resource.textures[i] = new core.Texture(res.texture.baseTexture, size, size.clone(), trim, frames[i].rotated);
                  core.utils.TextureCache[i] = resource.textures[i];
                }
              }
              next();
            });
          };
        };
      }, {
        "../core": 29,
        "path": 3,
        "resource-loader": 18
      }],
      123: [function(require, module, exports) {
        var core = require('../core');
        module.exports = function() {
          return function(resource, next) {
            if (resource.data && resource.isImage) {
              resource.texture = new core.Texture(new core.BaseTexture(resource.data, null, core.utils.getResolutionOfUrl(resource.url)));
              core.utils.TextureCache[resource.url] = resource.texture;
            }
            next();
          };
        };
      }, {"../core": 29}],
      124: [function(require, module, exports) {
        var core = require('../core');
        function Mesh(texture, vertices, uvs, indices, drawMode) {
          core.Container.call(this);
          this._texture = null;
          this.uvs = uvs || new Float32Array([0, 1, 1, 1, 1, 0, 0, 1]);
          this.vertices = vertices || new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
          this.indices = indices || new Uint16Array([0, 1, 2, 3]);
          this.dirty = true;
          this.blendMode = core.BLEND_MODES.NORMAL;
          this.canvasPadding = 0;
          this.drawMode = drawMode || Mesh.DRAW_MODES.TRIANGLE_MESH;
          this.texture = texture;
        }
        Mesh.prototype = Object.create(core.Container.prototype);
        Mesh.prototype.constructor = Mesh;
        module.exports = Mesh;
        Object.defineProperties(Mesh.prototype, {texture: {
            get: function() {
              return this._texture;
            },
            set: function(value) {
              if (this._texture === value) {
                return;
              }
              this._texture = value;
              if (value) {
                if (value.baseTexture.hasLoaded) {
                  this._onTextureUpdate();
                } else {
                  value.once('update', this._onTextureUpdate, this);
                }
              }
            }
          }});
        Mesh.prototype._renderWebGL = function(renderer) {
          renderer.setObjectRenderer(renderer.plugins.mesh);
          renderer.plugins.mesh.render(this);
        };
        Mesh.prototype._renderCanvas = function(renderer) {
          var context = renderer.context;
          var transform = this.worldTransform;
          if (renderer.roundPixels) {
            context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx | 0, transform.ty | 0);
          } else {
            context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
          }
          if (this.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH) {
            this._renderCanvasTriangleMesh(context);
          } else {
            this._renderCanvasTriangles(context);
          }
        };
        Mesh.prototype._renderCanvasTriangleMesh = function(context) {
          var vertices = this.vertices;
          var uvs = this.uvs;
          var length = vertices.length / 2;
          for (var i = 0; i < length - 2; i++) {
            var index = i * 2;
            this._renderCanvasDrawTriangle(context, vertices, uvs, index, (index + 2), (index + 4));
          }
        };
        Mesh.prototype._renderCanvasTriangles = function(context) {
          var vertices = this.vertices;
          var uvs = this.uvs;
          var indices = this.indices;
          var length = indices.length;
          for (var i = 0; i < length; i += 3) {
            var index0 = indices[i] * 2,
                index1 = indices[i + 1] * 2,
                index2 = indices[i + 2] * 2;
            this._renderCanvasDrawTriangle(context, vertices, uvs, index0, index1, index2);
          }
        };
        Mesh.prototype._renderCanvasDrawTriangle = function(context, vertices, uvs, index0, index1, index2) {
          var textureSource = this._texture.baseTexture.source;
          var textureWidth = this._texture.baseTexture.width;
          var textureHeight = this._texture.baseTexture.height;
          var x0 = vertices[index0],
              x1 = vertices[index1],
              x2 = vertices[index2];
          var y0 = vertices[index0 + 1],
              y1 = vertices[index1 + 1],
              y2 = vertices[index2 + 1];
          var u0 = uvs[index0] * textureWidth,
              u1 = uvs[index1] * textureWidth,
              u2 = uvs[index2] * textureWidth;
          var v0 = uvs[index0 + 1] * textureHeight,
              v1 = uvs[index1 + 1] * textureHeight,
              v2 = uvs[index2 + 1] * textureHeight;
          if (this.canvasPadding > 0) {
            var paddingX = this.canvasPadding / this.worldTransform.a;
            var paddingY = this.canvasPadding / this.worldTransform.d;
            var centerX = (x0 + x1 + x2) / 3;
            var centerY = (y0 + y1 + y2) / 3;
            var normX = x0 - centerX;
            var normY = y0 - centerY;
            var dist = Math.sqrt(normX * normX + normY * normY);
            x0 = centerX + (normX / dist) * (dist + paddingX);
            y0 = centerY + (normY / dist) * (dist + paddingY);
            normX = x1 - centerX;
            normY = y1 - centerY;
            dist = Math.sqrt(normX * normX + normY * normY);
            x1 = centerX + (normX / dist) * (dist + paddingX);
            y1 = centerY + (normY / dist) * (dist + paddingY);
            normX = x2 - centerX;
            normY = y2 - centerY;
            dist = Math.sqrt(normX * normX + normY * normY);
            x2 = centerX + (normX / dist) * (dist + paddingX);
            y2 = centerY + (normY / dist) * (dist + paddingY);
          }
          context.save();
          context.beginPath();
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
          context.lineTo(x2, y2);
          context.closePath();
          context.clip();
          var delta = (u0 * v1) + (v0 * u2) + (u1 * v2) - (v1 * u2) - (v0 * u1) - (u0 * v2);
          var deltaA = (x0 * v1) + (v0 * x2) + (x1 * v2) - (v1 * x2) - (v0 * x1) - (x0 * v2);
          var deltaB = (u0 * x1) + (x0 * u2) + (u1 * x2) - (x1 * u2) - (x0 * u1) - (u0 * x2);
          var deltaC = (u0 * v1 * x2) + (v0 * x1 * u2) + (x0 * u1 * v2) - (x0 * v1 * u2) - (v0 * u1 * x2) - (u0 * x1 * v2);
          var deltaD = (y0 * v1) + (v0 * y2) + (y1 * v2) - (v1 * y2) - (v0 * y1) - (y0 * v2);
          var deltaE = (u0 * y1) + (y0 * u2) + (u1 * y2) - (y1 * u2) - (y0 * u1) - (u0 * y2);
          var deltaF = (u0 * v1 * y2) + (v0 * y1 * u2) + (y0 * u1 * v2) - (y0 * v1 * u2) - (v0 * u1 * y2) - (u0 * y1 * v2);
          context.transform(deltaA / delta, deltaD / delta, deltaB / delta, deltaE / delta, deltaC / delta, deltaF / delta);
          context.drawImage(textureSource, 0, 0);
          context.restore();
        };
        Mesh.prototype.renderMeshFlat = function(Mesh) {
          var context = this.context;
          var vertices = Mesh.vertices;
          var length = vertices.length / 2;
          context.beginPath();
          for (var i = 1; i < length - 2; i++) {
            var index = i * 2;
            var x0 = vertices[index],
                x1 = vertices[index + 2],
                x2 = vertices[index + 4];
            var y0 = vertices[index + 1],
                y1 = vertices[index + 3],
                y2 = vertices[index + 5];
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.lineTo(x2, y2);
          }
          context.fillStyle = '#FF0000';
          context.fill();
          context.closePath();
        };
        Mesh.prototype._onTextureUpdate = function() {
          this.updateFrame = true;
        };
        Mesh.prototype.getBounds = function(matrix) {
          var worldTransform = matrix || this.worldTransform;
          var a = worldTransform.a;
          var b = worldTransform.b;
          var c = worldTransform.c;
          var d = worldTransform.d;
          var tx = worldTransform.tx;
          var ty = worldTransform.ty;
          var maxX = -Infinity;
          var maxY = -Infinity;
          var minX = Infinity;
          var minY = Infinity;
          var vertices = this.vertices;
          for (var i = 0,
              n = vertices.length; i < n; i += 2) {
            var rawX = vertices[i],
                rawY = vertices[i + 1];
            var x = (a * rawX) + (c * rawY) + tx;
            var y = (d * rawY) + (b * rawX) + ty;
            minX = x < minX ? x : minX;
            minY = y < minY ? y : minY;
            maxX = x > maxX ? x : maxX;
            maxY = y > maxY ? y : maxY;
          }
          if (minX === -Infinity || maxY === Infinity) {
            return core.math.Rectangle.EMPTY;
          }
          var bounds = this._bounds;
          bounds.x = minX;
          bounds.width = maxX - minX;
          bounds.y = minY;
          bounds.height = maxY - minY;
          this._currentBounds = bounds;
          return bounds;
        };
        Mesh.DRAW_MODES = {
          TRIANGLE_MESH: 0,
          TRIANGLES: 1
        };
      }, {"../core": 29}],
      125: [function(require, module, exports) {
        var Mesh = require('./Mesh');
        var core = require('../core');
        function Rope(texture, points) {
          Mesh.call(this, texture);
          this.points = points;
          this.vertices = new Float32Array(points.length * 4);
          this.uvs = new Float32Array(points.length * 4);
          this.colors = new Float32Array(points.length * 2);
          this.indices = new Uint16Array(points.length * 2);
          this._ready = true;
          this.refresh();
        }
        Rope.prototype = Object.create(Mesh.prototype);
        Rope.prototype.constructor = Rope;
        module.exports = Rope;
        Rope.prototype.refresh = function() {
          var points = this.points;
          if (points.length < 1 || !this._texture._uvs) {
            return;
          }
          var uvs = this.uvs;
          var indices = this.indices;
          var colors = this.colors;
          var textureUvs = this._texture._uvs;
          var offset = new core.math.Point(textureUvs.x0, textureUvs.y0);
          var factor = new core.math.Point(textureUvs.x2 - textureUvs.x0, textureUvs.y2 - textureUvs.y0);
          uvs[0] = 0 + offset.x;
          uvs[1] = 0 + offset.y;
          uvs[2] = 0 + offset.x;
          uvs[3] = 1 * factor.y + offset.y;
          colors[0] = 1;
          colors[1] = 1;
          indices[0] = 0;
          indices[1] = 1;
          var total = points.length,
              point,
              index,
              amount;
          for (var i = 1; i < total; i++) {
            point = points[i];
            index = i * 4;
            amount = i / (total - 1);
            uvs[index] = amount * factor.x + offset.x;
            uvs[index + 1] = 0 + offset.y;
            uvs[index + 2] = amount * factor.x + offset.x;
            uvs[index + 3] = 1 * factor.y + offset.y;
            index = i * 2;
            colors[index] = 1;
            colors[index + 1] = 1;
            index = i * 2;
            indices[index] = index;
            indices[index + 1] = index + 1;
          }
          this.dirty = true;
        };
        Rope.prototype._onTextureUpdate = function() {
          Mesh.prototype._onTextureUpdate.call(this);
          if (this._ready) {
            this.refresh();
          }
        };
        Rope.prototype.updateTransform = function() {
          var points = this.points;
          if (points.length < 1) {
            return;
          }
          var lastPoint = points[0];
          var nextPoint;
          var perpX = 0;
          var perpY = 0;
          var vertices = this.vertices;
          var total = points.length,
              point,
              index,
              ratio,
              perpLength,
              num;
          for (var i = 0; i < total; i++) {
            point = points[i];
            index = i * 4;
            if (i < points.length - 1) {
              nextPoint = points[i + 1];
            } else {
              nextPoint = point;
            }
            perpY = -(nextPoint.x - lastPoint.x);
            perpX = nextPoint.y - lastPoint.y;
            ratio = (1 - (i / (total - 1))) * 10;
            if (ratio > 1) {
              ratio = 1;
            }
            perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
            num = this._texture.height / 2;
            perpX /= perpLength;
            perpY /= perpLength;
            perpX *= num;
            perpY *= num;
            vertices[index] = point.x + perpX;
            vertices[index + 1] = point.y + perpY;
            vertices[index + 2] = point.x - perpX;
            vertices[index + 3] = point.y - perpY;
            lastPoint = point;
          }
          this.containerUpdateTransform();
        };
      }, {
        "../core": 29,
        "./Mesh": 124
      }],
      126: [function(require, module, exports) {
        module.exports = {
          Mesh: require('./Mesh'),
          Rope: require('./Rope'),
          MeshRenderer: require('./webgl/MeshRenderer'),
          MeshShader: require('./webgl/MeshShader')
        };
      }, {
        "./Mesh": 124,
        "./Rope": 125,
        "./webgl/MeshRenderer": 127,
        "./webgl/MeshShader": 128
      }],
      127: [function(require, module, exports) {
        var ObjectRenderer = require('../../core/renderers/webgl/utils/ObjectRenderer'),
            WebGLRenderer = require('../../core/renderers/webgl/WebGLRenderer'),
            Mesh = require('../Mesh');
        function MeshRenderer(renderer) {
          ObjectRenderer.call(this, renderer);
          this.indices = new Uint16Array(15000);
          for (var i = 0,
              j = 0; i < 15000; i += 6, j += 4) {
            this.indices[i + 0] = j + 0;
            this.indices[i + 1] = j + 1;
            this.indices[i + 2] = j + 2;
            this.indices[i + 3] = j + 0;
            this.indices[i + 4] = j + 2;
            this.indices[i + 5] = j + 3;
          }
        }
        MeshRenderer.prototype = Object.create(ObjectRenderer.prototype);
        MeshRenderer.prototype.constructor = MeshRenderer;
        module.exports = MeshRenderer;
        WebGLRenderer.registerPlugin('mesh', MeshRenderer);
        MeshRenderer.prototype.onContextChange = function() {};
        MeshRenderer.prototype.render = function(mesh) {
          if (!mesh._vertexBuffer) {
            this._initWebGL(mesh);
          }
          var renderer = this.renderer,
              gl = renderer.gl,
              texture = mesh._texture.baseTexture,
              shader = renderer.shaderManager.plugins.meshShader;
          var drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;
          renderer.blendModeManager.setBlendMode(mesh.blendMode);
          gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, mesh.worldTransform.toArray(true));
          gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, renderer.currentRenderTarget.projectionMatrix.toArray(true));
          gl.uniform1f(shader.uniforms.alpha._location, mesh.worldAlpha);
          if (!mesh.dirty) {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, mesh.vertices);
            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
            gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE0);
            if (!texture._glTextures[gl.id]) {
              this.renderer.updateTexture(texture);
            } else {
              gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, mesh.indices);
          } else {
            mesh.dirty = false;
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);
            gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE0);
            if (!texture._glTextures[gl.id]) {
              this.renderer.updateTexture(texture);
            } else {
              gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
          }
          gl.drawElements(drawMode, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
        };
        MeshRenderer.prototype._initWebGL = function(mesh) {
          var gl = this.renderer.gl;
          mesh._vertexBuffer = gl.createBuffer();
          mesh._indexBuffer = gl.createBuffer();
          mesh._uvBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.DYNAMIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);
          if (mesh.colors) {
            mesh._colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh._colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, mesh.colors, gl.STATIC_DRAW);
          }
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
        };
        MeshRenderer.prototype.flush = function() {};
        MeshRenderer.prototype.start = function() {
          var shader = this.renderer.shaderManager.plugins.meshShader;
          this.renderer.shaderManager.setShader(shader);
        };
        MeshRenderer.prototype.destroy = function() {};
      }, {
        "../../core/renderers/webgl/WebGLRenderer": 48,
        "../../core/renderers/webgl/utils/ObjectRenderer": 62,
        "../Mesh": 124
      }],
      128: [function(require, module, exports) {
        var core = require('../../core');
        function StripShader(shaderManager) {
          core.Shader.call(this, shaderManager, ['precision lowp float;', 'attribute vec2 aVertexPosition;', 'attribute vec2 aTextureCoord;', 'uniform mat3 translationMatrix;', 'uniform mat3 projectionMatrix;', 'varying vec2 vTextureCoord;', 'void main(void){', '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);', '   vTextureCoord = aTextureCoord;', '}'].join('\n'), ['precision lowp float;', 'varying vec2 vTextureCoord;', 'uniform float alpha;', 'uniform sampler2D uSampler;', 'void main(void){', '   gl_FragColor = texture2D(uSampler, vTextureCoord) * alpha ;', '}'].join('\n'), {
            alpha: {
              type: '1f',
              value: 0
            },
            translationMatrix: {
              type: 'mat3',
              value: new Float32Array(9)
            },
            projectionMatrix: {
              type: 'mat3',
              value: new Float32Array(9)
            }
          }, {
            aVertexPosition: 0,
            aTextureCoord: 0
          });
        }
        StripShader.prototype = Object.create(core.Shader.prototype);
        StripShader.prototype.constructor = StripShader;
        module.exports = StripShader;
        core.ShaderManager.registerPlugin('meshShader', StripShader);
      }, {"../../core": 29}],
      129: [function(require, module, exports) {
        if (!Object.assign) {
          Object.assign = require('object-assign');
        }
      }, {"object-assign": 12}],
      130: [function(require, module, exports) {
        require('./Object.assign');
        require('./requestAnimationFrame');
      }, {
        "./Object.assign": 129,
        "./requestAnimationFrame": 131
      }],
      131: [function(require, module, exports) {
        (function(global) {
          if (!(Date.now && Date.prototype.getTime)) {
            Date.now = function now() {
              return new Date().getTime();
            };
          }
          if (!(global.performance && global.performance.now)) {
            var startTime = Date.now();
            if (!global.performance) {
              global.performance = {};
            }
            global.performance.now = function() {
              return Date.now() - startTime;
            };
          }
          var lastTime = Date.now();
          var vendors = ['ms', 'moz', 'webkit', 'o'];
          for (var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
            global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
            global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame'] || global[vendors[x] + 'CancelRequestAnimationFrame'];
          }
          if (!global.requestAnimationFrame) {
            global.requestAnimationFrame = function(callback) {
              if (typeof callback !== 'function') {
                throw new TypeError(callback + 'is not a function');
              }
              var currentTime = Date.now(),
                  delay = 16 + lastTime - currentTime;
              if (delay < 0) {
                delay = 0;
              }
              lastTime = currentTime;
              return setTimeout(function() {
                lastTime = Date.now();
                callback(performance.now());
              }, delay);
            };
          }
          if (!global.cancelAnimationFrame) {
            global.cancelAnimationFrame = function(id) {
              clearTimeout(id);
            };
          }
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
      }, {}]
    }, {}, [1])(1);
  });
})(require('process'));
