

module.exports = config => {
  const tests = "tests/client/*.test.js";

  config.set({
    frameworks: ["mocha"],
    files: [
      {
        pattern: tests,
        watched: true,
      },
    ],
    preprocessors: {
      [tests]: ["webpack", 'sourcemap'],
    },
    webpack: {
      mode: 'development',
      stats: 'errors-only',
      node: {
          fs: "empty"
      },
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: "babel-loader",
          },
        ],
      },
    },
  });
};