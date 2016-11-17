'use strict'

const rollup = require('rollup');

rollup.rollup({
  legacy: true,
  entry: 'src/index.js'
}).then(function(bundle) {
  const dest = 'dest/now.js';

  bundle.write({
    dest: dest,
    format: 'umd',
    indent: true,
    useStrict: true,
    moduleId: 'tween',
    moduleName: 'Tween'
  });

  console.log(`  Build ${dest} success!`);
}).catch(function(error) {
  console.error(error);
});
