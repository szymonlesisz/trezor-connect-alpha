import { LIB_NAME, SRC, JS_SRC, HTML_SRC, STYLE_SRC, DIST, NODE_MODULES } from './constants';
import webpack from 'webpack';

import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const extractLess = new ExtractTextPlugin({
    filename: 'css/[name].[contenthash].css'
});

module.exports = {
    //devtool: 'source-map',
    entry: {
        'trezorjs-plugin': `${JS_SRC}entrypoints/plugin.js`,
        'trezorjs-library': `${JS_SRC}entrypoints/library.js`,
        'iframe': `${JS_SRC}iframe/iframe.js`,
        'popup': `${JS_SRC}popup/popup.js`
    },
    output: {
        filename: 'js/[name].[hash].js',
        path: DIST,
        publicPath: './',
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
                test: /\.(png|gif|jpg|ttf|eot|svg|woff|woff2|wasm)$/,
                loader: 'file-loader',
                query: {
                    name: '[name].[hash].[ext]',
                },
            },
            {
                test: /\.less$/,
                include: STYLE_SRC,
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
        modules: [SRC, NODE_MODULES]
    },
    plugins: [

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

        new CopyWebpackPlugin([
            { from: HTML_SRC + 'css', to: DIST + 'css' },
            //{ from: HTML_SRC + 'example-npm-modal.css' },
            { from: `${HTML_SRC}js`, to: DIST + 'js' },
            //{ from: `${HTML_SRC}example-npm.js` },
            //{ from: `${HTML_SRC}example-npm-modal.js` },
            { from: `${HTML_SRC}config.json` },
        ]),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('umd-lib'),
            PRODUCTION: JSON.stringify(true)
        }),

        //bitcoinjs-lib: NOTE: When uglifying the javascript, you must exclude the following variable names from being mangled: Array, BigInteger, Boolean, ECPair, Function, Number, Point and Script. This is because of the function-name-duck-typing used in typeforce.
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            },
            output: {
                comments: false
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
            debug: false
        })
    ],

    // ignoring "fs" import in fastxpub
    node: {
        fs: "empty"
    }
}
