import { SRC, DIST, LIB_NAME, NODE_MODULES } from './constants';
import webpack from 'webpack';

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'webpack/hot/dev-server',
        'webpack-hot-middleware/client'
    ],
    output: {
        filename: '[name].js',
        path: '/',
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
                //use: ['babel-loader', 'webpack-module-hot-accept']
                use: ['babel-loader']
            }
        ]
    },
    resolve: {
        modules: [ SRC, NODE_MODULES ]
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
