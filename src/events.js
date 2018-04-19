/**
 * @module events
 * @author nuintun
 * @license MIT
 * @version 2017/11/20
 */

import * as Utils from './utils';

/**
 * @class Events
 * @constructor
 */
export default function Events() {
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

    if (Utils.typeIs(callback, 'Function')) {
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
          var i = Utils.indexOf(callbacks, callback);

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
      Utils.apply(callback, this, arguments);
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
      args = Utils.typeIs(args, 'Array') ? args : [args];
    }

    Utils.forEach(callbacks, function(callback) {
      Utils.apply(callback, context, args);
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
