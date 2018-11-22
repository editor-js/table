const path = require('path');

module.exports = {
  entry: './src/plugin.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist/',
    library: 'Table',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.pcss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader?removeSVGTagAttrs=false'
      }
    ]
  }
};