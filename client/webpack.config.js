// For the client-library
const path = require('path');
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
    entry: './index',
    
	output: {
        filename: 'bundle.js',
        libraryTarget: 'window',
        library: 'MerkleAstBundleClient',
    }
});

const bootstrap = merge({}, base, {
    entry: './bootstrap',
    
	output: {
        filename: 'bootstrap.js',
        library: 'MerkleAstBundles',
        libraryTarget: 'var'
    }
});

module.exports = [
    bundle, 
    bootstrap,
];