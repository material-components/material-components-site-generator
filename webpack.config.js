const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const { BuildDir } = require('./scripts/lib/conf');


const buildEnv = process.env.BUILD_ENV || 'development';
const buildPath = path.resolve(`${__dirname}/${BuildDir.STAGE}`);
const IS_DEV = buildEnv == 'development';
const IS_PROD = buildEnv == 'production';

const CSS_LOADERS = [
  {
    loader: 'css-loader',
    options: {
      minimize: true,
      sourceMap: true,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      plugins: () =>[require('autoprefixer')({grid: false})],
    },
  },
  {
    loader: 'sass-loader',
    options: {
      sourceMap: true,
      includePaths: ['node_modules'],
    },
  },
];

module.exports = [{
  name: 'js',
  entry: `${buildPath}/_js_src/index.js`,
  output: {
    path: `${buildPath}/js`,
    publicPath: '/js',
    filename: 'index.js',
  },
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
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: IS_PROD
    }),
  ],
}, {
  name: 'css',
  entry: `${buildPath}/_css_src/index.scss`,
  output: {
    path: `${buildPath}/css`,
    publicPath: '/css',
    filename: 'index.css',
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        use: CSS_LOADERS,
      }),
    }],
  },
  plugins: [
    new ExtractTextPlugin('index.css'),
  ],
}];
