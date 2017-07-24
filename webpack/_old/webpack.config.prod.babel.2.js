import { LIB_NAME, SRC, NODE_MODULES, DIST, PORT } from './constants';
import webpack from 'webpack';

module.exports = {
    //devtool: 'source-map',
    entry: {
        //"connect": [ 'babel-polyfill', SRC + 'connect.js' ],
        "connect": [ 'babel-regenerator-runtime', `${SRC}index-browser.js` ],
        //"react-connect": [ SRC + 'react-connect.js' ]
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
                include: [
                    SRC,
                    `${NODE_MODULES}hd-wallet`,
                ],
                exclude: [
                    `${NODE_MODULES}hd-wallet/node_modules/`,
                ],
                use: ['babel-loader']
            }
        ]
    },
    resolve: {
        //modules: ['src']
        modules: ['src', 'node_modules']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            PRODUCTION: JSON.stringify(true)
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            },
            output: {
                comments: false
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })
    ]
}
