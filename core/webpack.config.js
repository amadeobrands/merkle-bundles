const path = require('path');

module.exports = {
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
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "commonjs2"
  }
};