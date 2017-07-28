/*!
 * Queue
 * Version: 0.0.1
 * Date: 2016/11/18
 * https://github.com/nuintun/tween
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
 */

import { now } from './now';
import Tween from './tween';
import * as Utils from './utils';

export default function Queue() {
  this._tweens = [];
}

Queue.prototype = {
  items: function() {
    return this._tweens;
  },
  add: function(tween) {
    var tweens = this._tweens;

    if (tween instanceof Tween && Utils.indexOf(tweens, tween) === -1) {
      tweens.push(tween);
    }
  },
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
