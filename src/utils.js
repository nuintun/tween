/**
 * @module utils
 * @license MIT
 * @author nuintun
 */

var AP = Array.prototype;
var OP = Object.prototype;
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
 * @class Blank
 * @constructor
 */
function Blank() {}

/**
 * @function inherits
 * @param {Class} ctor
 * @param {Class} superCtor
 * @param {Object} props
 */
export function inherits(ctor, superCtor, props) {
  // Set prototype
  Blank.prototype = superCtor.prototype;

  // Extends
  ctor.prototype = new Blank();
  ctor.prototype.constructor = ctor;

  // Copy props
  if (props) {
    for (var key in props) {
      if (props.hasOwnProperty(key)) {
        ctor.prototype[key] = props[key];
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
  var length = array.length;

  if (index >= 0 && index < length) {
    var last = array.pop();

    if (index + 1 < length) {
      var removed = array[index];

      array[index] = last;

      return removed;
    }

    return last;
  }
}
