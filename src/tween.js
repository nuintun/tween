/*!
 * Tween
 * Version: 0.0.1
 * Date: 2016/11/18
 * https://github.com/nuintun/tween
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
 */

import Queue from './queue';
import Events from './events';
import { now } from './now';
import * as Utils from './utils';
import { Easing } from './easing';
import { Interpolation } from './interpolation';

var QUEUE = new Queue();

/**
 * Tween
 *
 * @constructor
 * @param {Object} object
 * @returns {Tween}
 */
export default function Tween(object) {
  var context = this;

  Events.call(context);

  context._object = object;
  context._from = {};
  context._to = {};
  context._fromReversed = {};
  context._toReversed = {};
  context._duration = 1000;
  context._repeat = 0;
  context._repeated = 0;
  context._repeatDelayTime = null;
  context._yoyo = false;
  context._delayTime = 0;
  context._startTime = null;
  context._easingFunction = Easing.Linear.None;
  context._interpolationFunction = Interpolation.Linear;
  context._chainedTweens = [];
  context._startEventFired = false;

  // Is playing
  context.playing = false;
  // Is reverse
  context.reversed = false;
}

Tween.now = now;
Tween.Easing = Easing;
Tween.Interpolation = Interpolation;

Utils.forEach(['add', 'remove', 'update', 'items'], function(method) {
  Tween[method] = function() {
    return Utils.apply(QUEUE[method], QUEUE, arguments);
  };
});

/**
 * reverseValues
 *
 * @param {Tween} tween
 */
function reverseValues(tween) {
  if (tween._yoyo) {
    tween._from = [
      tween._fromReversed,
      tween._fromReversed = tween._from
    ][0];

    tween._to = [
      tween._toReversed,
      tween._toReversed = tween._to
    ][0];

    tween.reversed = !tween.reversed;
  }
}

Utils.inherits(Tween, Events, {
  to: function(properties, duration) {
    var context = this;

    if (Utils.isNonNegative(duration)) {
      context._duration = duration;
    }

    context._to = properties;

    return context;
  },
  start: function(time) {
    var context = this;

    if (!context._startEventFired) {
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
      var toReversed;
      var fromReversed;
      var to = context._to;
      var from = context._from;

      // Reset values
      context._to = {};
      context._fromReversed = {};
      context._toReversed = {};

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
          length = end.length;
          end = [];
          toReversed = [];

          for (var i = 0; i < length; i++) {
            item = to[property][i] * 1.0;

            if (Utils.isFinite(item)) {
              end.push(item);

              // Set reversed
              toReversed = [item].concat(toReversed);
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
          toReversed.push(start);
          // Set start
          fromReversed = toReversed[0];
        } else if (endType === '[object String]') {
          if (/^[+-](?:\d*\.)?\d+$/.test(end)) {
            fromReversed = Utils.add(start, end * 1.0);
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
        context._fromReversed[property] = fromReversed;
        context._toReversed[property] = toReversed;
      }
    }

    context._repeated = 0;
    context._startEventFired = false;
    context._startTime = Utils.isNonNegative(time) ? time : now();
    context._startTime += context._delayTime;

    context.playing = true;

    // Add to Tween queue
    QUEUE.add(context);

    return context;
  },
  stop: function() {
    var context = this;

    // Is stoped
    if (!context.playing) {
      return context;
    }

    // Remove from Tween queue
    QUEUE.remove(context);

    // Set values
    context.playing = false;
    context._startEventFired = false;

    var object = context._object;

    // Emit stop event
    context.emitWith('stop', object, object);
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
      tween.stop();
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
    } else if (amount === false) {
      context._repeatDelayTime = null;
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
    var value;
    var elapsed;
    var property;
    var context = this;

    time = Utils.isNonNegative(time) ? time : now();

    if (time < context._startTime) {
      return true;
    }

    var object = context._object;

    if (context._startEventFired === false) {
      context.emitWith('start', object, object);

      context._startEventFired = true;
    }

    elapsed = (time - context._startTime) / context._duration;
    elapsed = elapsed > 1 ? 1 : elapsed;

    value = context._easingFunction(elapsed);

    var end;
    var start;
    var endType;
    var yoyo = context._yoyo;
    var from = context._from;
    var to = context._to;

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

    context.emitWith('update', [object, value, context.reversed], object);

    if (elapsed === 1) {
      if (context._repeated < context._repeat) {
        // Cycle events
        context.emitWith('cycle', object, object);

        // repeated times
        context._repeated++;

        // reverse values
        reverseValues(context);

        if (context._repeatDelayTime !== null) {
          context._startTime = time + context._repeatDelayTime;
        } else {
          context._startTime = time + context._delayTime;
        }

        return true;
      }

      context.emitWith('complete', object, object);

      // reverse values
      reverseValues(context);

      Utils.forEach(context._chainedTweens, function(tween) {
        // Make the chained tweens start exactly at the time they should,
        // even if the `update()` method was called way past the duration of the tween
        tween.start(context._startTime + context._duration);
      });

      return false;
    }

    return true;
  }
});
