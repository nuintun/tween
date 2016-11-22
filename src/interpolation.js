/*!
 * Interpolation
 * Version: 0.0.1
 * Date: 2016/11/18
 * https://github.com/nuintun/tween
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
 */

// Factorial
var Factorial = (function() {
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
 * Linear
 * @param {any} p0
 * @param {any} p1
 * @param {any} t
 * @returns
 */
function Linear(p0, p1, t) {
  return (p1 - p0) * t + p0;
}

/**
 * Bernstein
 * @param {any} n
 * @param {any} i
 * @returns
 */
function Bernstein(n, i) {
  return Factorial(n) / Factorial(i) / Factorial(n - i);
}

/**
 * CatmullRom
 * @param {any} p0
 * @param {any} p1
 * @param {any} p2
 * @param {any} p3
 * @param {any} t
 * @returns
 */
function CatmullRom(p0, p1, p2, p3, t) {
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
      return Linear(v[0], v[1], f);
    }

    if (k > 1) {
      return Linear(v[m], v[m - 1], m - f);
    }

    return Linear(v[i], v[i + 1 > m ? m : i + 1], f - i);
  },
  Bezier: function(v, k) {
    var b = 0;
    var n = v.length - 1;
    var pw = Math.pow;

    for (var i = 0; i <= n; i++) {
      b += pw(1 - k, n - i) * pw(k, i) * v[i] * Bernstein(n, i);
    }

    return b;
  },
  CatmullRom: function(v, k) {
    var m = v.length - 1;
    var f = m * k;
    var i = Math.floor(f);

    if (v[0] === v[m]) {
      if (k < 0) {
        i = Math.floor(f = m * (1 + k));
      }

      return CatmullRom(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
    } else {
      if (k < 0) {
        return v[0] - (CatmullRom(v[0], v[0], v[1], v[1], -f) - v[0]);
      }

      if (k > 1) {
        return v[m] - (CatmullRom(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
      }

      return CatmullRom(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
    }
  }
};
