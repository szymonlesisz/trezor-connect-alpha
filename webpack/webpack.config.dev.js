import { JS_SRC, DIST, LIB_NAME, NODE_MODULES } from './constants';
import webpack from 'webpack';

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'webpack/hot/dev-server',
        'webpack-hot-middleware/client'
    ],
    output: {
        filename: '[name].js',
        path: DIST,
        publicPath: '/',
        library: LIB_NAME,
        //library: [ LIB_NAME, '[name]' ],
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader', 'webpack-module-hot-accept']
            },
        ]
    },
    resolve: {
        modules: [JS_SRC, NODE_MODULES]
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
