/**
 * @module rollup
 * @license MIT
 * @author nuintun
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const terser = require('terser');
const rollup = require('rollup');
const pkg = require('./package.json');

/**
 * @function build
 * @param {Object} inputOptions
 * @param {Object} outputOptions
 */
async function build(inputOptions, outputOptions) {
  await fs.remove('dist');

  const bundle = await rollup.rollup(inputOptions);

  await bundle.write(outputOptions);

  const file = outputOptions.file;

  console.log(`Build ${file} success!`);

  const min = file.replace(/\.js$/i, '.min.js');
  const map = `${file}.map`;

  const minify = terser.minify(
    { 'fetch.js': (await fs.readFile(path.resolve(file))).toString() },
    { ie8: true, mangle: { eval: true }, sourceMap: { url: path.basename(map) } }
  );

  await fs.outputFile(min, outputOptions.banner + minify.code);
  console.log(`Build ${min} success!`);

  await fs.outputFile(map, minify.map);
  console.log(`Build ${map} success!`);
}

const banner = `/**
 * @module ${pkg.name}
 * @author ${pkg.author.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

const inputOptions = {
  input: 'src/tween.js',
  onwarn(error, warn) {
    if (error.code !== 'CIRCULAR_DEPENDENCY') {
      warn(error);
    }
  }
};

const outputOptions = {
  banner,
  indent: true,
  strict: true,
  legacy: true,
  name: 'Tween',
  format: 'umd',
  amd: { id: 'tween' },
  file: 'dist/tween.js'
};

build(inputOptions, outputOptions);
