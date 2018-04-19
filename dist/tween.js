/**
 * @module tween
 * @author nuintun
 * @license MIT
 * @version 1.0.0
 * @description Javascript tweening engine.
 * @see https://github.com/nuintun/tween#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('tween', factory) :
  (global.Tween = factory());
}(this, (function () { 'use strict';

  /**
   * @module utils
   * @author nuintun
   * @license MIT
   * @version 2017/11/20
   */

  var AP = Array.prototype;
  var OP = Object.prototype;
  var APIndexOf = AP.indexOf;
  var APForEach = AP.forEach;
  var OPToString = OP.toString;
  var winIsFinite = window.isFinite;

  /**
   * @function type
   * @param {any} value
   * @returns {string}
   */
  function type(value) {
    return OPToString.call(value);
  }

  /**
   * @function typeIs
   * @param {any} value
   * @param {string} dataType
   * @returns {boolean}
   */
  function typeIs(value, dataType) {
    return type(value) === '[object ' + dataType + ']';
  }

  /**
   * @class Blank
   * @constructor
   */
  function Blank() {}

  /**
   * @function inherits
   * @param {Class} ctor
   * @param {Class} superCtor
   * @param {Object} props
   */
  function inherits(ctor, superCtor, props) {
    // Set prototype
    Blank.prototype = superCtor.prototype;

    // Extends
    ctor.prototype = new Blank();
    ctor.prototype.constructor = ctor;

    // Copy props
    if (props) {
      for (var key in props) {
        if (props.hasOwnProperty(key)) {
          ctor.prototype[key] = props[key];
        }
      }
    }
  }

  /**
   * @function isFinite
   * @param {any} value
   * @returns {boolean}
   */
  var isFinite =
    Number.isFinite ||
    function(value) {
      return typeIs(value, 'Number') && winIsFinite(value);
    };

  /**
   * @function isNonNegative
   * @param {any} value
   * @returns {boolean}
   */
  function isNonNegative(value) {
    return typeIs(value, 'Number') && isFinite(value) && value >= 0;
  }

  /**
   * @function apply
   * @param  {Function} fn
   * @param  {any} context
   * @param  {Array} args
   * @description Call is faster than apply, optimize less than 6 args
   * @see https://github.com/micro-js/apply
   * @see http://blog.csdn.net/zhengyinhui100/article/details/7837127
   */
  function apply(fn, context, args) {
    switch (args.length) {
      // faster
      case 0:
        return fn.call(context);
      case 1:
        return fn.call(context, args[0]);
      case 2:
        return fn.call(context, args[0], args[1]);
      case 3:
        return fn.call(context, args[0], args[1], args[2]);
      default:
        // Slower
        return fn.apply(context, args);
    }
  }

  /**
   * @function indexOf
   * @param {Array} array
   * @param {any} value
   * @param {number} from
   * @returns {number}
   */
  var indexOf = APIndexOf
    ? function(array, value, from) {
        return APIndexOf.call(array, value, from);
      }
    : function(array, value, from) {
        var length = array.length >>> 0;

        from = Number(from) || 0;
        from = Math[from < 0 ? 'ceil' : 'floor'](from);

        if (from < 0) {
          from = Math.max(from + length, 0);
        }

        for (; from < length; from++) {
          if (from in array && array[from] === value) {
            return from;
          }
        }

        return -1;
      };

  /**
   * @function forEach
   * @param {Array} array
   * @param {Function} iterator
   * @param {any} context
   */
  var forEach = APForEach
    ? function(array, iterator, context) {
        APForEach.call(array, iterator, context);
      }
    : function(array, iterator, context) {
        if (arguments.length < 3) {
          context = array;
        }

        for (var i = 0, length = array.length; i < length; i++) {
          iterator.call(array, array[i], i, array);
        }
      };

  /**
   * @function remove
   * @description Faster remove array item
   * @param {Array} array
   * @param {number} index
   */
  function remove(array, index) {
    if (index >= array.length || index < 0) return;

    var last = array.pop();

    if (index < array.length) {
      var removed = array[index];

      array[index] = last;

      return removed;
    }

    return last;
  }

  /**
   * @module now
   * @author nuintun
   * @license MIT
   * @version 2017/11/20
   */

  var now;

  if (window && window.performance && typeIs(window.performance.now, 'Function')) {
    // In a browser, use window.performance.now if it is available.
    // This must be bound, because directly assigning this function
    // leads to an invocation exception in Chrome.
    now = function() {
      return window.performance.now.call(window.performance);
    };
  } else if (typeIs(Date.now, 'Function')) {
    // Use Date.now if it is available.
    now = Date.now;
  } else {
    // Otherwise, use 'new Date().getTime()'.
    now = function() {
      return new Date().getTime();
    };
  }

  /**
   * @module group
   * @author nuintun
   * @license MIT
   * @version 2017/11/20
   */

  /**
   * @class Group
   * @constructor
   */
  function Group() {
    this._tweens = [];
  }

  // Set prototype
  Group.prototype = {
    /**
     * @method items
     * @returns {Tween[]}
     */
    items: function() {
      return this._tweens;
    },
    /**
     * @method add
     * @param {Tween} tween
     */
    add: function(tween) {
      var tweens = this._tweens;

      if (tween instanceof Tween && indexOf(tweens, tween) === -1) {
        tweens.push(tween);
      }
    },
    /**
     * @method remove
     * @param {Tween} tween
     */
    remove: function(tween) {
      var context = this;

      if (arguments.length === 0) {
        context._tweens = [];
      } else {
        var tweens = context._tweens;
        var index = indexOf(tweens, tween);

        remove(tweens, index);
      }
    },
    /**
     * @method update
     * @param {number} time
     * @param {boolean} preserve
     * @returns {boolean}
     */
    update: function(time, preserve) {
      var tweens = this._tweens;

      if (tweens.length === 0) {
        return false;
      }

      time = isNonNegative(time) ? time : now();

      var i = 0;

      while (i < tweens.length) {
        if (tweens[i].update(time) || preserve) {
          i++;
        } else {
          remove(tweens, i);
        }
      }

      return true;
    }
  };

  /**
   * @module events
   * @author nuintun
   * @license MIT
   * @version 2017/11/20
   */

  /**
   * @class Events
   * @constructor
   */
  function Events() {
    this._events = {};
  }

  // Set prototype
  Events.prototype = {
    /**
     * @method on
     * @description Bind callback tos event
     * @param {string} events
     * @param {Function} callback
     * @param {any} context
     * @returns {Events}
     */
    on: function(event, callback) {
      var context = this;
      var events = context._events;
      var callbacks = events[event] || (events[event] = []);

      if (typeIs(callback, 'Function')) {
        callbacks.push(callback);
      }

      return context;
    },
    /**
     * @method off
     * @description Remove callback of event
     *   If `callback` is null, removes all callbacks for the event.
     *   If `event` is null, removes all bound callbacks for the event.
     * @param {string} event
     * @param {Function} callback
     * @returns {Events}
     */
    off: function(event, callback) {
      var context = this;

      switch (arguments.length) {
        case 0:
          context._events = {};
          break;
        case 1:
          delete context._events[event];
          break;
        default:
          var callbacks = events[event];

          if (callbacks) {
            var i = indexOf(callbacks, callback);

            if (i !== -1) {
              callbacks.splice(i, 1);
            }
          }
          break;
      }

      return context;
    },
    /**
     * @method once
     * @description Bind a event only emit once
     * @param {string} events
     * @param {Function} callback
     * @returns {Events}
     */
    once: function(events, callback) {
      var that = this;

      function feedback() {
        that.off(events, feedback);
        apply(callback, this, arguments);
      }

      return that.on(events, feedback);
    },
    /**
     * @method emitWith
     * @description Emit event with context
     * @param {string} event
     * @param {Array} args
     * @param {any} context
     * @returns {Events}
     */
    emitWith: function(event, args, context) {
      var that = this;
      var events = that._events;
      var callbacks = events[event];

      if (!callbacks || callbacks.length === 0) {
        return false;
      }

      // Arguments length
      var length = arguments.length;

      // Default context
      if (length < 3) {
        context = that;
      }

      // Format args
      if (length < 2) {
        args = [];
      } else {
        args = typeIs(args, 'Array') ? args : [args];
      }

      forEach(callbacks, function(callback) {
        apply(callback, context, args);
      });

      return true;
    },
    /**
     * @method emit
     * @description Emit event
     * @param {string} event
     * @param {any} [...args]
     * @returns {Events}
     */
    emit: function(event) {
      var context = this;
      var events = context._events;
      var callbacks = events[event];

      if (!callbacks || callbacks.length === 0) {
        return false;
      }

      var rest = [];

      // Fill up `rest` with the callback arguments. Since we're only copying
      // the tail of `arguments`, a loop is much faster than Array#slice.
      for (var i = 1, length = arguments.length; i < length; i++) {
        rest[i - 1] = arguments[i];
      }

      return context.emitWith(event, rest);
    }
  };

  /**
   * @module easing
   * @author nuintun
   * @license MIT
   * @version 2017/11/20
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
        return 1 - --k * k * k * k;
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
        return Math.sqrt(1 - --k * k);
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
        if (k < 1 / 2.75) {
          return 7.5625 * k * k;
        } else if (k < 2 / 2.75) {
          return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
        } else if (k < 2.5 / 2.75) {
          return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
        } else {
          return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
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

  /**
   * @module interpolation
   * @author nuintun
   * @license MIT
   * @version 2017/11/20
   */

  /**
   * @function factorial
   * @param {number} n
   * @return {number}
   */
  var factorial = (function() {
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

  /**
   * @function linear
   * @param {number} p0
   * @param {number} p1
   * @param {number} t
   * @returns {number}
   */
  function linear(p0, p1, t) {
    return (p1 - p0) * t + p0;
  }

  /**
   * @function bernstein
   * @param {number} n
   * @param {number} i
   * @returns {number}
   */
  function bernstein(n, i) {
    return factorial(n) / factorial(i) / factorial(n - i);
  }

  /**
   * @function catmullRom
   * @param {number} p0
   * @param {number} p1
   * @param {number} p2
   * @param {number} p3
   * @param {number} t
   * @returns {number}
   */
  function catmullRom(p0, p1, p2, p3, t) {
    var v0 = (p2 - p0) * 0.5;
    var v1 = (p3 - p1) * 0.5;
    var t2 = t * t;
    var t3 = t * t2;

    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }

  // Interpolation
  var Interpolation = {
    Linear: function(v, k) {
      var m = v.length - 1;
      var f = m * k;
      var i = Math.floor(f);

      if (k < 0) {
        return linear(v[0], v[1], f);
      }

      if (k > 1) {
        return linear(v[m], v[m - 1], m - f);
      }

      return linear(v[i], v[i + 1 > m ? m : i + 1], f - i);
    },
    Bezier: function(v, k) {
      var b = 0;
      var n = v.length - 1;
      var pw = Math.pow;

      for (var i = 0; i <= n; i++) {
        b += pw(1 - k, n - i) * pw(k, i) * v[i] * bernstein(n, i);
      }

      return b;
    },
    CatmullRom: function(v, k) {
      var m = v.length - 1;
      var f = m * k;
      var i = Math.floor(f);

      if (v[0] === v[m]) {
        if (k < 0) {
          i = Math.floor((f = m * (1 + k)));
        }

        return catmullRom(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
      } else {
        if (k < 0) {
          return v[0] - (catmullRom(v[0], v[0], v[1], v[1], -f) - v[0]);
        }

        if (k > 1) {
          return v[m] - (catmullRom(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
        }

        return catmullRom(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
      }
    }
  };

  /**
   * @module tween
   * @author nuintun
   * @license MIT
   * @version 2017/11/20
   */

  var GROUP = new Group();

  /**
   * @function reverseValues
   * @param {Tween} tween
   */
  function reverseValues(tween) {
    if (tween._yoyo) {
      var fromReversed = tween._fromReversed;

      tween._fromReversed = tween._from;
      tween._from = fromReversed;

      var toReversed = tween._toReversed;

      tween._toReversed = tween._to;
      tween._to = toReversed;

      tween._reversed = !tween._reversed;
    }
  }

  /**
   * @class Tween
   * @constructor
   * @param {Object} object
   * @returns {Tween}
   */
  function Tween(object, group) {
    var context = this;

    Events.call(context);

    context._object = object;
    context._group = group instanceof Group ? group : GROUP;
    context._from = {};
    context._to = {};
    context._fromReversed = {};
    context._toReversed = {};
    context._duration = 1000;
    context._repeat = 0;
    context._repeated = 0;
    context._yoyo = false;
    context._elapsed = 0;
    context._offsetTime = 0;
    context._startTime = 0;
    context._delayTime = 0;
    context._repeatDelayTime = 0;
    context._easingFunction = Easing.Linear.None;
    context._interpolationFunction = Interpolation.Linear;
    context._chainedTweens = [];
    context._startEventFired = false;
    context._reset = false;
    context._active = false;
    context._playing = false;
    context._reversed = false;
  }

  Tween.now = now;
  Tween.Group = Group;
  Tween.Easing = Easing;
  Tween.Interpolation = Interpolation;

  forEach(['add', 'remove', 'update', 'items'], function(method) {
    Tween[method] = function() {
      return apply(GROUP[method], GROUP, arguments);
    };
  });

  inherits(Tween, Events, {
    to: function(properties, duration) {
      var context = this;

      // Unlock reset
      context._reset = true;
      context._to = properties;

      if (isNonNegative(duration)) {
        context._duration = duration;
      }

      return context;
    },
    start: function(time) {
      var context = this;

      // Must not active and run after to method
      if (context._active || !context._to) return context;

      // Active
      context._active = true;

      // Reset from and to values
      if (context._reset) {
        // Lock reset
        context._reset = false;

        var start;
        var object = context._object;

        // Reset values
        context._from = {};

        // Set all starting values present on the target object
        for (var field in object) {
          // Ensures we're using numbers, not strings
          start = object[field] * 1.0;

          if (isFinite(start)) {
            context._from[field] = start;
          }
        }

        var i;
        var end;
        var item;
        var length;
        var endType;
        var endArray;
        var toReversed;
        var fromReversed;
        var to = context._to;
        var from = context._from;

        // Reset values
        context._to = {};
        context._toReversed = {};
        context._fromReversed = {};

        // Protect against non numeric properties.
        for (var property in to) {
          // If `to()` specifies a property that doesn't exist in the source object,
          // we should not set that property in the object
          if (!from.hasOwnProperty(property)) {
            continue;
          }

          // Get start value
          start = from[property];
          end = to[property];
          endType = type(end);

          // Check if an Array was provided as property value
          if (endType === '[object Array]') {
            endArray = [];
            toReversed = [];
            length = end.length;

            for (var i = 0; i < length; i++) {
              item = end[i] * 1.0;

              if (isFinite(item)) {
                endArray.push(item);

                // Set reversed
                toReversed = [item].concat(toReversed);
              } else {
                endArray = [];
                break;
              }
            }

            if (endArray.length === 0) {
              continue;
            }

            // Set reversed
            toReversed.push(start);

            // Create a local copy of the Array with the start value at the front
            end = [start].concat(endArray);
            fromReversed = toReversed[0];
          } else if (endType === '[object String]') {
            if (/^[+-](?:\d*\.)?\d+$/.test(end)) {
              fromReversed = start + end * 1.0;
              toReversed = (end.charAt(0) === '+' ? '-' : '+') + end.substring(1);
            } else {
              end *= 1.0;
              fromReversed = end;
              toReversed = start;

              if (!isFinite(end)) {
                continue;
              }
            }
          } else if (isFinite(end)) {
            fromReversed = end;
            toReversed = start;
          } else {
            continue;
          }

          // Set values
          context._to[property] = end;
          context._toReversed[property] = toReversed;
          context._fromReversed[property] = fromReversed;
        }
      }

      // Get start time
      time = isNonNegative(time) ? time : now();
      time += context._delayTime;

      // Set start time
      context._startTime = time;
      // Compute offset time
      context._offsetTime = context._duration * context._elapsed;

      // Add to Tween queue
      context._group.add(context);

      return context;
    },
    stop: function() {
      var context = this;

      if (context._active) {
        // Remove from Tween queue
        context._group.remove(context);

        // Set values
        context._active = false;
        context._playing = false;

        var object = context._object;

        // Stop event
        context.emitWith('stop', object, object);
      }

      // Stop chain tween
      context.stopChainedTweens();

      return context;
    },
    end: function() {
      var context = this;

      context.update(context._startTime + context._duration);

      return context;
    },
    stopChainedTweens: function() {
      forEach(this._chainedTweens, function(tween) {
        if (tween._active) {
          tween.stop();
        }
      });

      return this;
    },
    delay: function(amount) {
      if (isNonNegative(amount)) {
        this._delayTime = amount;
      }

      return this;
    },
    repeat: function(times) {
      if (isNonNegative(times) || times === Infinity) {
        this._repeat = times;
      }

      return this;
    },
    repeatDelay: function(amount) {
      var context = this;

      if (isNonNegative(amount)) {
        context._repeatDelayTime = amount;
      } else {
        context._repeatDelayTime = 0;
      }

      return this;
    },
    yoyo: function(yoyo) {
      this._yoyo = !!yoyo;

      return this;
    },
    easing: function(easing) {
      this._easingFunction = easing;

      return this;
    },
    interpolation: function(interpolation) {
      this._interpolationFunction = interpolation;

      return this;
    },
    chain: function() {
      this._chainedTweens = arguments;

      return this;
    },
    update: function(time) {
      var context = this;
      var isAlive = true;

      time = isNonNegative(time) ? time : now();

      if (time < context._startTime) {
        return isAlive;
      }

      // Playing
      context._playing = true;

      var object = context._object;
      var offsetTime = context._offsetTime;

      if (!context._startEventFired) {
        context._startEventFired = true;

        // Start event
        context.emitWith('start', object, object);
      }

      // Elapsed percent
      var elapsed = (time - context._startTime + offsetTime) / context._duration;

      // Max 1
      elapsed = elapsed > 1 ? 1 : elapsed;

      // Elapsed
      context._elapsed = elapsed;

      var end;
      var start;
      var endType;
      var property;
      var to = context._to;
      var from = context._from;
      var yoyo = context._yoyo;
      // Easing value
      var value = context._easingFunction(elapsed);

      for (property in to) {
        // Don't update properties that do not exist in the values start repeat object
        if (!from.hasOwnProperty(property)) {
          continue;
        }

        start = from[property];
        end = to[property];
        endType = type(end);

        if (endType === '[object Array]') {
          object[property] = context._interpolationFunction(end, value);
          continue;
        } else if (endType === '[object String]') {
          // Parses relative end values with start as base (e.g.: +10, -3)
          end = start + end * 1.0;

          // If not yoyo and relative end values reset values start
          if (elapsed === 1 && !yoyo) {
            from[property] = end;
          }
        }

        // Change object property value
        object[property] = start + (end - start) * value;
      }

      // Update event
      context.emitWith('update', [object, elapsed, context._reversed], object);

      if (elapsed === 1) {
        // Set values
        context._playing = false;
        context._offsetTime = 0;

        // Repeat
        if (context._repeated < context._repeat) {
          // Repeated times
          context._repeated++;

          // Reverse values
          reverseValues(context);

          // Recompute repeat start time
          if (context._repeatDelayTime > 0) {
            time += context._repeatDelayTime;
          } else {
            time += context._delayTime;
          }

          // Set start time
          context._startTime = time;

          // Repeat event
          context.emitWith('repeat', object, object);
        } else {
          // Complete event
          context.emitWith('complete', object, object);

          // Set values
          context._repeated = 0;
          context._active = false;
          context._startEventFired = false;

          // Reverse values
          reverseValues(context);

          forEach(context._chainedTweens, function(tween) {
            // Make the chained tweens start exactly at the time they should,
            // even if the `update()` method was called way past the duration of the tween
            tween.start(context._startTime - offsetTime + context._duration);
          });

          // Not alive
          isAlive = false;
        }

        // Set values
        context._elapsed = 0;

        return isAlive;
      }

      return isAlive;
    },
    status: function() {
      var context = this;
      var playing = context._playing;

      return {
        playing: playing,
        active: context._active,
        reversed: context._reversed,
        paused: !playing && context._elapsed > 0
      };
    }
  });

  return Tween;

})));
