'use strict'

const rollup = require('rollup');

rollup.rollup({
  legacy: true,
  entry: 'entry'
}).then(function(bundle) {
  bundle.write({
    dest: 'dest',
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
