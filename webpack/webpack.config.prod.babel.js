import { LIB_NAME, JS_SRC, HTML_SRC, CSS_SRC, DIST } from './constants';
import webpack from 'webpack';

import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const extractLess = new ExtractTextPlugin({
    filename: 'css/[name].[contenthash].css',
    disable: process.env.NODE_ENV === 'development2'
});

module.exports = {
    //devtool: 'source-map',
    entry: {
        'trezorjs': `${JS_SRC}index.js`,
        'trezorjs-iframe': `${JS_SRC}iframe/iframe.js`,
        'trezorjs-popup': `${JS_SRC}popup/popup.js`
    },
    output: {
        filename: '[name].js',
        path: DIST,
        publicPath: '/',
        library: LIB_NAME,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.less$/,
                include: CSS_SRC,
                loader: extractLess.extract({
                    use: [
                        { loader: 'css-loader' },
                        { loader: 'less-loader' }
                    ],
                    fallback: 'style-loader'
                })
            },
        ]
    },
    resolve: {
        modules: ['src', 'node_modules']
    },
    plugins: [

        new HtmlWebpackPlugin({
            chunks: ['trezorjs'],
            filename: 'index.html',
            template: `${HTML_SRC}index.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            chunks: ['trezorjs-iframe'],
            filename: `iframe.html`,
            template: `${HTML_SRC}iframe.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            chunks: ['trezorjs-popup'],
            filename: 'popup.html',
            template: `${HTML_SRC}popup.html`,
            inject: true
        }),

        new CopyWebpackPlugin([
            { from: HTML_SRC + 'example.css' },
            { from: `${HTML_SRC}example.js` },
        ]),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('umd-lib'),
            PRODUCTION: JSON.stringify(true)
        }),

        // bitcoinjs-lib: NOTE: When uglifying the javascript, you must exclude the following variable names from being mangled: Array, BigInteger, Boolean, ECPair, Function, Number, Point and Script. This is because of the function-name-duck-typing used in typeforce.
        // new webpack.optimize.UglifyJsPlugin({
        //     minimize: true,
        //     compress: {
        //         warnings: false
        //     },
        //     output: {
        //         comments: false
        //     },
        //     mangle: {
        //         except: [
        //             'Array', 'BigInteger', 'Boolean', 'Buffer',
        //             'ECPair', 'Function', 'Number', 'Point', 'Script',
        //         ],
        //     },
        // }),
        // new webpack.optimize.OccurrenceOrderPlugin(),
        // new webpack.LoaderOptionsPlugin({
        //     minimize: true,
        //     debug: false
        // })
    ]
}
