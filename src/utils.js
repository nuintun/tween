/*!
 * Utils
 * Version: 0.0.1
 * Date: 2016/11/18
 * https://github.com/nuintun/tween
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
 */

var AP = Array.prototype;
var OP = Object.prototype;
var APFilter = AP.filter;
var APIndexOf = AP.indexOf;
var APForEach = AP.forEach;
var OPToString = OP.toString;

/**
 * type
 * @param {any} value
 * @returns
 */
export function type(value) {
  return OPToString.call(value);
}

/**
 * typeIs
 * @param {any} value
 * @param {any} dataType
 * @returns
 */
export function typeIs(value, dataType) {
  return type(value) === '[object ' + dataType + ']';
}

/**
 * inherits
 * @param ctor
 * @param superCtor
 * @param proto
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

// isFinite
export var isFinite = Number.isFinite || isFinite;

/**
 * isNatural
 * @param {any} number
 */
export function isNatural(number) {
  return typeIs(number, 'Number') && isFinite(number) && number >= 0;
}

/**
 * apply
 * @param  {Function} fn
 * @param  {Any} context
 * @param  {Array} args
 * call is faster than apply, optimize less than 6 args
 * https://github.com/micro-js/apply
 * http://blog.csdn.net/zhengyinhui100/article/details/7837127
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
      // slower
      return fn.apply(context, args);
  }
}

/**
 * indexOf
 * @param {any} array
 * @param {any} value
 * @param {any} from
 * @returns
 */
export var indexOf = APIndexOf ? function(array, value, from) {
  return APIndexOf.call(array, value, from);
} : function(array, value, from) {
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
 * forEach
 * @param {any} array
 * @param {any} iterator
 * @param {any} context
 */
export var forEach = APForEach ? function(array, iterator, context) {
  APForEach.call(array, iterator, context);
} : function(array, iterator, context) {
  if (arguments.length < 3) {
    context = array;
  }

  for (var i = 0, length = array.length; i < length; i++) {
    iterator.call(array, array[i], i, array);
  }
}
