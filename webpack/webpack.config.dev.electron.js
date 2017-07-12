import { SRC, ELECTRON_SRC, DIST, PORT, LIB_NAME } from './constants';
import webpack from 'webpack';

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        `webpack-hot-middleware/client?path=http://localhost:${PORT}/__webpack_hmr`,
        'babel-polyfill',
        SRC + 'index-browser.js',
        //ELECTRON_SRC + 'app.js'
    ],

    output: {
        filename: 'connect.js',
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
            'process.env.NODE_ENV': JSON.stringify('electron'),
            PRODUCTION: JSON.stringify(false)
        })
    ],

    // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
    target: 'electron-renderer'
};
