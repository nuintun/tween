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

    if (tweens.indexOf(tween) === -1) {
      tweens.push(tween);
    }
  },
  remove: function(tween) {
    var context = this;

    if (arguments.length === 0) {
      context.__tweens = [];
    } else {
      var tweens = context.__tweens;
      var i = tweens.indexOf(tween);

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