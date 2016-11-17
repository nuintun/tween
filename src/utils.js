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
