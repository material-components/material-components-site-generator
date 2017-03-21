'use strict';

const path = require('path');
const webpack = require('webpack');



const buildEnv = process.env.BUILD_ENV || 'development';
const IS_DEV = buildEnv == 'development';
const IS_PROD = buildEnv == 'production';
const SITE_ROOT = path.resolve('./jekyll-site-src');

const plugins = [
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: IS_PROD
  }),
];


module.exports = {
  entry: `${SITE_ROOT}/_js_src/index.js`,
  devtool: IS_DEV ? 'eval' : 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
      },
    }],
  },
  output: {
    path: `${SITE_ROOT}/js`,
    filename: 'index.bundle.js',
  },
  plugins
};
