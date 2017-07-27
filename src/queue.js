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
    if (tween instanceof Tween) {
      this._tweens.push(tween);
    }
  },
  remove: function(tween) {
    var context = this;

    if (arguments.length === 0) {
      context._tweens = [];
    } else {
      var tweens = context._tweens;
      var i = Utils.indexOf(tweens, tween);

      if (i !== -1) {
        tweens.splice(i, 1);
      }
    }
  },
  update: function(time, preserve) {
    var tweens = this._tweens;

    if (tweens.length === 0) {
      return false;
    }

    var i = 0;

    time = Utils.isNonNegative(time) ? time : now();

    while (i < tweens.length) {
      if (tweens[i].update(time) || preserve) {
        i++;
      } else {
        tweens.splice(i, 1);
      }
    }

    return true;
  }
};
