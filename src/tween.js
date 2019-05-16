/**
 * @module tween
 * @license MIT
 * @author nuintun
 */

import Group from './group';
import { now } from './now';
import Events from './events';
import * as Utils from './utils';
import { Easing } from './easing';
import { Interpolation } from './interpolation';

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
export default function Tween(object, group) {
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

Utils.forEach(['add', 'remove', 'update', 'items'], function(method) {
  Tween[method] = function() {
    return Utils.apply(GROUP[method], GROUP, arguments);
  };
});

Utils.inherits(Tween, Events, {
  to: function(properties, duration) {
    var context = this;

    // Unlock reset
    context._reset = true;
    context._to = properties;

    if (Utils.isNonNegative(duration)) {
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

        if (Utils.isFinite(start)) {
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
        endType = Utils.type(end);

        // Check if an Array was provided as property value
        if (endType === '[object Array]') {
          endArray = [];
          toReversed = [];
          length = end.length;

          for (var i = 0; i < length; i++) {
            item = end[i] * 1.0;

            if (Utils.isFinite(item)) {
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

            if (!Utils.isFinite(end)) {
              continue;
            }
          }
        } else if (Utils.isFinite(end)) {
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
    time = Utils.isNonNegative(time) ? time : now();
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
    Utils.forEach(this._chainedTweens, function(tween) {
      if (tween._active) {
        tween.stop();
      }
    });

    return this;
  },
  delay: function(amount) {
    if (Utils.isNonNegative(amount)) {
      this._delayTime = amount;
    }

    return this;
  },
  repeat: function(times) {
    if (Utils.isNonNegative(times) || times === Infinity) {
      this._repeat = times;
    }

    return this;
  },
  repeatDelay: function(amount) {
    var context = this;

    if (Utils.isNonNegative(amount)) {
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

    time = Utils.isNonNegative(time) ? time : now();

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
      endType = Utils.type(end);

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

        Utils.forEach(context._chainedTweens, function(tween) {
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
