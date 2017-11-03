import { SRC, HTML_SRC, JS_SRC, DIST, LIB_NAME, NODE_MODULES } from './constants';
import webpack from 'webpack';
import WebpackPreBuildPlugin from 'pre-build-webpack';
import https from 'https';
import fs from 'fs';


module.exports = {
    devtool: 'inline-source-map',
    entry: {
        'modal': `${JS_SRC}examples/modal.js`,
    },
    output: {
        filename: '[name].js',
        path: '/',
        publicPath: '/',
        library: 'T2',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
}
