import * as constants from '../constants';
import webpack from 'webpack';

import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const extractLess = new ExtractTextPlugin({
    filename: 'css/[name].[contenthash].css',
});

const connect = {
    entry: {
        'trezor-connect': `${constants.CONNECT_JS_SRC}entrypoints/connect.js`,
        'trezor-library': `${constants.CONNECT_JS_SRC}entrypoints/library.js`,
        'iframe': `${constants.CONNECT_JS_SRC}iframe/iframe.js`,
        'popup': `${constants.CONNECT_JS_SRC}popup/popup.js`,
        'modal': `${constants.CONNECT_JS_SRC}modal/modal.js`,
    },
    output: {
        filename: 'js/[name].js',
        path: constants.CONNECT_DIST,
        publicPath: './',
        library: constants.LIB_NAME,
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.(png|gif|jpg|ttf|eot|svg|woff|woff2|wasm)$/,
                loader: 'file-loader',
                query: {
                    name: '[name].[hash].[ext]',
                },
            },
            {
                test: /\.less$/,
                include: constants.CONNECT_STYLE_SRC,
                loader: extractLess.extract({
                    use: [
                        { loader: 'css-loader' },
                        { loader: 'less-loader' },
                    ],
                }),
            },
        ],
    },
    resolve: {
        modules: [ constants.CONNECT_JS_SRC, constants.NODE_MODULES ],
    },
    plugins: [
        extractLess,

        new HtmlWebpackPlugin({
            chunks: ['iframe'],
            filename: 'iframe.html',
            template: `${constants.CONNECT_HTML_SRC}iframe.html`,
            inject: true,
        }),
        new HtmlWebpackPlugin({
            chunks: ['popup'],
            filename: 'popup.html',
            template: `${constants.CONNECT_HTML_SRC}popup.html`,
            inject: true,
        }),
        new CopyWebpackPlugin([
            //{ from: constants.CONNECT_STYLE_SRC, to: constants.CONNECT_DIST + 'css' },
            //{ from: `${constants.CONNECT_JS_SRC}`, to: constants.CONNECT_DIST + 'js' },
            { from: `${constants.CONNECT_HTML_SRC}coins.json` },
            { from: `${constants.CONNECT_HTML_SRC}config_signed.bin` },
            { from: `${constants.CONNECT_HTML_SRC}latest.txt` },
            { from: `${constants.CONNECT_HTML_SRC}releases.json` },
        ]),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('umd-lib'),
            PRODUCTION: JSON.stringify(true),
        }),

        // bitcoinjs-lib: NOTE: When uglifying the javascript, you must exclude the following variable names from being mangled: Array, BigInteger, Boolean, ECPair, Function, Number, Point and Script. This is because of the function-name-duck-typing used in typeforce.
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
            mangle: {
                except: [
                    'Array', 'BigInteger', 'Boolean', 'Buffer',
                    'ECPair', 'Function', 'Number', 'Point', 'Script',
                ],
            },
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),

    ],

    // ignoring "fs" import in fastxpub
    node: {
        fs: 'empty',
    },
};

const explorer = {
    entry: {
        'trezor-connect-example': `${constants.EXPLORER_JS_SRC}index.js`,
    },
    output: {
        filename: 'js/[name].[hash].js',
        path: constants.EXPLORER_DIST,
        publicPath: './',
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: extractLess.extract({
                    use: [
                        { loader: 'css-loader' },
                        { loader: 'less-loader' },
                    ],
                }),
            },
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        extractLess,

        new HtmlWebpackPlugin({
            chunks: ['trezor-connect', 'trezor-connect-example'],
            filename: 'index.html',
            template: `${constants.EXPLORER_HTML_SRC}index.html`,
            inject: true,
            connectUrl: '../connect/'
        }),
        new CopyWebpackPlugin([
            { from: constants.EXPLORER_STYLE_SRC, to: constants.EXPLORER_DIST + 'css' },
            { from: constants.EXPLORER_JS_SRC, to: constants.EXPLORER_DIST + 'js' },
        ]),
    ],
};
module.exports = [connect, explorer];

