/**
 * @module group
 * @author nuintun
 * @license MIT
 * @version 2017/11/20
 */

import Tween from './tween';
import { now } from './now';
import * as Utils from './utils';

/**
 * @class Group
 * @constructor
 */
export default function Group() {
  this._tweens = [];
}

// Set prototype
Group.prototype = {
  /**
   * @method items
   * @returns {Tween[]}
   */
  items: function() {
    return this._tweens;
  },
  /**
   * @method add
   * @param {Tween} tween
   */
  add: function(tween) {
    var tweens = this._tweens;

    if (tween instanceof Tween && Utils.indexOf(tweens, tween) === -1) {
      tweens.push(tween);
    }
  },
  /**
   * @method remove
   * @param {Tween} tween
   */
  remove: function(tween) {
    var context = this;

    if (arguments.length === 0) {
      context._tweens = [];
    } else {
      var tweens = context._tweens;
      var index = Utils.indexOf(tweens, tween);

      Utils.remove(tweens, index);
    }
  },
  /**
   * @method update
   * @param {number} time
   * @param {boolean} preserve
   * @returns {boolean}
   */
  update: function(time, preserve) {
    var tweens = this._tweens;

    if (tweens.length === 0) {
      return false;
    }

    time = Utils.isNonNegative(time) ? time : now();

    var i = 0;

    while (i < tweens.length) {
      if (tweens[i].update(time) || preserve) {
        i++;
      } else {
        Utils.remove(tweens, i);
      }
    }

    return true;
  }
};
