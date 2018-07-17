const path = require("path");
const merge = require("webpack-merge");

const parts = require("./webpack.parts");

module.exports = merge([
    devServer: {
        stats: "errors-only",
        host, // Defaults to `localhost`
        port, // Defaults to 8080
        open: true,
        overlay: true,
    },
  
	entry: './src/test/client/index.js',
	output: {
		path: path.resolve(__dirname, 'dist/client/test'),
		filename: 'bundle.js'
    },
]);
