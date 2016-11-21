(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('tween', factory) :
  (global.Tween = factory());
}(this, (function () { 'use strict';

  /*!
   * Utils
   * Version: 0.0.1
   * Date: 2016/11/18
   * https://github.com/nuintun/tween
   *
   * This is licensed under the MIT License (MIT).
   * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
   */

  var toString = Object.prototype.toString;

  /**
   * Type
   * @param {any} value
   * @returns
   */
  function Type(value) {
    return toString.call(value);
  }

  /**
   * IsType
   * @param {any} value
   * @param {any} type
   * @returns
   */
  function IsType(value, type) {
    return Type(value) === '[object ' + type + ']';
  }

  /**
   * Inherits
   * @param ctor
   * @param superCtor
   * @param proto
   */
  function Inherits(ctor, superCtor, proto) {
    function F() {
      // constructor
    }

    // prototype
    F.prototype = superCtor.prototype;

    ctor.prototype = new F();
    ctor.prototype.constructor = ctor;

    if (proto) {
      for (var key in proto) {
        if (proto.hasOwnProperty(key)) {
          ctor.prototype[key] = proto[key];
        }
      }
    }
  }

  // IsFinite
  var IsFinite = Number.isFinite || isFinite;

  /** 
   * IsNatural
   * @param {any} number
   */
  function IsNatural(number) {
    return IsType(number, 'Number') && IsFinite(number) && number >= 0;
  }

  /**
   * Apply
   * @param  {Function} fn
   * @param  {Any} context
   * @param  {Array} args
   * call is faster than apply, optimize less than 6 args
   * https://github.com/micro-js/apply
   * http://blog.csdn.net/zhengyinhui100/article/details/7837127
   */

  function Apply(fn, context, args) {
    switch (args.length) {
      case 1:
        return fn.call(context, args[0]);
      case 2:
        return fn.call(context, args[0], args[1]);
      case 3:
        return fn.call(context, args[0], args[1], args[2]);
      case 4:
        return fn.call(context, args[0], args[1], args[2], args[3]);
      case 5:
        return fn.call(context, args[0], args[1], args[2], args[3], args[4]);
      case 6:
        return fn.call(context, args[0], args[1], args[2], args[3], args[4], args[5]);
      default:
        return fn.apply(context, args);
    }
  }

  /**
   * Each
   * @param {any} array
   * @param {any} iterator
   * @param {any} context
   */
  function Each(array, iterator, context) {
    if (arguments.length < 3) {
      context = array;
    }

    for (var i = 0, length = array.length; i < length; i++) {
      Apply(iterator, array, [array[i], i, array]);
    }
  }

  /**
   * object keys
   * @param object
   * @returns {Array}
   */
  var Keys = Object.keys ? Object.keys : function(object) {
    var result = [];

    for (var name in object) {
      if (object.hasOwnProperty(name)) {
        result.push(name);
      }
    }

    return result;
  };

  /**
   * ArrayIndexOf
   * @param {any} array
   * @param {any} item
   * @returns
   */
  function ArrayIndexOf(array, item) {
    if (array.indexOf) {
      return array.indexOf.call(array, item);
    }

    for (var i = 0, length = array.length; i < length; i++) {
      if (array[i] === item) {
        return i;
      }
    }

    return -1;
  }

  /*!
   * now
   * Version: 0.0.1
   * Date: 2016/11/18
   * https://github.com/nuintun/tween
   *
   * This is licensed under the MIT License (MIT).
   * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
   */

  // Include a performance.now polyfill
  var now;

  if (window &&
    window.performance &&
    IsType(window.performance.now, 'Function')) {
    // In a browser, use window.performance.now if it is available.
    // This must be bound, because directly assigning this function
    // leads to an invocation exception in Chrome.
    now = function() {
      return window.performance.now.call(window.performance);
    };
  } else if (IsType(Date.now, 'Function')) {
    // Use Date.now if it is available.
    now = Date.now;
  } else {
    // Otherwise, use 'new Date().getTime()'.
    now = function() {
      return new Date().getTime();
    };
  }

  /*!
   * Queue
   * Version: 0.0.1
   * Date: 2016/11/18
   * https://github.com/nuintun/tween
   *
   * This is licensed under the MIT License (MIT).
   * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
   */

  function Queue() {
    this.__tweens = [];
  }

  Queue.prototype = {
    items: function() {
      return this.__tweens;
    },
    add: function(tween) {
      var context = this;
      var tweens = context.__tweens;

      if (ArrayIndexOf(tweens, tween) === -1) {
        tweens.push(tween);
      }
    },
    remove: function(tween) {
      var context = this;

      if (arguments.length === 0) {
        context.__tweens = [];
      } else {
        var tweens = context.__tweens;
        var i = ArrayIndexOf(tweens, tween);

        if (i !== -1) {
          tweens.splice(i, 1);
        }
      }
    },
    update: function(time, preserve) {
      var tweens = this.__tweens;

      if (tweens.length === 0) {
        return false;
      }

      var i = 0;

      time = IsNatural(time) ? time : now();

      while (i < tweens.length) {
        if (tweens[i].update(time) || preserve) {
          i++;
        } else {
          tweens.splice(i, 1);
        }
      }

      return true;
    }
  };

  /*!
   * Events
   * Version: 0.0.2
   * Date: 2016/11/18
   * https://github.com/nuintun/tween
   *
   * Original Author: https://github.com/aralejs/events
   *
   * This is licensed under the MIT License (MIT).
   * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
   */

  // events
  // -----------------
  // thanks to:
  //  - https://github.com/documentcloud/backbone/blob/master/backbone.js
  //  - https://github.com/joyent/node/blob/master/lib/events.js

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  /**
   * execute callbacks
   * @param list
   * @param args
   * @param context
   * @returns {boolean}
   */
  function triggerEvents(list, args, context) {
    var pass = true;

    if (list) {
      var i = 0;
      var l = list.length;

      for (; i < l; i += 2) {
        pass = Apply(list[i], list[i + 1] || context, args) !== false && pass;
      }
    }

    // trigger will return false if one of the callbacks return false
    return pass;
  }

  /**
   * a module that can be mixed in to *any object* in order to provide it
   * with custom events. You may bind with `on` or remove with `off` callback
   * functions to an event; `trigger`-ing an event fires all callbacks in
   * succession.
   *   var object = new Events();
   *   object.on('expand', function(){ alert('expanded'); });
   *   object.trigger('expand');
   * @constructor
   */
  function Events() {
    // constructor
  }

  /**
   * bind one or more space separated events, `events`, to a `callback`
   * function. Passing `"all"` will bind the callback to all events fired.
   * @param events
   * @param callback
   * @param context
   * @returns {Events}
   */
  Events.prototype.on = function(events, callback, context) {
    var that = this;
    var cache, event, list;

    if (!callback) return that;

    events = events.split(eventSplitter);
    cache = that.__events || (that.__events = {});

    while (event = events.shift()) {
      list = cache[event] || (cache[event] = []);

      list.push(callback, context);
    }

    return that;
  };

  /**
   * bind a event only emit once
   * @param events
   * @param callback
   * @param context
   */
  Events.prototype.once = function(events, callback, context) {
    var that = this;
    var args = arguments;
    var cb = function() {
      context = args.length < 3 ? this : that;

      that.off(events, cb);
      Apply(callback, context, arguments);
    };

    return that.on(events, cb, context);
  };

  /**
   * remove one or many callbacks. If `context` is null, removes all callbacks
   * with that function. If `callback` is null, removes all callbacks for the
   * event. If `events` is null, removes all bound callbacks for all events.
   * @param events
   * @param callback
   * @param context
   * @returns {Events}
   */
  Events.prototype.off = function(events, callback, context) {
    var that = this;
    var cache;
    var event;
    var list;
    var i;

    // no events, or removing *all* events.
    if (!(cache = that.__events)) return that;

    // remove all events
    if (!(events || callback || context)) {
      delete that.__events;

      return that;
    }

    events = events ? events.split(eventSplitter) : Keys(cache);

    // loop through the callback list, splicing where appropriate.
    while (event = events.shift()) {
      list = cache[event];

      if (!list) continue;

      if (!(callback || context)) {
        delete cache[event];
        continue;
      }

      for (i = list.length - 2; i >= 0; i -= 2) {
        if (!(callback && list[i] !== callback ||
            context && list[i + 1] !== context)) {
          list.splice(i, 2);
          break;
        }
      }
    }

    return that;
  };

  /**
   * emit one or many events, firing all bound callbacks. Callbacks are
   * passed the same arguments as `trigger` is, apart from the event name
   * (unless you're listening on `"all"`, which will cause your callback to
   * receive the true name of the event as the first argument).
   * @param events
   * @param args
   * @param context
   * @returns {*}
   */
  Events.prototype.emitWith = function(events, args, context) {
    var cache;
    var that = this;

    if (!(cache = that.__events)) return this;

    if (arguments.length < 3) {
      context = that;
    }

    var event;
    var all;
    var list;
    var returned = true;

    events = events.split(eventSplitter);
    args = IsType(args, 'Array') ? args : [args];

    // for each event, walk through the list of callbacks twice, first to
    // trigger the event, then to trigger any `"all"` callbacks.
    while (event = events.shift()) {
      // copy callback lists to prevent modification.
      if (all = cache.all) {
        all = all.slice();
      }

      if (list = cache[event]) {
        list = list.slice();
      }

      // execute event callbacks except one named "all"
      if (event !== 'all') {
        returned = triggerEvents(list, args, context) && returned;
      }

      // execute "all" callbacks.
      returned = triggerEvents(all, [event].concat(args), context) && returned;
    }

    return returned;
  };

  /**
   * emit one or many events, firing all bound callbacks. Callbacks are
   * passed the same arguments as `trigger` is, apart from the event name
   * (unless you're listening on `"all"`, which will cause your callback to
   * receive the true name of the event as the first argument).
   * @param events
   * @returns {*}
   */
  Events.prototype.emit = function(events) {
    var rest = [];

    // fill up `rest` with the callback arguments.  Since we're only copying
    // the tail of `arguments`, a loop is much faster than Array#slice.
    for (var i = 1, len = arguments.length; i < len; i++) {
      rest[i - 1] = arguments[i];
    }

    return this.emitWith(events, rest);
  };

  /*!
   * Easing
   * Version: 0.0.1
   * Date: 2016/11/18
   * https://github.com/nuintun/tween
   *
   * This is licensed under the MIT License (MIT).
   * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
   */

  var Easing = {
    Linear: {
      None: function(k) {
        return k;
      }
    },
    Quadratic: {
      In: function(k) {
        return k * k;
      },
      Out: function(k) {
        return k * (2 - k);
      },
      InOut: function(k) {
        if ((k *= 2) < 1) {
          return 0.5 * k * k;
        }

        return -0.5 * (--k * (k - 2) - 1);
      }
    },
    Cubic: {
      In: function(k) {
        return k * k * k;
      },
      Out: function(k) {
        return --k * k * k + 1;
      },
      InOut: function(k) {
        if ((k *= 2) < 1) {
          return 0.5 * k * k * k;
        }

        return 0.5 * ((k -= 2) * k * k + 2);
      }
    },
    Quartic: {
      In: function(k) {
        return k * k * k * k;
      },
      Out: function(k) {
        return 1 - (--k * k * k * k);
      },
      InOut: function(k) {
        if ((k *= 2) < 1) {
          return 0.5 * k * k * k * k;
        }

        return -0.5 * ((k -= 2) * k * k * k - 2);
      }
    },
    Quintic: {
      In: function(k) {
        return k * k * k * k * k;
      },
      Out: function(k) {
        return --k * k * k * k * k + 1;
      },
      InOut: function(k) {
        if ((k *= 2) < 1) {
          return 0.5 * k * k * k * k * k;
        }

        return 0.5 * ((k -= 2) * k * k * k * k + 2);
      }
    },
    Sinusoidal: {
      In: function(k) {
        return 1 - Math.cos(k * Math.PI / 2);
      },
      Out: function(k) {
        return Math.sin(k * Math.PI / 2);
      },
      InOut: function(k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
      }
    },
    Exponential: {
      In: function(k) {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
      },
      Out: function(k) {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      },
      InOut: function(k) {
        if (k === 0) {
          return 0;
        }

        if (k === 1) {
          return 1;
        }

        if ((k *= 2) < 1) {
          return 0.5 * Math.pow(1024, k - 1);
        }

        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
      }
    },
    Circular: {
      In: function(k) {
        return 1 - Math.sqrt(1 - k * k);
      },
      Out: function(k) {
        return Math.sqrt(1 - (--k * k));
      },
      InOut: function(k) {
        if ((k *= 2) < 1) {
          return -0.5 * (Math.sqrt(1 - k * k) - 1);
        }

        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
      }
    },
    Elastic: {
      In: function(k) {
        if (k === 0) {
          return 0;
        }

        if (k === 1) {
          return 1;
        }

        return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
      },
      Out: function(k) {
        if (k === 0) {
          return 0;
        }

        if (k === 1) {
          return 1;
        }

        return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
      },
      InOut: function(k) {
        if (k === 0) {
          return 0;
        }

        if (k === 1) {
          return 1;
        }

        k *= 2;

        if (k < 1) {
          return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
        }

        return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
      }
    },
    Back: {
      In: function(k) {
        var s = 1.70158;

        return k * k * ((s + 1) * k - s);
      },
      Out: function(k) {
        var s = 1.70158;

        return --k * k * ((s + 1) * k + s) + 1;
      },
      InOut: function(k) {
        var s = 1.70158 * 1.525;

        if ((k *= 2) < 1) {
          return 0.5 * (k * k * ((s + 1) * k - s));
        }

        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
      }
    },
    Bounce: {
      In: function(k) {
        return 1 - Easing.Bounce.Out(1 - k);
      },
      Out: function(k) {
        if (k < (1 / 2.75)) {
          return 7.5625 * k * k;
        } else if (k < (2 / 2.75)) {
          return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        } else if (k < (2.5 / 2.75)) {
          return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        } else {
          return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
        }
      },
      InOut: function(k) {
        if (k < 0.5) {
          return Easing.Bounce.In(k * 2) * 0.5;
        }

        return Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
      }
    }
  };

  /*!
   * Interpolation
   * Version: 0.0.1
   * Date: 2016/11/18
   * https://github.com/nuintun/tween
   *
   * This is licensed under the MIT License (MIT).
   * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
   */

  var Factorial = (function() {
    var a = [1];

    return function(n) {
      var s = 1;

      if (a[n]) {
        return a[n];
      }

      for (var i = n; i > 1; i--) {
        s *= i;
      }

      a[n] = s;

      return s;
    };
  })();

  function Linear(p0, p1, t) {
    return (p1 - p0) * t + p0;
  }

  function Bernstein(n, i) {
    return Factorial(n) / Factorial(i) / Factorial(n - i);
  }

  function CatmullRom(p0, p1, p2, p3, t) {
    var v0 = (p2 - p0) * 0.5;
    var v1 = (p3 - p1) * 0.5;
    var t2 = t * t;
    var t3 = t * t2;

    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }

  var Interpolation = {
    Linear: function(v, k) {
      var m = v.length - 1;
      var f = m * k;
      var i = Math.floor(f);

      if (k < 0) {
        return Linear(v[0], v[1], f);
      }

      if (k > 1) {
        return Linear(v[m], v[m - 1], m - f);
      }

      return Linear(v[i], v[i + 1 > m ? m : i + 1], f - i);
    },
    Bezier: function(v, k) {
      var b = 0;
      var n = v.length - 1;
      var pw = Math.pow;

      for (var i = 0; i <= n; i++) {
        b += pw(1 - k, n - i) * pw(k, i) * v[i] * Bernstein(n, i);
      }

      return b;
    },
    CatmullRom: function(v, k) {
      var m = v.length - 1;
      var f = m * k;
      var i = Math.floor(f);

      if (v[0] === v[m]) {
        if (k < 0) {
          i = Math.floor(f = m * (1 + k));
        }

        return CatmullRom(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
      } else {
        if (k < 0) {
          return v[0] - (CatmullRom(v[0], v[0], v[1], v[1], -f) - v[0]);
        }

        if (k > 1) {
          return v[m] - (CatmullRom(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
        }

        return CatmullRom(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
      }
    }
  };

  /*!
   * Tween
   * Version: 0.0.1
   * Date: 2016/11/18
   * https://github.com/nuintun/tween
   *
   * This is licensed under the MIT License (MIT).
   * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
   */

  var QUEUE = new Queue();
  var RELATIVERE = /^[+-]\d+$/;

  function Tween(object) {
    var context = this;

    context.__object = object;
    context.__valuesStart = {};
    context.__valuesEnd = {};
    context.__startReversed = {};
    context.__endReversed = {};
    context.__duration = 1000;
    context.__repeat = 0;
    context.__repeatDelayTime = null;
    context.__yoyo = false;
    context.__delayTime = 0;
    context.__startTime = null;
    context.__easingFunction = Easing.Linear.None;
    context.__interpolationFunction = Interpolation.Linear;
    context.__chainedTweens = [];
    context.__startEventFired = false;

    // Is playing
    context.playing = false;
    // Is reverse
    context.reversed = false;
  }

  Tween.now = now;
  Tween.Easing = Easing;
  Tween.Interpolation = Interpolation;

  Each(['add', 'remove', 'update', 'items'], function(method) {
    Tween[method] = function() {
      return Apply(QUEUE[method], QUEUE, arguments);
    };
  });

  Inherits(Tween, Events, {
    to: function(properties, duration) {
      var context = this;

      if (IsNatural(duration)) {
        context.__duration = duration;
      }

      context.__valuesEnd = properties;

      return context;
    },
    start: function(time) {
      var context = this;

      QUEUE.add(context);

      context.playing = true;
      context.__startEventFired = false;
      context.__startTime = IsNatural(time) ? time : now();
      context.__startTime += context.__delayTime;

      var start;
      var object = context.__object;

      // Set all starting values present on the target object
      for (var field in object) {
        // Ensures we're using numbers, not strings
        start = object[field] * 1.0;

        if (IsFinite(start)) {
          context.__valuesStart[field] = start;
        }
      }

      var i;
      var end;
      var item;
      var length;
      var endType;
      var endReversed;
      var startReversed;
      var valuesEnd = context.__valuesEnd;
      var valuesStart = context.__valuesStart;

      // Reset values
      context.__valuesEnd = {};
      context.__startReversed = {};
      context.__endReversed = {};

      // Protect against non numeric properties.
      for (var property in valuesEnd) {
        // If `to()` specifies a property that doesn't exist in the source object,
        // we should not set that property in the object
        if (!valuesStart.hasOwnProperty(property)) {
          continue;
        }

        // Get start value
        start = valuesStart[property];
        end = valuesEnd[property];
        endType = Type(end);

        // Check if an Array was provided as property value
        if (endType === '[object Array]') {
          length = end.length;
          end = [];
          endReversed = [];

          for (var i = 0; i < length; i++) {
            item = valuesEnd[property][i] * 1.0;

            if (IsFinite(item)) {
              end.push(item);

              // Set reversed
              endReversed = [item].concat(endReversed);
            } else {
              end = [];
              break;
            }
          }

          if (end.length === 0) {
            continue;
          }

          // Create a local copy of the Array with the start value at the front
          end = [start].concat(end);

          // Set reversed
          endReversed.push(start);
          // Set start
          startReversed = endReversed[0];
        } else if (endType === '[object String]') {
          if (RELATIVERE.test(end)) {
            startReversed = start + end * 1.0;
            endReversed = (end.charAt(0) === '+' ? '-' : '+') + end.substring(1);
          } else {
            end *= 1.0;
            startReversed = end;
            endReversed = start;

            if (!IsFinite(end)) {
              continue;
            }
          }
        } else if (IsFinite(end)) {
          startReversed = end;
          endReversed = start;
        } else {
          continue;
        }

        // Set values
        context.__valuesEnd[property] = end;
        context.__startReversed[property] = startReversed;
        context.__endReversed[property] = endReversed;
      }

      return context;
    },
    stop: function() {
      var context = this;

      if (!context.playing) {
        return context;
      }

      QUEUE.remove(context);

      context.playing = false;
      context.__startEventFired = false;

      var object = context.__object;

      context.emitWith('stop', object, object);

      context.stopChainedTweens();

      return context;
    },
    end: function() {
      var context = this;

      context.update(context.__startTime + context.__duration);

      return context;
    },
    stopChainedTweens: function() {
      Each(this.__chainedTweens, function(tween) {
        tween.stop();
      });

      return this;
    },
    delay: function(amount) {
      if (IsNatural(amount)) {
        this.__delayTime = amount;
      }

      return this;
    },
    repeat: function(times) {
      if (IsNatural(times) || times === Infinity) {
        this.__repeat = times;
      }

      return this;
    },
    repeatDelay: function(amount) {
      var context = this;

      if (IsNatural(amount)) {
        context.__repeatDelayTime = amount;
      } else if (amount === false) {
        context.__repeatDelayTime = null;
      }

      return this;
    },
    yoyo: function(yoyo) {
      this.__yoyo = !!yoyo;

      return this;
    },
    easing: function(easing) {
      this.__easingFunction = easing;

      return this;
    },
    interpolation: function(interpolation) {
      this.__interpolationFunction = interpolation;

      return this;
    },
    chain: function() {
      this.__chainedTweens = arguments;

      return this;
    },
    update: function(time) {
      var value;
      var elapsed;
      var property;
      var context = this;

      time = IsNatural(time) ? time : now();

      if (time < context.__startTime) {
        return true;
      }

      var object = context.__object;

      if (context.__startEventFired === false) {
        context.emitWith('start', object, object);

        context.__startEventFired = true;
      }

      elapsed = (time - context.__startTime) / context.__duration;
      elapsed = elapsed > 1 ? 1 : elapsed;

      value = context.__easingFunction(elapsed);

      var end;
      var start;
      var endType;
      var yoyo = context.__yoyo;
      var valuesEnd = context.__valuesEnd;
      var valuesStart = context.__valuesStart;

      for (property in valuesEnd) {
        // Don't update properties that do not exist in the values start repeat object
        if (!valuesStart.hasOwnProperty(property)) {
          continue;
        }

        start = valuesStart[property];
        end = valuesEnd[property];
        endType = Type(end);

        if (endType === '[object Array]') {
          object[property] = context.__interpolationFunction(end, value);
          continue;
        } else if (endType === '[object String]') {
          // Parses relative end values with start as base (e.g.: +10, -3)
          end = start + end * 1.0;

          // If not yoyo and relative end values reset values start
          if (elapsed === 1 && !yoyo) {
            valuesStart[property] = end;
          }
        }

        // Change object property value
        object[property] = start + (end - start) * value;
      }

      context.emitWith('update', [object, value, context.reversed], object);

      if (elapsed === 1) {
        if (context.__repeat > 0) {
          // Cycle events
          context.emitWith('cycle', object, object);

          // Is finite repeat
          if (IsFinite(context.__repeat)) {
            context.__repeat--;
          }

          if (yoyo) {
            context.reversed = !context.reversed;

            context.__valuesStart = [
              context.__startReversed,
              context.__startReversed = valuesStart
            ][0];

            context.__valuesEnd = [
              context.__endReversed,
              context.__endReversed = valuesEnd
            ][0];
          }

          if (context.__repeatDelayTime !== null) {
            context.__startTime = time + context.__repeatDelayTime;
          } else {
            context.__startTime = time + context.__delayTime;
          }

          return true;
        }

        context.emitWith('complete', object, object);

        Each(context.__chainedTweens, function(tween) {
          // Make the chained tweens start exactly at the time they should,
          // even if the `update()` method was called way past the duration of the tween
          tween.start(context.__startTime + context.__duration);
        });

        return false;
      }

      return true;
    }
  });

  return Tween;

})));
