/**
 * @module utils
 * @author nuintun
 * @license MIT
 * @version 2017/11/20
 */

var AP = Array.prototype;
var OP = Object.prototype;
var APFilter = AP.filter;
var APIndexOf = AP.indexOf;
var APForEach = AP.forEach;
var OPToString = OP.toString;
var winIsFinite = window.isFinite;

/**
 * @function type
 * @param {any} value
 * @returns {string}
 */
export function type(value) {
  return OPToString.call(value);
}

/**
 * @function typeIs
 * @param {any} value
 * @param {string} dataType
 * @returns {boolean}
 */
export function typeIs(value, dataType) {
  return type(value) === '[object ' + dataType + ']';
}

/**
 * @function inherits
 * @param {Class} ctor
 * @param {Class} superCtor
 * @param {Object} proto
 */
export function inherits(ctor, superCtor, proto) {
  function F() {
    // constructor
  }

  // prototype
  F.prototype = superCtor.prototype;

  ctor.prototype = new F();
  ctor.prototype.constructor = ctor;

  if (proto) {
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        ctor.prototype[key] = proto[key];
      }
    }
  }
}

/**
 * @function isFinite
 * @param {any} value
 * @returns {boolean}
 */
export var isFinite =
  Number.isFinite ||
  function(value) {
    return typeIs(value, 'Number') && winIsFinite(value);
  };

/**
 * @function isNonNegative
 * @param {any} value
 * @returns {boolean}
 */
export function isNonNegative(value) {
  return typeIs(value, 'Number') && isFinite(value) && value >= 0;
}

/**
 * @function apply
 * @param  {Function} fn
 * @param  {any} context
 * @param  {Array} args
 * @description Call is faster than apply, optimize less than 6 args
 * @see https://github.com/micro-js/apply
 * @see http://blog.csdn.net/zhengyinhui100/article/details/7837127
 */
export function apply(fn, context, args) {
  switch (args.length) {
    // faster
    case 0:
      return fn.call(context);
    case 1:
      return fn.call(context, args[0]);
    case 2:
      return fn.call(context, args[0], args[1]);
    case 3:
      return fn.call(context, args[0], args[1], args[2]);
    default:
      // Slower
      return fn.apply(context, args);
  }
}

/**
 * @function indexOf
 * @param {Array} array
 * @param {any} value
 * @param {number} from
 * @returns {number}
 */
export var indexOf = APIndexOf
  ? function(array, value, from) {
      return APIndexOf.call(array, value, from);
    }
  : function(array, value, from) {
      var length = array.length >>> 0;

      from = Number(from) || 0;
      from = Math[from < 0 ? 'ceil' : 'floor'](from);

      if (from < 0) {
        from = Math.max(from + length, 0);
      }

      for (; from < length; from++) {
        if (from in array && array[from] === value) {
          return from;
        }
      }

      return -1;
    };

/**
 * @function forEach
 * @param {Array} array
 * @param {Function} iterator
 * @param {any} context
 */
export var forEach = APForEach
  ? function(array, iterator, context) {
      APForEach.call(array, iterator, context);
    }
  : function(array, iterator, context) {
      if (arguments.length < 3) {
        context = array;
      }

      for (var i = 0, length = array.length; i < length; i++) {
        iterator.call(array, array[i], i, array);
      }
    };

/**
 * @function remove
 * @description Faster remove array item
 * @param {Array} array
 * @param {number} index
 */
export function remove(array, index) {
  if (index >= array.length || index < 0) return;

  var last = array.pop();

  if (index < array.length) {
    var removed = array[index];

    array[index] = last;

    return removed;
  }

  return last;
}
