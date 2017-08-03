import { SRC, DIST, LIB_NAME, NODE_MODULES } from './constants';
import webpack from 'webpack';

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        //'babel-polyfill',
        'webpack/hot/dev-server',
        //'webpack-hot-middleware/client?quiet=true',
        'webpack-hot-middleware/client'
    ],
    output: {
        filename: 'trezor-connect.js',
        path: DIST,
        publicPath: '/',
        library: LIB_NAME,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader', 'webpack-module-hot-accept']
                // include: [
                //     SRC,
                //     `${NODE_MODULES}hd-wallet`,
                // ],
                // exclude: [
                //     `${NODE_MODULES}hd-wallet/node_modules/`,
                // ],
                // use: ['babel-loader?cacheDirectory=true', 'webpack-module-hot-accept']
            },
            // {
            //     test: /\.wasm$/,
            //     use: ['wasm-loader']
            // }
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
