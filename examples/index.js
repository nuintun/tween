var animation = document.getElementById('animation');
var tween = new Tween({ width: 200, height: 100, rgb: [0, 255, 128] })
  .easing(Tween.Easing.Bounce.Out)
  .to({ width: 600, height: 300, rgb: [255, 100, 10] }, 1000)
  .yoyo(true)
  .delay(1000)
  .repeat(1)
  .on('update', function(coords, progress) {
    animation.style.width = coords.width + 'px';
    animation.style.height = coords.height + 'px';

    var now = new Date();

    console.log(coords.rgb);

    // console && console.log(
    //   '%o-%o-%o %o:%o:%o:%o  width: %o  height: %o  progress: %o',
    //   now.getFullYear(),
    //   now.getMonth() + 1,
    //   now.getDate(),
    //   now.getHours(),
    //   now.getMinutes(),
    //   now.getSeconds(),
    //   now.getMilliseconds(), ~~coords.width, ~~coords.height,
    //   (~~(progress * 100)) + '%'
    // );
  })
  .start();

function animate(time) {
  Tween.update(time);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
