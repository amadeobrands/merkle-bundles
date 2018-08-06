const path = require('path');
const merge = require('lodash.merge');

const base = {
  target: 'node',
  mode: 'development',
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