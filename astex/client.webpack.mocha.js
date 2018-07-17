const path = require("path");
const merge = require("webpack-merge");
const merge = require('lodash.merge');
const conf = require("./client.webpack.config");

module.exports = merge(conf, {
	entry: './tests/client',
	output: {
		path: path.resolve(__dirname, 'dist/client/test'),
		filename: 'bundle.js'
    },
});
