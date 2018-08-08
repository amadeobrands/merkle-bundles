const path = require('path');
const merge = require('lodash.merge');
const webpack = require('webpack');

let mode = process.env.NODE_ENV == 'development' ? 'development' : 'production';

const base = {
  target: 'node',
  mode,
  entry: './src/index.ts',
  module: { 
    rules: [
      {
        test: /\.tsx?$/,
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
    })
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
};

const web = merge({}, base, {
  resolve: {
    alias: {
      coding: path.resolve(__dirname, 'src/coding.web.js'),
      aliasFields: 'browser'
    }
  },
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "commonjs2"
  }
  
});

const node = merge({}, base, {
  resolve: {
    alias: {
      coding: path.resolve(__dirname, 'src/coding.node.js'),
      aliasFields: 'server'
    }
  },

  output: {
    filename: 'bundle.node.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "commonjs2"
  }
});

module.exports = [ web, node ];