import { now } from './now';

export default function Queue() {
  this.__tweens = [];
}

Queue.prototype = {
  getAll: function() {
    return this.__tweens;
  },
  removeAll: function() {
    this.__tweens = [];
  },
  add: function(tween) {
    this.__tweens.push(tween);
  },
  remove: function(tween) {
    var tweens = this.__tweens;

    var i = tweens.indexOf(tween);

    if (i !== -1) {
      tweens.splice(i, 1);
    }
  },
  update: function(time, preserve) {
    var tweens = this.__tweens;

    if (tweens.length === 0) {
      return false;
    }

    var i = 0;

    time = time !== undefined ? time : now();

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
