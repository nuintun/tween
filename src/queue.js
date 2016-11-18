/*!
 * Queue
 * Version: 0.0.1
 * Date: 2016/11/18
 * https://github.com/nuintun/tween
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/tween/blob/master/LICENSE
 */

import * as Utils from './utils';

export default function Queue() {
  this.__tweens = [];
}

Queue.prototype = {
  items: function() {
    return this.__tweens;
  },
  add: function(tween) {
    var context = this;
    var tweens = context.__tweens;

    if (Utils.ArrayIndexOf(tweens, tween) === -1) {
      tweens.push(tween);
    }
  },
  remove: function(tween) {
    var context = this;

    if (arguments.length === 0) {
      context.__tweens = [];
    } else {
      var tweens = context.__tweens;
      var i = Utils.ArrayIndexOf(tweens, tween);

      if (i !== -1) {
        tweens.splice(i, 1);
      }
    }
  },
  update: function(time, preserve) {
    var tweens = this.__tweens;

    if (tweens.length === 0) {
      return false;
    }

    var i = 0;

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
