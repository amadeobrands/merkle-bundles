const path = require('path');

module.exports = {
    mode: 'development',
    target: 'web',

    devtool: 'inline-source-map',

    context: path.resolve(__dirname),

    entry: './src',

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
        filename: 'bootstrapper.js',
        path: path.resolve(__dirname, 'dist/'),
        publicPath: '/',
    },
};

