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
  context.__startReversed = {};
  context.__endReversed = {};
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
      endType = Utils.Type(end);

      // Check if an Array was provided as property value
      if (endType === '[object Array]') {
        length = end.length;
        end = [];
        endReversed = [];

        for (var i = 0; i < length; i++) {
          item = valuesEnd[property][i];

          if (Utils.IsType(item, 'String')) {
            if (RELATIVERE.test(item)) {
              end.push(item);

              // Set reversed
              endReversed = [(item.charAt(0) === '+' ? '-' : '+') + item.substring(1)].concat(endReversed);
              continue;
            }

            item *= 1.0;
          }

          if (Utils.IsFinite(item)) {
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

          if (!Utils.IsFinite(end)) {
            continue;
          }
        }
      } else if (Utils.IsFinite(end)) {
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
        object[property] = context.__interpolationFunction(end, value);
        continue;
      } else if (endType === '[object String]') {
        // Parses relative end values with start as base (e.g.: +10, -3)
        end = start + end * 1.0;
      }

      // Change object property value
      object[property] = start + (end - start) * value;
    }

    context.emitWith('update', [object, value, context.reversed], object);

    if (elapsed === 1) {
      if (context.__repeat > 0) {
        if (Utils.IsFinite(context.__repeat)) {
          context.__repeat--;
        }

        if (context.__yoyo) {
          context.reversed = !context.reversed;

          context.__valuesStart = [
            context.__startReversed,
            context.__startReversed = context.__valuesStart
          ][0];

          context.__valuesEnd = [
            context.__endReversed,
            context.__endReversed = context.__valuesEnd
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

      Utils.Each(context.__chainedTweens, function(tween) {
        // Make the chained tweens start exactly at the time they should,
        // even if the `update()` method was called way past the duration of the tween
        tween.start(context.__startTime + context.__duration);
      });

      return false;
    }

    return true;
  }
});
