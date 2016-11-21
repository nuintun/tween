/*!
 * Events
 * Version: 0.0.2
 * Date: 2016/11/18
 * https://github.com/nuintun/tween
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
 */

import * as Utils from './utils';

/**
 * Events
 * @constructor
 */
export default function Events() {
  this.__events = {};
}

// Set prototype
Events.prototype = {
  /**
   * Bind callback tos event
   * @param events
   * @param callback
   * @param context
   * @returns {Events}
   */
  on: function(event, callback) {
    var context = this;
    var events = context.__events;
    var callbacks = events[event] || (events[event] = []);

    if (Utils.IsType(callback, 'Function')) {
      callbacks.push(callback);
    }

    return context;
  },
  /**
   * Remove callback of event.
   * If `callback` is null, removes all callbacks for the event. 
   * If `event` is null, removes all bound callbacks for the event.
   * @param event
   * @param callback
   * @returns {Events}
   */
  off: function(event, callback) {
    var context = this;

    switch (arguments.length) {
      case 0:
        context.__events = {};
        break;
      case 1:
        delete context.__events[event];
        break;
      default:
        var callbacks = events[event];

        if (callbacks) {
          var i = Utils.ArrayIndexOf(callbacks, callback);

          if (i !== -1) {
            callbacks.splice(i, 1);
          }
        }
        break;
    }

    return context;
  },
  /**
   * bind a event only emit once
   * @param events
   * @param callback
   * @param context
   */
  once: function(events, callback, context) {
    var that = this;
    var args = arguments;
    var cb = function() {
      context = args.length < 3 ? this : that;

      that.off(events, cb);
      Utils.Apply(callback, context, arguments);
    };

    return that.on(events, cb, context);
  },
  /**
   * Emit event with context
   * @param event
   * @param args
   * @param context
   * @returns {*}
   */
  emitWith: function(event, args, context) {
    var that = this;
    var events = that.__events;
    var callbacks = events[event];

    if (!callbacks || callbacks.length === 0) {
      return false;
    }

    if (arguments.length < 3) {
      context = that;
    }

    args = Utils.IsType(args, 'Array') ? args : [args];

    Utils.Each(callbacks, function(callback) {
      Utils.Apply(callback, context, args);
    });

    return true;
  },
  /**
   * Emit event
   * @param event
   * @returns {*}
   */
  emit: function(event) {
    var rest = [];

    // fill up `rest` with the callback arguments.  Since we're only copying
    // the tail of `arguments`, a loop is much faster than Array#slice.
    for (var i = 1, length = arguments.length; i < length; i++) {
      rest[i - 1] = arguments[i];
    }

    return this.emitWith(event, rest);
  }
};
