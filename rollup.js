'use strict';

const fs = require('fs');
const rollup = require('rollup');
const uglify = require('uglify-es');

rollup
  .rollup({
    legacy: true,
    input: 'src/tween.js'
  })
  .then(bundle => {
    fs.stat('dist', error => {
      if (error) {
        fs.mkdirSync('dist');
      }

      const src = 'dist/tween.js';
      const min = 'dist/tween.min.js';
      const map = 'tween.js.map';

      bundle
        .generate({
          format: 'umd',
          indent: true,
          strict: true,
          amd: { id: 'tween' },
          name: 'Tween'
        })
        .then(result => {
          fs.writeFileSync(src, result.code);
          console.log(`  Build ${src} success!`);

          result = uglify.minify(
            {
              'tween.js': result.code
            },
            {
              ecma: 5,
              ie8: true,
              mangle: { eval: true },
              sourceMap: { url: map }
            }
          );

          fs.writeFileSync(min, result.code);
          console.log(`  Build ${min} success!`);
          fs.writeFileSync(src + '.map', result.map);
          console.log(`  Build ${src + '.map'} success!`);
        })
        .catch(error => {
          console.error(error);
        });
    });
  })
  .catch(error => {
    console.error(error);
  });
