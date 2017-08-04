import { SRC, DIST, PORT, LIB_NAME } from './constants';
import webpack from 'webpack';
import path from 'path';

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'babel-polyfill',
        'webpack/hot/dev-server',
        //'webpack-hot-middleware/client?quiet=true',
        'webpack-hot-middleware/client',
        SRC + 'index-react.js',
    ],
    output: {
        filename: 'trezor-connect-react.js',
        path: DIST,
        publicPath: '/',
        library: LIB_NAME,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader', 'webpack-module-hot-accept']
            },
        ]
    },
    resolve: {
        modules: [SRC, 'node_modules']
    },
    performance: {
        hints: false
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            PRODUCTION: JSON.stringify(false)
        })
    ]
}
