import * as constants from '../constants';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import baseConfig from './webpack.config.base';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
const extractLess = new ExtractTextPlugin({
    filename: './[name].css',
});

const connect = webpackMerge(baseConfig, {

    entry: {
        'trezor-connect': `${constants.CONNECT_JS_SRC}entrypoints/connect.js`,
        'trezor-library': `${constants.CONNECT_JS_SRC}entrypoints/library.js`,
        'iframe': `${constants.CONNECT_JS_SRC}iframe/iframe.js`,
        'popup': `${constants.CONNECT_JS_SRC}popup/popup.js`,
    },
    module: {
        rules: [
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
            {
                // Assets (images, fonts)
                // Reference: https://github.com/webpack/file-loader
                // test: /\.(png|gif|jpg|ttf|eot|svg|woff|woff2|wasm)$/,
                test: /\.(wasm)$/,
                loader: 'file-loader',
                query: {
                    name: 'js/[name].[ext]',
                },
            },
        ],
    },
    resolve: {
        modules: [ constants.CONNECT_JS_SRC, constants.NODE_MODULES ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
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
    ],

    // ignoring "fs" import in fastxpub
    node: {
        fs: 'empty',
    },
});
console.log(connect.resolve.modules);

const explorer = webpackMerge(baseConfig, {
    entry: {
        'trezor-connect-example': `${constants.EXPLORER_JS_SRC}index.js`,
        'views/composeTx': `${constants.EXPLORER_JS_SRC}/views/composeTx.js`,
    },
    module: {
        rules: [
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
    resolve: {
        modules: [ constants.EXPLORER_JS_SRC, constants.NODE_MODULES ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        extractLess,

        new HtmlWebpackPlugin({
            chunks: ['trezor-connect', 'trezor-connect-example'],
            filename: 'index.html',
            template: `${constants.EXPLORER_HTML_SRC}index.html`,
            inject: true,
            connectUrl: 'http://localhost:8081/trezor-connect.js?init'
        }),
        new HtmlWebpackPlugin({
            chunks: ['views/composeTx'],
            filename: 'views/composetx.html',
            template: `${constants.EXPLORER_HTML_SRC}/views/composetx.html`,
            inject: true,
        }),
    ],
});

module.exports = {connect, explorer};
