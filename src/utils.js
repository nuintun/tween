/*!
 * Utils
 * Version: 0.0.1
 * Date: 2016/11/18
 * https://github.com/nuintun/tween
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
 */

var toString = Object.prototype.toString;

/**
 * type
 * @param {any} value
 * @returns
 */
export function type(value) {
  return toString.call(value);
}

/**
 * isType
 * @param {any} value
 * @param {any} type
 * @returns
 */
export function isType(value, type) {
  return Type(value) === '[object ' + type + ']';
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
  return isType(number, 'Number') && isFinite(number) && number >= 0;
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
    case 1:
      return fn.call(context, args[0]);
    case 2:
      return fn.call(context, args[0], args[1]);
    case 3:
      return fn.call(context, args[0], args[1], args[2]);
    case 4:
      return fn.call(context, args[0], args[1], args[2], args[3]);
    case 5:
      return fn.call(context, args[0], args[1], args[2], args[3], args[4]);
    case 6:
      return fn.call(context, args[0], args[1], args[2], args[3], args[4], args[5]);
    default:
      return fn.apply(context, args);
  }
}

/**
 * each
 * @param {any} array
 * @param {any} iterator
 * @param {any} context
 */
export function each(array, iterator, context) {
  if (arguments.length < 3) {
    context = array;
  }

  for (var i = 0, length = array.length; i < length; i++) {
    apply(iterator, array, [array[i], i, array]);
  }
}

/**
 * arrayIndexOf
 * @param {any} array
 * @param {any} item
 * @returns
 */
export function arrayIndexOf(array, item) {
  if (array.indexOf) {
    return array.indexOf.call(array, item);
  }

  for (var i = 0, length = array.length; i < length; i++) {
    if (array[i] === item) {
      return i;
    }
  }

  return -1;
}
