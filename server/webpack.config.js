const path = require('path');
var nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
var JavaScriptObfuscator = require('webpack-obfuscator');

let mode = process.env.NODE_ENV == 'development' ? 'development' : 'production';

module.exports = {
  target: 'node',
  externals: [
    'aws-sdk'
  ],
  mode,
  entry: './src/index.ts',
  module: { 
    noParse: [/aws-sdk.js/],
    rules: [
      {
        test: /\.ts?$/, 
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        }
    }),
  ],
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "commonjs2"
  }
};