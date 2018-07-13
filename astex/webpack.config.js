// For the client-library
const path = require('path');

module.exports = {
	entry: './src/client/index.js',
	output: {
		path: path.resolve(__dirname, 'dist/client'),
		filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\*.js/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    }
};