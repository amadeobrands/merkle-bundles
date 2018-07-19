const path = require('path');

module.exports = {
    mode: 'development',
    target: 'web',

    context: path.resolve(__dirname),

    entry: {
        app: './index.js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|vendor)/,
                use: ['babel-loader'],
            }
        ]
    },

    output: {
        filename: 'bootstrap.js',
        path: path.resolve(__dirname, 'dist/'),
        publicPath: '/',
    },
};

