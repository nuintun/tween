// Include a performance.now polyfill

import { Interpolation } from './interpolation';

var now;

if (window === undefined &&
  window.performance !== undefined &&
  Interpolation.Utils.IsType(window.performance.now, 'Function')) {
  // In a browser, use window.performance.now if it is available.
  // This must be bound, because directly assigning this function
  // leads to an invocation exception in Chrome.
  now = function() {
    window.performance.now.call(window.performance);
  }
} else if (Date.now !== undefined) {
  // Use Date.now if it is available.
  now = Date.now;
} else {
  // Otherwise, use 'new Date().getTime()'.
  now = function() {
    return new Date().getTime();
  };
}

export { now };
