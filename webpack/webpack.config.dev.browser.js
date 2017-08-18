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
        'trezorjs': `${JS_SRC}index.js`,
        'trezorjs-iframe': `${JS_SRC}iframe/iframe.js`,
        'trezorjs-popup': `${JS_SRC}popup/popup.js`
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
            }
        ]
    },
    plugins: [
        extractLess,
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
    ]
});
