'use strict'

const fs = require('fs');
const rollup = require('rollup');
const uglify = require('uglify-es');

rollup.rollup({
  legacy: true,
  entry: 'src/tween.js'
}).then(function(bundle) {
  fs.stat('dist', function(error) {
    if (error) {
      fs.mkdirSync('dist');
    }

    const src = 'dist/tween.js';
    const min = 'dist/tween.min.js';
    const map = 'tween.js.map';

    bundle.generate({
      format: 'umd',
      indent: true,
      useStrict: true,
      amd: { id: 'tween' },
      moduleName: 'Tween'
    }).then(function(result) {
      fs.writeFileSync(src, result.code);
      console.log(`  Build ${ src } success!`);

      result = uglify.minify({
        'tween.js': result.code
      }, {
        ecma: 5,
        ie8: true,
        mangle: { eval: true },
        sourceMap: { url: map }
      });

      fs.writeFileSync(min, result.code);
      console.log(`  Build ${ min } success!`);
      fs.writeFileSync(src + '.map', result.map);
      console.log(`  Build ${ src + '.map' } success!`);
    }).catch(function(error) {
      console.error(error);
    });
  });
}).catch(function(error) {
  console.error(error);
});
