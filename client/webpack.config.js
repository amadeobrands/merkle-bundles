// For the client-library
const path = require('path');
const merge = require('lodash.merge');
const webpack = require('webpack');
var JavaScriptObfuscator = require('webpack-obfuscator');


let mode = process.env.NODE_ENV;

const base = {
    mode,

    target: 'web',

    context: path.join(__dirname, 'src'),

    node: {
        fs: "empty"
    },  

    plugins: [
        new webpack.DefinePlugin({
            PACKAGE_JSON: JSON.stringify(require("./package.json"))
        }),
        // mode == 'production' ? () => {} : new BundleAnalyzerPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),
        // mode == 'production' ? new JavaScriptObfuscator({
        //     rotateUnicodeArray: true
        // }) : () => {}
    ],

    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: {
                    loader: 'worker-loader',
                    options: { inline: true, fallback: false }
                },
                
            },

            {
                test: /\.js$/,
                exclude: /(node_modules|vendor)/,
                use: ['babel-loader'],
            },
        ]
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
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
        // libraryTarget: 'commonjs'
    }
});

const bootstrapSlim = merge({}, base, {
    entry: './bootstrap-slim',
    
	output: {
        filename: 'bootstrap-slim.js',
        // libraryTarget: 'commonjs'
    }
});

module.exports = [
    bundle, 
    bootstrap,
    bootstrapSlim,
];