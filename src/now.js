/*!
 * now
 * Version: 0.0.1
 * Date: 2016/11/18
 * https://github.com/nuintun/tween
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
 */

// Include a performance.now polyfill
import * as Utils from './utils';

var now;

if (window
  && window.performance
  && Utils.typeIs(window.performance.now, 'Function')) {
  // In a browser, use window.performance.now if it is available.
  // This must be bound, because directly assigning this function
  // leads to an invocation exception in Chrome.
  now = function() {
    return window.performance.now.call(window.performance);
  };
} else if (Utils.typeIs(Date.now, 'Function')) {
  // Use Date.now if it is available.
  now = Date.now;
} else {
  // Otherwise, use 'new Date().getTime()'.
  now = function() {
    return new Date().getTime();
  };
}

export { now };
