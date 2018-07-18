// For the client-library
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('lodash.merge');

let mode = process.env.NODE_ENV == 'development' ? 'development' : 'production';

const base = {
    mode,

    context: path.join(__dirname, 'src'),

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

    output: {
        path: path.resolve(__dirname, 'dist/client'),
        publicPath: '/',
    },
}

const bundle = merge({}, base, {
    entry: './client/index',
    
	output: {
        filename: 'bundle.js',
        libraryTarget: 'window',
        // libraryExport: "default",
        library: 'MerkleAstBundleClient',
    }
});

const bootstrap = merge({}, base, {
    entry: './client/bootstrap',
    
	output: {
        filename: 'bootstrap.js',
        library: 'MerkleAstBundles',
        libraryTarget: 'var'
    }
});

// console.log(bootstrap, bundle)
module.exports = [
    bundle, 
    bootstrap
];