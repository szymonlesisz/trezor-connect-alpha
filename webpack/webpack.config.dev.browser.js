import { SRC } from './constants';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import baseConfig from './webpack.config.dev';

module.exports = webpackMerge(baseConfig, {
    entry: [
        SRC + 'index-browser.js'
    ]
});
