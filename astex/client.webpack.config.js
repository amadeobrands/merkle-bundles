// For the client-library
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


let mode = 'production';

module.exports = {
    mode,

    context: path.join(__dirname, 'src'),

    entry: './client/index',
    
	output: {
        path: path.resolve(__dirname, 'dist/client'),
        filename: 'bundle.js',
        publicPath: '/',
        library: 'MerkleAstBundles',
        libraryTarget: 'var'
    },

    node: {
        fs: "empty"
     },

    plugins: [
        mode == 'production' ? () => {} : new BundleAnalyzerPlugin()
    ],

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|vendor)/,
                use: ['babel-loader'],
            }
        ]
    },
};