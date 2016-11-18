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

import * as Utils from './utils';

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
      pass = Utils.Apply(list[i], list[i + 1] || context, args) !== false && pass;
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
export default function Events() {
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

  var cb = function() {
    that.off(events, cb);
    callback.apply(context || that, arguments);
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

  events = events ? events.split(eventSplitter) : Utils.Keys(cache);

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
  args = Utils.IsType(args, 'Array') ? args : [args];

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
}

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
