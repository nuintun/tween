/**
 * @module now
 * @license MIT
 * @author nuintun
 */

// Include a performance.now polyfill
import * as Utils from './utils';

export var now;

if (self && self.performance && Utils.typeIs(self.performance.now, 'Function')) {
  // In a browser, use self.performance.now if it is available.
  // This must be bound, because directly assigning this function
  // leads to an invocation exception in Chrome.
  now = function() {
    return self.performance.now.call(self.performance);
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
