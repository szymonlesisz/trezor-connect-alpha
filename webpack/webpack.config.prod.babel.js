import { LIB_NAME, SRC, DIST } from './constants';
import webpack from 'webpack';

module.exports = {
    //devtool: 'source-map',
    entry: {
        //"connect": [ 'babel-polyfill', SRC + 'connect.js' ],
        'trezor-connect': `${SRC}index-browser.js`,
        'trezor-connect-lite': `${SRC}index-browser-lite.js`,
        //'trezor-connect-node': `${SRC}index-node.js`,
    },
    output: {
        filename: '[name].js',
        path: DIST,
        publicPath: '/',
        // see http://krasimirtsonev.com/blog/article/javascript-library-starter-using-webpack-es6
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
                test: /\.wasm$/,
                use: ['wasm-loader']
            }
        ]
    },
    resolve: {
        modules: ['src', 'node_modules']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('umd-lib'),
            PRODUCTION: JSON.stringify(true)
        }),
        // bitcoinjs-lib: NOTE: When uglifying the javascript, you must exclude the following variable names from being mangled: Array, BigInteger, Boolean, ECPair, Function, Number, Point and Script. This is because of the function-name-duck-typing used in typeforce.
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
    ]
}
