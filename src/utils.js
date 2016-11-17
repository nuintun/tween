var toString = Object.prototype.toString;

/**
 * Type
 * @param {any} value
 * @returns
 */
export function Type(value) {
  return toString.call(value);
}

/**
 * IsType
 * @param {any} value
 * @param {any} type
 * @returns
 */
export function IsType(value, type) {
  return Type(value) === '[object ' + type + ']';
}

/**
 * Inherits
 * @param ctor
 * @param superCtor
 * @param proto
 */
export function Inherits(ctor, superCtor, proto) {
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

// IsFinite
export var IsFinite = Number.isFinite || isFinite;

/** 
 * IsNatural
 * @param {any} number
 */
export function IsNatural(number) {
  return IsType(number, 'Number') && IsFinite(number) && number >= 0;
}

/**
 * Apply
 * @param  {Function} fn
 * @param  {Any} context
 * @param  {Array} args
 * call is faster than apply, optimize less than 6 args
 * https://github.com/micro-js/apply
 * http://blog.csdn.net/zhengyinhui100/article/details/7837127
 */

export function Apply(fn, context, args) {
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
 * Each
 * @param {any} array
 * @param {any} iterator
 * @param {any} context
 */
export function Each(array, iterator, context) {
  if (arguments.length < 3) {
    context = array;
  }

  for (var i = 0, length = array.length; i < length; i++) {
    Apply(iterator, array, [array[i], i, array]);
  }
}

/**
 * object keys
 * @param object
 * @returns {Array}
 */
export var Keys = Object.keys ? Object.keys : function(object) {
  var result = [];

  for (var name in object) {
    if (object.hasOwnProperty(name)) {
      result.push(name);
    }
  }

  return result;
};
