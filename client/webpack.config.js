// For the client-library
const path = require('path');
const merge = require('lodash.merge');
const webpack = require('webpack');
var JavaScriptObfuscator = require('webpack-obfuscator');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')


let mode = process.env.NODE_ENV;

const base = {
    mode,

    target: 'web',

    context: path.join(__dirname, 'src'),

    // devtool: 'eval-source-map',

    node: {
        fs: "empty"
    },

    plugins: [
        new CleanWebpackPlugin(path.join(__dirname, 'dist')),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: null,
            exclude: [/node_modules/],
            test: /\.ts($|\?)/i
        })
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
                loader: 'ts-loader',
                options: {
                    configFile: path.resolve(__dirname, './tsconfig.json')
                },
                exclude: /node_modules/
            },
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
    entry: './bootstrapper',
    
	output: {
        filename: 'bundle.js',
        // libraryTarget: 'window',
        // library: 'Turbojs',
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