import { JS_SRC, HTML_SRC } from './constants';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import baseConfig from './webpack.config.dev';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
const extractLess = new ExtractTextPlugin({
    filename: './[name].css'
});

module.exports = webpackMerge(baseConfig, {

    entry: {
        'trezorjs-plugin': `${JS_SRC}entrypoints/plugin.js`,
        'trezorjs-library': `${JS_SRC}entrypoints/library.js`,
        'modal': `${JS_SRC}modal/modal.js`,
        'iframe': `${JS_SRC}iframe/iframe.js`,
        'popup': `${JS_SRC}popup/popup.js`
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: extractLess.extract({
                    use: [
                        { loader: 'css-loader' },
                        { loader: 'less-loader' }
                    ],
                    fallback: 'style-loader'
                })
            },
            {
                // Assets (images, fonts)
                // Reference: https://github.com/webpack/file-loader
                //test: /\.(png|gif|jpg|ttf|eot|svg|woff|woff2|wasm)$/,
                test: /\.(wasm)$/,
                loader: 'file-loader',
                query: {
                    name: 'js/[name].[ext]',
                },
            },
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        extractLess,
        new HtmlWebpackPlugin({
            chunks: ['trezorjs-plugin'],
            filename: 'index.html',
            template: `${HTML_SRC}index.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            chunks: ['trezorjs-library'],
            filename: 'index-lib.html',
            template: `${HTML_SRC}index-lib.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            chunks: ['iframe'],
            filename: `iframe.html`,
            template: `${HTML_SRC}iframe.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            chunks: ['popup'],
            filename: 'popup.html',
            template: `${HTML_SRC}popup.html`,
            inject: true
        }),
    ],

    // ignoring "fs" import in fastxpub
    node: {
        fs: "empty"
    }
});
