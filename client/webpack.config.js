// For the client-library
const path = require('path');
const merge = require('lodash.merge');
const webpack = require('webpack');
var JavaScriptObfuscator = require('webpack-obfuscator');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

let mode = process.env.NODE_ENV;

const base = {
    mode,

    target: 'web',

    context: path.join(__dirname, 'src'),

    node: {
        fs: "empty"
    },  

    plugins: [
        // new webpack.DefinePlugin({
        //     PACKAGE_JSON: JSON.stringify(require("./package.json"))
        // }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),
        // mode == 'production' ? new JavaScriptObfuscator({
        //     rotateUnicodeArray: true
        // }) : () => {}
    ].concat(mode == 'production' ? [
        new BundleAnalyzerPlugin(),
        new UglifyJsPlugin()
    ] : []),

    module: {
        rules: [
            // {
            //     test: /\.worker\.js$/,
            //     use: {
            //         loader: 'worker-loader',
            //         options: { inline: true, fallback: false }
            //     },
                
            // },
            {
                test: /\.ts|js$/,
                use: ['ts-loader'],
                exclude: /node_modules/
            },

            // {
            //     test: /\.js$/,
            //     exclude: /(node_modules|vendor)/,
            //     use: ['babel-loader'],
            // },
        ]
    },

    resolve: {
        extensions: [ '.ts', '.js' ],
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
}

const bundle = merge({}, base, {
    entry: './loader',
    
	output: {
        filename: 'bundle.js',
        libraryTarget: 'window',
        library: 'MerkleAstBundleClient',
    }
});

// const bootstrap = merge({}, base, {
//     entry: './bootstrap',
    
// 	output: {
//         filename: 'bootstrap.js',
//         // libraryTarget: 'commonjs'
//     }
// });

// const bootstrapSlim = merge({}, base, {
//     entry: './bootstrap-slim',
    
// 	output: {
//         filename: 'bootstrap-slim.js',
//         // libraryTarget: 'commonjs'
//     }
// });

module.exports = [
    bundle, 
    // bootstrap,
    // bootstrapSlim,
];