const path = require("path");
const merge = require("webpack-merge");
const merge = require('lodash.merge');

const base = require("../webpack.config");

module.exports = merge(base, {
	entry: './tests/client',
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, 'dist/client/test'),
		filename: 'bundle.js'
    },
});
