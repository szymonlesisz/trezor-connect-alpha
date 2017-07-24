import { SRC, NODE_MODULES, DIST, PORT, LIB_NAME } from './constants';
import webpack from 'webpack';

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'babel-polyfill',
        'webpack/hot/dev-server',
        //'webpack-hot-middleware/client?quiet=true',
        'webpack-hot-middleware/client',
        SRC + 'index-browser.js'
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
                include: [
                    SRC,
                    `${NODE_MODULES}hd-wallet`,
                ],
                exclude: [
                    `${NODE_MODULES}hd-wallet/node_modules/`,
                ],
                //use: ['babel-loader?plugins[]=transform-class-properties&plugins[]=transform-object-rest-spread&plugins[]=transform-flow-strip-types', 'webpack-module-hot-accept']
                use: ['babel-loader?cacheDirectory=true', 'webpack-module-hot-accept']
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
