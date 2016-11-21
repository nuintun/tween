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
var RELATIVERE = /^[+-]\d+$/;

export default function Tween(object) {
  var context = this;

  context.__object = object;
  context.__valuesStart = {};
  context.__valuesEnd = {};
  context.__valuesReversed = {};
  context.__duration = 1000;
  context.__repeat = 0;
  context.__repeatDelayTime = null;
  context.__yoyo = false;
  context.__isPlaying = false;
  context.__delayTime = 0;
  context.__startTime = null;
  context.__easingFunction = Easing.Linear.None;
  context.__interpolationFunction = Interpolation.Linear;
  context.__chainedTweens = [];
  context.__startEventFired = false;

  // Is reverse
  context.reversed = false;
}

Tween.now = now;
Tween.Easing = Easing;
Tween.Interpolation = Interpolation;

Utils.Each(['add', 'remove', 'update', 'items'], function(method) {
  Tween[method] = function() {
    return Utils.Apply(QUEUE[method], QUEUE, arguments);
  };
});

Utils.Inherits(Tween, Events, {
  to: function(properties, duration) {
    var context = this;

    if (Utils.IsNatural(duration)) {
      context.__duration = duration;
    }

    context.__valuesEnd = properties;

    return context;
  },
  start: function(time) {
    var context = this;

    QUEUE.add(context);

    context.__isPlaying = true;
    context.__startEventFired = false;
    context.__startTime = Utils.IsNatural(time) ? time : now();
    context.__startTime += context.__delayTime;

    var start;
    var object = context.__object;

    // Set all starting values present on the target object
    for (var field in object) {
      // Ensures we're using numbers, not strings
      start = object[field] * 1.0;

      if (Utils.IsFinite(start)) {
        context.__valuesStart[field] = start;
      }
    }

    var end;
    var endType;
    var valuesEnd = context.__valuesEnd;
    var valuesStart = context.__valuesStart;
    var valuesReversed = context.__valuesReversed;

    // Reset value end
    // context.__valuesEnd = {};

    // Init
    for (var property in valuesStart) {
      // If `to()` specifies a property that doesn't exist in the source object,
      // we should not set that property in the object
      if (!valuesEnd.hasOwnProperty(property)) {
        continue;
      }

      // Get start value
      start = valuesStart[property];
      end = valuesEnd[property];
      endType = Utils.Type(end);

      // Check if an Array was provided as property value
      if (endType === '[object Array]') {
        if (end.length === 0) {
          continue;
        }

        // Create a local copy of the Array with the start value at the front
        valuesEnd[property] = [start].concat(end);
      }
    }

    return context;
  },
  stop: function() {
    var context = this;

    if (!context.__isPlaying) {
      return context;
    }

    QUEUE.remove(context);

    context.__isPlaying = false;

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
    Utils.Each(this.__chainedTweens, function(tween) {
      tween.stop();
    });

    return this;
  },
  delay: function(amount) {
    if (Utils.IsNatural(amount)) {
      this.__delayTime = amount;
    }

    return this;
  },
  repeat: function(times) {
    if (Utils.IsNatural(times) || times === Infinity) {
      this.__repeat = times;
    }

    return this;
  },
  repeatDelay: function(amount) {
    var context = this;

    if (Utils.IsNatural(amount)) {
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
    var property;
    var elapsed;
    var value;
    var context = this;

    time = Utils.IsNatural(time) ? time : now();

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

    var start;
    var end;
    var endType;
    var valuesEnd = context.__valuesEnd;
    var valuesStart = context.__valuesStart;

    for (property in valuesEnd) {
      // Don't update properties that do not exist in the values start repeat object
      if (!valuesStart.hasOwnProperty(property)) {
        continue;
      }

      start = valuesStart[property];
      end = valuesEnd[property];
      endType = Utils.Type(end);

      if (endType === '[object Array]') {
        end = context.__interpolationFunction(end, value);
      } else if (endType === '[object String]') {
        // Parses relative end values with start as base (e.g.: +10, -3)
        if (end.charAt(0) === '+' || end.charAt(0) === '-') {
          end = start + end * 1.0;
        } else {
          end *= 1.0;
        }

        end = start + (end - start) * value;
      }

      // Protect against non numeric properties.
      if (Utils.IsFinite(end)) {
        object[property] = end;
      } else {
        delete valuesStart[property];
      }
    }

    context.emitWith('update', [object, value, context.reversed], object);

    if (elapsed === 1) {
      if (context.__repeat > 0) {
        if (Utils.IsFinite(context.__repeat)) {
          context.__repeat--;
        }

        // Is yoyo
        var yoyo = context.__yoyo;

        // Reassign starting values, restart by making startTime = now
        for (property in valuesStart) {
          end = valuesEnd[property];
          endType = Utils.Type(end);

          if (Utils.IsType(valuesEnd, 'String')) {
            valuesStart[property] = valuesStart[property] + valuesEnd[property] * 1.0;
          }

          if (yoyo) {
            if (Utils.IsType(valuesEnd[property], 'Array')) {
              valuesEnd[property] = valuesEnd[property].reverse();
              valuesStart[property] = valuesStart[property][0];
            } else {
              valuesEnd[property] = [
                valuesStart[property],
                valuesStavaluesStartrtRepeat[property] = valuesEnd[property]
              ][0];
            }
          }
        }

        if (yoyo) {
          context.reversed = !context.reversed;
        }

        if (context.__repeatDelayTime !== null) {
          context.__startTime = time + context.__repeatDelayTime;
        } else {
          context.__startTime = time + context.__delayTime;
        }

        return true;
      } else {
        context.emitWith('complete', object, object);

        Utils.Each(context.__chainedTweens, function(tween) {
          // Make the chained tweens start exactly at the time they should,
          // even if the `update()` method was called way past the duration of the tween
          tween.start(context.__startTime + context.__duration);
        });

        return false;
      }
    }

    return true;
  }
});
