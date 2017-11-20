var animation = document.getElementById('animation');
var tween = new Tween({ width: 200, height: 100 })
  .easing(Tween.Easing.Bounce.Out)
  .to({ width: '+400', height: '+200' }, 1000)
  .yoyo(true)
  .delay(1000)
  .repeat(Infinity)
  .on('update', function(coords, progress, reversed) {
    animation.style.width = coords.width + 'px';
    animation.style.height = coords.height + 'px';

    var now = new Date();

    console &&
      console.log(
        '%o-%o-%o %o:%o:%o:%o  width: %o  height: %o  progress: %o  reversed: %o',
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds(),
        ~~coords.width,
        ~~coords.height,
        ~~(progress * 100) + '%',
        reversed
      );
  })
  .start();

function animate(time) {
  Tween.update(time);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
