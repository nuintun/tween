/**
 * @module interpolation
 * @license MIT
 * @author nuintun
 */

/**
 * @function factorial
 * @param {number} n
 * @return {number}
 */
var factorial = (function() {
  var a = [1];

  return function(n) {
    var s = 1;

    if (a[n]) {
      return a[n];
    }

    for (var i = n; i > 1; i--) {
      s *= i;
    }

    a[n] = s;

    return s;
  };
})();

/**
 * @function linear
 * @param {number} p0
 * @param {number} p1
 * @param {number} t
 * @returns {number}
 */
function linear(p0, p1, t) {
  return (p1 - p0) * t + p0;
}

/**
 * @function bernstein
 * @param {number} n
 * @param {number} i
 * @returns {number}
 */
function bernstein(n, i) {
  return factorial(n) / factorial(i) / factorial(n - i);
}

/**
 * @function catmullRom
 * @param {number} p0
 * @param {number} p1
 * @param {number} p2
 * @param {number} p3
 * @param {number} t
 * @returns {number}
 */
function catmullRom(p0, p1, p2, p3, t) {
  var v0 = (p2 - p0) * 0.5;
  var v1 = (p3 - p1) * 0.5;
  var t2 = t * t;
  var t3 = t * t2;

  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

// Interpolation
export var Interpolation = {
  Linear: function(v, k) {
    var m = v.length - 1;
    var f = m * k;
    var i = Math.floor(f);

    if (k < 0) {
      return linear(v[0], v[1], f);
    }

    if (k > 1) {
      return linear(v[m], v[m - 1], m - f);
    }

    return linear(v[i], v[i + 1 > m ? m : i + 1], f - i);
  },
  Bezier: function(v, k) {
    var b = 0;
    var n = v.length - 1;
    var pw = Math.pow;

    for (var i = 0; i <= n; i++) {
      b += pw(1 - k, n - i) * pw(k, i) * v[i] * bernstein(n, i);
    }

    return b;
  },
  CatmullRom: function(v, k) {
    var m = v.length - 1;
    var f = m * k;
    var i = Math.floor(f);

    if (v[0] === v[m]) {
      if (k < 0) {
        i = Math.floor((f = m * (1 + k)));
      }

      return catmullRom(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
    } else {
      if (k < 0) {
        return v[0] - (catmullRom(v[0], v[0], v[1], v[1], -f) - v[0]);
      }

      if (k > 1) {
        return v[m] - (catmullRom(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
      }

      return catmullRom(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
    }
  }
};
