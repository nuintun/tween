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
  context.__repeatDelayTime;
  context.__yoyo = false;
  context.__isPlaying = false;
  context.__reversed = false;
  context.__delayTime = 0;
  context.__startTime = null;
  context.__easingFunction = Easing.Linear.None;
  context.__interpolationFunction = Interpolation.Linear;
  context.__chainedTweens = [];
  context.__onStartCallbackFired = false;

  // Set all starting values present on the target object
  for (var field in object) {
    context.__valuesStart[field] = parseFloat(object[field], 10);
  }
}

Tween.update = function(time, preserve) {
  queue.update.call(queue, time, preserve);
};

Tween.now = now;
Tween.Easing = Easing;
Tween.Interpolation = Interpolation;

Utils.Inherits(Tween, Events, {
  to: function(properties, duration) {
    var context = this;

    if (duration !== undefined) {
      context.__duration = duration;
    }

    context.__valuesEnd = properties;

    return context;
  },
  start: function(time) {
    var context = this;

    queue.add(context);

    context.__isPlaying = true;
    context.__onStartCallbackFired = false;
    context.__startTime = time !== undefined ? time : now();
    context.__startTime += context.__delayTime;

    var object = context.__object;
    var valuesEnd = context.__valuesEnd;
    var valuesStart = context.__valuesStart;

    for (var property in valuesEnd) {
      // Check if an Array was provided as property value
      if (Utils.IsType(valuesEnd[property], 'Array')) {
        if (valuesEnd[property].length === 0) {
          continue;
        }

        // Create a local copy of the Array with the start value at the front
        valuesEnd[property] = [object[property]].concat(valuesEnd[property]);
      }

      // If `to()` specifies a property that doesn't exist in the source object,
      // we should not set that property in the object
      if (object[property] === undefined) {
        continue;
      }

      valuesStart[property] = object[property];

      if (Utils.IsType(valuesStart[property], 'Array')) {
        // Ensures we're using numbers, not strings
        valuesStart[property] *= 1.0;
      }

      context.__valuesStartRepeat[property] = valuesStart[property] || 0;
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

    context.emitWith('start', object, object);

    context.stopChainedTweens();

    return context;
  },
  end: function() {
    var context = this;

    context.update(context.__startTime + context.__duration);

    return context;
  },
  stopChainedTweens: function() {
    var chainedTweens = this.__chainedTweens;

    for (var i = 0, numChainedTweens = chainedTweens.length; i < numChainedTweens; i++) {
      chainedTweens[i].stop();
    }
  },
  delay: function(amount) {
    this.__delayTime = amount;

    return this;
  },
  repeat: function(times) {
    this.__repeat = times;

    return this;
  },
  repeatDelay: function(amount) {
    this.__repeatDelayTime = amount;

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

    if (context.__onStartCallbackFired === false) {
      context.emitWith('start', object, object);

      context.__onStartCallbackFired = true;
    }

    elapsed = (time - context.__startTime) / context.__duration;
    elapsed = elapsed > 1 ? 1 : elapsed;

    value = context.__easingFunction(elapsed);

    var valuesEnd = context.__valuesEnd;
    var valuesStart = context.__valuesStart;

    for (property in valuesEnd) {
      // Don't update properties that do not exist in the source object
      if (!valuesStart.hasOwnProperty(property)) {
        continue;
      }

      var start = valuesStart[property] || 0;
      var end = valuesEnd[property];
      var endType = Utils.Type(end);

      if (endType === '[object Array]') {
        object[property] = context.__interpolationFunction(end, value);
      } else {
        // Parses relative end values with start as base (e.g.: +10, -3)
        if (endType === '[object String]') {
          if (end.charAt(0) === '+' || end.charAt(0) === '-') {
            end = start + parseFloat(end, 10);
          } else {
            end = parseFloat(end, 10);
          }
        }

        // Protect against non numeric properties.
        if (endType === '[object Number]') {
          object[property] = start + (end - start) * value;
        }
      }
    }

    context.emitWith('update', [object, value], object);

    if (elapsed === 1) {
      if (context.__repeat > 0) {
        if (isFinite(context.__repeat)) {
          context.__repeat--;
        }

        var yoyo = context.__yoyo;
        var valuesStartRepeat = context.__valuesStartRepeat;

        // Reassign starting values, restart by making startTime = now
        for (property in valuesStartRepeat) {
          if (typeof(valuesEnd[property]) === 'string') {
            valuesStartRepeat[property] = valuesStartRepeat[property] + parseFloat(valuesEnd[property], 10);
          }

          if (yoyo) {
            var tmp = valuesStartRepeat[property];

            valuesStartRepeat[property] = valuesEnd[property];
            valuesEnd[property] = tmp;
          }

          valuesStart[property] = valuesStartRepeat[property];
        }

        if (yoyo) {
          context.__reversed = !context.__reversed;
        }

        if (context.__repeatDelayTime !== undefined) {
          context.__startTime = time + context.__repeatDelayTime;
        } else {
          context.__startTime = time + context.__delayTime;
        }

        return true;
      } else {
        context.emitWith('complete', object, object);

        var chainedTweens = context.__chainedTweens;

        for (var i = 0, numChainedTweens = chainedTweens.length; i < numChainedTweens; i++) {
          // Make the chained tweens start exactly at the time they should,
          // even if the `update()` method was called way past the duration of the tween
          chainedTweens[i].start(context.__startTime + context.__duration);
        }

        return false;
      }
    }

    return true;
  }
});
