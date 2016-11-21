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

var queue = new Queue();

export default function Tween(object) {
  var context = this;

  context.__object = object;
  context.__valuesStart = {};
  context.__valuesEnd = {};
  context.__valuesStartRepeat = {};
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

  // Set all starting values present on the target object
  for (var field in object) {
    context.__valuesStart[field] = object[field] * 1.0;
  }
}

Tween.now = now;
Tween.Easing = Easing;
Tween.Interpolation = Interpolation;

Utils.Each(['add', 'remove', 'update', 'items'], function(method) {
  Tween[method] = function() {
    return Utils.Apply(queue[method], queue, arguments);
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

    queue.add(context);

    context.__isPlaying = true;
    context.__startEventFired = false;
    context.__startTime = Utils.IsNatural(time) ? time : now();
    context.__startTime += context.__delayTime;

    var startType;
    var startValue;
    var object = context.__object;
    var valuesEnd = context.__valuesEnd;
    var valuesStart = context.__valuesStart;

    for (var property in valuesEnd) {
      // If `to()` specifies a property that doesn't exist in the source object,
      // we should not set that property in the object
      startValue = object[property];
      startType = Utils.Type(startValue);

      if (startType !== '[object Number]' && startType !== '[object String]') {
        continue;
      }

      // Ensures we're using numbers
      startValue *= 1.0;

      // Must be finite
      if (!Utils.IsFinite(startValue)) {
        continue;
      }

      // Check if an Array was provided as property value
      if (Utils.IsType(valuesEnd[property], 'Array')) {
        if (valuesEnd[property].length === 0) {
          continue;
        }

        // Create a local copy of the Array with the start value at the front
        valuesEnd[property] = [startValue].concat(valuesEnd[property]);
      }

      // Ensures we're using numbers, not strings
      valuesStart[property] = startValue;
      // Cache repeat
      context.__valuesStartRepeat[property] = startValue;
    }

    return context;
  },
  stop: function() {
    var context = this;

    if (!context.__isPlaying) {
      return context;
    }

    queue.remove(context);

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
    this.__yoyo = yoyo;

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

    var valuesEnd = context.__valuesEnd;
    var valuesStart = context.__valuesStart;
    var valuesStartRepeat = context.__valuesStartRepeat;

    for (property in valuesEnd) {
      // Don't update properties that do not exist in the values start repeat object
      if (!valuesStartRepeat.hasOwnProperty(property)) {
        continue;
      }

      var start = valuesStart[property];
      var end = valuesEnd[property];
      var endType = Utils.Type(end);

      if (endType === '[object Array]') {
        end = context.__interpolationFunction(end, value);
      } else if (endType === '[object String]') {
        // Parses relative end values with start as base (e.g.: +10, -3)
        if (end.charAt(0) === '+' || end.charAt(0) === '-') {
          end = start + end * 1.0;
        } else {
          end *= 1.0;
        }
      }

      // Protect against non numeric properties.
      if (Utils.IsFinite(end)) {
        object[property] = start + (end - start) * value;
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
        for (property in valuesStartRepeat) {
          if (typeof(valuesEnd[property]) === 'string') {
            valuesStartRepeat[property] = valuesStartRepeat[property] + parseFloat(valuesEnd[property], 10);
          }

          if (yoyo) {
            if (Utils.IsType(valuesEnd[property], 'Array')) {
              valuesEnd[property] = valuesEnd[property].reverse();
              valuesStartRepeat[property] = valuesEnd[property][0];
            } else {
              valuesEnd[property] = [
                valuesStartRepeat[property],
                valuesStartRepeat[property] = valuesEnd[property]
              ][0];
            }
          }

          valuesStart[property] = valuesStartRepeat[property];
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
